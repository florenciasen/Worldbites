import React, { useState } from 'react';
import './ResetPassword.css'; 
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleResetPassword = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

    };

    return (
        <div className='container-reset-password'>
            <div className='reset-password-wrapper'>
                <h2>RESET PASSWORD</h2>
                <form className='reset-password-form' onSubmit={handleResetPassword}>
                    <div className='input-group'>
                        <label htmlFor='newPassword'>New Password <span className='required'>*</span></label>
                        <input 
                            type='password' 
                            id='newPassword' 
                            placeholder='Enter New Password' 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='confirmPassword'>Confirm Password <span className='required'>*</span></label>
                        <input 
                            type='password' 
                            id='confirmPassword' 
                            placeholder='Confirm Your New Password' 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type='submit' className='reset-password-button'>Confirm</button>
                </form>
            </div>
            <ToastContainer 
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}