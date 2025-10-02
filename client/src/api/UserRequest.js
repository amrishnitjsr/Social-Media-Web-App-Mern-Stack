import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/user' });


API.interceptors.request.use((req) => {
    if (localStorage.getItem('profile')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`;
    }

    return req;
})


export const getUser = (userId) => API.get(`/${userId}`);

export const updateUser = (id, formData) => API.put(`/${id}`, formData);

export const getAllUser = () => API.get('/');

export const followUser = (id, data) => API.put(`/${id}/follow`, data);

export const unFollowUser = (id, data) => API.put(`/${id}/unfollow`, data);