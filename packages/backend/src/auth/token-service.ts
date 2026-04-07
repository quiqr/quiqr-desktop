/**
 * JWT Token Service
 *
 * Handles token issuance, verification, and blacklisting.
 * Uses short-lived access tokens + longer-lived refresh tokens.
 */

import jwt, { type SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export class TokenService {
  private secret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;
  private blacklist: Map<string, number> = new Map(); // token -> expiry timestamp

  constructor(secret: string, accessTokenExpiry: string = '15m', refreshTokenExpiry: string = '7d') {
    this.secret = secret;
    this.accessTokenExpiry = accessTokenExpiry;
    this.refreshTokenExpiry = refreshTokenExpiry;

    // Clean up expired blacklist entries every 5 minutes
    setInterval(() => this.cleanupBlacklist(), 5 * 60 * 1000).unref();
  }

  issueAccessToken(userId: string, email: string): string {
    const payload: TokenPayload = { userId, email, type: 'access' };
    return jwt.sign(payload, this.secret, { expiresIn: this.accessTokenExpiry } as SignOptions);
  }

  issueRefreshToken(userId: string, email: string): string {
    const payload: TokenPayload = { userId, email, type: 'refresh' };
    return jwt.sign(payload, this.secret, { expiresIn: this.refreshTokenExpiry } as SignOptions);
  }

  verifyToken(token: string, expectedType: 'access' | 'refresh' = 'access'): TokenPayload {
    if (this.blacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    const decoded = jwt.verify(token, this.secret) as TokenPayload & { exp: number };

    if (decoded.type !== expectedType) {
      throw new Error(`Expected ${expectedType} token, got ${decoded.type}`);
    }

    return decoded;
  }

  blacklistToken(token: string): void {
    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (decoded?.exp) {
        this.blacklist.set(token, decoded.exp * 1000); // Convert to ms
      }
    } catch {
      // If we can't decode it, no need to blacklist
    }
  }

  private cleanupBlacklist(): void {
    const now = Date.now();
    for (const [token, expiry] of this.blacklist) {
      if (expiry < now) {
        this.blacklist.delete(token);
      }
    }
  }
}
