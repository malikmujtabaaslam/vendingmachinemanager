"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box, Card, CardContent, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Get role from localStorage
    const storedRole = localStorage.getItem("role");
    setRole(storedRole ? storedRole.toLowerCase() : null);
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 220,
          boxSizing: "border-box",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          Vending Mngt
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {role === "admin" && (
          <>
            <ListItem
              button
              component={Link}
              href="/admin/dashboard"
              selected={pathname === "/admin/dashboard"}
              sx={{
                my: 1,
                borderRadius: 2,
                color: "common.white",
                bgcolor: pathname === "/admin/dashboard" ? "primary.light" : "primary.main",
                "&:hover": { bgcolor: "primary.dark" }
              }}
            >
              <ListItemIcon sx={{ color: "common.white", minWidth: 36 }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" sx={{ color: "common.white" }} />
            </ListItem>
            <ListItem
              button
              component={Link}
              href="/admin/users"
              selected={pathname === "/admin/users"}
              sx={{
                my: 1,
                borderRadius: 2,
                color: "common.white",
                bgcolor: pathname === "/admin/users" ? "primary.light" : "primary.main",
                "&:hover": { bgcolor: "primary.dark" }
              }}
            >
              <ListItemIcon sx={{ color: "common.white", minWidth: 36 }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Users" sx={{ color: "common.white" }} />
            </ListItem>
          </>
        )}
        {role === "user" && (
          <>
            <ListItem
              button
              component={Link}
              href="/user/dashboard"
              selected={pathname === "/user/dashboard"}
              sx={{
                my: 1,
                borderRadius: 2,
                color: "common.white",
                bgcolor: pathname === "/user/dashboard" ? "primary.light" : "primary.main",
                "&:hover": { bgcolor: "primary.dark" }
              }}
            >
              <ListItemIcon sx={{ color: "common.white", minWidth: 36 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="User Dashboard" sx={{ color: "common.white" }} />
            </ListItem>
            <ListItem
              button
              component={Link}
              href="/user/scripts"
              selected={pathname === "/user/scripts"}
              sx={{
                my: 1,
                borderRadius: 2,
                color: "common.white",
                bgcolor: pathname === "/user/scripts" ? "primary.light" : "primary.main",
                "&:hover": { bgcolor: "primary.dark" }
              }}
            >
              <ListItemIcon sx={{ color: "common.white", minWidth: 36 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Vending Machines" sx={{ color: "common.white" }} />
            </ListItem>
          </>

        )}
      </List>
      <Divider sx={{ mt: "auto" }} />

      <Typography
        variant="caption"
        sx={{ pl: 2, color: "primary.contrastText", opacity: 0.7 }}
      >
        © {new Date().getFullYear()}
      </Typography>
      <Typography
        variant="caption"
        sx={{ pl: 2, pb: 2, color: "primary.contrastText", opacity: 0.7 }}
      >
        Developed by:  Mujtaba Aslam{" "}
        <a
          href="mailto:malikmujtabaaslam@gmail.com"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          malikmujtabaaslam@gmail.com
        </a>
      </Typography>

    </Drawer>
  );
}