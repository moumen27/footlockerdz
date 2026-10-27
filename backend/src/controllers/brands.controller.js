import Brand from '../models/Brand.model.js';
import Product from '../models/Product.model.js';

// @desc    Get all brands (with product count)
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ name: 1 });

    // Aggregate product counts per brand
    const counts = await Product.aggregate([
      { $match: { status: { $ne: 'archived' } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((c) => {
      if (c._id) {
        countMap[c._id.toString()] = c.count;
      }
    });

    const enriched = brands.map((b) => ({
      ...b.toObject(),
      productCount: countMap[b._id.toString()] || 0
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des marques' });
  }
};

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = async (req, res) => {
  try {
    const { name, slug, logo, country, slogan, description, categoryType } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom de la marque est requis' });
    }

    const cleanName = name.trim();
    const cleanSlug = (slug && slug.trim()) 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') 
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if brand already exists
    const existing = await Brand.findOne({
      $or: [
        { slug: cleanSlug },
        { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: 'Une marque portant ce nom existe déjà' });
    }

    const newBrand = await Brand.create({
      name: cleanName,
      slug: cleanSlug,
      logo: (logo && logo.trim()) ? logo.trim() : `/assets/brands/${cleanSlug}.svg`,
      country: (country && country.trim()) ? country.trim() : 'International',
      slogan: typeof slogan === 'object' ? slogan : { fr: slogan || '', ar: '' },
      description: typeof description === 'object' ? description : { fr: description || '', ar: '' },
      categoryType: categoryType || 'lifestyle'
    });

    res.status(201).json({
      ...newBrand.toObject(),
      productCount: 0
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la création de la marque' });
  }
};

// @desc    Update an existing brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = async (req, res) => {
  try {
    const { name, slug, logo, country, slogan, description, categoryType } = req.body;

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Marque introuvable' });
    }

    if (name && name.trim()) {
      brand.name = name.trim();
    }
    if (slug && slug.trim()) {
      brand.slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (logo !== undefined) {
      brand.logo = logo.trim() || `/assets/brands/${brand.slug}.svg`;
    }
    if (country !== undefined) {
      brand.country = country.trim() || 'International';
    }
    if (slogan !== undefined) {
      brand.slogan = typeof slogan === 'object' ? slogan : { fr: slogan || '', ar: brand.slogan?.ar || '' };
    }
    if (description !== undefined) {
      brand.description = typeof description === 'object' ? description : { fr: description || '', ar: brand.description?.ar || '' };
    }
    if (categoryType !== undefined) {
      brand.categoryType = categoryType;
    }

    const updated = await brand.save();

    // Get current product count
    const productCount = await Product.countDocuments({ brand: updated._id, status: { $ne: 'archived' } });

    res.json({
      ...updated.toObject(),
      productCount
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la modification de la marque' });
  }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Marque introuvable' });
    }

    // Check if any products are associated with this brand
    const associatedCount = await Product.countDocuments({
      brand: brand._id,
      status: { $ne: 'archived' }
    });

    if (associatedCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer "${brand.name}" : ${associatedCount} produit(s) lui sont actuellement associés dans la boutique.`
      });
    }

    await Brand.deleteOne({ _id: brand._id });

    res.json({ message: `Marque "${brand.name}" supprimée avec succès` });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la suppression de la marque' });
  }
};
