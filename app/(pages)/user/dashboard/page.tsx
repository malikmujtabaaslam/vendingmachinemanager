"use client";
import { useEffect } from "react";
import useSWR from "swr";
import JobsTable from "../../components/JobsTable";
import { Typography } from "@mui/material";

export default function UserDashboard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

  const { data: jobs, error } = useSWR("/api/jobs", fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (error) console.error("Job fetch error:", error);
  }, [error]);

  const jobsData = jobs || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">           
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#5750F1",
          mb: 2,
        }}
      >
        User Dashboard
      </Typography>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here are your recent jobs.
        </span>
      </div>

      {/* Jobs Table Section */}
      <JobsTable jobs={jobsData} />
    </div>
  );
}
