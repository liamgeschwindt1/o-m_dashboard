import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { initA11y }     from './dashboard/a11y.js'
import ErrorBoundary    from './ErrorBoundary.jsx'
import LoginPage        from './dashboard/LoginPage.jsx'

initA11y()

import DashboardPage    from './dashboard/DashboardPage.jsx'
import ClientsPage      from './dashboard/ClientsPage.jsx'
import ClientProfilePage from './dashboard/ClientProfilePage.jsx'
import RoutesPage       from './dashboard/RoutesPage.jsx'
import StudioPage       from './dashboard/StudioPage.jsx'

// Simple gate: redirect to /login if not authed.
function RequireAuth({ children }) {
  if (sessionStorage.getItem('om_auth') !== 'true') {
    return <Navigate to="/login" replace />
  }
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/dashboard"      element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/clients"        element={<RequireAuth><ClientsPage /></RequireAuth>} />
          <Route path="/clients/:id"    element={<RequireAuth><ClientProfilePage /></RequireAuth>} />
          <Route path="/routes"         element={<RequireAuth><RoutesPage /></RequireAuth>} />
          <Route path="/studio"         element={<RequireAuth><StudioPage /></RequireAuth>} />
          <Route path="*"               element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
