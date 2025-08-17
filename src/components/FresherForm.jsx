import React, { useState, useEffect } from 'react';
import staffService from '../services/staffService';

const FresherForm = ({ fresher, centers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
    phone: '',
    address: '',
    description: '',
    center_id: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fresher) {
      setFormData({
        name: fresher.name || '',
        birth_date: fresher.birth_date ? fresher.birth_date.split('T')[0] : '',
        gender: fresher.gender || '',
        phone: fresher.phone || '',
        address: fresher.address || '',
        description: fresher.description || '',
        center_id: fresher.center_id || ''
      });
    }
  }, [fresher]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhân viên là bắt buộc';
    }

    if (!formData.gender) {
      newErrors.gender = 'Giới tính là bắt buộc';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.center_id) {
      newErrors.center_id = 'Vui lòng chọn trung tâm';
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
      if (fresher) {
        await onSubmit(fresher.id, formData);
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

  const genderOptions = staffService.getGenderOptions();

  return (
    <form onSubmit={handleSubmit} className="fresher-form">
      <div className="form-group">
        <label htmlFor="name">Tên nhân viên *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Nhập tên nhân viên"
          disabled={loading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="birth_date">Ngày sinh</label>
        <input
          type="date"
          id="birth_date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleChange}
          className="form-input"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="gender">Giới tính *</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className={`form-select ${errors.gender ? 'error' : ''}`}
          disabled={loading}
        >
          <option value="">Chọn giới tính</option>
          {genderOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.gender && <span className="error-message">{errors.gender}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Số điện thoại *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`form-input ${errors.phone ? 'error' : ''}`}
          placeholder="Nhập số điện thoại"
          disabled={loading}
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address">Địa chỉ *</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`form-textarea ${errors.address ? 'error' : ''}`}
          placeholder="Nhập địa chỉ nhân viên"
          rows="3"
          disabled={loading}
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Mô tả</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Nhập mô tả nhân viên (không bắt buộc)"
          rows="3"
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
            fresher ? 'Cập nhật' : 'Thêm mới'
          )}
        </button>
      </div>
    </form>
  );
};

export default FresherForm; 