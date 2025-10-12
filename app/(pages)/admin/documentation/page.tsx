"use client";

import { useState } from "react";
import { Card, CardContent, Typography, CardHeader, Box } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import TerminalIcon from "@mui/icons-material/Terminal";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import CircleIcon from "@mui/icons-material/Circle";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Documentation() {
  return (
    <div className="space-y-6">
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#5750F1",
          mb: 2,
        }}
      >
        Documentation
      </Typography>
      
      {/* ========== Register Machine Section ========== */}
      <Card className="shadow-md rounded-xl border border-gray-200 bg-white dark:bg-[#0b1324]">
        <CardHeader
          title="Register a New Machine"
          subheader="Setup instructions for onboarding a new Ubuntu system"
          titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          subheaderTypographyProps={{
            variant: "body2",
            color: "text.secondary",
          }}
        />
        <CardContent>
          <div className="flex flex-col gap-3 text-gray-700 dark:text-gray-300">
            <Typography variant="body2">
              The <b>register.sh</b> script securely connects a new Ubuntu
              machine to the dashboard. It automatically sends the machine’s
              hostname and ID to the server and marks it as{" "}
              <b>active</b> for assignment.
            </Typography>

            <Typography variant="subtitle2" className="font-semibold">
              How to use:
            </Typography>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Download the script below.</li>
              <li>Copy it to the target Ubuntu machine.</li>
              <li>Run the following commands:</li>
            </ol>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative bg-[#111] text-[#0f0] font-mono text-sm p-3 rounded-md my-2"
            >
              <div>$ chmod +x ./register.sh</div>
              <div>$ sudo ./register.sh</div>
              <CopyButton text={`chmod +x ./register.sh\nsudo ./register.sh`} />
            </motion.div>

            <Typography variant="body2">
              Once successful, the machine will appear as{" "}
              <i>unassigned</i> until linked to a user.
            </Typography>

            <a
              target="_blank"
              href="/register.sh"
              download
              className="inline-flex items-center gap-2 bg-[#5750F1] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md text-sm font-medium w-fit transition-colors"
            >
              <DownloadIcon fontSize="small" />
              Download Script
            </a>
          </div>
        </CardContent>
      </Card>

      {/* ========== Add User & Assign Machines Section ========== */}
      <Card className="shadow-md rounded-xl border border-gray-200 bg-white dark:bg-[#0b1324]">
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <PersonAddAltIcon color="action" />
            <Typography variant="body1" className="font-semibold">
              Adding Users & Machines
            </Typography>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left - Image */}
            <div className="flex-1 text-center">
              <Image
                src="/script-status.png"
                alt="Users page screenshot"
                width={800}
                height={300}
                className="rounded-lg border border-gray-200 dark:border-gray-700 mx-auto"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                className="block mt-2"
              >
                Example of the Users page
              </Typography>
            </div>

            {/* Right - Instructions */}
            <div className="flex-1 text-gray-700 dark:text-gray-300">
              <Typography variant="body2" className="mb-2">
                On the <b>Users</b> page, you can create accounts and link
                machines to them:
              </Typography>

              <ol className="list-decimal ml-5 space-y-1 leading-relaxed">
                <li>Go to <b>Users</b> in the admin panel.</li>
                <li>Click <b>Add User</b> to create a new account.</li>
                <li>Click <b>Assign Machine</b> next to a user.</li>
                <li>Select one of the available <b>online machines</b>.</li>
                <li>
                  The assigned machine appears in both the user’s panel and
                  the admin dashboard.
                </li>
              </ol>

              {/* Legend */}
              <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                <Typography variant="subtitle2" className="font-semibold">
                  Machine Status:
                </Typography>
                <div className="flex gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-sm">
                    <CircleIcon sx={{ fontSize: 12, color: "#43a047" }} /> Online
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <CircleIcon sx={{ fontSize: 12, color: "#e53935" }} /> Offline
                  </span>
                </div>

                <Typography variant="subtitle2" className="font-semibold mt-2">
                  Script Status:
                </Typography>
                <div className="flex gap-3 flex-wrap">
                  <StatusDot color="#000" label="Never run" />
                  <StatusDot color="#ffca28b3" label="Running" />
                  <StatusDot color="#43a047" label="Success" />
                  <StatusDot color="#e53935b3" label="Failed" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== User Guide Section ========== */}
      <Card className="shadow-md rounded-xl border border-gray-200 bg-white dark:bg-[#0b1324]">
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <TerminalIcon color="action" />
            <Typography variant="body1" className="font-semibold">
              User Guide: Running Scripts
            </Typography>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Instructions */}
            <div className="flex-1 text-gray-700 dark:text-gray-300">
              <Typography variant="body2" className="mb-2">
                Follow these steps to run a script:
              </Typography>

              <ol className="list-decimal ml-5 space-y-1 leading-relaxed">
                <li>Login with your user account.</li>
                <li>Go to <b>Vending Machines → Run Scripts</b>.</li>
                <li>
                  Select your <b>machine</b> and <b>script</b>, then click{" "}
                  <b>Run</b>.
                </li>
                <li>Your job will show as <b>Pending</b> until completed.</li>
                <li>
                  Once finished, check the <b>Output</b> column for results.
                </li>
              </ol>
            </div>

            {/* Screenshot */}
            <div className="flex-1 text-center">
              <Image
                src="/run-script.png"
                alt="Run Scripts screenshot"
                width={700}
                height={250}
                className="rounded-lg border border-gray-200 dark:border-gray-700 mx-auto"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                className="block mt-2"
              >
                Example of the “Run Scripts” panel
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // --- Helper Components ---
  function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <div
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 text-xs rounded cursor-pointer flex items-center gap-1 hover:bg-gray-700 transition"
      >
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        {copied ? "Copied" : "Copy"}
      </div>
    );
  }

  function StatusDot({ color, label }: { color: string; label: string }) {
    return (
      <span className="flex items-center gap-1 text-sm">
        <CircleIcon sx={{ fontSize: 12, color }} /> {label}
      </span>
    );
  }
}
