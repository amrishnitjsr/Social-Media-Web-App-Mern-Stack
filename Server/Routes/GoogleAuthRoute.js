const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Google OAuth login
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { email: req.user.email, id: req.user._id },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`http://localhost:3000/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
);

// Google token verification (for client-side Google login)
router.post('/google/verify', async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Verify Google token
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, given_name, family_name, picture } = payload;

        // Check if user exists
        const UserModel = require('../Models/userModel');
        let user = await UserModel.findOne({ 
            $or: [
                { googleId: googleId },
                { email: email }
            ]
        });

        if (user) {
            // Update Google ID if not present
            if (!user.googleId) {
                user.googleId = googleId;
                user.isGoogleUser = true;
                if (!user.profilePicture) user.profilePicture = picture;
                await user.save();
            }
        } else {
            // Create new user
            user = new UserModel({
                googleId: googleId,
                firstname: given_name,
                lastname: family_name,
                email: email,
                profilePicture: picture,
                password: 'google_auth_user',
                isGoogleUser: true
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );

        res.status(200).json({ user, token });
    } catch (error) {
        console.error('Google verification error:', error);
        res.status(400).json({ message: 'Google authentication failed', error: error.message });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

module.exports = router;