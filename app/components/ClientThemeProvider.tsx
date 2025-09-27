"use client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ReactNode } from "react";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#00796b" }, // Deep Teal — more professional than bright teal
    secondary: { main: "#ffca28" }, // Vibrant yellow/gold for highlights
    background: {
      default: "#f5f5f5", // Light gray for card/section backgrounds
      paper: "#ffffff",   // Card background
    },
    error: { main: "#e53935" },   // Red for errors
    warning: { main: "#ffb300" }, // Matches previous amber
    info: { main: "#29b6f6" },    // Light blue for info/status
    success: { main: "#43a047" }, // Green for success
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function ClientThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}