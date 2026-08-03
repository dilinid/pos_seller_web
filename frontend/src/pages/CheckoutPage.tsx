import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, ShoppingBag } from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useSellerStore } from '../stores/seller.store';
import { calculateDeliveryFee } from '../utils/delivery.utils';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import { CheckoutDeliveryAddress } from '../components/marketplace/CheckoutDeliveryAddress';
import { CheckoutSellerGroup } from '../components/marketplace/CheckoutSellerGroup';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  const cart = useMarketplaceStore((s) => s.cart);
  const directBuyItem = useMarketplaceStore((s) => s.directBuyItem);
  const profile = useSellerStore((s) => s.profile);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);
  const deliveryDistrict = useMarketplaceStore((s) => s.deliveryDistrict);
  const deliveryMethod = useMarketplaceStore((s) => s.deliveryMethod);
  const orderNotes = useMarketplaceStore((s) => s.orderNotes);
  const setDeliveryMethod = useMarketplaceStore((s) => s.setDeliveryMethod);
  const setOrderNotes = useMarketplaceStore((s) => s.setOrderNotes);

  const checkedItems = useMemo(() => {
    if (directBuyItem)
      return [{ product: directBuyItem.product, quantity: directBuyItem.quantity, checked: true as const }];
    return cart.filter((item) => item.checked);
  }, [cart, directBuyItem]);

  useEffect(() => {
    if (checkedItems.length === 0) {
      navigate('/', { replace: true });
    }
  }, [checkedItems.length, navigate]);

  const method = deliveryMethod ?? (profile.deliveryAvailable ? 'delivery' : 'pickup');

  const orderSummary = useMemo(() => {
    const subtotal = checkedItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const fee = calculateDeliveryFee(
      profile,
      method === 'delivery' ? deliveryDistrict : null,
      checkedItems.map((i) => ({ productId: i.product.id, quantity: i.quantity, weight: i.product.weight, volume: i.product.volume })),
      subtotal,
    );
    return { subtotal, fee, total: subtotal + fee };
  }, [checkedItems, profile, method, deliveryDistrict]);

  const grandTotal = orderSummary.total;

  const allItemsCount = checkedItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarMenu />

        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Checkout</h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                ({allItemsCount} {allItemsCount === 1 ? 'item' : 'items'})
              </span>
            </div>

            <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <CheckoutDeliveryAddress />

                {checkedItems.length > 0 && (
                  <CheckoutSellerGroup
                    seller={profile}
                    items={checkedItems}
                    deliveryMethod={method}
                    districtId={deliveryDistrict}
                    onDeliveryMethodChange={setDeliveryMethod}
                  />
                )}

                <div className="premium-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <FileText size={16} color="var(--text-muted)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Order Notes (Optional)</h4>
                  </div>
                  <textarea
                    className="form-input"
                    placeholder="Special instructions for the seller..."
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    style={{ resize: 'vertical', minHeight: '60px' }}
                  />
                </div>
              </div>

              <div style={{ position: 'sticky', top: '90px' }}>
                <div className="premium-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>Order Summary</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span>Subtotal</span>
                      <span>${orderSummary.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: orderSummary.fee === 0 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: orderSummary.fee === 0 ? 600 : 400 }}>
                      <span>Delivery</span>
                      <span>{orderSummary.fee === 0 ? 'Free' : `$${orderSummary.fee.toFixed(2)}`}</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--primary)',
                  }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Grand Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/checkout/payment')}
                    className="btn btn-primary"
                    style={{
                      width: '100%', borderRadius: '24px', padding: '14px',
                      marginTop: '18px', fontSize: '1rem',
                    }}
                  >
                    Continue to Payment <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CheckoutPage;
