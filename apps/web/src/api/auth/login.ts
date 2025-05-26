import axiosInstance from '@/config/axios'
import type { LoginRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, ApiError } from './types'

/**
 * Authenticate user login
 * @param loginData - User login credentials
 * @returns Promise<AuthResponse> - Login response
 */
export const loginUser = async (loginData: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', loginData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: 'Network error occurred during login',
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}

/**
 * Send password reset email
 * @param forgotPasswordData - Email for password reset
 * @returns Promise<AuthResponse> - Forgot password response
 */
export const forgotPassword = async (forgotPasswordData: ForgotPasswordRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/forgot-password', forgotPasswordData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: 'Network error occurred while sending reset email',
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}

/**
 * Reset user password with token
 * @param resetPasswordData - Password reset data with token
 * @returns Promise<AuthResponse> - Reset password response
 */
export const resetPassword = async (resetPasswordData: ResetPasswordRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/reset-password', resetPasswordData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: 'Network error occurred during password reset',
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}

/**
 * Logout user session
 * @returns Promise<AuthResponse> - Logout response
 */
export const logoutUser = async (): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/logout')
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: 'Network error occurred during logout',
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}