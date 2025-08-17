import React, { useState } from 'react';
import authService from '../services/authService';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(formData.username, formData.password);
      onLogin(result);
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🏢</span>
            <h1>MS System</h1>
          </div>
          <p className="login-subtitle">Hệ thống quản lý trung tâm, dự án và nhân viên</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="login-input"
                placeholder="Nhập tên đăng nhập"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-input"
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            <code>Username: admin</code><br />
            <code>Password: admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 