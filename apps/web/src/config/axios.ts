import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import { auth } from './firebase'
import { User } from 'firebase/auth'

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add Firebase auth token
axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    try {
      // Get current user from Firebase Auth
      const currentUser: User | null = auth.currentUser
      
      if (currentUser) {
        // Get the ID token from Firebase
        const idToken = await currentUser.getIdToken()
        
        // Add the token to the Authorization header
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${idToken}`,
        }
      }
    } catch (error) {
      console.error('Error getting Firebase token:', error)
      // Continue with request even if token retrieval fails
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling common response scenarios
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh the token
        const currentUser = auth.currentUser
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true) // Force refresh
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Redirect to login or handle auth failure
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance