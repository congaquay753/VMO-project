import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';

const Header = ({ user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      onLogout(); // Force logout even if API fails
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-gradient"></div>
          </div>
          <h1>MS System</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="user-menu" ref={userMenuRef}>
          <button
            className="user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div className="avatar-content">
              <div className="avatar-silhouette"></div>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="dropdown-overlay" onClick={() => setShowUserMenu(false)} />
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-name">{user?.name || 'admin'}</div>
                  <div className="user-role">{user?.role || 'admin'}</div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-item"
                >
                  <span className="dropdown-icon">🚪</span>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 