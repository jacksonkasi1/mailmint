import { z } from 'zod'

// Login schema
export const loginBodySchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false)
})

// Signup schema
export const signupBodySchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50).trim().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50).trim().optional(),
  rememberMe: z.boolean().optional().default(false)
})

// Social auth schema
export const socialAuthBodySchema = z.object({
  provider: z.enum(['google', 'apple']),
  idToken: z.string().min(1, 'ID token is required'),
  isSignup: z.boolean().optional().default(false)
})

// Forgot password schema
export const forgotPasswordBodySchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim()
})

// Reset password schema
export const resetPasswordBodySchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
})

// Verify email schema
export const verifyEmailBodySchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

// Refresh token schema
export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

// Type exports
export type LoginBody = z.infer<typeof loginBodySchema>
export type SignupBody = z.infer<typeof signupBodySchema>
export type SocialAuthBody = z.infer<typeof socialAuthBodySchema>
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>
export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>