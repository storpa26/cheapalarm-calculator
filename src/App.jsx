import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AlarmPage from './pages/AlarmPage';
import AjaxHub2Page from './pages/AjaxHub2Page';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/alarm" replace />} />
        <Route path="/alarm" element={<AlarmPage />} />
        <Route path="/ajax-hub-2" element={<AjaxHub2Page />} />
      </Routes>
    </Router>
  );
}

export default App;
