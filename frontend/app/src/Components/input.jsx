import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InputForm({ onSignupNavigate, onLoginNavigate, isSignupMode, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(isSignupMode || false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsSignUp(isSignupMode || false);
    }, [isSignupMode]);

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        try {
            // Use configured API base and call the recipe-mounted auth endpoints
            const endpoint = isSignUp ? "/recipe/signup" : "/recipe/login";
            console.log("Attempting to connect to:", `${API_URL}${endpoint}`);

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            console.log("Response status:", response.status);

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (response.ok) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('email', email);
                    localStorage.setItem('password', password);
                    if (data.user && (data.user._id || data.user.id)) {
                        localStorage.setItem('userId', data.user._id || data.user.id);
                        console.log('User ID stored:', data.user._id || data.user.id);
                    } else {
                        console.log('No user id in response');
                    }
                    alert(isSignUp ? "Account created successfully!" : "Login successful!");
                    setEmail("");
                    setPassword("");
                    if (onLoginSuccess && !isSignUp) {
                        onLoginSuccess();
                    } else {
                        navigate('/');
                    }
                } else {
                    setError("Authentication succeeded but no token returned by server.");
                }
            } else {
                // Server returned an error status
                const serverMessage = data.error || data.message || `Server error: ${response.status} ${response.statusText}`;
                setError(serverMessage);
                console.error("Server error response:", serverMessage, data);
            }
        } catch (err) {
            console.error("Network error:", err);
            if (!navigator.onLine) {
                setError("You appear to be offline. Check your internet connection.");
            } else if (err.message && err.message.includes('Failed to fetch')) {
                setError("Cannot connect to server. Please make sure the backend is running at " + API_URL);
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="form" onSubmit={handleOnSubmit}>
            <div className="form-control">
                <label>Email</label>
                <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="form-control">
                <label>Password</label>
                <input
                    type="password"
                    className='input'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <button type='submit' disabled={isLoading}>
                {isLoading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
            </button><br/>
            {(error !== "") && <h6 className='error'>{error}</h6>}<br/>
            <div className="toggle-container">
                <p
                    onClick={() => {
                        if (isSignUp) {
                            if (onLoginNavigate) onLoginNavigate();
                            else setIsSignUp(false);
                        } else {
                            if (onSignupNavigate) onSignupNavigate();
                            else setIsSignUp(true);
                        }
                    }}
                    style={{ cursor: 'pointer', color: '#ff5703', marginTop: '1rem' }}
                >
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </p>
            </div>
        </form>
    );
}