import React, { useState, useEffect } from "react";
import Model from "./model";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar(){
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isSignupMode, setIsSignupMode] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
           // Check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const authenticated = !!token;
            console.log('Navbar - Auth check - Token exists:', authenticated, 'Token value:', token);
            setIsAuthenticated(authenticated);
        };
        
        // Check immediately
        checkAuth();
        
        // Check on window focus (in case user logs in elsewhere)
        const handleFocus = () => {
            console.log('Window focused - checking auth');
            checkAuth();
        };
        
        window.addEventListener('focus', handleFocus);
        
        // Check periodically (every 5 seconds) to catch any auth changes
        const interval = setInterval(() => {
            checkAuth();
        }, 5000);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, []);
    
    const checkLogin = () => {
        console.log('Opening login modal');
        setIsSignupMode(false); // Start with login mode
        setIsOpen(true);
    }
    
    const closeModel = () => {
        console.log('Closing modal');
        setIsOpen(false);
    }
    
    const handleSignupNavigate = () => {
        // Switch to signup mode in the same modal
        setIsSignupMode(true);
    }
    
    const handleLoginNavigate = () => {
        // Switch back to login mode in the same modal
        setIsSignupMode(false);
    }
    
    // Logout function
    const handleLogout = () => {
        console.log('Logging out user');
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('userId');
        
        // Update authentication state
        setIsAuthenticated(false);
        
        // Show success message
        alert('You have been logged out successfully!');
        
        // Redirect to home page
        navigate('/');
    };
    
             // Handle login success callback
    const handleLoginSuccess = () => {
        console.log('Login success callback triggered in Navbar - closing modal');
        
        // Close modal immediately
        setIsOpen(false);
        console.log('Modal state set to false');
        
        // Force immediate re-check of authentication
        const token = localStorage.getItem('token');
        const authenticated = !!token;
        console.log('Setting authenticated state to:', authenticated);
        setIsAuthenticated(authenticated);

        // Also re-check after a short delay to ensure token is properly stored
        setTimeout(() => {
            const updatedToken = localStorage.getItem('token');
            const updatedAuth = !!updatedToken;
            console.log('Delayed auth check - Token:', updatedToken, 'Authenticated:', updatedAuth);
            setIsAuthenticated(updatedAuth);
        }, 100);
    };
    
    // Handle protected navigation for "আমার রান্না"
    const handleMyRecipesClick = () => {
        console.log('আমার রান্না clicked');
        
        if (isAuthenticated) {
            console.log('User is authenticated, navigating to /my-recipes');
            navigate('/my-recipes');
        } else {
            console.log('User not authenticated, showing login modal');
            checkLogin();
        }
    }
    
    // Handle protected navigation for "তোমার পছন্দ"
    const handleFavoritesClick = () => {
        console.log('তোমার পছন্দ clicked');
        
        if (isAuthenticated) {
            console.log('User is authenticated, navigating to /favorites');
            navigate('/favorites');
        } else {
            console.log('User not authenticated, showing login modal');
            checkLogin();
        }
    }
    
    return(
        <>
        <header>
            <h2>রকমারি রান্না</h2>
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li>
                    <span 
                        onClick={handleMyRecipesClick}
                        style={{cursor: 'pointer', display: 'block', padding: '8px 16px'}}
                    >
                        আমার রান্না
                    </span>
                </li>
                <li>
                    <span 
                        onClick={handleFavoritesClick}
                        style={{cursor: 'pointer', display: 'block', padding: '8px 16px'}}
                    >
                        তোমার পছন্দ
                    </span>
                </li>
                <li>
                    {console.log('Rendering auth button - isAuthenticated:', isAuthenticated)}
                    {isAuthenticated ? (
                        <span
                            onClick={handleLogout}
                            style={{
                                cursor: 'pointer',
                                display: 'block',
                                padding: '8px 16px',
                                color: '#FFFFFF',
                                fontWeight: 'normal',
                                fontSize: '16px',
                                textAlign: 'center'
                            }}
                        >
                            Logout
                        </span>
                    ) : (
                        <span
                            onClick={checkLogin}
                            style={{
                                cursor: 'pointer',
                                display: 'block',
                                padding: '8px 16px',
                                fontSize: '16px',
                                textAlign: 'center'
                            }}
                        >
                            Login
                        </span>
                    )}
                </li>
            </ul>
        </header>
               {/* Debug info - remove this after testing */}
               <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
        }}>
            Auth State: {isAuthenticated ? 'Logged In' : 'Logged Out'}<br/>
            Token: {localStorage.getItem('token') ? 'Present' : 'None'}<br/>
            Modal Open: {isOpen ? 'Yes' : 'No'}
        </div>
        {console.log('Navbar rendering - isAuthenticated:', isAuthenticated, 'isOpen:', isOpen)}
        
        {/* Only render modal if isOpen is true */}
        {isOpen && (
            <Model 
                isOpen={isOpen} 
                onClose={closeModel} 
                isSignupMode={isSignupMode}
                onSignupNavigate={handleSignupNavigate}
                onLoginNavigate={handleLoginNavigate}
                onLoginSuccess={handleLoginSuccess}
            />
        )}
        </>
    )
}
