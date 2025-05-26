// ** Core Packages
import { Hono } from 'hono'

// ** Third Party
import { zValidator } from '@hono/zod-validator'

// ** Schema
import { loginBodySchema } from '@/schema/auth/auth.schema'

// ** Types
import type { ErrorResponse } from '@/types/common'
import type { AuthResponse, AuthUser } from '@/types/auth'

// ** Utils
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'

// Create route for user login
export const loginRoute = new Hono()

/**
 * Authenticate user login
 * POST /auth/login
 */
loginRoute.post('/', zValidator('json', loginBodySchema), async (c) => {
  try {
    const { email, password, rememberMe } = c.req.valid('json')

    // NOTE: Firebase handles authentication on the client side
    // This endpoint is for backend user management after Firebase auth
    logger.info('Login attempt', { email, rememberMe })

    // Here you would typically:
    // 1. Verify the user exists in your database
    // 2. Update last login timestamp
    // 3. Handle any additional business logic

    // Mock user data (replace with actual database lookup)
    const user: AuthUser = {
      uid: 'firebase_uid_here', // This would come from Firebase token
      email,
      emailVerified: true,
      name: 'User Name',
      lastLoginAt: new Date().toISOString()
    }

    const response: AuthResponse = formatResponse({
      success: true,
      message: 'Login successful',
      data: {
        user
      }
    })

    logger.info('User logged in successfully', {
      uid: user.uid,
      email: user.email
    })

    return c.json(response, 200)
  } catch (error) {
    logger.error('Error during login', error)

    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Login failed'
    })

    return c.json(errorResponse, 500)
  }
})