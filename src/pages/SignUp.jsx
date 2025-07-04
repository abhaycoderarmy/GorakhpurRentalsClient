import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/signup`,
        form
      );
      
      toast.success("Signup successful! Please check your email for OTP verification.", {
        position: "top-right",
        autoClose: 5000,
      });
      
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/google-login`,
        { token: credentialResponse.credential }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Welcome! Google signup successful. Please Login Again", {
        position: "top-right",
        autoClose: 3000,
      });

      const isAdmin = res.data.user?.isAdmin || res.data.user?.role === "admin";
      navigate(isAdmin ? "/admin/dashboard" : "/login");
    } catch (err) {
      console.error("Google signup failed", err);
      toast.error("Google signup failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleGoogleError = () => {
    toast.error("Google signup failed. Please try again.", {
      position: "top-right",
      autoClose: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us and start your journey today</p>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                size="large"
                theme="outline"
                shape="rectangular"
                width="384"
                text="signup_with"
              />
            </div>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-1">Quick Start</h3>
              <p className="text-xs text-gray-600 mb-2">Get up and running fast</p>
              <button className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                Learn More →
              </button>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-1">Need Help?</h3>
              <p className="text-xs text-gray-600 mb-2">We're here to assist</p>
              <button
                onClick={() => navigate("/support")}
                className="text-xs text-blue-600 hover:text-blue-500 font-medium"
              >
                Get Support →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}