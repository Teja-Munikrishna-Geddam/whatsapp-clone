// backend/index.js

require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const app = express();

/* =====================================================
   1. MIDDLEWARE
===================================================== */

// Allow frontend (GitHub Pages) to talk to backend
app.use(
    cors({
        origin: [
            "https://teja-munikrishna-geddam.github.io"
        ],
        methods: ["GET", "POST"],
        credentials: true
    })
);

app.use(express.json());

/* =====================================================
   2. DATABASE (POSTGRES – RENDER SAFE)
===================================================== */

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

db.query("SELECT NOW()")
    .then(() => console.log("✅ DATABASE CONNECTED"))
    .catch((err) =>
        console.error("❌ DATABASE CONNECTION ERROR:", err.message)
    );

/* =====================================================
   3. BASIC ROUTES
===================================================== */

// Root route (avoid 404 confusion)
app.get("/", (req, res) => {
    res.send("🚀 WhatsApp Clone Backend Running");
});

// Debug route (optional – remove later)
app.get("/debug-db", async (req, res) => {
    try {
        const users = await db.query("SELECT * FROM users");
        res.json(users.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =====================================================
   4. AUTH – LOGIN / REGISTER
===================================================== */

app.post("/api/login", async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res
            .status(400)
            .json({ error: "Username and email required" });
    }

    try {
        // 1. Check by email
        const emailCheck = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.json(emailCheck.rows[0]);
        }

        // 2. Check username conflict
        const usernameCheck = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (usernameCheck.rows.length > 0) {
            return res
                .status(409)
                .json({ error: "Username already taken" });
        }

        // 3. Create new user
        const newUser = await db.query(
            "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
            [username, email]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error("LOGIN ERROR:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

/* =====================================================
   5. USERS & CHAT ROUTES
===================================================== */

// Get all users except current
app.get("/api/users/:currentUserId", async (req, res) => {
    try {
        const users = await db.query(
            "SELECT id, username, avatar_url FROM users WHERE id != $1",
            [req.params.currentUserId]
        );
        res.json(users.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get or create conversation
app.get("/api/conversation/:userOne/:userTwo", async (req, res) => {
    const { userOne, userTwo } = req.params;

    try {
        let convo = await db.query(
            `SELECT id FROM conversations 
       WHERE (user_one_id = $1 AND user_two_id = $2)
          OR (user_one_id = $2 AND user_two_id = $1)`,
            [userOne, userTwo]
        );

        if (convo.rows.length === 0) {
            convo = await db.query(
                `INSERT INTO conversations (user_one_id, user_two_id)
         VALUES ($1, $2) RETURNING id`,
                [userOne, userTwo]
            );
        }

        res.json(convo.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages
app.get("/api/messages/:convoId", async (req, res) => {
    try {
        const messages = await db.query(
            `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
            [req.params.convoId]
        );
        res.json(messages.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =====================================================
   6. SOCKET.IO
===================================================== */

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://teja-munikrishna-geddam.github.io",
        methods: ["GET", "POST"]
    }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("register_user", (userId) => {
        onlineUsers.set(String(userId), socket.id);
        socket.join(`user_${userId}`);

        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_private_message", async (data) => {
        const { senderId, recipientId, message_text, conversationId } = data;

        try {
            await db.query(
                `INSERT INTO messages (conversation_id, sender_id, message_text)
         VALUES ($1, $2, $3)`,
                [conversationId, senderId, message_text]
            );

            io.to(`user_${recipientId}`).emit("receive_message", {
                senderId,
                message_text,
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
        console.log("🔴 Socket disconnected:", socket.id);
    });
});

/* =====================================================
   7. START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);
