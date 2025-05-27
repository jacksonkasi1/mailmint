import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISecurityCheck extends Document {
  emailId: Types.ObjectId;
  spfPass?: boolean;
  dkimPass?: boolean;
  dmarcPass?: boolean;
  spoofDetected?: boolean;
  details?: Record<string, unknown>;
}

const securityCheckSchema = new Schema<ISecurityCheck>(
  {
    emailId:       { type: Schema.Types.ObjectId, ref: 'Email', index: true },
    spfPass:       { type: Boolean },
    dkimPass:      { type: Boolean },
    dmarcPass:     { type: Boolean },
    spoofDetected: { type: Boolean },
    details:       { type: Schema.Types.Mixed }
  },
  { timestamps: true, collection: 'security_checks' }
);

securityCheckSchema.index({ spoofDetected: 1 });

export default mongoose.model<ISecurityCheck>('SecurityCheck', securityCheckSchema);
