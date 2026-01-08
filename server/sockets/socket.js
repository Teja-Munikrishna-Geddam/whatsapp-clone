export default function socketHandler(io, pool) {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    socket.on("register_user", (userId) => {
      onlineUsers.set(String(userId), socket.id);
      socket.join(`user_${userId}`);
      io.emit("get_online_users", [...onlineUsers.keys()]);
    });

    socket.on("send_private_message", async (data) => {
      const { senderId, recipientId, message_text, conversationId } = data;

      await pool.query(
        "INSERT INTO messages (conversation_id, sender_id, message_text) VALUES ($1,$2,$3)",
        [conversationId, senderId, message_text]
      );

      io.to(`user_${recipientId}`).emit("receive_message", {
        senderId,
        message_text,
        conversationId
      });
    });

    socket.on("disconnect", () => {
      for (let [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) onlineUsers.delete(uid);
      }
      io.emit("get_online_users", [...onlineUsers.keys()]);
    });
  });
}
