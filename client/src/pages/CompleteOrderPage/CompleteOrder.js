import React, { useState } from 'react';
import './CompleteOrder.css'; 
import Navbar from '../../components/Navbar/Navbar';

export default function CompleteOrder() {
    const [trackingNumbers, setTrackingNumbers] = useState(['TRK123456', 'TRK987654']); // Initialize with pre-filled tracking numbers
    const [isCompleted, setIsCompleted] = useState([true, true]); // Track completion status for each order

    const handleInputChange = (index, value) => {
        const newTrackingNumbers = [...trackingNumbers];
        newTrackingNumbers[index] = value;
        setTrackingNumbers(newTrackingNumbers);
    };

    return (
        <div className='container-completeorder'>
            <Navbar />
            <div className='order-wrapper'>
                <h2 className='order-title'>Complete Order</h2>

                {/* Order 1 */}
                <div className='order-details'>
                    <div className='product-info-completeorder'>
                        <img 
                            src="https://example.com/stitch-plush.jpg" 
                            alt="Stitch Attacks Snacks Plush" 
                            className='product-image-completeorder'
                        />
                        <div className='product-description-complete'>
                            <h3>Stitch Attacks Snacks Plush – Candy Apple</h3>
                            <p>IDR 550.000</p>
                        </div>
                    </div>
                    
                    <div className='info-and-tracking-completerorder'>
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
                        <label htmlFor='tracking-number-1'><strong>Tracking Number:</strong></label>
                        <input 
                            type='text' 
                            id='tracking-number-1' 
                            value={trackingNumbers[0]}
                            onChange={(e) => handleInputChange(0, e.target.value)}
                            placeholder='Enter tracking number'
                            readOnly // Make the input read-only
                        />
                        {isCompleted[0] && (
                            <span className='completed-message'>Completed</span>
                        )}
                    </div>
                </div>

                {/* Space Between Orders */}
                <div style={{ margin: '20px 0' }}></div>

                {/* Order 2 */}
                <div className='order-details'>
                    <div className='product-info-completeorder'>
                        <img 
                            src="https://example.com/another-product.jpg" 
                            alt="Another Product" 
                            className='product-image-completeorder'
                        />
                        <div className='product-description-complete'>
                            <h3>Another Product Title</h3>
                            <p>IDR 750.000</p>
                        </div>
                    </div>
                    
                    <div className='info-and-tracking-completerorder'>
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
                        <label htmlFor='tracking-number-2'><strong>Tracking Number:</strong></label>
                        <input 
                            type='text' 
                            id='tracking-number-2' 
                            value={trackingNumbers[1]}
                            onChange={(e) => handleInputChange(1, e.target.value)}
                            placeholder='Enter tracking number'
                            readOnly // Make the input read-only
                        />
                        {isCompleted[1] && (
                            <span className='completed-message'>Completed</span>
                        )}
                    </div>
                </div>

                {/* Single Divider Below Orders */}
                <hr className='order-divider' />
            </div>
        </div>
    );
}
