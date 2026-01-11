import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import { useSocket } from "./context/SocketContext";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("chat_user");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Invalid user data in localStorage");
      return null;
    }
  });
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentConvoId, setCurrentConvoId] = useState(null);
  const { socket, onlineUsers } = useSocket();


  // 1. Fetch Contacts
  useEffect(() => {
    if (user && user.id) {
      axios.get(`https://whatsapp-clone-lhb1.onrender.com/api/users/${user.id}`)
        .then(res => setContacts(res.data))
        .catch(err => console.error("Error fetching users:", err));
    }
  }, [user]);

  // CLEAR messages when switching contacts
  useEffect(() => {
    setMessages([]);
    setCurrentConvoId(null);
  }, [activeContact]);


  // 2. Fetch Message History when clicking a contact
  useEffect(() => {
    const loadConversation = async () => {
      if (!activeContact || !user) return;

      try {
        // 1️⃣ Get conversation
        const convoRes = await axios.get(
          `https://whatsapp-clone-lhb1.onrender.com/api/conversation/${user.id}/${activeContact.id}`
        );

        const convoId = convoRes.data.id;
        setCurrentConvoId(convoId);

        // 2️⃣ Load messages ONLY for this conversation
        const msgRes = await axios.get(
          `https://whatsapp-clone-lhb1.onrender.com/api/messages/${convoId}`
        );

        const formatted = msgRes.data.map(m => ({
          ...m,
          senderId: m.sender_id === user.id ? "me" : m.sender_id
        }));

        setMessages(formatted);

      } catch (err) {
        console.error("Error loading chat history:", err);
        setMessages([]);
      }
    };

    loadConversation();
  }, [activeContact, user]);

  // Triggered every time you click a different contact

  // 3. Listen for incoming socket messages
  useEffect(() => {
    if (!socket || !currentConvoId) return;

    const handleMessage = (data) => {
      if (String(data.conversationId) !== String(currentConvoId)) {
        return; // 🔒 Ignore other conversations
      }

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

  }, [socket, currentConvoId]);


  const sendMessage = (text) => {
    if (!socket) {
      console.warn("Socket not connected yet");
      return;
    }

    if (!currentConvoId || !activeContact) {
      console.warn("No active conversation");
      return;
    }

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


  const handleLogout = () => {
    localStorage.removeItem("chat_user"); // Clear the saved user
    setUser(null); // Reset state
    window.location.reload(); // Refresh to reset socket connection
  };

  // If no user is logged in, show the Login screen
  if (!user) {
    return <Login setUser={setUser} />;
  }



  // If user is logged in, show the main Chat UI
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", backgroundColor: "#f0f2f5" }}>
      <Sidebar
        contacts={contacts}
        onSelectContact={setActiveContact}
        onlineUsers={onlineUsers}
        onLogout={handleLogout}
      />

      {activeContact ? (
        <ChatWindow
          activeContact={activeContact}
          messages={messages}
          sendMessage={sendMessage}
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
          <div style={{ width: '250px', height: '250px', opacity: 0.5, backgroundImage: 'url(https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5z23.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
          <h1 style={{ color: '#41525d', marginTop: '20px', fontWeight: '300' }}>WhatsApp Web</h1>
          <p style={{ color: '#667781' }}>Send and receive messages without keeping your phone online.</p>
        </div>
      )}
    </div>
  );
}

// THIS MUST BE AT THE VERY BOTTOM AT THE TOP LEVEL
export default App;