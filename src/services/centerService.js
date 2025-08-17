import api from './api';

export const centerService = {
  // Get all centers with optional filtering and pagination
  async getCenters(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.field) queryParams.append('field', params.field);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = `/centers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get centers error:', error);
      throw error;
    }
  },

  // Get center by ID
  async getCenterById(id) {
    try {
      const response = await api.get(`/centers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get center by ID error:', error);
      throw error;
    }
  },

  // Create new center
  async createCenter(centerData) {
    try {
      const response = await api.post('/centers', centerData);
      return response.data;
    } catch (error) {
      console.error('Create center error:', error);
      throw error;
    }
  },

  // Update center
  async updateCenter(id, centerData) {
    try {
      const response = await api.put(`/centers/${id}`, centerData);
      return response.data;
    } catch (error) {
      console.error('Update center error:', error);
      throw error;
    }
  },

  // Delete center
  async deleteCenter(id) {
    try {
      const response = await api.delete(`/centers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete center error:', error);
      throw error;
    }
  },

  // Get center statistics
  async getCenterStats(id) {
    try {
      const response = await api.get(`/centers/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Get center stats error:', error);
      throw error;
    }
  },

  // Get all centers for dropdown/select options
  async getCentersForSelect() {
    try {
      const response = await api.get('/centers?limit=1000');
      return response.data.centers.map(center => ({
        value: center.id,
        label: center.name,
        field: center.field
      }));
    } catch (error) {
      console.error('Get centers for select error:', error);
      throw error;
    }
  }
};

export default centerService; 