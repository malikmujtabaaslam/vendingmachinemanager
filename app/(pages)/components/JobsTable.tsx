"use client";
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { CardHeader } from "@mui/material";
// Define Job type
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

// Format time utility
function formatTime(timestamp: string | null) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
}

export default function JobsTable({ jobs }: JobsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Prepare filtered + mapped job data
  const data = useMemo(() => {
    return jobs
      .map((job) => {
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
      })
      .filter((job) => {
        const matchesSearch =
          job.machine.toLowerCase().includes(search.toLowerCase()) ||
          job.script.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [jobs, search, statusFilter]);

  // Define columns
  const columns: ColumnDef<typeof data[0]>[] = [
    { accessorKey: "id", header: "Job ID" },
    { accessorKey: "machine", header: "Machine" },
    { accessorKey: "script", header: "Script" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        const statusStyles: Record<string, string> = {
          PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
          RUNNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
          DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-md ${statusStyles[val] || ""}`}
          >
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => <span>{formatTime(getValue() as string)}</span>,
    },
    {
      accessorKey: "completedAt",
      header: "Completed",
      cell: ({ getValue }) => <span>{formatTime(getValue() as string)}</span>,
    },
    {
      accessorKey: "stdout",
      header: "Output",
      cell: ({ row }) => (
        <div className="space-y-1 max-w-xs md:max-w-md lg:max-w-2xl">
          {row.original.stdout && (
            <pre className="bg-gray-50 dark:bg-gray-800 text-xs p-2 rounded-md text-gray-800 dark:text-gray-200 overflow-auto max-h-24">
              {row.original.stdout}
            </pre>
          )}
          {row.original.stderr && (
            <pre className="bg-red-50 dark:bg-red-950 text-xs p-2 rounded-md text-red-700 dark:text-red-300 overflow-auto max-h-24">
              {row.original.stderr}
            </pre>
          )}
        </div>
      ),
    },
  ];

  // React Table setup
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-800">

        <CardHeader
          title="Jobs History"
          titleTypographyProps={{
            variant: "h6",
            sx: { fontWeight: 600, color: "#111827" },
          }}
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search machine/script"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="RUNNING">Running</option>
            <option value="FAILED">Failed</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 font-medium whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No jobs found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-t dark:border-gray-800 ${i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""
                    } hover:bg-gray-100 dark:hover:bg-gray-800/70 transition`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 align-top text-gray-800 dark:text-gray-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 border-t border-gray-200 dark:border-gray-800">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
