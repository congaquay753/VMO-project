// Fake data cho hệ thống quản lý

export const fakeCenters = [
  {
    id: 1,
    name: "Trung tâm Đào tạo Công nghệ Thông tin",
    field: "Công nghệ thông tin",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    createdAt: "01/01/2024 08:00:00",
    updatedAt: null
  },
  {
    id: 2,
    name: "Trung tâm Đào tạo Ngoại ngữ",
    field: "Ngoại ngữ",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    createdAt: "02/01/2024 09:00:00",
    updatedAt: null
  },
  {
    id: 3,
    name: "Trung tâm Đào tạo Kinh doanh",
    field: "Kinh doanh",
    address: "789 Đường DEF, Quận 7, TP.HCM",
    createdAt: "03/01/2024 10:00:00",
    updatedAt: null
  },
  {
    id: 4,
    name: "Trung tâm Đào tạo Thiết kế",
    field: "Thiết kế",
    address: "321 Đường GHI, Quận 2, TP.HCM",
    createdAt: "04/01/2024 11:00:00",
    updatedAt: null
  },
  {
    id: 5,
    name: "Trung tâm Đào tạo Marketing",
    field: "Marketing",
    address: "654 Đường JKL, Quận 5, TP.HCM",
    createdAt: "05/01/2024 12:00:00",
    updatedAt: null
  }
];

export const fakeProjects = [
  {
    id: 1,
    name: "Phát triển Website E-commerce",
    description: "Xây dựng website bán hàng trực tuyến với đầy đủ tính năng thanh toán, quản lý đơn hàng",
    centerId: 1,
    status: "Đang thực hiện",
    createdAt: "10/01/2024 08:00:00",
    updatedAt: null
  },
  {
    id: 2,
    name: "Ứng dụng Mobile Banking",
    description: "Phát triển ứng dụng ngân hàng di động với bảo mật cao",
    centerId: 1,
    status: "Hoàn thành",
    createdAt: "12/01/2024 09:00:00",
    updatedAt: null
  },
  {
    id: 3,
    name: "Khóa học Tiếng Anh Giao tiếp",
    description: "Chương trình đào tạo tiếng Anh giao tiếp cho người đi làm",
    centerId: 2,
    status: "Đang thực hiện",
    createdAt: "15/01/2024 10:00:00",
    updatedAt: null
  },
  {
    id: 4,
    name: "Khóa học Tiếng Nhật N5",
    description: "Đào tạo tiếng Nhật trình độ N5 cho người mới bắt đầu",
    centerId: 2,
    status: "Chưa bắt đầu",
    createdAt: "18/01/2024 11:00:00",
    updatedAt: null
  },
  {
    id: 5,
    name: "Chương trình Khởi nghiệp",
    description: "Đào tạo kỹ năng khởi nghiệp và quản lý doanh nghiệp nhỏ",
    centerId: 3,
    status: "Hoàn thành",
    createdAt: "20/01/2024 12:00:00",
    updatedAt: null
  },
  {
    id: 6,
    name: "Khóa học Quản lý Dự án",
    description: "Đào tạo kỹ năng quản lý dự án theo chuẩn PMP",
    centerId: 3,
    status: "Đang thực hiện",
    createdAt: "22/01/2024 13:00:00",
    updatedAt: null
  },
  {
    id: 7,
    name: "Thiết kế Logo và Brand Identity",
    description: "Thiết kế bộ nhận diện thương hiệu hoàn chỉnh cho doanh nghiệp",
    centerId: 4,
    status: "Hoàn thành",
    createdAt: "25/01/2024 14:00:00",
    updatedAt: null
  },
  {
    id: 8,
    name: "Khóa học UI/UX Design",
    description: "Đào tạo thiết kế giao diện người dùng và trải nghiệm người dùng",
    centerId: 4,
    status: "Tạm dừng",
    createdAt: "28/01/2024 15:00:00",
    updatedAt: null
  },
  {
    id: 9,
    name: "Chiến dịch Marketing Digital",
    description: "Thực hiện chiến dịch marketing số cho sản phẩm mới",
    centerId: 5,
    status: "Đang thực hiện",
    createdAt: "30/01/2024 16:00:00",
    updatedAt: null
  },
  {
    id: 10,
    name: "Khóa học Content Marketing",
    description: "Đào tạo kỹ năng viết nội dung marketing hiệu quả",
    centerId: 5,
    status: "Chưa bắt đầu",
    createdAt: "02/02/2024 17:00:00",
    updatedAt: null
  }
];

export const fakeFreshers = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    birthDate: "1995-03-15",
    gender: "Nam",
    phone: "0901234567",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    description: "Sinh viên mới tốt nghiệp ngành CNTT, có kiến thức về React và Node.js",
    centerId: 1,
    createdAt: "01/01/2024 08:00:00",
    updatedAt: null
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    birthDate: "1997-07-22",
    gender: "Nữ",
    phone: "0912345678",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    description: "Có kinh nghiệm 2 năm trong lĩnh vực phát triển web",
    centerId: 1,
    createdAt: "02/01/2024 09:00:00",
    updatedAt: null
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    birthDate: "1994-11-08",
    gender: "Nam",
    phone: "0923456789",
    address: "789 Đường DEF, Quận 7, TP.HCM",
    description: "Chuyên viên phát triển ứng dụng di động",
    centerId: 1,
    createdAt: "03/01/2024 10:00:00",
    updatedAt: null
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    birthDate: "1996-05-12",
    gender: "Nữ",
    phone: "0934567890",
    address: "321 Đường GHI, Quận 2, TP.HCM",
    description: "Giáo viên tiếng Anh có chứng chỉ TESOL",
    centerId: 2,
    createdAt: "04/01/2024 11:00:00",
    updatedAt: null
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    birthDate: "1993-09-25",
    gender: "Nam",
    phone: "0945678901",
    address: "654 Đường JKL, Quận 5, TP.HCM",
    description: "Có kinh nghiệm giảng dạy tiếng Nhật 3 năm",
    centerId: 2,
    createdAt: "05/01/2024 12:00:00",
    updatedAt: null
  },
  {
    id: 6,
    name: "Vũ Thị Phương",
    birthDate: "1998-01-18",
    gender: "Nữ",
    phone: "0956789012",
    address: "987 Đường MNO, Quận 10, TP.HCM",
    description: "Sinh viên năm cuối ngành Quản trị kinh doanh",
    centerId: 3,
    createdAt: "06/01/2024 13:00:00",
    updatedAt: null
  },
  {
    id: 7,
    name: "Đặng Văn Giang",
    birthDate: "1992-12-03",
    gender: "Nam",
    phone: "0967890123",
    address: "147 Đường PQR, Quận 11, TP.HCM",
    description: "Chuyên viên tư vấn kinh doanh với 5 năm kinh nghiệm",
    centerId: 3,
    createdAt: "07/01/2024 14:00:00",
    updatedAt: null
  },
  {
    id: 8,
    name: "Bùi Thị Hoa",
    birthDate: "1999-04-30",
    gender: "Nữ",
    phone: "0978901234",
    address: "258 Đường STU, Quận 4, TP.HCM",
    description: "Sinh viên ngành Thiết kế đồ họa, có năng khiếu nghệ thuật",
    centerId: 4,
    createdAt: "08/01/2024 15:00:00",
    updatedAt: null
  },
  {
    id: 9,
    name: "Ngô Văn Ích",
    birthDate: "1991-08-14",
    gender: "Nam",
    phone: "0989012345",
    address: "369 Đường VWX, Quận 6, TP.HCM",
    description: "Designer có 7 năm kinh nghiệm trong lĩnh vực quảng cáo",
    centerId: 4,
    createdAt: "09/01/2024 16:00:00",
    updatedAt: null
  },
  {
    id: 10,
    name: "Lý Thị Kim",
    birthDate: "1997-02-28",
    gender: "Nữ",
    phone: "0990123456",
    address: "741 Đường YZA, Quận 8, TP.HCM",
    description: "Chuyên viên marketing với kiến thức về digital marketing",
    centerId: 5,
    createdAt: "10/01/2024 17:00:00",
    updatedAt: null
  },
  {
    id: 11,
    name: "Hồ Văn Long",
    birthDate: "1994-06-17",
    gender: "Nam",
    phone: "0901122334",
    address: "852 Đường BCD, Quận 9, TP.HCM",
    description: "Có kinh nghiệm 4 năm trong lĩnh vực marketing online",
    centerId: 5,
    createdAt: "11/01/2024 18:00:00",
    updatedAt: null
  },
  {
    id: 12,
    name: "Đinh Thị Mai",
    birthDate: "1996-10-05",
    gender: "Nữ",
    phone: "0902233445",
    address: "963 Đường EFG, Quận 12, TP.HCM",
    description: "Sinh viên ngành Marketing, có đam mê với content creation",
    centerId: 5,
    createdAt: "12/01/2024 19:00:00",
    updatedAt: null
  },
  {
    id: 13,
    name: "Tô Văn Nam",
    birthDate: "1993-12-20",
    gender: "Nam",
    phone: "0903344556",
    address: "159 Đường HIJ, Quận Bình Tân, TP.HCM",
    description: "Lập trình viên full-stack với kiến thức về MERN stack",
    centerId: 1,
    createdAt: "13/01/2024 20:00:00",
    updatedAt: null
  },
  {
    id: 14,
    name: "Lưu Thị Oanh",
    birthDate: "1998-03-11",
    gender: "Nữ",
    phone: "0904455667",
    address: "357 Đường KLM, Quận Bình Thạnh, TP.HCM",
    description: "Sinh viên năm cuối ngành Ngôn ngữ Anh",
    centerId: 2,
    createdAt: "14/01/2024 21:00:00",
    updatedAt: null
  },
  {
    id: 15,
    name: "Trịnh Văn Phúc",
    birthDate: "1995-07-09",
    gender: "Nam",
    phone: "0905566778",
    address: "486 Đường NOP, Quận Gò Vấp, TP.HCM",
    description: "Chuyên viên phân tích kinh doanh với chứng chỉ CFA",
    centerId: 3,
    createdAt: "15/01/2024 22:00:00",
    updatedAt: null
  },
  {
    id: 16,
    name: "Châu Thị Quỳnh",
    birthDate: "1997-01-26",
    gender: "Nữ",
    phone: "0906677889",
    address: "753 Đường QRS, Quận Phú Nhuận, TP.HCM",
    description: "Designer chuyên về thiết kế UI/UX cho ứng dụng di động",
    centerId: 4,
    createdAt: "16/01/2024 23:00:00",
    updatedAt: null
  },
  {
    id: 17,
    name: "Võ Văn Rạng",
    birthDate: "1992-05-13",
    gender: "Nam",
    phone: "0907788990",
    address: "951 Đường TUV, Quận Tân Bình, TP.HCM",
    description: "Chuyên viên marketing với chuyên môn về SEO và SEM",
    centerId: 5,
    createdAt: "17/01/2024 00:00:00",
    updatedAt: null
  },
  {
    id: 18,
    name: "Hà Thị Sương",
    birthDate: "1999-09-07",
    gender: "Nữ",
    phone: "0908899001",
    address: "264 Đường WXY, Quận Tân Phú, TP.HCM",
    description: "Sinh viên ngành Truyền thông đa phương tiện",
    centerId: 5,
    createdAt: "18/01/2024 01:00:00",
    updatedAt: null
  },
  {
    id: 19,
    name: "Lâm Văn Tâm",
    birthDate: "1994-11-19",
    gender: "Nam",
    phone: "0909900112",
    address: "837 Đường ZAB, Quận Thủ Đức, TP.HCM",
    description: "Lập trình viên backend chuyên về Java và Spring Boot",
    centerId: 1,
    createdAt: "19/01/2024 02:00:00",
    updatedAt: null
  },
  {
    id: 20,
    name: "Kiều Thị Uyên",
    birthDate: "1996-08-02",
    gender: "Nữ",
    phone: "0900011223",
    address: "159 Đường CDE, Quận 1, TP.HCM",
    description: "Chuyên viên tư vấn giáo dục với kinh nghiệm 3 năm",
    centerId: 2,
    createdAt: "20/01/2024 03:00:00",
    updatedAt: null
  }
]; 