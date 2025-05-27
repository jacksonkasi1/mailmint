import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChangeLog extends Document {
  entityName: string;
  entityId: Types.ObjectId;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: Types.ObjectId;
  changedAt: Date;
}

const changeLogSchema = new Schema<IChangeLog>(
  {
    entityName: { type: String, required: true },
    entityId:   { type: Schema.Types.ObjectId, required: true },
    fieldName:  { type: String, required: true },
    oldValue:   { type: String },
    newValue:   { type: String },
    changedBy:  { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: { createdAt: 'changedAt', updatedAt: false },
    collection: 'change_logs'
  }
);

export default mongoose.model<IChangeLog>('ChangeLog', changeLogSchema);
