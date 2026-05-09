import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      axios.get('/api/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <Dashboard key="dashboard" onLogout={handleLogout} />
      ) : (
        <Login key="login" onLogin={handleLogin} />
      )}
    </AnimatePresence>
  );
}

export default App;