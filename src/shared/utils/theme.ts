import { alpha, createTheme } from '@mui/material';

const brandPrimary = '#0f766e';
const brandSecondary = '#0ea5e9';
const surface = '#ffffff';
const ink = '#0f172a';
const muted = '#475569';

export const theme = createTheme({
  palette: {
    primary: {
      main: brandPrimary,
      contrastText: surface,
    },
    secondary: {
      main: brandSecondary,
      contrastText: ink,
    },
    background: {
      default: '#f6f7fb',
      paper: surface,
    },
    text: {
      primary: ink,
      secondary: muted,
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Space Grotesk", "Manrope", "Segoe UI", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: 0 },
    body1: { color: ink },
    body2: { color: muted },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Grotesk", "Manrope", "Segoe UI", sans-serif',
          color: ink,
          fontWeight: 600,
          cursor: 'pointer',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 18px',
          boxShadow: `0 12px 35px ${alpha(brandPrimary, 0.28)}`,
        },
        containedSecondary: {
          boxShadow: `0 12px 35px ${alpha(brandSecondary, 0.28)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 64px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          padding: '4px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 0,
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 0,
          padding: '10px 16px',
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 600,
          color: muted,
          backgroundColor: '#eef2f8',
          '&.Mui-selected': {
            color: ink,
            backgroundColor: alpha(brandPrimary, 0.1),
            boxShadow: `0 12px 30px ${alpha(brandPrimary, 0.25)}`,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          borderRadius: 12,
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: alpha(brandPrimary, 0.6),
            },
            '&.Mui-focused fieldset': {
              borderColor: brandPrimary,
              boxShadow: `0 0 0 4px ${alpha(brandPrimary, 0.08)}`,
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: muted,
        },
      },
    },
  },
});
