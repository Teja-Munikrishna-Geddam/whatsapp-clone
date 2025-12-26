const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client
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
    connectionString: process.env.DATABASE_URL // Set this in your .env file
});

// Map to track online users: { userId: socketId }
let onlineUsers = new Map();

io.on('connection', (socket) => {

    // User logs in and registers their socket
    socket.on("register_user", (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.join(`user_${userId}`); // Private room for this user
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });

    // Sending a private message
    socket.on("send_private_message", async (data) => {
        const { senderId, recipientId, message, conversationId } = data;

        // 1. Save message to PostgreSQL
        await db.query(
            "INSERT INTO messages (conversation_id, sender_id, message_text) VALUES ($1, $2, $3)",
            [conversationId, senderId, message]
        );

        // 2. Emit to recipient's private room
        socket.to(`user_${recipientId}`).emit("receive_message", {
            senderId,
            message,
            conversationId
        });
    });

    socket.on("disconnect", () => {
        // Remove user from online map
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });
});

server.listen(5000, () => console.log("Backend running on port 5000"));