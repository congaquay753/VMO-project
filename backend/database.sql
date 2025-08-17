-- MS System Database Schema
-- Tạo database
CREATE DATABASE IF NOT EXISTS ms_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ms_system;

-- Bảng roles (vai trò)
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng users (người dùng)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  role_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Bảng centers (trung tâm)
CREATE TABLE IF NOT EXISTS centers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng projects (dự án)
CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  center_id INT,
  project_status ENUM('planning', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE
);

-- Bảng staff (nhân viên)
CREATE TABLE IF NOT EXISTS staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  birth_date DATE,
  gender ENUM('male', 'female', 'other') NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  center_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE SET NULL
);

-- Bảng project_members (thành viên dự án)
CREATE TABLE IF NOT EXISTS project_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  staff_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_staff (project_id, staff_id)
);

-- Thêm dữ liệu mẫu

-- Thêm roles mặc định
INSERT IGNORE INTO roles (name) VALUES 
('admin'), ('manager'), ('staff'), ('member');

-- Thêm user admin mặc định (password: admin123)
INSERT IGNORE INTO users (name, password, role_id) 
SELECT 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/7KzqKqK', id 
FROM roles WHERE name = 'admin';

-- Thêm centers mẫu
INSERT IGNORE INTO centers (name, field, address) VALUES
('Trung tâm Công nghệ Thông tin', 'Công nghệ', '123 Đường ABC, Quận 1, TP.HCM'),
('Trung tâm Đào tạo Kinh doanh', 'Kinh doanh', '456 Đường XYZ, Quận 3, TP.HCM'),
('Trung tâm Nghiên cứu Khoa học', 'Khoa học', '789 Đường DEF, Quận 5, TP.HCM'),
('Trung tâm Giáo dục Quốc tế', 'Giáo dục', '321 Đường GHI, Quận 7, TP.HCM'),
('Trung tâm Y tế Cộng đồng', 'Y tế', '654 Đường JKL, Quận 10, TP.HCM');

-- Thêm projects mẫu
INSERT IGNORE INTO projects (name, description, center_id, project_status) VALUES
('Phát triển Website E-commerce', 'Xây dựng website bán hàng trực tuyến', 1, 'in_progress'),
('Hệ thống Quản lý Nhân sự', 'Phần mềm quản lý nhân viên và lương', 1, 'planning'),
('Khóa học Marketing Online', 'Đào tạo marketing cho doanh nghiệp', 2, 'completed'),
('Nghiên cứu AI trong Y tế', 'Ứng dụng AI để chẩn đoán bệnh', 3, 'in_progress'),
('Chương trình Du học Singapore', 'Tư vấn và hỗ trợ du học', 4, 'on_hold'),
('Dự án Vắc-xin COVID-19', 'Nghiên cứu và phát triển vắc-xin', 5, 'completed'),
('Hệ thống Quản lý Bệnh viện', 'Phần mềm quản lý bệnh nhân', 5, 'planning'),
('Khóa học Tiếng Anh Giao tiếp', 'Đào tạo tiếng Anh cho người đi làm', 4, 'in_progress'),
('Nghiên cứu Năng lượng Tái tạo', 'Phát triển nguồn năng lượng xanh', 3, 'planning'),
('Dự án Startup Công nghệ', 'Hỗ trợ khởi nghiệp công nghệ', 1, 'cancelled');

-- Thêm staff mẫu
INSERT IGNORE INTO staff (user_id, name, birth_date, gender, phone, address, description, center_id) VALUES
(1, 'Nguyễn Văn A', '1990-01-01', 'male', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', 'Quản lý trung tâm CNTT', 1),
(NULL, 'Trần Thị B', '1995-02-15', 'female', '0901234568', '456 Đường XYZ, Quận 3, TP.HCM', 'Nhân viên đào tạo', 2),
(NULL, 'Lê Văn C', '1992-03-20', 'male', '0901234569', '789 Đường DEF, Quận 5, TP.HCM', 'Nghiên cứu viên', 3),
(NULL, 'Phạm Thị D', '1998-04-25', 'female', '0901234570', '321 Đường GHI, Quận 7, TP.HCM', 'Tư vấn du học', 4),
(NULL, 'Hoàng Văn E', '1991-05-30', 'male', '0901234571', '654 Đường JKL, Quận 10, TP.HCM', 'Bác sĩ nghiên cứu', 5),
(NULL, 'Nguyễn Thị F', '1993-06-05', 'female', '0901234572', '123 Đường ABC, Quận 1, TP.HCM', 'Lập trình viên', 1),
(NULL, 'Trần Văn G', '1994-07-10', 'male', '0901234573', '456 Đường XYZ, Quận 3, TP.HCM', 'Giảng viên kinh doanh', 2),
(NULL, 'Lê Thị H', '1996-08-15', 'female', '0901234574', '789 Đường DEF, Quận 5, TP.HCM', 'Nhà khoa học', 3),
(NULL, 'Phạm Văn I', '1997-09-20', 'male', '0901234575', '321 Đường GHI, Quận 7, TP.HCM', 'Chuyên gia giáo dục', 4),
(NULL, 'Hoàng Thị K', '1999-10-25', 'female', '0901234576', '654 Đường JKL, Quận 10, TP.HCM', 'Y tá nghiên cứu', 5);

-- Thêm project members mẫu
INSERT IGNORE INTO project_members (project_id, staff_id, start_time, end_time) VALUES
(1, 1, '2024-01-01 08:00:00', NULL),
(1, 6, '2024-01-01 08:00:00', NULL),
(2, 1, '2024-02-01 08:00:00', NULL),
(3, 2, '2024-01-15 08:00:00', '2024-03-15 17:00:00'),
(4, 3, '2024-01-01 08:00:00', NULL),
(4, 8, '2024-01-01 08:00:00', NULL),
(5, 4, '2024-02-01 08:00:00', NULL),
(6, 5, '2024-01-01 08:00:00', '2024-06-01 17:00:00'),
(6, 10, '2024-01-01 08:00:00', '2024-06-01 17:00:00'),
(7, 5, '2024-03-01 08:00:00', NULL),
(8, 4, '2024-01-01 08:00:00', NULL),
(9, 3, '2024-02-01 08:00:00', NULL),
(10, 1, '2024-01-01 08:00:00', '2024-02-01 17:00:00');

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_projects_center_id ON projects(center_id);
CREATE INDEX idx_staff_center_id ON staff(center_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_staff_id ON project_members(staff_id);
CREATE INDEX idx_centers_name ON centers(name);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_staff_phone ON staff(phone);

-- Tạo view để dễ dàng truy vấn thông tin tổng hợp
CREATE OR REPLACE VIEW center_overview AS
SELECT 
  c.id,
  c.name,
  c.field,
  c.address,
  COUNT(DISTINCT s.id) as staff_count,
  COUNT(DISTINCT p.id) as project_count,
  c.created_at,
  c.updated_at
FROM centers c
LEFT JOIN staff s ON c.id = s.center_id
LEFT JOIN projects p ON c.id = p.center_id
GROUP BY c.id;

CREATE OR REPLACE VIEW project_overview AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.project_status,
  c.name as center_name,
  c.field as center_field,
  COUNT(pm.id) as member_count,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN centers c ON p.center_id = c.id
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id;

CREATE OR REPLACE VIEW staff_overview AS
SELECT 
  s.id,
  s.gender,
  s.phone,
  s.address,
  s.description,
  c.name as center_name,
  c.field as center_field,
  u.name as user_name,
  u.status as user_status,
  COUNT(pm.id) as project_count,
  s.created_at,
  s.updated_at
FROM staff s
LEFT JOIN centers c ON s.center_id = c.id
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN project_members pm ON s.id = pm.staff_id
GROUP BY s.id;

-- Hiển thị thông tin database
SELECT 'Database created successfully!' as message;
SELECT COUNT(*) as roles_count FROM roles;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as centers_count FROM centers;
SELECT COUNT(*) as projects_count FROM projects;
SELECT COUNT(*) as staff_count FROM staff;
SELECT COUNT(*) as project_members_count FROM project_members; 