import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Database, DatabaseLog } from '../../models/user.model';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  user: any = null;
  databaseList: Database[] = [];
  logList: DatabaseLog[] = [];
  selectedDatabase: string = 'Tất cả';
  isLoading = false;
  isLoadingLogs = false;
  
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
    
    // Kiểm tra quyền logs management
    if (!this.user || !this.hasPermission('R_LOGS_MANAGE')) {
      this.router.navigate(['/home']);
      return;
    }

    // Đảm bảo tất cả các biến được khởi tạo đúng cách
    this.initializeVariables();

    // Load dữ liệu khi khởi tạo
    this.loadDatabaseList();
    this.loadLogList();
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

  // Khởi tạo các biến để tránh lỗi NgFor
  initializeVariables(): void {
    this.databaseList = this.databaseList || [];
    this.logList = this.logList || [];
    this.pageSizeOptions = this.pageSizeOptions || [5, 10, 20, 50, 100];
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Load danh sách database
  loadDatabaseList(): void {
    this.isLoading = true;
    this.authService.getDatabaseList().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.status === 200) {
          // Đảm bảo response.data là array
          const data = response.data || [];
          this.databaseList = Array.isArray(data) ? data : [];
          // Thêm option "Tất cả" vào đầu danh sách
          this.databaseList.unshift({ database_name: 'Tất cả', database_desc: 'Tất cả database' });
        } else if (response && response.status !== 200) {
          if (response.errorCode === '401') {
            this.toastService.error('Hết phiên đăng nhập');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.toastService.error(response.errorDesc || 'Có lỗi xảy ra khi tải danh sách database');
          }
        } else {
          this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        console.error('Error loading database list:', error);
      }
    });
  }

  // Load danh sách log
  loadLogList(): void {
    this.isLoadingLogs = true;
    this.isPaginationLoading = true;
    const database = this.selectedDatabase === 'Tất cả' ? undefined : this.selectedDatabase;
    
    console.log('Loading logs for database:', database, 'page:', this.currentPage, 'size:', this.pageSize);
    
    // Thử API với phân trang trước
    this.authService.getLogList(database, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Log list response (paginated):', response);
        this.isLoadingLogs = false;
        this.isPaginationLoading = false;
        
        if (response && response.status === 200) {
          // Đảm bảo response.listLog là array
          const data = response.listLog || [];
          this.logList = Array.isArray(data) ? data : [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || this.logList.length;
          
          console.log('Logs loaded:', this.logList.length, 'items');
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
          } else if (response.errorcode === '404') {
            this.logList = [];
            this.totalPages = 0;
            this.totalElements = 0;
            this.toastService.warning('Không tìm thấy log trên database');
          } else {
            this.toastService.error(response.errordes || 'Có lỗi xảy ra khi tải danh sách log');
          }
        } else {
          this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        }
      },
      error: (error) => {
        console.error('Error loading log list (paginated):', error);
        // Fallback to simple API
        this.loadLogListSimple(database);
      }
    });
  }

  // Fallback method - load logs without pagination
  loadLogListSimple(database?: string): void {
    console.log('Fallback: Loading logs without pagination for database:', database);
    
    this.authService.getLogListSimple(database).subscribe({
      next: (response) => {
        console.log('Log list response (simple):', response);
        this.isLoadingLogs = false;
        this.isPaginationLoading = false;
        
        if (response && response.status === 200) {
          // Đảm bảo response.listLog là array
          const data = response.listLog || [];
          this.logList = Array.isArray(data) ? data : [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || this.logList.length;
          
          console.log('Logs loaded (simple):', this.logList.length, 'items');
          console.log('Message:', response.message);
          
          // Lưu message từ API
          this.apiMessage = response.message || '';
        } else if (response && response.status !== 200) {
          if (response.errorcode === '401') {
            this.toastService.error('Hết phiên đăng nhập');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (response.errorcode === '404') {
            this.logList = [];
            this.totalPages = 0;
            this.totalElements = 0;
            this.toastService.warning('Không tìm thấy log trên database');
          } else {
            this.toastService.error(response.errordes || 'Có lỗi xảy ra khi tải danh sách log');
          }
        } else {
          this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        }
      },
      error: (error) => {
        console.error('Error loading log list (simple):', error);
        this.isLoadingLogs = false;
        this.isPaginationLoading = false;
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    });
  }

  // Xử lý khi thay đổi database
  onDatabaseChange(): void {
    this.currentPage = 0; // Reset về trang đầu khi thay đổi database
    this.loadLogList();
  }

  // Chuyển trang
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadLogList();
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
      this.loadLogList();
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
    this.loadLogList();
  }

  // Test API trực tiếp
  testAPI(): void {
    console.log('Testing API...');
    const database = this.selectedDatabase === 'Tất cả' ? undefined : this.selectedDatabase;
    
    // Test simple API first
    this.authService.getLogListSimple(database).subscribe({
      next: (response) => {
        console.log('Test API response:', response);
        this.toastService.success('API test successful - check console for details');
      },
      error: (error) => {
        console.error('Test API error:', error);
        this.toastService.error('API test failed - check console for details');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
