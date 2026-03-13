require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const pool = require("./db/pool");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const socketHandler = require("./sockets/socket");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/messages.routes");
const conversationRoutes = require("./routes/conversation.routes");

const app = express();
const server = http.createServer(app);

/* 🔥 CORS MUST BE FIRST */
app.use(cors({
  origin: [
    "https://teja-munikrishna-geddam.github.io",
    "https://whatsapp-clone-frontend-dt6j.onrender.com",
    "https://teja-munikrishna-geddam.github.io/whatsapp-clone",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

/* 🔥 REQUIRED for preflight */
app.options("*", cors());

app.use(express.json());


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://teja-munikrishna-geddam.github.io");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "https://whatsapp-clone-frontend-dt6j.onrender.com");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});



/* ✅ ROUTES (THIS WAS MISSING) */
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/messages", messageRoutes);
/* 🔍 LOGIN TEST */

app.get("/api/login-test", (req, res) => {
  res.json({ ok: true });
});

/* 🔍 HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("Backend OK");
});

const initDB = require("./db/init");
initDB(pool);

/* 🔌 SOCKET.IO */
const io = new Server(server, {
  cors: {
    origin: "https://whatsapp-clone-frontend-dt6j.onrender.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });
});


socketHandler(io, pool);

/* 🚀 START */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
