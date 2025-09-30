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
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import TerminalIcon from "@mui/icons-material/Terminal";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import CircleIcon from "@mui/icons-material/Circle";
import { motion } from "framer-motion";
import Image from "next/image";


export default function Documentation() {

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
      >
        Documentation
      </Typography>
      {/* Download Script Card */}
      <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <CardHeader
          title="Register a New Machine"
          subheader="Setup instructions for onboarding a new Ubuntu system"
          titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          subheaderTypographyProps={{ variant: "body2", color: "text.secondary" }}
        />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Description */}
            <Typography variant="body2" color="text.secondary">
              The <b>register.sh</b> script securely connects a new Ubuntu machine to
              the dashboard. It automatically sends the machine’s hostname and ID to
              the server and marks it as <b>active</b> for assignment.
            </Typography>

            {/* Steps */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              How to use:
            </Typography>
            <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "#555" }}>
              <li>Download the script from the button below.</li>
              <li>Copy it to the Ubuntu machine you want to register.</li>
              <li>Run the following commands in your terminal:</li>
            </ol>

            {/* Terminal-like commands with copy button */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              sx={{
                backgroundColor: "#111",
                color: "#0f0",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                p: 2,
                borderRadius: 1,
                position: "relative",
                mb: 1,
              }}
            >
              {[
                "chmod +x ./register.sh",
                "sudo ./register.sh",
              ].map((cmd, i) => (
                <Typography key={i} sx={{ mb: 0.5 }}>
                  $ {cmd}
                </Typography>
              ))}

              {/* Copy to clipboard */}
              <CopyButton
                text={`chmod +x ./register.sh\nsudo ./register.sh`}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              Once successful, the machine will appear in the dashboard as{" "}
              <i>unassigned</i> until linked to a user.
            </Typography>

            {/* Download Button */}
            <Box>
              <a
                href="/register.sh"
                download
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                  padding: "8px 14px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  borderRadius: "6px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1565c0")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1976d2")
                }
              >
                <DownloadIcon fontSize="small" />
                Download Script
              </a>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Add User & Assign Machine Card */}
      <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PersonAddAltIcon color="action" />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Adding Users & Machines
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="flex-start">
            {/* Screenshot + legend on the left */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: "center" }}>
                <Image
                  src="/script-status.png"
                  alt="Admin Users page screenshot"
                  width={808}
                  height={300}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Example of the Users page
                </Typography>

              </Box>
            </Grid>

            {/* Instructions on the right */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                On the <b>Users</b> page, you can create accounts and link machines to them.
                Here’s how:
              </Typography>

              <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "#555", lineHeight: 1.7 }}>
                <li>Go to the <b>Users</b> page in the admin panel.</li>
                <li>Click <b>Add User</b> to create a new account.</li>
                <li>Next to a user, click <b>Assign Machine</b>.</li>
                <li>Select one of the available <b>online machines</b> and click <b>Assign</b>.</li>
                <li>The machine will then appear:
                  <ul style={{ marginTop: "0.5rem" }}>
                    <li>Next to the user in the <b>Users table</b>.</li>
                    <li>In that user’s panel when they log in.</li>
                  </ul>
                </li>
              </ol>
              {/* Legend */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 2,
                  p: 1.5,
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: "#fafafa",
                  textAlign: "left",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Machine Status:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <CircleIcon sx={{ fontSize: 14, color: "#43a047" }} /> Online
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <CircleIcon sx={{ fontSize: 14, color: "#e53935" }} /> Offline
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Script Status:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, ml: 2 }}>
                    <CircleIcon sx={{ fontSize: 14, color: "#000000de" }} /> Never run
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <CircleIcon sx={{ fontSize: 14, color: "#ffca28b3" }} /> Running
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <CircleIcon sx={{ fontSize: 14, color: "#43a047" }} /> Success
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <CircleIcon sx={{ fontSize: 14, color: "#e53935b3" }} /> Failed
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Documentation Card */}
      <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TerminalIcon color="action" />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              User Guide: Running Scripts
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="flex-start">
            {/* Left side: instructions */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Follow these simple steps to run a script on your assigned machine:
              </Typography>

              <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "#555", lineHeight: 1.7 }}>
                <li><b>Login</b> with your user account.</li>
                <li>From the left sidebar, go to <b>Vending Machines → Run Scripts</b>.</li>
                <li>At the top of the page, open the <b>Run Scripts</b> panel.</li>
                <ul>
                  <li>1: Select your <b>machine</b> from the first dropdown (autocomplete makes it easy to find).</li>
                  <li>2: Choose a <b>script</b> from the second dropdown that appears.</li>
                  <li>3: Click the <b>Run</b> button to submit the job.</li>
                  <li>4: Your request will appear in the table below as <b>Pending</b>.</li>
                  <li>5: If the machine is online, it will run the script. Once finished, the <b>Output</b> column will show whether it succeeded or failed.</li>
                </ul>
              </ol>
            </Grid>

            {/* Right side: screenshot */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center" }}>
                <Image
                  src="/run-script.png"
                  alt="Run Scripts panel screenshot"
                  width={600}
                  height={200}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Example of the "Run Scripts" panel with machine and script selection
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>



    </Box>
  );

  // Copy Button Component
  function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Box
        onClick={handleCopy}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "#333",
          color: "#fff",
          p: "2px 6px",
          borderRadius: 1,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: "0.75rem",
          "&:hover": { backgroundColor: "#444" },
        }}
      >
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        {copied ? "Copied" : "Copy"}
      </Box>
    );
  }
