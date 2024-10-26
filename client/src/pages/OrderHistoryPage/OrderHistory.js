import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderHistory.css'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles
import Navbar from '../../components/Navbar/Navbar';


export default function OrderHistory() {
    const [orders, setOrders] = useState([]);

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
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="order-history-container">
            <Navbar />
            <h2>My Purchases</h2>
            {orders.map(order => (
                <div key={order._id} className="order-card">
                    <div className="order-store">
                        <p><strong>Store Name:</strong> {order.store}</p>
                    </div>
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
