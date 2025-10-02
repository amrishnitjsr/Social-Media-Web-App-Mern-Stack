const postModel = require('../Models/postModel');
const mongoose = require('mongoose');
const UserModel = require('../Models/userModel');

// Add share endpoint
exports.sharePost = async (req, res) => {
    try {
        // Example: send post to all users (could be notification, etc.)
        // For now, just respond success
        res.status(200).json({ message: 'Post shared with all registered users!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to share post' });
    }
};

// Get all posts (for global feed)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.find({}).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json(error);
    }
}


// Add a comment to a post
exports.addComment = async (req, res) => {
    const postId = req.params.id;
    const { userId, text } = req.body;
    try {
        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json("Post not found");
        // Fetch user name
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json("User not found");
        const name = user.firstname + " " + user.lastname;
        post.comments.push({ userId, name, text });
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json(error);
    }
}


// Create new post
exports.createPost = async (req, res) => {
    const newPost = new postModel(req.body);

    try {
        await newPost.save();
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json(error)
    }
}


// get a post
exports.getPost = async (req, res) => {
    const id = req.params.id

    try {
        const post = await postModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}


//Update a Post
exports.updatePost = async (req, res) => {
    const postId = req.params.id

    const { userId } = req.body

    try {
        const post = await postModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post Updated Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}



// delete a post
exports.deletePost = async (req, res) => {
    const id = req.params.id;

    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (post.userId === userId) {
            await post.deleteOne();
            res.status(200).json("Post deleted Successfully!")
        } else {
            res.status(403).json("Action forbidden")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}


// Like/Dislike a Post

exports.like_dislike_Post = async (req, res) => {
    const id = req.params.id;

    const { userId } = req.body;

    try {
        const post = await postModel.findById(id);
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("Post liked.")
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post unliked.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


// Get timeline a Posts
exports.timeline = async (req, res) => {
    const userId = req.params.id;

    try {
        const currenUserPosts = await postModel.find({ userId: userId });
        const followingUserPosts = await UserModel.aggregate(
            [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "following",
                        foreignField: "userId",
                        as: "followingUserPosts"
                    }
                },
                {
                    $project: {
                        followingUserPosts: 1,
                        _id: 0
                    }
                }
            ]
        )

        res.status(200).json(currenUserPosts.concat(...followingUserPosts[0].followingUserPosts).sort((a, b) => {
            return b.createdAt - a.createdAt;
        })
        );


    } catch (error) {
        res.status(500).json(error)
    }
}