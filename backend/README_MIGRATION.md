# Migration Guide for Staff Table

## Vấn đề
API get list staff đang bị lỗi 500 do cấu trúc database không khớp với code.

## Nguyên nhân
- Bảng `staff` thiếu trường `name` và `birth_date`
- Frontend đang cố gắng truy cập các trường này
- API validation không phù hợp với cấu trúc database

## Giải pháp

### 1. Chạy Migration Script
```bash
# Kết nối vào MySQL
mysql -u your_username -p

# Chạy migration script
source migrate_staff_table.sql;
```

### 2. Hoặc chạy từng lệnh SQL
```sql
USE ms_system;

-- Thêm trường name
ALTER TABLE staff ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Unknown' AFTER user_id;

-- Thêm trường birth_date
ALTER TABLE staff ADD COLUMN IF NOT EXISTS birth_date DATE NULL AFTER name;

-- Cập nhật dữ liệu mẫu
UPDATE staff SET 
  name = CASE id
    WHEN 1 THEN 'Nguyễn Văn A'
    WHEN 2 THEN 'Trần Thị B'
    WHEN 3 THEN 'Lê Văn C'
    WHEN 4 THEN 'Phạm Thị D'
    WHEN 5 THEN 'Hoàng Văn E'
    WHEN 6 THEN 'Nguyễn Thị F'
    WHEN 7 THEN 'Trần Văn G'
    WHEN 8 THEN 'Lê Thị H'
    WHEN 9 THEN 'Phạm Văn I'
    WHEN 10 THEN 'Hoàng Thị K'
    ELSE CONCAT('Staff ', id)
  END,
  birth_date = CASE id
    WHEN 1 THEN '1990-01-01'
    WHEN 2 THEN '1995-02-15'
    WHEN 3 THEN '1992-03-20'
    WHEN 4 THEN '1998-04-25'
    WHEN 5 THEN '1991-05-30'
    WHEN 6 THEN '1993-06-05'
    WHEN 7 THEN '1994-07-10'
    WHEN 8 THEN '1996-08-15'
    WHEN 9 THEN '1997-09-20'
    WHEN 10 THEN '1999-10-25'
    ELSE '1990-01-01'
  END
WHERE id <= 10;
```

### 3. Kiểm tra kết quả
```sql
-- Xem cấu trúc bảng
DESCRIBE staff;

-- Xem dữ liệu mẫu
SELECT id, name, birth_date, gender, phone, center_id FROM staff LIMIT 5;
```

## Thay đổi đã thực hiện

### Backend
- ✅ Cập nhật validation rules
- ✅ Sửa API get list staff
- ✅ Sửa API create/update staff
- ✅ Thêm trường name và birth_date vào queries

### Frontend
- ✅ FresherForm đã có trường name và birth_date
- ✅ FresherCard đã hiển thị trường name và birth_date
- ✅ Validation đã được cập nhật

## Sau khi migration
1. Restart backend server
2. Kiểm tra API `/api/staff` hoạt động bình thường
3. Frontend sẽ hiển thị đầy đủ thông tin nhân viên

## Lưu ý
- Migration script sẽ không làm mất dữ liệu hiện có
- Các trường mới sẽ được thêm với giá trị mặc định
- Dữ liệu mẫu sẽ được cập nhật với tên và ngày sinh hợp lý 