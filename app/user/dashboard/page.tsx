"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Box,
} from "@mui/material";
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
    <Box sx={{ mx: 4, mt: 3 }}>
      <JobsTable jobs={jobsData} />
    </Box>
  );
}
