import { CssBaseline, ThemeProvider } from '@mui/material'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import AuthGate from './auth/AuthGate'
import LoadingState from './components/states/LoadingState'
import AppShell from './layout/AppShell'
import { appTheme } from './theme'

const AllBookmarksPage = lazy(() => import('./routes/AllBookmarksPage'))
const BookmarksPage = lazy(() => import('./routes/BookmarksPage'))
const CallbackPage = lazy(() => import('./routes/CallbackPage'))
const CollectionsPage = lazy(() => import('./routes/CollectionsPage'))

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthGate>
        <BrowserRouter>
          <Suspense fallback={<LoadingState label="Loading page…" minHeight="100vh" />}>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate replace to="/collections" />} />
                <Route path="all" element={<AllBookmarksPage />} />
                <Route path="collections" element={<CollectionsPage />} />
                <Route path="bookmarks" element={<BookmarksPage />} />
              </Route>
              <Route path="callback" element={<CallbackPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthGate>
    </ThemeProvider>
  )
}
