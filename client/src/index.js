import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SocketProvider } from './context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

// We get the user ID here once before the app starts
const getUserId = () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem("chat_user"));
    return savedUser ? savedUser.id : null;
  } catch (e) {
    return null;
  }
};

const userId = getUserId();

root.render(
  <React.StrictMode>
    <SocketProvider userId={userId}>
      <App />
    </SocketProvider>
  </React.StrictMode>
);