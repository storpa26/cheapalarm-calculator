import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AlarmPage from './pages/AlarmPage'
import AjaxHub2Page from './pages/AjaxHub2Page'

function App() {
  console.log('🚀 App component rendering')
  console.log('📍 Current URL:', window.location.href)
  console.log('📍 Current pathname:', window.location.pathname)

  return (
    <div className="cheap-alarms-app">
      <Router basename="">
        <Routes>
          {/* Catch-all route to display AlarmPage for any URL */}
          <Route path="*" element={<AlarmPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
