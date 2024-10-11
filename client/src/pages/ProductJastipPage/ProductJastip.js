import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductJastip.css';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

export default function ProductJastip() {
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');
    const [batches, setBatches] = useState([]); // State to store all batches
    const [selectedBatch, setSelectedBatch] = useState(null); // State for the selected batch
    const [products, setProducts] = useState([]); // State to store products for the selected batch

    const fetchStoreData = async () => {
        try {
            const response = await axios.get('http://localhost:3011/joinjastip/me', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setStoreName(response.data.storeName);
        } catch (error) {
            console.error('Error fetching store data:', error);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await axios.get('http://localhost:3011/batches/products', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setBatches(response.data); // Save the batches and products to state
            if (response.data.length > 0) {
                setSelectedBatch(response.data[0]); // Set the first batch as the default selection
                fetchProducts(response.data[0]._id); // Fetch products for the default batch
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchProducts = async (batchId) => {
        try {
            const response = await axios.get(`http://localhost:3011/batches/${batchId}/products`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setProducts(response.data); // Save the products for the selected batch
        } catch (error) {
            console.error('Error fetching products for batch:', error);
        }
    };

    // Handle batch switch
    const handleBatchSwitch = (batch) => {
        setSelectedBatch(batch); // Set the clicked batch as selected
        fetchProducts(batch._id); // Fetch products for the selected batch
    };

    useEffect(() => {
        fetchStoreData();
        fetchBatches(); // Fetch all batches when component loads
    }, []);

    const handleAddBatch = () => {
        navigate('/addbatch'); 
    };

    const handleAddProduct = () => {
        navigate('/addproduct'); 
    };

    return (
        <div className='container-productjastip'>
            <Navbar />
            <div className="store-name">
                <h2>{storeName ? storeName : 'Loading...'}</h2>
            </div>
            <div className="content-wrapper">
                <div className="left-container">
                    <h2>Product</h2>
                    <div className="product-box" onClick={handleAddProduct}>
                        <span className="plus-icon1">+</span>
                        <p className="add-product-text">Add your product</p>
                    </div>
                    {/* Display product images for the selected batch */}
                    <div className="products-grid">
                        {products.length > 0 ? (
                            products.map(product => (
                                <div key={product._id} className="product-item">
                                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                                </div>
                            ))
                        ) : (
                            console.log('No products found.')
                        )}
                    </div>
                </div>
                <div className="right-container">
                    <h2>Batch</h2>
                    <div className="batch-box" onClick={handleAddBatch}>
                        <span className="plus-icon">+</span>
                    </div>
                    {/* Display batches */}
                    {batches.map(batch => (
                        <div 
                            key={batch._id} 
                            className={`batch-info-box ${selectedBatch && selectedBatch._id === batch._id ? 'active' : ''}`}
                            onClick={() => handleBatchSwitch(batch)}
                        >
                            <p>{new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
