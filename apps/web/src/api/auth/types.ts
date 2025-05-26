// Authentication API types and interfaces
export interface SignupRequest {
    email: string
    password: string
    firstName?: string
    lastName?: string
    rememberMe?: boolean
  }
  
  export interface LoginRequest {
    email: string
    password: string
    rememberMe?: boolean
  }
  
  export interface AuthResponse {
    success: boolean
    message: string
    data?: {
      user: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        createdAt: string
        updatedAt: string
      }
      token?: string
    }
    error?: string
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
  
  export interface SocialAuthRequest {
    provider: 'google' | 'apple'
    idToken: string
    isSignup?: boolean
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string
  }
  
  export interface ApiError {
    success: false
    message: string
    error: string
    statusCode: number
  }