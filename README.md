# Ứng dụng Login - Angular

Đây là ứng dụng đăng nhập được xây dựng bằng Angular với backend API thực.

## Tính năng

- **Màn hình Login**: Form đăng nhập với username và password
- **Màn hình Home**: Hiển thị thông tin người dùng sau khi đăng nhập thành công
- **Real API Integration**: Kết nối với backend API tại localhost:8080
- **Responsive Design**: Giao diện thân thiện trên mọi thiết bị

## Cấu trúc dự án

```
src/app/
├── components/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.css
│   └── home/
│       ├── home.component.ts
│       ├── home.component.html
│       └── home.component.css
├── models/
│   └── user.model.ts
├── services/
│   └── auth.service.ts
├── app.routes.ts
├── app.ts
└── app.html
```

## Cách sử dụng

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:4200`

### 3. Đảm bảo backend đang chạy

Backend API phải đang chạy tại `http://localhost:8080` trước khi sử dụng ứng dụng.

## API Integration

### Login API
- **Endpoint**: `POST http://localhost:8080/user/login`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response Success** (status: 200):
  ```json
  {
    "status": 200,
    "errorCode": null,
    "errorDesc": null,
    "data": {
      "token": "jwt_token_here",
      "username": "admin",
      "name": "Admin User",
      "joinDate": "2023-01-15",
      "phoneNumber": "0123456789",
      "email": "admin@company.com",
      "role": "ADMIN"
    }
  }
  ```
- **Response Error** (status: 401):
  ```json
  {
    "status": 401,
    "errorCode": "INVALID_CREDENTIALS",
    "errorDesc": "Tên đăng nhập hoặc mật khẩu không đúng"
  }
  ```

## Công nghệ sử dụng

- **Angular 20**: Framework chính
- **TypeScript**: Ngôn ngữ lập trình
- **Angular Router**: Điều hướng giữa các trang
- **Angular Forms**: Xử lý form đăng nhập
- **Angular HttpClient**: Gọi API backend
- **CSS3**: Styling với gradient và responsive design

## Tính năng bảo mật

- Validation form phía client
- Kiểm tra authentication trước khi truy cập trang Home
- Tự động redirect về login nếu chưa đăng nhập
- Logout và xóa thông tin user khỏi session

## Mở rộng

Để cải thiện ứng dụng:

1. Thêm error handling chi tiết hơn cho network errors
2. Implement JWT token storage và refresh
3. Thêm loading states và progress indicators
4. Thêm các tính năng bảo mật khác (2FA, captcha, etc.)
5. Thêm remember me functionality
6. Implement auto-logout khi token hết hạn