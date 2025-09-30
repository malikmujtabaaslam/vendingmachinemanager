"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Box,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import JobsTable from "../../components/JobsTable";



export default function UserDashboard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

  const { data: jobs, error: jobsError, mutate: mutateJobs } = useSWR(
    "/api/jobs",
    fetcher,
    {
      refreshInterval: 5000, // ✅ auto-refresh jobs every 5s
    }
  );

  const jobsData = jobs || [];

  return (
    <>
      <Box sx={{ mx: 4, mt: 3 }}> 
        <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: "primary.main",
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif", // or use Google Font
          textTransform: "uppercase",
        }}
      >
        User Dashboard
      </Typography>
        <JobsTable jobs={jobsData} />
      </Box>
    </>
  );
}
