const socket = io();

const usernameDisplay = document.getElementById('username-display');
const usersList = document.getElementById('users-list');
const chatMessages = document.querySelector('.chat-messages');
const chatForm = document.querySelector('.chat-form');
const messageInput = document.getElementById('message-input');

let myUsername = '';

// Matrix background effect
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';

const alphabet = katakana + latin + nums;

const fontSize = 16;
const columns = canvas.width / fontSize;

const rainDrops = [];

for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
}

const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
};

const matrixInterval = setInterval(draw, 30);


// --- Chat Logic ---

socket.on('username', (username) => {
    myUsername = username;
    usernameDisplay.textContent = username;
});

socket.on('online-users', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        if (user !== myUsername) {
            const li = document.createElement('li');
            li.textContent = user;
            li.addEventListener('click', () => {
                const message = prompt(`Send a private message to ${user}:`);
                if (message) {
                    socket.emit('private-message', { to: user, message });
                }
            });
            usersList.appendChild(li);
        }
    });
});

socket.on('user-joined', (username) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('user-joined');
    messageElement.textContent = `${username} has joined the chat`;
    chatMessages.prepend(messageElement);
});

socket.on('user-left', (username) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('user-left');
    messageElement.textContent = `${username} has left the chat`;
    chatMessages.prepend(messageElement);
});

socket.on('message', ({ user, text }) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<span class="user">${user}:</span> <span class="text">${text}</span>`;
    chatMessages.prepend(messageElement);
});

socket.on('private-message', ({ from, message }) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<span class="user">[private from ${from}]:</span> <span class="text">${message}</span>`;
    chatMessages.prepend(messageElement);
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message) {
        socket.emit('message', message);
        messageInput.value = '';
    }
});
