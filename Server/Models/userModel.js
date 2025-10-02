const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    profilePicture: String,
    coverPicture: String,
    about: String,
    livesin: String,
    worksAt: String,
    country: String,
    relationship: String,
    followers: [String],
    following: [String],
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allow null values but ensure uniqueness when present
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const UserModel = mongoose.model('Users', UserSchema);
module.exports = UserModel;