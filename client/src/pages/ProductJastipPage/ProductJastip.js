import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductJastip.css';
import Navbar from '../../components/Navbar/Navbar';

export default function ProductJastip() {
    const [storeName, setStoreName] = useState(''); // State untuk menyimpan storeName


    const fetchStoreData = async () => {
        try {
            const response = await axios.get('http://localhost:3011/joinjastip/me', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Autentikasi menggunakan token
                }
            });
            setStoreName(response.data.storeName); // Simpan storeName dari response ke state
        } catch (error) {
            console.error('Error fetching store data:', error); // Tangani error jika ada
        }
    };
    
    useEffect(() => {
        fetchStoreData(); // Ambil data toko saat komponen dimuat
    }, []);

    return (
        <div className='container-productjastip'>
            <Navbar />
            <div className="store-name">
                    <h2>{storeName ? storeName : 'Loading...'}</h2> {/* Tampilkan store name */}
                </div>
            <div className="content-wrapper">
                <div className="left-container">
                    <h2>Product</h2>
                    <p>Isi konten untuk produk di sini...</p>
                </div>
                <div className="right-container">
                    <h2>Batch</h2>
                    <p>Isi konten untuk batch di sini...</p>
                </div>
            </div>
        </div>
    );
}
