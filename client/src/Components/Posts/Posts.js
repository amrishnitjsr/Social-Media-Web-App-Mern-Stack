import React, { useEffect } from 'react'
import './Posts.css';
import Post from '../Post/Post';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '../../actions/PostAction';

const Posts = () => {

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.authReducer.authData)
  let { posts, loading } = useSelector((state) => state.postReducer)


  useEffect(() => {
    dispatch(getAllPosts())
  }, [dispatch])



  return (
    <div className='Posts'>

      {loading ? "Fetching Posts..." :
        posts.map((post) => {
          return <Post data={post} key={post._id} currentUser={user} />
        })}

    </div>
  )
}

export default Posts
