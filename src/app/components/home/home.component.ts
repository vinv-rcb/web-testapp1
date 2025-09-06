import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    // Nếu chưa đăng nhập, chuyển về trang login
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  hasPermission(permission: string): boolean {
    if (!this.user) return false;
    
    // Admin có tất cả quyền
    if (this.user.role === 'admin') return true;
    
    // Kiểm tra quyền cụ thể
    if (this.user.permissions && Array.isArray(this.user.permissions)) {
      return this.user.permissions.includes(permission);
    }
    
    // Fallback: kiểm tra role-based permissions
    const rolePermissions: { [key: string]: string[] } = {
      'admin': ['R_ADMIN', 'R_LOGS_MANAGE', 'R_MONITOR', 'R_OPTI', 'R_TEAMLEAD'],
      'user': ['R_LOGS_MANAGE', 'R_TEAMLEAD'], // User mặc định có một số quyền
      'manager': ['R_LOGS_MANAGE', 'R_MONITOR', 'R_TEAMLEAD'],
      'dba': ['R_MONITOR', 'R_OPTI']
    };
    
    const userRole = this.user.role?.toLowerCase();
    return rolePermissions[userRole]?.includes(permission) || false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
