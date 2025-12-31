import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    try {
      // 1. Send the data to the backend
      const res = await axios.post("https://whatsapp-clone-g9vw.onrender.com/api/login", {
        username,
        email
      });

      // 2. If successful, save the user
      localStorage.setItem("chat_user", JSON.stringify(res.data));
      setUser(res.data);

      // 3. Navigate to the main chat page (don't use window.location if using React Router)
      // If you aren't using a router, window.location.href = "/" is fine.
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert("Login failed! Check console for details.");
    }
  };
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Welcome to WhatsApp Clone</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} /><br />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br />
      <button onClick={handleLogin}>Join Chat</button>
    </div>
  );
};

export default Login;