import React, { useState } from 'react';
import axios from 'axios';

const SignupWithOtp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendOtp = async () => {
    if (!/^\w+([.-]?\w+)*@gmail\.com$/.test(email)) {
      setMessage('Please enter a valid Gmail address.');
      return;
    }
    try {
      await axios.post('/api/auth/send-otp', { email });
      setOtpSent(true);
      setMessage('OTP sent to your email.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      setOtpVerified(true);
      setMessage('Email verified! You can now sign up.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid OTP.');
    }
  };

  const handleSignup = async () => {
    if (!otpVerified) {
      setMessage('Please verify your email with OTP first.');
      return;
    }
    try {
      await axios.post('/api/auth/register', { email, password });
      setMessage('Signup successful!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 24 }}>
      <h2>Signup with Email & OTP</h2>
      <input
        type="email"
        placeholder="Enter Gmail address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
        disabled={otpSent}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
        disabled={otpSent}
      />
      {!otpSent ? (
        <button onClick={handleSendOtp} style={{ width: '100%', padding: 8 }}>Send OTP</button>
      ) : !otpVerified ? (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
          <button onClick={handleVerifyOtp} style={{ width: '100%', padding: 8 }}>Verify OTP</button>
        </>
      ) : (
        <button onClick={handleSignup} style={{ width: '100%', padding: 8 }}>Sign Up</button>
      )}
      {message && <div style={{ marginTop: 16, color: 'red' }}>{message}</div>}
    </div>
  );
};

export default SignupWithOtp;
