import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true, // Format FL-YYYY-000001
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    guestEmail: { type: String },
    guestPhone: { type: String },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        productId: { type: String }, // optional ref just in case, but snapshot is key
        variant: {
          color: { type: String },
          size: { type: String }
        }
      },
    ],
    amounts: {
      subtotal: { type: Number, required: true, default: 0 },
      shipping: { type: Number, required: true, default: 0 },
      discount: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true, default: 0 },
    },
    currency: {
      type: String,
      required: true,
      default: 'DZD',
    },
    shipping: {
      wilaya: { type: String, required: true },
      commune: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      method: { type: String, enum: ['home', 'desk'], required: true, default: 'home' },
    },
    payment: {
      method: { type: String, enum: ['cod', 'ccp', 'baridimob', 'stripe'], required: true, default: 'cod' },
      status: { type: String, enum: ['pending', 'paid', 'failed'], required: true, default: 'pending' },
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    timeline: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    customerNote: { type: String },
    adminNote: { type: String },
    reviewInvitationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to add initial timeline if empty
orderSchema.pre('save', function (next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({ status: 'pending', note: 'Commande initiée' });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
