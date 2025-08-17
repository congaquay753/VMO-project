import React, { useState, useEffect } from 'react';
import centerService from '../services/centerService';
import projectService from '../services/projectService';
import staffService from '../services/staffService';

const Sidebar = ({ activeTab, onTabChange }) => {
  const [stats, setStats] = useState({
    centers: 0,
    projects: 0,
    staff: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load stats in parallel
      const [centersResponse, projectsResponse, staffResponse] = await Promise.all([
        centerService.getCenters({ limit: 1 }),
        projectService.getProjects({ limit: 1 }),
        staffService.getStaff({ limit: 1 })
      ]);

      setStats({
        centers: centersResponse.pagination.totalItems,
        projects: projectsResponse.pagination.totalItems,
        staff: staffResponse.pagination.totalItems
      });
    } catch (error) {
      console.error('Failed to load sidebar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Tổng quan hệ thống'
    },
    {
      id: 'centers',
      label: 'Trung tâm',
      icon: '🏢',
      description: `Quản lý trung tâm (${loading ? '...' : stats.centers})`
    },
    {
      id: 'projects',
      label: 'Dự án',
      icon: '📋',
      description: `Quản lý dự án (${loading ? '...' : stats.projects})`
    },
    {
      id: 'freshers',
      label: 'Nhân viên',
      icon: '👥',
      description: `Quản lý nhân viên (${loading ? '...' : stats.staff})`
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">MS System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
                title={item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.id !== 'dashboard' && (
                  <span className="nav-count">
                    {loading ? '...' : stats[item.id]}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="system-info">
          <div className="info-item">
            <span className="info-label">Phiên bản:</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Trạng thái:</span>
            <span className="info-value status-online">🟢 Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 