const mongoose = require('mongoose');

const InstaMessageSchema = new mongoose.Schema({
  chatId: String,
  sender: String, // userId
  text: String,
  image: String, // image filename if present
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InstaMessage', InstaMessageSchema);
