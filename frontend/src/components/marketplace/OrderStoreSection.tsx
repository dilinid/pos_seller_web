import { useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Star, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { Order, OrderItem, ReturnReason, UserReview, ReviewPeriod } from '../../types/marketplace.type';
import type { StoreProfile } from '../../types/store.type';
import type { StoreLocation } from '../../apis/marketplace.api';
import { OrderStatusBadge } from './OrderStatusBadge';
import { StoreBadge } from './StoreBadge';
import { PriceDisplay } from '../ui/PriceDisplay';
import { StarRating } from '../ui/StarRating';
import { ProductImage } from '../ui/ProductImage';
import { OrderProgressStepper } from './OrderProgressStepper';
import { DeliveryTracker } from './DeliveryTracker';
import { ReviewForm } from './ReviewForm';
import { ReturnRequestForm } from './ReturnRequestForm';
import { ReturnReceipt } from './ReturnReceipt';
import { MutualReviewStatus } from './MutualReviewStatus';
import { RETURN_REASON_META } from '../../data/order-status';
import { formatCurrency } from '../../utils/currency';

interface OrderStoreSectionProps {
  seller: StoreProfile;
  items: OrderItem[];
  orderId: string;
  /** The original order's placement date — used only for the return receipt's
   * "Ordered Date" line. Omit for order views that don't support returns. */
  orderCreatedAt?: string;
  existingReviews: Map<string, UserReview>;
  onReviewSubmit: (review: UserReview) => void;
  reviewPeriod?: ReviewPeriod;
  userId: string;
  userName: string;
  onSellerReviewSubmit: (review: UserReview) => void;
  onStartReviewPeriod: (sellerId: string) => void;
  /** Quantity already returned per productId, for this order — caps the return
   * request form and drives the "N returned" note next to each item. Omit for
   * order views that don't support returns (e.g. a return order itself). */
  returnedQuantities?: Record<string, number>;
  /** Return orders already filed against this order, for the "view return"
   * link next to an already-returned item. */
  returnsForOrder?: Order[];
  onSubmitReturn?: (
    selections: { item: OrderItem; quantity: number }[],
    reason: ReturnReason,
    note: string,
    returnLocationCode: string,
  ) => Promise<Order>;
  /** Locations the buyer can pick as where they intend to drop off / ship back
   * a returned item. Omit for order views that don't support returns. */
  locations?: StoreLocation[];
  /** The order's own location code — preselects the return form's location
   * dropdown to "same as where this order was placed". */
  orderLocationCode?: string;
}

export const OrderStoreSection: React.FC<OrderStoreSectionProps> = ({
  seller, items, orderId, orderCreatedAt, existingReviews, onReviewSubmit,
  reviewPeriod, userId, userName, onSellerReviewSubmit, onStartReviewPeriod,
  returnedQuantities = {}, returnsForOrder = [], onSubmitReturn, locations = [], orderLocationCode,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);
  const [reviewingSeller, setReviewingSeller] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState<Order | null>(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [printedAt, setPrintedAt] = useState<Date | null>(null);
  const storeName = seller.storeName || 'Our Store';

  const deliveryMethod = items[0]?.deliveryMethod ?? 'delivery';
  const anyDelivered = items.some((i) => i.status === 'delivered');
  const allDelivered = items.every((i) => i.status === 'delivered');
  const allSameStatus = items.every((i) => i.status === items[0].status);
  const groupStatus = allSameStatus ? items[0].status : (anyDelivered ? 'packing' : items[0]?.status ?? 'pending');

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalDeliveryFee = items.reduce((s, i) => s + i.deliveryFee, 0);

  const periodActive = reviewPeriod && !reviewPeriod.closed;
  const canRateSeller = allDelivered && !reviewPeriod?.buyerReviewedSeller;
  // existingReviews is keyed by the review's raw targetId (see OrderDetailPage's
  // reviewMap) — a seller-type review's targetId is the store's own id, no prefix.
  const sellerAlreadyRated = existingReviews.get(seller.id);

  const returnEligibleItems = items
    .filter((i) => i.status === 'delivered' && i.isReturnable)
    .map((item) => ({ item, maxQuantity: item.quantity - (returnedQuantities[item.productId] ?? 0) }))
    .filter(({ maxQuantity }) => maxQuantity > 0);
  const canRequestReturn = !!onSubmitReturn && returnEligibleItems.length > 0;

  const findReturnForProduct = (productId: string) =>
    returnsForOrder.find((ro) => ro.items.some((i) => i.productId === productId));

  const handleReturnSubmit = async (
    selections: { item: OrderItem; quantity: number }[],
    reason: ReturnReason,
    note: string,
    returnLocationCode: string,
  ) => {
    if (!onSubmitReturn) return;
    setReturnSubmitting(true);
    setReturnError(null);
    try {
      const created = await onSubmitReturn(selections, reason, note, returnLocationCode);
      setReturnSuccess(created);
      // Keep the form open (now frozen — see ReturnRequestForm's `submitted`
      // prop) rather than hiding it, so Print stays reachable in place.
    } catch (err: any) {
      setReturnError(err?.response?.data?.detail ?? err?.message ?? 'Failed to submit return request');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handlePrintReturn = () => {
    // flushSync forces the printedAt update (and the portaled receipt it
    // reveals) to actually commit to the DOM before print() reads the page —
    // an ordinary setState here is async and could otherwise race it.
    flushSync(() => setPrintedAt(new Date()));
    window.print();
  };

  return (
    <div className="premium-card" style={{ padding: '0', background: '#fff', overflow: 'hidden' }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <StoreBadge seller={seller} size="md" to="/store" />
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

          <div className="store-section-status" style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
            {periodActive && <MutualReviewStatus period={reviewPeriod} compact />}
            <OrderProgressStepper status={groupStatus} deliveryMethod={deliveryMethod} />
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
              Review your items and rate {storeName}
            </div>
          )}
          {items.map((item, idx) => {
            const existingReview = existingReviews.get(item.productId);
            const canReview = item.status === 'delivered' && !existingReview;
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
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <OrderStatusBadge status={item.status} />
                  </div>
                </div>

                {(returnedQuantities[item.productId] ?? 0) > 0 && (() => {
                  const returnOrder = findReturnForProduct(item.productId);
                  return (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
                      fontSize: '0.75rem', color: '#92400e', padding: '0 0 10px 0',
                    }}>
                      <RotateCcw size={12} />
                      {returnedQuantities[item.productId]} {item.unit} returned
                      {returnOrder && (
                        <Link to={`/orders/${returnOrder.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          View return ({returnOrder.id})
                        </Link>
                      )}
                    </div>
                  );
                })()}

                {item.returnReason && (
                  <div style={{
                    fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0 0 10px 0',
                  }}>
                    <strong>Reason:</strong> {RETURN_REASON_META[item.returnReason].label}
                    {item.returnReasonNote && <> — {item.returnReasonNote}</>}
                  </div>
                )}

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

          {returnSuccess && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px', marginBottom: '14px',
              background: '#fffbeb', border: '1px solid #fde68a',
              fontSize: '0.82rem', color: '#92400e',
            }}>
              Return request <strong>{returnSuccess.id}</strong> submitted.{' '}
              <Link to={`/orders/${returnSuccess.id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                View return
              </Link>
            </div>
          )}

          {returnError && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px', marginBottom: '14px',
              background: '#fef2f2', border: '1px solid #fecaca',
              fontSize: '0.82rem', color: '#dc2626',
            }}>
              {returnError}
            </div>
          )}

          {showReturnForm ? (
            <div style={{ marginBottom: '14px', opacity: returnSubmitting ? 0.6 : 1, pointerEvents: returnSubmitting ? 'none' : 'auto' }}>
              <ReturnRequestForm
                items={returnEligibleItems}
                onCancel={() => setShowReturnForm(false)}
                onSubmit={handleReturnSubmit}
                submitted={!!returnSuccess}
                onPrint={handlePrintReturn}
                locations={locations}
                defaultLocationCode={orderLocationCode}
              />
            </div>
          ) : canRequestReturn && !returnSuccess && (
            <div style={{ paddingBottom: '14px' }}>
              <button
                onClick={() => setShowReturnForm(true)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '10px',
                  border: '1px solid #fde68a', cursor: 'pointer',
                  background: '#fffbeb', fontSize: '0.8rem',
                  fontFamily: 'var(--font-sans)', fontWeight: 600,
                  color: '#92400e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'var(--transition-fast)',
                }}
              >
                <RotateCcw size={14} />
                Request Return
              </button>
            </div>
          )}
        </div>
      )}

      {expanded && (
        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border-color)' }}>
          <DeliveryTracker
            status={groupStatus}
            storePickupAddress={seller.pickupAddress}
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
                Rate {storeName}
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
                  <span>Your store rating:</span>
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
            <span>{formatCurrency(subtotal + totalDeliveryFee)}</span>
          </div>
        </div>
      )}

      {returnSuccess && printedAt && createPortal(
        // Portaled straight to <body> — this component's own wrapper above is
        // `overflow: hidden`, which would otherwise clip an absolutely
        // positioned .print-only block (see index.css) during print.
        <div className="print-only">
          <ReturnReceipt
            returnOrderId={returnSuccess.id}
            originalOrderId={orderId}
            originalLocationName={returnSuccess.originalLocationName || storeName}
            originalLocationAddress={returnSuccess.originalLocationAddress ?? seller.pickupAddress ?? ''}
            returnLocationName={returnSuccess.locationName || storeName}
            returnLocationAddress={returnSuccess.locationAddress ?? seller.pickupAddress ?? ''}
            orderedAt={orderCreatedAt ?? ''}
            printedAt={printedAt}
            items={returnSuccess.items}
            totalAmount={returnSuccess.grandTotal}
          />
        </div>,
        document.body
      )}
    </div>
  );
};
