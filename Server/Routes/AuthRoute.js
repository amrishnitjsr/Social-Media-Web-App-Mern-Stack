const express = require('express');
const { loginUser, registerUser, sendOtp, verifyOtp } = require('../Controllers/AuthController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;


