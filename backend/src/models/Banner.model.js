import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      fr: { type: String, required: true },
      ar: { type: String, required: true }
    },
    imageLight: { type: String, required: true },
    imageDark: { type: String, required: true },
    cta: {
      text: {
        fr: { type: String, required: true },
        ar: { type: String, required: true }
      },
      link: { type: String, required: true },
    },
    schedule: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
