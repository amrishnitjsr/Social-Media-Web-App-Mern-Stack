const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('../Models/userModel');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists with Google ID
        let user = await UserModel.findOne({ googleId: profile.id });

        if (user) {
            // User exists, return user
            return done(null, user);
        } else {
            // Check if user exists with same email
            let existingUser = await UserModel.findOne({ email: profile.emails[0].value });
            
            if (existingUser) {
                // Link Google account to existing user
                existingUser.googleId = profile.id;
                existingUser.profilePicture = profile.photos[0].value;
                await existingUser.save();
                return done(null, existingUser);
            } else {
                // Create new user
                const newUser = new UserModel({
                    googleId: profile.id,
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    password: 'google_auth_user', // Placeholder password for Google users
                    isGoogleUser: true
                });
                
                const savedUser = await newUser.save();
                return done(null, savedUser);
            }
        }
    } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;