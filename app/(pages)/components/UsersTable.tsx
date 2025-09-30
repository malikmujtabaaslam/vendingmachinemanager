"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyIcon from "@mui/icons-material/Key";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  machines: {
    id: string;
    hostname: string;
    isonline: boolean;
    scripts: {
      id: string;
      filename: string;
      lastJob: {
        id: number;
        pending: boolean;
        stdout: string | null;
        stderr: string | null;
        exitCode: number | null;
        createdAt: string;
        completedAt: string | null;
      } | null;
    }[];
  }[];
}

interface Agent {
  id: string;
  hostname: string;
}

interface UsersTableProps {
  editable?: boolean;
}

// determine script chip color
const getScriptColor = (script: any) => {
  const job = script.lastJob;
  if (!job) return "default";
  if (job.pending) return "secondary";
  if (!job.pending && !job.completedAt) return "primary";
  if (job.completedAt && job.stderr) return "error";
  if (job.completedAt && job.stdout) return "success";
  return "default";
};

export default function UsersTable({ editable = true }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [searchEmail, setSearchEmail] = useState(""); // search by email
  const [machineFilter, setMachineFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL"); // filter by machine status
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // fetch users & unassigned machines every 10 seconds
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

  // assign machine
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
      } else {
        console.error(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  }

  // remove assigned machine
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

  // change user password
  async function handleChangePassword(user: User) {
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

  // remove user
  async function handleRemoveUser(user: User) {
    if (!confirm(`Remove ${user.email}?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  // flatten data for TanStack Table and apply search + filter
  const data = useMemo(() => {
    return users.flatMap((user) => {
      if (user.machines.length === 0) {
        if (!user.email.toLowerCase().includes(searchEmail.toLowerCase())) return [];
        return [{ ...user, machine: null, scripts: [] }];
      }

      return user.machines
        .filter((m) => {
          if (!user.email.toLowerCase().includes(searchEmail.toLowerCase())) return false;
          if (machineFilter === "ALL") return true;
          return machineFilter === "ONLINE" ? m.isonline : !m.isonline;
        })
        .map((m) => ({ ...user, machine: m, scripts: m.scripts }));
    });
  }, [users, searchEmail, machineFilter]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "machine.hostname",
        header: "Machine",
        cell: (info) =>
          info.row.original.machine ? (
            editable ? (
              <Chip
                label={info.getValue()}
                color={info.row.original.machine.isonline ? "success" : "error"}
                onDelete={() => {
                  if (confirm(`Are you sure you want to unassign ${info.getValue()}?`)) {
                    handleRemoveMachine(info.row.original.machine.id);
                  }
                }}
              />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CircleIcon
                  fontSize="small"
                  sx={{ color: info.row.original.machine.isonline ? "green" : "red" }}
                />
                {info.getValue()}
              </Box>
            )
          ) : "-",
      },
      {
        accessorKey: "scripts",
        header: "Scripts",
        cell: (info) =>
          info.getValue()?.length ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {info.getValue().map((s: any) => (
                <Chip key={s.id} label={s.filename.replace(/\.[^/.]+$/, "")} color={getScriptColor(s)} variant="outlined" />
              ))}
            </Box>
          ) : "-",
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) =>
          editable ? (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton size="small" color="primary" onClick={() => setAssigningUser(info.row.original)}>
                <SettingsIcon />
              </IconButton>
              <IconButton size="small" color="secondary" onClick={() => handleChangePassword(info.row.original)}>
                <KeyIcon />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => handleRemoveUser(info.row.original)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : null,
      },
    ],
    [editable]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      {/* Search + Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <Select size="small" value={machineFilter} onChange={(e) => setMachineFilter(e.target.value as any)}>
          <MenuItem value="ALL">All Machines</MenuItem>
          <MenuItem value="ONLINE">Online</MenuItem>
          <MenuItem value="OFFLINE">Offline</MenuItem>
        </Select>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ paddingLeft: "16px", paddingRight: "16px", textAlign: "left" }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", padding: "8px 16px" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          paddingLeft: "16px",
                          paddingRight: "16px",
                          paddingTop: "4px",
                          paddingBottom: "4px",
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Typography>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </Typography>
            <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Assign Machine Dialog */}
      {editable && (
        <Dialog open={!!assigningUser} onClose={() => setAssigningUser(null)}>
          <DialogTitle>Assign Machine to {assigningUser?.email}</DialogTitle>
          <DialogContent>
            <Select fullWidth value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)}>
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.hostname}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssigningUser(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleAssignMachine}>
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
