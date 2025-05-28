/**
 * Re-export of new modular services
 * This file maintains backward compatibility while using the new architecture
 */

// Re-export all new modular Postmark services
export * from "./postmark";

// For backward compatibility, export the main service as PostmarkService
export { MailMintPostmarkService as PostmarkService } from "./postmark";
