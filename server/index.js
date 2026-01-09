require("dotenv").config();

const express = require("express");
const http = require("http");
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
const cors = require("cors");

app.use(cors({
  origin: "https://teja-munikrishna-geddam.github.io",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ THIS automatically handles OPTIONS safely in Express 5
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

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
