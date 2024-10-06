import React from 'react';
import './LandingPage.css';
import Navbar from '../../components/Navbar/Navbar';


export default function LandingPage (){

    return (

        <div className='container'>
             <Navbar />
             <div className='search-container'>
             <button className="filter-button">Filter</button>
                <div className="searchbar">
                    <input type="text" className="search__input" placeholder="Search..." />
                </div>
            </div>





            
        </div>
    )

}