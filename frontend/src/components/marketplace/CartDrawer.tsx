import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, Trash2, CheckSquare, Square } from 'lucide-react';
import { useMarketplaceStore } from '../../stores/marketplace.store';
import { useAuthStore } from '../../stores/auth.store';
import { SELLERS } from '../../data/sellers';
import { SellerBadge } from './SellerBadge';
import { PriceDisplay } from '../ui/PriceDisplay';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!useAuthStore((s) => s.userSession);
  const cart = useMarketplaceStore((s) => s.cart);
  const addToCart = useMarketplaceStore((s) => s.addToCart);
  const removeFromCart = useMarketplaceStore((s) => s.removeFromCart);
  const updateQuantity = useMarketplaceStore((s) => s.updateQuantity);
  const toggleCartItem = useMarketplaceStore((s) => s.toggleCartItem);
  const toggleSellerItems = useMarketplaceStore((s) => s.toggleSellerItems);

  const checkedCart = cart.filter((item) => item.checked);
  const checkedCount = checkedCart.reduce((sum, item) => sum + item.quantity, 0);
  const checkedTotal = checkedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const sellerGroups = useMemo(() => {
    const groups: { sellerId: string; items: typeof cart }[] = [];
    const map = new Map<string, typeof cart>();
    for (const item of cart) {
      const existing = map.get(item.product.sellerId);
      if (existing) {
        existing.push(item);
      } else {
        map.set(item.product.sellerId, [item]);
      }
    }
    for (const [sellerId, items] of map) {
      groups.push({ sellerId, items });
    }
    return groups;
  }, [cart]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '100%',
        maxWidth: '420px',
        height: '100vh',
        background: '#ffffff',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <div
        style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.2rem',
            fontFamily: 'var(--font-display)',
          }}
        >
          <ShoppingCart size={20} color="var(--primary)" />
          Your Cart ({cart.reduce((t, i) => t + i.quantity, 0)})
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {cart.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            color: 'var(--text-secondary)',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '3rem' }}>🛒</span>
          <h4>Your cart is empty</h4>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Browse our marketplace and add items to get started.
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div
            className="drawer-scroll"
            style={{ flex: 1, minHeight: 0, padding: '20px' }}
          >
            {sellerGroups.map(({ sellerId, items }) => {
              const seller = SELLERS.find((s) => s.id === sellerId);
              const sellerAllChecked = items.every((i) => i.checked);
              const sellerSubtotal = items.reduce(
                (sum, i) => sum + i.product.price * i.quantity, 0
              );

              return (
                <div
                    key={sellerId}
                    style={{
                      marginBottom: '20px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div
                        onClick={() => toggleSellerItems(sellerId)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {sellerAllChecked ? (
                          <CheckSquare size={18} color="var(--primary)" />
                        ) : (
                          <Square size={18} color="var(--text-muted)" />
                        )}
                      </div>
                      {seller ? (
                        <SellerBadge seller={seller} size="md" to={`/store/${seller.id}`} />
                      ) : (
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                          Unknown Seller
                        </span>
                      )}
                    </div>

                  <div style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 0',
                          opacity: item.checked ? 1 : 0.5,
                        }}
                      >
                        <div
                          onClick={() => toggleCartItem(item.product.id)}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {item.checked ? (
                            <CheckSquare size={16} color="var(--primary)" />
                          ) : (
                            <Square size={16} color="var(--text-muted)" />
                          )}
                        </div>

                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>
                          {item.product.image}
                        </span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.product.name}
                          </div>
                          <PriceDisplay price={item.product.price} mrp={item.product.mrp} size="sm" />
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: 'var(--bg-secondary)',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Minus size={9} />
                          </button>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              width: '20px',
                              textAlign: 'center',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.product)}
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: 'var(--bg-secondary)',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Plus size={9} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--danger)',
                            padding: '2px',
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      paddingLeft: '26px',
                      marginTop: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textAlign: 'right',
                    }}
                  >
                    Subtotal: ${sellerSubtotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              <span>
                Selected Total ({checkedCount} {checkedCount === 1 ? 'item' : 'items'})
              </span>
              <span style={{ color: 'var(--primary)' }}>
                ${checkedTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
              disabled={checkedCount === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                borderRadius: '24px',
                padding: '14px',
                opacity: checkedCount === 0 ? 0.5 : 1,
                cursor: checkedCount === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {checkedCount === 0
                ? 'Select items to checkout'
                : `Checkout Selected (${checkedCount})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
