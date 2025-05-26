// ** Core Packages
import { Hono } from 'hono'

// ** Third Party
import { zValidator } from '@hono/zod-validator'

// ** Schema
import { verifyEmailBodySchema } from '@/schema/auth/auth.schema'

// ** Types
import type { ErrorResponse } from '@/types/common'
import type { AuthResponse } from '@/types/auth'

// ** Utils
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'

// Create route for email verification
export const verifyEmailRoute = new Hono()

/**
 * Verify user email with token
 * POST /auth/verify-email
 */
verifyEmailRoute.post('/', zValidator('json', verifyEmailBodySchema), async (c) => {
  try {
    const { token } = c.req.valid('json')

    logger.info('Email verification attempt')

    // Here you would typically:
    // 1. Validate the verification token
    // 2. Check if token is not expired
    // 3. Find the user associated with the token
    // 4. Mark the user's email as verified
    // 5. Invalidate the verification token

    // Mock verification logic (replace with actual implementation)
    if (!token || token.length < 10) {
      const errorResponse: ErrorResponse = formatResponse({
        success: false,
        error: 'Invalid verification token'
      })
      return c.json(errorResponse, 400)
    }

    // Simulate successful verification
    const response: AuthResponse = formatResponse({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          uid: 'mock-uid',
          email: 'user@example.com',
          emailVerified: true,
          name: 'Mock User',
          picture: '',
          lastLoginAt: new Date().toISOString()
        }
      }
    })

    logger.info('Email verification successful', { token: `${token.substring(0, 10)}...` })

    return c.json(response, 200)
  } catch (error) {
    logger.error('Error during email verification', error)

    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Email verification failed'
    })

    return c.json(errorResponse, 500)
  }
})