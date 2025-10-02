const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    desc: String,
    likes: [String],
    image: String,
    comments: [
        {
            userId: String,
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

const postModel = mongoose.model('Posts', postSchema);
module.exports = postModel;