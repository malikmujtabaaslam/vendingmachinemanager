"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Button,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TerminalIcon from "@mui/icons-material/Terminal";
import Image from "next/image";
import JobsTable from "@/app/(pages)/components/JobsTable";

const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function RunScript() {
  const { data, error } = useSWR("/api/machines", fetcher, { refreshInterval: 5000 });
  const { data: jobs, mutate: mutateJobs } = useSWR("/api/jobs", fetcher, { refreshInterval: 5000 });

  const machines = data?.machines || [];
  const jobsData = jobs || [];

  const [machine, setMachine] = useState<string | null>(null);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (machines.length) {
      const firstMachine = machines[0];
      setMachine(firstMachine.id);
      if (firstMachine.scripts?.length) setScriptId(firstMachine.scripts[0].id);
    }
  }, [machines]);

  const availableScripts = machines.find((m: any) => m.id === machine)?.scripts || [];

  async function submitJob() {
    if (!machine || !scriptId) return;
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scriptId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Script scheduled successfully!");
        mutateJobs();
      } else {
        setMessage(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error scheduling script");
    } finally {
      setTimeout(() => setMessage(""), 4000);
    }
  }

  if (error) return <div>Error loading machines</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#5750F1",
          textTransform: "uppercase",
          mb: 2,
        }}
      >
        Vending Machines
      </Typography>

      {/* Grid layout: Left (Form) | Right (Jobs Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run Script Form */}
        <div className="lg:col-span-1">
          <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Run Script
              </h2>
              <IconButton
                color="info"
                onClick={() => setHelpOpen(true)}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </div>

            {message && (
              <Alert
                severity={message.startsWith("✅") ? "success" : "error"}
                className="mb-3"
              >
                {message}
              </Alert>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmOpen(true);
              }}
              className="flex flex-col gap-4"
            >
              <Autocomplete
                options={machines}
                getOptionLabel={(m: any) => m.hostname || m.id}
                value={machines.find((m: any) => m.id === machine) || null}
                onChange={(_, newValue) => {
                  setMachine(newValue ? newValue.id : null);
                  setScriptId(
                    newValue?.scripts?.length ? newValue.scripts[0].id : null
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Machine"
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                )}
              />

              <Autocomplete
                options={availableScripts}
                getOptionLabel={(s: any) => s.name || ""}
                value={availableScripts.find((s: any) => s.id === scriptId) || null}
                onChange={(_, newValue) =>
                  setScriptId(newValue ? newValue.id : null)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Script"
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                )}
                disabled={!machine}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: "10px",
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#5750F1",
                  "&:hover": { bgcolor: "#4a43d4" },
                }}
              >
                Run Script
              </Button>
            </form>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="lg:col-span-2">
          <JobsTable jobs={jobsData} />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1.5, bgcolor: "background.paper" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Script Run</DialogTitle>
        <DialogContent>
          <Typography>
            Run <b>{availableScripts.find((s) => s.id === scriptId)?.name}</b> on{" "}
            <b>{machines.find((m) => m.id === machine)?.hostname}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              submitJob();
            }}
            variant="contained"
            sx={{ bgcolor: "#5750F1", "&:hover": { bgcolor: "#4a43d4" } }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1.5, bgcolor: "background.paper" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, display: "flex", gap: 1, alignItems: "center" }}>
          <TerminalIcon color="action" /> How to Run Scripts
        </DialogTitle>
        <DialogContent dividers>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
              <p>Follow these steps to execute scripts securely:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select your <b>machine</b> from the dropdown.</li>
                <li>Choose the desired <b>script</b>.</li>
                <li>Click <b>Run Script</b> to schedule execution.</li>
                <li>Status will appear under <b>Recent Jobs</b>.</li>
              </ul>
            </div>
            <div className="flex-1 text-center">
              <Image
                src="/run-script.png"
                alt="Run Script Example"
                width={800}
                height={300}
                className="rounded-lg border border-gray-300 shadow-sm mx-auto"
              />
              <Typography variant="caption" color="text.secondary">
                Example of script execution workflow
              </Typography>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setHelpOpen(false)}
            variant="contained"
            sx={{
              borderRadius: "10px",
              bgcolor: "#5750F1",
              "&:hover": { bgcolor: "#4a43d4" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
