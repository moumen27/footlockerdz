import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    whatsappNumber: { type: String, default: '+213000000000' },
    phones: [{ type: String }],
    socials: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
    maintenanceFlag: { type: Boolean, default: false },
    shippingRates: [
      {
        wilayaCode: { type: String, required: true },
        homePrice: { type: Number, required: true, default: 600 },
        deskPrice: { type: Number, required: true, default: 400 },
      }
    ],
    freeShippingThreshold: { type: Number, default: 15000 },
    flashSale: {
      active: { type: Boolean, default: true },
      title: {
        fr: { type: String, default: 'VENTE FLASH' },
        ar: { type: String, default: 'تخفيضات فلاش' }
      },
      subtitle: {
        fr: { type: String, default: "Jusqu'à -50% sur une sélection de produits." },
        ar: { type: String, default: 'خصم يصل إلى 50٪ على مجموعة مختارة.' }
      },
      endDate: { type: Date, default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      discountPercentage: { type: Number, default: 50 },
      targetType: { type: String, default: 'all' }, // 'all', 'category', 'brand'
      targetValue: { type: String, default: '' },
      discountBadge: { type: String, default: '-50%' }
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
