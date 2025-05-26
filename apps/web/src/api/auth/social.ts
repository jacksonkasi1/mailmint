import axiosInstance from '@/config/axios'
import { SocialAuthRequest, AuthResponse, ApiError } from './types'

/**
 * Authenticate with social providers (Google, Apple)
 * @param socialAuthData - Social authentication data
 * @returns Promise<AuthResponse> - Social auth response
 */
export const socialAuth = async (socialAuthData: SocialAuthRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/social', socialAuthData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: `Network error occurred during ${socialAuthData.provider} authentication`,
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}

/**
 * Link social account to existing user
 * @param socialAuthData - Social authentication data for linking
 * @returns Promise<AuthResponse> - Link account response
 */
export const linkSocialAccount = async (socialAuthData: SocialAuthRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/link-social', socialAuthData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: `Network error occurred while linking ${socialAuthData.provider} account`,
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}

/**
 * Unlink social account from user
 * @param provider - Social provider to unlink
 * @returns Promise<AuthResponse> - Unlink account response
 */
export const unlinkSocialAccount = async (provider: 'google' | 'apple'): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.delete<AuthResponse>(`/auth/unlink-social/${provider}`)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    
    throw {
      success: false,
      message: `Network error occurred while unlinking ${provider} account`,
      error: error.message || 'Unknown error',
      statusCode: error.response?.status || 500
    } as ApiError
  }
}