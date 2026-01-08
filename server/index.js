import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import pool from "./db/pool.js";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import socketHandler from "./sockets/socket.js";

const app = express();

app.use(cors({
  origin: "https://teja-munikrishna-geddam.github.io"
}));
app.use(express.json());

app.get("/", (_, res) => res.send("🚀 Backend running"));

app.use("/api", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api", chatRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "https://teja-munikrishna-geddam.github.io" }
});

socketHandler(io, pool);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on ${PORT}`)
);
