import React from 'react';
import './ProductDescription.css';
import Navbar from '../../components/Navbar/Navbar';

export default function ProductDescription() {
    return (
        <div className='container-productdescription'>
            <Navbar />
            <div className="product-description-form">
                <h2>Product Description</h2>
                <div className="form-container">
                    <div className="left-section">
                        <div className="add-photo">
                        </div>
                        <button className="edit-photo-btn">Edit Photo</button> 
                    </div>
                    <div className="right-section">
                        <div className="form-group">
                            <label htmlFor="productName">Product Name:</label>
                            <input type="text" id="productName" name="productName" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="brand">Brand:</label>
                            <input type="text" id="brand" name="brand" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <input type="text" id="category" name="category" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="details">Details:</label>
                            <textarea id="details" name="details"></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price:</label>
                            <input type="text" id="price" name="price" placeholder="IDR" />
                        </div>
                    </div>
                </div>
                <div className="button-group"> {/* Grouping the buttons */}
                    <button type="submit" className="save-btn1">Save</button>
                    <button type="button" className="delete-btn">Delete</button> {/* Tambah button Delete */}
                </div>
            </div>
        </div>
    );
}