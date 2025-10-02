import React, { useEffect, useState } from 'react';
import socket from '../../socket';
export default function OnlineStatus({ userId }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    socket.on('online-users', setOnlineUsers);
    return () => socket.off('online-users');
  }, []);
  return onlineUsers.includes(userId) ? <span>Online</span> : <span>Offline</span>;
}
