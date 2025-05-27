import mongoose, { Document, Schema } from 'mongoose';
import { ROLES } from './enums';

export interface IUser extends Document {
  fullName: string;
  email: string;
  role: typeof ROLES[number];
  avatarUrl?: string;
  lastLoginAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName:    { type: String, required: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    role:        { type: String, enum: ROLES, required: true },
    avatarUrl:   { type: String },
    lastLoginAt: { type: Date }
  },
  { timestamps: true, collection: 'users' }
);

export default mongoose.model<IUser>('User', userSchema);
