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
      axios.get(`http://localhost:5000/api/users/${user.id}`)
        .then(res => setContacts(res.data))
        .catch(err => console.error("Error fetching users:", err));
    }
  }, [user]);

  // 2. Fetch Message History when clicking a contact
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (activeContact && user) {
        try {
          // 1. Get the Conversation ID for these two users
          const convoRes = await axios.get(
            `http://localhost:5000/api/conversation/${user.id}/${activeContact.id}`
          );
          const convoId = convoRes.data.id;
          setCurrentConvoId(convoId);

          // 2. Fetch all previous messages for this conversation
          const msgRes = await axios.get(
            `http://localhost:5000/api/messages/${convoId}`
          );

          // 3. Update the UI with the history
          // We format the senderId so the ChatWindow knows which side to show the bubble on
          const formattedMessages = msgRes.data.map(m => ({
            ...m,
            senderId: m.sender_id === user.id ? "me" : m.sender_id
          }));

          setMessages(formattedMessages);
        } catch (error) {
          console.error("Error loading chat history:", error);
        }
      }
    };

    fetchChatHistory();
  }, [activeContact, user]); // Triggered every time you click a different contact

  // 3. Listen for incoming socket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      console.log("New message received:", data);

      // Convert both to Strings to ensure the comparison works 100%
      if (String(data.conversationId) === String(currentConvoId)) {
        setMessages((prev) => [
          ...prev,
          {
            sender_id: data.senderId, // Keep original ID for logic
            senderId: data.senderId,    // For ChatWindow bubble alignment
            message_text: data.message_text,
            conversationId: data.conversationId
          }
        ]);
      }
    };


    socket.on("receive_message", handleMessage);

    return () => socket.off("receive_message", handleMessage);
  }, [socket, currentConvoId]);

  const sendMessage = (text) => {
    const messageData = {
      senderId: user.id,
      recipientId: activeContact.id,
      message_text: text,
      conversationId: currentConvoId
    };
    socket.emit("send_private_message", messageData);
    setMessages(prev => [...prev, { ...messageData, senderId: "me" }]);
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