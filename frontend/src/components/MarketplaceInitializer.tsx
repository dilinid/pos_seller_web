import { useEffect } from 'react';
import { useMarketplaceStore } from '../stores/marketplace.store';

/** Loads live marketplace data (products, categories) once on app start. */
export function MarketplaceInitializer() {
  const loadProducts = useMarketplaceStore((s) => s.loadProducts);
  const loadCategories = useMarketplaceStore((s) => s.loadCategories);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  return null;
}
