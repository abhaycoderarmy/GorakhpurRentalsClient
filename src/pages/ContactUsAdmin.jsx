import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
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
  Edit3,
  Trash2,
  UserCheck,
  Mail,
  Phone,
  Tag,
  AlertCircle,
  Users,
  MessageSquare,
  TrendingUp,
  Archive,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";

// Import Socket.io hooks
import { useSocket } from "../context/SocketContext";
import { useNotifications } from "../hooks/useNotifications";

const AdminContactDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [typingContactId, setTypingContactId] = useState(null);
  const [typingTimeouts, setTypingTimeouts] = useState({});

  // Socket.io hooks
  const { socketService, isConnected } = useSocket();
  const { notifications, removeNotification } = useNotifications();

  // Mock API_BASE_URL for demo - replace with your actual URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
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

  // You can add this to your existing notifications state or create a separate one
  // This is just for the dashboard-specific notifications
  console.log("New notification:", notification);
}, []);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchMessages = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...(priorityFilter !== "all" && { priority: priorityFilter }),
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(`${API_BASE_URL}/contact?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
          setTotal(data.total);
          setStatusCounts(data.statusCounts || []);
          setLastUpdate(Date.now());
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, priorityFilter, searchTerm, API_BASE_URL]
  );

  // Socket setup - Fixed to prevent multiple joins/leaves
  useEffect(() => {
    if (isConnected && socketService && socketService.socket) {
      console.log("Setting up socket listeners");

      // Join admin room for global notifications
      socketService.joinAdminRoom();

      // Listen for new contact messages
      const handleNewContactMessage = (data) => {
        console.log("New contact message received:", data);
        setMessages((prev) => [data, ...prev]);
        setTotal((prev) => prev + 1);
        setStatusCounts((prev) => {
          const updated = [...prev];
          const statusIndex = updated.findIndex((s) => s._id === data.status);
          if (statusIndex >= 0) {
            updated[statusIndex].count += 1;
          } else {
            updated.push({ _id: data.status, count: 1 });
          }
          return updated;
        });

        // Add notification for new contact message
        handleNotification({
          type: "new_contact_message",
          title: "New Contact Message",
          message: `${data.firstName} ${data.lastName}: ${data.subject}`,
          contactId: data._id,
        });

        // Browser notification (keep existing)
        if (Notification.permission === "granted") {
          new Notification("New Contact Message", {
            body: `${data.firstName} ${data.lastName}: ${data.subject}`,
            icon: "/favicon.ico",
          });
        }
      };

      // Listen for message status updates
      const handleMessageStatusUpdate = (data) => {
        console.log("Message status updated:", data);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, status: data.newStatus, updatedAt: data.updatedAt }
              : msg
          )
        );

        if (selectedMessage?._id === data.messageId) {
          setSelectedMessage((prev) => ({
            ...prev,
            status: data.newStatus,
            updatedAt: data.updatedAt,
          }));
        }
      };

      // Listen for new responses from users
      const handleUserResponse = (data) => {
        console.log("User response received:", data);

        const newResponse = {
          message: data.message,
          isAdmin: false,
          sentAt: new Date().toISOString(),
          sentBy: data.sentBy || { name: "User" },
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.contactId
              ? {
                  ...msg,
                  responses: [...(msg.responses || []), newResponse],
                  status: "in-progress",
                  hasUnreadResponse: true,
                }
              : msg
          )
        );

        if (selectedMessage?._id === data.contactId) {
          setSelectedMessage((prev) => ({
            ...prev,
            responses: [...(prev.responses || []), newResponse],
            status: "in-progress",
            hasUnreadResponse: false,
          }));
        }

        // Add notification for user response
        handleNotification({
          type: "user_response",
          title: "New User Response",
          message: `User replied: ${data.message.substring(0, 50)}${
            data.message.length > 50 ? "..." : ""
          }`,
          contactId: data.contactId,
        });
      };

      // Listen for admin responses (real-time update when admin sends response)
      const handleAdminResponse = (data) => {
        console.log("Admin response received:", data);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.contactId
              ? {
                  ...msg,
                  responses: [...(msg.responses || []), data.response],
                  status: data.newStatus,
                }
              : msg
          )
        );

        if (selectedMessage?._id === data.contactId) {
          setSelectedMessage((prev) => ({
            ...prev,
            responses: [...(prev.responses || []), data.response],
            status: data.newStatus,
          }));
        }
      };

      const handleUserTyping = (data) => {
        console.log("User typing:", data);
        setTypingContactId(data.contactId);

        // Clear any existing timeout for this contact
        if (typingTimeouts[data.contactId]) {
          clearTimeout(typingTimeouts[data.contactId]);
        }

        // Set new timeout to hide typing after 3 seconds
        const timeoutId = setTimeout(() => {
          setTypingContactId((prev) => (prev === data.contactId ? null : prev));
          setTypingTimeouts((prev) => {
            const updated = { ...prev };
            delete updated[data.contactId];
            return updated;
          });
        }, 3000);

        setTypingTimeouts((prev) => ({
          ...prev,
          [data.contactId]: timeoutId,
        }));
      };

      const handleUserStoppedTyping = (data) => {
        console.log("User stopped typing:", data);

        // Clear the timeout for this contact
        if (typingTimeouts[data.contactId]) {
          clearTimeout(typingTimeouts[data.contactId]);
        }

        // Show typing for minimum 2 seconds from when it started
        setTimeout(() => {
          setTypingContactId((prev) => (prev === data.contactId ? null : prev));
          setTypingTimeouts((prev) => {
            const updated = { ...prev };
            delete updated[data.contactId];
            return updated;
          });
        }, 2000);
      };

      // Listen for message deletions
      const handleMessageDeleted = (data) => {
        console.log("Message deleted:", data);
        setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
        if (selectedMessage?._id === data.messageId) {
          setSelectedMessage(null);
        }
        setTotal((prev) => prev - 1);
      };

      // Set up event listeners
      socketService.onNewContactMessage(handleNewContactMessage);
      socketService.onContactStatusUpdated(handleMessageStatusUpdate);
      socketService.onUserResponse(handleUserResponse);
      socketService.onUserTyping(handleUserTyping);
      socketService.onUserStoppedTyping(handleUserStoppedTyping);
      socketService.on("message_deleted", handleMessageDeleted);
      socketService.on("admin_response_sent", handleAdminResponse); // Add this listener

      // Cleanup
      return () => {
        socketService.offNewContactMessage();
        socketService.offContactStatusUpdated();
        socketService.offUserResponse();
        socketService.offUserTyping();
        socketService.offUserStoppedTyping();
        socketService.off("message_deleted");
        socketService.off("admin_response_sent");
        socketService.leaveAdminRoom();
      };
    }
  }, [isConnected, socketService]); // Removed dependencies that were causing re-renders

  // Separate effect for selected message room management
  useEffect(() => {
    if (selectedMessage && socketService && isConnected) {
      socketService.joinContactRoom(selectedMessage._id);

      return () => {
        socketService.leaveContactRoom(selectedMessage._id);
      };
    }
  }, [selectedMessage?._id, socketService, isConnected]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // const fetchMessageDetails = async (messageId) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setSelectedMessage(data);

  //       // Update the message in the messages list and mark as read
  //       setMessages((prevMessages) =>
  //         prevMessages.map((msg) =>
  //           msg._id === messageId
  //             ? { ...msg, ...data, hasUnreadResponse: false }
  //             : msg
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching message details:", error);
  //   }
  // };
  
const fetchMessageDetails = async (messageId) => {
  // Add validation for messageId
  if (!messageId || messageId === 'undefined' || messageId === 'null') {
    console.error('Invalid messageId provided to fetchMessageDetails:', messageId);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setSelectedMessage(data);

      // Update the message in the messages list and mark as read
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? { ...msg, ...data, hasUnreadResponse: false }
            : msg
        )
      );
    } else {
      console.error(`Failed to fetch message details. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching message details:", error);
  }
}

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedMessage) return;

    try {
      setSendingResponse(true);
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

        // Create the response object for immediate UI update
        const newResponseObj = {
          message: newResponse,
          isAdmin: true,
          sentAt: new Date().toISOString(),
          sentBy: { name: "Admin" },
        };

        // Update selected message immediately
        setSelectedMessage((prev) => ({
          ...prev,
          status: data.contactMessage.status,
          responses: [...(prev.responses || []), newResponseObj],
        }));

        // Update messages list immediately
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === selectedMessage._id
              ? {
                  ...msg,
                  status: data.contactMessage.status,
                  responses: [...(msg.responses || []), newResponseObj],
                }
              : msg
          )
        );

        // Clear the input
        setNewResponse("");

        // Emit socket event for real-time updates to other admins
        if (socketService && isConnected) {
          socketService.emit("admin_response_sent", {
            contactId: selectedMessage._id,
            response: newResponseObj,
            newStatus: data.contactMessage.status,
          });
        }

        console.log("Response sent successfully");
      } else {
        console.error("Failed to send response");
      }
    } catch (error) {
      console.error("Error sending response:", error);
    } finally {
      setSendingResponse(false);
    }
  };

  const handleUpdateMessage = async (messageId, updates) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();

        // Update selected message
        setSelectedMessage(data.contactMessage);

        // Update the message in the messages list immediately
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, ...data.contactMessage } : msg
          )
        );

        // Emit socket event for real-time updates
        if (socketService && isConnected) {
          socketService.emit("contact_status_changed", {
            messageId: messageId,
            oldStatus: editingMessage.status,
            newStatus: updates.status,
            updatedAt: new Date().toISOString(),
          });
        }

        // Close modal
        setShowEditModal(false);
        setEditingMessage(null);

        // Refresh the entire list to update counts
        await fetchMessages(currentPage);

        console.log("Message updated successfully");
      } else {
        console.error("Failed to update message");
      }
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from messages list immediately
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId)
        );

        // Clear selected message if it was the deleted one
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }

        // Emit socket event for real-time updates
        if (socketService && isConnected) {
          socketService.emit("message_deleted", {
            messageId: messageId,
          });
        }

        // Refresh to update counts and pagination
        await fetchMessages(currentPage);

        console.log("Message deleted successfully");
      } else {
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  useEffect(() => {
  return () => {
    // Clear all typing timeouts on unmount
    Object.values(typingTimeouts).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
  };
}, [typingTimeouts]);
  // Reduced auto-refresh frequency since we have real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(currentPage);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchMessages, currentPage]);

  // Fetch messages when filters change
  useEffect(() => {
    fetchMessages(currentPage);
  }, [fetchMessages, currentPage]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchMessages(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200";
      case "in-progress":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200";
      case "resolved":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200";
      case "closed":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200";
      case "high":
        return "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200";
      case "medium":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200";
      case "low":
        return "bg-gradient-to-r from-green-100 to-lime-100 text-green-800 border border-green-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <AlertTriangle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <Archive className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
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

  const getStatusCount = (status) => {
    const count = statusCounts.find((s) => s._id === status);
    return count ? count.count : 0;
  };

  const getUserAvatar = (user) => {
    if (user?.profilePhoto) {
      return (
        <img
          src={user.profilePhoto}
          alt="Profile"
          className="w-full h-full object-cover rounded-full ring-2 ring-pink-200"
        />
      );
    }
    return <User className="w-5 h-5 text-pink-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-32 right-20 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-300/40 rounded-full blur-lg animate-pulse delay-500"></div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-pink-200/50 p-4 min-w-[300px] max-w-[400px] animate-slide-in"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
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
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-pink-50 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-pink-200/50 shadow-lg shadow-pink-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Contact Messages
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Manage and respond to customer inquiries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isConnected
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 backdrop-blur-sm rounded-2xl px-4 py-3 border border-pink-200/50 shadow-sm">
                <span className="text-sm font-medium text-gray-600">
                  Total Messages:{" "}
                </span>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-pink-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {getStatusCount("pending")}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-2xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"></div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-pink-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  In Progress
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {getStatusCount("in-progress")}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-pink-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Resolved
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {getStatusCount("resolved")}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-pink-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Closed</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-600">
                  {getStatusCount("closed")}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-gray-400 to-slate-400 rounded-2xl shadow-lg">
                <Archive className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Messages List */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50">
              {/* Search and Filter */}
              <div className="p-6 border-b border-pink-100">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-pink-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    >
                      <option value="all">All Priority</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="divide-y divide-pink-100 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-pink-300" />
                    <p className="text-lg font-medium">No messages found</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => fetchMessageDetails(message._id)}
                      className={`p-4 cursor-pointer hover:bg-pink-50/50 transition-all duration-200 ${
                        selectedMessage?._id === message._id
                          ? "bg-gradient-to-r from-pink-50 to-rose-50 border-r-4 border-pink-500"
                          : ""
                      } ${
                        message.hasUnreadResponse
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                message.status
                              )}`}
                            >
                              {getStatusIcon(message.status)}
                              <span className="ml-1">{message.status}</span>
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                message.priority
                              )}`}
                            >
                              {message.priority}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-800 capitalize mb-1">
                            {message.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {message.firstName} {message.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {message.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-pink-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-pink-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 bg-pink-50 px-3 py-2 rounded-xl">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-7 xl:col-span-8">
            {selectedMessage ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50">
                {/* Header */}
                <div className="p-6 border-b border-pink-100">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize mb-3">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-pink-500" />
                          <span className="text-gray-600 text-sm">
                            {selectedMessage.firstName}{" "}
                            {selectedMessage.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-pink-500" />
                          <span className="text-gray-600 text-sm">
                            {selectedMessage.email}
                          </span>
                        </div>
                        {selectedMessage.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-pink-500" />
                            <span className="text-gray-600 text-sm">
                              {selectedMessage.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedMessage.status
                        )}`}
                      >
                        {selectedMessage.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                          selectedMessage.priority
                        )}`}
                      >
                        {selectedMessage.priority}
                      </span>
                      <button
                        onClick={() => {
                          setEditingMessage(selectedMessage);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Original Message */}
                <div className="p-6 border-b border-pink-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-pink-200">
                      {selectedMessage.userId ? (
                        getUserAvatar(selectedMessage.userId)
                      ) : (
                        <User className="w-6 h-6 text-pink-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="font-semibold text-gray-800">
                          {selectedMessage.firstName} {selectedMessage.lastName}
                        </span>
                        {selectedMessage.isGuest && (
                          <span className="px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs rounded-full border border-orange-200">
                            Guest
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(selectedMessage.createdAt)}
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-pink-50 rounded-2xl p-4 border border-pink-100">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typing Indicator */}
                {typingContactId === selectedMessage?._id && (
                  <div className="p-4 border-t border-pink-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">
                          User is typing
                        </span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Responses */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-pink-500" />
                    <h3 className="font-semibold text-gray-800">
                      Conversation
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {selectedMessage.responses?.map((response, index) => {
                      // if (!response) return null; // Add this line

                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 ${
                              response?.isAdmin
                                ? "bg-gradient-to-r from-pink-100 to-rose-100 ring-pink-200"
                                : "bg-gradient-to-r from-gray-100 to-slate-100 ring-gray-200"
                            }`}
                          >
                            {response?.isAdmin ? (
                              <UserCheck className="w-5 h-5 text-pink-600" />
                            ) : (
                              getUserAvatar(response?.sentBy)
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-800">
                                {response?.isAdmin
                                  ? "Admin"
                                  : response?.sentBy?.name || "User"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(response.sentAt)}
                              </span>
                            </div>
                            <div
                              className={`rounded-2xl p-4 border ${
                                response?.isAdmin
                                  ? "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200"
                                  : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                              }`}
                            >
                              <p className="text-gray-700 leading-relaxed">
                                {response?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Response Form */}
                {/* Response Form */}
                {selectedMessage.status !== "closed" && (
                  <div className="p-6 border-t border-pink-100">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <textarea
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        rows={3}
                      />
                      <button
                        onClick={handleSendResponse}
                        disabled={!newResponse.trim() || sendingResponse}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        {sendingResponse ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 p-8">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-pink-300" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Select a Message
                  </h3>
                  <p className="text-gray-600">
                    Choose a message from the list to view details and respond
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 w-full max-w-md">
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Edit Message
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-pink-50 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingMessage.status}
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={editingMessage.priority}
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      priority: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={editingMessage.subject}
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="p-6 border-t border-pink-100">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-pink-200 text-gray-700 rounded-xl hover:bg-pink-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleUpdateMessage(editingMessage._id, {
                      status: editingMessage.status,
                      priority: editingMessage.priority,
                      subject: editingMessage.subject,
                    })
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactDashboard;
