import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BrandLogo from '../brands/BrandLogo';
import { shopApi } from '../../api/shopApi';

export default function BrandRibbon() {
  const { data: dbBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: shopApi.getBrands,
    staleTime: 0
  });

  const brands = useMemo(() => {
    if (!Array.isArray(dbBrands) || dbBrands.length === 0) return [];
    return dbBrands
      .filter((b) => b && b.name)
      .map((b) => ({
        name: b.name,
        slug: (b.slug || b.name).toLowerCase().trim().replace(/\s+/g, '-')
      }));
  }, [dbBrands]);

  if (!brands.length) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-900 py-10 border-y border-gray-100 dark:border-gray-800 overflow-hidden" dir="ltr">
      <div className="relative flex max-w-[100vw] overflow-hidden group">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...brands, ...brands, ...brands].map((brand, index) => (
            <Link
              key={index}
              to={`/shop?brand=${encodeURIComponent(brand.slug)}`}
              className="flex items-center justify-center w-28 md:w-32 h-16 mx-4 md:mx-6 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer"
              title={`Voir les produits ${brand.name}`}
            >
              <BrandLogo
                slug={brand.slug}
                brandName={brand.name}
                className="max-h-10 md:max-h-12 max-w-full object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
