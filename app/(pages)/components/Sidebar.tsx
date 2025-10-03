"use client";
import { useEffect, useState, forwardRef } from "react";
import Link, { type LinkProps } from "next/link";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BookIcon from "@mui/icons-material/Book";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Wrap Next.js Link to forward ref for MUI ListItem
const NextLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link {...props} ref={ref} />
));

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole ? storedRole.toLowerCase() : null);
  }, []);

  const drawerWidth = 220;

  const menuItems = [
    {
      role: "admin",
      items: [
        { text: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> },
        { text: "Users", href: "/admin/users", icon: <GroupIcon /> },
        { text: "Documentation", href: "/admin/documentation", icon: <BookIcon /> },
      ],
    },
    {
      role: "user",
      items: [
        { text: "User Dashboard", href: "/user/dashboard", icon: <PersonIcon /> },
        { text: "Vending Machines", href: "/user/scripts", icon: <PersonIcon /> },
      ],
    },
  ];

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
          VMM
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems
          .filter((m) => m.role === role)
          .flatMap((m) =>
            m.items.map((item) => {
              const isSelected = pathname === item.href;
              return (
                <ListItem
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  onClick={isMobile ? onMobileClose : undefined} // auto-close on mobile
                  sx={{
                    my: 1,
                    borderRadius: 2,
                    color: "common.white",
                    bgcolor: isSelected ? "primary.light" : "primary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                    textDecoration: "none",
                  }}
                >
                  <ListItemIcon sx={{ color: "common.white", minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: "common.white" }} />
                </ListItem>
              );
            })
          )}
      </List>
      <Divider sx={{ mt: "auto" }} />
      <Typography variant="caption" sx={{ pl: 2, pb: 2, color: "primary.contrastText", opacity: 0.7 }}>
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline", fontSize: '15px' }}
        >
          <BookIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
          API Explorer
        </a>
      </Typography>
      <Typography variant="caption" sx={{ pl: 2, color: "primary.contrastText", opacity: 0.7 }}>
        © {new Date().getFullYear()} Invictus Zone
      </Typography>
      <Typography variant="caption" sx={{ pl: 2, pb: 2, color: "primary.contrastText", opacity: 0.7 }}>
        <a
          href="mailto:zoneinvictus@gmail.com"
          style={{ color: "inherit", textDecoration: "underline", fontSize: '15px' }}
        >
          <EmailIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
          Contact support
        </a>
      </Typography>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", bgcolor: "primary.main", color: "primary.contrastText" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", bgcolor: "primary.main", color: "primary.contrastText" },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
