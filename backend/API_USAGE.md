# MS System API Usage Guide

Hướng dẫn sử dụng API cho hệ thống quản lý trung tâm, dự án và nhân viên.

## 🔑 Authentication

### 1. Login để lấy JWT Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "admin",
      "status": "active",
      "role": "admin"
    },
    "staff": {
      "id": 1,
      "gender": "male",
      "phone": "0901234567",
      "center_id": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Sử dụng Token trong các request

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/centers
```

## 🏢 Centers API

### Lấy danh sách trung tâm

```bash
# Lấy tất cả trung tâm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers"

# Lấy với pagination
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers?page=1&limit=5"

# Tìm kiếm theo tên
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers?search=công nghệ"

# Lọc theo lĩnh vực
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers?field=Công nghệ"
```

### Tạo trung tâm mới

```bash
curl -X POST http://localhost:5000/api/centers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trung tâm Nghiên cứu AI",
    "field": "Trí tuệ nhân tạo",
    "address": "789 Đường AI, Quận 9, TP.HCM"
  }'
```

### Cập nhật trung tâm

```bash
curl -X PUT http://localhost:5000/api/centers/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trung tâm Công nghệ Thông tin (Cập nhật)",
    "field": "Công nghệ thông tin",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  }'
```

### Xóa trung tâm

```bash
curl -X DELETE http://localhost:5000/api/centers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Lấy thống kê trung tâm

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers/1/stats"
```

## 📋 Projects API

### Lấy danh sách dự án

```bash
# Lấy tất cả dự án
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects"

# Lọc theo trung tâm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects?center_id=1"

# Lọc theo trạng thái
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects?project_status=in_progress"

# Tìm kiếm theo tên
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects?search=website"
```

### Tạo dự án mới

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hệ thống Quản lý Kho",
    "description": "Phần mềm quản lý kho hàng và tồn kho",
    "center_id": 1,
    "project_status": "planning"
  }'
```

### Cập nhật dự án

```bash
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hệ thống Quản lý Kho (Cập nhật)",
    "description": "Phần mềm quản lý kho hàng và tồn kho với tính năng mới",
    "center_id": 1,
    "project_status": "in_progress"
  }'
```

### Xóa dự án

```bash
curl -X DELETE http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 👥 Staff API

### Lấy danh sách nhân viên

```bash
# Lấy tất cả nhân viên
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/staff"

# Lọc theo trung tâm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/staff?center_id=1"

# Lọc theo giới tính
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/staff?gender=male"

# Tìm kiếm theo số điện thoại
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/staff?search=0901234567"
```

### Tạo nhân viên mới

```bash
curl -X POST http://localhost:5000/api/staff \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": null,
    "gender": "male",
    "phone": "0901234577",
    "address": "123 Đường MNO, Quận 2, TP.HCM",
    "description": "Lập trình viên Frontend",
    "center_id": 1
  }'
```

### Cập nhật nhân viên

```bash
curl -X PUT http://localhost:5000/api/staff/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "gender": "male",
    "phone": "0901234567",
    "address": "123 Đường ABC, Quận 1, TP.HCM (Cập nhật)",
    "description": "Quản lý trung tâm CNTT (Cập nhật)",
    "center_id": 1
  }'
```

### Xóa nhân viên

```bash
curl -X DELETE http://localhost:5000/api/staff/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 👤 Users API (Admin Only)

### Lấy danh sách người dùng

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/users"
```

### Tạo người dùng mới

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "manager1",
    "password": "manager123",
    "status": "active",
    "role_id": 2
  }'
```

### Cập nhật người dùng

```bash
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "manager1",
    "status": "active",
    "role_id": 2
  }'
```

### Thay đổi mật khẩu

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newadmin123"
  }'
```

## 🎭 Roles API (Admin Only)

### Lấy danh sách vai trò

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/roles"
```

### Tạo vai trò mới

```bash
curl -X POST http://localhost:5000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "supervisor"
  }'
```

## 🔗 Project Members API

### Lấy danh sách thành viên dự án

```bash
# Lấy tất cả thành viên
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/project-members"

# Lọc theo dự án
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/project-members?project_id=1"

# Lọc theo nhân viên
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/project-members?staff_id=1"

# Lọc theo trạng thái
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/project-members?status=active"
```

### Thêm thành viên vào dự án

```bash
curl -X POST http://localhost:5000/api/project-members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "staff_id": 2,
    "start_time": "2024-04-01T08:00:00.000Z",
    "end_time": null
  }'
```

### Cập nhật thành viên dự án

```bash
curl -X PUT http://localhost:5000/api/project-members/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "staff_id": 1,
    "start_time": "2024-01-01T08:00:00.000Z",
    "end_time": "2024-12-31T17:00:00.000Z"
  }'
```

### Đánh dấu hoàn thành

```bash
curl -X POST http://localhost:5000/api/project-members/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "end_time": "2024-12-31T17:00:00.000Z"
  }'
```

### Xóa thành viên khỏi dự án

```bash
curl -X DELETE http://localhost:5000/api/project-members/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Dashboard & Statistics

### Lấy thống kê tổng quan

```bash
# Thống kê trung tâm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers/1/stats"

# Thống kê dự án
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects/1/stats"

# Thống kê nhân viên
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/staff/1/stats"

# Thống kê vai trò
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/roles/1/stats"
```

## 🔍 Advanced Queries

### Tìm kiếm nâng cao

```bash
# Tìm kiếm trung tâm với nhiều tiêu chí
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers?search=công nghệ&field=Công nghệ&page=1&limit=10&sortBy=name&sortOrder=ASC"

# Tìm kiếm dự án với trạng thái và trung tâm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects?center_id=1&project_status=in_progress&search=website&page=1&limit=5"

# Tìm kiếm nhân viên với giới tính và trung tâm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/staff?center_id=1&gender=male&search=090123&page=1&limit=10"
```

### Sắp xếp và phân trang

```bash
# Sắp xếp theo tên tăng dần
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/centers?sortBy=name&sortOrder=ASC"

# Sắp xếp theo ngày tạo giảm dần
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects?sortBy=created_at&sortOrder=DESC"

# Phân trang với 5 items mỗi trang
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/staff?page=2&limit=5"
```

## 🚨 Error Handling

### Validation Errors

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Center name must be between 2 and 255 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```

### Authentication Errors

```json
{
  "status": "error",
  "message": "Access token is required"
}
```

### Authorization Errors

```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### Resource Not Found

```json
{
  "status": "error",
  "message": "Center not found"
}
```

## 📱 Frontend Integration

### JavaScript/React Example

```javascript
// Login function
const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// API call with authentication
const fetchCenters = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/centers', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    return data.data.centers;
  } catch (error) {
    console.error('Failed to fetch centers:', error);
    throw error;
  }
};

// Create center
const createCenter = async (centerData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/centers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(centerData),
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to create center:', error);
    throw error;
  }
};
```

### Axios Example

```javascript
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const centersAPI = {
  getAll: (params) => api.get('/centers', { params }),
  getById: (id) => api.get(`/centers/${id}`),
  create: (data) => api.post('/centers', data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  delete: (id) => api.delete(`/centers/${id}`),
  getStats: (id) => api.get(`/centers/${id}/stats`),
};

export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: (id) => api.get(`/projects/${id}/stats`),
};

export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  getStats: (id) => api.get(`/staff/${id}/stats`),
};
```

## 🔧 Testing với Postman

### 1. Import Collection
Tạo collection mới trong Postman và import các request sau:

### 2. Environment Variables
```
BASE_URL: http://localhost:5000
TOKEN: (sẽ được set sau khi login)
```

### 3. Pre-request Script cho Login
```javascript
pm.sendRequest({
    url: pm.environment.get("BASE_URL") + "/api/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            username: "admin",
            password: "admin123"
        })
    }
}, function (err, response) {
    if (err) {
        console.error(err);
    } else {
        const data = response.json();
        if (data.status === 'success') {
            pm.environment.set("TOKEN", data.data.token);
        }
    }
});
```

### 4. Authorization Header
Trong mỗi request, thêm header:
```
Authorization: Bearer {{TOKEN}}
```

## 📋 Checklist Testing

- [ ] Authentication endpoints
- [ ] CRUD operations cho Centers
- [ ] CRUD operations cho Projects
- [ ] CRUD operations cho Staff
- [ ] CRUD operations cho Users (Admin only)
- [ ] CRUD operations cho Roles (Admin only)
- [ ] CRUD operations cho Project Members
- [ ] Validation errors
- [ ] Authorization checks
- [ ] Pagination và filtering
- [ ] Statistics endpoints
- [ ] Error handling

## 🚀 Performance Tips

1. **Use pagination** cho large datasets
2. **Implement caching** cho frequently accessed data
3. **Optimize database queries** với proper indexing
4. **Use compression** middleware
5. **Implement rate limiting** cho production

## 🔒 Security Best Practices

1. **Always validate input** với express-validator
2. **Use HTTPS** trong production
3. **Implement rate limiting** để prevent abuse
4. **Regular security updates** cho dependencies
5. **Monitor API usage** và suspicious activities
6. **Use strong JWT secrets** và rotate regularly
7. **Implement proper CORS** configuration
8. **Validate file uploads** nếu có
9. **Use parameterized queries** để prevent SQL injection
10. **Implement proper logging** cho security events 