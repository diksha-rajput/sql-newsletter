/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <i className="fas fa-database text-xl"></i>
              </div>
              <span className="text-2xl font-bold">SQL Newsletter</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Master SQL interviews with our curated newsletter featuring daily tips, 
              practice questions, and expert insights from top database professionals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-github text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/subscribe" className="text-gray-400 hover:text-white transition-colors">Subscribe</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Archive</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Topics</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400">SQL Basics</span></li>
              <li><span className="text-gray-400">Advanced Queries</span></li>
              <li><span className="text-gray-400">Database Design</span></li>
              <li><span className="text-gray-400">Interview Tips</span></li>
              <li><span className="text-gray-400">Practice Problems</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} SQL Newsletter. All rights reserved. 
            Built with ❤️ for SQL learners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
