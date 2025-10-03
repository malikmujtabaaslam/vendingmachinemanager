import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#ffffff", // Facebook grey
      paper: "#ffffff",
    },
    primary: { main: "#00897b" },
    secondary: { main: "#ffb300" },
  },
});

export default theme;
