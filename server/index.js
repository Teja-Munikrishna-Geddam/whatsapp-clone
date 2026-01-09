require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const pool = require("./db/pool");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const socketHandler = require("./sockets/socket");

const app = express();
const server = http.createServer(app);

/* 🔥 CORS MUST BE FIRST */
app.use(cors({
  origin: [
    "https://teja-munikrishna-geddam.github.io",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

/* 🔥 REQUIRED for preflight */
app.options("*", cors());

app.use(express.json());

/* ✅ ROUTES (THIS WAS MISSING) */
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);

/* 🔍 HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("Backend OK");
});

/* 🔌 SOCKET.IO */
const io = new Server(server, {
  cors: {
    origin: "https://teja-munikrishna-geddam.github.io"
  }
});

socketHandler(io, pool);

/* 🚀 START */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
