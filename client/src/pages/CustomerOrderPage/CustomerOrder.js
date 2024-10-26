import React, { useState } from 'react';
import './CustomerOrder.css'; 
import Navbar from '../../components/Navbar/Navbar';

export default function CustomerOrder() {
    const [trackingNumbers, setTrackingNumbers] = useState(['', '']); // Initialize with two empty strings for two orders
    const [isSubmitted, setIsSubmitted] = useState([false, false]); // Track submission status for each order

    const handleInputChange = (index, value) => {
        const newTrackingNumbers = [...trackingNumbers];
        newTrackingNumbers[index] = value;
        setTrackingNumbers(newTrackingNumbers);
    };

    const handleSubmit = (index) => {
        alert(`Tracking Number Submitted: ${trackingNumbers[index]}`);
        const newIsSubmitted = [...isSubmitted];
        newIsSubmitted[index] = true; // Mark this order as submitted
        setIsSubmitted(newIsSubmitted);
        const newTrackingNumbers = [...trackingNumbers];
        newTrackingNumbers[index] = ''; // Clear the input after submission
        setTrackingNumbers(newTrackingNumbers);
    };

    return (
        <div className='container-customerorder'>
            <Navbar />
            <div className='order-wrapper'>
                <h2 className='order-title'>Customer Order</h2>

                {/* Order 1 */}
                <div className='order-details'>
                    <div className='product-info-customerorder'>
                        <img 
                            src="https://example.com/stitch-plush.jpg" 
                            alt="Stitch Attacks Snacks Plush" 
                            className='product-image'
                        />
                        <div className='product-description'>
                            <h3>Stitch Attacks Snacks Plush – Candy Apple</h3>
                            <p>IDR 550.000</p>
                        </div>
                    </div>
                    
                    <div className='info-and-tracking'>
                        <div className='customer-info'>
                            <p><strong>Name:</strong> Michelle</p>
                            <p><strong>Phone Number:</strong> 0821231231234</p>
                            <p><strong>Address:</strong> Jalan Wonocolo no. 20, Kuningan, 
                                Kota Jakarta Selatan, DKI Jakarta, 12950</p>
                            <p><strong>Shipping:</strong> JNT Express</p>
                            <p><strong>Total Payment:</strong> IDR 561.000</p>
                        </div>
                    </div>
                    
                    {/* Tracking Input Section for Order 1 */}
                    <div className='tracking-input'>
                        <label htmlFor='tracking-number-1'><strong>Input Tracking Number:</strong></label>
                        <input 
                            type='text' 
                            id='tracking-number-1' 
                            value={trackingNumbers[0]}
                            onChange={(e) => handleInputChange(0, e.target.value)}
                            placeholder='Enter tracking number'
                        />
                        {!isSubmitted[0] && trackingNumbers[0] && (
                            <button 
                                className='completed-button' 
                                onClick={() => handleSubmit(0)}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>

                {/* Space Between Orders */}
                <div style={{ margin: '20px 0' }}></div>

                {/* Order 2 */}
                <div className='order-details'>
                    <div className='product-info-customerorder'>
                        <img 
                            src="https://example.com/another-product.jpg" 
                            alt="Another Product" 
                            className='product-image'
                        />
                        <div className='product-description'>
                            <h3>Another Product Title</h3>
                            <p>IDR 750.000</p>
                        </div>
                    </div>
                    
                    <div className='info-and-tracking'>
                        <div className='customer-info'>
                            <p><strong>Name:</strong> John</p>
                            <p><strong>Phone Number:</strong> 081234567890</p>
                            <p><strong>Address:</strong> Jalan Raya no. 1, Kuningan, 
                                Jakarta, 12950</p>
                            <p><strong>Shipping:</strong> JNE</p>
                            <p><strong>Total Payment:</strong> IDR 800.000</p>
                        </div>
                    </div>
                    
                    {/* Tracking Input Section for Order 2 */}
                    <div className='tracking-input'>
                        <label htmlFor='tracking-number-2'><strong>Input Tracking Number:</strong></label>
                        <input 
                            type='text' 
                            id='tracking-number-2' 
                            value={trackingNumbers[1]}
                            onChange={(e) => handleInputChange(1, e.target.value)}
                            placeholder='Enter tracking number'
                        />
                        {!isSubmitted[1] && trackingNumbers[1] && (
                            <button 
                                className='completed-button' 
                                onClick={() => handleSubmit(1)}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>

                {/* Single Divider Below Orders */}
                <hr className='order-divider' />
            </div>
        </div>
    );
}
