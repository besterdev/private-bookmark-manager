import { CssBaseline, ThemeProvider } from "@mui/material"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import AuthGate from "./auth/AuthGate"
import AppShell from "./layout/AppShell"
import AllBookmarksPage from "./routes/AllBookmarksPage"
import BookmarksPage from "./routes/BookmarksPage"
import CallbackPage from "./routes/CallbackPage"
import CollectionsPage from "./routes/CollectionsPage"
import { appTheme } from "./theme"

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
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
