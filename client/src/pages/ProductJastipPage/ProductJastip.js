import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductJastip.css';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

export default function ProductJastip() {
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState('');
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [products, setProducts] = useState([]);

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
            setBatches(response.data);
            if (response.data.length > 0) {
                setSelectedBatch(response.data[0]);
                fetchProducts(response.data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchProducts = async (batchId) => {
        if (batchId) {
            const batch = batches.find(b => b._id === batchId);
            setProducts(batch ? batch.products : []);
        } else {
            // Fetch all products if no batch is selected
            fetchAllProducts();
        }
    };

    const fetchAllProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3011/batches/products', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Flatten the products array from all batches created by the user
            const allProducts = response.data.reduce((acc, batch) => acc.concat(batch.products), []);
            setProducts(allProducts);
        } catch (error) {
            console.error('Error fetching all products:', error);
        }
    };

    const handleBatchSwitch = (batch) => {
        setSelectedBatch(batch);
        fetchProducts(batch._id);
    };

    useEffect(() => {
        fetchStoreData();
        fetchBatches();
    }, []);

    useEffect(() => {
        // Fetch products when batch selection changes
        fetchProducts(selectedBatch ? selectedBatch._id : null);
    }, [selectedBatch]);

    const handleAddBatch = () => {
        navigate('/addbatch');
    };

    const handleAddProduct = () => {
        navigate('/addproduct', { state: { batchId: selectedBatch ? selectedBatch._id : null } });
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
                    <div className='product-grid'>
                        <div className="product-box" onClick={handleAddProduct}>
                            <span className="plus-icon1">+</span>
                            <p className="add-product-text">Add your product</p>
                        </div>
                        {products.length > 0 ? (
                            products.map(product => (
                                <div key={product._id} className="product-box">
                                    <img src={`http://localhost:3011/uploads/${product.imageUrl}`} alt={product.name} className="product-image" />
                                </div>
                            ))
                        ) : (
                            <p>No products found.</p>
                        )}
                    </div>
                </div>
                <div className="right-container">
                    <h2>Batch</h2>
                    <div className="batch-box" onClick={handleAddBatch}>
                        <span className="plus-icon">+</span>
                    </div>
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
