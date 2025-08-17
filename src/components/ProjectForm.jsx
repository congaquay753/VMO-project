import React, { useState, useEffect } from 'react';
import projectService from '../services/projectService';

const ProjectForm = ({ project, centers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    center_id: '',
    project_status: 'planning'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        center_id: project.center_id || '',
        project_status: project.project_status || 'planning'
      });
    }
  }, [project]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên dự án là bắt buộc';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên dự án phải có ít nhất 2 ký tự';
    }

    if (!formData.center_id) {
      newErrors.center_id = 'Vui lòng chọn trung tâm';
    }

    if (!formData.project_status) {
      newErrors.project_status = 'Vui lòng chọn trạng thái dự án';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (project) {
        await onSubmit(project.id, formData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done by the parent component
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = projectService.getProjectStatusOptions();

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-group">
        <label htmlFor="name">Tên dự án *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Nhập tên dự án"
          disabled={loading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Mô tả</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Nhập mô tả dự án (không bắt buộc)"
          rows="4"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="center_id">Trung tâm *</label>
        <select
          id="center_id"
          name="center_id"
          value={formData.center_id}
          onChange={handleChange}
          className={`form-select ${errors.center_id ? 'error' : ''}`}
          disabled={loading}
        >
          <option value="">Chọn trung tâm</option>
          {centers.map(center => (
            <option key={center.value} value={center.value}>
              {center.label} - {center.field}
            </option>
          ))}
        </select>
        {errors.center_id && <span className="error-message">{errors.center_id}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="project_status">Trạng thái dự án *</label>
        <select
          id="project_status"
          name="project_status"
          value={formData.project_status}
          onChange={handleChange}
          className={`form-select ${errors.project_status ? 'error' : ''}`}
          disabled={loading}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.project_status && <span className="error-message">{errors.project_status}</span>}
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            project ? 'Cập nhật' : 'Thêm mới'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm; 