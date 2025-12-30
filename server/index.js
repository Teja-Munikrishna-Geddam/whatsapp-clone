const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
});

// PostgreSQL Connection
const db = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Test Database Connection on startup
db.connect((err) => {
    if (err) {
        console.error('❌ DATABASE CONNECTION ERROR:', err.stack);
    } else {
        console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    }
});

let onlineUsers = new Map();

io.on('connection', (socket) => {
    socket.on("register_user", (userId) => {
        onlineUsers.set(String(userId), socket.id);
        socket.join(`user_${userId}`);
        console.log(`User ${userId} is now online with Socket ID: ${socket.id}`); // Check this log!
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_private_message", async (data) => {
        // Note: The frontend sends 'message_text', not 'message'
        const { senderId, recipientId, message_text, conversationId } = data;

        try {
            await db.query(
                "INSERT INTO messages (conversation_id, sender_id, message_text) VALUES ($1, $2, $3)",
                [conversationId, senderId, message_text]
            );

            io.to(`user_${recipientId}`).emit("receive_message", {
                senderId,
                message_text, // Use the variable from 'data'
                conversationId
            });
        } catch (err) {
            console.error("❌ SOCKET MESSAGE ERROR:", err.message);
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

// API: Login
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
        console.error("❌ LOGIN ROUTE ERROR:", err.message);
        res.status(500).json({ error: err.message }); // Sends the real error to Frontend
    }
});

// API: Fetch Users
app.get('/api/users/:currentUserId', async (req, res) => {
    try {
        const { currentUserId } = req.params;
        const users = await db.query(
            "SELECT id, username, avatar_url FROM users WHERE id != $1",
            [currentUserId]
        );
        res.json(users.rows);
    } catch (err) {
        console.error("❌ FETCH USERS ERROR:", err.message);
        res.status(500).send(err.message);
    }
});

// API: Conversation ID
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
        console.error("❌ CONVERSATION ROUTE ERROR:", err.message);
        res.status(500).send(err.message);
    }
});

// API: Messages
app.get('/api/messages/:convoId', async (req, res) => {
    try {
        const { convoId } = req.params;
        const messages = await db.query(
            "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
            [convoId]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error("❌ FETCH MESSAGES ERROR:", err.message);
        res.status(500).send(err.message);
    }
});

server.listen(5001, () => console.log("🚀 Server running on port 5001"));