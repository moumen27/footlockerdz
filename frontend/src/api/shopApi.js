import axiosInstance from './axios';

// Helper to properly resolve current selling price and old crossed-out price
const resolvePrices = (p) => {
  const basePrice = Number(p.price) || 0;
  const discount = Number(p.discountPrice) || 0;

  // Strict logic: discount is only valid if strictly positive AND strictly lower than base price
  if (discount > 0 && discount < basePrice) {
    return {
      price: discount,
      oldPrice: basePrice
    };
  }

  // If discount >= basePrice or discount <= 0, no discount is applied
  return {
    price: basePrice,
    oldPrice: null
  };
};

export const shopApi = {
  getBrands: async () => {
    try {
      const { data } = await axiosInstance.get('/brands');
      return data;
    } catch (e) {
      return [];
    }
  },

  getCategories: async () => {
    try {
      const { data } = await axiosInstance.get('/categories');
      return data;
    } catch (e) {
      return [];
    }
  },

  getBrand: async (slug) => {
    return null;
  },

  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('search', filters.q);
      if (filters.brand && filters.brand.length > 0) params.append('brand', filters.brand[0]); // simplistic
      const catVal = (filters.sport && filters.sport.length > 0 && filters.sport[0]) || filters.category;
      if (catVal) params.append('category', catVal);
      if (filters.gender && filters.gender.length > 0) params.append('gender', filters.gender[0]);
      if (filters.size && filters.size.length > 0) params.append('size', filters.size[0]);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.promo) params.append('promo', 'true');
      if (filters.isNew) params.append('isNew', 'true');
      if (filters.sort) params.append('sort', filters.sort);
      
      let data;
      if (filters.purchased) {
        const res = await axiosInstance.get('/products/user/purchased');
        data = res.data;
      } else {
        const res = await axiosInstance.get(`/products?${params.toString()}`);
        data = res.data;
      }
      
      // Calculate facets dynamically
      const dynamicFacets = { brand: {}, gender: {}, sport: {}, color: {}, size: {} };
      data.forEach(p => {
        // Brand
        if (p.brand) {
          const bName = (p.brand.name || '').toLowerCase().trim();
          const bSlug = (p.brand.slug || '').toLowerCase().trim();
          if (bName) dynamicFacets.brand[bName] = (dynamicFacets.brand[bName] || 0) + 1;
          if (bSlug && bSlug !== bName) dynamicFacets.brand[bSlug] = (dynamicFacets.brand[bSlug] || 0) + 1;
        }
        // Sport (category)
        if (p.category?.slug) {
          const s = p.category.slug.toLowerCase();
          dynamicFacets.sport[s] = (dynamicFacets.sport[s] || 0) + 1;
        }
        // Gender
        if (p.gender) {
          const g = p.gender.toLowerCase();
          dynamicFacets.gender[g] = (dynamicFacets.gender[g] || 0) + 1;
        }
        // Size
        if (p.variants) {
          const uniqueSizes = new Set(p.variants.filter(v => v.stock > 0).map(v => v.size));
          uniqueSizes.forEach(size => {
             dynamicFacets.size[size] = (dynamicFacets.size[size] || 0) + 1;
          });
        }
      });

      return {
        items: data.map(p => {
          const { price, oldPrice } = resolvePrices(p);
          return {
            id: p._id,
            slug: p.sku,
            name: p.name,
            brand: p.brand?.name || 'Unknown',
            sport: p.category?.slug || 'lifestyle',
            price,
            oldPrice,
            isNew: p.isNewProduct,
            rating: p.averageRating,
            likes: p.reviewsCount,
            image: p.variants?.[0]?.images?.[0] || '',
            hoverImage: p.variants?.[0]?.images?.[1] || p.variants?.[0]?.images?.[0] || '',
            variants: {
              stock: p.totalStock,
              sizeEU: p.variants ? [...new Set(p.variants.map(v => v.size))] : [],
              color: p.variants?.[0]?.color || 'Noir'
            },
            rawVariants: (p.variants || []).map(v => ({
              id: v._id,
              color: v.color,
              colorCode: v.colorCode,
              size: v.size,
              stock: v.stock,
              images: Array.isArray(v.images) ? v.images : (v.images ? [v.images] : []),
              sku: v.sku
            })),
            createdAt: p.createdAt
          };
        }),
        page: 1,
        limit: 50,
        total: data.length,
        pages: 1,
        facets: dynamicFacets
      };
    } catch (error) {
      throw error;
    }
  },

  getProductBySlug: async (slug) => {
    try {
      const { data } = await axiosInstance.get(`/products?search=${slug}`);
      const p = data.find(item => item.sku === slug) || data[0];
      
      if (!p) throw { success: false, code: 'NOT_FOUND', message: 'Product not found' };

      const { price, oldPrice } = resolvePrices(p);

      return {
        id: p._id,
        slug: p.sku,
        sku: p.sku || '',
        name: p.name,
        brand: p.brand?.name || 'Unknown',
        sport: p.category?.slug || 'lifestyle',
        categoryName: p.category?.name || p.category?.slug || 'lifestyle',
        gender: p.gender || 'unisex',
        totalStock: p.totalStock ?? (p.variants ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0),
        price,
        oldPrice,
        isNew: p.isNewProduct,
        rating: p.averageRating,
        description: p.description || { fr: '', ar: '' },
        images: p.variants?.[0]?.images || [],
        colorVariants: p.variants ? p.variants.reduce((acc, v) => {
          // Group by color
          const existing = acc.find(c => c.color === v.color);
          if (existing) {
            if (v.stock > 0) existing.sizes.push(v.size);
            existing.stock += v.stock;
            existing.sizeDetails.push({ size: v.size, stock: v.stock });
          } else {
            acc.push({
              color: v.color,
              image: v.images?.[0] || '',
              images: v.images || [],
              stock: v.stock,
              sizes: v.stock > 0 ? [v.size] : [],
              sizeDetails: [{ size: v.size, stock: v.stock }]
            });
          }
          return acc;
        }, []) : []
      };
    } catch (error) {
      throw error;
    }
  },

  getRelatedProducts: async (id) => {
    return [];
  },

  getReviews: async (productId, page = 1) => {
    // Already handled separately in ProductReviews component
    return { items: [], total: 0, average: 0, histogram: {} };
  }
};
