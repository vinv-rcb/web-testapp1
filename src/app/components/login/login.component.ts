import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    if (!this.loginRequest.username || !this.loginRequest.password) {
      this.toastService.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200 && response.data) {
          // Login thành công, hiển thị thông báo và chuyển đến trang Home
          this.toastService.success('Đăng nhập thành công!');
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        } else {
          // Login thất bại, hiển thị lỗi
          const errorMsg = response.errorDesc || 'Đăng nhập thất bại';
          this.toastService.error(errorMsg);
        }
      },
      error: (error) => {
        this.isLoading = false;
        let errorMsg = 'Có lỗi xảy ra, vui lòng thử lại';
        
        // Xử lý các loại lỗi khác nhau
        if (error.status === 0) {
          errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (error.status === 401) {
          errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        } else if (error.status === 403) {
          errorMsg = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 404) {
          errorMsg = 'API không tồn tại. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 500) {
          errorMsg = 'Lỗi server. Vui lòng thử lại sau.';
        } else if (error.error?.errorDesc) {
          errorMsg = error.error.errorDesc;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.toastService.error(errorMsg);
        console.error('Login error:', error);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
