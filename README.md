# MS System - Hệ thống quản lý trung tâm, dự án và nhân viên

## 🚀 Tổng quan

MS System là một ứng dụng web full-stack hoàn chỉnh để quản lý trung tâm đào tạo, dự án và nhân viên. Hệ thống được xây dựng với kiến trúc hiện đại, giao diện đẹp mắt và tính năng bảo mật cao.

## ✨ Tính năng chính

### 🔐 Xác thực và phân quyền
- **Đăng nhập/Đăng xuất** với JWT token
- **Phân quyền theo vai trò** (Admin, Manager, Staff, Member)
- **Bảo mật mật khẩu** với bcrypt
- **Quản lý phiên đăng nhập** an toàn

### 🏢 Quản lý Trung tâm
- **CRUD hoàn chỉnh**: Thêm, sửa, xóa, xem danh sách trung tâm
- **Tìm kiếm và lọc** theo tên, lĩnh vực
- **Sắp xếp** theo nhiều tiêu chí
- **Phân trang** hiệu quả
- **Thống kê** số lượng dự án và nhân viên

### 📋 Quản lý Dự án
- **CRUD hoàn chỉnh** cho dự án
- **Liên kết với trung tâm** và nhân viên
- **Trạng thái dự án**: Lập kế hoạch, Đang thực hiện, Hoàn thành, Tạm dừng, Hủy bỏ
- **Tìm kiếm và lọc** theo tên, trung tâm, trạng thái
- **Quản lý thành viên dự án** với kiểm tra trùng lặp

### 👥 Quản lý Nhân viên
- **CRUD hoàn chỉnh** cho nhân viên
- **Thông tin chi tiết**: Tên, ngày sinh, giới tính, số điện thoại, địa chỉ
- **Liên kết với trung tâm** và dự án
- **Tìm kiếm và lọc** theo nhiều tiêu chí
- **Quản lý phân công dự án** với kiểm tra xung đột

### 📊 Dashboard và Báo cáo
- **Thống kê tổng quan**: Số lượng trung tâm, dự án, nhân viên
- **Biểu đồ tròn**: Phân bố nhân viên theo trung tâm
- **Biểu đồ cột**: Dự án theo trạng thái, nhân viên theo giới tính
- **Thống kê chi tiết** và báo cáo

## 🛠️ Công nghệ sử dụng

### Frontend
- **React.js 18** - Framework UI hiện đại
- **Vite 4.5.0** - Build tool nhanh
- **Chart.js** - Thư viện biểu đồ
- **CSS3** - Styling với Flexbox, Grid, Animations
- **Responsive Design** - Tương thích mọi thiết bị

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database quan hệ
- **JWT** - Xác thực và phân quyền
- **bcryptjs** - Mã hóa mật khẩu
- **express-validator** - Validation dữ liệu
- **Helmet** - Bảo mật HTTP headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - Logging HTTP requests
- **Compression** - Nén response

### Database
- **MySQL 8.0+** - Database chính
- **Connection Pooling** - Quản lý kết nối hiệu quả
- **Foreign Keys** - Đảm bảo tính toàn vẹn dữ liệu
- **Indexes** - Tối ưu hiệu suất truy vấn
- **Views** - Tổng hợp dữ liệu

## 📁 Cấu trúc dự án

```
do_an/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── Header.jsx           # Header component
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── Footer.jsx           # Footer component
│   │   ├── Login.jsx            # Login form
│   │   ├── Dashboard.jsx        # Dashboard page
│   │   ├── CenterCard.jsx       # Center display card
│   │   ├── ProjectCard.jsx      # Project display card
│   │   ├── FresherCard.jsx      # Staff display card
│   │   ├── CenterForm.jsx       # Center form
│   │   ├── ProjectForm.jsx      # Project form
│   │   └── FresherForm.jsx      # Staff form
│   ├── pages/                   # Page components
│   │   ├── CentersPage.jsx      # Centers management page
│   │   ├── ProjectsPage.jsx     # Projects management page
│   │   └── FreshersPage.jsx     # Staff management page
│   ├── services/                # API services
│   │   ├── api.js               # API configuration
│   │   ├── authService.js       # Authentication service
│   │   ├── centerService.js     # Centers API service
│   │   ├── projectService.js    # Projects API service
│   │   ├── staffService.js      # Staff API service
│   │   └── dashboardService.js  # Dashboard API service
│   ├── data/                    # Mock data (deprecated)
│   ├── App.jsx                  # Main application component
│   ├── App.css                  # Main stylesheet
│   ├── index.css                # Global styles
│   └── index.html               # HTML template
├── backend/                     # Backend source code
│   ├── config/                  # Configuration files
│   │   └── database.js          # Database configuration
│   ├── middleware/              # Express middleware
│   │   └── auth.js              # Authentication middleware
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── centers.js           # Centers API routes
│   │   ├── projects.js          # Projects API routes
│   │   ├── staff.js             # Staff API routes
│   │   ├── users.js             # Users API routes
│   │   ├── roles.js             # Roles API routes
│   │   └── projectMembers.js    # Project members API routes
│   ├── package.json             # Backend dependencies
│   ├── server.js                # Main server file
│   ├── database.sql             # Database schema
│   ├── env.example              # Environment variables template
│   ├── README.md                # Backend documentation
│   └── API_USAGE.md             # API usage guide
├── package.json                 # Frontend dependencies
├── vite.config.js               # Vite configuration
└── README.md                    # Project documentation
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- **Node.js**: v18.0.0 trở lên
- **MySQL**: v8.0 trở lên
- **npm** hoặc **yarn**

### 1. Clone dự án
```bash
git clone <repository-url>
cd do_an
```

### 2. Cài đặt Frontend
```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 3. Cài đặt Backend
```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp env.example .env

# Chỉnh sửa file .env với thông tin database của bạn
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=ms_system
# JWT_SECRET=your_secret_key

# Khởi động server
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

### 4. Thiết lập Database
```bash
# Đăng nhập vào MySQL
mysql -u root -p

# Chạy script tạo database
source backend/database.sql
```

Hoặc sử dụng MySQL Workbench để import file `database.sql`

## 🔑 Tài khoản mặc định

Sau khi chạy `database.sql`, hệ thống sẽ có sẵn:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/change-password` - Đổi mật khẩu

### Centers
- `GET /api/centers` - Lấy danh sách trung tâm
- `GET /api/centers/:id` - Lấy thông tin trung tâm
- `POST /api/centers` - Tạo trung tâm mới
- `PUT /api/centers/:id` - Cập nhật trung tâm
- `DELETE /api/centers/:id` - Xóa trung tâm
- `GET /api/centers/:id/stats` - Thống kê trung tâm

### Projects
- `GET /api/projects` - Lấy danh sách dự án
- `GET /api/projects/:id` - Lấy thông tin dự án
- `POST /api/projects` - Tạo dự án mới
- `PUT /api/projects/:id` - Cập nhật dự án
- `DELETE /api/projects/:id` - Xóa dự án
- `GET /api/projects/:id/stats` - Thống kê dự án

### Staff
- `GET /api/staff` - Lấy danh sách nhân viên
- `GET /api/staff/:id` - Lấy thông tin nhân viên
- `POST /api/staff` - Tạo nhân viên mới
- `PUT /api/staff/:id` - Cập nhật nhân viên
- `DELETE /api/staff/:id` - Xóa nhân viên
- `GET /api/staff/:id/stats` - Thống kê nhân viên

### Project Members
- `GET /api/project-members` - Lấy danh sách thành viên dự án
- `POST /api/project-members` - Thêm thành viên vào dự án
- `PUT /api/project-members/:id` - Cập nhật thông tin thành viên
- `DELETE /api/project-members/:id` - Xóa thành viên khỏi dự án
- `POST /api/project-members/:id/complete` - Hoàn thành nhiệm vụ

## 🔒 Bảo mật

- **JWT Authentication** - Xác thực token
- **Role-based Access Control** - Phân quyền theo vai trò
- **Password Hashing** - Mã hóa mật khẩu với bcrypt
- **Input Validation** - Kiểm tra dữ liệu đầu vào
- **SQL Injection Prevention** - Sử dụng parameterized queries
- **CORS Protection** - Bảo vệ cross-origin requests
- **Security Headers** - HTTP security headers với Helmet

## 📱 Responsive Design

Ứng dụng được thiết kế responsive và tương thích với:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🎨 Giao diện

- **Modern UI/UX** với thiết kế clean và intuitive
- **Glass Morphism** effect với backdrop-filter
- **Gradient Colors** và smooth animations
- **Dark/Light Theme** support
- **Interactive Charts** với Chart.js
- **Loading States** và error handling

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
cd backend
npm test
```

## 📦 Build và Deploy

### Frontend Build
```bash
npm run build
```

### Backend Production
```bash
cd backend
npm start
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Hỗ trợ

- **Email**: support@mssystem.com
- **Documentation**: Xem file `backend/API_USAGE.md` để biết chi tiết sử dụng API
- **Issues**: Tạo issue trên GitHub repository

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Frontend React.js hoàn chỉnh
- ✅ Backend Node.js + Express API
- ✅ Database MySQL với schema đầy đủ
- ✅ Authentication và Authorization
- ✅ CRUD operations cho tất cả entities
- ✅ Dashboard với biểu đồ và thống kê
- ✅ Responsive design
- ✅ API documentation

---

**MS System** - Hệ thống quản lý hiện đại và chuyên nghiệp! 🚀
