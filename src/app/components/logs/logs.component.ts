import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    // Kiểm tra quyền logs management
    if (!this.user || !this.hasPermission('R_LOGS_MANAGE')) {
      this.router.navigate(['/home']);
    }
  }

  hasPermission(permission: string): boolean {
    // Logic kiểm tra quyền - có thể mở rộng dựa trên cấu trúc dữ liệu user
    return this.user && (this.user.role === 'admin' || this.user.permissions?.includes(permission));
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
