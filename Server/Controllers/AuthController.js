const verifiedEmails = new Set();
const nodemailer = require('nodemailer');
const otpStore = {};

// Send OTP to Gmail
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    // Validate email format and domain
    const gmailRegex = /^[\w.+\-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        return res.status(400).json({ message: 'Email must be a valid gmail.com address.' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    // Send OTP using nodemailer
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`
        });
        res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP.', error });
    }
}

// Verify OTP
exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    if (otpStore[email] && otpStore[email] === otp) {
        delete otpStore[email];
        verifiedEmails.add(email);
        return res.status(200).json({ message: 'OTP verified.' });
    }
    res.status(400).json({ message: 'Invalid OTP.' });
}
const UserModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// register new users
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    let pass = password.toString();
    const hashedPass = await bcrypt.hash(pass, salt);
    req.body.password = hashedPass;
    const newUser = new UserModel(req.body);
    
    try {
        const oldUser = await UserModel.findOne({ email });
        if (oldUser) {
            return res.status(400).json({ message: "This User already exists!" })
        }
        const user = await newUser.save();
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Login users

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email: email });

        if (user) {
            const validity = await bcrypt.compare(password, user.password)

            if (!validity) {
                res.status(400).json("Sorry, Please enter the correct email or password!");
            } else {
                const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);
                res.status(200).json({ user, token });
            }
        } else {
            res.status(404).json("Sorry, Please enter the correct email or password!")
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}