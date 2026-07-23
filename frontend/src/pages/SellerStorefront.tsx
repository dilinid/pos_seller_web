import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { ProductGrid } from '../components/marketplace/ProductGrid';
import { StoreHeader } from '../components/marketplace/StoreHeader';
import { StoreTabs } from '../components/marketplace/StoreTabs';
import { StoreAbout } from '../components/marketplace/StoreAbout';
import { SellerReviewDisplay } from '../components/marketplace/SellerReviewDisplay';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';

const SkeletonBlock: React.FC<{ width?: string; height?: string; borderRadius?: string }> = ({
  width = '100%', height = '16px', borderRadius = '8px',
}) => (
  <div className="skeleton-block" style={{ width, height, borderRadius }} />
);

const SellerStorefront: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();

  const sellers = useMarketplaceStore((s) => s.sellers);
  const products = useMarketplaceStore((s) => s.products);
  const cart = useMarketplaceStore((s) => s.cart);
  const allReviews = useMarketplaceStore((s) => s.allReviews);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);

  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');

  const seller = useMemo(
    () => sellers.find((s) => s.id === sellerId),
    [sellers, sellerId],
  );

  const sellerProducts = useMemo(
    () => products.filter((p) => p.sellerId === sellerId),
    [products, sellerId],
  );

  const sellerReviews = useMemo(
    () => allReviews.filter((r) => r.targetType === 'seller' && r.targetId === sellerId && !r.autoRated),
    [allReviews, sellerId],
  );

  const dynamicRating = useMemo(() => {
    if (sellerReviews.length === 0) return undefined;
    return Math.round(sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length * 10) / 10;
  }, [sellerReviews]);

  if (!seller) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div style={{ display: 'flex', flex: 1 }}>
          <SidebarMenu />
          <main style={{ flex: 1, overflowX: 'hidden' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
              <div style={{ padding: '80px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Seller not found
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  The seller you're looking for doesn't exist or has been removed.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', borderRadius: '24px', fontSize: '0.85rem' }}
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              productCount={sellerProducts.length}
              onChange={setActiveTab}
            />

            {activeTab === 'products' ? (
              <ProductGrid products={sellerProducts} cart={cart} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <StoreAbout seller={seller} />
                <SellerReviewDisplay seller={seller} reviews={allReviews} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerStorefront;
