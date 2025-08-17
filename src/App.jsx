import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
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
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Đang khởi tạo ứng dụng...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'centers':
        return <CentersPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'freshers':
        return <FreshersPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="content">
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
