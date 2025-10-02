import React, { useState } from 'react';
import './RightSide.css';
import Home from '../../Img/home.png';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Noti from '../../Img/noti.png';
import Comment from '../../Img/comment.png';
import TrendCard from '../TrendCard/TrendCard';
import ShareModal from '../ShareModal/ShareModal';
import { Link } from 'react-router-dom';
import Chat from '../Chat/Chat';

const RightSide = () => {

        const [modalOpened, setModalOpened] = useState(false);
        const [chatOpened, setChatOpened] = useState(false);
        const [selectedUser, setSelectedUser] = useState(null);
        const { user } = require('react-redux').useSelector((state) => state.authReducer.authData);
        const [users, setUsers] = React.useState([]);
        React.useEffect(() => {
            async function fetchUsers() {
                const res = await require('../../api/UserRequest').getAllUser();
                setUsers(res.data.filter(u => u._id !== user._id));
            }
            fetchUsers();
        }, [user]);

    return (
        <div className='RightSide'>
            <div className="navIcons" style={{ position: 'relative' }}>
                <Link to='../home'>
                    <img src={Home} alt="" />
                </Link>
                <SettingsOutlinedIcon />
                <img src={Noti} alt="" />
                <img src={Comment} alt="" />
                {/* Chat Button in top right corner */}
                <button style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem', borderRadius: '5px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => setChatOpened((prev) => !prev)}>Chat</button>
            </div>

                        <TrendCard />

                        <div className="button rg-button" onClick={() => setModalOpened(true)}>
                                Share
                        </div>
                        <ShareModal modalOpened={modalOpened} setModalOpened={setModalOpened} />

                        {/* Chat right-side window/modal */}
                        {chatOpened && (
                            <div style={{ position: 'fixed', top: 0, right: 0, width: '350px', height: '100%', background: '#fff', boxShadow: '-2px 0 8px rgba(0,0,0,0.1)', zIndex: 9999, padding: '1rem', overflowY: 'auto' }}>
                                <button style={{ float: 'right', marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setChatOpened(false)} title="Close">
                                    <span style={{ fontWeight: 'bold' }}>&#10005;</span>
                                </button>
                                {!selectedUser ? (
                                    <>
                                        <h3>Select a user to chat with:</h3>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {users.map(u => (
                                                <li key={u._id}>
                                                    <button style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }} onClick={() => setSelectedUser(u)}>
                                                        {u.firstname} {u.lastname}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <button style={{ marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setSelectedUser(null)} title="Back">
                                            <span style={{ display: 'inline-block' }}>&#8592;</span>
                                        </button>
                                        <Chat currentUser={user} otherUser={selectedUser} />
                                    </>
                                )}
                            </div>
                        )}
                </div>
        )
}

export default RightSide
