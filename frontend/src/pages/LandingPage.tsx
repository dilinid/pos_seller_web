import React, { useState, useMemo } from 'react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import { CategoryBar } from '../components/marketplace/CategoryBar';
import { ProductGrid } from '../components/marketplace/ProductGrid';
import { CartDrawer } from '../components/marketplace/CartDrawer';
import { HeroBanner } from '../components/marketplace/HeroBanner';
import { PromoPopup } from '../components/marketplace/PromoPopup';

const LandingPage: React.FC = () => {
  const cart = useMarketplaceStore((s) => s.cart);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);
  const products = useMarketplaceStore((s) => s.products);
  const productsLoading = useMarketplaceStore((s) => s.productsLoading);
  const productsError = useMarketplaceStore((s) => s.productsError);
  const selectedSubCategory = useMarketplaceStore((s) => s.selectedSubCategory);

  const filteredProducts = useMemo(() =>
    products.filter((product) => {
      const matchesSubCategory =
        !selectedSubCategory ||
        product.categoryId === selectedSubCategory ||
        product.subCategoryId === selectedSubCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
      return matchesSubCategory && matchesSearch;
    }),
    [products, selectedSubCategory, searchQuery]
  );

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Navbar
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div
        style={{
          display: 'flex',
          flex: 1,
          position: 'relative',
        }}
      >
        <SidebarMenu />

        <main
          style={{
            flex: 1,
            overflowX: 'hidden',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            }}
          >
            <HeroBanner />

            <CategoryBar />

            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {productsError && !productsLoading && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}
                >
                  Couldn&apos;t load the latest products ({productsError}). Showing sample data instead.
                </div>
              )}
              <ProductGrid products={filteredProducts} cart={cart} loading={productsLoading} />
            </section>
          </div>
        </main>
      </div>

      <PromoPopup />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
