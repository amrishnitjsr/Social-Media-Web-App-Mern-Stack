# Quick Commands to Create New Repo and Push

# Step 1: Create new repository on GitHub
gh repo create Social-Media-Web-App-Mern-Stack --public --description "Full-stack MERN social media application with real-time chat, authentication, and modern UI"

# Step 2: Stage all changes
git add -A

# Step 3: Commit changes
git commit -m "🎉 Initial commit: Clean MERN social media application

Features:
- User authentication (Email/Password + Google OAuth)
- OTP verification via email
- Post creation with image upload
- Like, comment, and share posts
- Follow/unfollow users
- Real-time chat with typing indicators
- Online status tracking
- Audio/video call support
- Modern dark theme UI
- Responsive design

Tech Stack:
- Frontend: React 18, Redux, Socket.IO Client, Material-UI, Mantine
- Backend: Node.js, Express, MongoDB, Socket.IO, Passport.js
- Authentication: JWT, Bcrypt, OAuth 2.0
- Database: MongoDB with Mongoose
- Real-time: Socket.IO for chat and notifications"

# Step 4: Add remote origin
git remote add origin https://github.com/amrishnitjsr/Social-Media-Web-App-Mern-Stack.git

# Step 5: Push to GitHub
git push -u origin main

# If main branch doesn't exist, create it first:
# git branch -M main
# git push -u origin main
