import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const rawSport = [
      ...searchParams.getAll('sport'),
      ...searchParams.getAll('category')
    ];
    const sport = Array.from(
      new Set(rawSport.map((s) => String(s).toLowerCase().trim()))
    ).filter(Boolean);

    return {
      brand: searchParams.getAll('brand'),
      gender: searchParams.getAll('gender'),
      sport,
      size: searchParams.getAll('size'),
      color: searchParams.getAll('color'),
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      promo: searchParams.get('promo') === 'true',
      isNew: searchParams.get('isNew') === 'true',
      inStock: searchParams.get('inStock') === 'true',
      sort: searchParams.get('sort') || 'relevance',
      page: parseInt(searchParams.get('page') || '1', 10),
      q: searchParams.get('q') || ''
    };
  }, [searchParams]);

  const setFilter = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Reset page to 1 on any filter change (except pagination itself)
    if (key !== 'page' && key !== 'sort') {
      newParams.set('page', '1');
    }

    if (Array.isArray(value)) {
      newParams.delete(key);
      if (key === 'sport') newParams.delete('category');
      value.forEach(v => newParams.append(key, v));
    } else if (value === null || value === '' || value === false) {
      newParams.delete(key);
      if (key === 'sport') newParams.delete('category');
    } else {
      newParams.set(key, value);
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const toggleFilterArray = useCallback((key, value) => {
    const current = key === 'sport'
      ? [...searchParams.getAll('sport'), ...searchParams.getAll('category')]
      : searchParams.getAll(key);
    const valNorm = String(value).toLowerCase().replace(/\s+/g, '-');
    const exists = current.some(v => String(v).toLowerCase().replace(/\s+/g, '-') === valNorm);
    const updated = exists 
      ? current.filter(v => String(v).toLowerCase().replace(/\s+/g, '-') !== valNorm)
      : [...current, value];
    
    setFilter(key, updated);
  }, [searchParams, setFilter]);

  const resetFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    if (searchParams.get('q')) {
      newParams.set('q', searchParams.get('q'));
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return {
    filters,
    setFilter,
    toggleFilterArray,
    resetFilters,
  };
}
