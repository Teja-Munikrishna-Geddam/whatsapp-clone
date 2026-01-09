import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!userId) return;

        const newSocket = io("https://whatsapp-clone-lhb1.onrender.com");
        setSocket(newSocket);

        newSocket.emit("register_user", userId);

        newSocket.on("get_online_users", setOnlineUsers);

        return () => newSocket.disconnect();
    }, [userId]);


    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);