import { z } from 'zod'

// ============================================================================
// Auth Configuration Schemas
// ============================================================================

export const authLocalConfigSchema = z.object({
  usersFile: z.string().default('users.json'),
})

export const authSessionConfigSchema = z.object({
  secret: z.string().optional(),
  accessTokenExpiry: z.string().default('15m'),
  refreshTokenExpiry: z.string().default('7d'),
})

export const authConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.string().default('local'),
  local: authLocalConfigSchema.default({}),
  session: authSessionConfigSchema.default({}),
})

// ============================================================================
// Auth API Schemas
// ============================================================================

export const authLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  mustChangePassword: z.boolean(),
})

export const authLoginResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
})

export const authRefreshRequestSchema = z.object({
  refreshToken: z.string(),
})

export const authRefreshResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
})

export const authChangePasswordRequestSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
})

export const authCheckResponseSchema = z.object({
  authEnabled: z.boolean(),
})

// ============================================================================
// Type Exports
// ============================================================================

export type AuthConfig = z.infer<typeof authConfigSchema>
export type AuthLocalConfig = z.infer<typeof authLocalConfigSchema>
export type AuthSessionConfig = z.infer<typeof authSessionConfigSchema>
export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>
export type AuthLoginResponse = z.infer<typeof authLoginResponseSchema>
export type AuthRefreshRequest = z.infer<typeof authRefreshRequestSchema>
export type AuthRefreshResponse = z.infer<typeof authRefreshResponseSchema>
export type AuthChangePasswordRequest = z.infer<typeof authChangePasswordRequestSchema>
export type AuthUser = z.infer<typeof authUserSchema>
export type AuthCheckResponse = z.infer<typeof authCheckResponseSchema>
