import React, { useState, useEffect, useCallback } from 'react';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import projectService from '../services/projectService';
import centerService from '../services/centerService';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Load centers once
  useEffect(() => {
    const loadCenters = async () => {
      try {
        const centersData = await centerService.getCentersForSelect();
        setCenters(centersData);
      } catch (error) {
        console.error('Failed to load centers:', error);
      }
    };
    loadCenters();
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm || undefined,
        center_id: filterCenter || undefined,
        project_status: filterStatus || undefined,
        sortBy,
        sortOrder
      };

      const response = await projectService.getProjects(params);
      setProjects(response.projects);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems
      }));
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Không thể tải danh sách dự án. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, filterCenter, filterStatus, sortBy, sortOrder]);

  // Load projects whenever filters/pagination change
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (projectData) => {
    try {
      await projectService.createProject(projectData);
      setShowForm(false);
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const handleUpdateProject = async (id, projectData) => {
    try {
      await projectService.updateProject(id, projectData);
      setEditingProject(null);
      setShowForm(false); // Đóng modal sau khi cập nhật thành công
      loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      try {
        await projectService.deleteProject(id);
        loadProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Không thể xóa dự án. Có thể dự án này đang được sử dụng bởi nhân viên.');
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Quản lý Dự án</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Thêm Dự án
          </button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Quản lý Dự án</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Thêm Dự án
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>

        <div className="filter-group">
          <select
            value={filterCenter}
            onChange={(e) => setFilterCenter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trung tâm</option>
            {centers.map(center => (
              <option key={center.value} value={center.value}>
                {center.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            {projectService.getProjectStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="project_status">Sắp xếp theo trạng thái</option>
            <option value="center_id">Sắp xếp theo trung tâm</option>
            <option value="created_at">Sắp xếp theo ngày tạo</option>
          </select>

          <button
            onClick={() => handleSort(sortBy)}
            className="sort-btn"
          >
            {sortOrder === 'ASC' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Projects List */}
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            center={centers.find(c => c.value === project.center_id)}
            onEdit={() => handleEdit(project)}
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}
      </div>

      {/* No Data Message */}
      {!loading && projects.length === 0 && (
        <div className="no-data">
          <p>Không tìm thấy dự án nào.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="pagination-btn"
          >
            ← Trước
          </button>
          
          <span className="pagination-info">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="pagination-btn"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProject ? 'Chỉnh sửa Dự án' : 'Thêm Dự án mới'}</h2>
              <button onClick={handleCancel} className="modal-close">×</button>
            </div>
            <ProjectForm
              project={editingProject}
              centers={centers}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage; 