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
    
    // Admin có tất cả quyền (kiểm tra cả 'ADMIN' và 'R_ADMIN')
    if (this.user.role === 'ADMIN' || this.user.role === 'R_ADMIN') {
      return true;
    }
    
    // Kiểm tra role trực tiếp
    if (this.user.role === permission) {
      return true;
    }
    
    // Kiểm tra quyền cụ thể từ permissions array
    if (this.user.permissions && Array.isArray(this.user.permissions)) {
      return this.user.permissions.includes(permission);
    }
    
    // Mapping role-based permissions
    const rolePermissions: { [key: string]: string[] } = {
      'R_LOGS_MANAGE': ['R_LOGS_MANAGE'],
      'R_MONITOR': ['R_MONITOR'],
      'R_OPTI': ['R_OPTI'],
      'R_TEAMLEAD': ['R_TEAMLEAD']
    };
    
    const userRole = this.user.role;
    return rolePermissions[userRole]?.includes(permission) || false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Quản trị viên',
      'R_ADMIN': 'Quản trị viên',
      'R_LOGS_MANAGE': 'Quản lý Log',
      'R_MONITOR': 'Giám sát Database',
      'R_OPTI': 'Tối ưu Database',
      'R_TEAMLEAD': 'Báo cáo'
    };
    
    return roleNames[role] || role;
  }
}
