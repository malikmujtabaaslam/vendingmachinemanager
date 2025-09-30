"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Grid,
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
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import JobsTable from "@/app/components/JobsTable";
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


export default function UserDashboard() {
  const { data, error, mutate } = useSWR("/api/machines", fetcher, {
    refreshInterval: 5000, // auto-refresh every 5s
  });
  
  const { data: jobs, error: jobsError, mutate: mutateJobs } = useSWR(
    "/api/jobs",
    fetcher,
    {
      refreshInterval: 5000, // ✅ auto-refresh jobs every 5s
    }
  );

  const jobsData = jobs || [];

  const user = data?.user;
  const [machine, setMachine] = useState<string | null>(null);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false); // 👈 state added

  // Set defaults when machines are loaded
  useEffect(() => {
    if (user?.machines?.length) {
      const firstMachine = user.machines[0];
      setMachine(firstMachine.id);

      if (firstMachine.scripts?.length) {
        setScriptId(firstMachine.scripts[0].id);
      }
    }
  }, [user]);

  // Get scripts for selected machine
  const availableScripts =
    user?.machines?.find((m: any) => m.id === machine)?.scripts || [];

  async function submitJob(e: React.FormEvent) {
    e.preventDefault();
    if (!machine || !scriptId) return;

    await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ agentId: machine, scriptId }), // ✅ send scriptId
    });

    mutate(); // refresh jobs/machines after submit
  }

  if (error) return <div>Error loading machines</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Box sx={{ mx: 4, mt: 3 }}>
{/* Run Script Form */}
<Card sx={{ borderRadius: 3, boxShadow: 4, mb: 4 }}>
  <CardHeader title="Run Script" titleTypographyProps={{ variant: "h5" }} />
  <form onSubmit={submitJob}>
    <CardContent
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "nowrap",
      }}
    >
      {/* Machine selector */}
      <Autocomplete
        sx={{ flex: 1 }}
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

      {/* Script selector */}
      <Autocomplete
        sx={{ flex: 1 }}
        options={availableScripts}
        getOptionLabel={(s: any) => s.filename}
        value={availableScripts.find((s: any) => s.id === scriptId) || null}
        onChange={(_, newValue) => setScriptId(newValue ? newValue.id : null)}
        renderInput={(params) => (
          <TextField {...params} label="Select Script" size="small" fullWidth />
        )}
        disabled={!machine}
      />

      {/* Run button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ flex: 0.5, borderRadius: 2, height: "40px" }}
      >
        Run
      </Button>

      {/* Help button */}
      <IconButton
        color="info"
        onClick={() => setHelpOpen(true)}
        sx={{ border: "1px solid #ccc", borderRadius: 2 }}
      >
        <HelpOutlineIcon />
      </IconButton>
    </CardContent>
  </form>
</Card>

{/* Documentation Dialog */}
<Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>User Guide: Running Scripts</DialogTitle>
  <DialogContent dividers>
    <Grid container spacing={2} alignItems="flex-start">
      {/* Left side: instructions */}
      <Grid item xs={12} md={12}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Follow these steps to run a script:
        </Typography>
        <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "#555", lineHeight: 1.7 }}>
          <li>In the <b>Run Scripts</b> panel:
            <ul>
              <li>1: Select your <b>machine</b> from the first dropdown.</li>
              <li>2: Choose a <b>script</b> from the second dropdown.</li>
              <li>3: Click <b>Run</b> to submit the job.</li>
              <li>4: Your request will show as <b>Pending</b> in the table below.</li>
              <li>5: If the machine is online, it will execute the script. The <b>Output</b> column shows the result.</li>
            </ul>
          </li>
        </ol>
      </Grid>

      {/* Right side: screenshot */}
      <Grid item xs={12} md={12}>
        <Box sx={{ textAlign: "center" }}>
          <Image
            src="/run-script.png"
            alt="Run Scripts panel screenshot"
            width={808}
            height={300}
            style={{
              borderRadius: "8px",
              border: "1px solid #ddd",
              maxWidth: "100%",
              height: "auto",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Example of the "Run Scripts" panel
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setHelpOpen(false)} variant="contained" color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>

      {/* Jobs Table */}
      <JobsTable jobs={jobsData || []} />
    </Box>
  );
}
