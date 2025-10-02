import React, { useState } from 'react';
import './Auth.css';
import Logo from '../../Img/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { logIn, signUp } from '../../actions/AuthAction.js';

const AuthWithOTP = () => {
    const [isSignUp, setIsSignUp] = useState(true);
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.authReducer.loading);

    const [data, setData] = useState({ firstname: "", lastname: "", email: "", password: "", confirmpass: "" });
    const [confirmPass, setConfirmPass] = useState(true);
    
    // OTP-related states
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [authMessage, setAuthMessage] = useState("");

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const handlSubmit = (e) => {
        e.preventDefault();

        if (isSignUp) {
            if (!otpVerified) {
                setAuthMessage("Please verify your email with OTP first.");
                return;
            }
            data.password === data.confirmpass ? dispatch(signUp(data)) : setConfirmPass(false)
        } else {
            dispatch(logIn(data))
        }
    }

    const handleSendOtp = async () => {
        if (!data.email || !/^[\w.+-]+@gmail\.com$/.test(data.email)) {
            setAuthMessage('Please enter a valid Gmail address.');
            return;
        }
        try {
            const response = await fetch('http://localhost:4000/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email })
            });
            const result = await response.json();
            if (response.ok) {
                setOtpSent(true);
                setAuthMessage('OTP sent to your email.');
            } else {
                setAuthMessage(result.message || 'Failed to send OTP.');
            }
        } catch (err) {
            setAuthMessage('Failed to send OTP.');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await fetch('http://localhost:4000/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, otp })
            });
            const result = await response.json();
            if (response.ok) {
                setOtpVerified(true);
                setAuthMessage('Email verified! You can now sign up.');
            } else {
                setAuthMessage(result.message || 'Invalid OTP.');
            }
        } catch (err) {
            setAuthMessage('Invalid OTP.');
        }
    };

    const restForm = () => {
        setConfirmPass(true);
        setOtpSent(false);
        setOtp("");
        setOtpVerified(false);
        setAuthMessage("");

        setData({
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            confirmpass: ""
        })
    }

    return (
        <div className='Auth'>
            <div className="a-left">
                <img src={Logo} alt="" />
                <div className="Webname">
                    <h2>Welcome !</h2>
                    <h5>Explore the ideas throughout <br /> the world.</h5>
                </div>
            </div>

            <div className="a-right">
                <form className='infoForm authForm' onSubmit={handlSubmit}>
                    <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>

                    {isSignUp && (
                        <div>
                            <input type="text" placeholder='First Name'
                                className='infoInput' name='firstname'
                                onChange={handleChange}
                                value={data.firstname}
                            />
                            <input type="text" placeholder='Last Name'
                                className='infoInput' name='lastname'
                                onChange={handleChange}
                                value={data.lastname}
                            />
                        </div>
                    )}

                    <div>
                        <input type="email" placeholder='Email'
                            className='infoInput' name='email'
                            onChange={handleChange}
                            value={data.email}
                        />

                        <input type="password" placeholder='Password'
                            className='infoInput' name='password'
                            onChange={handleChange}
                            value={data.password}
                        />

                        {isSignUp && (
                            <>
                                <input type="password" placeholder='Confirm Password'
                                    className='infoInput' name='confirmpass'
                                    onChange={handleChange}
                                    value={data.confirmpass}
                                />

                                {/* OTP Verification Section */}
                                <div style={{ marginTop: "10px" }}>
                                    {!otpSent ? (
                                        <button type="button" className='button' 
                                                style={{ marginBottom: "10px" }}
                                                onClick={handleSendOtp} 
                                                disabled={!data.email}>
                                            Send OTP to Email
                                        </button>
                                    ) : (
                                        <div>
                                            <input type="text" placeholder='Enter OTP'
                                                className='infoInput'
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                            <button type="button" className='button' 
                                                    style={{ marginBottom: "10px" }}
                                                    onClick={handleVerifyOtp}
                                                    disabled={!otp}>
                                                Verify OTP
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Display auth messages */}
                    {authMessage && (
                        <span style={{ 
                            color: otpVerified ? "green" : "red", 
                            fontSize: "12px", 
                            textAlign: "center",
                            display: "block",
                            marginBottom: "10px"
                        }}>
                            {authMessage}
                        </span>
                    )}

                    <span style={{ 
                        display: confirmPass ? "none" : "block", 
                        color: "red", 
                        fontSize: "12px", 
                        alignSelf: "flex-end", 
                        marginRight: "5px" 
                    }}>
                        * Confirm Password is not same
                    </span>

                    <div>
                        <span style={{ fontSize: "12px", cursor: "pointer" }}
                            onClick={() => { setIsSignUp((prev) => !prev); restForm() }}
                        >
                            {isSignUp ? "Already have an account? Login here" : "Don't have an account? SignUp here"}
                        </span>
                    </div>

                    <button className='button infoButton' type='submit' disabled={loading}>
                        {loading ? "loading..." : isSignUp ? "Sign Up" : "Login"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AuthWithOTP;