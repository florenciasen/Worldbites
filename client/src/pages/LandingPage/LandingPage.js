import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LandingPage.css';
import Navbar from '../../components/Navbar/Navbar';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 
import Carousel1 from '../../assets/Carousel1.svg'; 
import Carousel2 from '../../assets/Carousel2.svg';
import Carousel3 from '../../assets/Carousel3.svg';
import Carousel4 from '../../assets/Carousel4.svg';
import { useNavigate } from 'react-router-dom';
import { Loading } from '@carbon/react';

export default function LandingPage() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // State for the search input
    const [loading, setLoading] = useState(false); // For loading state

    const navigate = useNavigate();

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3011/getallproducts');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching all products:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = async (query) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3011/search', { query });
            setProducts(response.data); // Set the results based on the search
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllProducts(); // Fetch all products initially
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            searchProducts(query); // Call search API with dynamic input as the user types
        } else {
            fetchAllProducts(); // Reset to all products if query is cleared
        }
    };

    const handleProductDescription = (productId) => {
        navigate(`/productinfo/${productId}`);
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    const displayedProducts = products.slice(0, 7);

    return (
        <div className='container'>
            <Navbar />
            <div className='search-container'>
                <button className="filter-button">Filter</button>
                <div className="searchbar">
                    <input
                        type="text"
                        className="search__input"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearch} // Handle dynamic input changes
                    />
                </div>
            </div>

            {loading ? (
                <Loading active={true} description="Loading products..." withOverlay={true} />
            ) : (
                <>
                    <div className="carousel-container">
                        <Slider {...settings}>
                            <div className="carousel-slide">
                                <img src={Carousel1} alt="Slide 1" />
                            </div>
                            <div className="carousel-slide">
                                <img src={Carousel2} alt="Slide 2" />
                            </div>
                            <div className="carousel-slide">
                                <img src={Carousel3} alt="Slide 3" />
                            </div>
                            <div className="carousel-slide">
                                <img src={Carousel4} alt="Slide 4" />
                            </div>
                        </Slider>
                    </div>

                    <div className='product-container'>
                        {displayedProducts.length > 0 && (
                            displayedProducts.map(product => (
                                <div key={product._id} className="product-box1" onClick={() => handleProductDescription(product._id)}>
                                    <img 
                                        src={`http://localhost:3011/uploads/${product.imageUrl}`} 
                                        alt={product.name} 
                                        className="product-image1" 
                                    />
                                    <div className="product-info">
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-price">Rp {product.price}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
