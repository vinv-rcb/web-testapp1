import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private oauthService: OAuthService) {
    this.initializeOAuth();
  }

  private initializeOAuth(): void {
    // Configure OAuth service
    this.oauthService.configure({
      issuer: 'http://localhost:8080',
      clientId: 'angular-client',
      redirectUri: window.location.origin + '/home',
      scope: 'openid profile email',
      responseType: 'code',
      useSilentRefresh: true,
      silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
      timeoutFactor: 0.25,
      sessionChecksEnabled: true,
      clearHashAfterLogin: true,
      skipSubjectCheck: true
    });

    // Load discovery document
    this.oauthService.loadDiscoveryDocument().then(() => {
      // Try to login automatically if user is already authenticated
      this.oauthService.tryLogin().then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          this.loadUserProfile();
        }
      });
    });

    // Listen for token events
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        this.loadUserProfile();
      } else if (event.type === 'logout') {
        this.userSubject.next(null);
      }
    });
  }

  private loadUserProfile(): void {
    this.oauthService.loadUserProfile().then((profile: any) => {
      const userInfo = {
        token: this.oauthService.getAccessToken(),
        username: profile.preferred_username || profile.sub,
        ten: profile.name || profile.given_name + ' ' + profile.family_name,
        ngayVao: profile.created_at || new Date().toISOString().split('T')[0],
        soDienThoai: profile.phone_number || 'N/A',
        email: profile.email,
        role: this.getRoleFromClaims(profile)
      };
      this.userSubject.next(userInfo);
    });
  }

  private getRoleFromClaims(profile: any): string {
    // Extract role from claims - adjust based on your OAuth2 provider
    if (profile.groups && profile.groups.includes('admin')) {
      return 'admin';
    }
    if (profile.roles && profile.roles.includes('ADMIN')) {
      return 'admin';
    }
    return 'user';
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    this.oauthService.logOut();
    this.userSubject.next(null);
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  getRefreshToken(): string {
    return this.oauthService.getRefreshToken();
  }

  refreshToken(): Promise<boolean> {
    return this.oauthService.refreshToken().then(() => {
      return this.oauthService.hasValidAccessToken();
    });
  }
}
