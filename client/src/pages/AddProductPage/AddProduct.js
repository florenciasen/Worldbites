import React, { useState } from 'react';
import './AddProduct.css';
import Navbar from '../../components/Navbar/Navbar';

export default function AddProduct() {
    const [selectedFile, setSelectedFile] = useState(null); // State untuk menyimpan foto yang dipilih

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(URL.createObjectURL(file)); // Mengubah file menjadi URL untuk ditampilkan
        }
    };

    const handleLabelClick = () => {
        document.getElementById('file-input').click(); // Memicu klik pada input file
    };

    return (
        <div className='container-addproduct'>
            <Navbar />
            <div className="wrapper">
                <h2 className="title">Add Product</h2>
                <div className="photo-form-container">
                    <div className="photo-container">
                        <label className="add-photo-box" onClick={handleLabelClick}>
                            {selectedFile ? (
                                <img src={selectedFile} alt="Uploaded" className="uploaded-image" />
                            ) : (
                                <>
                                    <span className="plus-icon">+</span>
                                    <p>Add photo</p>
                                </>
                            )}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            id="file-input"
                            style={{ display: 'none' }} // Menyembunyikan input file
                        />
                    </div>
                    <div className="form-fields">
                        <div className="label-input-container">
                            <p>Product Name:</p>
                            <input type="text" className="input-field" />
                        </div>
                        <div className="label-input-container">
                            <p>Brand:</p>
                            <input type="text" className="input-field" />
                        </div>
                        <div className="label-input-container">
                            <p>Category:</p>
                            <input type="text" className="input-field" />
                        </div>
                        <div className="label-input-container">
                            <p>Product Details:</p>
                            <textarea className="input-field"></textarea>
                        </div>
                        <div className="label-input-container">
                            <p>Price:</p>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="IDR" 
                                onInput={(e) => {
                                    // Mengizinkan hanya angka dan titik
                                    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                                }}
                            />
                        </div>
                    </div>
                </div>
                <button className="add-button">Add</button> 
            </div>
        </div>
    );
}