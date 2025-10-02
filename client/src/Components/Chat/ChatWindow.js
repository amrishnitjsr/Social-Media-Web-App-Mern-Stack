import React, { useEffect, useState, useRef } from 'react';
import socket from '../../socket';
import axios from 'axios';

export default function ChatWindow({ chat, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get(`/chat/messages/${chat._id}`).then(res => setMessages(res.data));
    socket.on('receive-message', msg => setMessages(prev => [...prev, msg]));
    socket.on('typing', ({ from }) => setTyping(true));
    socket.on('message-seen', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, seen: true } : m));
    });
    return () => {
      socket.off('receive-message');
      socket.off('typing');
      socket.off('message-seen');
    };
  }, [chat._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = e => {
    e.preventDefault();
    socket.emit('send-message', {
      chatId: chat._id,
      text: input,
      to: chat.members.find(id => id !== userId)
    });
    setInput('');
  };

  const handleTyping = () => {
    socket.emit('typing', { to: chat.members.find(id => id !== userId) });
  };

  return (
    <div>
      <div>
        {messages.map(msg => (
          <div key={msg._id}>
            <b>{msg.sender === userId ? `Me (${userId})` : `User (${msg.sender})`}:</b> {msg.text}
            {msg.seen ? <span>✓✓</span> : msg.delivered ? <span>✓</span> : null}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {typing && <div>User is typing...</div>}
      <form onSubmit={handleSend}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleTyping} />
        <button type='submit'>Send</button>
      </form>
    </div>
  );
}
