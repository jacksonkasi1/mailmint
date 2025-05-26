// ** Core Packages
import { Hono } from 'hono'

// ** Middleware
import { authMiddleware } from '@/middleware/auth'

// ** Types
import type { ErrorResponse } from '@/types/common'
import type { AuthResponse, AuthUser } from '@/types/auth'

// ** Utils
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'

// Create route for getting current user info
export const meRoute = new Hono()

/**
 * Get current authenticated user information
 * GET /auth/me
 */
meRoute.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    // Here you would typically fetch full user data from your database
    // using the user.uid from Firebase

    // Mock user data (replace with actual database lookup)
    const userData: AuthUser = {
      uid: user.uid,
      email: user.email || '',
      emailVerified: user.emailVerified || false,
      name: user.name || '',
      picture: user.picture || '',
      lastLoginAt: new Date().toISOString()
    }

    const response: AuthResponse = formatResponse({
      success: true,
      message: 'User information retrieved successfully',
      data: {
        user: userData
      }
    })

    logger.info('User info retrieved', {
      uid: user.uid,
      email: user.email
    })

    return c.json(response, 200)
  } catch (error) {
    logger.error('Error retrieving user info', error)

    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Failed to retrieve user information'
    })

    return c.json(errorResponse, 500)
  }
})