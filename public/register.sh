#!/usr/bin/env bash
set -euo pipefail

USER_HOME="$HOME"
CURRENT_USER="$(id -un)"
AGENT_DIR="$USER_HOME/.remote-runner-agent"
LOG_DIR="$AGENT_DIR/logs"
CONFIG_FILE="$AGENT_DIR/config.json"
AGENT_PY="$AGENT_DIR/agent.py"
SERVICE_DIR="$HOME/.config/systemd/user"
SERVICE_FILE="$SERVICE_DIR/remote-runner-agent.service"

CONTROLLER_DEFAULT="https://vendingmachinemanager-hl4m-g85v35ibj-mujtaba-aslams-projects.vercel.app/"  # <-- your Next.js API

echo "Installing Remote Runner Agent for user: $CURRENT_USER"
mkdir -p "$AGENT_DIR" "$LOG_DIR" "$SERVICE_DIR"

if ! command -v python3 &>/dev/null; then
    echo "Python3 not found. Installing..."
    sudo apt install -y python3
else
    echo "Python3 is already installed: $(python3 --version)"
fi

if ! command -v pip3 &>/dev/null; then
    echo "pip3 not found. Installing..."
    sudo apt install -y python3-pip
else
    echo "pip3 is already installed: $(pip3 --version)"
fi

echo "Checking Python 'requests' library..."
if python3 -c "import requests" &>/dev/null; then
    echo "Python 'requests' is already installed."
else
    echo "'requests' not found, trying to install via pip3..."
    if command -v pip3 &>/dev/null; then
        pip3 install --user requests && echo "Installed 'requests' via pip3." || {
            echo "Failed to install via pip3, trying apt..."
            sudo apt install -y python3-requests >/dev/null 2>&1 || true
        }
    else
        echo "pip3 not found, installing via apt..."
        sudo apt install -y python3-requests >/dev/null 2>&1 || true
    fi

    # final check
    if python3 -c "import requests" &>/dev/null; then
        echo "'requests' installed successfully."
    else
        echo "⚠️ Could not install 'requests'. Please install manually."
    fi
fi

cat > "$CONFIG_FILE" <<EOF
{
  "controller_url": "$CONTROLLER_DEFAULT",
  "agent_id": null,
  "token": null,
  "scripts_dir": "/home/$CURRENT_USER",
  "sync_interval": 5,
  "exec_timeout_seconds": 300,
  "max_output_bytes": 20000
}
EOF

cat > "$AGENT_PY" <<'PY'
#!/usr/bin/env python3
import json, os, time, socket, uuid, subprocess, requests
from datetime import datetime
from pathlib import Path

CONFIG_PATH = os.path.expanduser("~/.remote-runner-agent/config.json")
LOG_PATH = os.path.expanduser("~/.remote-runner-agent/logs/agent.log")

def log(msg):
    ts = datetime.utcnow().isoformat() + "Z"
    line = f"{ts} {msg}"
    print(line, flush=True)
    try:
        with open(LOG_PATH, "a") as f:
            f.write(line + "\n")
    except:
        pass

def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def save_config(cfg):
    with open(CONFIG_PATH, "w") as f:
        json.dump(cfg, f, indent=2)

def list_scripts(scripts_dir):
    try:
        p = Path(scripts_dir)
        if not p.exists(): return []
        return sorted([f.name for f in p.iterdir() if f.is_file() and f.suffix == ".sh"])
    except Exception as e:
        log(f"Error listing scripts: {e}")
        return []

def script_allowed(script_name, scripts_dir):
    if not script_name.endswith(".sh"):
        script_name += ".sh"
    script_path = os.path.realpath(os.path.join(scripts_dir, script_name))
    scripts_dir_real = os.path.realpath(scripts_dir)
    return script_path.startswith(scripts_dir_real + os.sep) and os.path.exists(script_path)

def run_script(cfg, script_name):
    scripts_dir = cfg.get("scripts_dir")
    if not script_allowed(script_name, scripts_dir):
        return {"ok": False, "error": "script_not_allowed", "exit_code": -1, "stdout": "", "stderr": ""}
    script_path = os.path.realpath(os.path.join(scripts_dir, script_name))
    timeout = cfg.get("exec_timeout_seconds", 300)
    max_bytes = cfg.get("max_output_bytes", 20000)

    try:
        proc = subprocess.Popen(
            ["/bin/bash", script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        try:
            stdout, stderr = proc.communicate(timeout=timeout)
            rc = proc.returncode
        except subprocess.TimeoutExpired:
            proc.kill()
            stdout, stderr = proc.communicate()
            rc = -1
            stderr = b"Timeout"
        stdout = (stdout or b"")[:max_bytes].decode(errors="replace")
        stderr = (stderr or b"")[:max_bytes].decode(errors="replace")
        return {"ok": True, "exit_code": rc, "stdout": stdout, "stderr": stderr}
    except Exception as e:
        return {"ok": False, "error": str(e), "exit_code": -1, "stdout": "", "stderr": ""}

def register(cfg):
    url = cfg["controller_url"].rstrip("/") + "/api/register"
    payload = {
        "hostname": socket.gethostname(),
        "username": os.getlogin(),
        "client_uuid": cfg.get("client_uuid") or str(uuid.uuid4())
    }
    try:
        r = requests.post(url, json=payload, timeout=10)
        r.raise_for_status()
        data = r.json()
        cfg["agent_id"] = data["agent_id"]
        cfg["token"] = data["token"]
        if not cfg.get("client_uuid"):
            cfg["client_uuid"] = payload["client_uuid"]
        save_config(cfg)
        log(f"Registered: agent_id={cfg['agent_id']}")
    except Exception as e:
        log(f"Registration failed: {e}")
        time.sleep(10)

def sync(cfg):
    url = cfg["controller_url"].rstrip("/") + "/api/sync"
    headers = {"Authorization": f"Bearer {cfg['token']}"}
    payload = {
        "agent_id": cfg["agent_id"],
        "scripts": list_scripts(cfg["scripts_dir"]),
        "timestamp": datetime.utcnow().isoformat()+"Z"
    }
    r = requests.post(url, json=payload, headers=headers, timeout=15)
    r.raise_for_status()
    return r.json()

def post_job_result(cfg, jobid, result):
    url = cfg["controller_url"].rstrip("/") + "/api/jobresult"
    headers = {"Authorization": f"Bearer {cfg['token']}"}
    payload = {"agent_id": cfg["agent_id"], "jobid": jobid}
    payload.update(result)
    requests.post(url, json=payload, headers=headers, timeout=15)

def main():
    cfg = load_config()
    if not cfg.get("token"):
        register(cfg)
        if not cfg.get("token"):
            return  # retry later

    while True:
        try:
            resp = sync(cfg)
            jobs = resp.get("jobs", [])
            for job in jobs:
                jid, script = job.get("id"), job.get("script")['filename']
                log(f"Running job {jid}: {script}")
                result = run_script(cfg, script)
                post_job_result(cfg, jid, result)
                log(f"Job {jid} finished, exit={result.get('exit_code')}")
        except Exception as e:
            log(f"sync error: {e}")
        time.sleep(cfg.get("sync_interval", 30))

if __name__ == "__main__":
    Path(os.path.dirname(LOG_PATH)).mkdir(parents=True, exist_ok=True)
    while True:
        try:
            main()
        except Exception as e:
            log(f"Fatal error: {e}")
            time.sleep(10)
PY

chmod +x "$AGENT_PY"

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Remote Runner Agent (HTTP polling)
After=network.target

[Service]
Type=simple
ExecStart=$AGENT_PY
Restart=always
RestartSec=5
Environment=PATH=%h/.local/bin:/usr/bin:/bin

[Install]
WantedBy=default.target
EOF

chmod 644 "$SERVICE_FILE"
systemctl --user daemon-reload
systemctl --user enable --now remote-runner-agent.service

echo "✅ Installation completed."
echo "Config file: $CONFIG_FILE"
echo "Log file: $LOG_DIR/agent.log"
