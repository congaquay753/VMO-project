import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import CentersPage from './pages/CentersPage';
import ProjectsPage from './pages/ProjectsPage';
import FreshersPage from './pages/FreshersPage';
import authService from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (loginResult) => {
    setUser(loginResult.user);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Đang khởi tạo ứng dụng...</p>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/centers" element={<CentersPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/freshers" element={<FreshersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
