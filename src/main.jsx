import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from './context/SocketContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="523176593447-f1rgo224oiac2g8cr9td716noloubuti.apps.googleusercontent.com">
     <SocketProvider>
       <BrowserRouter>
         <AuthProvider>
           <CartProvider>
             <App />
           </CartProvider>
         </AuthProvider>
       </BrowserRouter>
     </SocketProvider>
  </GoogleOAuthProvider>
)


