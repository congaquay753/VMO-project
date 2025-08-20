import React, { useState, useEffect, useCallback } from 'react';
import FresherCard from '../components/FresherCard';
import FresherForm from '../components/FresherForm';
import staffService from '../services/staffService';
import centerService from '../services/centerService';

const FreshersPage = () => {
  const [staff, setStaff] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [filterGender, setFilterGender] = useState('');
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

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm || undefined,
        center_id: filterCenter || undefined,
        gender: filterGender || undefined,
        sortBy,
        sortOrder
      };

      const response = await staffService.getStaff(params);
      setStaff(response.staff);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems
      }));
    } catch (error) {
      console.error('Failed to load staff:', error);
      setError('Không thể tải danh sách nhân viên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, filterCenter, filterGender, sortBy, sortOrder]);

  // Load staff whenever filters/pagination change
  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleCreateStaff = async (staffData) => {
    try {
      await staffService.createStaff(staffData);
      setShowForm(false);
      loadStaff();
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  };

  const handleUpdateStaff = async (id, staffData) => {
    try {
      await staffService.updateStaff(id, staffData);
      setEditingStaff(null);
      setShowForm(false); // Đóng modal sau khi cập nhật thành công
      loadStaff();
    } catch (error) {
      console.error('Failed to update staff:', error);
      throw error;
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await staffService.deleteStaff(id);
        loadStaff();
      } catch (error) {
        console.error('Failed to delete staff:', error);
        alert('Không thể xóa nhân viên. Có thể nhân viên này đang được gán vào dự án.');
      }
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
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

  if (loading && staff.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Quản lý Nhân viên</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Thêm Nhân viên
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
        <h1>Quản lý Nhân viên</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Thêm Nhân viên
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
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
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả giới tính</option>
            {staffService.getGenderOptions().map(option => (
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
            <option value="gender">Sắp xếp theo giới tính</option>
            <option value="center_id">Sắp xếp theo trung tâm</option>
            <option value="birth_date">Sắp xếp theo ngày sinh</option>
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

      {/* Staff List */}
      <div className="freshers-grid">
        {staff.map(staffMember => (
          <FresherCard
            key={staffMember.id}
            fresher={staffMember}
            center={centers.find(c => c.value === staffMember.center_id)}
            onEdit={() => handleEdit(staffMember)}
            onDelete={() => handleDeleteStaff(staffMember.id)}
          />
        ))}
      </div>

      {/* No Data Message */}
      {!loading && staff.length === 0 && (
        <div className="no-data">
          <p>Không tìm thấy nhân viên nào.</p>
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
              <h2>{editingStaff ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}</h2>
              <button onClick={handleCancel} className="modal-close">×</button>
            </div>
            <FresherForm
              fresher={editingStaff}
              centers={centers}
              onSubmit={editingStaff ? handleUpdateStaff : handleCreateStaff}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FreshersPage; 