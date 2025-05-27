import mongoose, { Document, Schema, Types } from 'mongoose';
import { CLASSIFICATIONS } from './enums';

interface IAttachment {
  filename: string;
  mimeType: string;
  size: number;      // bytes
  gcsPath?: string;  // present when off-loaded to GCS
}

export interface IEmail extends Document {
  vendorId?: Types.ObjectId;
  emailId: string;            // Postmark Message-ID
  fromAddress: string;
  fromName?: string;
  toAddresses: string[];
  subject?: string;
  receivedAt?: Date;
  classification: typeof CLASSIFICATIONS[number];
  rawHeaders?: Record<string, unknown>;
  bodyHtml?: string;
  bodyText?: string;
  attachments: IAttachment[];
}

const attachmentSchema = new Schema<IAttachment>(
  {
    filename: String,
    mimeType: String,
    size:     Number,
    gcsPath:  String
  },
  { _id: false }
);

const emailSchema = new Schema<IEmail>(
  {
    vendorId:      { type: Schema.Types.ObjectId, ref: 'Vendor' },
    emailId:       { type: String, required: true, unique: true },
    fromAddress:   { type: String, required: true, lowercase: true },
    fromName:      { type: String },
    toAddresses:   [{ type: String, lowercase: true }],
    subject:       { type: String },
    receivedAt:    { type: Date },
    classification:{ type: String, enum: CLASSIFICATIONS, required: true },
    rawHeaders:    { type: Schema.Types.Mixed },
    bodyHtml:      { type: String },
    bodyText:      { type: String },
    attachments:   [attachmentSchema]
  },
  { timestamps: true, collection: 'emails' }
);

emailSchema.index({ classification: 1 });

export default mongoose.model<IEmail>('Email', emailSchema);
