"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Box,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

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
        createdAt: string;      // ISO string
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
  editable?: boolean; // default true
}

export default function UsersTable({ editable = true }: UsersTableProps) {
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [selectedMachine, setSelectedMachine] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
      fetchUnassignedMachines();
    }, 5000); // refresh every second

    return () => clearInterval(interval);
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users.filter((u: User) => u.role === "user") || []);
      console.log("Fetched Users:", data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  async function fetchUnassignedMachines() {
    try {
      const res = await fetch("/api/machines/unassigned", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error("Error fetching unassigned machines:", err);
    }
  }

  // Assign machine to user
  async function handleAssignMachine() {
    if (!assigningUser || !selectedMachine) return;
    try {
      const res = await fetch("/api/machines/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId: selectedMachine,
          userId: assigningUser.id,
        }),
      });

      if (res.ok) {
        setAssigningUser(null);
        setSelectedMachine("");
        fetchUsers();
        fetchUnassignedMachines();
      } else {
        const data = await res.json();
        console.error("Assign machine failed:", data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Remove assigned machine
  async function handleRemoveMachine(agentId: string) {
    try {
      const res = await fetch(`/api/machines/unassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("Unassign failed:", data);
      }else{
        alert("Machine removed successfully!");
        fetchUsers();
        fetchUnassignedMachines();
      }
    } catch (err) {
      console.error(err);
    }
  }
  async function handleChangePassword(user: User) {
    const newPassword = prompt(`Enter new password for ${user.email}`);
    if (!newPassword) return;

    try {
      const res = await fetch(`/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id ,password: newPassword }),
      });
      if (res.ok) {
        alert("Password changed successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to change password");
      }
    } catch (err) {
      console.error(err);
      alert("Error changing password");
    }
  }

  async function handleRemoveUser(user: User) {
    if (!confirm(`Are you sure you want to remove ${user.email}?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUsers();
        fetchUnassignedMachines();
        alert("User removed successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove user");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing user");
    }
  }
  function getScriptColor(script: any) {
    const job = script.lastJob;
    if (!job) return "default";

    if (job.pending) return "secondary"; // still pending
    if (!job.pending && !job.completedAt) return "primary"; // running
    if (job.completedAt && job.stderr) return "error"; // failed
    if (job.completedAt && job.stdout) return "success"; // succeeded
    return "default";
  }
  return (
    <>
      <Table>
      <TableHead>
        <TableRow>
          <TableCell>Email</TableCell>
          <TableCell>Machine</TableCell>
          <TableCell>Scripts</TableCell>
          {editable && <TableCell>Actions</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) =>
          user.machines.length ? (
            user.machines.map((machine, idx) => (
              <TableRow key={machine.id}>
                {/* Show email only on first row of each user */}
                {idx === 0 && (
                  <TableCell rowSpan={user.machines.length}>
                    {user.email}
                  </TableCell>
                )}

                <TableCell>
                  {editable ? (
                    <Chip
                      color = {machine.isonline ? "success" : "error"}
                      label={machine.hostname}
                      onDelete={() => handleRemoveMachine(machine.id)}
                    />
                  ) : (
                    <>
                      <CircleIcon
                        sx={{
                          fontSize: 12,
                          color: machine.isonline ? "green" : "red",
                        }}
                      />
                      {machine.hostname}
                    </>
                  )}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {machine.scripts.length ? (
                      machine.scripts.map((s: any) => (
                        <Chip
                          key={s.id}
                          label={s.filename.replace(/\.[^/.]+$/, "")} // remove extension
                          color={getScriptColor(s)}
                          variant="outlined"
                        />
                      ))
                    ) : (
                      "-"
                    )}
                  </Box>
                </TableCell>

                {editable && idx === 0 && (
                  <TableCell rowSpan={user.machines.length}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setAssigningUser(user)}
                      sx={{ mr: 1 }}
                    >
                      Assign Machine
                    </Button>
                    <Button
                      color="secondary"
                      variant="outlined"
                      size="small"
                      onClick={() => handleChangePassword(user)}
                      sx={{ mr: 1 }}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleRemoveUser(user)}
                    >
                      Remove User
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              {editable && (
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setAssigningUser(user)}
                    sx={{ mr: 1 }}
                  >
                    Assign Machine
                  </Button>
                  <Button
                    color="secondary"
                    variant="outlined"
                    size="small"
                    onClick={() => handleChangePassword(user)}
                    sx={{ mr: 1 }}
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleRemoveUser(user)}
                  >
                    Remove User
                  </Button>
                </TableCell>
              )}
            </TableRow>
          )
        )}
      </TableBody>
    </Table>

      {editable && (
        <Dialog open={!!assigningUser} onClose={() => setAssigningUser(null)}>
          <DialogTitle>Assign Machine to {assigningUser?.email}</DialogTitle>
          <DialogContent>
            <Select
              fullWidth
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
            >
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
