import React, { useState } from 'react'; 
import './Login.css'; 
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleLogin = (e) => {
        e.preventDefault();
        // Logika untuk menangani login bisa ditambahkan di sini
        console.log("Email:", email, "Password:", password);
    };

    const handleRegister = () => {
        navigate('/register'); 
    };

    const handleForgotPassword = () => {
        navigate('/forgotpassword'); 
    };

    return (
        <div className='container-login'>
            <Navbar />
              <div className='login-wrapper'> 
                <h2>LOGIN MEMBER</h2>
                <form className='login-form' onSubmit={handleLogin}>
                    <div className='input-group'>
                        <label htmlFor='email'>Email <span className='required'>*</span></label>
                        <input 
                            type='email' 
                            id='email' 
                            placeholder='Enter Your Email Address' 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='password'>Password <span className='required'>*</span></label>
                        <input 
                            type='password' 
                            id='password' 
                            placeholder='Enter Your Password' 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <p className='forgot-password' onClick={handleForgotPassword}>Forgot Password?</p>
                    <button type='submit' className='login-button'>OK</button>
                    <p className='register' onClick={handleRegister}>Don’t have an account yet?</p>
                </form>
            </div>
        </div>
    );
}