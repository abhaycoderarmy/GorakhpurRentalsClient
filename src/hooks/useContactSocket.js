import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export const useContactSocket = (contactId) => {
  const { socketService, isConnected } = useSocket();
  const [typingUsers, setTypingUsers] = useState([]);
  const [newResponses, setNewResponses] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState(null);

  // Join/Leave contact room
  useEffect(() => {
    if (isConnected && contactId && socketService) {
      console.log('useContactSocket: Joining contact room:', contactId);
      socketService.joinContactRoom(contactId);
      
      return () => {
        console.log('useContactSocket: Leaving contact room:', contactId);
        socketService.leaveContactRoom(contactId);
      };
    }
  }, [contactId, isConnected, socketService]);

  // Handle new responses
  const handleNewResponse = useCallback((data) => {
    console.log('useContactSocket: New response received:', data);
    if (data.contactId === contactId) {
      setNewResponses(prev => [...prev, data.response]);
    }
  }, [contactId]);

 const handleAdminResponse = useCallback((data) => {
  console.log('useContactSocket: Admin response received:', data);
  if (data.contactId === contactId) {
    setNewResponses(prev => [...prev, data.response]);
    
    // ADD THIS: Trigger notification
    if (window.showNotification) {
      window.showNotification('New Response', 'You have received a new response from support');
    }
  }
}, [contactId]);

  // Handle status updates
  const handleStatusUpdate = useCallback((data) => {
    console.log('useContactSocket: Status update received:', data);
    if (data.contactId === contactId) {
      setStatusUpdates(data);
    }
  }, [contactId]);

  // Handle typing indicators
  const handleUserTyping = useCallback((data) => {
    console.log('useContactSocket: User typing:', data);
    if (data.contactId === contactId) {
      setTypingUsers(prev => {
        const existingUser = prev.find(user => user.userId === data.userId);
        if (!existingUser) {
          return [...prev, data];
        }
        return prev;
      });
    }
  }, [contactId]);

  const handleUserStoppedTyping = useCallback((data) => {
    console.log('useContactSocket: User stopped typing:', data);
    if (data.contactId === contactId) {
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    }
  }, [contactId]);

  const handleAdminTyping = useCallback((data) => {
    console.log('useContactSocket: Admin typing:', data);
    if (data.contactId === contactId) {
      setTypingUsers(prev => {
        const existingAdmin = prev.find(user => user.userId === data.adminId && user.isAdmin);
        if (!existingAdmin) {
          return [...prev, { ...data, userId: data.adminId, isAdmin: true }];
        }
        return prev;
      });
    }
  }, [contactId]);

  const handleAdminStoppedTyping = useCallback((data) => {
    console.log('useContactSocket: Admin stopped typing:', data);
    if (data.contactId === contactId) {
      setTypingUsers(prev => prev.filter(user => !(user.userId === data.adminId && user.isAdmin)));
    }
  }, [contactId]);

  // Socket event listeners
  useEffect(() => {
    if (socketService && isConnected) {
      // Register event listeners
      socketService.on('new_response', handleNewResponse);
      socketService.on('admin_response', handleAdminResponse);
      socketService.on('status_update', handleStatusUpdate);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stopped_typing', handleUserStoppedTyping);
      socketService.on('admin_typing', handleAdminTyping);
      socketService.on('admin_stopped_typing', handleAdminStoppedTyping);

      return () => {
        // Cleanup event listeners
        socketService.off('new_response', handleNewResponse);
        socketService.off('admin_response', handleAdminResponse);
        socketService.off('status_update', handleStatusUpdate);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stopped_typing', handleUserStoppedTyping);
        socketService.off('admin_typing', handleAdminTyping);
        socketService.off('admin_stopped_typing', handleAdminStoppedTyping);
      };
    }
  }, [
    socketService,
    isConnected,
    handleNewResponse,
    handleAdminResponse,
    handleStatusUpdate,
    handleUserTyping,
    handleUserStoppedTyping,
    handleAdminTyping,
    handleAdminStoppedTyping
  ]);

  // Utility functions
  const clearNewResponses = useCallback(() => {
    setNewResponses([]);
  }, []);

  const clearStatusUpdates = useCallback(() => {
    setStatusUpdates(null);
  }, []);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (socketService && isConnected && contactId) {
      if (isTyping) {
        socketService.emit('user_typing', { contactId });
      } else {
        socketService.emit('user_stopped_typing', { contactId });
      }
    }
  }, [socketService, isConnected, contactId]);

  const sendMessage = useCallback((message) => {
    if (socketService && isConnected && contactId) {
      socketService.emit('send_message', {
        contactId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }, [socketService, isConnected, contactId]);

  const startTyping = useCallback(() => {
    if (socketService && isConnected && contactId) {
      socketService.startTyping(contactId);
    }
  }, [socketService, isConnected, contactId]);

  const stopTyping = useCallback(() => {
    if (socketService && isConnected && contactId) {
      socketService.stopTyping(contactId);
    }
  }, [socketService, isConnected, contactId]);
  // ADD THIS:
const markAsRead = useCallback((responseId) => {
  if (socketService && isConnected && contactId) {
    socketService.emit('mark_as_read', {
      contactId,
      responseId
    });
  }
}, [socketService, isConnected, contactId]);

  return {
  typingUsers,
  newResponses,
  statusUpdates,
  isConnected,
  clearNewResponses,
  clearStatusUpdates,
  sendTypingIndicator,
  sendMessage,
  startTyping,
  stopTyping,
  markAsRead  // ADD THIS
};
}