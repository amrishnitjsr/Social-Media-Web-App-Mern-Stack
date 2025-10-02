const express = require('express');
const Chat = require('../Models/Chat');
const Message = require('../Models/Message');
const router = express.Router();

// Get all chats for user
router.get('/:userId', async (req, res) => {
  const chats = await Chat.find({ members: req.params.userId });
  res.json(chats);
});

// Get messages for chat
router.get('/messages/:chatId', async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId });
  res.json(messages);
});

// Create a new chat between two users
router.post('/create', async (req, res) => {
  const { userId1, userId2 } = req.body;
  // Check if chat already exists
  let chat = await Chat.findOne({ members: { $all: [userId1, userId2] } });
  if (!chat) {
    chat = await Chat.create({ members: [userId1, userId2] });
  }
  res.json(chat);
});

// Send a message (REST, not socket)
router.post('/message', async (req, res) => {
  const { chatId, sender, receiver, text } = req.body;
  const msg = await Message.create({ chatId, sender, receiver, text, delivered: true });
  await Chat.findByIdAndUpdate(chatId, { lastMessage: text, updatedAt: new Date() });
  res.json(msg);
});

// Mark message as seen
router.put('/message/seen/:id', async (req, res) => {
  const msg = await Message.findByIdAndUpdate(req.params.id, { seen: true }, { new: true });
  res.json(msg);
});

// Delete a chat
router.delete('/:chatId', async (req, res) => {
  await Chat.findByIdAndDelete(req.params.chatId);
  await Message.deleteMany({ chatId: req.params.chatId });
  res.json({ success: true });
});

module.exports = router;
