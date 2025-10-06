import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AlarmPage from './pages/AlarmPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/alarm" replace />} />
        <Route path="/alarm" element={<AlarmPage />} />
      </Routes>
    </Router>
  );
}

export default App;
