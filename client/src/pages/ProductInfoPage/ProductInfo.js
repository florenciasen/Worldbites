import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // useParams to get productId from URL
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar/Navbar';
import Cartlogo from '../../assets/cartlogo.svg';
import './ProductInfo.css';

export default function ProductInfo() {
    const { id } = useParams(); // Get productId from URL params
    const [productInfo, setProductInfo] = useState(null);
    const [quantity, setQuantity] = useState(1); // State for quantity

    const fetchProductInfo = async () => {
        try {
            const response = await axios.get(`http://localhost:3011/productinfo/${id}`);
            setProductInfo(response.data);
        } catch (error) {
            console.error('Error fetching product info:', error);
            toast.error('Error fetching product information.');
        }
    };

    useEffect(() => {
        fetchProductInfo();
    }, [id]);

    if (!productInfo) return <div>Loading...</div>;

    const { product, store, batch } = productInfo;

    // Function to handle quantity increase
    const increaseQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    // Function to handle quantity decrease
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    return (
        <div className="container-productinfo">
            <Navbar />

            <div className="product-info-container">
                {/* Product Image */}
                <div className="product-image-container">
                    <img src={`http://localhost:3011/uploads/${product.imageUrl}`} alt={product.name} className="product-image" />
                </div>

                {/* Product Details */}
                <div className="product-details-container">
                    <h2 className="product-title">{product.name}</h2>

                    {/* Store Reviews */}
                    <div className="product-reviews">
                        <img src={`http://localhost:3011/uploads/${store.profilePicture}`} alt="Store" className="store-profile-picture" />
                        <div className='store-name-rating-container'>
                                <span>{store.name}</span>
                            <div className="store-rating">
                                <div className="rating-stars-container">
                                    <span className="rating-star">⭐</span>
                                    <span className="rating-star">⭐</span>
                                    <span className="rating-star">⭐</span>
                                    <span className="rating-star">⭐</span>
                                    <span className="rating-star">⭐</span>
                                </div>
                                <span className="rating">5.0</span>
                            </div>
                        </div>
                    </div>


                    {/* Product Description */}
                    <div className="product-description">
                        <p><strong></strong> {product.brand}, {product.category}</p>
                        <p><strong>Details:</strong></p>
                        <p className="product-details-text">{product.details}</p>
                        {batch && (
                            <p><strong>Pre-Order:</strong> {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}</p>
                        )}
                    </div>

                    {/* Product Price */}
                    <div className="product-price">
                        <h3>IDR {product.price}</h3>
                    </div>

                    {/* Quantity Selector and Buy Now Button */}
                    <div className="buy-section">
                        <div className="quantity-selector">
                            <button className="decrease-quantity" onClick={decreaseQuantity}>-</button>
                            <span className="quantity">{quantity}</span>
                            <button className="increase-quantity" onClick={increaseQuantity}>+</button>
                        </div>
                    </div>

                    <div className="buybutton-cart">
                        <button className="buy-now-button">BUY NOW</button>
                        <img src={Cartlogo} alt="Add to Cart" className="cart-logo" />
                    </div>
                </div>
            </div>

            <ToastContainer
                position='top-center'
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
