import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import WorldbitesLogo from '../../assets/worldbites.svg';
import Chatlogo from '../../assets/chatlogo.svg';
import Cartlogo from '../../assets/cartlogo.svg';
import Profile from '../../assets/profile.svg';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false); // State untuk mengontrol dropdown
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
        navigate('/cart'); 
    };

    const handleChat = () => {
        navigate('/chat'); 
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
                                <div className='dropdown-item' onClick={handleLogin} >Login</div>
                                <div className='dropdown-item' onClick={handleRegister} >Register</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

           


        </div>
    )

}