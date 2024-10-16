import './Cart.css';
import Navbar from '../../components/Navbar/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react'; // Import React and useState, useEffect
import axios from 'axios'; // Make sure to install axios for API requests

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [checkedItems, setCheckedItems] = useState([]); // State for checked items

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await axios.get('http://localhost:3011/getcart', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust if you're using a different storage method
                    },
                });
                setCartItems(response.data);
                // Set checked items to all IDs of the fetched cart items by default
                setCheckedItems(response.data.map(item => item._id));
            } catch (error) {
                console.error('Error fetching cart items:', error);
                toast.error('Failed to fetch cart items');
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchCartItems();
    }, []); // Empty dependency array to run once on mount

    // Calculate total price based on checked items
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            if (checkedItems.includes(item._id)) { // Check if item is checked
                return total + item.price * item.quantity;
            }
            return total;
        }, 0);
    };

    // Handle quantity change
    const updateQuantity = async (id, action) => {
        const updatedQuantity = action === 'increase' 
            ? cartItems.find(item => item._id === id).quantity + 1 
            : Math.max(cartItems.find(item => item._id === id).quantity - 1, 1);

        // Update cart items in state
        setCartItems((prevItems) => 
            prevItems.map((item) => 
                item._id === id 
                    ? { ...item, quantity: updatedQuantity }
                    : item
            )
        );

        // Send the updated quantity to the server
        try {
            await axios.put(`http://localhost:3011/updatecartquantity/${id}`, { quantity: updatedQuantity }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success('Quantity updated successfully');
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (id) => {
        setCheckedItems((prevCheckedItems) => {
            if (prevCheckedItems.includes(id)) {
                return prevCheckedItems.filter(itemId => itemId !== id);
            } else {
                return [...prevCheckedItems, id];
            }
        });
    };

    // Remove item handler
    const removeItem = async (id) => {
        try {
            await axios.delete(`http://localhost:3011/cart/remove/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
    
            // Remove item from state
            setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
            setCheckedItems((prevCheckedItems) => prevCheckedItems.filter(itemId => itemId !== id));
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing item from cart:', error);
            toast.error('Failed to remove item from cart');
        }
    };
    
    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

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
                    {cartItems.map((item) => (
                        <div key={item._id} className="cart-item">
                            <div className="cart-product">
                                <input
                                    className="checkbox"
                                    type="checkbox"
                                    onChange={() => handleCheckboxChange(item._id)} // Handle checkbox change
                                    checked={checkedItems.includes(item._id)} // Check if item is checked
                                />
                                <img src={`http://localhost:3011/uploads/${item.imageUrl}`}
                                alt="Product" />
                            </div>
                            <div className='product-info-cart'>
                                <div className="product-details">
                                    <p>{item.name}</p>
                                    <button className="remove-btn" onClick={() => removeItem(item._id)}>Remove</button>
                                </div>
                                <div className='price-quantity-total'>
                                    <p className="cart-price">IDR {item.price.toLocaleString()}</p>
                                    <div className="quantity-selector-cart">
                                        <button className="decrease-quantity" onClick={() => updateQuantity(item._id, 'decrease')}>-</button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button className="increase-quantity" onClick={() => updateQuantity(item._id, 'increase')}>+</button>
                                    </div>
                                    <p className="cart-total">IDR {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="cart-summary">
                        <p>Total: IDR {calculateTotalPrice().toLocaleString()}</p>
                        <button className="checkout-btn">CHECKOUT</button>
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
