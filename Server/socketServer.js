const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const AuthRoute = require('./Routes/AuthRoute');
const UserRoute = require('./Routes/UserRoute');
const PostRoute = require('./Routes/PostRoute');
const UploadRoute = require('./Routes/UploadRoute');
const InstaChatRoute = require('./Routes/InstaChatRoute');
const GoogleAuthRoute = require('./Routes/GoogleAuthRoute');

const app = express();

app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.JWT_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

dotenv.config();

mongoose.connect(
  process.env.MONGO_DB,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  const server = app.listen(process.env.PORT, '0.0.0.0', () => console.log(`listening at ${process.env.PORT}`));
  console.log('MongoDB connected');

  // Socket.IO setup
  const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });


  const UserModel = require('./Models/userModel');
  io.on('connection', (socket) => {
    // Track user online status
    socket.on('user_online', async (userId) => {
      await UserModel.findByIdAndUpdate(userId, { $set: { online: true } });
      io.emit('user_status', { userId, online: true });
    });

    socket.on('user_offline', async (userId) => {
      await UserModel.findByIdAndUpdate(userId, { $set: { online: false } });
      io.emit('user_status', { userId, online: false });
    });

    // Room-based chat events for frontend compatibility
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    // Require InstaMessage model
    const InstaMessage = require('./Models/InstaMessage');

    socket.on('send_message', async (message) => {
      // Save message to DB (text or image)
      const savedMsg = await InstaMessage.create({
        chatId: message.to,
        sender: message.sender,
        text: message.text || '',
        image: message.image || null,
        status: 'delivered',
        createdAt: new Date()
      });
      // Broadcast the saved message to room
      io.to(message.to).emit('receive_message', savedMsg);
      // Emit delivered status
      io.to(message.to).emit('message_status', { messageId: savedMsg._id, status: 'delivered' });
    });

    socket.on('message_read', ({ messageId, roomId }) => {
      io.to(roomId).emit('message_status', { messageId, status: 'read' });
    });

    // Typing indicator
    socket.on('typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('typing', { userId });
    });
    socket.on('stop_typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('stop_typing', { userId });
    });

    // When a user disconnects
    socket.on('disconnect', async () => {
      // If you store userId in socket, update offline status here
      if (socket.userId) {
        await UserModel.findByIdAndUpdate(socket.userId, { $set: { online: false } });
        io.emit('user_status', { userId: socket.userId, online: false });
      }
    });
  });

}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

app.use('/auth', AuthRoute);
app.use('/auth', GoogleAuthRoute);
app.use('/user', UserRoute);
app.use('/post', PostRoute);
app.use('/upload', UploadRoute);
app.use('/instachat', InstaChatRoute);
