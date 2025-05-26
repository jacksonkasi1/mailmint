import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { env, isDevelopment } from './environment'
import { logger } from '@repo/logs'

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

    // Initialize Firebase Admin with service account from environment configuration
    const serviceAccount = {
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: env.FIREBASE_PROJECT_ID
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