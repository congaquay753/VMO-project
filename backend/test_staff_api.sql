-- Test script for Staff API
-- Chạy sau khi đã migration bảng staff

USE ms_system;

-- 1. Kiểm tra cấu trúc bảng staff
DESCRIBE staff;

-- 2. Kiểm tra dữ liệu mẫu
SELECT id, name, birth_date, gender, phone, center_id FROM staff LIMIT 5;

-- 3. Test các trường bắt buộc
-- Tạo staff mới với đầy đủ thông tin bắt buộc
INSERT INTO staff (name, gender, phone, address, center_id) VALUES 
('Test Staff 1', 'male', '0901234567', 'Test Address 1', 1);

-- 4. Test tạo staff thiếu trường bắt buộc (sẽ bị lỗi)
-- INSERT INTO staff (name, gender, phone, address, center_id) VALUES 
-- ('Test Staff 2', 'male', '', 'Test Address 2', 1);

-- 5. Test update staff
UPDATE staff SET 
  name = 'Test Staff 1 Updated',
  phone = '0901234568'
WHERE name = 'Test Staff 1';

-- 6. Kiểm tra kết quả update
SELECT * FROM staff WHERE name LIKE 'Test Staff 1%';

-- 7. Test search functionality
SELECT * FROM staff WHERE name LIKE '%Test%';

-- 8. Test sort functionality
SELECT id, name, birth_date, gender, phone, center_id 
FROM staff 
ORDER BY name ASC 
LIMIT 5;

-- 9. Test filter by center
SELECT id, name, gender, phone, center_id 
FROM staff 
WHERE center_id = 1;

-- 10. Test filter by gender
SELECT id, name, gender, phone, center_id 
FROM staff 
WHERE gender = 'male';

-- 11. Cleanup test data
DELETE FROM staff WHERE name LIKE 'Test Staff%';

-- 12. Kiểm tra dữ liệu cuối cùng
SELECT COUNT(*) as total_staff FROM staff;
SELECT id, name, birth_date, gender, phone, center_id FROM staff LIMIT 3; 