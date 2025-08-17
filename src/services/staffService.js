import api from './api';

export const staffService = {
  // Get all staff with optional filtering and pagination
  async getStaff(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.center_id) queryParams.append('center_id', params.center_id);
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = `/staff${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get staff error:', error);
      throw error;
    }
  },

  // Get staff by ID
  async getStaffById(id) {
    try {
      const response = await api.get(`/staff/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get staff by ID error:', error);
      throw error;
    }
  },

  // Create new staff member
  async createStaff(staffData) {
    try {
      const response = await api.post('/staff', staffData);
      return response.data;
    } catch (error) {
      console.error('Create staff error:', error);
      throw error;
    }
  },

  // Update staff member
  async updateStaff(id, staffData) {
    try {
      const response = await api.put(`/staff/${id}`, staffData);
      return response.data;
    } catch (error) {
      console.error('Update staff error:', error);
      throw error;
    }
  },

  // Delete staff member
  async deleteStaff(id) {
    try {
      const response = await api.delete(`/staff/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete staff error:', error);
      throw error;
    }
  },

  // Get staff statistics
  async getStaffStats(id) {
    try {
      const response = await api.get(`/staff/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Get staff stats error:', error);
      throw error;
    }
  },

  // Get gender options
  getGenderOptions() {
    return [
      { value: 'male', label: 'Nam' },
      { value: 'female', label: 'Nữ' },
      { value: 'other', label: 'Khác' }
    ];
  },

  // Get gender label
  getGenderLabel(gender) {
    const genderMap = {
      'male': 'Nam',
      'female': 'Nữ',
      'other': 'Khác'
    };
    return genderMap[gender] || gender;
  }
};

export default staffService; 