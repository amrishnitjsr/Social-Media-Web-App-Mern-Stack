import { useSelector } from 'react-redux';
import './App.css';
import './responsive.css';
import Auth from './Pages/auth/Auth';
import SignupWithOtp from './Components/Auth/SignupWithOtp';
import GoogleAuthSuccess from './Components/Auth/GoogleAuthSuccess';
import Home from './Pages/home/Home';
import Profile from './Pages/profile/Profile';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Chat from './Components/Chat/Chat';
import ChatSelect from './Components/Chat/ChatSelect';

function App() {

  const user = useSelector((state) => state.authReducer.authData);

  return (
    <div className="App">
      <div className="blur" style={{ top: '-18%', right: '0' }}></div>
      <div className="blur" style={{ top: '36%', left: '-8rem' }}></div>


      <Routes>
        <Route path='/' element={user ? <Navigate to='home' /> : <Navigate to='auth' />} />
        <Route path='/home' element={user ? <Home /> : <Navigate to='../auth' />} />
        <Route path='/auth' element={user ? <Navigate to='../home' /> : <Auth />} />
        <Route path='/auth/success' element={<GoogleAuthSuccess />} />
        <Route path='/profile/:id' element={user ? <Profile /> : <Navigate to='../auth' />} />
        <Route path='/signup-otp' element={<SignupWithOtp />} />
        <Route path='/chat' element={user ? <ChatSelect /> : <Navigate to='../auth' />} />
        <Route path='/chat/:id' element={user ? <ChatWrapper user={user} /> : <Navigate to='../auth' />} />
      </Routes>

    </div>
  );
}

// Wrapper to pass currentUser and otherUser to Chat
function ChatWrapper({ user }) {
  const { id } = useParams();
  const [otherUser, setOtherUser] = useState(null);
  useEffect(() => {
    async function fetchUser() {
      const res = await require('./api/UserRequest').getUser(id);
      setOtherUser(res.data);
    }
    fetchUser();
  }, [id]);
  if (!otherUser) return <div>Loading chat...</div>;
  return <Chat currentUser={user} otherUser={otherUser} />;
}
export default App;
