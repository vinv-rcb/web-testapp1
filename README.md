# Ứng dụng OAuth2 Login - Angular

Đây là ứng dụng đăng nhập OAuth2/OpenID Connect được xây dựng bằng Angular.

## Tính năng

- **OAuth2/OpenID Connect**: Đăng nhập bảo mật với OAuth2 flow
- **Màn hình Login**: Giao diện đăng nhập OAuth2 với redirect flow
- **Màn hình Home**: Hiển thị thông tin người dùng từ OAuth2 provider
- **Token Management**: Quản lý access token và refresh token tự động
- **Route Guards**: Bảo vệ routes với OAuth2 authentication
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
├── config/
│   └── oauth.config.ts
├── guards/
│   └── oauth.guard.ts
├── models/
│   └── user.model.ts
├── services/
│   └── auth.service.ts
├── app.routes.ts
├── app.config.ts
├── app.ts
└── app.html
src/
└── silent-refresh.html
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

### 3. Cấu hình OAuth2 Provider

Đảm bảo OAuth2/OpenID Connect provider đang chạy tại `http://localhost:8080` với cấu hình:

- **Issuer**: `http://localhost:8080`
- **Client ID**: `angular-client`
- **Redirect URI**: `http://localhost:4200/home`
- **Scopes**: `openid profile email`
- **Response Type**: `code`

### 4. Cấu hình OAuth2 Provider

OAuth2 provider cần hỗ trợ:
- **Authorization Code Flow** với PKCE
- **OpenID Connect Discovery** endpoint
- **UserInfo** endpoint để lấy thông tin user
- **Token** endpoint để exchange code lấy token

## OAuth2 Flow

### 1. Authorization Request
```
GET http://localhost:8080/oauth/authorize?
  client_id=angular-client&
  redirect_uri=http://localhost:4200/home&
  response_type=code&
  scope=openid profile email&
  state=random_state&
  code_challenge=code_challenge&
  code_challenge_method=S256
```

### 2. Token Exchange
```
POST http://localhost:8080/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=authorization_code&
redirect_uri=http://localhost:4200/home&
client_id=angular-client&
code_verifier=code_verifier
```

### 3. User Info
```
GET http://localhost:8080/oauth/userinfo
Authorization: Bearer access_token
```

## Công nghệ sử dụng

- **Angular 20**: Framework chính
- **TypeScript**: Ngôn ngữ lập trình
- **Angular Router**: Điều hướng giữa các trang
- **Angular OAuth2 OIDC**: OAuth2/OpenID Connect integration
- **Angular Guards**: Route protection
- **RxJS**: Reactive programming cho state management
- **CSS3**: Styling với gradient và responsive design

## Tính năng bảo mật

- **OAuth2/OpenID Connect**: Chuẩn bảo mật industry-standard
- **PKCE (Proof Key for Code Exchange)**: Bảo vệ authorization code
- **Access Token Management**: Tự động refresh token khi cần
- **Route Guards**: Bảo vệ routes với OAuth2 authentication
- **Silent Refresh**: Tự động refresh token trong background
- **Secure Token Storage**: Tokens được lưu trữ an toàn
- **Logout**: Xóa toàn bộ tokens và session

## Mở rộng

Để cải thiện ứng dụng:

1. **Multiple OAuth2 Providers**: Hỗ trợ Google, Microsoft, GitHub, etc.
2. **Role-based Access Control**: Phân quyền dựa trên OAuth2 claims
3. **Token Refresh Strategy**: Cải thiện logic refresh token
4. **Error Handling**: Xử lý lỗi OAuth2 chi tiết hơn
5. **Session Management**: Quản lý session timeout và auto-logout
6. **Audit Logging**: Ghi log các hoạt động authentication
7. **Multi-factor Authentication**: Tích hợp MFA với OAuth2
8. **Custom Claims**: Xử lý custom claims từ OAuth2 provider