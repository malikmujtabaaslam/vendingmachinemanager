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
  Chip,
} from "@mui/material";
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import UsersTable from "../../components/UsersTable";

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((res) => res.json());

// Format relative time
function formatTime(timestamp: string | null) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);

  if (seconds < 60) return `${seconds} sec ago`;
  if (minutes < 60) return `${minutes} min ${seconds % 60} sec ago`;
  if (hours < 24)
    return `${hours} hr ${minutes % 60} min ${seconds % 60} sec ago`;
  return date.toLocaleString();
}

const statusColors: Record<string, string> = {
  PENDING: "#ff9800",
  RUNNING: "#2196f3",
  FAILED: "#f44336",
  DONE: "#4caf50",
};

export default function AdminDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useSWR("/api/jobs", fetcher);
  const { data: agents, isLoading: agentsLoading } = useSWR("/api/machines/unassigned", fetcher);

  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("ALL");

  // Prepare jobs data with status
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

  // Prepare unassigned agents
  const unassignedAgents = useMemo(() => {
    if (!agents?.agents) return [];
    const ONLINE_INTERVAL = parseInt(process.env.ONLINE_INTERVAL || "10");
    const now = new Date().getTime();
    return agents.agents.map((agent: any) => ({
      ...agent,
      online: (now - new Date(agent.updatedAt).getTime()) / 1000 < ONLINE_INTERVAL,
    }));
  }, [agents]);

  // Define columns for Jobs
  const jobsColumns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "user.email", header: "User" },
      { accessorKey: "agent.hostname", header: "Agent" },
      {
        accessorKey: "script.filename",
        header: "Script",
        cell: (info) => {
          const filename = info.getValue() as string | undefined;
          return <code>{filename?.replace(/\.[^/.]+$/, "")}</code>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string; // cast to string
          return (
            <Typography
              sx={{
                fontWeight: 700,
                color: statusColors[status] || "black", // fallback color
                fontSize: "0.85rem",
              }}
            >
              {status}
            </Typography>
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

  const jobsTable = useReactTable({
    data: jobsData,
    columns: jobsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Columns for Unassigned Machines
  const agentsColumns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "hostname", header: "Hostname" },
      { accessorKey: "createdAt", header: "Registered At",  cell: (info) => formatTime(info.getValue() as string | null)  },
      {
        accessorKey: "online",
        header: "Status",
        cell: (info) => (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: info.getValue() ? "green" : "red",
              }}
            ></span>
            {info.getValue() ? "Online" : "Offline"}
          </span>
        ),
      },
    ],
    []
  );

  const agentsTable = useReactTable({
    data: unassignedAgents,
    columns: agentsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "primary.main", textTransform: "uppercase" }}>
        Admin Dashboard
      </Typography>

      {/* Jobs + Unassigned Machines */}
      <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
        {/* Jobs Table 70% */}
        <Card sx={{ flex: 7, borderRadius: 3, boxShadow: 4 }}>
          <CardHeader title="All Jobs" titleTypographyProps={{ variant: "h6" }} />
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                placeholder="Search Machine/Script"
                size="small"
                sx={{ flex: 1 }}
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
              <Box sx={{ textAlign: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    {jobsTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {jobsTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={jobsColumns.length}>No jobs found.</td>
                      </tr>
                    ) : (
                      jobsTable.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <button onClick={() => jobsTable.previousPage()} disabled={!jobsTable.getCanPreviousPage()}>
                    Previous
                  </button>
                  <span>
                    Page {jobsTable.getState().pagination.pageIndex + 1} of {jobsTable.getPageCount()}
                  </span>
                  <button onClick={() => jobsTable.nextPage()} disabled={!jobsTable.getCanNextPage()}>
                    Next
                  </button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Unassigned Machines Table 30% */}
        <Card sx={{ flex: 3, borderRadius: 3, boxShadow: 4 }}>
          <CardHeader title="Unassigned Machines" titleTypographyProps={{ variant: "h6" }} />
          <CardContent>
            {agentsLoading ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    {agentsTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {agentsTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={agentsColumns.length}>No unassigned machines found.</td>
                      </tr>
                    ) : (
                      agentsTable.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <button onClick={() => agentsTable.previousPage()} disabled={!agentsTable.getCanPreviousPage()}>
                    Previous
                  </button>
                  <span>
                    Page {agentsTable.getState().pagination.pageIndex + 1} of {agentsTable.getPageCount()}
                  </span>
                  <button onClick={() => agentsTable.nextPage()} disabled={!agentsTable.getCanNextPage()}>
                    Next
                  </button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Users Table Full Width */}
      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        <CardHeader title="Users" titleTypographyProps={{ variant: "h5" }} />
        <CardContent>
          <UsersTable editable={false} />
        </CardContent>
      </Card>
    </Box>
  );
}
