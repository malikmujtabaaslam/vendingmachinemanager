"use client";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from "@mui/material";

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
  jobs: Job[]; // jobs from /api/jobs
}

export default function JobsTable({ jobs }: JobsTableProps) {
  function getStatusChip(job: Job) {
    if (job.pending) {
      return <Chip label="⏳ Pending" color="warning" />;
    }
    else if (!job.pending && !job.completedAt) {
      return <Chip label="▶️ Running" color="info" />;
    }
    else if (job.completedAt && job.stderr) {
      return <Chip label="❌ Failed" color="error" />;
    }
    else{
      return <Chip label="✅ Done" color="success" />;
    }
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
      <CardHeader title="Jobs History" titleTypographyProps={{ variant: "h5" }} />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Machine</TableCell>
              <TableCell>Script</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Output</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs?.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>{job.agent?.hostname || "-"}</TableCell>
                <TableCell>
                  <code>{job.script?.filename || "-"}</code>
                </TableCell>
                <TableCell>{getStatusChip(job)}</TableCell>
                <TableCell>
                  {job.stdout && (
                    <Typography
                      component="pre"
                      sx={{
                        whiteSpace: "pre-wrap",
                        fontSize: "0.85rem",
                        bgcolor: "#f5f5f5",
                        p: 1,
                        borderRadius: 2,
                      }}
                    >
                      {job.stdout}
                    </Typography>
                  )}
                  {job.stderr && (
                    <Typography
                      component="pre"
                      sx={{
                        whiteSpace: "pre-wrap",
                        fontSize: "0.85rem",
                        bgcolor: "#fdecea",
                        color: "#b71c1c",
                        p: 1,
                        borderRadius: 2,
                      }}
                    >
                      {job.stderr}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
