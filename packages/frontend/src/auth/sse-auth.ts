/**
 * SSE Auth Helper
 *
 * Appends JWT token to SSE URLs as a query parameter,
 * since EventSource cannot send custom headers.
 */

import { getAccessToken } from './token-storage';

export function withAuthToken(url: string): string {
  const token = getAccessToken();
  if (!token) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}
