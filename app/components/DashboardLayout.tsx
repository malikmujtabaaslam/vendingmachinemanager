import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" color="primary" elevation={1} sx={{ zIndex: 1201 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton edge="start" color="inherit" sx={{ mr: 1 }}>
                <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
              </IconButton>
              <Typography variant="h6" component="div">
                Dashboard
              </Typography>
            </Box>
            <Box>
              <LogoutButton />
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: 3, bgcolor: "background.paper" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}