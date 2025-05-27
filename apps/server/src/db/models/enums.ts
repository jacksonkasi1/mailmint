export const ROLES            = ['ADMIN', 'REVIEWER', 'VIEWER'] as const;
export const CLASSIFICATIONS  = ['FINANCE', 'PRODUCT_OFFER', 'QUOTATION', 'SPAM', 'OTHER'] as const;
export const DOC_TYPES        = ['INVOICE', 'QUOTATION', 'PRODUCT_OFFER'] as const;
export const DOC_STATUSES     = ['PENDING', 'VERIFIED', 'WARNING', 'FAILED', 'FLAGGED'] as const;
export const STEP_NAMES       = [
  'EMAIL_RECEPTION',
  'DATA_EXTRACTION',
  'DATA_VERIFICATION',
  'AI_ANALYSIS',
  'RISK_ASSESSMENT'
] as const;
export const STEP_STATUSES    = ['PENDING', 'COMPLETED', 'FAILED'] as const;
export const RISK_SCORES      = ['LOW', 'MEDIUM', 'HIGH'] as const;
