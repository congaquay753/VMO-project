import React from 'react';

const CenterCard = ({ center, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="center-card">
      <div className="center-header">
        <div className="center-icon">🏢</div>
        <div className="center-info">
          <h3 className="center-name">{center.name}</h3>
          <span className="center-field">{center.field}</span>
        </div>
      </div>

      <div className="center-content">
        <div className="center-details">
          <div className="detail-item">
            <span className="detail-label">📍 Địa chỉ:</span>
            <span className="detail-value">
              {center.address || 'Không có địa chỉ'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">🆔 ID:</span>
            <span className="detail-value">{center.id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📅 Tạo lúc:</span>
            <span className="detail-value">
              {formatDate(center.created_at)}
            </span>
          </div>

          {center.updated_at && center.updated_at !== center.created_at && (
            <div className="detail-item">
              <span className="detail-label">🔄 Cập nhật:</span>
              <span className="detail-value">
                {formatDate(center.updated_at)}
              </span>
            </div>
          )}

          {center.staff_count !== undefined && (
            <div className="detail-item">
              <span className="detail-label">👥 Số nhân viên:</span>
              <span className="detail-value">{center.staff_count}</span>
            </div>
          )}

          {center.project_count !== undefined && (
            <div className="detail-item">
              <span className="detail-label">📋 Số dự án:</span>
              <span className="detail-value">{center.project_count}</span>
            </div>
          )}
        </div>
      </div>

      <div className="center-actions">
        <button 
          onClick={() => onEdit(center)} 
          className="btn btn-edit"
          title="Chỉnh sửa trung tâm"
        >
          ✏️ Chỉnh sửa
        </button>
        <button 
          onClick={() => onDelete(center.id)} 
          className="btn btn-delete"
          title="Xóa trung tâm"
        >
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
};

export default CenterCard; 