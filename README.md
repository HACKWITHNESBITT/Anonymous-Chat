# Anonymous Chat Application

## Communication Overview

### Project Description
This is a **real-time anonymous chat application** built with Node.js, Express, and Socket.IO. Users can create accounts, login, and communicate with other online users through both public and private messages.


Live Demo

https://anonymous-chat-1-9pg2.onrender.com

### How Users Communicate

#### 1. User Authentication Flow
- Users register with email/password → System auto-generates a 4-letter random username (e.g., "abcd", "xyzt")
- Users can also login with existing credentials
- Sessions maintain login state

#### 2. Real-Time Communication Features

##### Public Chat
- All users in the chat room see messages from everyone
- Messages appear instantly with username and timestamp
- Visual notifications when users join/leave the chat

##### Private Messaging
- Click on any online username from the "Online Users" list
- Send direct private messages to specific users
- Private messages show as `[private from username]: message`

##### Live User Management
- Real-time online users list updates automatically
- Users are notified when others join/leave
- Disconnections handled gracefully

#### 3. Technical Implementation
- **Backend**: Express server with Socket.IO for real-time communication
- **Frontend**: HTML/CSS/JavaScript with Socket.IO client
- **Authentication**: Session-based with bcrypt password hashing
- **Data Storage**: User accounts saved in `users.json` file
- **Visual Effects**: Matrix-style animated background

#### 4. Communication Flow
1. User registers/logs in → Gets assigned random username
2. Redirected to chat interface
3. Socket.IO connection established automatically
4. User appears in online users list for others
5. Can send public messages (everyone sees)
6. Can send private messages (only recipient sees)
7. Real-time updates for all chat activities

#### 5. Key Features
- **Anonymous**: Real names hidden, only usernames visible
- **Real-time**: Instant message delivery via WebSockets
- **Persistent**: User accounts saved between sessions
- **Responsive**: Works on desktop and mobile devices
- **Secure**: Password hashing and session management

#### 6. Developer 
- **Created by**:[Victor Kimutai](https://victor-kimutai.onrender.com)
