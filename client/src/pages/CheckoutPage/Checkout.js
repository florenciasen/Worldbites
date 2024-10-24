import { useState, useEffect } from 'react';
import axios from 'axios';
import './Checkout.css';
import Navbar from '../../components/Navbar/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
    const [userData, setUserData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [provinces, setProvinces] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [weight, setWeight] = useState('');
    const [courier, setCourier] = useState('jne');
    const [cost, setCost] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const Navigate = useNavigate();

    // Fetch user data and cart items on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3011/usercheckout', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                });
                setUserData(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    toast.error('Session expired. Please log in again.');
                    Navigate('/login');
                } else {
                    toast.error('Error fetching user data');
                }
            }
        };

        const fetchCartItems = async () => {
            try {
                const response = await axios.get('http://localhost:3011/getcart', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setCartItems(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    toast.error('Session expired. Please log in again.');
                    Navigate('/login');
                } else {
                    toast.error('Failed to fetch cart items');
                }
            }
        };

        fetchUserData();
        fetchCartItems();
    }, [Navigate]);

    // Fetch provinces and cities
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('http://localhost:3011/provinces', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setProvinces(response.data);
            } catch (error) {
                toast.error('Error fetching provinces');
            }
        };

        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            const fetchCities = async () => {
                try {
                    const response = await axios.get(`http://localhost:3011/cities/${selectedProvince}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    setCities(response.data);
                } catch (error) {
                    toast.error('Error fetching cities');
                }
            };

            fetchCities();
        }
    }, [selectedProvince]);

    // Calculate Subtotal, Admin Fee, and Total
    const calculateCartItemTotal = () => {
        return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    };

    const calculateAdminFee = () => {
        return calculateCartItemTotal() * 0.1;
    };

    const calculateFinalCheckoutTotal = () => {
        const shippingCost = cost ? cost[0].costs[0].cost[0].value : 0;
        return calculateCartItemTotal() + calculateAdminFee() + shippingCost;
    };

    // Function to handle cost calculation for shipping
    const handleCalculateShipping = async () => {
        try {
            const response = await axios.post('http://localhost:3011/ongkir', {
                origin: '457',
                destination: selectedCity,
                weight: parseInt(weight),
                courier: courier
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCost(response.data);
        } catch (error) {
            toast.error('Error calculating shipping cost');
        }
    };

    const cancelCheckout = () => {
        Navigate('/cart');
    }
    
    return (
        <div className='container-checkout'>
            <Navbar />

            <div className='checkout-content'>
                <div className='checkout-left'>

                    <div className="checkout-title-header">
                        <h2>Checkout</h2>
                    </div>

                    <div className="cart-table-checkout">
                        <div className="cart-header-checkout">
                            <div className="header-item"></div>
                            <div className="header-item">Product Name</div>
                            <div className="header-item">Price</div>
                            <div className="header-item">Quantity</div>
                            <div className="header-item">Total</div>
                        </div>
                        {cartItems.map(item => (
                            <div key={item._id} className="cart-item-checkout">
                                <div className="cart-image-checkout">
                                    <img src={`http://localhost:3011/uploads/${item.imageUrl}`} alt="Product" />
                                </div>
                                <div className="product-name-cart-checkout">
                                    <p>{item.name}</p>
                                </div>
                                <div className="cart-price">
                                    <p>IDR {item.price.toLocaleString()}</p>
                                </div>
                                <div className="quantity-selector-cart-checkout">
                                    <p className="quantity-checkout">{item.quantity}</p>
                                </div>
                                <div className="cart-total">
                                    <p>IDR {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        <div className='cart-total-checkout'>
                            {/* This will now correctly show the total price of the items in the cart */}
                            <p>Total: IDR {calculateCartItemTotal().toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Personal Information Fields */}
                    <div className='checkout-title'>
                        <label>Nama Lengkap</label>
                        <input type="text" value={userData.name} readOnly />
                    </div>
                    <div className='checkout-title'>
                        <label>Phone Number</label>
                        <input type="text" value={userData.phone} readOnly />
                    </div>
                    <div className='checkout-title'>
                        <label>Email</label>
                        <input type="email" value={userData.email} readOnly />
                    </div>
                    <div className='checkout-title'>
                        <label>Address</label>
                        <textarea rows="3" value={userData.address} readOnly></textarea>
                    </div>

                    {/* Province and City Dropdown */}
                    <div className='checkout-title'>
                        <label>Province</label>
                        <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                            <option value="">Select Province</option>
                            {provinces.map((province) => (
                                <option key={province.province_id} value={province.province_id}>
                                    {province.province}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='checkout-title'>
                        <label>City</label>
                        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince}>
                            <option value="">Select City</option>
                            {cities.map((city) => (
                                <option key={city.city_id} value={city.city_id}>
                                    {city.city_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Weight and Courier */}
                    <div className='checkout-title'>
                        <label>Weight (grams)</label>
                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Enter weight in grams" />
                    </div>

                    <div className='checkout-title'>
                        <label>Courier</label>
                        <select value={courier} onChange={(e) => setCourier(e.target.value)}>
                            <option value="jne">JNE</option>
                            <option value="pos">POS</option>
                            <option value="tiki">TIKI</option>
                        </select>
                    </div>

                    {/* Calculate Shipping Button */}
                    <div className='button-calculateshipping'>
                        <button onClick={handleCalculateShipping}>Calculate Shipping</button>
                    </div>

                    {/* Display Shipping Cost */}
                    {cost && (
                        <div className='shipping-cost'>
                            <p>Estimated Shipping Cost: IDR {cost[0].costs[0].cost[0].value.toLocaleString()}</p>
                            <p>Estimated Delivery Time: {cost[0].costs[0].cost[0].etd} days</p>
                        </div>
                    )}
                </div>

                {/* Checkout Summary on the Right */}
                <div className='checkout-right'>
                    <p>Subtotal: IDR {calculateCartItemTotal().toLocaleString()}</p>
                    <p>Shipping: {cost ? `IDR ${cost[0].costs[0].cost[0].value.toLocaleString()}` : 'Calculated after selection'}</p>
                    <p>Admin fee: IDR {calculateAdminFee().toLocaleString()}</p>
                    <hr />
                    <p>Total: IDR {calculateFinalCheckoutTotal().toLocaleString()}</p>

                    <div className='button-checkout-cancel'>
                        <button className='cancel-btn' onClick={cancelCheckout}>Cancel</button>
                        <button className='checkout-btn-page'>Checkout</button>
                    </div>

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
