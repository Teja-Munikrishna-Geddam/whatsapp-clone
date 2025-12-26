import React, { useState } from 'react';

const ChatWindow = ({ activeContact, messages, sendMessage }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  if (!activeContact) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      Select a contact to start chatting
    </div>;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '15px', background: '#f0f2f5', borderBottom: '1px solid #ddd' }}>
        <strong>{activeContact.username}</strong>
      </div>
      
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#e5ddd5' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.senderId === "me" ? 'flex-end' : 'flex-start',
            background: msg.senderId === "me" ? '#dcf8c6' : 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            margin: '5px 0',
            maxWidth: '60%'
          }}>
            {msg.message_text}
          </div>
        ))}
      </div>

      <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
        <input 
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSend} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#00a884', color: 'white' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;