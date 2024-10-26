import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderHistory.css';
import Navbar from '../../components/Navbar/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // Control which tab is active
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:3011/orders', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setOrders(response.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to fetch orders.');
                toast.error('Error fetching orders.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchOrderHistory = async () => {
            try {
                const response = await axios.get('http://localhost:3011/orders-history', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setHistory(response.data.orders);
            } catch (error) {
                console.error('Error fetching order history:', error);
                setError('Failed to fetch order history.');
                toast.error('Error fetching order history.');
            }
        };

        fetchOrders();
        fetchOrderHistory();
    }, []);

    return (
        <div className="order-history-container">
            <Navbar />


            <h2>My Purchases</h2>

            {/* Tab Controls */}
            <div className="tab-controls">
                <button
                    className={activeTab === 'orders' ? 'active' : ''}
                    onClick={() => setActiveTab('orders')}>
                    Order
                </button>
                <button
                    className={activeTab === 'history' ? 'active' : ''}
                    onClick={() => setActiveTab('history')}>
                    History
                </button>
            </div>

            {/* Display Loading */}
            {isLoading && <p>Loading...</p>}

            {/* Error Handling */}
            {error && <p>{error}</p>}

            {/* Display orders or history based on active tab */}
            {activeTab === 'orders' && orders.map(order => (
                <div key={order._id} className="order-card">
                    <div className="order-store">
                        <img src={`http://localhost:3011/uploads/${order.storePicture}`} alt={order.store} />
                        <p><strong>{order.store}</strong></p>
                    </div>
                    <div className="order-body">  {/* Grouped order-items, order-item-quantity, and order-summary */}
                        <div className="order-items">
                            {order.products.map(product => (
                                <div key={product.productId} className="order-item">
                                    <img src={`http://localhost:3011/uploads/${product.imageUrl}`} alt={product.name} />
                                    <div className="order-item-content">
                                        <div className="order-item-info">
                                            <p>{product.name}</p>
                                            <p>IDR {product.price.toLocaleString()}</p>
                                        </div>
                                        <p className="order-item-quantity">{product.quantity} x</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="order-summary">
                            <p><strong>Total Items:</strong> {order.totalItems}</p>
                            <p><strong>Total Price:</strong> IDR {order.totalPrice.toLocaleString()}</p>
                            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                        </div>
                    </div>
                </div>
            ))}

            {activeTab === 'history' && history.map(order => (
                <div key={order._id} className="order-card">
                    <div className="order-store">
                        <p><strong>Store Name:</strong> {order.store}</p>
                    </div>
                    <div className="order-body">  {/* Grouped order-items and order-summary */}
                        <div className="order-items">
                            {order.products.map(product => (
                                <div key={product.productId} className="order-item">
                                    <img src={`http://localhost:3011/uploads/${product.imageUrl}`} alt={product.name} />
                                    <p>{product.name} - {product.quantity} x IDR {product.price.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="order-summary">
                            <p><strong>Total Items:</strong> {order.totalItems}</p>
                            <p><strong>Total Price:</strong> IDR {order.totalPrice.toLocaleString()}</p>
                            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                        </div>
                    </div>
                </div>
            ))}
     

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
            />
        </div>
    );
}
