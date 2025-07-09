import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export const useNotifications = () => {
  const { socketService, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);

  // Handle new notifications
  const handleNotification = useCallback((data) => {
    const notification = {
      id: Date.now() + Math.random(),
      type: data.type,
      title: data.title,
      message: data.message,
      contactId: data.contactId,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

 // Replace the useEffect that sets up notification listener:
useEffect(() => {
  if (isConnected && socketService) {
    // Listen for admin responses
    socketService.on('admin_response', (data) => {
      handleNotification({
        type: 'admin_response',
        title: 'New Response',
        message: `You have a new response for: ${data.subject}`,
        contactId: data.contactId
      });
    });

    // Listen for status changes
    socketService.on('status_change', (data) => {
      handleNotification({
        type: 'status_change',
        title: 'Status Updated',
        message: `Message status changed to: ${data.newStatus}`,
        contactId: data.contactId
      });
    });

    // Listen for new contact messages (add this)
    socketService.on('new_contact_message', (data) => {
      handleNotification({
        type: 'new_contact_message',
        title: 'New Contact Message',
        message: `${data.firstName} ${data.lastName}: ${data.subject}`,
        contactId: data._id
      });
    });

    // Listen for user responses (add this)
    socketService.on('user_response', (data) => {
      handleNotification({
        type: 'user_response',
        title: 'New User Response',
        message: `User replied: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`,
        contactId: data.contactId
      });
    });

    // Listen for new messages
    socketService.on('new_message', (data) => {
      handleNotification({
        type: 'new_message',
        title: 'Message Sent',
        message: 'Your message has been sent successfully',
        contactId: data.contactId
      });
    });
    
    return () => {
      socketService.off('admin_response');
      socketService.off('status_change');
      socketService.off('new_message');
       socketService.off('new_contact_message');
      socketService.off('user_response');
    };
  }
}, [isConnected, handleNotification, socketService]);

  // Remove specific notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  }, []);

  return {
    notifications,
    removeNotification,
    clearAllNotifications,
    markAsRead
  };
};