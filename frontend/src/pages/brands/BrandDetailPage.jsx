import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

/**
 * Automatically redirects /brands/:brandSlug to /shop?brand=:brandSlug
 * ensuring all brand links seamlessly filter the shop page.
 */
export default function BrandDetailPage() {
  const { brandSlug } = useParams();
  return <Navigate to={`/shop?brand=${encodeURIComponent(brandSlug || '')}`} replace />;
}
