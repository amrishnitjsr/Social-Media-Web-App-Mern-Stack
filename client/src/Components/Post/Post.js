import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Post.css';
import Comment from '../../Img/comment.png';
import Share from '../../Img/share.png';
import Like from '../../Img/like.png';
import Notlike from '../../Img/notlike.png';
import DeleteIcon from '../../Img/noti.png';
import { useSelector, useDispatch } from 'react-redux';
import { likePost, addComment } from '../../api/PostRequest';
import { deletePost } from '../../actions/PostAction';
import { getProfilePicture } from '../../utils/avatarHelper';

const Post = ({ data, currentUser }) => {
  const navigate = useNavigate();
  const [poster, setPoster] = useState(null);
  const [commentUserNames, setCommentUserNames] = useState({});
  const [comments, setComments] = useState(data.comments || []);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authReducer.authData);
  const [liked, setLiked] = useState(data.likes.includes(user._id));
  const [likes, setLikes] = useState(data.likes.length);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    async function fetchPoster() {
      try {
        const res = await fetch(`http://localhost:4000/user/${data.userId}`);
        const user = await res.json();
        setPoster(user);
      } catch {
        setPoster(null);
      }
    }
    fetchPoster();
  }, [data.userId]);

  useEffect(() => {
    async function fetchCommentUserNames() {
      const names = {};
      const userIds = [];

      comments.forEach(c => {
        if (!c.firstname && !c.lastname && c.userId) userIds.push(c.userId);
        if (c.replies) {
          c.replies.forEach(r => {
            if (!r.firstname && !r.lastname && r.userId) userIds.push(r.userId);
          });
        }
      });

      const uniqueUserIds = [...new Set(userIds)];
      await Promise.all(uniqueUserIds.map(async (id) => {
        try {
          const res = await fetch(`http://localhost:4000/user/${id}`);
          const user = await res.json();
          names[id] = user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.name || '';
        } catch {
          names[id] = '';
        }
      }));
      setCommentUserNames(names);
    }
    fetchCommentUserNames();
  }, [comments]);

  const handleLike = () => {
    setLiked((prev) => !prev);
    likePost(data._id, user._id);
    liked ? setLikes((prev) => prev - 1) : setLikes((prev) => prev + 1);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await addComment(data._id, user._id, commentText);
      setComments(res.data.comments);
      setCommentText("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddReply = async (e, parentIdx) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await addComment(data._id, user._id, replyText, parentIdx);
      setComments(res.data.comments);
      setReplyText("");
      setReplyTo(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(data._id, user._id));
    }
  };

  // Like logic: only one like per user for comment/reply
  const handleLikeComment = (commentIdx) => {
    setComments(prev => {
      const updated = [...prev];
      const comment = { ...updated[commentIdx] };
      if (!comment.likedBy) comment.likedBy = [];
      if (!comment.likedBy.includes(user._id)) {
        comment.likedBy.push(user._id);
      }
      updated[commentIdx] = comment;
      return updated;
    });
  };

  const handleLikeReply = (commentIdx, replyIdx) => {
    setComments(prev => {
      const updated = [...prev];
      const comment = { ...updated[commentIdx] };
      if (!comment.replies) comment.replies = [];
      const reply = { ...comment.replies[replyIdx] };
      if (!reply.likedBy) reply.likedBy = [];
      if (!reply.likedBy.includes(user._id)) {
        reply.likedBy.push(user._id);
      }
      comment.replies[replyIdx] = reply;
      updated[commentIdx] = comment;
      return updated;
    });
  };

  return (
    <div className='Post'>
      {/* Poster info */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <img
          src={getProfilePicture(poster, 'http://localhost:4000/images/')}
          alt="Profile"
          style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12, cursor: 'pointer', objectFit: 'cover' }}
          onClick={() => poster && navigate(`/profile/${poster._id}`)}
        />
        <span style={{ fontWeight: 600, cursor: 'pointer', color: '#25D366' }} onClick={() => poster && navigate(`/profile/${poster._id}`)}>
          {poster ? `${poster.firstname} ${poster.lastname}` : 'Unknown User'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {data.image && (
          <a href={process.env.REACT_APP_PUBLIC_FOLDER + data.image} target="_blank" rel="noopener noreferrer">
            <img 
              src={process.env.REACT_APP_PUBLIC_FOLDER + data.image}
              alt="Post"
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', cursor: 'pointer' }}
              draggable="false"
            />
          </a>
        )}
      </div>

      <div className="postReact">
        <img src={liked ? Like : Notlike} alt="" onClick={handleLike} style={{ cursor: "pointer" }} />
        <img src={Comment} alt="" onClick={() => setShowCommentBox(prev => !prev)} style={{ cursor: "pointer" }} />
        {currentUser._id === data.userId && (
          <img src={DeleteIcon} alt="Delete" onClick={handleDelete} style={{ cursor: "pointer", width: 24, marginLeft: 8 }} />
        )}
        <img src={Share} alt="" />
      </div>

      <span style={{ color: "var(--gray)", fontSize: '14px' }}>{likes} likes</span>
      <div className="detail">
        <span>{data.desc}</span>
      </div>

      {showCommentBox && (
        <div style={{ marginTop: '1rem' }}>
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit">Comment</button>
          </form>

          {comments.length === 0 ? (
            <span style={{ color: 'gray' }}>No comments yet.</span>
          ) : (
            comments.map((c, idx) => (
              <div key={c._id || idx} style={{ marginBottom: '0.5rem', background: '#f3f3f3', padding: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{ fontWeight: 600, color: '#25D366', cursor: 'pointer' }}
                    onClick={() => c.userId && navigate(`/profile/${c.userId}`)}
                  >
                    {c.firstname && c.lastname ? `${c.firstname} ${c.lastname}` : (c.name || commentUserNames[c.userId] || '')}
                  </span>
                  <span style={{ marginLeft: 8, color: '#888' }}>{c.text}</span>
                  <button onClick={() => handleLikeComment(idx)} disabled={c.likedBy && c.likedBy.includes(user._id)}>👍</button>
                  <span>{c.likedBy ? c.likedBy.length : 0}</span>
                </div>

                {replyTo === idx ? (
                  <form onSubmit={(e) => handleAddReply(e, idx)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Reply..."
                    />
                    <button type="submit">Reply</button>
                  </form>
                ) : (
                  <button onClick={() => setReplyTo(idx)}>Reply</button>
                )}

                {c.replies && c.replies.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {c.replies.map((r, ridx) => (
                      <div key={ridx} style={{ marginLeft: 32, display: 'flex', gap: 8 }}>
                        <span
                          style={{ fontWeight: 600, cursor: 'pointer', color: '#25D366' }}
                          onClick={() => r.userId && navigate(`/profile/${r.userId}`)}
                        >
                          {r.firstname && r.lastname ? `${r.firstname} ${r.lastname}` : (r.name || commentUserNames[r.userId] || '')}
                        </span>
                        <span>{r.text}</span>
                        <button onClick={() => handleLikeReply(idx, ridx)} disabled={r.likedBy && r.likedBy.includes(user._id)}>👍</button>
                        <span>{r.likedBy ? r.likedBy.length : 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Post;
