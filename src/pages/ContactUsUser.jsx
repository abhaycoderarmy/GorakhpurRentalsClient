import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageCircle,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  User,
  Calendar,
  Filter,
  Search,
  Lock,
  Archive,
  Menu,
  ChevronDown,
  Wifi,
  WifiOff,
  Bell,
} from "lucide-react";
import Footer from "../components/Footer";
import { useSocket } from "../context/SocketContext";
import { useContactSocket } from "../hooks/useContactSocket";
import { useNotifications } from "../hooks/useNotifications";

const ContactUserDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newResponse, setNewResponse] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [messageDetailsLoading, setMessageDetailsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Socket hooks
  const { socketService, isConnected } = useSocket();
  const { notifications, removeNotification, clearAllNotifications } =
    useNotifications();

  // Contact socket hook for the selected message
  const {
    typingUsers,
    newResponses,
    statusUpdates,
    startTyping,
    stopTyping,
    markAsRead,
    clearNewResponses,
    clearStatusUpdates,
    isConnected: contactSocketConnected,
  } = useContactSocket(selectedMessage?._id);

  // Refs for managing typing indicators
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Simplified new message form state
  const [newMessageData, setNewMessageData] = useState({
    subject: "",
    message: "",
  });
  const [submittingNewMessage, setSubmittingNewMessage] = useState(false);

  useEffect(() => {
    console.log("Socket service connection status:", isConnected);
    console.log("Contact socket connection status:", contactSocketConnected);
    console.log("Socket service instance:", socketService);

    if (socketService && socketService.socket) {
      console.log("Socket connected:", socketService.socket.connected);
      console.log("Socket id:", socketService.socket.id);

      // Listen for connection events
      const handleConnect = () => {
        console.log("Socket connected successfully");
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
      };

      const handleConnectError = (error) => {
        console.error("Socket connection error:", error);
      };

      socketService.socket.on("connect", handleConnect);
      socketService.socket.on("disconnect", handleDisconnect);
      socketService.socket.on("connect_error", handleConnectError);

      return () => {
        // Add null check before calling .off()
        if (socketService && socketService.socket) {
          socketService.socket.off("connect", handleConnect);
          socketService.socket.off("disconnect", handleDisconnect);
          socketService.socket.off("connect_error", handleConnectError);
        }
      };
    }
  }, [socketService, isConnected, contactSocketConnected]);
  // Handle new responses from socket
  useEffect(() => {
    if (newResponses.length > 0 && selectedMessage) {
      // Add new responses to the selected message
      console.log("Processing new responses:", newResponses);
      setSelectedMessage((prev) => ({
        ...prev,
        responses: [...(prev.responses || []), ...newResponses],
      }));

      // Clear the new responses after processing
      clearNewResponses();

      // Scroll to bottom after a brief delay
      setTimeout(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [newResponses, selectedMessage, clearNewResponses]);

  // Handle status updates from socket
  useEffect(() => {
    if (statusUpdates && selectedMessage) {
      // Update the selected message status
      setSelectedMessage((prev) => ({
        ...prev,
        status: statusUpdates.newStatus,
        priority: statusUpdates.priority || prev.priority,
      }));

      // Update the message in the list
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === statusUpdates.contactId
            ? {
                ...msg,
                status: statusUpdates.newStatus,
                priority: statusUpdates.priority || msg.priority,
              }
            : msg
        )
      );

      clearStatusUpdates();
    }
  }, [statusUpdates, selectedMessage, clearStatusUpdates]);

  // Handle typing indicators
  // Replace this function:
  const handleInputChange = (e) => {
    setNewResponse(e.target.value);

    // Only proceed if we have a selected message and socket connection
    if (selectedMessage && contactSocketConnected) {
      // Start typing indicator
      startTyping();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 1000);
    }
  };

  // // Replace the existing auto-scroll useEffect:
  useEffect(() => {
    if (messageEndRef.current && messageContainerRef.current) {
      // Scroll the message container, not the entire page
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [selectedMessage?.responses, newResponses]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, [API_BASE_URL]);

  // Fetch message details with proper error handling and loading state
  const fetchMessageDetails = useCallback(
    async (messageId) => {
      if (!messageId) return;

      try {
        setMessageDetailsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedMessage(data);
          setSidebarOpen(false);

          // Mark messages as read
          if (data.responses && data.responses.length > 0) {
            const lastResponse = data.responses[data.responses.length - 1];
            if (lastResponse.id) {
              markAsRead(lastResponse.id);
            }
          }
        } else {
          console.error(
            "Failed to fetch message details:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching message details:", error);
      } finally {
        setMessageDetailsLoading(false);
      }
    },
    [API_BASE_URL, markAsRead]
  );

  // Fetch messages with improved state management
  const fetchMessages = useCallback(
    async (page = 1, selectFirst = false) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(
          `${API_BASE_URL}/contact/my-messages?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Mark messages with unread responses
          const messagesWithUnreadStatus = data.messages.map((msg) => ({
            ...msg,
            hasUnreadResponses:
              msg.responses && msg.responses.some((r) => r.isAdmin && !r.read),
          }));

          setMessages(messagesWithUnreadStatus || []);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.currentPage || 1);

          // Auto-select first message if requested
          if (selectFirst && data.messages?.length > 0) {
            const firstMessage = data.messages[0];
            setLastMessageId(firstMessage._id);
            await fetchMessageDetails(firstMessage._id);
          }
          // Auto-select new message if it exists
          else if (lastMessageId && data.messages?.length > 0) {
            const newMessage = data.messages.find(
              (msg) => msg._id === lastMessageId
            );
            if (
              newMessage &&
              (!selectedMessage || selectedMessage._id !== lastMessageId)
            ) {
              await fetchMessageDetails(lastMessageId);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      API_BASE_URL,
      statusFilter,
      searchTerm,
      lastMessageId,
      selectedMessage,
      fetchMessageDetails,
    ]
  );

  // Handle sending response with proper state updates
  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedMessage) return;

    try {
      setSendingResponse(true);

      // Stop typing indicator
      stopTyping();

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/contact/${selectedMessage._id}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: newResponse }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Update the selected message with the new response
        if (data.contactMessage) {
          setSelectedMessage(data.contactMessage);
        }

        // Clear the response input
        setNewResponse("");

        // Refresh messages list to update status/counts
        await fetchMessages(currentPage);

        // Force refresh the message details to ensure we have the latest data
        if (selectedMessage?._id) {
          await fetchMessageDetails(selectedMessage._id);
        }

        // Scroll to bottom after sending response
        // With this:
        setTimeout(() => {
          if (messageContainerRef.current) {
            messageContainerRef.current.scrollTo({
              top: messageContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 100);
      } else {
        console.error("Failed to send response:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending response:", error);
    } finally {
      setSendingResponse(false);
    }
  };

  // Handle new message submission
  const handleNewMessageSubmit = async () => {
    if (!userProfile || !newMessageData.subject || !newMessageData.message)
      return;

    try {
      setSubmittingNewMessage(true);
      const token = localStorage.getItem("token");

      const messagePayload = {
        firstName:
          userProfile.name?.split(" ")[0] || userProfile.name || "User",
        lastName: userProfile.name?.split(" ").slice(1).join(" ") || "User",
        email: userProfile.email,
        phone: userProfile.contactNumber || "",
        subject: newMessageData.subject,
        message: newMessageData.message,
      };

      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload),
      });

      if (response.ok) {
        const data = await response.json();
        setShowNewMessageForm(false);
        setNewMessageData({
          subject: "",
          message: "",
        });

        // Store the new message ID for auto-selection
        if (data.contactMessage) {
          setLastMessageId(data.contactMessage._id);
        }

        // Refresh messages and auto-select the new message
        await fetchMessages(1, true);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error creating message:", error);
    } finally {
      setSubmittingNewMessage(false);
    }
  };

  // Auto-refresh messages with better interval management
  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        !loading &&
        !sendingResponse &&
        !submittingNewMessage &&
        !messageDetailsLoading
      ) {
        await fetchMessages(currentPage);

        // Also refresh the selected message details to get latest responses
        if (selectedMessage?._id) {
          await fetchMessageDetails(selectedMessage._id);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [
    currentPage,
    loading,
    sendingResponse,
    submittingNewMessage,
    messageDetailsLoading,
    selectedMessage,
    fetchMessages,
    fetchMessageDetails,
  ]);

  // Add this after your other useEffects:
  useEffect(() => {
    if (socketService && isConnected) {
      const handleNewMessage = (data) => {
        console.log("New message received:", data);

        // Refresh messages list
        fetchMessages(currentPage);

        // If this is for a different conversation, show notification
        if (data.contactId !== selectedMessage?._id) {
          // Notification will be handled by useNotifications hook
        }
      };

      const handleAdminResponse = (data) => {
        console.log("Admin response received:", data);

        // If this is for the currently selected message, refresh its details
        if (data.contactId === selectedMessage?._id) {
          fetchMessageDetails(data.contactId);
        }

        // Refresh messages list to update counts
        fetchMessages(currentPage);
      };

      const handleStatusChange = (data) => {
        console.log("Status change received:", data);

        // Update the selected message if it matches
        if (data.contactId === selectedMessage?._id) {
          setSelectedMessage((prev) => ({
            ...prev,
            status: data.newStatus,
            priority: data.priority || prev.priority,
          }));
        }

        // Update in messages list
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.contactId
              ? {
                  ...msg,
                  status: data.newStatus,
                  priority: data.priority || msg.priority,
                }
              : msg
          )
        );
      };

      socketService.on("new_message", handleNewMessage);
      socketService.on("admin_response", handleAdminResponse);
      socketService.on("status_change", handleStatusChange);

      return () => {
        socketService.off("new_message", handleNewMessage);
        socketService.off("admin_response", handleAdminResponse);
        socketService.off("status_change", handleStatusChange);
      };
    }
  }, [
    socketService,
    isConnected,
    selectedMessage,
    currentPage,
    fetchMessages,
    fetchMessageDetails,
  ]);

  useEffect(() => {
    console.log("Typing users:", typingUsers);
    console.log("Contact socket connected:", contactSocketConnected);
    console.log("Selected message ID:", selectedMessage?._id);
  }, [typingUsers, contactSocketConnected, selectedMessage]);

  // Initial data fetching
  useEffect(() => {
    fetchUserProfile();
    fetchMessages(currentPage);
  }, [fetchUserProfile, fetchMessages, currentPage]);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMessages(1);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm, fetchMessages]);

  // Handle page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchMessages(currentPage);
    }
  }, [currentPage, fetchMessages]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "in-progress":
        return <AlertTriangle className="w-3 h-3" />;
      case "resolved":
        return <CheckCircle className="w-3 h-3" />;
      case "closed":
        return <Lock className="w-3 h-3" />;
      default:
        return <MessageCircle className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserDisplayName = () => {
    if (!userProfile) return "User";
    return userProfile.name || "User";
  };

  const getUserAvatar = () => {
    if (userProfile?.profilePhoto) {
      return (
        <img
          src={userProfile.profilePhoto}
          alt="Profile"
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    return <User className="w-5 h-5 text-pink-600" />;
  };

  const isConversationClosed = (message) => {
    return message?.status === "closed";
  };

  // Get the overall connection status
  const getConnectionStatus = () => {
    // Use isConnected from the socket context
    if (isConnected && socketService && socketService.isConnected()) {
      return {
        connected: true,
        label: "Live",
        color: "text-green-600",
        icon: <Wifi className="w-4 h-4 text-green-500" />,
      };
    } else {
      return {
        connected: false,
        label: "Offline",
        color: "text-red-600",
        icon: <WifiOff className="w-4 h-4 text-red-500" />,
      };
    }
  };

  // Typing Indicator Component
  const TypingIndicator = ({ users }) => {
    if (users.length === 0) return null;

    const getTypingText = () => {
      if (users.length === 1) {
        return `${users[0].userName || "Support"} is typing...`;
      } else if (users.length === 2) {
        return `${users[0].userName || "Support"} and ${
          users[1].userName || "Support"
        } are typing...`;
      } else {
        return `${users.length} people are typing...`;
      }
    };

    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 px-4 py-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span>{getTypingText()}</span>
      </div>
    );
  };

  // Notification Toast Component
  const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
      switch (notification.type) {
        case "admin_response":
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "status_change":
          return <AlertTriangle className="w-5 h-5 text-blue-500" />;
        default:
          return <Bell className="w-5 h-5 text-yellow-500" />;
      }
    };

    return (
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-[400px]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const MessagesList = () => {
    const connectionStatus = getConnectionStatus();

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 min-h-[500px] max-h-[calc(100vh-250px)] flex flex-col">
        {/* Search and Filter Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-1">
                {connectionStatus.icon}
                <span className={`text-xs ${connectionStatus.color}`}>
                  {connectionStatus.label}
                </span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <Filter className="w-4 h-4" />
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div
            className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => fetchMessageDetails(message._id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?._id === message._id
                      ? "bg-pink-50 border-r-4 border-pink-500"
                      : ""
                  } ${
                    message.hasUnreadResponses
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`} // ADD THIS LINE
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            message.status
                          )}`}
                        >
                          {getStatusIcon(message.status)}
                          {message.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            message.priority
                          )}`}
                        >
                          {message.priority}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-800 capitalize truncate">
                        {message.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {message.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 pb-8">
      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  My Messages
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Track and manage your contact messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
                {connectionStatus.icon}
                <span
                  className={`text-xs font-medium ${connectionStatus.color}`}
                >
                  {connectionStatus.label}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg bg-white/70 backdrop-blur-sm hover:bg-white/80 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-800">
                          Notifications
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <h4 className="font-medium text-gray-800 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* <div className="flex items-center gap-2 sm:gap-4"> */}
              {/* User Profile Display */}
              {!profileLoading && userProfile && (
                <div className="hidden sm:flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                    {getUserAvatar()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-600">{userProfile.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowNewMessageForm(true)}
                className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Messages</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-full overflow-hidden">
              <MessagesList />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 min-h-[calc(100vh-200px)] pb-20">
          {/* Desktop Messages List */}
          <div className="hidden lg:block lg:col-span-1">
            <MessagesList />
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 h-full flex flex-col">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800 capitalize truncate">
                        {selectedMessage.subject}
                      </h2>
                      <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {selectedMessage.firstName} {selectedMessage.lastName} •{" "}
                        {selectedMessage.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                          selectedMessage.status
                        )}`}
                      >
                        {getStatusIcon(selectedMessage.status)}
                        {selectedMessage.status}
                      </span>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getPriorityColor(
                          selectedMessage.priority
                        )}`}
                      >
                        {selectedMessage.priority}
                      </span>
                    </div>
                  </div>

                  {/* Closed Conversation Warning */}
                  {isConversationClosed(selectedMessage) && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Archive className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-red-800 font-medium">
                            This conversation is closed
                          </p>
                          <p className="text-red-600 text-sm">
                            No further responses can be sent for this message.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conversation */}
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[400px]"
                  ref={messageContainerRef}
                >
                  {/* Original Message */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {getUserAvatar()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-800 text-sm sm:text-base">
                            {getUserDisplayName()}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {formatDate(selectedMessage.createdAt)}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <p className="text-gray-700 text-sm sm:text-base">
                            {selectedMessage.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Responses */}
                  {selectedMessage.responses?.length > 0 && (
                    <div className="space-y-4">
                      {selectedMessage.responses.map((response, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 sm:gap-4"
                        >
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                              response.isAdmin ? "bg-blue-100" : "bg-pink-100"
                            }`}
                          >
                            {response.isAdmin ? (
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            ) : (
                              getUserAvatar()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-800 text-sm sm:text-base">
                                {response.isAdmin
                                  ? "GorakhpurRentals Support"
                                  : getUserDisplayName()}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {formatDate(response.sentAt)}
                              </span>
                            </div>
                            <div
                              className={`rounded-lg p-3 sm:p-4 ${
                                response.isAdmin ? "bg-blue-50" : "bg-pink-50"
                              }`}
                            >
                              <p className="text-gray-700 text-sm sm:text-base">
                                {response.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Typing Indicator */}
                <TypingIndicator users={typingUsers} />

                <div ref={messageEndRef} />

                {/* Response Form */}
                {!isConversationClosed(selectedMessage) && (
                  <div className="p-4 sm:p-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <textarea
                        value={newResponse}
                        onChange={handleInputChange} // Changed from (e) => setNewResponse(e.target.value)
                        placeholder="Type your response..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm sm:text-base"
                        rows={3}
                      />
                      <button
                        onClick={handleSendResponse}
                        disabled={!newResponse.trim() || sendingResponse}
                        className="px-4 sm:px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 sm:self-end"
                      >
                        {sendingResponse ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center">
                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
                  Select a Message
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Choose a message from the list to view the conversation
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg font-medium"
                >
                  View Messages
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                New Message
              </h3>
              <button
                onClick={() => setShowNewMessageForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* User Info Display */}
            {userProfile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                    {getUserAvatar()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {userProfile.email}
                    </p>
                    {userProfile.contactNumber && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        {userProfile.contactNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={newMessageData.subject}
                  onChange={(e) =>
                    setNewMessageData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="order">Order Support</option>
                  <option value="return">Returns & Exchanges</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={newMessageData.message}
                  onChange={(e) =>
                    setNewMessageData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm sm:text-base"
                  rows={4}
                  placeholder="Your message..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setShowNewMessageForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewMessageSubmit}
                  disabled={
                    submittingNewMessage ||
                    !newMessageData.subject ||
                    !newMessageData.message
                  }
                  className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {submittingNewMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-8 sm:mt-12">
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default ContactUserDashboard;
