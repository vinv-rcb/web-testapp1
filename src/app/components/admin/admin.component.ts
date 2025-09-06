import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AdminUser, RoleOption, StatusOption, UpdateUserRequest } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  user: any = null;
  usersList: AdminUser[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Role options
  roleOptions: RoleOption[] = [
    { code: "R_LOGS_MANAGE", name: "Quản lý log database" },
    { code: "R_MONITOR", name: "Giám sát log database" },
    { code: "R_TEAMLEAD", name: "Trưởng nhóm" },
    { code: "R_OPTI", name: "Đơn vị tối ưu hoá" }
  ];

  // Status options
  statusOptions: StatusOption[] = [
    { code: "ACTIVE", name: "ACTIVE" },
    { code: "PENDING", name: "PENDING" },
    { code: "INACTIVE", name: "INACTIVE" }
  ];

  // Selected values for each user
  selectedRoles: { [username: string]: string } = {};
  selectedStatuses: { [username: string]: string } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    // Kiểm tra quyền admin
    if (!this.user || this.user.role !== 'admin') {
      this.router.navigate(['/home']);
      return;
    }

    this.loadUsersList();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadUsersList(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.getUsersList().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200) {
          this.usersList = response.listUser || [];
          this.initializeSelectedValues();
        } else {
          this.errorMessage = response.errorDesc || 'Lấy danh sách user không thành công';
          this.toastService.error(this.errorMessage);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Có lỗi xảy ra khi tải danh sách user';
        this.toastService.error(this.errorMessage);
        console.error('Load users error:', error);
      }
    });
  }

  initializeSelectedValues(): void {
    this.usersList.forEach(user => {
      // Nếu role = null thì hiển thị "Chọn role", ngược lại hiển thị role hiện tại
      this.selectedRoles[user.username] = user.role || '';
      this.selectedStatuses[user.username] = user.status || 'ACTIVE';
    });
  }

  updateUser(user: AdminUser): void {
    const selectedRole = this.selectedRoles[user.username];
    const selectedStatus = this.selectedStatuses[user.username];

    if (!selectedRole || !selectedStatus) {
      this.toastService.warning('Vui lòng chọn đầy đủ role và status');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateRequest: UpdateUserRequest = {
      username: user.username,
      role: selectedRole,
      status: selectedStatus
    };

    this.authService.updateUser(updateRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 200) {
          this.toastService.success(`Cập nhật thành công cho user ${user.username}`);
          // Cập nhật lại danh sách
          this.loadUsersList();
        } else {
          this.toastService.error(response.errorDesc || 'Cập nhật lỗi');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Cập nhật lỗi');
        console.error('Update user error:', error);
      }
    });
  }

  getRoleDisplayName(role: string | null): string {
    if (!role) return 'Chọn role';
    const roleOption = this.roleOptions.find(r => r.code === role);
    return roleOption ? roleOption.name : role;
  }

  getStatusDisplayName(status: string): string {
    const statusOption = this.statusOptions.find(s => s.code === status);
    return statusOption ? statusOption.name : status;
  }
}
