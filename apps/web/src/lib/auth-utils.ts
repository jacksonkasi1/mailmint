import { auth } from '@/config/firebase'
import { User } from 'firebase/auth'

/**
 * Get the current authenticated user
 * @returns Promise<User | null>
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

/**
 * Get the current user's ID token
 * @param forceRefresh - Whether to force refresh the token
 * @returns Promise<string | null>
 */
export const getCurrentUserToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    const user = auth.currentUser
    if (!user) return null

    const token = await user.getIdToken(forceRefresh)
    return token
  } catch (error) {
    console.error('Error getting user token:', error)
    return null
  }
}

/**
 * Check if the current user is authenticated
 * @returns Promise<boolean>
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Wait for Firebase Auth to initialize
 * @returns Promise<User | null>
 */
export const waitForAuthInit = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (auth.currentUser !== undefined) {
      resolve(auth.currentUser)
      return
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

/**
 * Set authentication token in cookie for middleware
 * @param token - Firebase ID token
 */
export const setAuthCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    // Set cookie with secure flags
    document.cookie = `firebase-auth-token=${token}; path=/; secure; samesite=strict; max-age=3600`
  }
}

/**
 * Remove authentication token from cookie
 */
export const removeAuthCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

/**
 * Check if user email is verified
 * @returns boolean
 */
export const isEmailVerified = (): boolean => {
  return auth.currentUser?.emailVerified || false
}

/**
 * Get user display name or email as fallback
 * @returns string
 */
export const getUserDisplayName = (): string => {
  const user = auth.currentUser
  return user?.displayName || user?.email || 'User'
}