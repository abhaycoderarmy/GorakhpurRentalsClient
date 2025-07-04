import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="195380073160-fjcvspgrolhmbij2r6dr7rgs2f2h1mu5.apps.googleusercontent.com">
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <App />
        </CartProvider>

      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
)
