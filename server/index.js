const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// Content Security Policy
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "connect-src 'self' https://whatsapp-clone-g9vw.onrender.com wss://whatsapp-clone-g9vw.onrender.com;"
    );
    next();
});

// --- 2. Database Connection (The Missing Part) ---
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render
});

db.query('SELECT NOW()', (err) => {
    if (err) console.error('❌ DATABASE CONNECTION ERROR:', err.message);
    else console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
});

// --- 3. Socket.io Setup ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allows your frontend to connect from anywhere
        methods: ["GET", "POST"]
    }
});

// --- 4. Routes ---

// FIX: Root Route (Stops the "Cannot GET /" 404 error)
app.get('/', (req, res) => {
    res.send("🚀 WhatsApp Clone Backend is Live and Connected!");
});

// Debug Route
app.get('/debug-db', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM users");
        res.json({ status: "Success", data: result.rows });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { username, email } = req.body;
    try {
        let user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            user = await db.query(
                "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
                [username, email]
            );
        }
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch Users API
app.get('/api/users/:currentUserId', async (req, res) => {
    try {
        const users = await db.query(
            "SELECT id, username, avatar_url FROM users WHERE id != $1",
            [req.params.currentUserId]
        );
        res.json(users.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get/Create Conversation API
app.get('/api/conversation/:userOne/:userTwo', async (req, res) => {
    const { userOne, userTwo } = req.params;
    try {
        let convo = await db.query(
            "SELECT id FROM conversations WHERE (user_one_id = $1 AND user_two_id = $2) OR (user_one_id = $2 AND user_two_id = $1)",
            [userOne, userTwo]
        );
        if (convo.rows.length === 0) {
            convo = await db.query(
                "INSERT INTO conversations (user_one_id, user_two_id) VALUES ($1, $2) RETURNING id",
                [userOne, userTwo]
            );
        }
        res.json(convo.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Fetch Messages API
app.get('/api/messages/:convoId', async (req, res) => {
    try {
        const messages = await db.query(
            "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
            [req.params.convoId]
        );
        res.json(messages.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- 5. Socket Logic ---
let onlineUsers = new Map();

io.on('connection', (socket) => {
    socket.on("register_user", (userId) => {
        onlineUsers.set(String(userId), socket.id);
        socket.join(`user_${userId}`);
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_private_message", async (data) => {
        const { senderId, recipientId, message_text, conversationId } = data;
        try {
            await db.query(
                "INSERT INTO messages (conversation_id, sender_id, message_text) VALUES ($1, $2, $3)",
                [conversationId, senderId, message_text]
            );
            io.to(`user_${recipientId}`).emit("receive_message", {
                senderId,
                message_text,
                conversationId
            });
        } catch (err) {
            console.error("❌ SOCKET ERROR:", err.message);
        }
    });

    socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });
});

// --- 6. Start Server ---
// IMPORTANT: Render uses process.env.PORT, not always 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));