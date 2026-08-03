import { useState } from 'react';
import { Truck, MapPin, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { OrderItem, UserReview, ReviewPeriod } from '../../types/marketplace.type';
import type { SellerProfile } from '../../types/seller.type';
import { OrderStatusBadge } from './OrderStatusBadge';
import { SellerBadge } from './SellerBadge';
import { PriceDisplay } from '../ui/PriceDisplay';
import { StarRating } from '../ui/StarRating';
import { ProductImage } from '../ui/ProductImage';
import { SellerOrderStatus } from './SellerOrderStatus';
import { DeliveryTracker } from './DeliveryTracker';
import { ReviewForm } from './ReviewForm';
import { MutualReviewStatus } from './MutualReviewStatus';

interface OrderSellerGroupProps {
  seller: SellerProfile;
  items: OrderItem[];
  orderId: string;
  existingReviews: Map<string, UserReview>;
  onReviewSubmit: (review: UserReview) => void;
  reviewPeriod?: ReviewPeriod;
  userId: string;
  userName: string;
  onSellerReviewSubmit: (review: UserReview) => void;
  onStartReviewPeriod: (sellerId: string) => void;
}

export const OrderSellerGroup: React.FC<OrderSellerGroupProps> = ({
  seller, items, orderId, existingReviews, onReviewSubmit,
  reviewPeriod, userId, userName, onSellerReviewSubmit, onStartReviewPeriod,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);
  const [reviewingSeller, setReviewingSeller] = useState(false);
  const storeName = seller.storeName || 'Our Store';

  const deliveryMethod = items[0]?.deliveryMethod ?? 'delivery';
  const anyDelivered = items.some((i) => i.status === 'delivered' || i.status === 'completed');
  const allDelivered = items.every((i) => i.status === 'delivered' || i.status === 'completed');
  const allSameStatus = items.every((i) => i.status === items[0].status);
  const groupStatus = allSameStatus ? items[0].status : (anyDelivered ? 'processing' : items[0]?.status ?? 'pending');

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalDeliveryFee = items.reduce((s, i) => s + i.deliveryFee, 0);

  const periodActive = reviewPeriod && !reviewPeriod.closed;
  const canRateSeller = allDelivered && !reviewPeriod?.buyerReviewedSeller;
  const sellerAlreadyRated = existingReviews.get(`seller-${seller.id}`);

  return (
    <div className="premium-card" style={{ padding: '0', background: '#fff', overflow: 'hidden' }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <SellerBadge seller={seller} size="md" to="/store" />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              padding: '2px 8px', borderRadius: '6px',
              background: deliveryMethod === 'delivery' ? 'var(--primary-light)' : 'var(--bg-tertiary)',
              fontSize: '0.7rem', fontWeight: 600,
              color: deliveryMethod === 'delivery' ? 'var(--primary)' : 'var(--text-secondary)',
            }}>
              {deliveryMethod === 'delivery' ? <Truck size={11} /> : <MapPin size={11} />}
              {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
            </div>
          </div>

          <div className="seller-group-status" style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
            {periodActive && <MutualReviewStatus period={reviewPeriod} compact />}
            <SellerOrderStatus status={groupStatus} deliveryMethod={deliveryMethod} />
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', flexShrink: 0 }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px' }}>
          {anyDelivered && (
            <div style={{
              padding: '8px 12px', borderRadius: '8px', marginTop: '10px', marginBottom: '6px',
              background: '#f0fdf4', border: '1px solid #86efac',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.78rem', fontWeight: 600, color: '#166534',
            }}>
              <span style={{ fontSize: '0.9rem' }}>✍️</span>
              Review your items and rate {storeName} as a seller
            </div>
          )}
          {items.map((item, idx) => {
            const existingReview = existingReviews.get(item.productId);
            const canReview = (item.status === 'delivered' || item.status === 'completed') && !existingReview;
            const isReviewing = reviewingProduct === item.productId;

            return (
              <div key={`${item.productId}-${idx}`}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 0',
                  borderBottom: idx < items.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}>
                  <ProductImage image={item.productImage} alt={item.productName} size="1.2rem" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <PriceDisplay price={item.price} mrp={item.mrp} size="sm" /> × {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <OrderStatusBadge status={item.status} />
                  </div>
                </div>

                {canReview && (
                  <div style={{ padding: '0 0 12px 0' }}>
                    <button
                      onClick={() => setReviewingProduct(isReviewing ? null : item.productId)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '10px',
                        border: '1px solid #86efac', cursor: 'pointer',
                        background: '#f0fdf4', fontSize: '0.8rem',
                        fontFamily: 'var(--font-sans)', fontWeight: 600,
                        color: '#166534',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <Star size={14} fill="#166534" />
                      {isReviewing ? 'Close Review' : `Review ${item.productName}`}
                    </button>
                  </div>
                )}

                {isReviewing && (
                  <div style={{ padding: '0 0 12px 0' }}>
                    <ReviewForm
                      targetType="product"
                      targetId={item.productId}
                      orderItemProductId={item.productId}
                      orderId={orderId}
                      reviewerId={userId}
                      reviewerName={userName}
                      targetLabel={item.productName}
                      onSubmit={(review) => {
                        onReviewSubmit(review);
                        setReviewingProduct(null);
                        if (allDelivered && !reviewPeriod) {
                          onStartReviewPeriod(seller.id);
                        }
                      }}
                    />
                  </div>
                )}

                {existingReview && (
                  <div style={{ padding: '0 0 12px 0' }}>
                    <div style={{
                      padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-secondary)',
                      fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <StarRating rating={existingReview.rating} size="sm" />
                          {existingReview.title && (
                            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{existingReview.title}</span>
                          )}
                        </div>
                        {existingReview.comment && (
                          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{existingReview.comment}</p>
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        ✓ Reviewed
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {expanded && (
        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border-color)' }}>
          <DeliveryTracker
            status={groupStatus}
            sellerPickupAddress={seller.pickupAddress}
            estimatedDeliveryDays={seller.estimatedDeliveryDays}
          />

          {canRateSeller && !reviewingSeller && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => {
                  setReviewingSeller(true);
                  if (!reviewPeriod) onStartReviewPeriod(seller.id);
                }}
                style={{
                  width: '100%', padding: '10px', borderRadius: '12px',
                  border: '1px solid #86efac', cursor: 'pointer',
                  background: '#f0fdf4', fontSize: '0.82rem',
                  fontFamily: 'var(--font-sans)', fontWeight: 600,
                  color: '#166534',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'var(--transition-fast)',
                }}
              >
                <Star size={15} fill="#166534" />
                Rate {storeName} as a seller
              </button>
            </div>
          )}

          {reviewingSeller && (
            <div style={{ marginTop: '10px' }}>
              <ReviewForm
                targetType="seller"
                targetId={seller.id}
                orderId={orderId}
                reviewerId={userId}
                reviewerName={userName}
                targetLabel={storeName}
                onSubmit={(review) => {
                  onSellerReviewSubmit(review);
                  setReviewingSeller(false);
                }}
              />
            </div>
          )}

          {sellerAlreadyRated && (
            <div style={{ marginTop: '10px' }}>
              <div style={{
                padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)',
                fontSize: '0.82rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span>Your seller rating:</span>
                  <StarRating rating={sellerAlreadyRated.rating} size="sm" />
                </div>
                {sellerAlreadyRated.comment && (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, fontSize: '0.82rem' }}>
                    {sellerAlreadyRated.comment}
                  </p>
                )}
              </div>
            </div>
          )}

          {periodActive && !reviewingSeller && (
            <div style={{ marginTop: '10px' }}>
              <MutualReviewStatus
                period={reviewPeriod}
                buyerName={userName}
                sellerName={storeName}
              />
            </div>
          )}

          <div style={{
            marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)',
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Subtotal ({items.length} item{items.length > 1 ? 's' : ''})
            </span>
            <span>${(subtotal + totalDeliveryFee).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
