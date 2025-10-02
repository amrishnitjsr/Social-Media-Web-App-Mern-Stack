import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function ChatList({ userId, onSelectChat }) {
  const [chats, setChats] = useState([]);
  useEffect(() => {
    axios.get(`/chat/${userId}`).then(res => setChats(res.data));
  }, [userId]);
  return (
    <div>
      {chats.map(chat => (
        <div key={chat._id} onClick={() => onSelectChat(chat)}>
          {chat.members.filter(id => id !== userId).join(', ')}
        </div>
      ))}
    </div>
  );
}
