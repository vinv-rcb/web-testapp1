import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class OAuthGuard implements CanActivate {
  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.oauthService.hasValidAccessToken()) {
      return true;
    } else {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']);
      return false;
    }
  }
}
