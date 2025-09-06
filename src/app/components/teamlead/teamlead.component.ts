import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LogHint, CreateReportResponse } from '../../models/user.model';

@Component({
  selector: 'app-teamlead',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teamlead.component.html',
  styleUrls: ['./teamlead.component.css']
})
export class TeamleadComponent implements OnInit {
  user: any = null;
  logHints: LogHint[] = [];
  isLoading = false;
  isLoadingHints = false;
  showReportSummary = false;
  reportSummary: CreateReportResponse | null = null;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  isPaginationLoading = false;
  apiMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (!this.user || !this.hasPermission('R_TEAMLEAD')) {
      this.router.navigate(['/home']);
      return;
    }

    // Đảm bảo tất cả các biến được khởi tạo đúng cách
    this.initializeVariables();

    // Load dữ liệu khi khởi tạo
    this.loadLogHints();
  }

  hasPermission(permission: string): boolean {
    if (!this.user) return false;
    
    // Admin có tất cả quyền
    if (this.user.role === 'R_ADMIN') {
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
    
    return false;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Khởi tạo các biến để tránh lỗi NgFor
  initializeVariables(): void {
    this.logHints = this.logHints || [];
    this.pageSizeOptions = this.pageSizeOptions || [5, 10, 20, 50, 100];
  }

  // Load danh sách log hints
  loadLogHints(): void {
    this.isLoadingHints = true;
    this.isPaginationLoading = true;
    
    console.log('Loading log hints for page:', this.currentPage, 'size:', this.pageSize);
    
    this.authService.getLogHints(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Log hints response:', response);
        this.isLoadingHints = false;
        this.isPaginationLoading = false;
        
        if (response && response.status === 200) {
          // Đảm bảo response.listLog là array
          const data = response.listLog || [];
          this.logHints = Array.isArray(data) ? data : [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || this.logHints.length;
          
          console.log('Log hints loaded:', this.logHints.length, 'items');
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
            this.toastService.error(response.errordes || 'Lấy danh sách log bất thường và gợi ý không thành công');
          }
        } else {
          this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        }
      },
      error: (error) => {
        console.error('Error loading log hints:', error);
        this.isLoadingHints = false;
        this.isPaginationLoading = false;
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    });
  }

  // Tạo báo cáo tổng hợp
  createReport(): void {
    this.isLoading = true;
    
    this.authService.createReport().subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response && response.status === 200) {
          this.reportSummary = response;
          this.showReportSummary = true;
          this.toastService.success('Tạo báo cáo tổng hợp thành công');
        } else {
          this.toastService.error(response.errorDesc || 'Tổng hợp báo cáo không thành công');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        console.error('Error creating report:', error);
      }
    });
  }

  // Xuất báo cáo CSV
  exportCSV(): void {
    this.exportReport('CSV');
  }

  // Xuất báo cáo PDF
  exportPDF(): void {
    this.exportReport('PDF');
  }

  // Xuất báo cáo
  exportReport(type: 'CSV' | 'PDF'): void {
    this.isLoading = true;
    
    this.authService.exportReport({ type }).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response && response.status === 200) {
          this.downloadFile(response.data, `BaoCaoTongHop_${Date.now()}.${type.toLowerCase()}`);
          this.toastService.success(`Xuất báo cáo ${type} thành công`);
        } else {
          this.toastService.error(response.errorDesc || 'Xuất báo cáo không thành công');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        console.error('Error exporting report:', error);
      }
    });
  }

  // Download file
  downloadFile(data: any, filename: string): void {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Chuyển trang
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadLogHints();
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

  // Thay đổi kích thước trang
  onPageSizeChange(newPageSize: number): void {
    if (newPageSize !== this.pageSize) {
      this.pageSize = newPageSize;
      this.currentPage = 0; // Reset về trang đầu
      this.loadLogHints();
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
    
    // Đảm bảo totalPages là số hợp lệ
    if (!this.totalPages || this.totalPages <= 0) {
      return pages;
    }
    
    const maxVisiblePages = 5;
    const startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Làm mới dữ liệu
  refreshData(): void {
    this.currentPage = 0;
    this.showReportSummary = false;
    this.reportSummary = null;
    this.loadLogHints();
  }

  // Quay lại danh sách log
  backToLogList(): void {
    this.showReportSummary = false;
    this.reportSummary = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
