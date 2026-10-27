import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { shopApi } from '../../api/shopApi';
import ProductGallery from '../../components/product/ProductGallery';
import ProductInfo from '../../components/product/ProductInfo';
import ProductTabs from '../../components/product/ProductTabs';
import RelatedProducts from '../../components/product/RelatedProducts';
import { useLanguage } from '../../context/LanguageContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { lng } = useLanguage();
  const isRTL = lng === 'ar';

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => shopApi.getProductBySlug(slug),
    retry: false
  });

  const [selectedColor, setSelectedColor] = useState(product?.colorVariants?.[0]?.color || product?.color || '');

  // Update selected color if product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colorVariants?.[0]?.color || product.color || '');
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[55%] h-[500px] bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div className="w-full lg:w-[45%] space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t('Produit introuvable')}</h1>
        <p className="text-gray-500 mb-8">{error?.message || t('Ce produit n\'existe pas.')}</p>
        <Link to="/shop" className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-medium transition-transform hover:scale-105">
          {t('Retour à la boutique')}
        </Link>
      </div>
    );
  }

  const productName = lng === 'ar' ? product.name.ar : product.name.fr;
  const productDesc = lng === 'ar' ? product.description.ar : product.description.fr;

  // JSON-LD Schema
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "image": product.images,
    "description": productDesc,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "DZD",
      "price": product.price,
      "availability": (product.colorVariants && product.colorVariants.some(v => v.stock > 0)) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.likes || 1
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Helmet>
        <title>{`${productName} - ${product.brand} | FootLocker DZ`}</title>
        <meta name="description" content={productDesc} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Breadcrumb / Back */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <Link to="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-black dark:hover:text-white group">
          <ArrowLeft className={`w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180 ml-2 mr-0 group-hover:translate-x-1 group-hover:-translate-x-0' : ''}`} />
          {t('Retour')}
        </Link>
      </div>

      <main className="container mx-auto px-4 pb-16 max-w-7xl">
        {/* Main Product Area (55/45 split) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
          <div className="w-full lg:w-[55%]">
            <ProductGallery product={product} selectedColor={selectedColor} />
          </div>
          <div className="w-full lg:w-[45%]">
            <ProductInfo product={product} selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
          </div>
        </div>

        {/* Tabs System */}
        <div className="mb-16">
          <ProductTabs product={product} />
        </div>

        {/* Related Products */}
        <div className="space-y-16">
          <RelatedProducts productId={product.id} />
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
