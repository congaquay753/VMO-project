import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import dashboardService from '../services/dashboardService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalProjects: 0,
    totalStaff: 0
  });
  const [centersData, setCentersData] = useState([]);
  const [projectsByStatus, setProjectsByStatus] = useState([]);
  const [staffByGender, setStaffByGender] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all dashboard data in parallel
      const [dashboardStats, centersStats, projectsStats, staffStats] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getCentersStats(),
        dashboardService.getProjectsByStatusStats(),
        dashboardService.getStaffByGenderStats()
      ]);

      setStats(dashboardStats);
      setCentersData(dashboardStats.centersWithStaffCount);
      setProjectsByStatus(projectsStats);
      setStaffByGender(staffStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Chart data for centers pie chart
  const centersChartData = {
    labels: centersData.map(center => center.name),
    datasets: [
      {
        data: centersData.map(center => center.staffCount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Chart data for projects by status
  const projectsChartData = {
    labels: projectsByStatus.map(item => item.status),
    datasets: [
      {
        label: 'Số lượng dự án',
        data: projectsByStatus.map(item => item.count),
        backgroundColor: projectsByStatus.map(item => item.color),
        borderWidth: 1,
        borderColor: '#fff'
      }
    ]
  };

  // Chart data for staff by gender
  const staffChartData = {
    labels: staffByGender.map(item => item.gender),
    datasets: [
      {
        label: 'Số lượng nhân viên',
        data: staffByGender.map(item => item.count),
        backgroundColor: staffByGender.map(item => item.color),
        borderWidth: 1,
        borderColor: '#fff'
      }
    ]
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Thống kê tổng quan hệ thống</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Thống kê tổng quan hệ thống</p>
        </div>
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
          <button onClick={loadDashboardData} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Thống kê tổng quan hệ thống</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalCenters}</h3>
            <p className="stat-label">Trung tâm</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalProjects}</h3>
            <p className="stat-label">Dự án</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalStaff}</h3>
            <p className="stat-label">Nhân viên</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Phân bố nhân viên theo trung tâm</h3>
          <div className="chart-wrapper">
            <Pie 
              data={centersChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>Dự án theo trạng thái</h3>
          <div className="chart-wrapper">
            <Bar 
              data={projectsChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Số lượng: ${context.parsed.y}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>Nhân viên theo giới tính</h3>
          <div className="chart-wrapper">
            <Bar 
              data={staffChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Số lượng: ${context.parsed.y}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>📊 Tóm tắt</h3>
          <ul>
            <li>Tổng số trung tâm: <strong>{stats.totalCenters}</strong></li>
            <li>Tổng số dự án: <strong>{stats.totalProjects}</strong></li>
            <li>Tổng số nhân viên: <strong>{stats.totalStaff}</strong></li>
            <li>Trung tâm có nhiều nhân viên nhất: <strong>
              {centersData.length > 0 ? 
                centersData.reduce((max, center) => 
                  center.staffCount > max.staffCount ? center : max
                ).name : 'N/A'
              }
            </strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 