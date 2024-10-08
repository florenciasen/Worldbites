import React from 'react';
import './LandingPage.css';
import Navbar from '../../components/Navbar/Navbar';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 
import Carousel1 from '../../assets/Carousel1.svg'; 
import Carousel2 from '../../assets/Carousel2.svg';
import Carousel3 from '../../assets/Carousel3.svg';
import Carousel4 from '../../assets/Carousel4.svg';


export default function LandingPage (){
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };


    return (

        <div className='container'>
             <Navbar />
             <div className='search-container'>
             <button className="filter-button">Filter</button>
                <div className="searchbar">
                    <input type="text" className="search__input" placeholder="Search..." />
                </div>
            </div>

             {/* Carousel */}
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





            
        </div>
    )

}