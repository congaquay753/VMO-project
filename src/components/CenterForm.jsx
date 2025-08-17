import React, { useState, useEffect } from 'react';

const CenterForm = ({ center, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    field: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (center) {
      setFormData({
        name: center.name || '',
        field: center.field || '',
        address: center.address || ''
      });
    }
  }, [center]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên trung tâm là bắt buộc';
    }

    if (!formData.field.trim()) {
      newErrors.field = 'Lĩnh vực là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
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
      if (center) {
        await onSubmit(center.id, formData);
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

  const fieldOptions = [
    'Công nghệ thông tin',
    'Kinh doanh',
    'Marketing',
    'Tài chính',
    'Giáo dục',
    'Y tế',
    'Du lịch',
    'Thể thao',
    'Nghệ thuật',
    'Khác'
  ];

  return (
    <form onSubmit={handleSubmit} className="center-form">
      <div className="form-group">
        <label htmlFor="name">Tên trung tâm *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Nhập tên trung tâm"
          disabled={loading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="field">Lĩnh vực *</label>
        <select
          id="field"
          name="field"
          value={formData.field}
          onChange={handleChange}
          className={`form-select ${errors.field ? 'error' : ''}`}
          disabled={loading}
        >
          <option value="">Chọn lĩnh vực</option>
          {fieldOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.field && <span className="error-message">{errors.field}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address">Địa chỉ *</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`form-textarea ${errors.address ? 'error' : ''}`}
          placeholder="Nhập địa chỉ trung tâm"
          rows="3"
          disabled={loading}
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
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
            center ? 'Cập nhật' : 'Thêm mới'
          )}
        </button>
      </div>
    </form>
  );
};

export default CenterForm; 