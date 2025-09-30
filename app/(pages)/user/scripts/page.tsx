"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
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
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TerminalIcon from "@mui/icons-material/Terminal";
import JobsTable from "@/app/(pages)/components/JobsTable";
import Image from "next/image";

const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function RunScript() {
  const { data, error, mutate } = useSWR("/api/machines", fetcher, {
    refreshInterval: 5000,
  });

  const { data: jobs, mutate: mutateJobs } = useSWR("/api/jobs", fetcher, {
    refreshInterval: 5000,
  });

  const user = data?.user;
  const jobsData = jobs || [];

  const [machine, setMachine] = useState<string | null>(null);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Set default machine and script
  useEffect(() => {
    if (user?.machines?.length) {
      const firstMachine = user.machines[0];
      setMachine(firstMachine.id);
      if (firstMachine.scripts?.length) setScriptId(firstMachine.scripts[0].id);
    }
  }, [user]);

  const availableScripts =
    user?.machines?.find((m: any) => m.id === machine)?.scripts || [];

  async function submitJob(e: React.FormEvent) {
    e.preventDefault();
    if (!machine || !scriptId) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId: machine, scriptId }),
      });

      if (res.ok) {
        setMessage("✅ Script scheduled for run successfully!");
        mutateJobs(); // refresh jobs table
        setTimeout(() => setMessage(""), 5000);
      } else {
        const data = await res.json();
        setMessage(`❌ Failed to schedule script: ${data.error || "Unknown error"}`);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error scheduling script");
      setTimeout(() => setMessage(""), 5000);
    }
  }

  if (error) return <div>Error loading machines</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Box sx={{ mx: 4, mt: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 700, color: "primary.main", textTransform: "uppercase" }}
      >
        Vending Machines
      </Typography>

      {/* Horizontal layout: Form (30%) | Jobs Table (70%) */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Left: Run Script Form */}
        <Box sx={{ flex: "0 0 30%" }}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardHeader
              title="Run Script"
              titleTypographyProps={{ variant: "h6" }}
              action={
                <IconButton
                  color="info"
                  onClick={() => setHelpOpen(true)}
                  sx={{ border: "1px solid #ccc", borderRadius: 2 }}
                >
                  <HelpOutlineIcon />
                </IconButton>
              }
            />
            <CardContent>
              {message && (
                <Alert
                  severity={message.startsWith("✅") ? "success" : "error"}
                  sx={{ mb: 2 }}
                >
                  {message}
                </Alert>
              )}
              <form onSubmit={submitJob}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Autocomplete
                    options={user?.machines || []}
                    getOptionLabel={(m: any) => m.hostname || m.id}
                    value={user?.machines?.find((m: any) => m.id === machine) || null}
                    onChange={(_, newValue) => {
                      setMachine(newValue ? newValue.id : null);
                      setScriptId(
                        newValue?.scripts?.length ? newValue.scripts[0].id : null
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Machine" size="small" fullWidth />
                    )}
                  />
                  <Autocomplete
                    options={availableScripts}
                    getOptionLabel={(s: any) => s.filename}
                    value={availableScripts.find((s: any) => s.id === scriptId) || null}
                    onChange={(_, newValue) => setScriptId(newValue ? newValue.id : null)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Script" size="small" fullWidth />
                    )}
                    disabled={!machine}
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    Run
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

        </Box>

        {/* Right: Jobs Table */}
        <Box sx={{ flex: "0 0 70%" }}>
          <JobsTable jobs={jobsData} />
        </Box>
      </Box>

      {/* Documentation Dialog */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          <TerminalIcon color="action" /> User Guide: Running Scripts
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Follow these simple steps to run a script on your assigned machine:
              </Typography>
              <ul>
                <li>Select your <b>machine</b> from the first dropdown.</li>
                <li>Choose a <b>script</b> from the second dropdown.</li>
                <li>Click the <b>Run</b> button to submit the job.</li>
                <li>Your request will appear as <b>Pending</b> in the table.</li>
                <li>The <b>Output</b> column shows if it succeeded or failed.</li>
              </ul>
            </Box>
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Image
                src="/run-script.png"
                alt="Run Scripts panel screenshot"
                width={800}
                height={300}
                style={{ borderRadius: "8px", border: "1px solid #ddd", maxWidth: "100%" }}
              />
              <Typography variant="caption" color="text.secondary">
                Example of the "Run Scripts" panel
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
