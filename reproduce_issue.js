const io = require('./client/node_modules/socket.io-client');

const API_URL = 'http://localhost:5000';

async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`Login error details: Status ${response.status} ${response.statusText}, Body: ${err}`);
            throw new Error(err);
        }
        return await response.json();
    } catch (error) {
        console.error(`Login failed for ${username}:`, error.message);
        process.exit(1);
    }
}

async function createChallenge(token, opponentId, quizId) {
    try {
        const response = await fetch(`${API_URL}/api/challenges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': 'http://localhost:5173'
            },
            body: JSON.stringify({ opponentId, quizId })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }
        const data = await response.json();
        return data.challenge;
    } catch (error) {
        console.error('Create challenge failed:', error.message);
        process.exit(1);
    }
}

async function getPublicQuiz() {
    try {
        const response = await fetch(`${API_URL}/api/quizzes/public`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.length > 0 ? data[0].id : 1;
    } catch (e) {
        return 1;
    }
}

async function runTest() {
    console.log('Starting test...');

    // 1. Login
    const user1 = await login('test', 'Test1234');
    const user2 = await login('test1', 'Test1234');
    console.log(`Logged in: ${user1.user.username} (${user1.user.id}) and ${user2.user.username} (${user2.user.id})`);

    // 2. Create a challenge (User 1 challenges User 2)
    const quizId = await getPublicQuiz();
    console.log(`Using Quiz ID: ${quizId}`);

    const challenge = await createChallenge(user1.token, user2.user.id, quizId);
    console.log(`Challenge created: ${challenge.id}`);

    // 3. Connect Sockets
    const socket1 = io(API_URL);
    const socket2 = io(API_URL);

    const setupSocket = (socket, name, userId) => {
        socket.on('connect', () => {
            console.log(`${name} connected (socket: ${socket.id})`);

            // Emit join immediately upon connection
            console.log(`${name} joining challenge ${challenge.id}...`);
            socket.emit('join_challenge', {
                userId: userId,
                challengeId: challenge.id,
                username: name
            });
        });

        socket.on('opponent_joined', (data) => {
            console.log(`[${name}] received opponent_joined:`, data);
        });

        socket.on('both_players_ready', () => {
            console.log(`[${name}] received both_players_ready ✅`);
        });

        socket.on('challenge_start', () => {
            console.log(`[${name}] received challenge_start 🚀`);
        });

        socket.on('waiting_for_opponent', () => {
            console.log(`[${name}] received waiting_for_opponent ⏳`);
        });
    };

    setupSocket(socket1, 'User1', user1.user.id);

    // Delay User 2 joining slightly to simulate real scenario
    setTimeout(() => {
        setupSocket(socket2, 'User2', user2.user.id);
    }, 2000);

    // Keep alive for a bit
    setTimeout(() => {
        console.log('Test finished, closing sockets.');
        socket1.close();
        socket2.close();
        process.exit(0);
    }, 10000);
}

runTest();
