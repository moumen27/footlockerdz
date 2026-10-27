import Product from '../models/Product.model.js';
import Brand from '../models/Brand.model.js';
import Category from '../models/Category.model.js';
import Settings from '../models/Settings.model.js';

// Helper to apply dynamic flash sale discount to a product according to user rules
const applyFlashSaleToProduct = (product, flashSale) => {
  if (!flashSale || !flashSale.active) return product;
  if (!flashSale.endDate || new Date(flashSale.endDate) <= new Date()) return product;

  const discountPercent = Number(flashSale.discountPercentage) || 0;
  if (discountPercent <= 0) return product;

  // Check target match
  let isTarget = false;
  if (flashSale.targetType === 'all') {
    isTarget = true;
  } else if (flashSale.targetType === 'category') {
    const targetCat = (flashSale.targetValue || '').toLowerCase().trim();
    const pCatSlug = (product.category?.slug || '').toLowerCase();
    const pCatName = (product.category?.name?.fr || product.category?.name || '').toLowerCase();
    const pCatId = product.category?._id?.toString() || (typeof product.category === 'string' ? product.category : '');
    if (pCatSlug === targetCat || pCatName === targetCat || pCatId === targetCat) {
      isTarget = true;
    }
  } else if (flashSale.targetType === 'brand') {
    const targetBrand = (flashSale.targetValue || '').toLowerCase().trim();
    const pBrandSlug = (product.brand?.slug || '').toLowerCase();
    const pBrandName = (product.brand?.name || '').toLowerCase();
    const pBrandId = product.brand?._id?.toString() || (typeof product.brand === 'string' ? product.brand : '');
    if (pBrandSlug === targetBrand || pBrandName === targetBrand || pBrandId === targetBrand) {
      isTarget = true;
    }
  }

  if (!isTarget) return product;

  const p = product.toObject ? product.toObject() : { ...product };

  // In database:
  // p.price = Base original price (e.g. 7000)
  // p.discountPrice = Sale discounted price (e.g. 5000) if > 0 and < price
  let baseOriginalPrice = Number(p.price) || 0;
  let currentSellingPrice = baseOriginalPrice;
  let hasExistingDiscount = false;

  if (p.discountPrice > 0 && p.discountPrice < p.price) {
    hasExistingDiscount = true;
    currentSellingPrice = Number(p.discountPrice);
  }

  // Existing discount percentage on the product
  const currentDiscountPercent = hasExistingDiscount
    ? Math.round((1 - currentSellingPrice / baseOriginalPrice) * 100)
    : 0;

  // RULE: If product already has equal or higher discount (e.g. 50% or 60%), KEEP IT!
  // Only apply flash sale if flash discount is strictly higher than current discount.
  if (discountPercent > currentDiscountPercent) {
    const flashPrice = Math.round(baseOriginalPrice * (1 - discountPercent / 100));
    p.price = baseOriginalPrice;
    p.discountPrice = flashPrice;
    p.isFlashSale = true;
    p.flashSaleDiscount = discountPercent;
  }

  return p;
};

// @desc    Get all products (with filtering, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, brand, search, sort, gender, size, minPrice, maxPrice, inStock, promo, isNew } = req.query;
    
    // Fetch settings for active flash sale
    const settings = await Settings.findOne();
    const flashSale = settings?.flashSale;
    const isFlashActive = flashSale?.active && flashSale.endDate && new Date(flashSale.endDate) > new Date() && (Number(flashSale.discountPercentage) || 0) > 0;

    let query = {};

    const targetCat = category || req.query.sport;
    if (targetCat) {
      if (targetCat.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = targetCat;
      } else {
        const cleanSlug = targetCat.toLowerCase().trim().replace(/\s+/g, '-');
        const escaped = targetCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cat = await Category.findOne({ 
          $or: [
            { slug: targetCat.toLowerCase() },
            { slug: cleanSlug },
            { 'name.fr': { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { 'name.ar': { $regex: new RegExp(`^${escaped}$`, 'i') } }
          ] 
        });
        query.category = cat ? cat._id : null;
      }
    }

    if (brand) {
      if (brand.match(/^[0-9a-fA-F]{24}$/)) {
        query.brand = brand;
      } else {
        const cleanSlug = brand.toLowerCase().replace(/\s+/g, '-');
        const cleanName = brand.replace(/[-_]+/g, ' ');
        const br = await Brand.findOne({ 
          $or: [
            { slug: brand.toLowerCase() },
            { slug: cleanSlug },
            { name: { $regex: new RegExp(`^${brand}$`, 'i') } },
            { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }
          ] 
        });
        query.brand = br ? br._id : null;
      }
    }

    if (gender) {
      // Strict gender filtering: only return products matching exactly the chosen gender
      const gLower = String(gender).toLowerCase().trim();
      if (['men', 'women', 'kids', 'unisex'].includes(gLower)) {
        query.gender = gLower;
      }
    }

    if (size) {
      query['variants.size'] = size;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query['variants.stock'] = { $gt: 0 };
    }

    if (promo === 'true') {
      if (isFlashActive) {
        if (flashSale.targetType === 'all') {
          // All products qualify for promo during whole-store flash sale
        } else if (flashSale.targetType === 'category') {
          const cat = await Category.findOne({ 
            $or: [
              { slug: flashSale.targetValue?.toLowerCase() },
              { 'name.fr': { $regex: new RegExp(`^${flashSale.targetValue}$`, 'i') } }
            ] 
          });
          const catId = cat ? cat._id : (flashSale.targetValue?.match(/^[0-9a-fA-F]{24}$/) ? flashSale.targetValue : null);
          if (catId) {
            query.$or = [{ discountPrice: { $gt: 0 } }, { category: catId }];
          } else {
            query.discountPrice = { $gt: 0 };
          }
        } else if (flashSale.targetType === 'brand') {
          const br = await Brand.findOne({
            $or: [
              { slug: flashSale.targetValue?.toLowerCase() },
              { name: { $regex: new RegExp(`^${flashSale.targetValue}$`, 'i') } }
            ]
          });
          const brId = br ? br._id : (flashSale.targetValue?.match(/^[0-9a-fA-F]{24}$/) ? flashSale.targetValue : null);
          if (brId) {
            query.$or = [{ discountPrice: { $gt: 0 } }, { brand: brId }];
          } else {
            query.discountPrice = { $gt: 0 };
          }
        } else {
          query.discountPrice = { $gt: 0 };
        }
      } else {
        query.discountPrice = { $gt: 0 };
      }
    }

    if (isNew === 'true') {
      query.isNewProduct = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    const products = await Product.find(query)
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug type')
      .sort(sortOption);

    const processedProducts = products.map(p => applyFlashSaleToProduct(p, flashSale));
      
    res.json(processedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products purchased by user
// @route   GET /api/products/user/purchased
// @access  Private
export const getPurchasedProducts = async (req, res) => {
  try {
    const Order = (await import('../models/Order.model.js')).default;
    
    // Find all orders for the user
    const orders = await Order.find({ userId: req.user._id, status: { $in: ['delivered', 'shipped', 'confirmed'] } });
    
    // Extract unique product IDs
    const productIds = new Set();
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (item.productId) productIds.add(item.productId.toString());
        });
      }
    });

    const products = await Product.find({ _id: { $in: Array.from(productIds) } })
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug type')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug type');
      
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    const settings = await Settings.findOne();
    const flashSale = settings?.flashSale;
    const processedProduct = applyFlashSaleToProduct(product, flashSale);

    res.json(processedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to resolve Brand and Category IDs from names or objects
const resolveBrandAndCategory = async (body) => {
  if (body.brand) {
    let brandVal = body.brand;
    if (typeof brandVal === 'object' && brandVal !== null) {
      brandVal = brandVal._id || brandVal.id || brandVal.name || '';
    }
    const trimmed = String(brandVal).trim();
    if (trimmed) {
      let brand = null;
      if (trimmed.match(/^[0-9a-fA-F]{24}$/)) {
        brand = await Brand.findById(trimmed).catch(() => null);
      }
      if (!brand) {
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        brand = await Brand.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          ]
        });
        if (!brand) {
          const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          brand = await Brand.create({
            name: trimmed,
            slug: slug,
            logo: `/assets/brands/${slug}.svg`,
            country: 'International'
          });
        }
      }
      body.brand = brand ? brand._id : undefined;
    } else {
      delete body.brand;
    }
  } else {
    delete body.brand;
  }

  if (body.category) {
    let catVal = body.category;
    if (typeof catVal === 'object' && catVal !== null) {
      catVal = catVal._id || catVal.id || catVal.name?.fr || catVal.name || '';
    }
    const trimmed = String(catVal).trim();
    if (trimmed) {
      let category = null;
      if (trimmed.match(/^[0-9a-fA-F]{24}$/)) {
        category = await Category.findById(trimmed).catch(() => null);
      }
      if (!category) {
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        category = await Category.findOne({
          $or: [
            { 'name.fr': { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { 'name.ar': { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          ]
        });
        if (!category) {
          category = await Category.create({
            name: { fr: trimmed, ar: trimmed },
            slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            type: 'sport'
          });
        }
      }
      body.category = category ? category._id : undefined;
    } else {
      delete body.category;
    }
  } else {
    delete body.category;
  }
};

// Helper to sanitize product body before saving
const sanitizeProductBody = (body) => {
  // Ensure SKU
  if (body.sku) body.sku = String(body.sku).trim();

  // Ensure Name
  if (body.name) {
    if (typeof body.name === 'string') {
      const n = body.name.trim();
      body.name = { fr: n, ar: n };
    } else {
      const fr = String(body.name.fr || body.name.ar || '').trim();
      const ar = String(body.name.ar || body.name.fr || '').trim();
      body.name = { fr, ar };
    }
  }

  // Ensure Description
  if (body.description) {
    if (typeof body.description === 'string') {
      const d = body.description.trim();
      body.description = { fr: d, ar: d };
    } else {
      body.description = {
        fr: String(body.description.fr || '').trim(),
        ar: String(body.description.ar || '').trim()
      };
    }
  }

  // Ensure Price numbers
  if (body.price !== undefined) body.price = Number(body.price) || 0;
  if (body.discountPrice !== undefined) body.discountPrice = Number(body.discountPrice) || 0;

  // Clean variants
  if (body.variants && Array.isArray(body.variants)) {
    body.variants = body.variants
      .filter((v) => v && v.color && String(v.color).trim() && v.size && String(v.size).trim())
      .map((variant) => ({
        ...variant,
        color: String(variant.color).trim(),
        size: String(variant.size).trim(),
        colorCode: variant.colorCode || '#000000',
        stock: Math.max(0, Number(variant.stock) || 0),
        images: Array.isArray(variant.images)
          ? variant.images.filter((img) => typeof img === 'string' && img.trim())
          : []
      }));
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    sanitizeProductBody(req.body);

    if (!req.body.sku) {
      return res.status(400).json({ message: 'Le SKU (Référence) est obligatoire' });
    }
    if (!req.body.name?.fr) {
      return res.status(400).json({ message: 'Le nom du produit est obligatoire' });
    }
    if (!req.body.price || Number(req.body.price) <= 0) {
      return res.status(400).json({ message: 'Le prix de base doit être supérieur à 0' });
    }
    if (req.body.discountPrice && Number(req.body.discountPrice) >= Number(req.body.price)) {
      return res.status(400).json({ message: 'Le prix remisé doit être strictement inférieur au prix de base' });
    }

    await resolveBrandAndCategory(req.body);

    if (!req.body.brand) {
      return res.status(400).json({ message: 'La marque est obligatoire' });
    }
    if (!req.body.category) {
      return res.status(400).json({ message: 'La catégorie est obligatoire' });
    }

    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message || 'Erreur lors de la création du produit' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    sanitizeProductBody(req.body);

    if (!req.body.sku) {
      return res.status(400).json({ message: 'Le SKU (Référence) est obligatoire' });
    }
    if (!req.body.name?.fr) {
      return res.status(400).json({ message: 'Le nom du produit est obligatoire' });
    }
    if (!req.body.price || Number(req.body.price) <= 0) {
      return res.status(400).json({ message: 'Le prix de base doit être supérieur à 0' });
    }
    if (req.body.discountPrice && Number(req.body.discountPrice) >= Number(req.body.price)) {
      return res.status(400).json({ message: 'Le prix remisé doit être strictement inférieur au prix de base' });
    }

    await resolveBrandAndCategory(req.body);

    if (!req.body.brand) {
      return res.status(400).json({ message: 'La marque est obligatoire' });
    }
    if (!req.body.category) {
      return res.status(400).json({ message: 'La catégorie est obligatoire' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message || 'Erreur lors de la modification du produit' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
