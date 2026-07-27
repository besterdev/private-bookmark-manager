import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.tsx'
import { auth0Config } from './config/auth0.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider {...auth0Config} onRedirectCallback={(appState) => window.history.replaceState({}, '', appState?.returnTo ?? '/collections')}>
      <App />
    </Auth0Provider>
  </StrictMode>,
)
