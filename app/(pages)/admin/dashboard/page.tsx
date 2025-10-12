"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import UsersTable from "../../components/UsersTable";

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((res) => res.json());

// Helper: relative time
function formatTime(timestamp: string | null) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ${seconds % 60}s ago`;
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  return date.toLocaleString();
}

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b", // amber
  RUNNING: "#3b82f6", // blue
  FAILED: "#ef4444", // red
  DONE: "#22c55e", // green
};

export default function AdminDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useSWR("/api/jobs", fetcher);
  const { data: agents, isLoading: agentsLoading } = useSWR("/api/machines/unassigned", fetcher);

  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("ALL");

  // --- JOBS DATA ---
  const jobsData = useMemo(() => {
    if (!jobs) return [];
    return jobs
      .map((job: any) => {
        let status = "DONE";
        if (job.pending) status = "PENDING";
        else if (!job.pending && !job.completedAt) status = "RUNNING";
        else if (job.completedAt && job.stderr) status = "FAILED";
        return { ...job, status };
      })
      .filter((job: any) => {
        const searchMatch =
          job.agent?.hostname?.toLowerCase().includes(jobSearch.toLowerCase()) ||
          job.script?.filename?.toLowerCase().includes(jobSearch.toLowerCase());
        const statusMatch = jobStatusFilter === "ALL" || job.status === jobStatusFilter;
        return searchMatch && statusMatch;
      });
  }, [jobs, jobSearch, jobStatusFilter]);

  // --- UNASSIGNED AGENTS ---
  const unassignedAgents = useMemo(() => {
    if (!agents?.agents) return [];
    const ONLINE_INTERVAL = parseInt(process.env.ONLINE_INTERVAL || "10");
    const now = Date.now();
    return agents.agents.map((agent: any) => ({
      ...agent,
      online: (now - new Date(agent.updatedAt).getTime()) / 1000 < ONLINE_INTERVAL,
    }));
  }, [agents]);

  // --- TABLE COLUMNS ---
  const jobsColumns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "user.email", header: "User" },
    { accessorKey: "agent.hostname", header: "Agent" },
    {
      accessorKey: "script.filename",
      header: "Script",
      cell: (info) => <code>{(info.getValue() as string)?.replace(/\.[^/.]+$/, "")}</code>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <Typography
            sx={{
              fontWeight: 700,
              color: statusColors[status] || "black",
              fontSize: "0.85rem",
            }}
          >
            {status}
          </Typography>
        );
      },
    },
    { accessorKey: "createdAt", header: "Created", cell: (info) => formatTime(info.getValue() as string | null) },
    { accessorKey: "completedAt", header: "Completed", cell: (info) => formatTime(info.getValue() as string | null) },
  ], []);

  const agentsColumns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "hostname", header: "Hostname" },
    { accessorKey: "createdAt", header: "Registered", cell: (info) => formatTime(info.getValue() as string | null) },
    {
      accessorKey: "online",
      header: "Status",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              info.getValue() ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {info.getValue() ? "Online" : "Offline"}
        </div>
      ),
    },
  ], []);

  const jobsTable = useReactTable({ data: jobsData, columns: jobsColumns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel() });
  const agentsTable = useReactTable({ data: unassignedAgents, columns: agentsColumns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel() });

  return (
    <div className="space-y-6">
      {/* --- JOBS + UNASSIGNED --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs (2/3 width) */}
        <Card className="lg:col-span-2 shadow-md rounded-xl border border-gray-200">
          <CardHeader title="All Jobs" titleTypographyProps={{ variant: "h6" }} />
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                placeholder="Search Machine/Script"
                size="small"
                fullWidth
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
              />
              <Select
                size="small"
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="RUNNING">Running</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="DONE">Done</MenuItem>
              </Select>
            </Box>

            {jobsLoading ? (
              <div className="flex justify-center py-6">
                <CircularProgress />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700">
                    {jobsTable.getHeaderGroups().map((group) => (
                      <tr key={group.id}>
                        {group.headers.map((header) => (
                          <th key={header.id} className="px-3 py-2 font-medium border-b border-gray-200">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {jobsTable.getRowModel().rows.length === 0 ? (
                      <tr><td colSpan={jobsColumns.length} className="text-center py-4 text-gray-500">No jobs found.</td></tr>
                    ) : (
                      jobsTable.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 py-2 border-b border-gray-100">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unassigned Machines */}
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardHeader title="Unassigned Machines" titleTypographyProps={{ variant: "h6" }} />
          <CardContent>
            {agentsLoading ? (
              <div className="flex justify-center py-6">
                <CircularProgress />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700">
                    {agentsTable.getHeaderGroups().map((group) => (
                      <tr key={group.id}>
                        {group.headers.map((header) => (
                          <th key={header.id} className="px-3 py-2 font-medium border-b border-gray-200">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {agentsTable.getRowModel().rows.length === 0 ? (
                      <tr><td colSpan={agentsColumns.length} className="text-center py-4 text-gray-500">No unassigned machines.</td></tr>
                    ) : (
                      agentsTable.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 py-2 border-b border-gray-100">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- USERS TABLE --- */}
      <Card className="shadow-md rounded-xl border border-gray-200">
        <CardHeader title="Users" titleTypographyProps={{ variant: "h6" }} />
        <CardContent>
          <UsersTable editable={false} />
        </CardContent>
      </Card>
    </div>
  );
}
