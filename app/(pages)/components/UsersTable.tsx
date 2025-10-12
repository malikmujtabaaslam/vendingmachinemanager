"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  IconButton,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyIcon from "@mui/icons-material/Key";
import DeleteIcon from "@mui/icons-material/Delete";
import CircleIcon from "@mui/icons-material/Circle";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { CardHeader } from "@mui/material";
// ---------------- Types ----------------
interface LastJob {
  id: number;
  pending: boolean;
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  createdAt: string;
  completedAt: string | null;
}

interface Script {
  id: string;
  filename: string;
  lastJob: LastJob | null;
}

interface Machine {
  id: string;
  hostname: string;
  isonline: boolean;
  scripts: Script[];
}

interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  machines: Machine[];
}

interface Agent {
  id: string;
  hostname: string;
}

interface UserRow extends User {
  machine: Machine | null;
  scripts: Script[];
}

interface UsersTableProps {
  editable?: boolean;
}

// ---------------- Utils ----------------
const getScriptColorClass = (script: Script) => {
  const job = script.lastJob;
  if (!job) return "bg-gray-200 text-gray-600";
  if (job.pending) return "bg-yellow-100 text-yellow-700";
  if (!job.pending && !job.completedAt) return "bg-blue-100 text-blue-700";
  if (job.completedAt && job.stderr) return "bg-red-100 text-red-700";
  if (job.completedAt && job.stdout) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
};

// ---------------- Component ----------------
export default function UsersTable({ editable = true }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningUser, setAssigningUser] = useState<UserRow | null>(null);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [machineFilter, setMachineFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    await Promise.all([fetchUsers(), fetchUnassignedMachines()]);
    setLoading(false);
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers((data.users.filter((u: User) => u.role === "user") || []).reverse());
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUnassignedMachines() {
    try {
      const res = await fetch("/api/machines/unassigned", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- Actions ----------------
  async function handleAssignMachine() {
    if (!assigningUser || !selectedMachine) return;
    try {
      const res = await fetch("/api/machines/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agentId: selectedMachine, userId: assigningUser.id }),
      });
      if (res.ok) {
        setAssigningUser(null);
        setSelectedMachine("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveMachine(agentId: string) {
    try {
      const res = await fetch("/api/machines/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agentId }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleChangePassword(user: UserRow) {
    const newPassword = prompt(`Enter new password for ${user.email}`);
    if (!newPassword) return;
    try {
      const res = await fetch(`/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, password: newPassword }),
      });
      if (!res.ok) alert("Failed to change password");
      else alert("Password changed!");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveUser(user: UserRow) {
    if (!confirm(`Remove ${user.email}?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- Flatten Data ----------------
  const data: UserRow[] = useMemo(() => {
    return users.flatMap((user) => {
      if (user.machines.length === 0) {
        if (!user.email.toLowerCase().includes(searchEmail.toLowerCase())) return [];
        return [{ ...user, machine: null, scripts: [] } as UserRow];
      }

      return user.machines
        .filter((m) => {
          if (!user.email.toLowerCase().includes(searchEmail.toLowerCase())) return false;
          if (machineFilter === "ALL") return true;
          return machineFilter === "ONLINE" ? m.isonline : !m.isonline;
        })
        .map((m) => ({ ...user, machine: m, scripts: m.scripts } as UserRow));
    });
  }, [users, searchEmail, machineFilter]);

  // ---------------- Columns ----------------
  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "machine.hostname",
      header: "Machine",
      cell: (info) => {
        const m = info.row.original.machine;
        if (!m) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex items-center gap-2">
            <CircleIcon fontSize="small" sx={{ color: m.isonline ? "#22c55e" : "#ef4444" }} />
            <span>{m.hostname}</span>
            {editable && (
              <button
                onClick={() =>
                  confirm(`Unassign ${m.hostname}?`) && handleRemoveMachine(m.id)
                }
                className="text-xs text-red-500 underline ml-2"
              >
                Unassign
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "scripts",
      header: "Scripts",
      cell: (info) => {
        const scripts = info.getValue() as Script[];
        if (!scripts?.length) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {scripts.map((s) => (
              <span
                key={s.id}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScriptColorClass(s)}`}
              >
                {s.filename.replace(/\.[^/.]+$/, "")}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) =>
        editable && (
          <div className="flex gap-2">
            <IconButton size="small" color="primary" onClick={() => setAssigningUser(info.row.original)}>
              <SettingsIcon />
            </IconButton>
            <IconButton size="small" color="secondary" onClick={() => handleChangePassword(info.row.original)}>
              <KeyIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleRemoveUser(info.row.original)}>
              <DeleteIcon />
            </IconButton>
          </div>
        ),
    },
  ], [editable]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel() });

  // ---------------- Render ----------------
  return (
    <>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <CardHeader
            title="Users"
            titleTypographyProps={{
              variant: "h6",
              sx: { fontWeight: 600, color: "#111827" },
            }}
          />
        <div className="flex gap-2 items-center">
          <TextField
            size="small"
            placeholder="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <Select size="small" value={machineFilter} onChange={(e) => setMachineFilter(e.target.value as any)}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="ONLINE">Online</MenuItem>
            <MenuItem value="OFFLINE">Offline</MenuItem>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:bg-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} className="px-4 py-2 text-left font-semibold border-b border-gray-200">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center text-gray-500 py-6">
                    No users found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
            <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Assign Dialog */}
      {editable && (
        <Dialog
          open={!!assigningUser}
          onClose={() => setAssigningUser(null)}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              p: 2,
              backgroundColor: "background.paper",
              minWidth: 400,
            },
          }}
        >
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Assign Machine
          </DialogTitle>
          <DialogContent className="mt-2 space-y-3">
            <p className="text-sm text-gray-600">
              Assign a machine to <strong>{assigningUser?.email}</strong>
            </p>
            <Select
              fullWidth
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              displayEmpty
            >
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.hostname}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "flex-end" }}>
            <Button onClick={() => setAssigningUser(null)} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAssignMachine}
              disabled={!selectedMachine}
            >
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
