import React from 'react';

const Sidebar = ({ contacts, onSelectContact, onlineUsers }) => {
  return (
    <div style={{ width: '300px', borderRight: '1px solid #ddd', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ padding: '20px', background: '#00a884', color: 'white' }}>
        <h3>Chats</h3>
      </div>
      <div style={{ overflowY: 'auto' }}>
        {contacts.map((user) => (
          <div 
            key={user.id} 
            onClick={() => onSelectContact(user)}
            style={{ 
              padding: '15px', 
              cursor: 'pointer', 
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white'
            }}
          >
            <div style={{ 
              width: '10px', height: '10px', borderRadius: '50%', 
              backgroundColor: onlineUsers.includes(user.id.toString()) ? '#06d755' : '#ccc',
              marginRight: '10px'
            }} />
            {user.username}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;