import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting
import axios from 'axios';
import './ProductDescription.css';
import Navbar from '../../components/Navbar/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles

export default function ProductDescription() {
    const { id } = useParams(); // Get the product ID from the URL
    const [product, setProduct] = useState(null); // State to store product details
    const [formData, setFormData] = useState({}); // State for form data
    const [image, setImage] = useState(null); // State for the selected image
    const navigate = useNavigate(); // Use navigate for redirection

    // Function to fetch product details
    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3011/getproductdescription/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
            });
            setProduct(response.data);
            setFormData(response.data); // Initialize formData with fetched product data
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProductDetails(); // Fetch product details when component mounts
        }
    }, [id]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle image change
    const handleImageChange = (e) => {
        setImage(e.target.files[0]); // Store the selected file
    };

    // Handle save product
    const handleSave = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('brand', formData.brand);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('details', formData.details);
        if (image) {
            formDataToSend.append('productimage', image); // Append the image file
        }

        try {
            const response = await axios.put(`http://localhost:3011/updateproductdescription/${id}`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data' // Specify the content type
                },
            });
            console.log('Product updated:', response.data);
            toast.success('Product updated successfully!');
            navigate('/productjastip'); // Redirect after updating product
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    // Handle delete product
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:3011/deleteproductdescription/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                });
                toast.success('Product deleted successfully!');
                navigate('/productjastip'); // Redirect after deletion
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

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
                        <input 
                            type="file" 
                            className="edit-photo-btn" 
                            onChange={handleImageChange} 
                            accept="image/*" 
                        />
                    </div>
                    <div className="right-section">
                        <div className="form-group">
                            <label htmlFor="productName">Product Name:</label>
                            <input type="text" id="productName" name="name" value={formData.name || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="brand">Brand:</label>
                            <input type="text" id="brand" name="brand" value={formData.brand || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <input type="text" id="category" name="category" value={formData.category || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="details">Details:</label>
                            <textarea id="details" name="details" value={formData.details || ''} onChange={handleChange}></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price:</label>
                            <input type="text" id="price" name="price" value={formData.price || ''} onChange={handleChange} placeholder="IDR" />
                        </div>
                    </div>
                </div>
                <div className="button-group"> {/* Grouping the buttons */}
                    <button type="button" className="save-btn1" onClick={handleSave}>Save</button>
                    <button type="button" className="delete-btn" onClick={handleDelete}>Delete</button> {/* Add button Delete */}
                </div>
            </div>
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
    );
}
