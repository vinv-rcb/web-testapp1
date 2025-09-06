import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  // OAuth2/OIDC Provider URL
  issuer: 'http://localhost:8080', // Thay đổi theo OAuth2 provider của bạn

  // Client ID - cần được cấu hình trong OAuth2 provider
  clientId: 'angular-client',

  // Redirect URI sau khi login thành công
  redirectUri: window.location.origin + '/home',

  // Scopes cần thiết
  scope: 'openid profile email',

  // Response type
  responseType: 'code',

  // Use PKCE (Proof Key for Code Exchange) for security
  useSilentRefresh: true,

  // Silent refresh URL
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',

  // Timeout for silent refresh
  timeoutFactor: 0.25,

  // Session timeout
  sessionChecksEnabled: true,

  // Clear session after logout
  clearHashAfterLogin: true,

  // Custom parameters
  customQueryParams: {
    // Thêm custom parameters nếu cần
  },
  // Skip subject check (chỉ dùng trong development)
  skipSubjectCheck: true
};
