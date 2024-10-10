import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const [isJastipLoggedIn, setIsJastipLoggedIn] = useState(false); // State for Jastip login
    const [userData, setUserData] = useState(null); // Store user data here
    const [profilePicture, setProfilePicture] = useState(Profile); 
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    toast.error('Session expired. Please login again.');
                    handleLogout(); 
                } else {
                    setIsLoggedIn(true);
                    fetchUserData();
                    fetchProfilePicture();
                }
            } catch (error) {
                console.error('Invalid token');
                setIsLoggedIn(false);
            }
        }
    }, []);

    // Listen for location change to check if the user is on the Jastip homepage
    useEffect(() => {
        if (location.pathname === '/homepagejastip') {
            setIsJastipLoggedIn(true);
        } else {
            setIsJastipLoggedIn(false);
        }
    }, [location.pathname]);
    
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
            handleLogin(); 
        }
    };

    const handleChat = () => {
        if (isLoggedIn) {
            navigate('/chat'); 
        } else {
            handleLogin(); 
        }
    };

    const handleEditProfile = () => {
        if (isLoggedIn) {
            navigate('/editprofile'); 
        } else {
            handleLogin(); 
        }
    };

    const handleChangePassword = () => {
        if (isLoggedIn) {
            navigate('/changepassword'); 
        } else {
            handleLogin(); 
        }
    };

    // Jastip login handler
    const handleLoginJastip = () => {
        setIsJastipLoggedIn(true); // Set Jastip mode before navigating
        navigate('/homepagejastip');
    };

    // Jastip logout handler (not total logout)
    const handleLogoutJastip = () => {
        setIsJastipLoggedIn(false); // Exit Jastip mode only
        navigate('/');
        toast.success('You have logged out from Jastip mode.');
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3011/logout', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setIsJastipLoggedIn(false); // Reset both Jastip and general login
            setUserData(null);
            setProfilePicture(Profile); 
            navigate('/');
            toast.success('Logout successful');
            
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const fetchProfilePicture = async () => {
        try {
            const response = await axios.get('http://localhost:3011/profile-picture', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (response.data && response.data.profilePicture) {
                setProfilePicture(response.data.profilePicture); 
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            toast.error('Failed to load profile picture.'); 
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:3011/sellerinfo', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data) {
                setUserData(response.data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load user data.'); 
        }
    };

    // Define handleJoinJastip
    const handleJoinJastip = () => {
        if (!userData?.storeName || !userData?.identityCard || !userData?.storeDescription) {
            toast.error("Incomplete Jastip details. Please complete your profile.");
            // Redirect to the Join Jastip page to complete their profile
            navigate('/joinjastip');
        } else {
            setIsJastipLoggedIn(true); // Set Jastip mode before navigating
            navigate('/homepagejastip');
        }
    };

    const isOnHomepageJastip = location.pathname === '/homepagejastip';

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
                        <img src={profilePicture} alt='Profile' onClick={toggleDropdown} />
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
                                        <div className='dropdown-item' onClick={handleChangePassword}>Change Password</div>
                                        <div className='dropdown-item'>Order and History</div>
                                        {/* Conditionally render Jastip options */}
                                        {!isJastipLoggedIn ? (
                                            userData?.identityCard && userData?.storeName && userData?.storeDescription ? (
                                                <div className='dropdown-item' onClick={handleLoginJastip}>Login Jastip</div>
                                            ) : (
                                                <div className='dropdown-item' onClick={handleJoinJastip}>Join Jastip</div>
                                            )
                                        ) : (
                                            <div className='dropdown-item' onClick={handleLogoutJastip}>Logout Jastip</div>
                                        )}
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
