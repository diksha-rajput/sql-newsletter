import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ isAdmin }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
              <i className="fas fa-database text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">SQL Newsletter</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/subscribe" 
              className={`font-medium transition-colors duration-200 ${
                isActive('/subscribe') 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Subscribe
            </Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className={`font-medium transition-colors duration-200 ${
                  isActive('/admin') 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <i className="fas fa-cog mr-1"></i>
                Admin
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
