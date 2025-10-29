import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AlarmPage from './pages/AlarmPage'
import AjaxHub2Page from './pages/AjaxHub2Page'
import QuotePage from './pages/QuotePage'
import UploadPage from './pages/UploadPage'
import ThankYouPage from './pages/ThankYouPage'

function App() {
  console.log('🚀 App component rendering')
  console.log('📍 Current URL:', window.location.href)
  console.log('📍 Current pathname:', window.location.pathname)

  return (
    <div className="cheap-alarms-app">
      <Router basename="">
        <Routes>
          {/* Quote management routes */}
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          
          {/* Catch-all route to display AlarmPage for any other URL */}
          <Route path="*" element={<AlarmPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
