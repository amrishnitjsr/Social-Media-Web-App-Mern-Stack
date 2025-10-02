import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllUser } from '../../api/UserRequest';
import { Link, useNavigate } from 'react-router-dom';
import { getProfilePicture } from '../../utils/avatarHelper';
import './ChatSelect.css';

const ChatSelect = () => {
  const { user } = useSelector((state) => state.authReducer.authData);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getAllUser();
        setUsers(res.data.filter(u => u._id !== user._id));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [user]);

  // Get user initials for avatar
  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="ChatSelectBox">
      <div className="ChatSelectHeader">
        <button className="BackToHomeBtn" onClick={() => navigate('/home')}>
          <span className="BackIcon">←</span>
          <span>Back to Home</span>
        </button>
        <h2 className="ChatSelectTitle">💬 Start a Conversation</h2>
        <p className="ChatSelectSubtitle">Choose someone to chat with</p>
      </div>
      
      <div className="ChatUserListContainer">
        {loading ? (
          <div className="ChatEmptyState">
            <div className="ChatEmptyIcon">⏳</div>
            <p className="ChatEmptyText">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="ChatEmptyState">
            <div className="ChatEmptyIcon">👥</div>
            <p className="ChatEmptyText">No users available</p>
          </div>
        ) : (
          <ul className="ChatUserList">
            {users.map(u => (
              <li key={u._id}>
                <Link to={`/chat/${u._id}`} className="ChatUserLink">
                  <div className="ChatUserAvatar">
                    {u.profilePicture ? (
                      <img 
                        src={getProfilePicture(u.profilePicture)} 
                        alt={`${u.firstname} ${u.lastname}`}
                        className="ChatUserProfileImg"
                      />
                    ) : (
                      <span className="ChatUserInitials">
                        {getInitials(u.firstname, u.lastname)}
                      </span>
                    )}
                  </div>
                  <div className="ChatUserInfo">
                    <p className="ChatUserName">{u.firstname} {u.lastname}</p>
                    <p className="ChatUserStatus">Click to start chatting</p>
                  </div>
                  <span className="ChatUserIcon">💬</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatSelect;
