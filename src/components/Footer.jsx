import React, { useState, useEffect } from 'react';
import centerService from '../services/centerService';
import projectService from '../services/projectService';
import staffService from '../services/staffService';

const Footer = () => {
  const [stats, setStats] = useState({
    centers: 0,
    projects: 0,
    staff: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [centersData, projectsData, staffData] = await Promise.all([
          centerService.getCenters({ limit: 1 }),
          projectService.getProjects({ limit: 1 }),
          staffService.getStaff({ limit: 1 })
        ]);

        setStats({
          centers: centersData.pagination.totalItems,
          projects: projectsData.pagination.totalItems,
          staff: staffData.pagination.totalItems
        });
      } catch (error) {
        console.error('Failed to load footer stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>© 2025 MS System - Hệ thống quản lý trung tâm, dự án và nhân viên</p>
          <p> Phiên bản 1.0.0</p>
        </div>
        <div className="footer-status">
          <span className="status-indicator">🟢</span>
          <span className="status-text">Hệ thống hoạt động bình thường</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 