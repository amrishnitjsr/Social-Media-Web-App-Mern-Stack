import React from 'react';
import './ProfilePageLeft.css';
import LogoSearch from '../LogoSearch/LogoSearch';
import InfoCard from '../InfoCard/InfoCard';
import FollowersCard from '../FollowersCard/FollowersCard';

const ProfilePageLeft = () => {
  const { user } = require('react-redux').useSelector((state) => state.authReducer.authData);
  const [followedUsers, setFollowedUsers] = React.useState([]);
  React.useEffect(() => {
    async function fetchFollowed() {
      if (user && user.following && user.following.length > 0) {
        const res = await Promise.all(user.following.map(id => require('../../api/UserRequest').getUser(id)));
        setFollowedUsers(res.map(r => r.data));
      }
    }
    fetchFollowed();
  }, [user]);
  return (
    <div className='ProfilePageLeft'>
       <LogoSearch />
       <InfoCard />
       <FollowersCard />
       <div style={{marginTop:'1rem'}}>
         <h4>Following</h4>
         {followedUsers.length === 0 ? <span style={{color:'gray'}}>You are not following anyone yet.</span> : (
           followedUsers.map(person => (
             <a key={person._id} href={`/profile/${person._id}`} style={{display:'block',textDecoration:'none',color:'inherit',marginBottom:'0.5rem'}}>
               {person.firstname} {person.lastname}
             </a>
           ))
         )}
       </div>
    </div>
  )
}

export default ProfilePageLeft
