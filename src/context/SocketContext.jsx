import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Connect and get the socket instance
        const socketInstance = socketService.connect(token);
        setSocket(socketInstance);

        // Set up event listeners
        const handleConnect = () => {
          console.log('Socket connected successfully');
          setIsConnected(true);
          setConnectionError(null);
        };

        const handleDisconnect = (reason) => {
          console.log('Socket disconnected:', reason);
          setIsConnected(false);
        };

        const handleConnectError = (error) => {
          console.error('Socket connection error:', error);
          setConnectionError(error.message);
          setIsConnected(false);
        };

        const handleError = (error) => {
          console.error('Socket error:', error);
          setConnectionError(error.message);
        };

        const handleReconnect = () => {
          console.log('Socket reconnected');
          setIsConnected(true);
          setConnectionError(null);
        };

        // Add event listeners
        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);
        socketInstance.on('error', handleError);
        socketInstance.on('reconnect', handleReconnect);

        // Check if already connected
        if (socketInstance.connected) {
          handleConnect();
        }

        // Cleanup function
        return () => {
          console.log('Cleaning up socket connection');
          
          // Remove event listeners
          socketInstance.off('connect', handleConnect);
          socketInstance.off('disconnect', handleDisconnect);
          socketInstance.off('connect_error', handleConnectError);
          socketInstance.off('error', handleError);
          socketInstance.off('reconnect', handleReconnect);
          
          // Disconnect socket
          socketService.disconnect();
          setSocket(null);
          setIsConnected(false);
          setConnectionError(null);
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setConnectionError(error.message);
      }
    } else {
      console.warn('No token found, socket connection not initialized');
    }
  }, []);

  const value = {
    socket,
    isConnected,
    connectionError,
    socketService
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};