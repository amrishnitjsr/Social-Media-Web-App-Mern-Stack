const express = require('express');
const { unFollowUser, deleteUser, followUser, getAllUsers, getUser, updateUser } = require('../Controllers/UserController');
const authMiddleWare = require('../Middleware/authMiddleWare');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', authMiddleWare, updateUser);
router.delete('/:id', authMiddleWare, deleteUser);
router.put('/:id/follow', authMiddleWare, followUser);
router.put('/:id/unfollow', authMiddleWare, unFollowUser);

module.exports = router;