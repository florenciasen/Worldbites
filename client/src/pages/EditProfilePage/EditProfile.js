import React, { useState, useEffect } from "react";
import axios from "axios";
import './EditProfile.css'; 
import Navbar from '../../components/Navbar/Navbar';
import profileImage from '../../assets/profile.svg';

export default function EditProfile() {
    const [profile, setProfile] = useState({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    const [photo, setPhoto] = useState(null);

    // Fungsi untuk mendapatkan data pengguna dari API
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user'); // Ganti dengan endpoint yang sesuai
        const userData = response.data;

        // Mengupdate state dengan data pengguna
        setProfile({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          address: userData.address || '' // Pastikan ada default value jika address kosong
        });
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    useEffect(() => {
      fetchUserData(); // Memanggil fungsi saat komponen di-mount
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
      formData.append('photo', photo);

      try {
        await axios.post('/api/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Profile saved successfully!');
      } catch (error) {
        console.error('Error saving profile', error);
      }
    };
  
    return (
        <div className="container-editprofile">
        <Navbar />
        <div className="edit-profile-wrapper"> {/* Wrapper Container */}
          <div className="edit-profile-content">
            <div className="profile-section">
              <div className="profile-pic">
                <img 
                  src={photo ? URL.createObjectURL(photo) : profileImage} // Menggunakan gambar default
                  alt="Profile" 
                />
              </div>
              <button 
                type="button" 
                className="change-photo-btn"
                onClick={() => document.getElementById('photo-upload').click()} // Mengklik input file
              >
                Change Photo
              </button>
              <input 
                id="photo-upload" 
                type="file" 
                onChange={handlePhotoChange} 
                style={{ display: 'none' }} // Menyembunyikan input file
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
  
              <button type="submit" className="save-btn">SAVE</button>
            </form>
          </div>
        </div>
      </div>
    );
}