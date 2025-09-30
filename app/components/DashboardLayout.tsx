"use client"
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Example: retrieve from localStorage, or decode JWT token if needed
    const email = localStorage.getItem("email");
    if (email) setUserEmail(email);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        <AppBar position="static" color="primary" elevation={1} sx={{ zIndex: 1201 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* Left side: Title */}
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Dashboard
            </Typography>

            {/* Right side: Email + Logout */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              
              {userEmail && (
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "white" }}
                >
                  Welcome {userEmail}
                </Typography>
              )}
              <Tooltip title="Logout">
                <IconButton
                  color="warning"
                  onClick={() => {
                    // Clear cookie & localStorage then redirect
                    document.cookie =
                      "token=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    localStorage.removeItem("userEmail");
                    window.location.href = "/login";
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box sx={{ flex: 1, p: 3, bgcolor: "background.paper" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
