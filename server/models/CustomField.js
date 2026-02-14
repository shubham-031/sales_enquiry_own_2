import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a field name'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]+$/, 'Field name must contain only lowercase letters, numbers, and underscores'],
    },
    label: {
      type: String,
      required: [true, 'Please provide a display label'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      default: 'text',
    },
    options: {
      // For select type: ['option1', 'option2']
      type: [String],
      default: [],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CustomField = mongoose.model('CustomField', customFieldSchema);

export default CustomField;
