import React, { useState } from 'react';
import axios from 'axios';

const API = "https://whatsapp-clone-wds9.onrender.com";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    if (!username || !email) {
      alert("Please enter username and email");
      return;
    }

    try {
      const res = await axios.post(`${API}/api/login`,
        { username, email }
      );

      localStorage.setItem("chat_user", JSON.stringify(res.data));
      setUser(res.data);


    } catch (err) {
      if (err.response?.status === 409) {
        alert("Username already taken. Try another one.");
      } else {
        console.error("Login failed:", err.response?.data || err.message);
        alert("Login failed");
      }
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