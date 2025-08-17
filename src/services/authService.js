import api from './api';

export const authService = {
  // Login user
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password }, { includeAuth: false });
      
      if (response.status === 'success') {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Store staff info if available
        if (response.data.staff) {
          localStorage.setItem('staff', JSON.stringify(response.data.staff));
        }
        
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      // Call logout API
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('staff');
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData, { includeAuth: false });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored user data
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored staff data
  getStoredStaff() {
    const staffStr = localStorage.getItem('staff');
    return staffStr ? JSON.parse(staffStr) : null;
  },

  // Clear all auth data
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('staff');
  }
};

export default authService; 