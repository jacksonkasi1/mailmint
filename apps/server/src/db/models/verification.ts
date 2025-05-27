import mongoose, { Document, Schema, Types } from 'mongoose';
import { DOC_STATUSES, RISK_SCORES } from './enums';

export interface IVerification extends Document {
  documentId: Types.ObjectId;
  overallStatus?: typeof DOC_STATUSES[number];
  riskScore?: typeof RISK_SCORES[number];
  initiatedBy?: Types.ObjectId;
  finalizedBy?: Types.ObjectId;
  finalizedAt?: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    documentId:    { type: Schema.Types.ObjectId, ref: 'Document', unique: true },
    overallStatus: { type: String, enum: DOC_STATUSES },
    riskScore:     { type: String, enum: RISK_SCORES },
    initiatedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
    finalizedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
    finalizedAt:   { type: Date }
  },
  { timestamps: true, collection: 'verifications' }
);

export default mongoose.model<IVerification>('Verification', verificationSchema);
