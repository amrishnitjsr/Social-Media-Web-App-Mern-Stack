import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { io } from 'socket.io-client';
import axios from 'axios';
import { getProfilePicture } from '../../utils/avatarHelper';

const Chat = ({ currentUser, otherUser }) => {
  const [callType, setCallType] = useState(null); // 'audio' | 'video' | null
  const [callIncoming, setCallIncoming] = useState(false);
  const [callFrom, setCallFrom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const menuRef = useRef();
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const socketRef = useRef();
  const roomId = [currentUser._id, otherUser._id].sort().join(":");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let chatId = roomId;
        const chatRes = await axios.post('http://localhost:4000/instachat/create', {
          members: [currentUser._id, otherUser._id],
          isGroup: false
        });
        chatId = chatRes.data._id;

        const res = await axios.get(`http://localhost:4000/instachat/messages/${chatId}`);
        setMessages(res.data);

        socketRef.current = io('http://localhost:4000');
        socketRef.current.emit('user_online', currentUser._id);
        socketRef.current.emit('join_room', chatId);

        socketRef.current.on('receive_message', (data) => {
          if (!blocked) {
            setMessages((prev) => {
              if (prev.some(m => m._id === data._id)) return prev;
              return [...prev, data];
            });
          }
        });
        socketRef.current.on('typing', ({ userId }) => {
          if (!blocked) {
            setTyping(true);
            setTypingUser(userId);
          }
        });
        socketRef.current.on('stop_typing', () => {
          if (!blocked) {
            setTyping(false);
            setTypingUser(null);
          }
        });

        socketRef.current.on('call_request', ({ from, type }) => {
          if (!blocked) {
            setCallIncoming(true);
            setCallType(type);
            setCallFrom(from);
          }
        });
        socketRef.current.on('call_end', () => {
          if (!blocked) {
            setCallType(null);
            setCallIncoming(false);
            setCallFrom(null);
          }
        });
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };
    fetchMessages();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('user_offline', currentUser._id);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, currentUser._id, otherUser._id, blocked]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (blocked) return;
    if (!input.trim() && !file) return;

    try {
      let chatId = roomId;
      const chatRes = await axios.post('http://localhost:4000/instachat/create', {
        members: [currentUser._id, otherUser._id],
        isGroup: false
      });
      chatId = chatRes.data._id;

      let message;
      if (file) {
        const formData = new FormData();
        formData.append("chatId", chatId);
        formData.append("sender", currentUser._id);
        formData.append("image", file);

        const msgRes = await axios.post('http://localhost:4000/instachat/message/image', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        message = msgRes.data;
      } else {
        const msgRes = await axios.post('http://localhost:4000/instachat/message', {
          chatId,
          sender: currentUser._id,
          text: input
        });
        message = msgRes.data;
      }

      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          ...message,
          to: chatId,
          senderName: currentUser.firstname + ' ' + currentUser.lastname,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      setInput("");
      setFile(null);

    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="ChatBox">
      {/* Header */}
      <div className="ChatHeader">
        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={getProfilePicture(otherUser, 'http://localhost:4000/images/')}
            alt="Profile"
            className="ChatHeaderProfileImg"
          />
          <div>
            <div className="ChatHeaderName">{otherUser.firstname} {otherUser.lastname}</div>
            <div className="ChatHeaderStatus">
              <span className={otherUser.isOnline ? 'OnlineDot online' : 'OnlineDot offline'}></span>
              <span className="OnlineText">{otherUser.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="ChatHeaderMenuWrap">
          <button 
            className="CallBtn" 
            title="Audio Call" 
            onClick={() => { 
              if (socketRef.current) { 
                socketRef.current.emit('call_request', { to: otherUser._id, from: currentUser._id, type: 'audio' }); 
                setCallType('audio'); 
              } 
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" fill="white"/>
            </svg>
          </button>
          <button 
            className="CallBtn" 
            title="Video Call" 
            onClick={() => { 
              if (socketRef.current) { 
                socketRef.current.emit('call_request', { to: otherUser._id, from: currentUser._id, type: 'video' }); 
                setCallType('video'); 
              } 
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7z" fill="white"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="white"/>
            </svg>
          </button>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
              className="MenuBtn" 
              title="Menu" 
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="2" fill="white"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
                <circle cx="12" cy="18" r="2" fill="white"/>
              </svg>
            </button>
            {menuOpen && (
              <div className="ChatMenuDropdown">
                <button className="ChatMenuItem">Report</button>
                <button 
                  className="ChatMenuItem" 
                  onClick={() => { 
                    setBlocked((prev) => !prev); 
                    setMenuOpen(false); 
                  }}
                >
                  {blocked ? 'Unblock' : 'Block'}
                </button>
                <button 
                  className="ChatMenuItem" 
                  onClick={async () => { 
                    try { 
                      let chatId = roomId; 
                      const chatRes = await axios.post('http://localhost:4000/instachat/create', { 
                        members: [currentUser._id, otherUser._id], 
                        isGroup: false 
                      }); 
                      chatId = chatRes.data._id; 
                      await axios.delete(`http://localhost:4000/instachat/messages/${chatId}`); 
                    } catch (err) { 
                      console.error('Error clearing messages:', err); 
                    } 
                    setMessages([]); 
                    setMenuOpen(false); 
                  }}
                >
                  Clear chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Modal */}
      {callType && (
        <div className="CallModal">
          <div>
            <h2>{callType === 'audio' ? '📞 Audio Call' : '📹 Video Call'}</h2>
            {callIncoming ? (
              <>
                <p>Incoming {callType} call from {callFrom}</p>
                <button 
                  onClick={() => { 
                    setCallType(null); 
                    setCallIncoming(false); 
                    setCallFrom(null); 
                  }}
                >
                  Decline
                </button>
                <button onClick={() => { /* Accept logic */ }}>Accept</button>
              </>
            ) : (
              <>
                <p>Calling {otherUser.firstname} {otherUser.lastname}...</p>
                <button 
                  onClick={() => { 
                    setCallType(null); 
                    if (socketRef.current) socketRef.current.emit('call_end', { to: otherUser._id }); 
                  }}
                >
                  End Call
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="ChatMessages">
        {blocked ? (
          <div className="BlockedMessage">
            You have blocked this contact. Unblock to send messages.
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={msg.sender === currentUser._id ? 'MsgRow myMsgRow' : 'MsgRow otherMsgRow'}
              >
                <div className={msg.sender === currentUser._id ? 'myMsgBubble' : 'otherMsgBubble'}>
                  <div className="MsgText">{msg.text}</div>
                  {msg.image && (
                    <img 
                      src={`http://localhost:4000/uploads/${msg.image}`} 
                      alt="uploaded" 
                      className="MsgImage"
                    />
                  )}
                  <div className="MsgMeta">
                    {msg.timestamp ? msg.timestamp : ''}
                  </div>
                </div>
              </div>
            ))}
            {typing && typingUser === otherUser._id && (
              <div className="TypingIndicator">
                {otherUser.firstname} is typing
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form className="ChatInput" onSubmit={handleSend}>
        <label htmlFor="fileUpload" className="FileUploadBtn">📎</label>
        <input 
          id="fileUpload" 
          type="file" 
          accept="image/*" 
          style={{ display: "none" }} 
          onChange={(e) => setFile(e.target.files[0])} 
          disabled={blocked} 
        />
        <input 
          type="text" 
          value={input} 
          onChange={(e) => { 
            setInput(e.target.value); 
            if (socketRef.current && !blocked) { 
              socketRef.current.emit('typing', { roomId, userId: currentUser._id }); 
              if (e.target.value === "") { 
                socketRef.current.emit('stop_typing', { roomId, userId: currentUser._id }); 
              } 
            } 
          }} 
          onBlur={() => { 
            if (socketRef.current && !blocked) { 
              socketRef.current.emit('stop_typing', { roomId, userId: currentUser._id }); 
            } 
          }} 
          placeholder={blocked ? "Unblock to send a message" : "Type a message..."} 
          disabled={blocked}
        />
        <button type="submit" disabled={blocked}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat;
