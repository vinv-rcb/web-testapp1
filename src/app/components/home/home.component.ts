import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  user: any = null;
  private userSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      
      // If no user and not logged in, redirect to login
      if (!user && !this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
      }
    });

    // Check initial login state
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString === 'N/A') {
      return 'N/A';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  getTokenInfo(): string {
    const token = this.authService.getAccessToken();
    if (!token) return 'N/A';
    
    // Show first 20 characters of token for security
    return token.substring(0, 20) + '...';
  }
}
