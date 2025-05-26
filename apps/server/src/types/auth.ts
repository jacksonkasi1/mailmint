// Auth-related type definitions
export interface AuthUser {
    uid: string
    email?: string
    emailVerified?: boolean
    name?: string
    picture?: string
    createdAt?: string
    lastLoginAt?: string
  }
  
  export interface LoginRequest {
    email: string
    password: string
    rememberMe?: boolean
  }
  
  export interface SignupRequest {
    email: string
    password: string
    firstName?: string
    lastName?: string
    rememberMe?: boolean
  }
  
  export interface AuthResponse {
    success: boolean
    message: string
    data?: {
      user: AuthUser
      token?: string
    }
    error?: string
    timestamp: string
  }
  
  export interface SocialAuthRequest {
    provider: 'google' | 'apple'
    idToken: string
    isSignup?: boolean
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string
  }
  
  export interface ForgotPasswordRequest {
    email: string
  }
  
  export interface ResetPasswordRequest {
    token: string
    newPassword: string
  }
  
  export interface VerifyEmailRequest {
    token: string
  }