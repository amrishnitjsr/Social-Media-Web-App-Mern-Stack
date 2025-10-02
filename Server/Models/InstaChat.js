const mongoose = require('mongoose');

const InstaChatSchema = new mongoose.Schema({
  members: [String], // userIds
  isGroup: { type: Boolean, default: false },
  groupName: String,
  groupAvatar: String,
  lastMessage: String,
  updatedAt: { type: Date, default: Date.now },
  blockedUsers: [String] // userIds who are blocked in this chat
});

module.exports = mongoose.model('InstaChat', InstaChatSchema);
