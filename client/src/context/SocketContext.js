import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, userId }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // CHANGE THIS LINE:
        const newSocket = io("https://whatsapp-clone-g9vw.onrender.com");
        setSocket(newSocket);

        if (userId) {
            newSocket.emit("register_user", userId);
        }

        newSocket.on("get_online_users", (users) => {
            setOnlineUsers(users);
        });

        return () => newSocket.close();
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);