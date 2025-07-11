import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    // If already connected, return existing socket
    if (this.socket && this.socket.connected) {
      // console.log('Socket already connected, returning existing instance');
      return this.socket;
    }

    // If already connecting, return the socket instance
    if (this.isConnecting) {
      // console.log('Socket is connecting, returning pending instance');
      return this.socket;
    }

    this.isConnecting = true;

    // Remove /api/v1 from the URL for Socket.IO connection
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const API_BASE_URL = BACKEND_URL.replace('/api/v1', '');
    
    // console.log('Connecting to socket server:', API_BASE_URL);
    
    // Connect to the default namespace (no /chat or other namespace)
    this.socket = io(API_BASE_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });

    // Set up internal event listeners
    this.socket.on('connect', () => {
      // console.log('Connected to server with ID:', this.socket.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      // console.log('Disconnected from server:', reason);
      this.isConnecting = false;
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      // console.error('Connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        // console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      // console.error('Socket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      // console.log('Reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_failed', () => {
      // console.error('Reconnection failed after all attempts');
    });

    // Listen for room join confirmations
    this.socket.on('contact_room_joined', (data) => {
      // console.log('Successfully joined contact room:', data.contactId);
    });

    this.socket.on('contact_room_left', (data) => {
      // console.log('Successfully left contact room:', data.contactId);
    });

    this.socket.on('admin_room_joined', () => {
      // console.log('Successfully joined admin room');
    });

    this.socket.on('admin_room_left', () => {
      // console.log('Successfully left admin room');
    });

    return this.socket;
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  disconnect() {
    if (this.socket) {
      // console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  // Contact room management
  joinContactRoom(contactId) {
    if (this.socket && this.socket.connected && contactId) {
      // console.log('Joining contact room:', contactId);
      this.socket.emit('join_contact_room', { contactId });
    } else {
      // console.warn('Cannot join contact room: socket not connected or invalid contactId');
    }
  }

  leaveContactRoom(contactId) {
    if (this.socket && this.socket.connected && contactId) {
      // console.log('Leaving contact room:', contactId);
      this.socket.emit('leave_contact_room', { contactId });
    } else {
      // console.warn('Cannot leave contact room: socket not connected or invalid contactId');
    }
  }

  // Admin room management
  joinAdminRoom() {
    if (this.socket && this.socket.connected) {
      // console.log('Joining admin room');
      this.socket.emit('join_admin_room');
    } else {
      // console.warn('Cannot join admin room: socket not connected');
    }
  }

  leaveAdminRoom() {
    if (this.socket && this.socket.connected) {
      // console.log('Leaving admin room');
      this.socket.emit('leave_admin_room');
    } else {
      // console.warn('Cannot leave admin room: socket not connected');
    }
  }

  // Typing indicators
  startTyping(contactId) {
    if (this.socket && this.socket.connected && contactId) {
      this.socket.emit('user_typing', { contactId });
    } else {
      // console.warn('Cannot send typing indicator: socket not connected or invalid contactId');
    }
  }

  stopTyping(contactId) {
    if (this.socket && this.socket.connected && contactId) {
      this.socket.emit('user_stopped_typing', { contactId });
    } else {
      // console.warn('Cannot stop typing indicator: socket not connected or invalid contactId');
    }
  }

  // Admin typing indicators
  startAdminTyping(contactId) {
    if (this.socket && this.socket.connected && contactId) {
      this.socket.emit('admin_typing', { contactId });
    } else {
      // console.warn('Cannot send admin typing indicator: socket not connected or invalid contactId');
    }
  }

  stopAdminTyping(contactId) {
    if (this.socket && this.socket.connected && contactId) {
      this.socket.emit('admin_stopped_typing', { contactId });
    } else {
      // console.warn('Cannot stop admin typing indicator: socket not connected or invalid contactId');
    }
  }

  // Send message
  sendMessage(contactId, message) {
    if (this.socket && this.socket.connected && contactId && message) {
      this.socket.emit('send_message', {
        contactId,
        message,
        timestamp: new Date().toISOString()
      });
    } else {
      // console.warn('Cannot send message: socket not connected or invalid data');
    }
  }

  // Mark message as read
  markMessageAsRead(contactId, messageId) {
    if (this.socket && this.socket.connected && contactId && messageId) {
      this.socket.emit('mark_message_read', { contactId, messageId });
    } else {
      // console.warn('Cannot mark message as read: socket not connected or invalid data');
    }
  }

  // Update contact status (admin only)
  updateContactStatus(contactId, status) {
    if (this.socket && this.socket.connected && contactId && status) {
      this.socket.emit('update_contact_status', { contactId, status });
    } else {
      // console.warn('Cannot update contact status: socket not connected or invalid data');
    }
  }

  // Get connection status
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  // Emit custom events
  emit(eventName, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventName, data);
    } else {
      // console.warn(`Cannot emit ${eventName}: socket not connected`);
    }
  }

  // Listen to custom events
  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  // Remove custom event listeners
  off(eventName, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(eventName, callback);
      } else {
        this.socket.off(eventName);
      }
    }
  }

  // Event listeners for specific events
  onNewResponse(callback) {
    if (this.socket) {
      this.socket.on('new_response', callback);
    }
  }

  offNewResponse(callback) {
    if (this.socket) {
      this.socket.off('new_response', callback);
    }
  }

  onAdminResponse(callback) {
    if (this.socket) {
      this.socket.on('admin_response', callback);
    }
  }

  offAdminResponse(callback) {
    if (this.socket) {
      this.socket.off('admin_response', callback);
    }
  }

  onStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('status_update', callback);
    }
  }

  offStatusUpdate(callback) {
    if (this.socket) {
      this.socket.off('status_update', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  offUserTyping(callback) {
    if (this.socket) {
      this.socket.off('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  offUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.off('user_stopped_typing', callback);
    }
  }

  onAdminTyping(callback) {
    if (this.socket) {
      this.socket.on('admin_typing', callback);
    }
  }

  offAdminTyping(callback) {
    if (this.socket) {
      this.socket.off('admin_typing', callback);
    }
  }

  onAdminStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('admin_stopped_typing', callback);
    }
  }

  offAdminStoppedTyping(callback) {
    if (this.socket) {
      this.socket.off('admin_stopped_typing', callback);
    }
  }

  // Notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  offNotification(callback) {
    if (this.socket) {
      this.socket.off('notification', callback);
    }
  }

  // Admin-specific events
  onNewContactMessage(callback) {
    if (this.socket) {
      this.socket.on('new_contact_message', callback);
    }
  }

  offNewContactMessage(callback) {
    if (this.socket) {
      this.socket.off('new_contact_message', callback);
    }
  }

  onContactStatusUpdated(callback) {
    if (this.socket) {
      this.socket.on('contact_status_updated', callback);
    }
  }

  offContactStatusUpdated(callback) {
    if (this.socket) {
      this.socket.off('contact_status_updated', callback);
    }
  }

  onUserResponse(callback) {
    if (this.socket) {
      this.socket.on('user_response', callback);
    }
  }

  offUserResponse(callback) {
    if (this.socket) {
      this.socket.off('user_response', callback);
    }
  }

  onMessageReadUpdate(callback) {
    if (this.socket) {
      this.socket.on('message_read_update', callback);
    }
  }

  offMessageReadUpdate(callback) {
    if (this.socket) {
      this.socket.off('message_read_update', callback);
    }
  }
}

export const socketService = new SocketService();