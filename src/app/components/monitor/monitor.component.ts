import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UnexpectedLog } from '../../models/user.model';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit {
  user: any = null;
  unexpectedLogs: UnexpectedLog[] = [];
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  hasData = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (!this.user || !this.hasPermission('R_MONITOR')) {
      this.router.navigate(['/home']);
      return;
    }

    // Load dữ liệu khi khởi tạo
    this.loadUnexpectedLogs();
  }

  hasPermission(permission: string): boolean {
    return this.user && (this.user.role === 'admin' || this.user.permissions?.includes(permission));
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Load danh sách log bất thường
  loadUnexpectedLogs(): void {
    this.isLoading = true;
    this.authService.getUnexpectedLogs(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.status === 200) {
          this.unexpectedLogs = response.listLog || [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || 0;
          this.hasData = this.unexpectedLogs.length > 0;
        } else if (response && response.status !== 200) {
          if (response.errorCode === '401') {
            this.toastService.error('Hết phiên đăng nhập');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.toastService.error(response.errorDesc || 'Lấy danh sách log bất thường không thành công');
          }
        } else {
          this.toastService.error('Lấy danh sách log bất thường không thành công');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Lấy danh sách log bất thường không thành công');
        console.error('Error loading unexpected logs:', error);
      }
    });
  }

  // Chuyển trang
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUnexpectedLogs();
    }
  }

  // Trang trước
  previousPage(): void {
    if (this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Trang sau
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Kiểm tra log có bất thường không
  isUnexpected(log: UnexpectedLog): boolean {
    return log.exe_time > 500 && log.exe_count > 100;
  }

  // Lấy chỉ báo bất thường
  getWarningMessage(log: UnexpectedLog): string {
    if (this.isUnexpected(log)) {
      const warnings = [];
      if (log.exe_time > 500) {
        warnings.push('Thời gian thực thi cao');
      }
      if (log.exe_count > 100) {
        warnings.push('Số lần thực hiện nhiều');
      }
      return warnings.join(', ');
    }
    return '';
  }

  // Format thời gian xử lý
  formatExecutionTime(time: number): string {
    if (time < 1000) {
      return `${time}ms`;
    } else if (time < 60000) {
      return `${(time / 1000).toFixed(2)}s`;
    } else {
      return `${(time / 60000).toFixed(2)}m`;
    }
  }

  // Làm mới dữ liệu
  refreshData(): void {
    this.currentPage = 0;
    this.loadUnexpectedLogs();
  }

  // Lấy danh sách số trang để hiển thị
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
