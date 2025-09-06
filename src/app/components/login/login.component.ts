import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    // Subscribe to user changes
    this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  loginWithOAuth(): void {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.authService.login();
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Có lỗi xảy ra khi đăng nhập, vui lòng thử lại';
      console.error('OAuth login error:', error);
    }
  }
}
