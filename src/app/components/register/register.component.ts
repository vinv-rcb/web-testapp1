import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
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
      this.toastService.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!this.isEmailValid()) {
      this.toastService.warning('Email không đúng định dạng');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200) {
          // Đăng ký thành công, hiển thị thông báo và chuyển đến trang đăng nhập
          this.toastService.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          // Đăng ký thất bại, hiển thị lỗi
          const errorMsg = response.errorDesc || 'Đăng ký thất bại';
          this.toastService.error(errorMsg);
        }
      },
      error: (error) => {
        this.isLoading = false;
        let errorMsg = 'Có lỗi xảy ra, vui lòng thử lại';
        
        // Xử lý các loại lỗi khác nhau
        if (error.status === 0) {
          errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (error.status === 400) {
          errorMsg = 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (error.status === 409) {
          errorMsg = 'Tên đăng nhập hoặc email đã tồn tại. Vui lòng chọn thông tin khác.';
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
        console.error('Register error:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
