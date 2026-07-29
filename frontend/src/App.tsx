import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import AuthGate from "./auth/AuthGate"
import AppShell from "./layout/AppShell"
import AllBookmarksPage from "./routes/AllBookmarksPage"
import BookmarksPage from "./routes/BookmarksPage"
import CallbackPage from "./routes/CallbackPage"
import CollectionsPage from "./routes/CollectionsPage"

const theme = createTheme({
  palette: {
    primary: { main: "#003399", dark: "#002570" },
    secondary: { main: "#FF6E00", dark: "#CC5800" },
    text: { primary: "#3F3F3F", secondary: "#666666" },
    background: { default: "#F7F8FC", paper: "#FFFFFF" },
    divider: "#E5E7EB",
    error: { main: "#C62828" },
    success: { main: "#2E7D32" },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  typography: {
    fontFamily: '"Source Sans 3", sans-serif',
    h4: {
      fontFamily: "Manrope, sans-serif",
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: "2.25rem",
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthGate>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Navigate replace to="/collections" />} />
              <Route path="all" element={<AllBookmarksPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
            </Route>
            <Route path="callback" element={<CallbackPage />} />
          </Routes>
        </BrowserRouter>
      </AuthGate>
    </ThemeProvider>
  )
}
