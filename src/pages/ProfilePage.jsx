import { useState, useEffect } from "react";

import {
  User,
  Edit3,
  Lock,
  Camera,
  MapPin,
  Phone,
  Mail,
  Hash,
  Home,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  Shield,
  Bell,
} from "lucide-react";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        showToast("Authentication token not found. Please log in.", "error");
        setLoading(false);
        return;
      }
      try {
        const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL;
        const res = await fetch(`${BACKEND_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const userData = data.user || data;
        setUser(userData);
        setForm(userData);
      } catch (err) {
        showToast("Failed to load profile. " + err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({
      ...form,
      profilePhotoFile: file,
      profilePhoto: URL.createObjectURL(file),
    });
  };

  // Replace your handleUpdate function with this:
  const handleUpdate = async () => {
    if (!form.name || !form.contactNumber || !form.address) {
      return showToast("Please fill in all required fields.", "error");
    }

    if (!token) {
      return showToast(
        "Authentication token not found. Please log in.",
        "error"
      );
    }

    setIsUpdating(true);

    try {
      const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL;

      // Create FormData for file upload if profile photo exists
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("contactNumber", form.contactNumber);
      formData.append("address", form.address);
      if (form.pincode) formData.append("pincode", form.pincode);

      // If there's a profile photo file, append it
      if (form.profilePhotoFile) {
        formData.append("profilePhoto", form.profilePhotoFile);
      }

      const response = await fetch(`${BACKEND_URL}/users/profile`, {
        method: "PUT", // or 'PATCH' depending on your API
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header when using FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const updatedUser = data.user || data;

      // Update local state with the response from server
      setUser(updatedUser);
      setForm(updatedUser);
      showToast("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Failed to update profile: " + error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Replace your handlePasswordReset function with this:
  const handlePasswordReset = async () => {
    if (passwords.password !== passwords.confirmPassword) {
      return showToast("Passwords do not match!", "error");
    }

    if (!passwords.password || passwords.password.length < 6) {
      return showToast("Password must be at least 6 characters long!", "error");
    }

    if (!token) {
      return showToast(
        "Authentication token not found. Please log in.",
        "error"
      );
    }

    try {
      const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL;

      const response = await fetch(`${BACKEND_URL}/users/reset-password`, {
        method: "PUT", // or 'PATCH' depending on your API
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: passwords.password,
          confirmPassword: passwords.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      showToast("Password updated successfully!");
      setPasswordDialogOpen(false);
      setPasswords({ password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Password update error:", error);
      showToast("Failed to update password: " + error.message, "error");
    }
  };

  // Alternative version if you want to send profile data as JSON instead of FormData:
  const handleUpdateJSON = async () => {
    if (!form.name || !form.contactNumber || !form.address) {
      return showToast("Please fill in all required fields.", "error");
    }

    if (!token) {
      return showToast(
        "Authentication token not found. Please log in.",
        "error"
      );
    }

    setIsUpdating(true);

    try {
      const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL;

      // If you need to handle profile photo separately, upload it first
      let profilePhotoUrl = form.profilePhoto;
      if (form.profilePhotoFile) {
        // Upload photo first if your API has a separate endpoint for file uploads
        const photoFormData = new FormData();
        photoFormData.append("profilePhoto", form.profilePhotoFile);

        const photoResponse = await fetch(`${BACKEND_URL}/users/upload-photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: photoFormData,
        });

        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          profilePhotoUrl = photoData.profilePhoto;
        }
      }

      const updateData = {
        name: form.name,
        contactNumber: form.contactNumber,
        address: form.address,
        pincode: form.pincode,
        profilePhoto: profilePhotoUrl,
      };

      const response = await fetch(`${BACKEND_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const updatedUser = data.user || data;

      setUser(updatedUser);
      setForm(updatedUser);
      showToast("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Failed to update profile: " + error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-indigo-400 rounded-full animate-ping"></div>
            <div className="absolute inset-2 w-20 h-20 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="mt-8 space-y-2">
            <p className="text-gray-700 font-semibold text-lg">
              Loading your profile...
            </p>
            <p className="text-gray-500 text-sm">
              Please wait while we fetch your data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-r from-violet-300/10 to-purple-300/10 rounded-full blur-2xl animate-ping"></div>
      </div>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 space-y-3 max-w-xs sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl backdrop-blur-md border transform transition-all duration-500 animate-in slide-in-from-right ${
              toast.type === "success"
                ? "bg-emerald-100/90 border-emerald-200 text-emerald-800"
                : "bg-red-100/90 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {toast.type === "success" ? (
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                </div>
              ) : (
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                </div>
              )}
              <span className="font-medium text-sm sm:text-base">
                {toast.message}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="absolute -top-10 sm:-top-20 -right-10 sm:-right-20 w-20 sm:w-40 h-20 sm:h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 sm:mb-6 group">
                      <div className="w-24 sm:w-32 lg:w-36 h-24 sm:h-32 lg:h-36 rounded-full border-2 sm:border-4 border-white/30 shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                        {form.profilePhoto || user?.profilePhoto ? (
                          <img
                            src={form.profilePhoto || user.profilePhoto}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                            <User className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 text-white/70" />
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <label className="absolute bottom-0 sm:bottom-2 right-0 sm:right-2 bg-white text-purple-600 p-2 sm:p-3 rounded-full shadow-xl cursor-pointer hover:bg-purple-50 transition-all duration-300 hover:scale-110">
                          <Camera className="w-4 sm:w-5 h-4 sm:h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 break-words max-w-full">
                      {user?.name || "User"}
                    </h2>
                    <div className="flex items-center gap-2 text-purple-100 mb-3 sm:mb-4 max-w-full">
                      <Mail className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium break-all">
                        {user?.email || "No email"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-100 max-w-full">
                      <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm break-words">
                        {user?.address?.split(",")[0] || "No address"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-xl transform hover:scale-105 hover:shadow-2xl font-semibold text-sm sm:text-base"
                    >
                      <Edit3 className="w-4 sm:w-5 h-4 sm:h-5" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setPasswordDialogOpen(true)}
                      className="w-full bg-gradient-to-r from-slate-700 to-gray-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-slate-800 hover:to-gray-900 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-xl transform hover:scale-105 hover:shadow-2xl font-semibold text-sm sm:text-base"
                    >
                      <Lock className="w-4 sm:w-5 h-4 sm:h-5" />
                      Change Password
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none hover:shadow-2xl font-semibold text-sm sm:text-base"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 sm:w-5 h-4 sm:h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setForm(user);
                        setIsEditing(false);
                      }}
                      disabled={isUpdating}
                      className="w-full bg-gradient-to-r from-gray-600 to-slate-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-gray-700 hover:to-slate-800 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-xl disabled:opacity-60 transform hover:scale-105 font-semibold text-sm sm:text-base"
                    >
                      <X className="w-4 sm:w-5 h-4 sm:h-5" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/40 hover:bg-white/70 transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">
                      Security
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      Protected
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/40 hover:bg-white/70 transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 p-4 sm:p-6 lg:p-8 hover:shadow-3xl transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3 sm:gap-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <span className="break-words">Personal Information</span>
                </h3>
                <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  {isEditing ? "Editing Mode" : "View Mode"}
                </div>
              </div>

              {!isEditing ? (
                <div className="grid gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-100/50 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <User className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs sm:text-sm font-bold text-pink-700 uppercase tracking-wider">
                            Full Name
                          </label>
                          <p className="text-xs text-pink-600">
                            Personal Identity
                          </p>
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">
                        {user?.name || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-100/50 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Mail className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider">
                            Email Address
                          </label>
                          <p className="text-xs text-blue-600">
                            Primary Contact
                          </p>
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-all">
                        {user?.email || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-green-100/50 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Phone className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs sm:text-sm font-bold text-green-700 uppercase tracking-wider">
                            Contact Number
                          </label>
                          <p className="text-xs text-green-600">Phone Number</p>
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">
                        {user?.contactNumber || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-100/50 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Hash className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs sm:text-sm font-bold text-purple-700 uppercase tracking-wider">
                            Pin Code
                          </label>
                          <p className="text-xs text-purple-600">Postal Code</p>
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">
                        {user?.pincode || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-orange-100/50 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Home className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <label className="text-xs sm:text-sm font-bold text-orange-700 uppercase tracking-wider">
                          Complete Address
                        </label>
                        <p className="text-xs text-orange-600">
                          Residential Location
                        </p>
                      </div>
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-relaxed break-words">
                      {user?.address || "Not provided"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2 sm:gap-3 text-sm font-bold text-gray-700">
                        <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-md sm:rounded-lg flex items-center justify-center">
                          <User className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                        </div>
                        Full Name *
                      </label>
                      <input
                        name="name"
                        value={form.name || ""}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/80 backdrop-blur-sm text-base sm:text-lg font-medium"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2 sm:gap-3 text-sm font-bold text-gray-700">
                        <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md sm:rounded-lg flex items-center justify-center">
                          <Phone className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                        </div>
                        Contact Number *
                      </label>
                      <input
                        name="contactNumber"
                        value={form.contactNumber || ""}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/80 backdrop-blur-sm text-base sm:text-lg font-medium"
                        placeholder="Enter your contact number"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2 sm:gap-3 text-sm font-bold text-gray-700">
                        <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-md sm:rounded-lg flex items-center justify-center">
                          <Hash className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                        </div>
                        Pin Code
                      </label>
                      <input
                        name="pincode"
                        value={form.pincode || ""}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/80 backdrop-blur-sm text-base sm:text-lg font-medium"
                        placeholder="Enter your pin code"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2 sm:gap-3 text-sm font-bold text-gray-700">
                      <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-md sm:rounded-lg flex items-center justify-center">
                        <Home className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                      </div>
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address || ""}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none text-base sm:text-lg font-medium"
                      placeholder="Enter your complete residential address"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
      <Footer />

      {/* Password Reset Modal */}
      {isPasswordDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 transform transition-all duration-300 mx-4">
            <div className="text-center mb-6">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Update Password
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Enter your new password below
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.password}
                    onChange={(e) =>
                      setPasswords({ ...passwords, password: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 px-4 py-3 pr-12 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all duration-300 text-sm sm:text-base"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-200 px-4 py-3 pr-12 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all duration-300 text-sm sm:text-base"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setPasswordDialogOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
