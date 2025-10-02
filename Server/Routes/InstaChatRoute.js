const express = require('express');
const InstaChat = require('../Models/InstaChat');
const InstaMessage = require('../Models/InstaMessage');
const router = express.Router();

// Get all chats for user
router.get('/:userId', async (req, res) => {
  const chats = await InstaChat.find({ members: req.params.userId });
  res.json(chats);
});

// Get messages for chat
router.get('/messages/:chatId', async (req, res) => {
  const messages = await InstaMessage.find({ chatId: req.params.chatId });
  res.json(messages);
});

// Create a new chat or group
router.post('/create', async (req, res) => {
  const { members, isGroup, groupName, groupAvatar } = req.body;
  let chat = await InstaChat.findOne({ members: { $all: members }, isGroup });
  if (!chat) {
    chat = await InstaChat.create({ members, isGroup, groupName, groupAvatar });
  }
  res.json(chat);
});

// Send a message (supports multipart/form-data)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/message', upload.single('image'), async (req, res) => {
  const chatId = req.body.chatId;
  const sender = req.body.sender;
  const text = req.body.text || '';
  let image = null;
  if (req.file) {
    image = req.file.filename;
  }
  const msg = await InstaMessage.create({ chatId, sender, text, image });
  await InstaChat.findByIdAndUpdate(chatId, { lastMessage: text || (image ? 'Photo' : ''), updatedAt: new Date() });
  res.json(msg);
});

// Block or unblock a user in a chat
router.post('/block', async (req, res) => {
  const { chatId, userId, block } = req.body;
  // Add or remove userId from blockedUsers array in InstaChat
  let chat = await InstaChat.findById(chatId);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  if (!chat.blockedUsers) chat.blockedUsers = [];
  if (block) {
    if (!chat.blockedUsers.includes(userId)) chat.blockedUsers.push(userId);
  } else {
    chat.blockedUsers = chat.blockedUsers.filter(id => id !== userId);
  }
  await chat.save();
  res.json({ success: true, blockedUsers: chat.blockedUsers });
});

// Clear all messages in a chat
router.delete('/messages/:chatId', async (req, res) => {
  await InstaMessage.deleteMany({ chatId: req.params.chatId });
  res.json({ success: true });
});

module.exports = router;
