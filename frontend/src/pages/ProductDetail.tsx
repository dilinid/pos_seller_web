import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { REVIEWS } from '../data/reviews';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import { ImageGallery } from '../components/marketplace/ImageGallery';
import { SellerCard } from '../components/marketplace/SellerCard';
import { ReviewSection } from '../components/marketplace/ReviewSection';
import { CartDrawer } from '../components/marketplace/CartDrawer';
import { useAuthStore } from '../stores/auth.store';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { StarRating } from '../components/ui/StarRating';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isAuthenticated = !!useAuthStore((s) => s.userSession);

  const products = useMarketplaceStore((s) => s.products);
  const sellers = useMarketplaceStore((s) => s.sellers);
  const categories = useMarketplaceStore((s) => s.categories);
  const addToCart = useMarketplaceStore((s) => s.addToCart);
  const setDirectBuyItem = useMarketplaceStore((s) => s.setDirectBuyItem);
  const cart = useMarketplaceStore((s) => s.cart);
  const allReviews = useMarketplaceStore((s) => s.allReviews);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);

  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const seller = useMemo(() => sellers.find((s) => s.id === product?.sellerId), [sellers, product?.sellerId]);
  const category = useMemo(
    () => categories.find((c) => c.id === product?.subCategoryId),
    [categories, product?.subCategoryId]
  );
  const reviews = useMemo(() => {
    const staticReviews = REVIEWS.filter((r) => r.productId === productId);
    const userReviews = allReviews
      .filter((r) => r.targetType === 'product' && r.targetId === productId && !r.autoRated)
      .map((r) => ({
        id: r.id,
        productId: r.targetId,
        userName: r.reviewerName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      }));
    return [...staticReviews, ...userReviews];
  }, [productId, allReviews]);

  const cartItem = cart.find((item) => item.product.id === productId);
  const cartQuantity = cartItem?.quantity ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setIsCartOpen(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    setDirectBuyItem({ product, quantity });
    navigate(isAuthenticated ? '/checkout' : '/login');
  };

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>Product not found</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ borderRadius: '24px' }}>
              <ArrowLeft size={16} /> Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarMenu />

        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <span>{category?.name || 'Category'}</span>
              <span>›</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{product.name}</span>
            </div>

            {/* Product Detail */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '32px',
              alignItems: 'start',
            }} className="product-detail-grid">
              {/* Left: Image Gallery */}
              <div className="premium-card" style={{ padding: '20px' }}>
                <ImageGallery images={product.images} productName={product.name} />
              </div>

              {/* Right: Product Info */}
              <div className="premium-card" style={{ padding: '28px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {product.subCategoryId}
                  </span>
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px' }}>
                  {product.name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <StarRating rating={product.rating} reviewCount={product.reviewCount} showValue size="md" />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <PriceDisplay price={product.price} mrp={product.mrp} size="lg" showSavings showDiscountBadge />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    / {product.unit}
                  </span>
                </div>

                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginTop: '16px',
                  marginBottom: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                }}>
                  {product.description}
                </p>

                {/* Quantity Selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Quantity
                  </label>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--bg-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{
                      width: '48px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                    }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--bg-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {cartQuantity > 0 && (
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Check size={14} />
                    {cartQuantity} in cart — <strong>${(product.price * cartQuantity).toFixed(2)}</strong>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      borderRadius: '24px',
                      padding: '14px 20px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <ShoppingCart size={18} />
                    {addedToCart ? 'Added!' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '24px',
                      padding: '14px 20px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            {seller && <SellerCard seller={seller} />}

            {/* Features */}
            {product.features.length > 0 && (
              <div className="premium-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Features</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.features.map((feat, idx) => (
                    <span key={idx} style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <Check size={14} />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="premium-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Specifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {Object.entries(product.specifications).map(([key, value], idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      padding: '10px 0',
                      borderBottom: idx < Object.keys(product.specifications).length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}>
                      <span style={{ width: '180px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                        {key}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection reviews={reviews} rating={product.rating} reviewCount={product.reviewCount} />

            {/* Back Link */}
            <Link to="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginTop: '4px',
            }}>
              <ArrowLeft size={16} />
              Back to Marketplace
            </Link>
          </div>
        </main>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;
