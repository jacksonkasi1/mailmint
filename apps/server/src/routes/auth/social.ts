// ** Core Packages
import { Hono } from 'hono'

// ** Third Party
import { zValidator } from '@hono/zod-validator'

// ** Schema
import { socialAuthBodySchema } from '@/schema/auth/auth.schema'

// ** Config
import { verifyFirebaseToken } from '@/config/firebase-admin'

// ** Types
import type { ErrorResponse } from '@/types/common'
import type { AuthResponse, AuthUser } from '@/types/auth'

// ** Utils
import { formatResponse } from '@/utils/formatters'
import { logger } from '@repo/logs'

// Create route for social authentication
export const socialAuthRoute = new Hono()

/**
 * Handle social authentication (Google, Apple)
 * POST /auth/social
 */
socialAuthRoute.post('/', zValidator('json', socialAuthBodySchema), async (c) => {
  try {
    const { provider, idToken, isSignup } = c.req.valid('json')

    // Verify the Firebase ID token
    const verificationResult = await verifyFirebaseToken(idToken)

    if (!verificationResult.success) {
      const errorResponse: ErrorResponse = formatResponse({
        success: false,
        error: 'Invalid social authentication token'
      })
      return c.json(errorResponse, 401)
    }

    const { uid, email, user: firebaseUser } = verificationResult

    logger.info(`${provider} authentication attempt`, { 
      uid, 
      email, 
      isSignup,
      provider 
    })

    // Here you would typically:
    // 1. Check if user exists in your database
    // 2. Create new user if signup, or update existing user
    // 3. Handle provider-specific logic
    // 4. Update user profile with social provider data

    // Mock user data (replace with actual database operations)
    const user: AuthUser = {
      uid: uid as string, // Assert uid is non-null since it comes from verified token
      email: email || '',
      emailVerified: firebaseUser?.email_verified || false,
      name: firebaseUser?.name || '',
      picture: firebaseUser?.picture || '',
      createdAt: isSignup ? new Date().toISOString() : undefined,
      lastLoginAt: new Date().toISOString()
    }

    const response: AuthResponse = formatResponse({
      success: true,
      message: isSignup 
        ? `Account created successfully with ${provider}` 
        : `Signed in successfully with ${provider}`,
      data: {
        user
      }
    })

    logger.info(`${provider} authentication successful`, {
      uid: user.uid,
      email: user.email,
      isSignup
    })

    return c.json(response, isSignup ? 201 : 200)
  } catch (error) {
    logger.error('Error during social authentication', error)

    const errorResponse: ErrorResponse = formatResponse({
      success: false,
      error: 'Social authentication failed'
    })

    return c.json(errorResponse, 500)
  }
})