import type { Context, Next } from 'hono'
import { verifyFirebaseToken } from '@/config/firebase-admin'
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'
import type { ErrorResponse } from '@/types/common'

// Extend Context type to include user information
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      uid: string
      email?: string
      emailVerified?: boolean
      [key: string]: any
    }
  }
}

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID token and attaches user info to context
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Get token from Authorization header
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader) {
      const errorResponse: ErrorResponse = formatResponse({
        success: false,
        error: 'Authorization header is required',
      })
      return c.json(errorResponse, 401)
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token) {
      const errorResponse: ErrorResponse = formatResponse({
        success: false,
        error: 'Invalid authorization format. Use Bearer <token>',
      })
      return c.json(errorResponse, 401)
    }

    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(token)
    
    if (!verificationResult.success) {
      const errorResponse: ErrorResponse = formatResponse({
        success: false,
        error: 'Invalid or expired token',
      })
      return c.json(errorResponse, 401)
    }

    // Attach user info to context
    c.set('user', {
      uid: verificationResult.uid as string,
      email: verificationResult.email,
      emailVerified: verificationResult.emailVerified,
      ...verificationResult.user
    })

    logger.info('User authenticated successfully', {
      uid: verificationResult.uid as string,
      email: verificationResult.email,
      path: c.req.path,
      method: c.req.method
    })

    await next()
  } catch (error) {
    logger.error('Authentication middleware error', error)
    
    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Authentication failed',
    })
    return c.json(errorResponse, 500)
  }
}

/**
 * Optional Authentication Middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim()
        if (token) {
        const verificationResult = await verifyFirebaseToken(token)
          if (verificationResult.success && verificationResult.uid) {
          c.set('user', {
            uid: verificationResult.uid,
            email: verificationResult.email,
            emailVerified: verificationResult.emailVerified,
            // Spread user data but exclude uid to avoid duplication
            ...Object.fromEntries(
              Object.entries(verificationResult.user).filter(([key]) => key !== 'uid')
            )
          })
        }
      }
    }

    await next()
  } catch (error) {
    logger.warn('Optional auth middleware warning', error)
    // Continue without authentication for optional middleware
    await next()
  }
}