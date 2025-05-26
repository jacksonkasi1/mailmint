// ** Core Packages
import { Hono } from 'hono'

// ** Middleware
import { authMiddleware } from '@/middleware/auth'

// ** Types
import type { ErrorResponse } from '@/types/common'
import type { AuthResponse } from '@/types/auth'

// ** Utils
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'

// Create route for user logout
export const logoutRoute = new Hono()

/**
 * Logout user session
 * POST /auth/logout
 */
logoutRoute.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    // Here you would typically:
    // 1. Invalidate refresh tokens
    // 2. Clear session data
    // 3. Update last activity timestamp
    // 4. Handle any cleanup logic

    logger.info('User logged out', {
      uid: user.uid,
      email: user.email
    })

    const response: AuthResponse = formatResponse({
      success: true,
      message: 'Logged out successfully'
    })

    return c.json(response, 200)
  } catch (error) {
    logger.error('Error during logout', error)

    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Logout failed'
    })

    return c.json(errorResponse, 500)
  }
})