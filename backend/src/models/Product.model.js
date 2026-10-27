import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true }, // Nom de la couleur (ex: 'Noir')
  colorCode: { type: String, required: true }, // Code hex (ex: '#000000') pour affichage front
  size: { type: String, required: true }, // Taille (ex: '42' ou 'M')
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }], // Galerie d'images spécifique à cette couleur
  sku: { type: String, sparse: true } // SKU spécifique à la variante (optionnel)
});

const productSchema = new mongoose.Schema({
  sku: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  name: {
    fr: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true }
  },
  description: {
    fr: { type: String, trim: true },
    ar: { type: String, trim: true }
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  discountPrice: { 
    type: Number, 
    default: 0, // Si > 0, le produit est en promotion
    min: 0
  },
  isNewProduct: { 
    type: Boolean, 
    default: false 
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'kids', 'unisex'],
    default: 'unisex'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  variants: [variantSchema], // La matrice Taille x Couleur
  
  // Champs calculés ou de cache
  reviewsCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  
  status: { 
    type: String, 
    enum: ['active', 'draft', 'archived'], 
    default: 'active' 
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Champ virtuel pour obtenir le stock total du produit facilement
productSchema.virtual('totalStock').get(function() {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
});

// Index pour la recherche textuelle dans l'admin
productSchema.index({ 'name.fr': 'text', 'sku': 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
