# MS System Backend API

Backend API cho hệ thống quản lý trung tâm, dự án và nhân viên được xây dựng bằng Node.js, Express.js và MySQL.

## 🚀 Tính năng

### 🔐 Authentication & Authorization
- **JWT-based authentication** với bcrypt password hashing
- **Role-based access control** (Admin, Manager, Staff, Member)
- **Protected routes** với middleware xác thực
- **User management** với status tracking

### 🏢 Centers Management
- **CRUD operations** cho trung tâm
- **Field categorization** (lĩnh vực)
- **Address management** với validation
- **Statistics** về staff và projects

### 📋 Projects Management
- **CRUD operations** cho dự án
- **Status tracking** (planning, in_progress, completed, on_hold, cancelled)
- **Center association** với foreign key constraints
- **Member management** với time tracking

### 👥 Staff Management
- **CRUD operations** cho nhân viên
- **User association** (optional)
- **Center assignment** với validation
- **Gender tracking** và contact information

### 👤 Users Management
- **User accounts** với role assignment
- **Password management** với secure hashing
- **Status tracking** (active, inactive, suspended)
- **Staff profile linking**

### 🎭 Roles Management
- **Role creation** và assignment
- **Permission management** cho different access levels
- **User statistics** per role

### 🔗 Project Members Management
- **Staff assignment** to projects
- **Time tracking** (start_time, end_time)
- **Overlap prevention** cho staff scheduling
- **Completion tracking**

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors
- **Logging**: morgan
- **Compression**: compression

## 📋 Requirements

- **Node.js**: v16.0.0 hoặc cao hơn
- **MySQL**: 8.0 hoặc cao hơn
- **npm**: 8.0.0 hoặc cao hơn

## 🚀 Installation

### 1. Clone repository
```bash
git clone <repository-url>
cd do_an/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Tạo file `.env` từ `env.example`:
```bash
cp env.example .env
```

Cập nhật các biến môi trường:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ms_system
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
```

### 4. Database Setup
Tạo database MySQL:
```sql
CREATE DATABASE ms_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 Database Schema

### Tables Structure

#### 1. **roles**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(100), UNIQUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. **users**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255))
- `password` (VARCHAR(255))
- `status` (ENUM: 'active', 'inactive', 'suspended')
- `role_id` (INT, FOREIGN KEY → roles.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. **centers**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255))
- `field` (VARCHAR(255))
- `address` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 4. **projects**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255))
- `description` (TEXT)
- `center_id` (INT, FOREIGN KEY → centers.id)
- `project_status` (ENUM: 'planning', 'in_progress', 'completed', 'on_hold', 'cancelled')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 5. **staff**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, FOREIGN KEY → users.id, NULLABLE)
- `gender` (ENUM: 'male', 'female', 'other')
- `phone` (VARCHAR(20))
- `address` (TEXT)
- `description` (TEXT)
- `center_id` (INT, FOREIGN KEY → centers.id, NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 6. **project_members**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `project_id` (INT, FOREIGN KEY → projects.id)
- `staff_id` (INT, FOREIGN KEY → staff.id)
- `start_time` (DATETIME)
- `end_time` (DATETIME, NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password

### Centers
- `GET /api/centers` - Get all centers (with pagination & filtering)
- `GET /api/centers/:id` - Get center by ID
- `POST /api/centers` - Create new center
- `PUT /api/centers/:id` - Update center
- `DELETE /api/centers/:id` - Delete center
- `GET /api/centers/:id/stats` - Get center statistics

### Projects
- `GET /api/projects` - Get all projects (with pagination & filtering)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/stats` - Get project statistics

### Staff
- `GET /api/staff` - Get all staff (with pagination & filtering)
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member
- `GET /api/staff/:id/stats` - Get staff statistics

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/:id/stats` - Get user statistics (Admin only)

### Roles
- `GET /api/roles` - Get all roles (Admin only)
- `GET /api/roles/:id` - Get role by ID (Admin only)
- `POST /api/roles` - Create new role (Admin only)
- `PUT /api/roles/:id` - Update role (Admin only)
- `DELETE /api/roles/:id` - Delete role (Admin only)
- `GET /api/roles/:id/stats` - Get role statistics (Admin only)

### Project Members
- `GET /api/project-members` - Get all project members
- `GET /api/project-members/:id` - Get project member by ID
- `POST /api/project-members` - Add member to project
- `PUT /api/project-members/:id` - Update project member
- `DELETE /api/project-members/:id` - Remove member from project
- `POST /api/project-members/:id/complete` - Mark member as completed
- `GET /api/project-members/:id/stats` - Get member statistics

## 🔒 Security Features

### Authentication
- **JWT tokens** với expiration time
- **Password hashing** với bcrypt (12 rounds)
- **Token validation** trên mọi protected route

### Authorization
- **Role-based access control** (RBAC)
- **Resource-level permissions** cho centers, projects, staff
- **Admin-only operations** cho sensitive data

### Data Validation
- **Input validation** với express-validator
- **SQL injection prevention** với parameterized queries
- **XSS protection** với helmet middleware

### CORS & Security Headers
- **CORS configuration** cho frontend integration
- **Security headers** với helmet
- **Rate limiting** (có thể thêm)

## 📝 API Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

### Pagination Response
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Authentication Test
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Use returned token for authenticated requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/centers
```

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set strong `JWT_SECRET`
4. Enable HTTPS
5. Configure reverse proxy (nginx)
6. Set up PM2 hoặc Docker

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📚 Additional Features

### Logging
- **Request logging** với morgan
- **Error logging** với console.error
- **Database query logging** (development mode)

### Performance
- **Connection pooling** cho MySQL
- **Response compression** với compression middleware
- **Efficient queries** với JOINs và indexing

### Monitoring
- **Health check endpoint** cho load balancers
- **Graceful shutdown** handling
- **Error tracking** và reporting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README
- **Issues**: Create GitHub issue
- **Questions**: Contact development team

---

**MS System Backend API** - Built with ❤️ using Node.js & Express.js 