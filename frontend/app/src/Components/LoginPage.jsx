import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Model from './model';

export default function LoginPage() {
    const [showModal] = useState(true); // Removed setShowModal since it's not used
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            navigate('/');
        }
    }, [navigate]);

    const handleCloseModal = () => {
        navigate('/');
    };

    if (isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="login-page">
            <Model isOpen={showModal} onClose={handleCloseModal} />
        </div>
    );
}
