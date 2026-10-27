import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { shopApi } from '../../api/shopApi';
import ProductCard from './ProductCard';

const RelatedProducts = ({ productId }) => {
  const { t } = useTranslation();
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ['related', productId],
    queryFn: () => shopApi.getRelatedProducts(productId)
  });

  if (isLoading || !relatedProducts?.length) return null;

  return (
    <section>
      <h3 className="text-2xl font-bold mb-8">{t('Vous aimerez aussi')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {relatedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
