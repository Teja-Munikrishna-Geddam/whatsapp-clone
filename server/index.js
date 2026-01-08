require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const pool = require("./db/pool");

// routes
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const chatRoutes = require("./routes/chat.routes");

// sockets
const socketHandler = require("./sockets/socket");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
  origin: "https://teja-munikrishna-geddam.github.io"
}));
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.get("/", (_, res) => {
  res.send("🚀 WhatsApp Clone Backend Running");
});

app.use("/api", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api", chatRoutes);

/* ---------------- SOCKET ---------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://teja-munikrishna-geddam.github.io"
  }
});

socketHandler(io, pool);

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
