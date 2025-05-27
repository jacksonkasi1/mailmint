import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductLine extends Document {
  documentId: Types.ObjectId;
  description?: string;
  quantity?: number;
  unitPrice?: mongoose.Types.Decimal128;
}

const productLineSchema = new Schema<IProductLine>(
  {
    documentId:  { type: Schema.Types.ObjectId, ref: 'Document', index: true },
    description: { type: String },
    quantity:    { type: Number },
    unitPrice:   { type: Schema.Types.Decimal128 }
  },
  { timestamps: true, collection: 'product_lines' }
);

export default mongoose.model<IProductLine>('ProductLine', productLineSchema);
