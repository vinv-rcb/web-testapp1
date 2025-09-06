import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerRequest: RegisterRequest = {
    username: '',
    password: '',
    email: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Kiểm tra xem form có hợp lệ không
  isFormValid(): boolean {
    return !!(this.registerRequest.username && 
              this.registerRequest.password && 
              this.registerRequest.email);
  }

  // Kiểm tra email có đúng format không
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.registerRequest.email);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    if (!this.isEmailValid()) {
      this.errorMessage = 'Email không đúng định dạng';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200) {
          // Đăng ký thành công, chuyển đến trang đăng nhập
          this.successMessage = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          // Đăng ký thất bại, hiển thị lỗi
          this.errorMessage = response.errorDesc || 'Đăng ký thất bại';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Có lỗi xảy ra, vui lòng thử lại';
        console.error('Register error:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
