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

    // Load dữ liệu khi khởi tạo
    this.loadDatabaseList();
    this.loadLogList();
  }

  hasPermission(permission: string): boolean {
    // Logic kiểm tra quyền - có thể mở rộng dựa trên cấu trúc dữ liệu user
    return this.user && (this.user.role === 'admin' || this.user.permissions?.includes(permission));
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
          this.databaseList = response.data || [];
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
    const database = this.selectedDatabase === 'Tất cả' ? undefined : this.selectedDatabase;
    
    this.authService.getLogList(database).subscribe({
      next: (response) => {
        this.isLoadingLogs = false;
        if (response && response.status === 200) {
          // Hiển thị data trực tiếp từ API
          this.logList = response.data || [];
        } else if (response && response.status !== 200) {
          if (response.errorCode === '401') {
            this.toastService.error('Hết phiên đăng nhập');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (response.errorCode === '404') {
            this.logList = [];
            this.toastService.warning('Không tìm thấy log trên database');
          } else {
            this.toastService.error(response.errorDesc || 'Có lỗi xảy ra khi tải danh sách log');
          }
        } else {
          this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        }
      },
      error: (error) => {
        this.isLoadingLogs = false;
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        console.error('Error loading log list:', error);
      }
    });
  }

  // Xử lý khi thay đổi database
  onDatabaseChange(): void {
    this.loadLogList();
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
