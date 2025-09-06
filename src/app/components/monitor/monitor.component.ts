import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UnexpectedLog } from '../../models/user.model';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  pageSizeOptions = [5, 10, 20, 50, 100];
  isPaginationLoading = false;
  apiMessage = '';

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
    if (!this.user) return false;
    
    // Kiểm tra quyền cụ thể từ permissions array
    if (this.user.permissions && Array.isArray(this.user.permissions)) {
      return this.user.permissions.includes(permission);
    }
    
    // Kiểm tra role trực tiếp
    if (this.user.role === permission) {
      return true;
    }
    
    // Admin có tất cả quyền
    if (this.user.role === 'R_ADMIN') {
      return true;
    }
    
    return false;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Load danh sách log bất thường
  loadUnexpectedLogs(): void {
    this.isLoading = true;
    this.isPaginationLoading = true;
    this.authService.getUnexpectedLogs(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isPaginationLoading = false;
        if (response && response.status === 200) {
          // Hiển thị data trực tiếp từ API
          this.unexpectedLogs = response.listLog || [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || 0;
          this.hasData = this.unexpectedLogs.length > 0;
          
          console.log('Unexpected logs loaded:', this.unexpectedLogs.length, 'items');
          console.log('Total pages:', this.totalPages, 'Total elements:', this.totalElements);
          console.log('Message:', response.message);
          
          // Lưu message từ API
          this.apiMessage = response.message || '';
        } else if (response && response.status !== 200) {
          if (response.errorcode === '401') {
            this.toastService.error('Hết phiên đăng nhập');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.toastService.error(response.errordes || 'Lấy danh sách log bất thường không thành công');
          }
        } else {
          this.toastService.error('Lấy danh sách log bất thường không thành công');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.isPaginationLoading = false;
        this.toastService.error('Lấy danh sách log bất thường không thành công');
        console.error('Error loading unexpected logs:', error);
      }
    });
  }

  // Chuyển trang
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
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
    return log.exec_time > 500 && log.exe_count > 100;
  }

  // Lấy chỉ báo bất thường
  getWarningMessage(log: UnexpectedLog): string {
    if (this.isUnexpected(log)) {
      const warnings = [];
      if (log.exec_time > 500) {
        warnings.push('Thời gian thực thi cao');
      }
      if (log.exe_count > 100) {
        warnings.push('Số lần thực hiện nhiều');
      }
      return warnings.join(', ');
    }
    return '';
  }


  // Làm mới dữ liệu
  refreshData(): void {
    this.currentPage = 0;
    this.loadUnexpectedLogs();
  }

  // Thay đổi kích thước trang
  onPageSizeChange(newPageSize: number): void {
    if (newPageSize !== this.pageSize) {
      this.pageSize = newPageSize;
      this.currentPage = 0; // Reset về trang đầu
      this.loadUnexpectedLogs();
    }
  }

  // Xử lý thay đổi page size từ select
  onPageSizeSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);
    this.onPageSizeChange(newPageSize);
  }

  // Lấy thông tin hiển thị trang hiện tại
  getCurrentPageInfo(): string {
    const startItem = this.currentPage * this.pageSize + 1;
    const endItem = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    return `${startItem}-${endItem} của ${this.totalElements}`;
  }

  // Kiểm tra có thể chuyển trang trước không
  canGoPrevious(): boolean {
    return this.currentPage > 0;
  }

  // Kiểm tra có thể chuyển trang sau không
  canGoNext(): boolean {
    return this.currentPage < this.totalPages - 1;
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
