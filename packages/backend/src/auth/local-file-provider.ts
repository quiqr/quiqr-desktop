/**
 * Local File Auth Provider
 *
 * Manages users in a JSON file with bcrypt-hashed passwords.
 * The users file lives in the config directory, not the sites directory.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import type { AuthProvider, AuthUser, AuthResult } from './types.js';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface UsersFile {
  users: StoredUser[];
  meta: { version: number };
}

const BCRYPT_ROUNDS = 10;

export class LocalFileAuthProvider implements AuthProvider {
  private filePath: string;

  constructor(configDir: string, usersFile: string = 'users.json') {
    this.filePath = join(configDir, usersFile);
  }

  private readUsersFile(): UsersFile {
    if (!existsSync(this.filePath)) {
      return { users: [], meta: { version: 1 } };
    }
    const content = readFileSync(this.filePath, 'utf-8');
    return JSON.parse(content);
  }

  private writeUsersFile(data: UsersFile): void {
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async authenticate(credentials: { email: string; password: string }): Promise<AuthResult> {
    const data = this.readUsersFile();
    const user = data.users.find(u => u.email === credentials.email);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Update last login time
    user.lastLoginAt = new Date().toISOString();
    this.writeUsersFile(data);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const data = this.readUsersFile();
    const user = data.users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid current password');
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.mustChangePassword = false;
    this.writeUsersFile(data);
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const data = this.readUsersFile();
    const user = data.users.find(u => u.id === userId);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async needsPasswordChange(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.mustChangePassword ?? false;
  }

  async createUser(email: string, password: string, mustChangePassword: boolean = true): Promise<AuthUser> {
    const data = this.readUsersFile();

    if (data.users.some(u => u.email === email)) {
      throw new Error(`User with email '${email}' already exists`);
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const storedUser: StoredUser = {
      id,
      email,
      passwordHash,
      mustChangePassword,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    data.users.push(storedUser);
    this.writeUsersFile(data);

    return { id, email, mustChangePassword };
  }

  async removeUser(email: string): Promise<void> {
    const data = this.readUsersFile();
    const index = data.users.findIndex(u => u.email === email);

    if (index === -1) {
      throw new Error(`User with email '${email}' not found`);
    }

    data.users.splice(index, 1);
    this.writeUsersFile(data);
  }

  async listUsers(): Promise<AuthUser[]> {
    const data = this.readUsersFile();
    return data.users.map(u => ({
      id: u.id,
      email: u.email,
      mustChangePassword: u.mustChangePassword,
    }));
  }

  /**
   * Reset a user's password (for CLI admin use).
   * Sets mustChangePassword to true.
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const data = this.readUsersFile();
    const user = data.users.find(u => u.email === email);

    if (!user) {
      throw new Error(`User with email '${email}' not found`);
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.mustChangePassword = true;
    this.writeUsersFile(data);
  }

  /**
   * Check if the users file exists (for first-run detection).
   */
  usersFileExists(): boolean {
    return existsSync(this.filePath);
  }
}
