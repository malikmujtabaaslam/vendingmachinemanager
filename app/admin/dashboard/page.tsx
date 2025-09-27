"use client";
import useSWR from "swr";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CardHeader,
  Chip,
} from "@mui/material";
import UsersTable from "../../components/UsersTable";

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((res) => res.json());

export default function AdminDashboard() {
  const { data: jobs } = useSWR("/api/jobs", fetcher);
  const { data: agents } = useSWR("/api/machines/unassigned", fetcher);

  const jobsList = jobs || [];
  const unassignedAgents = agents?.agents || [];

  function renderJobStatus(job: any) {
    if (job.pending) return <Chip label="⏳ Pending" color="warning" size="small" />;
    if (!job.pending && job.stderr) return <Chip label="❌ Failed" color="error" size="small" />;
    if (!job.pending && job.stdout) return <Chip label="✅ Done" color="success" size="small" />;
    return <Chip label="Unknown" variant="outlined" size="small" />;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
      >
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Jobs Table */}
        <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              All Jobs
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Script</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(jobsList) && jobsList.length > 0 ? (
                  jobsList.map((job: any) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.id}</TableCell>
                      <TableCell>{job.user?.email}</TableCell>
                      <TableCell>{job.agent?.hostname}</TableCell>
                      <TableCell>
                        <code style={{ fontSize: "0.95em" }}>
                          {job.script?.filename
                            ? job.script.filename.replace(/\.[^/.]+$/, "")
                            : "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>{renderJobStatus(job)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No jobs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Unassigned Agents Table */}
        <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
          <CardHeader
            title="Unassigned Machines"
            titleTypographyProps={{ variant: "h6" }}
            action={
              <a
                href="/register.sh"
                download
                style={{
                  textDecoration: "none",
                  padding: "6px 12px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                Download register.sh
              </a>
            }
          />
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Agent ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Hostname</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unassignedAgents.length > 0 ? (
                  unassignedAgents.map((agent: any) => {
                    const now = new Date();
                    const ONLINE_INTERVAL = parseInt(
                      process.env.ONLINE_INTERVAL || "5"
                    ); // seconds
                    const isOnline =
                      (now.getTime() - new Date(agent.updatedAt).getTime()) / 1000 <
                      ONLINE_INTERVAL;

                    return (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <span
                            style={{
                              display: "inline-block",
                              width: "10px",
                              height: "10px",
                              marginRight: "8px",
                              borderRadius: "50%",
                              backgroundColor: isOnline ? "green" : "red",
                            }}
                          ></span>
                          {agent.id}
                        </TableCell>
                        <TableCell>{agent.hostname}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No unassigned machines found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
          <CardHeader title="Users" titleTypographyProps={{ variant: "h5" }} />
          <CardContent>
            <UsersTable editable={false} />
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
}
