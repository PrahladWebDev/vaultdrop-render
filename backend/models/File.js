import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cloudinaryUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  fileName: { type: String, required: true },
  description: { type: String }, // New field for file description
  password: { type: String },
  expiresAt: { type: Date, required: true },
  downloadLimit: { type: Number, default: 5 },
  downloadCount: { type: Number, default: 0 },
  otp: { type: String },
  otpExpires: { type: Date },
  requiresOtp: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resourceType: { type: String, enum: ['raw', 'image', 'video'], default: 'raw' }, // ✅ NEW
  isGlobal: { type: Boolean, default: false }, // ✅ New field
});

export default mongoose.model('File', fileSchema);
