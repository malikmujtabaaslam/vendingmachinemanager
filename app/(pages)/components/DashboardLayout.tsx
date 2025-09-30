"use client";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const drawerWidth = 220;

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) setUserEmail(email);
  }, []);

  const handleLogout = () => {
    // Clear cookie
    document.cookie = "token=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    // Redirect
    window.location.href = "/login";
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          ml: { md: `${drawerWidth}px` }, // leave space for permanent drawer on desktop
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flex: 1 }} />

            {/* User Email + Logout */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {userEmail && (
                <Typography variant="body2" sx={{ fontWeight: 500, color: "white" }}>
                  Welcome {userEmail}
                </Typography>
              )}
              <Tooltip title="Logout">
                <IconButton color="warning" onClick={handleLogout}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Spacer for AppBar */}
        <Toolbar />

        {/* Page Content */}
        <Box sx={{ flex: 1, p: 3, bgcolor: "background.paper" }}>{children}</Box>
      </Box>
    </Box>
  );
}
