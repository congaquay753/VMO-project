// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: createHeaders(options.includeAuth !== false),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// API methods
export const api = {
  // GET request
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'GET', ...options }),
  
  // POST request
  post: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data), 
      ...options 
    }),
  
  // PUT request
  put: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data), 
      ...options 
    }),
  
  // DELETE request
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'DELETE', ...options }),
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default api; 