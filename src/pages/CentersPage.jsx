import React, { useState, useEffect, useCallback } from 'react';
import CenterCard from '../components/CenterCard';
import CenterForm from '../components/CenterForm';
import centerService from '../services/centerService';

const CentersPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const loadCenters = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm || undefined,
        field: filterField || undefined,
        sortBy,
        sortOrder
      };

      const response = await centerService.getCenters(params);
      setCenters(response.centers);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems
      }));
    } catch (error) {
      console.error('Failed to load centers:', error);
      setError('Không thể tải danh sách trung tâm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, filterField, sortBy, sortOrder]);

  useEffect(() => {
    loadCenters();
  }, [loadCenters]);

  const handleCreateCenter = async (centerData) => {
    try {
      await centerService.createCenter(centerData);
      setShowForm(false);
      loadCenters();
    } catch (error) {
      console.error('Failed to create center:', error);
      throw error;
    }
  };

  const handleUpdateCenter = async (id, centerData) => {
    try {
      await centerService.updateCenter(id, centerData);
      setEditingCenter(null);
      setShowForm(false); // Đóng modal sau khi cập nhật thành công
      loadCenters();
    } catch (error) {
      console.error('Failed to update center:', error);
      throw error;
    }
  };

  const handleDeleteCenter = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trung tâm này?')) {
      try {
        await centerService.deleteCenter(id);
        loadCenters();
      } catch (error) {
        console.error('Failed to delete center:', error);
        alert('Không thể xóa trung tâm. Có thể trung tâm này đang được sử dụng bởi dự án hoặc nhân viên.');
      }
    }
  };

  const handleEdit = (center) => {
    setEditingCenter(center);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCenter(null);
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

  if (loading && centers.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Quản lý Trung tâm</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Thêm Trung tâm
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
        <h1>Quản lý Trung tâm</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Thêm Trung tâm
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm trung tâm..."
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
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả lĩnh vực</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Kinh doanh">Kinh doanh</option>
            <option value="Marketing">Marketing</option>
            <option value="Tài chính">Tài chính</option>
            <option value="Giáo dục">Giáo dục</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="field">Sắp xếp theo lĩnh vực</option>
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

      {/* Centers List */}
      <div className="centers-grid">
        {centers.map(center => (
          <CenterCard
            key={center.id}
            center={center}
            onEdit={() => handleEdit(center)}
            onDelete={() => handleDeleteCenter(center.id)}
          />
        ))}
      </div>

      {/* No Data Message */}
      {!loading && centers.length === 0 && (
        <div className="no-data">
          <p>Không tìm thấy trung tâm nào.</p>
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
              <h2>{editingCenter ? 'Chỉnh sửa Trung tâm' : 'Thêm Trung tâm mới'}</h2>
              <button onClick={handleCancel} className="modal-close">×</button>
            </div>
            <CenterForm
              center={editingCenter}
              onSubmit={editingCenter ? handleUpdateCenter : handleCreateCenter}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CentersPage; 