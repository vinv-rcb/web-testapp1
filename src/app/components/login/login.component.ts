import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginRequest: LoginRequest = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.loginRequest.username || !this.loginRequest.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200 && response.data) {
          // Login thành công, chuyển đến trang Home
          this.router.navigate(['/home']);
        } else {
          // Login thất bại, hiển thị lỗi
          this.errorMessage = response.errorDesc || 'Đăng nhập thất bại';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Có lỗi xảy ra, vui lòng thử lại';
        console.error('Login error:', error);
      }
    });
  }
}
