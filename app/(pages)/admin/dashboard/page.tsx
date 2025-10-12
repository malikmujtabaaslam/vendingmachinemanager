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
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import UsersTable from "../../components/UsersTable";

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((res) => res.json());

// --- Helper: relative time ---
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
  PENDING: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
  RUNNING: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  FAILED: "text-red-500 bg-red-100 dark:bg-red-900/30",
  DONE: "text-green-500 bg-green-100 dark:bg-green-900/30",
};

export default function AdminDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useSWR("/api/jobs", fetcher);
  const { data: agents, isLoading: agentsLoading } = useSWR(
    "/api/machines/unassigned",
    fetcher
  );

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
        const statusMatch =
          jobStatusFilter === "ALL" || job.status === jobStatusFilter;
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
      online:
        (now - new Date(agent.updatedAt).getTime()) / 1000 < ONLINE_INTERVAL,
    }));
  }, [agents]);

  // --- TABLE COLUMNS ---
  const jobsColumns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "user.email", header: "User" },
      { accessorKey: "agent.hostname", header: "Agent" },
      {
        accessorKey: "script.filename",
        header: "Script",
        cell: (info) => (
          <code className="font-mono text-blue-600 dark:text-blue-400">
            {(info.getValue() as string)?.replace(/\.[^/.]+$/, "")}
          </code>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-md ${
                statusColors[status] || "text-gray-700 bg-gray-200 dark:bg-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info) => formatTime(info.getValue() as string | null),
      },
      {
        accessorKey: "completedAt",
        header: "Completed",
        cell: (info) => formatTime(info.getValue() as string | null),
      },
    ],
    []
  );

  const agentsColumns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "hostname", header: "Hostname" },
      {
        accessorKey: "createdAt",
        header: "Registered",
        cell: (info) => formatTime(info.getValue() as string | null),
      },
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
    ],
    []
  );

  const jobsTable = useReactTable({
    data: jobsData,
    columns: jobsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const agentsTable = useReactTable({
    data: unassignedAgents,
    columns: agentsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#5750F1",
          mb: 2,
        }}
      >
        Admin Dashboard
      </Typography>

      {/* JOBS + MACHINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs Table */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#0d1725] border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl">
          <CardHeader title="All Jobs" />
          <CardContent>
            <Box className="flex gap-3 mb-4">
              <TextField
                placeholder="Search Machine/Script"
                size="small"
                fullWidth
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                }}
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
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                    {jobsTable.getHeaderGroups().map((group) => (
                      <tr key={group.id}>
                        {group.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-2 font-semibold border-b border-gray-100 dark:border-gray-800"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {jobsTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={jobsColumns.length}
                          className="text-center py-6 text-gray-400"
                        >
                          No jobs found
                        </td>
                      </tr>
                    ) : (
                      jobsTable.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 py-2 border-b border-gray-100 dark:border-gray-800"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
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
        <Card className="bg-white dark:bg-[#0d1725] border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl">
          <CardHeader title="Unassigned Machines" />
          <CardContent>
            {agentsLoading ? (
              <div className="flex justify-center py-6">
                <CircularProgress />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                    {agentsTable.getHeaderGroups().map((group) => (
                      <tr key={group.id}>
                        {group.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-2 font-semibold border-b border-gray-100 dark:border-gray-800"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {agentsTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={agentsColumns.length}
                          className="text-center py-6 text-gray-400"
                        >
                          No unassigned machines
                        </td>
                      </tr>
                    ) : (
                      agentsTable.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 py-2 border-b border-gray-100 dark:border-gray-800"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
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

      {/* USERS TABLE */}
      <Card className="bg-white dark:bg-[#0d1725] border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl">
        <CardHeader title="Users" />
        <CardContent>
          <UsersTable editable={false} />
        </CardContent>
      </Card>
    </div>
  );
}
