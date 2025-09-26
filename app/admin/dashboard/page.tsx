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
  const jobsList = jobs || [];

  // utility: consistent job status
  function renderJobStatus(job: any) {
    if (job.pending) {
      return <Chip label="⏳ Pending" color="warning" size="small" />;
    }
    if (!job.pending && job.stderr) {
      return <Chip label="❌ Failed" color="error" size="small" />;
    }
    if (!job.pending && job.stdout) {
      return <Chip label="✅ Done" color="success" size="small" />;
    }
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
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
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
                              ? job.script.filename.replace(/\.[^/.]+$/, "") // remove last extension
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
        </Grid>

        {/* Users Table */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardHeader
              title="Users"
              titleTypographyProps={{ variant: "h5" }}
            />
            <CardContent>
              <UsersTable editable={false} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
