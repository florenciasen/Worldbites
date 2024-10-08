import React, { useState, useEffect } from 'react';
import './Otp.css'; // Assuming you will create a CSS file for styling
import { useNavigate, useLocation } from 'react-router-dom';

export default function OTPPage() {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60); // Countdown timer starts at 60 seconds
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || ''; // Accessing the passed email

    // Handle OTP input change
    const handleChange = (element, index) => {
        let value = element.value;
        if (value.length <= 1) {
            let newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to the next input field if a number is entered
            if (value !== '' && index < 3) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }

            // Move to the previous input field if the number is removed
            if (value === '' && index > 0) {
                document.getElementById(`otp-input-${index - 1}`).focus();
            }
        }
    };

    // Countdown logic for OTP resend button
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setIsResendDisabled(false);
        }

        return () => clearInterval(interval);
    }, [timer]);

    // Handle OTP submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        console.log('Submitted OTP:', otpValue);
        // You can add logic here to verify OTP
        navigate('/success'); // Redirect to the success page after verification
    };

    // Handle OTP Resend
    const handleResend = () => {
        setTimer(60);
        setIsResendDisabled(true);
        console.log('OTP Resent!');
        // Logic to resend the OTP
    };

    return (
        <div className='otp-wrapper'>
            <div className="otp-container">
                <h2 className='titleotp'>Email Verification</h2>
                <p>We have sent a code to your email {email}</p> {/* Display dynamic email */}
                <form onSubmit={handleSubmit}>
                    <div className="otp-inputs">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                id={`otp-input-${index}`}
                                type="text"
                                maxLength="1"
                                value={otp[index]}
                                onChange={(e) => handleChange(e.target, index)}
                                required
                            />
                        ))}
                    </div>
                    <button type="submit" className="verify-button">
                        Verify Account
                    </button>
                </form>
                <p>
                    {timer > 0 ? (
                        <span>Resend OTP in {timer} seconds</span>
                    ) : (
                        <span>
                            Didn’t receive the code?{' '}
                            <button
                                className="resend-button"
                                onClick={handleResend}
                                disabled={isResendDisabled}
                            >
                                Resend OTP
                            </button>
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}
