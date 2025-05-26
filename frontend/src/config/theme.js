import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1A237E" }, // Royal Blue
    secondary: { main: "#D4AF37" }, // Soft Gold
    background: { default: "#FAF3E0", paper: "#FFFFFF" }, // Light Ivory
    text: { primary: "#333333", secondary: "#0D1B2A" },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    button: { textTransform: "none", fontWeight: "bold" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "10px 20px",
        },
      },
    },
  },
});

export default theme;
