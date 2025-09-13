import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

        
        const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        console.log('Starting signup process...');

        // Validation
        if (!email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
        
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                } catch {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
            }
        
            const data = await response.json();
            
            // Success handling - store token and navigate
            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log('✅ Signup successful!');
                navigate('/');
            } else {
                setError("Signup successful but no token received. Please try logging in.");
            }
        } catch (error) {
            console.error("❌ Signup error:", error);
            if (!navigator.onLine) {
                setError("You appear to be offline. Please check your internet connection.");
            } else if (error.message.includes("Failed to fetch")) {
                setError("Cannot connect to the server. Please ensure the backend server is running.");
            } else {
                setError(error.message || "An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        };
    };

    const handleClose = () => {
        navigate('/');
    };

    return (
        <>
            <div className="backdrop" onClick={handleClose}>
                <dialog className="Model" open>
                    <div className="modal-left">
                        <div className="logo">🍽️</div>
                        <h2>রকমারি রান্না</h2>
                        <p>ধন্যবাদ! দয়া করে আপনার account sign up করুন, আর বিভিন্ন ধরনের রান্না উপভোগ করুন..</p>
                    </div>
                    <div className="modal-right">
                        <button className="close-btn" onClick={handleClose}>&times;</button>
                        <h1>Create Account</h1>
                        <form onSubmit={handleSignup}>
                            <div className="form-control">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    className="input" 
                                    value={email}
                                    onChange={(e)=>setEmail(e.target.value)} 
                                    placeholder="Enter your email"
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
                                    onChange={(e)=>setPassword(e.target.value)} 
                                    placeholder="Create a password"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="form-control">
                                <label>Confirm Password</label>
                                <input 
                                    type="password" 
                                    className='input' 
                                    value={confirmPassword}
                                    onChange={(e)=>setConfirmPassword(e.target.value)} 
                                    placeholder="Confirm your password"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <button type='submit' disabled={isLoading}>
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </button>
                            {(error !== "") && <h6 className='error'>{error}</h6>}
                            <p 
                                onClick={() => {
                                    // Navigate to home first, then trigger login modal
                                    navigate('/');
                                    // Use setTimeout to ensure navigation completes before triggering modal
                                    setTimeout(() => {
                                        // Find and click the login button to open the modal
                                        const loginBtn = document.querySelector('.login');
                                        if (loginBtn) {
                                            loginBtn.click();
                                        }
                                    }, 100);
                                }} 
                                style={{cursor: 'pointer', color: '#3b82f6'}}
                            >
                                Already have an account? Sign In
                            </p>
                        </form>
                    </div>
                </dialog>
            </div>
        </>
    );
}

