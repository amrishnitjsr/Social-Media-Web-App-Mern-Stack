import React, { useState } from 'react'
import './PostSide.css'
import PostShare from '../PostShare/PostShare'
import Posts from '../Posts/Posts'
import { useSelector } from 'react-redux';

const PostSide = () => {
  const [search] = useState("");
  const { posts } = useSelector((state) => state.postReducer);
  const filteredPosts = search
    ? posts.filter(
        (post) =>
          post.name && post.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="PostSide">
      <PostShare />

      {search && (
        <div>
          <h4>Search Results:</h4>
          {filteredPosts.length === 0 ? (
            <span style={{ color: 'gray' }}>No posts found.</span>
          ) : (
            filteredPosts.map((post, id) => <Posts key={id} data={post} />)
          )}
        </div>
      )}
      {!search && <Posts />}
    </div>
  )
}

export default PostSide
