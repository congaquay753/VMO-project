import React from 'react';
import staffService from '../services/staffService';

const FresherCard = ({ fresher, center, onEdit, onDelete }) => {
  const getGenderLabel = (gender) => {
    return staffService.getGenderLabel(gender);
  };

  const getGenderIcon = (gender) => {
    const iconMap = {
      'male': '👨',
      'female': '👩',
      'other': '👤'
    };
    return iconMap[gender] || '👤';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    // Format phone number for display
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <div className="fresher-card">
      <div className="fresher-header">
        <div className="fresher-avatar">
          {getGenderIcon(fresher.gender)}
        </div>
        <div className="fresher-info">
          <h3 className="fresher-name">{fresher.name}</h3>
          <span className="fresher-gender">{getGenderLabel(fresher.gender)}</span>
        </div>
      </div>

      <div className="fresher-content">
        <div className="fresher-details">
          <div className="detail-item">
            <span className="detail-label">📅 Ngày sinh:</span>
            <span className="detail-value">
              {formatDate(fresher.birth_date)}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📱 Số điện thoại:</span>
            <span className="detail-value">
              {formatPhone(fresher.phone)}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">🏢 Trung tâm:</span>
            <span className="detail-value">
              {center ? center.label : 'Không xác định'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📍 Địa chỉ:</span>
            <span className="detail-value">
              {fresher.address || 'Không có địa chỉ'}
            </span>
          </div>

          {fresher.description && (
            <div className="detail-item">
              <span className="detail-label">📝 Mô tả:</span>
              <span className="detail-value">
                {fresher.description}
              </span>
            </div>
          )}

          <div className="detail-item">
            <span className="detail-label">🆔 ID:</span>
            <span className="detail-value">{fresher.id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📅 Tạo lúc:</span>
            <span className="detail-value">
              {formatDate(fresher.created_at)}
            </span>
          </div>

          {fresher.updated_at && fresher.updated_at !== fresher.created_at && (
            <div className="detail-item">
              <span className="detail-label">🔄 Cập nhật:</span>
              <span className="detail-value">
                {formatDate(fresher.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="fresher-actions">
        <button 
          onClick={() => onEdit(fresher)} 
          className="btn btn-edit"
          title="Chỉnh sửa nhân viên"
        >
          ✏️ Chỉnh sửa
        </button>
        <button 
          onClick={() => onDelete(fresher.id)} 
          className="btn btn-delete"
          title="Xóa nhân viên"
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
};

export default FresherCard; 