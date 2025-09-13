import React from "react";
import InputForm from "./input";

export default function Model({ isOpen, onClose, isSignupMode, onSignupNavigate, onLoginNavigate, onLoginSuccess }) {
    if (!isOpen) return null;
    
    const handleModalClick = (e) => {
        // Prevent the modal from closing when clicking inside the modal content
        e.stopPropagation();
    }
    
    return (
        <>
            <div className="backdrop" onClick={onClose}>
                <dialog className="Model" open onClick={handleModalClick}>
                    <div className="modal-left">
                        <div className="logo">🍽️</div>
                        <h2>রকমারি রান্না</h2>
                        <p>
                            {isSignupMode 
                                ? "ধন্যবাদ! দয়া করে আপনার account sign up করুন, আর বিভিন্ন ধরনের রান্না উপভোগ করুন.." 
                                : "ধন্যবাদ! দয়া করে আপনার account sign in করুন, আর বিভিন্ন ধরনের রান্না উপভোগ করুন.."
                            }
                        </p>
                    </div>
                    <div className="modal-right">
                        <button className="close-btn" onClick={onClose}>&times;</button>
                        <h1>{isSignupMode ? "Create Account" : "Authentication"}</h1>
                        <InputForm 
                            onSignupNavigate={onSignupNavigate}
                            onLoginNavigate={onLoginNavigate}
                            isSignupMode={isSignupMode}
                            onLoginSuccess={onLoginSuccess}
                        />
                    </div>
                </dialog>
            </div>
        </>
    );
}