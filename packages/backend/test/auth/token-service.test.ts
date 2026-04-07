/**
 * Tests for TokenService
 */

import { describe, it, expect } from 'vitest';
import { TokenService } from '../../src/auth/token-service';

describe('TokenService', () => {
  const secret = 'test-secret-key-for-testing';

  describe('issueAccessToken / verifyToken', () => {
    it('issues and verifies an access token', () => {
      const service = new TokenService(secret, '1h', '7d');
      const token = service.issueAccessToken('user-1', 'test@example.com');
      const payload = service.verifyToken(token, 'access');
      expect(payload.userId).toBe('user-1');
      expect(payload.email).toBe('test@example.com');
      expect(payload.type).toBe('access');
    });

    it('rejects refresh token when access expected', () => {
      const service = new TokenService(secret, '1h', '7d');
      const token = service.issueRefreshToken('user-1', 'test@example.com');
      expect(() => service.verifyToken(token, 'access')).toThrow('Expected access token');
    });
  });

  describe('issueRefreshToken', () => {
    it('issues and verifies a refresh token', () => {
      const service = new TokenService(secret, '1h', '7d');
      const token = service.issueRefreshToken('user-1', 'test@example.com');
      const payload = service.verifyToken(token, 'refresh');
      expect(payload.userId).toBe('user-1');
      expect(payload.type).toBe('refresh');
    });
  });

  describe('blacklistToken', () => {
    it('rejects blacklisted tokens', () => {
      const service = new TokenService(secret, '1h', '7d');
      const token = service.issueAccessToken('user-1', 'test@example.com');

      // Token should work before blacklisting
      expect(() => service.verifyToken(token, 'access')).not.toThrow();

      service.blacklistToken(token);

      // Token should be rejected after blacklisting
      expect(() => service.verifyToken(token, 'access')).toThrow('Token has been revoked');
    });
  });

  describe('expired tokens', () => {
    it('rejects expired tokens', () => {
      // Issue token with 0 seconds expiry
      const service = new TokenService(secret, '0s', '7d');
      const token = service.issueAccessToken('user-1', 'test@example.com');
      expect(() => service.verifyToken(token, 'access')).toThrow();
    });
  });
});
