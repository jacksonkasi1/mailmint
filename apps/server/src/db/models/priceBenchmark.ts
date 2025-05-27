import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPriceBenchmark extends Document {
  documentId: Types.ObjectId;
  siteName?: string;
  url?: string;
  price?: mongoose.Types.Decimal128;
  currency?: string;
  capturedAt?: Date;
}

const priceBenchmarkSchema = new Schema<IPriceBenchmark>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', index: true },
    siteName:   { type: String },
    url:        { type: String },
    price:      { type: Schema.Types.Decimal128 },
    currency:   { type: String, length: 3 },
    capturedAt: { type: Date }
  },
  { timestamps: true, collection: 'price_benchmarks' }
);

export default mongoose.model<IPriceBenchmark>('PriceBenchmark', priceBenchmarkSchema);
