import { createTheme } from "@mui/material/styles";

// Your brand colors (matching your current theme)
const brandColors = {
  primary: "#047780",
  secondary: "#036a6f",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  info: "#1890ff",
};

// Create the theme
export const theme = createTheme({
  palette: {
    primary: {
      main: brandColors.primary,
      light: "#4a9b9f",
      dark: "#035a5f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: brandColors.secondary,
      light: "#4a9b9f",
      dark: "#025a5f",
      contrastText: "#ffffff",
    },
    success: {
      main: brandColors.success,
    },
    warning: {
      main: brandColors.warning,
    },
    error: {
      main: brandColors.error,
    },
    info: {
      main: brandColors.info,
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#262626",
      secondary: "#8c8c8c",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brandColors.primary,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: brandColors.primary,
        },
      },
    },
  },
});

export default theme;
