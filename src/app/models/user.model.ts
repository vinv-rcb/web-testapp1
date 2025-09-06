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

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  data?: {
    username: string;
    email: string;
    message: string;
  };
}

// Interface cho user trong danh sách admin
export interface AdminUser {
  username: string;
  phone: string;
  email: string;
  role: string | null;
  status: string;
}

// Interface cho response API list users
export interface ListUsersResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  listUser: AdminUser[];
}

// Interface cho request update user
export interface UpdateUserRequest {
  username: string;
  role: string;
  status: string;
}

// Interface cho response API update user
export interface UpdateUserResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
}

// Interface cho role options
export interface RoleOption {
  code: string;
  name: string;
}

// Interface cho status options
export interface StatusOption {
  code: string;
  name: string;
}

// Interface cho Database
export interface Database {
  database_name: string;
  database_desc: string;
}

// Interface cho DatabaseLog
export interface DatabaseLog {
  database_name: string;
  sql: string;
  exec_time: number;
  exe_count: number;
}

// Interface cho response API database list
export interface DatabaseListResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  data: Database[];
}

// Interface cho response API log list
export interface LogListResponse {
  status: number;
  errorcode?: string | null;
  errordes?: string | null;
  totalPages?: number;
  totalElements?: number;
  listLog: DatabaseLog[];
  message?: string;
}

// Interface cho UnexpectedLog
export interface UnexpectedLog {
  database_name: string;
  sql: string;
  exec_time: number;
  exe_count: number;
}

// Interface cho response API unexpected logs
export interface UnexpectedLogsResponse {
  status: number;
  errorcode?: string | null;
  errordes?: string | null;
  totalPages?: number;
  totalElements?: number;
  listLog: UnexpectedLog[];
  message?: string;
}

// Interface cho Database Suggestion
export interface DatabaseSuggestion {
  id: string;
  database_name: string;
  sql: string;
  suggestion: string;
  is_resolved: boolean;
}

// Interface cho response API suggestions
export interface SuggestionsResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  data: DatabaseSuggestion[];
}

// Interface cho request mark suggestion as done
export interface MarkDoneRequest {
  id: string;
}

// Interface cho response API mark suggestion as done
export interface MarkDoneResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
}

// Interface cho Log Hint
export interface LogHint {
  database_name: string;
  sql: string;
  suggestion: string;
  is_resolved: boolean;
}

// Interface cho response API log hint
export interface LogHintResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  totalPages?: number;
  totalElements?: number;
  listLog: LogHint[];
}

// Interface cho response API create report
export interface CreateReportResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  total?: number;
  totalUnexpected?: number;
  totalHint?: number;
}

// Interface cho request export report
export interface ExportReportRequest {
  type: 'CSV' | 'PDF';
}

// Interface cho response API export report
export interface ExportReportResponse {
  status: number;
  errorCode?: string | null;
  errorDesc?: string | null;
  data?: any; // byte array
}
