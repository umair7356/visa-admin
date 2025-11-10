import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ onLogout, adminEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      navigate('/login');
    }
  };

  // Don't show header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            {!logoError ? (
              <img
                src={`${process.env.PUBLIC_URL}/logo.png`}
                alt="Logo"
                className="h-10 w-auto"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-indigo-600">
                Admin Portal
              </span>
            )}
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-4 md:space-x-6">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                // Trigger add application form - this will be handled by parent
                const event = new CustomEvent('openAddForm');
                window.dispatchEvent(event);
              }}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
            >
              Add Application
            </button>
            {adminEmail && (
              <span className="hidden md:inline-block px-3 py-2 text-sm text-gray-600">
                {adminEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

