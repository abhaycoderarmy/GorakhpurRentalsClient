import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  Home,
  LogOut,
  Menu,
  X,
  User,
  Package,
  Mail,
  Phone,
  FileText,
  UserCircle,
  Headphones,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items: cart } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate cart count - total quantity of all items
  const cartCount = cart?.reduce((total, item) => total + (item.qty || 0), 0) || 0;

  // Logo component with animation (reusable for both desktop and mobile)
  const AnimatedLogo = ({ className = "" }) => (
    <Link to="/" className={`flex items-center gap-4 group ${className}`}>
      {/* Cloudinary Logo with continuous mobile animation */}
      <div className="relative transition-all duration-500 animate-pulse lg:animate-none group-hover:rotate-3 group-active:rotate-3 group-active:scale-105">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg shadow-amber-200 lg:shadow-gray-200 transition-all duration-500 group-hover:shadow-2xl group-active:shadow-2xl">
          <img
            src="https://res.cloudinary.com/dpzagdlky/image/upload/v1750013431/hz34pwkz89ep5xwg73ue.png"
            alt="Gorakhpur Rentals Logo"
            className="w-full h-full object-contain transition-all duration-500"
          />
        </div>

        {/* Animated Border Ring - Always pulsing on mobile */}
        <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-pulse lg:border-transparent lg:group-hover:border-amber-400 lg:group-hover:animate-pulse transition-all duration-500"></div>

        {/* Subtle Glow Effect - Always glowing on mobile */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 opacity-10 lg:opacity-0 lg:group-hover:opacity-10 blur-sm transition-all duration-500 -z-10"></div>

        {/* Floating Particles - Always animating on mobile */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-amber-400 rounded-full animate-bounce lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:animate-bounce transition-all duration-500"></div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-yellow-500 rounded-full animate-ping lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:animate-ping transition-all duration-700"></div>
        <div className="absolute -top-1 -left-3 w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:animate-pulse transition-all duration-600"></div>
        
        {/* Additional Mobile-only continuous animations */}
        <div className="absolute -top-3 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping lg:hidden" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute -bottom-3 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce lg:hidden" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1 -left-4 w-1 h-1 bg-amber-600 rounded-full animate-pulse lg:hidden" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Animated Brand Text - Continuous subtle animation on mobile */}
      <div className="flex flex-col transition-all duration-300 animate-pulse lg:animate-none group-hover:translate-x-2 group-active:translate-x-2">
        <span className="text-2xl font-bold text-amber-800 leading-none tracking-wide transition-all duration-300 group-hover:text-amber-900 group-hover:scale-105 group-active:text-amber-900 group-active:scale-105">
          GORAKHPUR
        </span>
        <span className="text-sm text-amber-600 font-semibold tracking-widest transition-all duration-300 group-hover:text-amber-700 group-hover:tracking-wider group-active:text-amber-700 group-active:tracking-wider">
          RENTALS
        </span>
        <span className="text-xs text-amber-500 font-medium italic transition-all duration-300 group-hover:text-amber-600 group-hover:translate-x-1 group-active:text-amber-600 group-active:translate-x-1 animate-pulse lg:animate-none">
          Premium Lehanga Rental
        </span>
      </div>
    </Link>
  );

  return (
    <nav className="w-full bg-gradient-to-r from-rose-100 via-amber-50 to-rose-100 shadow-lg sticky top-0 z-40">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Now using AnimatedLogo component */}
          <AnimatedLogo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {!user ? (
              // Not logged in menu
              <>
                <Link
                  to="/"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  HOME
                </Link>
                <Link
                  to="/product"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  PRODUCTS
                </Link>
                
                <Link
                  to="/signup"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  LOGIN
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-medium rounded-md hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 shadow-md"
                >
                  <ShoppingCart size={16} />
                  <span className="hidden xl:inline">CART</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-md hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md"
                >
                  <Headphones size={16} />
                  <span className="hidden xl:inline">CUSTOMER SUPPORT</span>
                </Link>
              </>
            ) : (
              // Logged in user menu (admin functionality removed)
              <>
                <Link
                  to="/"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  HOME
                </Link>
                <Link
                  to="/product"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  PRODUCTS
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-medium rounded-md hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 shadow-md"
                >
                  <ShoppingCart size={16} />
                  <span className="hidden xl:inline">CART</span>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  MY ORDERS
                </Link>
                
                <Link
                  to="/profile"
                  className="px-6 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200 uppercase tracking-wide"
                >
                  PROFILE
                </Link>
                <Link
                  to="/contact-user-dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-md hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md"
                >
                  <Headphones size={16} />
                  <span className="hidden xl:inline">CUSTOMER SUPPORT</span>
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-md">
                  <UserCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {user.user?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                >
                  LOGOUT
                </button>
              </>
            )}

            {/* Call Us Button */}
            <Link
              to="tel:+919721288883"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-bold rounded-md hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 shadow-md ml-4"
            >
              <Phone size={16} />
              CALL US
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-all duration-200"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - Fixed to prevent scrolling */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-amber-200 bg-white fixed inset-x-0 top-20 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto shadow-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!user ? (
                // Not logged in mobile menu
                <>
                  {[
                    { to: "/", label: "HOME", icon: Home },
                    { to: "/product", label: "PRODUCTS", icon: Package },
                    { to: "/signup", label: "SIGN UP", icon: UserCircle },
                    { to: "/login", label: "LOGIN", icon: User },
                    { to: "/contact", label: "CUSTOMER SUPPORT", icon: Headphones },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    CART
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                // Logged in user mobile menu (admin functionality removed)
                <>
                  <div className="px-3 py-2 bg-green-50 rounded-md mb-2">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Welcome, {user.user?.name}
                      </span>
                    </div>
                  </div>
                  {[
                    { to: "/", label: "HOME", icon: Home },
                    { to: "/product", label: "PRODUCTS", icon: Package },
                    { to: "/orders", label: "MY ORDERS", icon: FileText },
                    { to: "/profile", label: "PROFILE", icon: UserCircle },
                    { to: "/contact-user-dashboard", label: "CUSTOMER SUPPORT", icon: Headphones },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    CART
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 w-full text-left"
                  >
                    <LogOut size={18} />
                    LOGOUT
                  </button>
                </>
              )}

              {/* Mobile Call Us */}
              <Link
                to="tel:+919721288883"
                className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold rounded-md mt-4 mx-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Phone size={18} />
                CALL US
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}