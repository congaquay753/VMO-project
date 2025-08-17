import api from './api';

export const dashboardService = {
  // Get overall dashboard statistics
  async getDashboardStats() {
    try {
      // Get centers count
      const centersResponse = await api.get('/centers?limit=1');
      const totalCenters = centersResponse.data.pagination.totalItems;

      // Get projects count
      const projectsResponse = await api.get('/projects?limit=1');
      const totalProjects = projectsResponse.data.pagination.totalItems;

      // Get staff count
      const staffResponse = await api.get('/staff?limit=1');
      const totalStaff = staffResponse.data.pagination.totalItems;

      // Get centers with staff count for pie chart
      const centersData = await api.get('/centers?limit=1000');
      const centersWithStaffCount = centersData.data.centers.map(center => ({
        name: center.name,
        staffCount: center.staff_count || 0,
        projectCount: center.project_count || 0
      }));

      return {
        totalCenters,
        totalProjects,
        totalStaff,
        centersWithStaffCount
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get centers statistics for pie chart
  async getCentersStats() {
    try {
      const response = await api.get('/centers?limit=1000');
      return response.data.centers.map(center => ({
        name: center.name,
        staffCount: center.staff_count || 0,
        projectCount: center.project_count || 0
      }));
    } catch (error) {
      console.error('Get centers stats error:', error);
      throw error;
    }
  },

  // Get projects by status statistics
  async getProjectsByStatusStats() {
    try {
      const response = await api.get('/projects?limit=1000');
      const projects = response.data.projects;
      
      const statusStats = {
        planning: 0,
        in_progress: 0,
        completed: 0,
        on_hold: 0,
        cancelled: 0
      };

      projects.forEach(project => {
        if (statusStats.hasOwnProperty(project.project_status)) {
          statusStats[project.project_status]++;
        }
      });

      return Object.entries(statusStats).map(([status, count]) => ({
        status: this.getStatusLabel(status),
        count,
        color: this.getStatusColor(status)
      }));
    } catch (error) {
      console.error('Get projects by status stats error:', error);
      throw error;
    }
  },

  // Get staff by gender statistics
  async getStaffByGenderStats() {
    try {
      const response = await api.get('/staff?limit=1000');
      const staff = response.data.staff;
      
      const genderStats = {
        male: 0,
        female: 0,
        other: 0
      };

      staff.forEach(member => {
        if (genderStats.hasOwnProperty(member.gender)) {
          genderStats[member.gender]++;
        }
      });

      return Object.entries(genderStats).map(([gender, count]) => ({
        gender: this.getGenderLabel(gender),
        count,
        color: this.getGenderColor(gender)
      }));
    } catch (error) {
      console.error('Get staff by gender stats error:', error);
      throw error;
    }
  },

  // Get recent activities
  async getRecentActivities() {
    try {
      // Get recent centers
      const recentCenters = await api.get('/centers?limit=5&sortBy=created_at&sortOrder=DESC');
      
      // Get recent projects
      const recentProjects = await api.get('/projects?limit=5&sortBy=created_at&sortOrder=DESC');
      
      // Get recent staff
      const recentStaff = await api.get('/staff?limit=5&sortBy=created_at&sortOrder=DESC');

      return {
        recentCenters: recentCenters.data.centers,
        recentProjects: recentProjects.data.projects,
        recentStaff: recentStaff.data.staff
      };
    } catch (error) {
      console.error('Get recent activities error:', error);
      throw error;
    }
  },

  // Helper methods for labels and colors
  getStatusLabel(status) {
    const statusMap = {
      'planning': 'Lập kế hoạch',
      'in_progress': 'Đang thực hiện',
      'completed': 'Hoàn thành',
      'on_hold': 'Tạm dừng',
      'cancelled': 'Hủy bỏ'
    };
    return statusMap[status] || status;
  },

  getStatusColor(status) {
    const colorMap = {
      'planning': '#3498db',
      'in_progress': '#f39c12',
      'completed': '#27ae60',
      'on_hold': '#e74c3c',
      'cancelled': '#95a5a6'
    };
    return colorMap[status] || '#95a5a6';
  },

  getGenderLabel(gender) {
    const genderMap = {
      'male': 'Nam',
      'female': 'Nữ',
      'other': 'Khác'
    };
    return genderMap[gender] || gender;
  },

  getGenderColor(gender) {
    const colorMap = {
      'male': '#3498db',
      'female': '#e91e63',
      'other': '#9b59b6'
    };
    return colorMap[gender] || '#95a5a6';
  }
};

export default dashboardService; 