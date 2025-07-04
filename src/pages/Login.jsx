
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, form);
      loginUser(res.data);

      toast.success("Welcome back! Login successful", {
        position: "top-right",
        autoClose: 3000,
      });

      const isAdmin = res.data.user?.isAdmin || res.data.user?.role === "admin";
      navigate(isAdmin ? "/admin/dashboard" : "/");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 403 && msg === "Please verify your email first.") {
        localStorage.setItem("verifyEmail", form.email);
        toast.info("Please verify your email first. Redirecting...", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/verify-otp", { state: { email: form.email } });
      } else {
        toast.error(msg || "Login failed. Please check your credentials.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/google-login`,
        {
          token: credentialResponse.credential,
        }
      );
      loginUser(res.data);
      toast.success("Google login successful!", { 
        position: "top-right", 
        autoClose: 3000 
      });
      const isAdmin = res.data.user?.isAdmin || res.data.user?.role === "admin";
      navigate(isAdmin ? "/admin/dashboard" : "/");
    } catch (error) {
      toast.error("Google login failed", { position: "top-right" });
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Login Failed", { position: "top-right" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to your account</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
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
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
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
                text="continue_with"
              />
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
                >
                  Create one here
                </button>
              </p>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-emerald-600 hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a>
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-1">New User?</h3>
              <p className="text-xs text-gray-600 mb-2">Get started in seconds</p>
              <button
                onClick={() => navigate("/signup")}
                className="text-xs text-emerald-600 hover:text-emerald-500 font-medium"
              >
                Create Account →
              </button>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-1">Need Help?</h3>
              <p className="text-xs text-gray-600 mb-2">We're here to assist</p>
              <button
                onClick={() => navigate("/support")}
                className="text-xs text-emerald-600 hover:text-emerald-500 font-medium"
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