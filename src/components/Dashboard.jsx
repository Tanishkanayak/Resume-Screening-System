import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the original Flask app content
    const loadApp = async () => {
      try {
        const response = await axios.get('/api/dashboard');
        // The Flask app will handle the HTML rendering
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        setIsLoading(false);
      }
    };

    loadApp();
  }, []);

  const handleLogout = () => {
    onLogout();
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Resume Screening System</h1>
                <p className="text-sm text-gray-500">AI-Powered Candidate Analysis</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content - Load Flask App */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <iframe
          src="/api/dashboard"
          className="w-full min-h-screen border-0 rounded-lg shadow-lg"
          title="Resume Screening Dashboard"
        />
      </div>
    </div>
  );
};

export default Dashboard;