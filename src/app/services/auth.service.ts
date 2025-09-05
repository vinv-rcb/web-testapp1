import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080';
  private currentUser: any = null;

  constructor(private http: HttpClient) { }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/user/login`, loginRequest)
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
          }
        })
      );
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  logout(): void {
    this.currentUser = null;
  }
}
