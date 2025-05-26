// ** Core Packages
import { Hono } from 'hono'

// ** Third Party
import { zValidator } from '@hono/zod-validator'

// ** Schema
import { signupBodySchema } from '@/schema/auth/auth.schema'

// ** Types
import type { ErrorResponse } from '@/types/common'
import type { AuthResponse, AuthUser } from '@/types/auth'

// ** Utils
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'

// Create route for user signup
export const signupRoute = new Hono()

/**
 * Register a new user
 * POST /auth/signup
 */
signupRoute.post('/', zValidator('json', signupBodySchema), async (c) => {
  try {
    const { email, password, firstName, lastName, rememberMe } = c.req.valid('json')

    // NOTE: Firebase handles user creation on the client side
    // This endpoint is for backend user management after Firebase auth
    logger.info('Signup attempt', { email, firstName, lastName })

    // Here you would typically:
    // 1. Create user record in your database
    // 2. Send welcome email
    // 3. Set up user preferences
    // 4. Handle any additional business logic

    // Mock user creation (replace with actual database creation)
    const newUser: AuthUser = {
      uid: 'firebase_uid_here', // This would come from Firebase token
      email,
      emailVerified: false,
      name: firstName && lastName ? `${firstName} ${lastName}` : firstName || 'New User',
      createdAt: new Date().toISOString()
    }

    const response: AuthResponse = formatResponse({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      data: {
        user: newUser
      }
    })

    logger.info('User signed up successfully', {
      uid: newUser.uid,
      email: newUser.email
    })

    return c.json(response, 201)
  } catch (error) {
    logger.error('Error during signup', error)

    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Signup failed'
    })

    return c.json(errorResponse, 500)
  }
})