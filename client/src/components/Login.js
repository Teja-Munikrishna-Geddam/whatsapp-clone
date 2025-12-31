import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://whatsapp-clone-g9vw.onrender.com/api/login", { username, email });
      localStorage.setItem("chat_user", JSON.stringify(res.data));
      setUser(res.data);

      // CRITICAL: This reloads the whole app so SocketProvider gets the new userId
      window.location.href = "/";
    } catch (err) {
      console.error("Login failed", err);
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