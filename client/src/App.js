import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import { useSocket } from "./context/SocketContext";

const API = REACT_APP_API;

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("chat_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [currentConvoId, setCurrentConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const { socket, onlineUsers } = useSocket();

  /* --------------------------------------------------
     1️⃣ FETCH CONTACTS
  -------------------------------------------------- */
  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`${API}/api/users/${user.id}`)
      .then(res => setContacts(res.data))
      .catch(err => console.error("Fetch users error:", err));
  }, [user]);

  /* --------------------------------------------------
     2️⃣ LOAD / CREATE CONVERSATION (ON CONTACT CLICK)
  -------------------------------------------------- */
  useEffect(() => {
    if (!activeContact || !user) return;

    const loadConversation = async () => {
      try {
        const res = await axios.get(
          `${API}/api/conversation/${user.id}/${activeContact.id}`
        );
        setCurrentConvoId(res.data.id);
      } catch (err) {
        console.error("Conversation error:", err);
      }
    };

    loadConversation();
  }, [activeContact, user]);

  /* --------------------------------------------------
     3️⃣ LOAD MESSAGES (WHEN CONVERSATION CHANGES)
  -------------------------------------------------- */
  useEffect(() => {
    if (!currentConvoId || !user?.id) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `${API}/api/messages/${currentConvoId}`
        );

        setMessages(
          res.data.map(m => ({
            ...m,
            senderId: m.sender_id === user.id ? "me" : m.sender_id
          }))
        );
      } catch (err) {
        console.error("Message load error:", err);
        setMessages([]);
      }
    };

    loadMessages();
  }, [currentConvoId, user?.id]);


  /* --------------------------------------------------
     4️⃣ SOCKET LISTENER (STRICTLY PER CONVERSATION)
  -------------------------------------------------- */
  useEffect(() => {
    if (!socket || !currentConvoId) return;

    const handleMessage = (data) => {

      // 🔒 THIS LINE PREVENTS MESSAGE LEAKING
      if (String(data.conversationId) !== String(currentConvoId)) return;

      setMessages(prev => [
        ...prev,
        {
          senderId: data.senderId === user.id ? "me" : data.senderId,
          message_text: data.message_text,
          conversationId: data.conversationId
        }
      ]);
    };

    socket.on("receive_message", handleMessage);

    return () => socket.off("receive_message", handleMessage);

  }, [socket, currentConvoId, user?.id]);


  /* --------------------------------------------------
     5️⃣ SEND MESSAGE
  -------------------------------------------------- */
  const sendMessage = (text) => {
    if (!socket || !currentConvoId || !activeContact) return;

    const messageData = {
      senderId: user.id,
      recipientId: activeContact.id,
      message_text: text,
      conversationId: currentConvoId
    };

    socket.emit("send_private_message", messageData);

    setMessages(prev => [
      ...prev,
      { ...messageData, senderId: "me" }
    ]);
  };

  /* --------------------------------------------------
     6️⃣ LOGOUT
  -------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("chat_user");
    setUser(null);
    window.location.reload();
  };

  /* --------------------------------------------------
     AUTH GUARD
  -------------------------------------------------- */
  if (!user) return <Login setUser={setUser} />;

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar
        contacts={contacts}
        onlineUsers={onlineUsers}
        onLogout={handleLogout}
        onSelectContact={(contact) => {
          setActiveContact(contact);
          setMessages([]);        // 🔥 CRITICAL RESET
          setCurrentConvoId(null);
        }}
      />

      {activeContact ? (
        <ChatWindow
          activeContact={activeContact}
          messages={messages}
          sendMessage={sendMessage}
        />
      ) : (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}

export default App;
