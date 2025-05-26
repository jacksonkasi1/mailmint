import axiosInstance from '@/config/axios'
import type { SignupRequest, AuthResponse, ApiError } from './types'

/**
 * Register a new user account
 * @param signupData - User registration data
 * @returns Promise<AuthResponse> - Registration response
 */
export const signupUser = async (signupData: SignupRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/signup', signupData)
    return response.data
  } catch (error: any) {
    // Handle different types of errors
    if (error instanceof Error && 'response' in error && error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: 'Network error occurred during signup',
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}

/**
 * Verify user email after signup
 * @param verificationData - Email verification data
 * @returns Promise<AuthResponse> - Verification response
 */
export const verifyEmail = async (verificationData: { token: string }): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/verify-email', verificationData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: 'Network error occurred during email verification',
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}

/**
 * Resend email verification
 * @param email - User email address
 * @returns Promise<AuthResponse> - Resend verification response
 */
export const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/resend-verification', { email })
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: 'Network error occurred while resending verification email',
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}