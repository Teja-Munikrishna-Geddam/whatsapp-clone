import React, { useState } from 'react';

const Sidebar = ({ contacts = [], onSelectContact, onlineUsers = [], onLogout }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!contacts) return <div>Loading contacts...</div>;

  const filteredContacts = contacts.filter(c =>
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: '350px', borderRight: '1px solid #ddd', height: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '15px', background: '#00a884', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px' }}>Chats</h2>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '10px', background: '#f6f6f6' }}>
        <input
          placeholder="Search or start new chat"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
        />
      </div>

      {/* Contacts List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredContacts.map((contact) => {
          const isOnline = onlineUsers.includes(String(contact.id));
          return (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              style={{ padding: '15px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>
                  {contact.username[0].toUpperCase()}
                </div>
                {isOnline && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', background: '#06d755', borderRadius: '50%', border: '2px solid #fff' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600' }}>{contact.username}</div>
                <div style={{ fontSize: '13px', color: '#667781' }}>{isOnline ? 'online' : 'offline'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;