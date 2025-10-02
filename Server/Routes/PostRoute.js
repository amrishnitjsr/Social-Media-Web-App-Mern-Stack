const express = require('express');
const { createPost, deletePost, getPost, like_dislike_Post, timeline, updatePost, addComment, getAllPosts } = require('../Controllers/PostController');

const router = express.Router();

router.get('/all', getAllPosts);
router.post('/', createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.put('/:id/like_dislike', like_dislike_Post);
router.get('/:id/timeline', timeline);
const { sharePost } = require('../Controllers/PostController');
router.post('/share/:id', sharePost);
router.post('/:id/comment', addComment);

module.exports = router;