"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { setAuthCookie, removeAuthCookie } from '@/lib/auth-utils'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<User>
  signIn: (email: string, password: string) => Promise<User>
  signInWithGoogle: () => Promise<User>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendEmailVerification: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update profile with display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
    }
    
    // Send email verification
    await sendEmailVerification(userCredential.user)
    
    // Set auth cookie for middleware
    const token = await userCredential.user.getIdToken()
    setAuthCookie(token)
    
    return userCredential.user
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Set auth cookie for middleware
    const token = await userCredential.user.getIdToken()
    setAuthCookie(token)
    
    return userCredential.user
  }

  // Sign in with Google
  const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    
    const userCredential = await signInWithPopup(auth, provider)
    
    // Set auth cookie for middleware
    const token = await userCredential.user.getIdToken()
    setAuthCookie(token)
    
    return userCredential.user
  }

  // Logout
  const logout = async (): Promise<void> => {
    // Remove auth cookie
    removeAuthCookie()
    
    await signOut(auth)
  }

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email)
  }

  // Resend email verification
  const resendEmailVerification = async (): Promise<void> => {
    if (user) {
      await sendEmailVerification(user)
    } else {
      throw new Error('No user is currently signed in')
    }
  }

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
      
      if (user) {
        // Set auth cookie when user is authenticated
        try {
          const token = await user.getIdToken()
          setAuthCookie(token)
        } catch (error) {
          console.error('Error getting ID token:', error)
        }
      } else {
        // Remove auth cookie when user is not authenticated
        removeAuthCookie()
      }
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    resendEmailVerification,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}