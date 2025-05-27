import mongoose, { Document, Schema, Types } from 'mongoose';
import { STEP_NAMES, STEP_STATUSES } from './enums';

export interface IVerificationStep extends Document {
  verificationId: Types.ObjectId;
  stepName: typeof STEP_NAMES[number];
  status: typeof STEP_STATUSES[number];
  completedAt?: Date;
}

const verificationStepSchema = new Schema<IVerificationStep>(
  {
    verificationId: { type: Schema.Types.ObjectId, ref: 'Verification', index: true },
    stepName:       { type: String, enum: STEP_NAMES, required: true },
    status:         { type: String, enum: STEP_STATUSES, default: 'PENDING' },
    completedAt:    { type: Date }
  },
  { timestamps: true, collection: 'verification_steps' }
);

verificationStepSchema.index(
  { verificationId: 1, stepName: 1 },
  { unique: true }
);

export default mongoose.model<IVerificationStep>('VerificationStep', verificationStepSchema);
