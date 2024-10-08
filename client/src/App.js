
import './App.css';
import Homepage from './pages/LandingPage/LandingPage';
import Login from './pages/LoginPage/Login';
import Register from './pages/RegisterPage/Register';
import Cart from './pages/CartPage/Cart';
import Chat from './pages/ChatPage/Chat';
import ForgotPassword from './pages/ForgotPasswordPage/ForgotPassword';
import ResetPassword from './pages/ResetPasswordPage/ResetPassword';
import OtpPage from './pages/OTPPage/Otp';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/cart" element={<Cart />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/otp" element={<OtpPage />} />
      </Routes>
    </Router>
  );
}

export default App;

