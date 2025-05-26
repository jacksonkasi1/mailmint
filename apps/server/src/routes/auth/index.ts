// ** Core Packages
import { Hono } from "hono";

// ** Routes
import { loginRoute } from "./login";
import { signupRoute } from "./signup";
import { socialAuthRoute } from "./social";
import { logoutRoute } from "./logout";
import { meRoute } from "./me";
import { verifyEmailRoute } from "./verify-email";
import { resendVerificationRoute } from "./resend-verification";

/**
 * Authentication routes
 * Provides endpoints for user authentication and management
 */
export const authRoutes = new Hono();

// Mount authentication routes
authRoutes.route("/login", loginRoute);
authRoutes.route("/signup", signupRoute);
authRoutes.route("/social", socialAuthRoute);
authRoutes.route("/logout", logoutRoute);
authRoutes.route("/me", meRoute);
authRoutes.route("/verify-email", verifyEmailRoute);
authRoutes.route("/resend-verification", resendVerificationRoute);
