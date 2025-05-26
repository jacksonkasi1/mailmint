// ** Core Packages
import { Hono } from 'hono'

// ** Third Party
import { zValidator } from '@hono/zod-validator'

// ** Schema
import { z } from 'zod'

// ** Types
import type { ErrorResponse } from '@/types/common'

// ** Utils
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'

// Schema for resend verification request
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim()
})

// Create route for resending verification email
export const resendVerificationRoute = new Hono()

/**
 * Resend email verification
 * POST /auth/resend-verification
 */
resendVerificationRoute.post('/', zValidator('json', resendVerificationSchema), async (c) => {
  try {
    const { email } = c.req.valid('json')

    logger.info('Resend verification email attempt', { email })

    // Here you would typically:
    // 1. Check if user exists with this email
    // 2. Check if email is already verified
    // 3. Generate a new verification token
    // 4. Send verification email
    // 5. Store the token with expiration

    // Mock resend logic (replace with actual implementation)
    if (!email || !email.includes('@')) {
      const errorResponse: ErrorResponse = formatResponse({
        success: false,
        error: 'Invalid email address'
      })
      return c.json(errorResponse, 400)
    }

    // Simulate successful resend
    const response = formatResponse({
      success: true,
      message: 'Verification email sent successfully'
    })

    logger.info('Verification email resent successfully', { email })

    return c.json(response, 200)
  } catch (error) {
    logger.error('Error during resend verification', error)

    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Failed to resend verification email'
    })

    return c.json(errorResponse, 500)
  }
})