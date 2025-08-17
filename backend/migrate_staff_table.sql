-- Migration script to update staff table
-- Add missing fields: name and birth_date

USE ms_system;

-- Add name column if it doesn't exist
ALTER TABLE staff ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Unknown' AFTER user_id;

-- Add birth_date column if it doesn't exist
ALTER TABLE staff ADD COLUMN IF NOT EXISTS birth_date DATE NULL AFTER name;

-- Update existing staff records with sample names and birth dates
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

-- Show the updated table structure
DESCRIBE staff;

-- Show sample data
SELECT id, name, birth_date, gender, phone, center_id FROM staff LIMIT 5; 