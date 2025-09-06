import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ListUsersResponse, UpdateUserRequest, UpdateUserResponse, DatabaseListResponse, LogListResponse, UnexpectedLogsResponse, DatabaseSuggestion, SuggestionsResponse, MarkDoneRequest, MarkDoneResponse, LogHint, LogHintResponse, CreateReportResponse, ExportReportRequest, ExportReportResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://172.20.10.13:8080';
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    // Load user data from localStorage on service initialization
    this.loadUserFromStorage();
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/sqlanalys/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response.status === 200 && response.data) {
            // Store current user data
            this.currentUser = {
              token: response.data.token,
              username: response.data.username,
              ten: response.data.name,
              ngayVao: response.data.joinDate,
              soDienThoai: response.data.phoneNumber,
              email: response.data.email,
              role: response.data.role.toLowerCase()
            };
            // Save to localStorage
            this.saveUserToStorage();
          }
        }),
        tap({
          error: (error) => {
            console.error('Login API error:', error);
            // Clear any existing user data on error
            this.currentUser = null;
            this.clearStorage();
          }
        })
      );
  }

  getCurrentUser(): any {
    // If current user is not loaded, try to load from localStorage
    if (!this.currentUser) {
      this.loadUserFromStorage();
    }
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    // Check current user first
    if (this.currentUser !== null) {
      return true;
    }
    
    // Fallback to localStorage check
    const token = localStorage.getItem('auth_token');
    return token !== null && token !== '';
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/sqlanalys/register`, registerRequest);
  }

  // API 4: Lấy danh sách user
  getUsersList(): Observable<ListUsersResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    return this.http.get<ListUsersResponse>(`${this.API_URL}/sqlanalys/admin/list-user`, { headers });
  }

  // API 5: Cập nhật user (role và status)
  updateUser(updateRequest: UpdateUserRequest): Observable<UpdateUserResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    return this.http.post<UpdateUserResponse>(`${this.API_URL}/sqlanalys/admin/update`, updateRequest, { headers });
  }

  getAccessToken(): string {
    // First try to get from current user
    if (this.currentUser?.token) {
      return this.currentUser.token;
    }
    
    // Fallback to localStorage
    const token = localStorage.getItem('auth_token');
    return token || '';
  }

  // Save user data to localStorage
  private saveUserToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));
      localStorage.setItem('auth_token', this.currentUser.token);
    }
  }

  // Load user data from localStorage
  private loadUserFromStorage(): void {
    try {
      const userData = localStorage.getItem('current_user');
      const token = localStorage.getItem('auth_token');
      
      if (userData && token) {
        this.currentUser = JSON.parse(userData);
        // Ensure token is up to date
        this.currentUser.token = token;
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      this.clearStorage();
    }
  }

  // Clear localStorage
  private clearStorage(): void {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  }

  // API: Lấy danh sách database
  getDatabaseList(): Observable<DatabaseListResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    return this.http.get<DatabaseListResponse>(`${this.API_URL}/sqlanalys/database`, { headers });
  }

  // API: Lấy danh sách log theo database với phân trang
  getLogList(database?: string, page: number = 0, size: number = 10): Observable<LogListResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    let url = `${this.API_URL}/sqlanalys/log`;
    const params = new URLSearchParams();
    
    if (database && database !== 'Tất cả') {
      params.append('database', database);
    }
    
    // Thêm tham số phân trang
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log('API URL:', url);
    return this.http.get<LogListResponse>(url, { headers });
  }

  // API: Lấy danh sách log theo database (không phân trang) - fallback
  getLogListSimple(database?: string): Observable<LogListResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    let url = `${this.API_URL}/sqlanalys/log`;
    if (database && database !== 'Tất cả') {
      url += `?database=${encodeURIComponent(database)}`;
    }
    
    console.log('API URL (simple):', url);
    return this.http.get<LogListResponse>(url, { headers });
  }

  // API: Lấy danh sách log bất thường
  getUnexpectedLogs(page: number = 0, size: number = 10): Observable<UnexpectedLogsResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    const url = `${this.API_URL}/sqlanalys/query-unexpected?page=${page}&size=${size}`;
    return this.http.get<UnexpectedLogsResponse>(url, { headers });
  }

  // API: Lấy danh sách suggestions theo database
  getSuggestions(database?: string): Observable<SuggestionsResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    let url = `${this.API_URL}/sqlanalys/suggestion`;
    if (database && database !== 'Tất cả') {
      url += `?database=${encodeURIComponent(database)}`;
    }
    
    return this.http.get<SuggestionsResponse>(url, { headers });
  }

  // API: Đánh dấu suggestion đã hoàn thành
  markSuggestionDone(request: MarkDoneRequest): Observable<MarkDoneResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    return this.http.post<MarkDoneResponse>(`${this.API_URL}/sqlanalys/suggestion/done`, request, { headers });
  }

  // API: Lấy danh sách log hint với phân trang
  getLogHints(page: number = 0, size: number = 10): Observable<LogHintResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    const url = `${this.API_URL}/sqlanalys/log-hint?page=${page}&size=${size}`;
    return this.http.get<LogHintResponse>(url, { headers });
  }

  // API: Tạo báo cáo tổng hợp
  createReport(): Observable<CreateReportResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    return this.http.get<CreateReportResponse>(`${this.API_URL}/sqlanalys/create-report`, { headers });
  }

  // API: Xuất báo cáo (CSV hoặc PDF)
  exportReport(request: ExportReportRequest): Observable<ExportReportResponse> {
    const headers = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };
    
    return this.http.post<ExportReportResponse>(`${this.API_URL}/sqlanalys/report`, request, { 
      headers,
      responseType: 'blob' as 'json' // Để xử lý file download
    });
  }

  logout(): void {
    this.currentUser = null;
    this.clearStorage();
  }
}
