import './Cart.css';
import Navbar from '../../components/Navbar/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react'; // Import React and useState

export default function Cart() {
    // Declare the state inside the component function
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    return (
        <div className="container-cart">
            <Navbar />
            <div className="cart-content">
                <h2 className="cart-title">CART</h2>
                <div className="cart-table">
                    <div className="cart-header">

                        <div className='Product'>
                            <span>Product</span>
                        </div>

                        <div className='price-quantity-total-header'>
                            <span>Price</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>
                    </div>
                    <div className="cart-item">
                        <div className="cart-product">
                            {/* Checkbox with state */}
                            <input
                                className="checkbox"
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                            />
                            <img src="https://via.placeholder.com/80" alt="Product" />
                        </div>


                        <div className='product-info-cart'>
                            <div className="product-details">
                                <p>Stitch Attacks Snacks Plush — Candy Apple</p>
                                <button className="remove-btn">Remove</button>
                            </div>

                        <div className='price-quantity-total'>
                            <p className="cart-price">IDR 550.000</p>
                            <div className="quantity-selector-cart">
                                <button className="decrease-quantity">-</button>
                                <span className="quantity">1</span>
                                <button className="increase-quantity">+</button>
                            </div>
                            <p className="cart-total">IDR 550.000</p>
                        </div>
                        </div>
                    </div>
                    <div className="cart-summary">
                        <p>Total: IDR 550.000</p>
                        <button className="checkout-btn">CHECKOUT</button>
                    </div>
                </div>
            </div>

            <ToastContainer
                position='bottom-center'
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
