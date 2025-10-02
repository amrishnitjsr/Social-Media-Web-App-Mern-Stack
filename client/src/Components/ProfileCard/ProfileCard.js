import React from 'react'
import './ProfileCard.css';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfilePicture, getCoverPicture } from '../../utils/avatarHelper';


const ProfileCard = ({ location }) => {

    const { user } = useSelector((state) => state.authReducer.authData);
    const posts = useSelector((state) => state.postReducer.posts)
    const serverPublic = process.env.REACT_APP_PUBLIC_FOLDER;



    return (
        <div className='ProfileCard'>

            <div className="ProfileImages">
                <img src={getCoverPicture(user, serverPublic)} alt="Cover" />
                <img src={getProfilePicture(user, serverPublic)} alt="Profile" />
            </div>

            <div className="ProfileName">
                <span>{user.firstname} {user.lastname}</span>
                <span>{user.worksAt ? user.worksAt : "write about yourself..."}</span>
            </div>

            <div className="followStatus">
                <hr />
                <div>
                    <div className="follow">
                        <span>{user.followers.length}</span>
                        <span>Followers</span>
                    </div>
                    <div className="vl"></div>
                    <div className="follow">
                        <span>{user.following.length}</span>
                        <span>Following</span>
                    </div>

                    {location === "profilePage" && (
                        <>
                            <div className="vl"></div>
                            <div className="follow">
                                <span>{posts.filter((post) => post.userId === user._id).length}</span>
                                <span>Posts</span>
                            </div>
                        </>
                    )}

                </div>
                <hr />
            </div>

            {location === "profilePage" ? '' :
                <span>
                    <Link style={{ textDecoration: "none", color: "inherit" }} to={`/profile/${user._id}`}>My Profile</Link>
                </span>
            }

        </div>
    )
}

export default ProfileCard
