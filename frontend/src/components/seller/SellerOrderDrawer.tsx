import { useEffect, useState, useRef } from 'react';
import { X, MapPin, Phone, Mail, ClipboardList, Star, Store, Truck } from 'lucide-react';
import type { Order, OrderStatus, UserReview, ReviewPeriod } from '../../types/marketplace.type';
import { OrderStatusBadge } from '../marketplace/OrderStatusBadge';
import { StarRating } from '../ui/StarRating';
import { ProductImage } from '../ui/ProductImage';
import { SellerOrderTimeline } from './SellerOrderTimeline';
import { SellerOrderStatusActions } from './SellerOrderStatusActions';
import { SellerRatingForm } from '../marketplace/SellerRatingForm';
import { MutualReviewStatus } from '../marketplace/MutualReviewStatus';
import { formatCurrency } from '../../utils/currency';

interface SellerOrderDrawerProps {
  order: Order;
  sellerId: string;
  onClose: () => void;
  onUpdateItemStatus: (orderId: string, productId: string, status: OrderStatus, tracking?: { carrier?: string; trackingNumber?: string }) => void;
  onUpdateNote: (orderId: string, productId: string, note: string) => void;
  allReviews?: UserReview[];
  reviewPeriods?: ReviewPeriod[];
  sellerUserId?: string;
  sellerUserName?: string;
  onSubmitBuyerReview?: (review: UserReview) => void;
}

export const SellerOrderDrawer: React.FC<SellerOrderDrawerProps> = ({
  order, sellerId, onClose, onUpdateItemStatus, onUpdateNote,
  allReviews = [], reviewPeriods = [], sellerUserId, sellerUserName, onSubmitBuyerReview,
}) => {
  const sellerItems = order.items.filter((i) => i.sellerId === sellerId);
  const mainItem = sellerItems[0];
  const [notes, setNotes] = useState(mainItem?.sellerNotes ?? '');
  const [noteSaved, setNoteSaved] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (drawerRef.current) drawerRef.current.style.transform = 'translateX(0)';
    });
  }, []);

  const sellerSubtotal = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const sellerDeliveryFee = sellerItems[0]?.deliveryFee ?? 0;
  const sellerTotal = sellerSubtotal + sellerDeliveryFee;

  const handleStatusUpdate = (newStatus: OrderStatus, tracking?: { carrier?: string; trackingNumber?: string }) => {
    for (const item of sellerItems) {
      onUpdateItemStatus(order.id, item.productId, newStatus, tracking);
    }
  };

  const handleSaveNote = () => {
    for (const item of sellerItems) {
      onUpdateNote(order.id, item.productId, notes);
    }
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const orderLevelStatus = (): OrderStatus => {
    if (sellerItems.every((i) => i.status === 'cancelled')) return 'cancelled';
    if (sellerItems.every((i) => i.status === 'delivered' || i.status === 'completed')) return 'delivered';
    if (sellerItems.some((i) => i.status === 'shipped')) return 'shipped';
    if (sellerItems.some((i) => i.status === 'processing')) return 'processing';
    if (sellerItems.some((i) => i.status === 'confirmed')) return 'confirmed';
    return 'pending';
  };

  const deliveryMethod = mainItem?.deliveryMethod ?? 'delivery';

  return (
    <>
      <div
        className="pos-drawer-overlay"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />
      <div
        ref={drawerRef}
        className="pos-drawer"
        style={{
          transform: 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '520px', maxWidth: '100vw',
        }}
      >
        <div className="pos-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.id}</span>
            <OrderStatusBadge status={orderLevelStatus()} deliveryMethod={deliveryMethod} />
          </div>
          <button onClick={onClose} className="pos-drawer-close">
            <X size={20} />
          </button>
        </div>

        <div className="pos-drawer-body">
          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Buyer Information</div>
            <div className="pos-info-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="pos-info-label">Name</span>
                <span className="pos-info-value">{order.buyerName}</span>
              </div>
              {order.buyerEmail && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="pos-info-label">
                    <Mail size={12} style={{ marginRight: '4px' }} />
                    Email
                  </span>
                  <span className="pos-info-value">{order.buyerEmail}</span>
                </div>
              )}
              {order.buyerPhone && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="pos-info-label">
                    <Phone size={12} style={{ marginRight: '4px' }} />
                    Phone
                  </span>
                  <span className="pos-info-value">{order.buyerPhone}</span>
                </div>
              )}
              {deliveryMethod === 'delivery' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="pos-info-label">
                    <MapPin size={12} style={{ marginRight: '4px' }} />
                    Delivery Address
                  </span>
                  <span className="pos-info-value">{order.deliveryAddress}</span>
                </div>
              )}
              {deliveryMethod === 'pickup' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="pos-info-label">
                    <Store size={12} style={{ marginRight: '4px' }} />
                    Pickup Location
                  </span>
                  <span className="pos-info-value">Customer will pick up from store</span>
                </div>
              )}
              {order.orderNotes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="pos-info-label">Order Notes</span>
                  <span className="pos-info-value" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    “{order.orderNotes}”
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Items</div>
            {sellerItems.map((item, idx) => (
              <div
                key={item.productId}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 0', borderTop: idx > 0 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                <ProductImage image={item.productImage} alt={item.productName} size="1.6rem" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {item.unit} × {item.quantity}
                    {deliveryMethod === 'delivery' && item.trackingNumber && (
                      <span style={{ marginLeft: '8px', color: '#06b6d4' }}>
                        <Truck size={11} style={{ marginRight: '2px', verticalAlign: 'middle' }} />
                        {item.trackingCarrier}: {item.trackingNumber}
                      </span>
                    )}
                    {deliveryMethod === 'delivery' && item.deliveryContactPhone && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                        <Phone size={11} style={{ marginRight: '2px', verticalAlign: 'middle' }} />
                        {item.deliveryContactPhone}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                  {item.mrp != null && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatCurrency(item.mrp)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div style={{
              marginTop: '12px', padding: '12px 0 0', borderTop: '1px solid var(--border-color)',
              display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>{formatCurrency(sellerSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                <span>{deliveryMethod === 'pickup' ? '—' : formatCurrency(sellerDeliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                <span>Your Total</span>
                <span>{formatCurrency(sellerTotal)}</span>
              </div>
            </div>
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Status Timeline</div>
            <SellerOrderTimeline
              status={orderLevelStatus()}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
              deliveryMethod={deliveryMethod}
            />
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">
              {deliveryMethod === 'delivery' ? 'Update Status & Tracking' : 'Update Status'}
            </div>
            <SellerOrderStatusActions
              status={orderLevelStatus()}
              deliveryMethod={deliveryMethod}
              trackingCarrier={mainItem?.trackingCarrier}
              trackingNumber={mainItem?.trackingNumber}
              trackingPhone={mainItem?.deliveryContactPhone}
              onUpdateStatus={handleStatusUpdate}
            />
          </div>

          {(orderLevelStatus() === 'delivered') && sellerUserId && onSubmitBuyerReview && (
            <div className="pos-drawer-section">
              <div className="pos-drawer-section-title">Rate Buyer</div>
              {(() => {
                const existingBuyerReview = allReviews.find(
                  (r) => r.targetType === 'buyer' && r.targetId === order.buyerName && r.orderId === order.id
                );
                const reviewPeriod = reviewPeriods.find(
                  (rp) => rp.orderId === order.id && rp.sellerId === sellerId
                );

                if (existingBuyerReview) {
                  return (
                    <div style={{
                      padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)',
                      fontSize: '0.82rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span>Your rating for</span>
                        <strong>{order.buyerName}</strong>:
                        <StarRating rating={existingBuyerReview.rating} size="sm" />
                      </div>
                      {existingBuyerReview.comment && (
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                          {existingBuyerReview.comment}
                        </p>
                      )}
                    </div>
                  );
                }

                if (reviewPeriod && !reviewPeriod.sellerReviewedBuyer) {
                  return (
                    <SellerRatingForm
                      orderId={order.id}
                      buyerId={order.buyerName}
                      buyerName={order.buyerName}
                      reviewerId={sellerUserId}
                      reviewerName={sellerUserName ?? 'Seller'}
                      onSubmit={onSubmitBuyerReview}
                    />
                  );
                }

                return (
                  <div style={{
                    padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)',
                    fontSize: '0.82rem', color: 'var(--text-muted)',
                  }}>
                    <Star size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Rate this buyer once the order is delivered.
                  </div>
                );
              })()}
              {(() => {
                const rp = reviewPeriods.find((p) => p.orderId === order.id && p.sellerId === sellerId);
                if (!rp) return null;
                return (
                  <div style={{ marginTop: '8px' }}>
                    <MutualReviewStatus period={rp} buyerName={order.buyerName} sellerName={sellerUserName ?? 'Seller'} />
                  </div>
                );
              })()}
            </div>
          )}

          <div className="pos-drawer-section" style={{ borderBottom: 'none' }}>
            <div className="pos-drawer-section-title">Seller Notes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder="Add internal notes about this order..."
                rows={3}
                style={{
                  fontSize: '0.82rem', padding: '10px', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.5,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSaveNote}
                  className="btn btn-primary"
                  style={{ padding: '7px 18px', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  {noteSaved ? 'Saved!' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
