
import './App.css';
import Homepage from './pages/LandingPage/LandingPage'
import Login from './pages/LoginPage/Login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />

      </Routes>
    </Router>
  );
}

export default App;

