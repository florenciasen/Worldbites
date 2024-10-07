// src/pages/Register/Register.js

import React, { useState } from 'react'; 
import './Register.css'; 
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles

export default function Register() {
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3011/register', {
                email,
                phoneNumber,
                password
            });

            console.log(response.data);
            toast.success('User registered successfully! Redirecting to login...');
            // Redirect after a short delay to allow the toast to show
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                toast.error(error.response.data.message || 'Registration failed. Please try again.');
            } else if (error.request) {
                // Request was made but no response received
                toast.error('No response from server. Please try again later.');
            } else {
                // Something else happened
                toast.error('An error occurred. Please try again.');
            }
            console.error('Error registering user:', error);
        }

    };

    const handleLogin = () => {
        navigate('/login'); 
    };

    const handleTermsClick = () => {
        setShowTerms(true);
    };
    
    const handlePrivacyClick = () => {
        setShowPrivacy(true);
    };
    
    const closeModal = () => {
        setShowTerms(false);
        setShowPrivacy(false);
    };

    return (
        <div className='container-register'>
            <Navbar />
            <div className='register-wrapper'> 
                <h2>REGISTER</h2>
                <form className='register-form' onSubmit={handleRegister}>
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
                        <label htmlFor='phone'>Phone Number <span className='required'>*</span></label>
                        <input 
                            type='text' 
                            id='phone' 
                            placeholder='Enter Your Phone Number' 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)} 
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
                    <div className='input-group'>
                        <label htmlFor='confirm-password'>Confirmation Password <span className='required'>*</span></label>
                        <input 
                            type='password' 
                            id='confirm-password' 
                            placeholder='Confirm Your Password' 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className='terms'>
                        <input type='checkbox' id='terms' required />
                        <label htmlFor='terms'>
                            I Agree with
                            <span className='link' onClick={handleTermsClick}> Terms & Conditions</span> and the applicable
                            <span className='link' onClick={handlePrivacyClick}> Privacy Policy</span>.
                        </label>
                    </div>
                    <button type='submit' className='register-button'>OK</button>
                    <p className='login' onClick={handleLogin}>I already have an account</p>
                </form>
                {/* Modal for Terms & Conditions */}
                {showTerms && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={closeModal}>&times;</span>
                            <h2>Terms & Conditions</h2>
                            <p>Welcome to WorldBites. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before using our services.</p>
                            {/* ... rest of your Terms & Conditions content ... */}
                        </div>
                    </div>
                )}
                {showPrivacy && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={closeModal}>&times;</span>
                            <h2>Privacy Policy</h2>
                            <p>Your privacy is important to us. This privacy policy explains how we collect, use, and share information about you when you use our services.</p>
                            {/* ... rest of your Privacy Policy content ... */}
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer 
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}
