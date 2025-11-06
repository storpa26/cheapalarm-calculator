import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import AlarmPage from './pages/AlarmPage'
import AjaxHub2Page from './pages/AjaxHub2Page'
import QuotePage from './pages/QuotePage'
import UploadPage from './pages/UploadPage'
import ThankYouPage from './pages/ThankYouPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

// Inner component to handle initial route navigation
function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if WordPress admin set an initial route
    if (window.caInitialRoute) {
      navigate(window.caInitialRoute, { replace: true })
    }
  }, [navigate])

  return (
    <Routes>
      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      
      {/* Quote management routes */}
      <Route path="/quote" element={<QuotePage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      
      {/* Catch-all route to display AlarmPage for any other URL */}
      <Route path="*" element={<AlarmPage />} />
    </Routes>
  )
}

function App() {
  // If WordPress admin mode is enabled, render dashboard directly
  // This bypasses React Router routing issues with WordPress admin URLs
  if (window.caAdminMode === true) {
    return (
      <div className="cheap-alarms-app">
        <AdminDashboardPage />
      </div>
    )
  }

  return (
    <div className="cheap-alarms-app">
      <Router basename="">
        <AppRoutes />
      </Router>
    </div>
  )
}

export default App
