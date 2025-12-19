
const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const session = require('express-session');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'anonymous-chat-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// User data storage
const USERS_FILE = path.join(__dirname, 'users.json');
let userDatabase = {};

// Load user data from file
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            userDatabase = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        userDatabase = {};
    }
}

// Save user data to file
function saveUsers() {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(userDatabase, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

// Load users on startup
loadUsers();

// In-memory data stores
const users = {}; // Stores { socketId: { usern!ame, ... } }
const sockets = {}; // Stores { username: socketId }

function generateUsername() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let username = '';
    while (true) {
        username = '';
        for (let i = 0; i < 4; i++) {
            username += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (!sockets[username]) {
            return username;
        }
    }
}

// Serve the login page
app.get('/', (req, res) => {
    if (req.session.user) {
        // User is logged in, redirect to chat
        res.redirect('/chat');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (userDatabase[email]) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = generateUsername();

        userDatabase[email] = {
            email,
            password: hashedPassword,
            username,
            createdAt: new Date().toISOString()
        };

        saveUsers();

        req.session.user = { email, username };
        res.json({ success: true, username });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = userDatabase[email];
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    try {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        req.session.user = { email, username: user.username };
        res.json({ success: true, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

// API endpoint to get current user info
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

// Serve the chat page (only for logged-in users)
app.get('/chat', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('register', (username) => {
        users[socket.id] = { username };
        sockets[username] = socket.id;

        // Broadcast to all clients that a new user has joined
        io.emit('user-joined', username);
        console.log(`${username} has joined`);

        // Send the list of online users to all clients
        io.emit('online-users', Object.keys(sockets));
    });


    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        const disconnectedUser = users[socket.id];
        if (disconnectedUser) {
            delete sockets[disconnectedUser.username];
            delete users[socket.id];
            io.emit('user-left', disconnectedUser.username);
            io.emit('online-users', Object.keys(sockets));
            console.log(`${disconnectedUser.username} has left`);
        }
    });

    socket.on('message', (message) => {
        const user = users[socket.id];
        if (user) {
            io.emit('message', { user: user.username, text: message });
        }
    });

    socket.on('private-message', ({ to, message }) => {
        const fromUser = users[socket.id];
        const toSocketId = sockets[to];
        if (fromUser && toSocketId) {
            io.to(toSocketId).emit('private-message', { from: fromUser.username, message });
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
