"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import theme from "./theme"; // <- make sure you have a theme.ts

// Create a cache for MUI/Emotion
const muiCache = createCache({ key: "mui", prepend: true });

export default function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
