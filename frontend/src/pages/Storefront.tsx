import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useStoreStore } from '../stores/store.store';
import { ProductGrid } from '../components/marketplace/ProductGrid';
import { StoreHeader } from '../components/marketplace/StoreHeader';
import { StoreTabs } from '../components/marketplace/StoreTabs';
import { StoreAbout } from '../components/marketplace/StoreAbout';
import { StoreReviewDisplay } from '../components/marketplace/StoreReviewDisplay';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';

const Storefront: React.FC = () => {
  const navigate = useNavigate();

  const seller = useStoreStore((s) => s.profile);
  const products = useMarketplaceStore((s) => s.products);
  const cart = useMarketplaceStore((s) => s.cart);
  const allReviews = useMarketplaceStore((s) => s.allReviews);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);

  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');

  const sellerReviews = useMemo(
    () => allReviews.filter((r) => r.targetType === 'seller' && r.targetId === seller.id && !r.autoRated),
    [allReviews, seller.id],
  );

  const dynamicRating = useMemo(() => {
    if (sellerReviews.length === 0) return undefined;
    return Math.round(sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length * 10) / 10;
  }, [sellerReviews]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div style={{ display: 'flex', flex: 1 }}>
        <SidebarMenu />

        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500,
                padding: '4px 0', alignSelf: 'flex-start',
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <StoreHeader seller={seller} dynamicRating={dynamicRating} dynamicReviewCount={sellerReviews.length > 0 ? sellerReviews.length : undefined} />

            <StoreTabs
              active={activeTab}
              productCount={products.length}
              onChange={setActiveTab}
            />

            {activeTab === 'products' ? (
              <ProductGrid products={products} cart={cart} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <StoreAbout seller={seller} />
                <StoreReviewDisplay seller={seller} reviews={allReviews} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Storefront;
