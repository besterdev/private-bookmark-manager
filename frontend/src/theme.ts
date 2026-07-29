import { createTheme, type Shadows, type Theme } from '@mui/material'

const shadows: Shadows = Array.from({ length: 25 }, (_, index) => (
  index === 0 ? 'none' : '0 4px 12px rgba(31, 41, 55, 0.08)'
)) as Shadows

export const appTheme: Theme = createTheme({
  palette: {
    background: { default: '#F7F8FC', paper: '#FFFFFF' },
    divider: '#E5E7EB',
    error: { main: '#C62828' },
    primary: { dark: '#002570', main: '#003399' },
    secondary: { dark: '#CC5800', main: '#FF6E00' },
    success: { main: '#2E7D32' },
    text: { primary: '#3F3F3F', secondary: '#666666' },
  },
  shape: { borderRadius: 12 },
  shadows,
  spacing: 8,
  typography: {
    fontFamily: '"Public Sans", sans-serif',
    h4: { fontSize: '1.75rem', fontWeight: 700, lineHeight: '2.25rem' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          fontWeight: 700,
          textTransform: 'none',
          '&:focus-visible': { outline: '3px solid #FF6E00', outlineOffset: 2 },
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 12px rgba(31, 41, 55, 0.08)',
          transition: 'box-shadow 160ms ease, transform 160ms ease',
          '&:hover': { boxShadow: '0 8px 20px rgba(31, 41, 55, 0.12)', transform: 'translateY(-2px)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { backgroundColor: '#EEF2FF', borderRadius: 8, color: '#003399', fontWeight: 600 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid #E5E7EB', boxShadow: '0 8px 20px rgba(31, 41, 55, 0.08)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 160ms ease',
            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(255, 110, 0, 0.2)' },
          },
        },
      },
    },
  },
})
