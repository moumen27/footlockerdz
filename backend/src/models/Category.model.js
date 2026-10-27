import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    fr: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null // null if top-level category
  },
  type: {
    type: String,
    enum: ['sport', 'usage', 'collection'],
    required: true
  }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
