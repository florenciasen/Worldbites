import React, { useState, useEffect } from "react";
import axios from "axios";
import './EditProfile.css';
import Navbar from '../../components/Navbar/Navbar';
import profileImage from '../../assets/profile.svg'; // Default profile image
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles

export default function EditProfile() {

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    profilePicture: ''
  });
  const [photo, setPhoto] = useState(null);

  // Function to fetch user data from the API
  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3011/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const userData = response.data;

      // Update state with user data
      setProfile({
        name: userData.name || '', // Default to empty string if null
        phone: userData.phoneNumber || '', // Ensure phoneNumber is mapped correctly
        email: userData.email,
        address: userData.address || '', // Default to empty string if null
        profilePicture: userData.profilePicture || null // Store fetched profile picture
      });
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  };

  useEffect(() => {
    fetchUserData(); // Call function on component mount
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('phone', profile.phone);
    formData.append('email', profile.email);
    formData.append('address', profile.address);
    formData.append('profilePicture', profile.profilePicture);
    
    // Ensure to use 'profilePicture' to match your backend expectation
    if (photo) {
      formData.append('profilePicture', photo);
    }

    try {
      const response = await axios.post('http://localhost:3011/updateprofile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}` // Ensure token is included
        }
      });
      toast.success('Profile updated successfully!');
      setProfile(response.data); // Update profile state with new data
    } catch (error) {
      console.error('Error saving profile', error);
      toast.error('Error saving profile');
    }
  };

  return (
    <div className="container-editprofile">
      <Navbar />
      <div className="edit-profile-wrapper">
        <div className="edit-profile-content">
          <div className="profile-section">
            <div className="profile-pic">
              {/* Display profile picture if it exists, otherwise show the default */}
              <img
                src={profile.profilePicture ? `http://localhost:3011/${profile.profilePicture}` : profileImage}
                alt="Profile"
              />
            </div>
            <button
              type="button"
              className="change-photo-btn"
              onClick={() => document.getElementById('photo-upload').click()}
            >
              Change Photo
            </button>
            <input
              id="photo-upload"
              type="file"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Address</label>
              <textarea name="address" value={profile.address} onChange={handleChange}></textarea>
            </div>
          </form>
        </div>
        <div className="button-section">
          <button type="submit" className="save-btn" onClick={handleSubmit}>SAVE</button>
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
