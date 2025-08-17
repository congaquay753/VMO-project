import api from './api';

export const projectService = {
  // Get all projects with optional filtering and pagination
  async getProjects(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.center_id) queryParams.append('center_id', params.center_id);
      if (params.project_status) queryParams.append('project_status', params.project_status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  },

  // Get project by ID
  async getProjectById(id) {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get project by ID error:', error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(id) {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  },

  // Get project statistics
  async getProjectStats(id) {
    try {
      const response = await api.get(`/projects/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Get project stats error:', error);
      throw error;
    }
  },

  // Get project status options
  getProjectStatusOptions() {
    return [
      { value: 'planning', label: 'Lập kế hoạch' },
      { value: 'in_progress', label: 'Đang thực hiện' },
      { value: 'completed', label: 'Hoàn thành' },
      { value: 'on_hold', label: 'Tạm dừng' },
      { value: 'cancelled', label: 'Hủy bỏ' }
    ];
  },

  // Get project status label
  getProjectStatusLabel(status) {
    const statusMap = {
      'planning': 'Lập kế hoạch',
      'in_progress': 'Đang thực hiện',
      'completed': 'Hoàn thành',
      'on_hold': 'Tạm dừng',
      'cancelled': 'Hủy bỏ'
    };
    return statusMap[status] || status;
  }
};

export default projectService; 