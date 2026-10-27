import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'International'
  },
  slogan: {
    fr: { type: String, default: '' },
    ar: { type: String, default: '' }
  },
  description: {
    fr: { type: String, default: '' },
    ar: { type: String, default: '' }
  },
  categoryType: {
    type: String,
    enum: ['sport', 'lifestyle'],
    default: 'lifestyle'
  }
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
