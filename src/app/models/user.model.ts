export interface User {
  title: string;
  phongBan: string;
  username: string;
  password: string;
  ten: string;
  ngayVao: string;
  soDienThoai: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  data?: {
    token: string;
    username: string;
    name: string;
    joinDate: string;
    phoneNumber: string;
    email: string;
    role: string;
  };
}
