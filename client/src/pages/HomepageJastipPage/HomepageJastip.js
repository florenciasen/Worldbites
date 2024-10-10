import React from 'react';
import './HomepageJastip.css'; 
import Navbar from '../../components/Navbar/Navbar';
import AddProductImage from '../../assets/addproduct.svg';
import CustomerOrderImage from '../../assets/customerorder.svg';
import OrderCompletedImage from '../../assets/ordercompleted.svg';
import NetIncomeImage from '../../assets/netincome.svg';
import { useNavigate } from 'react-router-dom';

export default function HomepageJastip() {
    const navigate = useNavigate();

    const handleProductJastip = () => {
        navigate('/productjastip'); 
    };



    return (
        <div className='container-homepagejastip'>
        <Navbar />
        
        {/* Container besar */}
        <div className='container-large'>
            <h2>Large Container</h2>
            <p>This is a large container at the top</p>
        </div>

        {/* 4 Container kecil */}
        <div className='container-small-wrapper'>
                <div className='container-small' onClick={() => handleProductJastip('/productjastip')}>
                    <img src={AddProductImage} alt="Add Product" className="small-container-image"/>
                    <h3>Add Product</h3>
                </div>
                <div className='container-small' >
                    <img src={CustomerOrderImage} alt="Customer Order" className="small-container-image"/>
                    <h3>Customer Order</h3>
                </div>
                <div className='container-small'>
                <img src={OrderCompletedImage} alt="Order Completed" className="order-completed-image"/>
                    <h3>Order Completed</h3>
                </div>
                <div className='container-small'>
                    <img src={NetIncomeImage} alt="Net Income" className="net-income-image"/>
                    <h3>Net Income</h3>
                </div>
            </div>
        </div>
    );
}