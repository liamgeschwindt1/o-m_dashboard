import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import ErrorBoundary    from './ErrorBoundary.jsx'
import DashboardPage    from './dashboard/DashboardPage.jsx'
import ClientsPage      from './dashboard/ClientsPage.jsx'
import ClientProfilePage from './dashboard/ClientProfilePage.jsx'
import RoutesPage       from './dashboard/RoutesPage.jsx'
import StudioPage       from './dashboard/StudioPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/clients"        element={<ClientsPage />} />
          <Route path="/clients/:id"    element={<ClientProfilePage />} />
          <Route path="/routes"         element={<RoutesPage />} />
          <Route path="/studio"         element={<StudioPage />} />
          <Route path="*"               element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
