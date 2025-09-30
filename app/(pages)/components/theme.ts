import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#ffffff", // Facebook grey
      paper: "#f0f2f5",
    },
    primary: { main: "#00897b" },
    secondary: { main: "#ffb300" },
  },
});

export default theme;
