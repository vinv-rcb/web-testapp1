import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Database, DatabaseSuggestion } from '../../models/user.model';

@Component({
  selector: 'app-opti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './opti.component.html',
  styleUrls: ['./opti.component.css']
})
export class OptiComponent implements OnInit {
  user: any = null;
  databaseList: Database[] = [];
  suggestions: DatabaseSuggestion[] = [];
  selectedDatabase: string = 'Tất cả';
  isLoading = false;
  isLoadingSuggestions = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (!this.user || !this.hasPermission('R_OPTI')) {
      this.router.navigate(['/home']);
      return;
    }

    // Load dữ liệu khi khởi tạo
    this.loadDatabaseList();
    this.loadSuggestions();
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

  // Load danh sách suggestions
  loadSuggestions(): void {
    this.isLoadingSuggestions = true;
    const database = this.selectedDatabase === 'Tất cả' ? undefined : this.selectedDatabase;
    
    this.authService.getSuggestions(database).subscribe({
      next: (response) => {
        this.isLoadingSuggestions = false;
        if (response && response.status === 200) {
          this.suggestions = response.data || [];
        } else if (response && response.status !== 200) {
          if (response.errorCode === '401') {
            this.toastService.error('Hết phiên đăng nhập');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else if (response.errorCode === '404') {
            this.suggestions = [];
            this.toastService.warning('Không có gợi ý nào');
          } else {
            this.toastService.error(response.errorDesc || 'Có lỗi xảy ra khi tải danh sách gợi ý');
          }
        } else {
          this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        }
      },
      error: (error) => {
        this.isLoadingSuggestions = false;
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        console.error('Error loading suggestions:', error);
      }
    });
  }

  // Xử lý khi thay đổi database
  onDatabaseChange(): void {
    this.loadSuggestions();
  }

  // Đánh dấu suggestion đã hoàn thành
  markAsDone(suggestion: DatabaseSuggestion): void {
    this.authService.markSuggestionDone({ id: suggestion.id }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.toastService.success('Đã đánh dấu hoàn thành thành công');
          // Reload lại danh sách suggestions
          this.loadSuggestions();
        } else {
          this.toastService.error(response.errorDesc || 'Có lỗi xảy ra khi đánh dấu hoàn thành');
        }
      },
      error: (error) => {
        this.toastService.error('Có lỗi xảy ra, vui lòng thử lại');
        console.error('Error marking suggestion as done:', error);
      }
    });
  }

  // Làm mới dữ liệu
  refreshData(): void {
    this.loadSuggestions();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
