import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { env, isDevelopment } from './environment'
import { logger } from '@repo/logs'
import * as path from 'path'
import * as fs from 'fs'

let firebaseApp: App
let firebaseAuth: Auth

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = (): void => {
  try {
    // Check if Firebase app is already initialized
    if (getApps().length > 0) {
      firebaseApp = getApps()[0]
      firebaseAuth = getAuth(firebaseApp)
      return
    }

    // Try to use service account file first, then fallback to environment variables
    let credential
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json')
    
    if (fs.existsSync(serviceAccountPath)) {
      // Use service account file
      logger.info('Using Firebase service account file for authentication')
      credential = cert(serviceAccountPath)
    } else {
      // Fallback to environment variables
      logger.info('Using Firebase environment variables for authentication')
      
      // Validate that we have the required environment variables
      if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Missing required Firebase environment variables')
      }

      // Validate private key format
      const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
        throw new Error('Invalid private key format. Ensure the private key includes proper PEM headers and footers.')
      }      const serviceAccount = {
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }
      credential = cert(serviceAccount)
    }

    firebaseApp = initializeApp({
      credential: credential,
      projectId: env.FIREBASE_PROJECT_ID || 'invox-8f1f3'
    })

    firebaseAuth = getAuth(firebaseApp)

    logger.info('Firebase Admin SDK initialized successfully', {
      projectId: env.FIREBASE_PROJECT_ID,
      environment: isDevelopment ? 'development' : 'production'
    })

  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', error)
    throw new Error('Firebase Admin initialization failed')
  }
}

// Initialize Firebase Admin
initializeFirebaseAdmin()

export { firebaseAuth, firebaseApp }

// Helper function to verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string) => {
  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken)
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      user: decodedToken
    }
  } catch (error) {
    logger.error('Firebase token verification failed', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token verification failed'
    }
  }
}