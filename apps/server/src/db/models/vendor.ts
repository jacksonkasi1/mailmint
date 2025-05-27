import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  primaryDomain: string;
  firstSeenAt: Date;
  emailsTracked: number;
}

const vendorSchema = new Schema<IVendor>(
  {
    name:          { type: String, required: true },
    primaryDomain: { type: String, required: true, unique: true, lowercase: true },
    firstSeenAt:   { type: Date, default: Date.now },
    emailsTracked: { type: Number, default: 0 }
  },
  { timestamps: true, collection: 'vendors' }
);

export default mongoose.model<IVendor>('Vendor', vendorSchema);
