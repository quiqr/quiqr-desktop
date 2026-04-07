/**
 * Auth Provider Interface
 *
 * Abstracts credential validation to support multiple auth backends.
 * Phase 1: local file provider only.
 * Future: OIDC, LDAP, SAML providers implement the same interface.
 */

export interface AuthUser {
  id: string;
  email: string;
  mustChangePassword: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface AuthProvider {
  authenticate(credentials: { email: string; password: string }): Promise<AuthResult>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  getUserById(userId: string): Promise<AuthUser | null>;
  needsPasswordChange(userId: string): Promise<boolean>;
  createUser(email: string, password: string, mustChangePassword?: boolean): Promise<AuthUser>;
  removeUser(email: string): Promise<void>;
  listUsers(): Promise<AuthUser[]>;
}
