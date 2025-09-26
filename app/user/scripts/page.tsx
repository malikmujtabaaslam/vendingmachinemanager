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
} from "@mui/material";
import JobsTable from "@/app/components/JobsTable";

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
          </CardContent>
        </form>
      </Card>

      {/* Jobs Table */}
      <JobsTable jobs={jobsData || []} />
    </Box>
  );
}
