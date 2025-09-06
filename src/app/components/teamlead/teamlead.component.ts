import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-teamlead',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teamlead.component.html',
  styleUrls: ['./teamlead.component.css']
})
export class TeamleadComponent implements OnInit {
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (!this.user || !this.hasPermission('R_TEAMLEAD')) {
      this.router.navigate(['/home']);
    }
  }

  hasPermission(permission: string): boolean {
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
