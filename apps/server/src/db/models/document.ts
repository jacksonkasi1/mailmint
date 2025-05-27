import mongoose, { Document, Schema, Types } from 'mongoose';
import { DOC_TYPES, DOC_STATUSES } from './enums';

export interface IDocument extends Document {
  emailId: Types.ObjectId;
  docType: typeof DOC_TYPES[number];
  offerPrice?: mongoose.Types.Decimal128;
  currency?: string;
  marketAvgPrice?: mongoose.Types.Decimal128;
  priceDeltaPct?: number;
  status: typeof DOC_STATUSES[number];
}

const documentSchema = new Schema<IDocument>(
  {
    emailId:        { type: Schema.Types.ObjectId, ref: 'Email', unique: true },
    docType:        { type: String, enum: DOC_TYPES, required: true },
    offerPrice:     { type: Schema.Types.Decimal128 },
    currency:       { type: String, length: 3 },
    marketAvgPrice: { type: Schema.Types.Decimal128 },
    priceDeltaPct:  { type: Number },
    status:         { type: String, enum: DOC_STATUSES, default: 'PENDING' }
  },
  { timestamps: true, collection: 'documents' }
);

documentSchema.index({ status: 1 });

export default mongoose.model<IDocument>('Document', documentSchema);
