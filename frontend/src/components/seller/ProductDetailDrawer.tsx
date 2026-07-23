import { useEffect, useState, useRef } from 'react';
import { X, Package, Truck, MapPin, Clock, CheckCircle, FileEdit, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSellerStore } from '../../stores/seller.store';
import { ProductStatusBadge } from './ProductStatusBadge';
import type { ProductDraft } from '../../types/product-draft.type';

interface ProductDetailDrawerProps {
  draft: ProductDraft;
  onClose: () => void;
  onPriceChange: (id: string, price: number) => void;
  onMrpChange: (id: string, mrp: number | undefined) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onReorderLevelChange: (id: string, reorderLevel: number | undefined) => void;
  onSubmit: (id: string) => void;
  onPublish: (id: string) => void;
  submitting: boolean;
  publishing: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  draft, onClose, onPriceChange, onMrpChange, onQuantityChange, onReorderLevelChange, onSubmit, onPublish, submitting, publishing,
}) => {
  const navigate = useNavigate();
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingMrp, setEditingMrp] = useState(false);
  const [editingQty, setEditingQty] = useState(false);
  const [editingReorder, setEditingReorder] = useState(false);
  const [priceDraft, setPriceDraft] = useState(String(draft.price));
  const [mrpDraft, setMrpDraft] = useState(draft.mrp != null ? String(draft.mrp) : '');
  const [qtyDraft, setQtyDraft] = useState(String(draft.quantity));
  const [reorderDraft, setReorderDraft] = useState(draft.reorderLevel != null ? String(draft.reorderLevel) : '');

  const priceRef = useRef<HTMLInputElement>(null);
  const mrpRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const reorderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPrice && priceRef.current) priceRef.current.focus();
  }, [editingPrice]);

  useEffect(() => {
    if (editingMrp && mrpRef.current) mrpRef.current.focus();
  }, [editingMrp]);

  useEffect(() => {
    if (editingQty && qtyRef.current) qtyRef.current.focus();
  }, [editingQty]);

  useEffect(() => {
    if (editingReorder && reorderRef.current) reorderRef.current.focus();
  }, [editingReorder]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const commitPrice = () => {
    const val = parseFloat(priceDraft);
    if (!isNaN(val) && val >= 0) onPriceChange(draft.id, Math.round(val * 100) / 100);
    else setPriceDraft(String(draft.price));
    setEditingPrice(false);
  };

  const commitMrp = () => {
    const val = mrpDraft ? parseFloat(mrpDraft) : NaN;
    if (mrpDraft && !isNaN(val) && val >= 0) onMrpChange(draft.id, Math.round(val * 100) / 100);
    else if (!mrpDraft) onMrpChange(draft.id, undefined);
    else setMrpDraft(draft.mrp != null ? String(draft.mrp) : '');
    setEditingMrp(false);
  };

  const commitQty = () => {
    const val = parseInt(qtyDraft, 10);
    if (!isNaN(val) && val >= 0) onQuantityChange(draft.id, Math.round(val));
    else setQtyDraft(String(draft.quantity));
    setEditingQty(false);
  };

  const commitReorder = () => {
    const val = reorderDraft ? parseInt(reorderDraft, 10) : NaN;
    if (reorderDraft && !isNaN(val) && val >= 0) onReorderLevelChange(draft.id, Math.round(val));
    else if (!reorderDraft) onReorderLevelChange(draft.id, undefined);
    else setReorderDraft(draft.reorderLevel != null ? String(draft.reorderLevel) : '');
    setEditingReorder(false);
  };

  const canEditInline = draft.status === 'draft' || draft.status === 'changes_requested' || draft.status === 'approved';

  const sellerProfile = useSellerStore((s) =>
    s.profiles.find((p) => p.userId === draft.sellerUserId && p.status === 'approved'),
  );
  const districtFeeEntries = sellerProfile ? Object.entries(sellerProfile.districtFees ?? {}) : [];
  const pickupAddress = sellerProfile?.pickupAddress || '';
  const estimatedDeliveryDays = sellerProfile?.estimatedDeliveryDays || '';
  const freeDeliveryMin = sellerProfile?.freeDeliveryMin ?? null;

  return (
    <>
      <div className="pos-drawer-overlay" onClick={onClose} />
      <div className="pos-drawer">
        <div className="pos-drawer-header">
          <div className="pos-drawer-header-left">
            <ProductStatusBadge status={draft.status} />
          </div>
          <button onClick={onClose} className="pos-drawer-close">
            <X size={20} />
          </button>
        </div>

        <div className="pos-drawer-body">
          {draft.images.length > 0 && (
            <div className="pos-image-gallery">
              {draft.images.map((img, i) => (
                <div key={i} className="pos-image-thumb">
                  <span style={{ fontSize: '2rem' }}>{img}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <h2 className="pos-drawer-product-name">{draft.name}</h2>
            <div className="pos-item-unit" style={{ fontSize: '0.85rem' }}>{draft.unit}</div>
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Description</div>
            <p className="pos-drawer-desc">{draft.description}</p>
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Pricing & Stock</div>
            <div className="pos-drawer-field-row">
              <div className="pos-drawer-field">
                <label className="pos-field-label">Price</label>
                <div className="pos-field-control" style={{ minWidth: '120px' }}>
                  {editingPrice ? (
                    <input
                      ref={priceRef}
                      type="number" step="0.01" min="0"
                      value={priceDraft}
                      onChange={(e) => setPriceDraft(e.target.value)}
                      onBlur={commitPrice}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') { setPriceDraft(String(draft.price)); setEditingPrice(false); } }}
                      className="pos-input"
                    />
                  ) : (
                    <button
                      onClick={() => { if (canEditInline) { setPriceDraft(String(draft.price)); setEditingPrice(true); } }}
                      className="pos-value-btn"
                      style={!canEditInline ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      ${draft.price.toFixed(2)}
                    </button>
                  )}
                </div>
              </div>
              <div className="pos-drawer-field">
                <label className="pos-field-label">MRP</label>
                <div className="pos-field-control" style={{ minWidth: '120px' }}>
                  {editingMrp ? (
                    <input
                      ref={mrpRef}
                      type="number" step="0.01" min="0"
                      value={mrpDraft}
                      onChange={(e) => setMrpDraft(e.target.value)}
                      onBlur={commitMrp}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitMrp(); if (e.key === 'Escape') { setMrpDraft(draft.mrp != null ? String(draft.mrp) : ''); setEditingMrp(false); } }}
                      className="pos-input"
                    />
                  ) : (
                    <button
                      onClick={() => { if (canEditInline) { setMrpDraft(draft.mrp != null ? String(draft.mrp) : ''); setEditingMrp(true); } }}
                      className="pos-value-btn"
                      style={!canEditInline ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      {draft.mrp != null ? `$${draft.mrp.toFixed(2)}` : '—'}
                    </button>
                  )}
                </div>
              </div>
              <div className="pos-drawer-field">
                <label className="pos-field-label">Quantity</label>
                <div className="pos-field-control" style={{ minWidth: '120px' }}>
                  {editingQty ? (
                    <input
                      ref={qtyRef}
                      type="number" step="1" min="0"
                      value={qtyDraft}
                      onChange={(e) => setQtyDraft(e.target.value)}
                      onBlur={commitQty}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitQty(); if (e.key === 'Escape') { setQtyDraft(String(draft.quantity)); setEditingQty(false); } }}
                      className="pos-input"
                    />
                  ) : (
                    <button
                      onClick={() => { if (canEditInline) { setQtyDraft(String(draft.quantity)); setEditingQty(true); } }}
                      className="pos-value-btn"
                      style={!canEditInline ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      {draft.quantity}
                    </button>
                  )}
                </div>
              </div>
              <div className="pos-drawer-field">
                <label className="pos-field-label">Reorder At</label>
                <div className="pos-field-control" style={{ minWidth: '120px' }}>
                  {editingReorder ? (
                    <input
                      ref={reorderRef}
                      type="number" step="1" min="0"
                      value={reorderDraft}
                      onChange={(e) => setReorderDraft(e.target.value)}
                      onBlur={commitReorder}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitReorder(); if (e.key === 'Escape') { setReorderDraft(draft.reorderLevel != null ? String(draft.reorderLevel) : ''); setEditingReorder(false); } }}
                      className="pos-input"
                    />
                  ) : (
                    <button
                      onClick={() => { if (canEditInline) { setReorderDraft(draft.reorderLevel != null ? String(draft.reorderLevel) : ''); setEditingReorder(true); } }}
                      className="pos-value-btn"
                      style={!canEditInline ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      {draft.reorderLevel != null ? draft.reorderLevel : '—'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Classification</div>
            <div className="pos-info-grid">
              <div><span className="pos-info-label">Category</span><span className="pos-info-value">{draft.categoryId}</span></div>
              <div><span className="pos-info-label">Subcategory</span><span className="pos-info-value">{draft.subCategoryId}</span></div>
              <div><span className="pos-info-label">Unit</span><span className="pos-info-value">{draft.unit}</span></div>
            </div>
          </div>

          {draft.features.length > 0 && (
            <div className="pos-drawer-section">
              <div className="pos-drawer-section-title">Features</div>
              <div className="pos-feature-list">
                {draft.features.map((f, i) => (
                  <span key={i} className="pos-feature-pill">{f}</span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(draft.specifications).length > 0 && (
            <div className="pos-drawer-section">
              <div className="pos-drawer-section-title">Specifications</div>
              <div className="pos-info-grid">
                {Object.entries(draft.specifications).map(([key, val]) => (
                  <div key={key}><span className="pos-info-label">{key}</span><span className="pos-info-value">{val}</span></div>
                ))}
              </div>
            </div>
          )}

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Delivery Details</div>
            <div className="pos-info-grid">
              <div>
                <span className="pos-info-label">Delivery Available</span>
                <span className={`pos-boolean-badge ${draft.deliveryAvailable ? 'pos-boolean-yes' : 'pos-boolean-no'}`}>
                  {draft.deliveryAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="pos-info-label">Pickup Available</span>
                <span className={`pos-boolean-badge ${draft.pickupAvailable ? 'pos-boolean-yes' : 'pos-boolean-no'}`}>
                  {draft.pickupAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="pos-info-label">Estimated Delivery</span>
                <span className="pos-info-value">{estimatedDeliveryDays}</span>
              </div>
              {freeDeliveryMin != null && (
                <div>
                  <span className="pos-info-label">Free Delivery Minimum</span>
                  <span className="pos-info-value">${freeDeliveryMin.toFixed(2)}</span>
                </div>
              )}
              {draft.weight != null && (
                <div>
                  <span className="pos-info-label">Weight</span>
                  <span className="pos-info-value">{draft.weight} kg</span>
                </div>
              )}
              {draft.volume != null && (
                <div>
                  <span className="pos-info-label">Volume</span>
                  <span className="pos-info-value">{draft.volume} m³</span>
                </div>
              )}
              {pickupAddress && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="pos-info-label">Pickup Address</span>
                  <span className="pos-info-value">{pickupAddress}</span>
                </div>
              )}
            </div>
            {districtFeeEntries.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>District Fees</div>
                <div className="prod-district-table" style={{ margin: 0 }}>
                  <div className="prod-district-header">
                    <span>District</span>
                    <span>Fee ($)</span>
                  </div>
                  {districtFeeEntries.map(([district, fee]) => (
                    <div key={district} className="prod-district-row">
                      <span className="prod-district-name">{district}</span>
                      <span className="prod-district-fee">{fee.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pos-drawer-section" style={{ borderBottom: 'none' }}>
            <div className="pos-drawer-section-title">Timeline</div>
            <div className="pos-info-grid">
              <div>
                <span className="pos-info-label">Created</span>
                <span className="pos-info-value">{timeAgo(draft.createdAt)}</span>
              </div>
              <div>
                <span className="pos-info-label">Updated</span>
                <span className="pos-info-value">{timeAgo(draft.updatedAt)}</span>
              </div>
              {draft.submittedAt && (
                <div>
                  <span className="pos-info-label">Submitted</span>
                  <span className="pos-info-value">{timeAgo(draft.submittedAt)}</span>
                </div>
              )}
              {draft.publishedAt && (
                <div>
                  <span className="pos-info-label">Published</span>
                  <span className="pos-info-value">
                    {new Date(draft.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
            {draft.adminNotes && (
              <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fffbeb', borderRadius: '8px', fontSize: '0.82rem', color: '#92400e' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.78rem' }}>Admin Notes</div>
                {draft.adminNotes}
              </div>
            )}
          </div>
        </div>

        <div className="pos-drawer-footer">
          {draft.status === 'draft' && (
            <>
              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <button onClick={() => navigate(`/seller/products/edit/${draft.id}`)} className="prod-action-btn">
                  <FileEdit size={15} /> Edit
                </button>
              </div>
              <button onClick={() => onSubmit(draft.id)} disabled={submitting} className="pos-publish-btn">
                {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                {submitting ? ' Submitting...' : ' Submit for Review'}
              </button>
            </>
          )}
          {draft.status === 'changes_requested' && (
            <>
              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <button onClick={() => navigate(`/seller/products/edit/${draft.id}`)} className="prod-action-btn">
                  <FileEdit size={15} /> Edit
                </button>
              </div>
              <button onClick={() => onSubmit(draft.id)} disabled={submitting} className="pos-publish-btn">
                {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                {submitting ? ' Submitting...' : ' Submit for Review'}
              </button>
            </>
          )}
          {draft.status === 'pending_review' && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%', padding: '8px 0' }}>
              {draft.publishedAt ? 'Previously published — update pending admin review. Product is hidden until approved.' : 'Product is currently under review'}
            </div>
          )}
          {draft.status === 'approved' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Approved — edit to review before publishing
                </span>
                <button onClick={() => navigate(`/seller/products/edit/${draft.id}`)} className="prod-action-btn">
                  <FileEdit size={15} /> Edit Product
                </button>
              </div>
              <button onClick={() => onPublish(draft.id)} disabled={publishing} className="pos-publish-btn">
                {publishing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={15} />}
                {publishing ? ' Publishing...' : ' Publish'}
              </button>
            </>
          )}
          {draft.status === 'published' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Live in marketplace — edit to make changes
              </span>
              <button onClick={() => navigate(`/seller/products/edit/${draft.id}`)} className="prod-action-btn">
                <FileEdit size={15} /> Edit Product
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
