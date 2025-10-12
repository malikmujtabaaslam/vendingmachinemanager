"use client";
import { Box } from "@mui/material";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      {/* NextAdmin layout already provides Sidebar/Header */}
      <Box sx={{ p: 3, bgcolor: "background.paper", minHeight: "100vh" }}>
        {children}
      </Box>
    </Box>
  );
}
