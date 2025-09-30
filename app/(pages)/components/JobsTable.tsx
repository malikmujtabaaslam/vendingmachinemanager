"use client";
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Box, Card, CardHeader, CardContent, TextField, Select, MenuItem, Typography } from "@mui/material";

interface Job {
  id: number;
  pending: boolean;
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  createdAt: string;
  completedAt: string | null;
  agent: { id: string; hostname: string };
  script: { id: string; filename: string };
}

interface JobsTableProps {
  jobs: Job[];
}

// Helper to format human-friendly time
function formatTime(timestamp: string | null) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime(); // milliseconds
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(seconds / (3600 * 24));

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return date.toLocaleString(); // show full date and time
}

export default function JobsTable({ jobs }: JobsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const data = useMemo(() => {
    return jobs.map((job) => {
      let status = "DONE";
      if (job.pending) status = "PENDING";
      else if (!job.pending && !job.completedAt) status = "RUNNING";
      else if (job.completedAt && job.stderr) status = "FAILED";

      return {
        id: job.id,
        machine: job.agent?.hostname || "-",
        script: job.script?.filename || "-",
        status,
        stdout: job.stdout,
        stderr: job.stderr,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      };
    }).filter((job) => {
      const matchesSearch =
        job.machine.toLowerCase().includes(search.toLowerCase()) ||
        job.script.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const columns: ColumnDef<typeof data[0]>[] = [
    { accessorKey: "id", header: "Job ID", size: 60 },
    { accessorKey: "machine", header: "Machine", size: 150 },
    { accessorKey: "script", header: "Script", size: 200 },
    {
      accessorKey: "status",
      header: "Status",
      size: 100,
      cell: ({ getValue }) => {
        const val = getValue() as string;
        const colors: Record<string, string> = {
          PENDING: "#ff9800",
          RUNNING: "#2196f3",
          FAILED: "#f44336",
          DONE: "#4caf50",
        };
        return (
          <Typography sx={{ fontWeight: 700, color: colors[val], fontSize: "0.85rem" }}>
            {val}
          </Typography>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 150,
      cell: ({ getValue }) => <Typography>{formatTime(getValue() as string)}</Typography>,
    },
    {
      accessorKey: "completedAt",
      header: "Completed",
      size: 150,
      cell: ({ getValue }) => <Typography>{formatTime(getValue() as string)}</Typography>,
    },
    {
      accessorKey: "stdout",
      header: "Output",
      cell: ({ row }) => (
        <Box sx={{ maxHeight: 80, overflow: "auto" }}>
          {row.original.stdout && (
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                fontSize: "0.75rem",
                bgcolor: "#f5f5f5",
                p: 0.5,
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              {row.original.stdout}
            </Typography>
          )}
          {row.original.stderr && (
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                fontSize: "0.75rem",
                bgcolor: "#fdecea",
                color: "#b71c1c",
                p: 0.5,
                borderRadius: 1,
              }}
            >
              {row.original.stderr}
            </Typography>
          )}
        </Box>
      ),
      size: 300,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
      <CardHeader title="Jobs History" titleTypographyProps={{ variant: "h5" }} />
      <CardContent>
        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search Machine/Script"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="RUNNING">Running</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
          </Select>
        </Box>

        {/* Table */}
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                        padding: "4px 8px",
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: "4px 8px",
                        borderBottom: "1px solid #eee",
                        verticalAlign: "top",
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Typography>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              {"<"}
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              {">"}
            </button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
