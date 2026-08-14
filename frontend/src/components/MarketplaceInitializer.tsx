import { useEffect } from 'react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useStoreStore } from '../stores/store.store';

/** Loads live marketplace data (products, categories, store identity) once on app start. */
export function MarketplaceInitializer() {
  const loadProducts = useMarketplaceStore((s) => s.loadProducts);
  const loadCategories = useMarketplaceStore((s) => s.loadCategories);
  const loadStoreProfile = useStoreStore((s) => s.loadStoreProfile);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadStoreProfile();
  }, [loadProducts, loadCategories, loadStoreProfile]);

  return null;
}
