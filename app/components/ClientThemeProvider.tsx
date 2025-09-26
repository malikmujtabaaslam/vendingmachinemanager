"use client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ReactNode } from "react";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#00897b" }, // Teal
    secondary: { main: "#ffb300" }
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