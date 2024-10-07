import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import WorldbitesLogo from '../../assets/worldbites.svg';
import Chatlogo from '../../assets/chatlogo.svg';
import Cartlogo from '../../assets/cartlogo.svg';
import Profile from '../../assets/profile.svg';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate(); 
    

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    const handleLogin = () => {
        navigate('/login'); 
    };

    const handleRegister = () => {
        navigate('/register'); 
    };
    
    const handleCart = () => {
        if (isLoggedIn) {
            navigate('/cart'); 
        } else {
            handleLogin(); // Redirect ke login jika belum login
        }
    };

    const handleChat = () => {
        if (isLoggedIn) {
            navigate('/chat'); 
        } else {
            handleLogin(); // Redirect ke login jika belum login
        }
    };
    
    const handleLogout = () => {
        // Logika logout Anda di sini
        setIsLoggedIn(false); 
        // Mungkin juga redirect ke homepage atau halaman lain
        navigate('/'); 
    };

    
    return (

        <div className='container-navbar'>
            <div className='navbar'>
                <div className='logo'>
                    <a href="/">
                        <img src={WorldbitesLogo} alt='WorldBites Logo' />
                    </a>
                </div>
                <h1>
                    <a href="/">WORLDBITES</a>
                </h1>
                <div className='icons'>
                    <img src={Chatlogo} alt='Chat' className='chat-logo' onClick={handleChat}  />
                    <img src={Cartlogo} alt='Shopping Cart' onClick={handleCart} />
                    <div className='profile-dropdown'>
                        <img src={Profile} alt='Profile' onClick={toggleDropdown} /> {}
                        {isOpen && (
                            <div className='dropdown-menu'>
                            {!isLoggedIn ? (
                                <>
                                    <div className='dropdown-item' onClick={handleLogin}>Login</div>
                                    <div className='dropdown-item' onClick={handleRegister}>Register</div>
                                </>
                            ) : (
                                <>
                                    <div className='dropdown-item' >Edit Profile</div>
                                    <div className='dropdown-item' >Change Password</div>
                                    <div className='dropdown-item' >Order and History</div>
                                    <div className='dropdown-item' >Join Jastip</div>
                                    <div className='dropdown-item' onClick={handleLogout}>Logout</div>
                                </>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </div>

           


        </div>
    )

}