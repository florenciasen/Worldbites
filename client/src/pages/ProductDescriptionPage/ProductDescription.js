import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to access URL parameters
import axios from 'axios';
import './ProductDescription.css';
import Navbar from '../../components/Navbar/Navbar';

export default function ProductDescription() {
    const { id } = useParams(); // Get the product ID from the URL
    const [product, setProduct] = useState(null); // State to store product details

    // Function to fetch product details
    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3011/getproductdescription/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            });
            setProduct(response.data); // Store the fetched product data in state
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProductDetails(); // Fetch product details when component mounts
        }
    }, [id]);

    return (
        <div className='container-productdescription'>
            <Navbar />
            <div className="product-description-form">
                <h2>Product Description</h2>
                <div className="form-container">
                    <div className="left-section">
                        <div className="add-photo">
                            {product && <img src={`http://localhost:3011/uploads/${product.imageUrl}`} alt={product.name} />}
                        </div>
                        <button className="edit-photo-btn">Edit Photo</button> 
                    </div>
                    <div className="right-section">
                        <div className="form-group">
                            <label htmlFor="productName">Product Name:</label>
                            <input type="text" id="productName" name="productName" value={product ? product.name : ''} readOnly />
                        </div>
                        <div className="form-group">
                            <label htmlFor="brand">Brand:</label>
                            <input type="text" id="brand" name="brand" value={product ? product.brand : ''} readOnly />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <input type="text" id="category" name="category" value={product ? product.category : ''} readOnly />
                        </div>
                        <div className="form-group">
                            <label htmlFor="details">Details:</label>
                            <textarea id="details" name="details" value={product ? product.details : ''} readOnly></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price:</label>
                            <input type="text" id="price" name="price" value={product ? product.price : ''} readOnly placeholder="IDR" />
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
