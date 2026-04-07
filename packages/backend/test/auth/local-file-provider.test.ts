/**
 * Tests for LocalFileAuthProvider
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { LocalFileAuthProvider } from '../../src/auth/local-file-provider';

describe('LocalFileAuthProvider', () => {
  let configDir: string;
  let provider: LocalFileAuthProvider;

  beforeEach(() => {
    configDir = mkdtempSync(join(tmpdir(), 'quiqr-test-auth-'));
    provider = new LocalFileAuthProvider(configDir);
  });

  afterEach(() => {
    rmSync(configDir, { recursive: true, force: true });
  });

  describe('createUser', () => {
    it('creates a user with hashed password', async () => {
      const user = await provider.createUser('test@example.com', 'password123');
      expect(user.email).toBe('test@example.com');
      expect(user.id).toBeDefined();
      expect(user.mustChangePassword).toBe(true);
    });

    it('throws if email already exists', async () => {
      await provider.createUser('test@example.com', 'password123');
      await expect(provider.createUser('test@example.com', 'other')).rejects.toThrow('already exists');
    });
  });

  describe('authenticate', () => {
    it('succeeds with correct credentials', async () => {
      await provider.createUser('test@example.com', 'password123', false);
      const result = await provider.authenticate({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('test@example.com');
    });

    it('fails with wrong password', async () => {
      await provider.createUser('test@example.com', 'password123', false);
      const result = await provider.authenticate({ email: 'test@example.com', password: 'wrong' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('fails with unknown email', async () => {
      const result = await provider.authenticate({ email: 'unknown@example.com', password: 'password123' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('changePassword', () => {
    it('changes password and clears mustChangePassword', async () => {
      const user = await provider.createUser('test@example.com', 'old-password', true);
      expect(await provider.needsPasswordChange(user.id)).toBe(true);

      await provider.changePassword(user.id, 'old-password', 'new-password');
      expect(await provider.needsPasswordChange(user.id)).toBe(false);

      // Old password should no longer work
      const result1 = await provider.authenticate({ email: 'test@example.com', password: 'old-password' });
      expect(result1.success).toBe(false);

      // New password should work
      const result2 = await provider.authenticate({ email: 'test@example.com', password: 'new-password' });
      expect(result2.success).toBe(true);
    });

    it('throws with wrong current password', async () => {
      const user = await provider.createUser('test@example.com', 'password', false);
      await expect(provider.changePassword(user.id, 'wrong', 'new')).rejects.toThrow('Invalid current password');
    });
  });

  describe('removeUser', () => {
    it('removes a user', async () => {
      await provider.createUser('test@example.com', 'password');
      await provider.removeUser('test@example.com');
      const users = await provider.listUsers();
      expect(users).toHaveLength(0);
    });

    it('throws for unknown email', async () => {
      await expect(provider.removeUser('unknown@example.com')).rejects.toThrow('not found');
    });
  });

  describe('listUsers', () => {
    it('lists all users without password hashes', async () => {
      await provider.createUser('a@example.com', 'pass1');
      await provider.createUser('b@example.com', 'pass2');
      const users = await provider.listUsers();
      expect(users).toHaveLength(2);
      expect(users[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('needsPasswordChange', () => {
    it('returns true for new user with flag', async () => {
      const user = await provider.createUser('test@example.com', 'pass', true);
      expect(await provider.needsPasswordChange(user.id)).toBe(true);
    });

    it('returns false for user without flag', async () => {
      const user = await provider.createUser('test@example.com', 'pass', false);
      expect(await provider.needsPasswordChange(user.id)).toBe(false);
    });
  });

  describe('usersFileExists', () => {
    it('returns false when no users file', () => {
      expect(provider.usersFileExists()).toBe(false);
    });

    it('returns true after creating a user', async () => {
      await provider.createUser('test@example.com', 'pass');
      expect(provider.usersFileExists()).toBe(true);
    });
  });
});
