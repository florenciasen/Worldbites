import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import WorldbitesLogo from '../../assets/worldbites.svg';
import Chatlogo from '../../assets/chatlogo.svg';
import Cartlogo from '../../assets/cartlogo.svg';
import Profile from '../../assets/profile.svg';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // Store user info
    const [profilePicture, setProfilePicture] = useState(Profile); // State for profile picture
    const navigate = useNavigate(); 
    
    // Check for token and decode user info when the component mounts
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Current time in seconds
                
                // Check if token is expired
                if (decoded.exp < currentTime) {
                    console.log('Token has expired');
                    handleLogout(); // Log the user out if token is expired
                } else {
                    setIsLoggedIn(true);
                    setUser(decoded); // You can use this to access user details if needed
                    fetchProfilePicture(); // Fetch the profile picture after user validation
                }
            } catch (error) {
                console.error('Invalid token');
                setIsLoggedIn(false);
            }
        }
    }, []);
    
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
            handleLogin(); // Redirect to login if not logged in
        }
    };

    const handleChat = () => {
        if (isLoggedIn) {
            navigate('/chat'); 
        } else {
            handleLogin(); // Redirect to login if not logged in
        }
    };

    const handleEditProfile = () => {
        if (isLoggedIn) {
            navigate('/editprofile'); 
        } else {
            handleLogin(); // Redirect to login if not logged in
        }
    };

    // Handler for logging out the user
    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3011/logout', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            // Clear the token from local storage
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUser(null);
            setProfilePicture(Profile); // Reset to default picture on logout
            navigate('/');
            toast.success('Logout successful');
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error('Logout failed. Please try again.');
        }
    };

    // Handler to fetch the user's profile picture
    const fetchProfilePicture = async () => {
        try {
            const response = await axios.get('http://localhost:3011/profile-picture', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (response.data && response.data.profilePicture) {
                setProfilePicture(response.data.profilePicture); // Update profile picture
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            toast.error('Failed to load profile picture.'); // Inform the user of the error
        }
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
                    <img src={Chatlogo} alt='Chat' className='chat-logo' onClick={handleChat} />
                    <img src={Cartlogo} alt='Shopping Cart' onClick={handleCart} />
                    <div className='profile-dropdown'>
                        <img src={profilePicture} alt='Profile' onClick={toggleDropdown} /> {/* Use the fetched profile picture */}
                        {isOpen && (
                            <div className='dropdown-menu'>
                                {!isLoggedIn ? (
                                    <>
                                        <div className='dropdown-item' onClick={handleLogin}>Login</div>
                                        <div className='dropdown-item' onClick={handleRegister}>Register</div>
                                    </>
                                ) : (
                                    <>
                                        <div className='dropdown-item' onClick={handleEditProfile}>Edit Profile</div>
                                        <div className='dropdown-item'>Change Password</div>
                                        <div className='dropdown-item'>Order and History</div>
                                        <div className='dropdown-item'>Join Jastip</div>
                                        <div className='dropdown-item' onClick={handleLogout}>Logout</div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
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
