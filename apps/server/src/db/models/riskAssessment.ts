import mongoose, { Document, Schema, Types } from 'mongoose';
import { RISK_SCORES } from './enums';

export interface IRiskAssessment extends Document {
  verificationId: Types.ObjectId;
  riskScore?: typeof RISK_SCORES[number];
  recommendedActions: string[];
}

const riskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    verificationId:     { type: Schema.Types.ObjectId, ref: 'Verification', unique: true },
    riskScore:          { type: String, enum: RISK_SCORES },
    recommendedActions: [{ type: String }]
  },
  { timestamps: true, collection: 'risk_assessments' }
);

export default mongoose.model<IRiskAssessment>('RiskAssessment', riskAssessmentSchema);
