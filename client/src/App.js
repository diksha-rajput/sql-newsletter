import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Subscribe from './pages/Subscribe';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import './styles/App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (simple check for demo)
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Header isAdmin={isAdmin} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/admin" element={<Admin isAdmin={isAdmin} />} />
            <Route path="/login" element={<Login setIsAdmin={setIsAdmin} />} />
          </Routes>
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
