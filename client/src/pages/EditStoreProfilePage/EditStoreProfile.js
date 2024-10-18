import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import './EditStoreProfile.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditStoreProfile() {
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    JastipFrom: '',
    ShippingMethod: '',
    identityCard: '',
    storePicture: ''
  });

  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (e) => {
    const selectedPhoto = e.target.files[0];
    setPhoto(selectedPhoto);

    if (selectedPhoto) {
      const imageUrl = URL.createObjectURL(selectedPhoto);
      setFormData((prevData) => ({ ...prevData, storePicture: imageUrl }));
    }
  };

  useEffect(() => {
    const fetchStoreProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3011/get-store-profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching store profile:', error);
      }
    };

    fetchStoreProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('storeName', formData.storeName);
    formDataToSubmit.append('storeDescription', formData.storeDescription);
    formDataToSubmit.append('JastipFrom', formData.JastipFrom);
    formDataToSubmit.append('ShippingMethod', formData.ShippingMethod);

    if (photo) {
      formDataToSubmit.append('storePicture', photo);
    }

    try {
      const response = await axios.post('http://localhost:3011/update-store-profile', formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(response.data);
      toast.success('Store profile updated successfully!');
    } catch (error) {
      console.error('Error updating store profile:', error);
      toast.error('Failed to update store profile.');
    }
  };

  return (
    <div className="edit-store-profile">
      <Navbar />
      <div className="edit-store-profile-container">
        <h2>Edit Store Profile</h2>
        <form onSubmit={handleSubmit} className="edit-store-profile-content">
          <div className="edit-store-image-section">
            {formData.storePicture ? (
              <img src={`http://localhost:3011/uploads/${formData.storePicture}`} alt="Store" className="edit-store-image" />
            ) : (
              <img src="/path-to-store-image.png" alt="Store" className="edit-store-image" />
            )}
            <input
              type="file"
              onChange={handlePhotoChange}
              id="fileInput"
              style={{ display: 'none' }}
            />
            <button type="button" className="edit-store-image-btn" onClick={() => document.getElementById('fileInput').click()}>Change Photo</button>
          </div>

          <div className="edit-store-details-section">
            <div className="edit-store-info">
              <div className="edit-store-input-group">
                <label>Store Name :</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="edit-store-input-group">
                <label>Jastip From :</label>
                <input
                  type="text"
                  name="JastipFrom"
                  value={formData.JastipFrom}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="edit-store-info">
              <div className="edit-store-input-group">
                <label>International Shipping Methods :</label>
                <input
                  type="text"
                  name="ShippingMethod"
                  value={formData.ShippingMethod}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="edit-store-input-group">
                <label>Identity Card :</label>
                <input
                  type="text"
                  name="identityCard"
                  value={formData.identityCard}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="edit-store-description-section">
            <div className="edit-store-input-group-description">
              <label>Store Description :</label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleInputChange}
                placeholder="Store Description"
                required
              />
            </div>
          </div>

          <div className="edit-store-save-btn-container">
            <button type="submit" className="edit-store-save-btn">Save</button>
          </div>
        </form>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
