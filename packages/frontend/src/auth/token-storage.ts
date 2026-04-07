/**
 * Token Storage
 *
 * Manages JWT tokens in localStorage.
 */

const ACCESS_TOKEN_KEY = 'quiqr_token';
const REFRESH_TOKEN_KEY = 'quiqr_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}
