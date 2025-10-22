import mongoose from 'mongoose';

const model3DSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'model/gltf-binary',
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: ['architecture', 'characters', 'vehicles', 'props', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual property (not stored in DB)
model3DSchema.virtual('fileUrl').get(function () {
  return `/api/models/file/${this.fileId}`;
});

// ✅ Indexes for faster searching/sorting
model3DSchema.index({ name: 'text', description: 'text', tags: 'text' });
model3DSchema.index({ uploadDate: -1 });
model3DSchema.index({ category: 1 });

// ✅ Export model
const Model3D = mongoose.model('Model3D', model3DSchema);
export default Model3D;
