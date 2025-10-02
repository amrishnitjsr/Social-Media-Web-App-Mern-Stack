import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000' });

export const getAllPosts = () => API.get('/post/all');
export const deletePost = (id, userId) => API.delete(`/post/${id}`, { data: { userId } });
export const getTimelinePosts = (id) => API.get(`/post/${id}/timeline`);
export const likePost = (id, userId) => API.put(`post/${id}/like_dislike`, { userId: userId })
export const addComment = (id, userId, text) => API.post(`/post/${id}/comment`, { userId, text });