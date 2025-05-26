// Main authentication API exports
export * from './types'
export * from './signup'
export * from './login'
export * from './social'

// Re-export commonly used functions for convenience
export { signupUser, verifyEmail, resendVerificationEmail } from './signup'
export { loginUser, forgotPassword, resetPassword, logoutUser } from './login'
export { socialAuth, linkSocialAccount, unlinkSocialAccount } from './social'