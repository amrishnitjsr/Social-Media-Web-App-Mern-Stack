import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import axios from 'axios';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
`;
const ContactList = styled.div`
  width: 250px;
  background: #fff;
  border-right: 1px solid #eee;
  overflow-y: auto;
`;
const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const MessageBubble = styled.div`
  max-width: 60%;
  margin: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 1.2rem;
  background: ${props => props.isSender ? '#dcf8c6' : '#fff'};
  align-self: ${props => props.isSender ? 'flex-end' : 'flex-start'};
  box-shadow: 0 1px 2px rgba(0,0,0,0.07);
`;
const TypingIndicator = styled.div`
  font-style: italic;
  color: #888;
  margin: 0.5rem;
`;

const InstaChat = ({ currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch contacts (users)
    axios.get('http://localhost:4000/user/all').then(res => setContacts(res.data));
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    // Fetch messages for selected chat
    axios.get(`http://localhost:4000/instachat/messages/${selectedChat._id}`)
      .then(res => setMessages(res.data));
    // Setup socket
    socketRef.current = io('http://localhost:4000');
    socketRef.current.emit('join_room', selectedChat._id);
    socketRef.current.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });
    socketRef.current.on('typing', ({ userId }) => {
      setTyping(true);
      setTypingUser(userId);
    });
    socketRef.current.on('stop_typing', () => {
      setTyping(false);
      setTypingUser(null);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;
    const msgRes = await axios.post('http://localhost:4000/instachat/message', {
      chatId: selectedChat._id,
      sender: currentUser._id,
      text: input
    });
    const message = msgRes.data;
    socketRef.current.emit('send_message', {
      ...message,
      to: selectedChat._id,
      senderName: currentUser.name,
      timestamp: new Date().toLocaleTimeString()
    });
    setInput("");
  };

  return (
    <ChatContainer>
      <div style={{ display: 'flex', height: '100%' }}>
        <ContactList>
          {contacts.map(user => (
            <div key={user._id} style={{ padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #eee', background: selectedChat && selectedChat.members.includes(user._id) ? '#f0f0f0' : '#fff' }}
              onClick={async () => {
                // Find or create chat
                const chatRes = await axios.post('http://localhost:4000/instachat/create', {
                  members: [currentUser._id, user._id],
                  isGroup: false
                });
                setSelectedChat(chatRes.data);
              }}>
              <img src={user.profilePic} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
              {user.name}
            </div>
          ))}
        </ContactList>
        <ChatArea>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} isSender={msg.sender === currentUser._id}>
                {msg.text}
              </MessageBubble>
            ))}
            {typing && typingUser !== currentUser._id && (
              <TypingIndicator>Typing...</TypingIndicator>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #eee' }} onSubmit={handleSend}>
            <input
              style={{ flex: 1, padding: '0.7rem', borderRadius: '1rem', border: '1px solid #ccc' }}
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                if (selectedChat) {
                  socketRef.current.emit('typing', { roomId: selectedChat._id, userId: currentUser._id });
                  if (e.target.value === "") {
                    socketRef.current.emit('stop_typing', { roomId: selectedChat._id, userId: currentUser._id });
                  }
                }
              }}
              onBlur={() => selectedChat && socketRef.current.emit('stop_typing', { roomId: selectedChat._id, userId: currentUser._id })}
              placeholder="Type a message..."
            />
            <button type="submit" style={{ marginLeft: 8, padding: '0.7rem 1.2rem', borderRadius: '1rem', background: '#3897f0', color: '#fff', border: 'none' }}>Send</button>
          </form>
        </ChatArea>
      </div>
    </ChatContainer>
  );
};

export default InstaChat;
