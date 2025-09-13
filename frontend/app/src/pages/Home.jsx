import React from 'react';
import { useLoaderData } from 'react-router-dom';

export default function Home() {
    const _recipes = useLoaderData(); // Prefix with underscore to indicate intentionally unused
    
    return (
        <div className="home">
            <div className="left">
                <div className="title-container">
                    <img src="/src/assets/Foodrecipe.png" alt="Logo" className="title-logo" />
                    <h1>রকমারি রান্না</h1>
                </div>
                <h5>
                    Discover delicious recipes from around Bangladesh! 
                    From traditional Bengali dishes to modern fusion cuisine, 
                    find your next favorite meal.
                </h5>
                <button>Get Started</button>
            </div>
            
            <div className="right">
                <img src="/src/assets/Golda-chingri.jpg" alt="Delicious Food" />
            </div>
        </div>
    );
}
