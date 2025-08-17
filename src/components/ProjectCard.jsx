import React from 'react';
import projectService from '../services/projectService';

const ProjectCard = ({ project, center, onEdit, onDelete }) => {
  const getStatusLabel = (status) => {
    return projectService.getProjectStatusLabel(status);
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'planning': '#3498db',
      'in_progress': '#f39c12',
      'completed': '#27ae60',
      'on_hold': '#e74c3c',
      'cancelled': '#95a5a6'
    };
    return colorMap[status] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h3 className="project-name">{project.name}</h3>
        <div className="project-status" style={{ backgroundColor: getStatusColor(project.project_status) }}>
          {getStatusLabel(project.project_status)}
        </div>
      </div>

      <div className="project-content">
        <p className="project-description">
          {project.description || 'Không có mô tả'}
        </p>

        <div className="project-details">
          <div className="detail-item">
            <span className="detail-label">Trung tâm:</span>
            <span className="detail-value">
              {center ? center.label : 'Không xác định'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Ngày tạo:</span>
            <span className="detail-value">
              {formatDate(project.created_at)}
            </span>
          </div>

          {project.updated_at && project.updated_at !== project.created_at && (
            <div className="detail-item">
              <span className="detail-label">Cập nhật:</span>
              <span className="detail-value">
                {formatDate(project.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="project-actions">
        <button 
          onClick={() => onEdit(project)} 
          className="btn btn-edit"
          title="Chỉnh sửa dự án"
        >
          ✏️ Chỉnh sửa
        </button>
        <button 
          onClick={() => onDelete(project.id)} 
          className="btn btn-delete"
          title="Xóa dự án"
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
};

export default ProjectCard; 