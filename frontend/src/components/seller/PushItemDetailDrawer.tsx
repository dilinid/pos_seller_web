import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { PushItem } from '../../types/push-item.type';

interface PushItemDetailDrawerProps {
  item: PushItem;
  published: boolean;
  onClose: () => void;
  onPriceChange: (itemId: string, price: number) => void;
  onMrpChange: (itemId: string, mrp: number | undefined) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onReorderLevelChange: (itemId: string, reorderLevel: number | undefined) => void;
  onPublish: (item: PushItem) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export const PushItemDetailDrawer: React.FC<PushItemDetailDrawerProps> = ({
  item, published, onClose, onPriceChange, onMrpChange, onQuantityChange, onReorderLevelChange, onPublish,
}) => {
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingMrp, setEditingMrp] = useState(false);
  const [editingQty, setEditingQty] = useState(false);
  const [editingReorder, setEditingReorder] = useState(false);
  const [priceDraft, setPriceDraft] = useState(String(item.price));
  const [mrpDraft, setMrpDraft] = useState(item.mrp != null ? String(item.mrp) : '');
  const [qtyDraft, setQtyDraft] = useState(String(item.quantity));
  const [reorderDraft, setReorderDraft] = useState(item.reorderLevel != null ? String(item.reorderLevel) : '');

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
    if (!isNaN(val) && val >= 0) onPriceChange(item.id, Math.round(val * 100) / 100);
    else setPriceDraft(String(item.price));
    setEditingPrice(false);
  };

  const commitMrp = () => {
    const val = mrpDraft ? parseFloat(mrpDraft) : NaN;
    if (mrpDraft && !isNaN(val) && val >= 0) onMrpChange(item.id, Math.round(val * 100) / 100);
    else if (!mrpDraft) onMrpChange(item.id, undefined);
    else setMrpDraft(item.mrp != null ? String(item.mrp) : '');
    setEditingMrp(false);
  };

  const commitQty = () => {
    const val = parseInt(qtyDraft, 10);
    if (!isNaN(val) && val >= 0) onQuantityChange(item.id, Math.round(val));
    else setQtyDraft(String(item.quantity));
    setEditingQty(false);
  };

  const commitReorder = () => {
    const val = reorderDraft ? parseInt(reorderDraft, 10) : NaN;
    if (reorderDraft && !isNaN(val) && val >= 0) onReorderLevelChange(item.id, Math.round(val));
    else if (!reorderDraft) onReorderLevelChange(item.id, undefined);
    else setReorderDraft(item.reorderLevel != null ? String(item.reorderLevel) : '');
    setEditingReorder(false);
  };

  return (
    <>
      <div className="pos-drawer-overlay" onClick={onClose} />
      <div className="pos-drawer">
        <div className="pos-drawer-header">
          <div className="pos-drawer-header-left">
            <span className="pos-item-badge" style={published
              ? { background: '#f0fdf4', color: '#16a34a' }
              : { background: 'var(--primary-light)', color: 'var(--primary)' }
            }>
              {published ? 'Published' : 'Ready to Publish'}
            </span>
          </div>
          <button onClick={onClose} className="pos-drawer-close">
            <X size={20} />
          </button>
        </div>

        <div className="pos-drawer-body">
          {item.images.length > 0 && (
            <div className="pos-image-gallery">
              {item.images.map((img, i) => (
                <div key={i} className="pos-image-thumb">
                  <span style={{ fontSize: '2rem' }}>{img}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <h2 className="pos-drawer-product-name">{item.name}</h2>
            <div className="pos-item-unit" style={{ fontSize: '0.85rem' }}>{item.unit}</div>
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Description</div>
            <p className="pos-drawer-desc">{item.description}</p>
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
                      onKeyDown={(e) => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') { setPriceDraft(String(item.price)); setEditingPrice(false); } }}
                      className="pos-input"
                      disabled={published}
                    />
                  ) : (
                    <button
                      onClick={() => { if (!published) { setPriceDraft(String(item.price)); setEditingPrice(true); } }}
                      className="pos-value-btn"
                      style={published ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      ${item.price.toFixed(2)}
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
                      onKeyDown={(e) => { if (e.key === 'Enter') commitMrp(); if (e.key === 'Escape') { setMrpDraft(item.mrp != null ? String(item.mrp) : ''); setEditingMrp(false); } }}
                      className="pos-input"
                      disabled={published}
                    />
                  ) : (
                    <button
                      onClick={() => { if (!published) { setMrpDraft(item.mrp != null ? String(item.mrp) : ''); setEditingMrp(true); } }}
                      className="pos-value-btn"
                      style={published ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      {item.mrp != null ? `$${item.mrp.toFixed(2)}` : '—'}
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
                      onKeyDown={(e) => { if (e.key === 'Enter') commitQty(); if (e.key === 'Escape') { setQtyDraft(String(item.quantity)); setEditingQty(false); } }}
                      className="pos-input"
                      disabled={published}
                    />
                  ) : (
                    <button
                      onClick={() => { if (!published) { setQtyDraft(String(item.quantity)); setEditingQty(true); } }}
                      className="pos-value-btn"
                      style={published ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      {item.quantity}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pos-drawer-section">
            <div className="pos-drawer-section-title">Classification</div>
            <div className="pos-info-grid">
              <div><span className="pos-info-label">Category</span><span className="pos-info-value">{item.categoryId}</span></div>
              <div><span className="pos-info-label">Subcategory</span><span className="pos-info-value">{item.subCategoryId}</span></div>
              <div><span className="pos-info-label">Unit</span><span className="pos-info-value">{item.unit}</span></div>
            </div>
          </div>

          {item.features.length > 0 && (
            <div className="pos-drawer-section">
              <div className="pos-drawer-section-title">Features</div>
              <div className="pos-feature-list">
                {item.features.map((f, i) => (
                  <span key={i} className="pos-feature-pill">{f}</span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(item.specifications).length > 0 && (
            <div className="pos-drawer-section">
              <div className="pos-drawer-section-title">Specifications</div>
              <div className="pos-info-grid">
                {Object.entries(item.specifications).map(([key, val]) => (
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
                <span className={`pos-boolean-badge ${item.deliveryAvailable ? 'pos-boolean-yes' : 'pos-boolean-no'}`}>
                  {item.deliveryAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="pos-info-label">Pickup Available</span>
                <span className={`pos-boolean-badge ${item.pickupAvailable ? 'pos-boolean-yes' : 'pos-boolean-no'}`}>
                  {item.pickupAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="pos-info-label">Estimated Delivery</span>
                <span className="pos-info-value">{item.estimatedDeliveryDays}</span>
              </div>
              {item.pickupAddress && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="pos-info-label">Pickup Address</span>
                  <span className="pos-info-value">{item.pickupAddress}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pos-drawer-section" style={{ borderBottom: 'none' }}>
            <div className="pos-drawer-section-title">Sync Info</div>
            <div className="pos-info-grid">
              <div>
                <span className="pos-info-label">Synced</span>
                <span className="pos-info-value">{timeAgo(item.pushedAt)}</span>
              </div>
              <div>
                <span className="pos-info-label">Status</span>
                <span className="pos-info-value" style={{ textTransform: 'capitalize' }}>
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>
              {item.publishedAt && (
                <div>
                  <span className="pos-info-label">Published</span>
                  <span className="pos-info-value">
                    {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
              </div>
              <div className="pos-drawer-field">
                <label className="pos-field-label">Reorder</label>
                <div className="pos-field-control" style={{ minWidth: '120px' }}>
                  {editingReorder ? (
                    <input
                      ref={reorderRef}
                      type="number" step="1" min="0"
                      value={reorderDraft}
                      onChange={(e) => setReorderDraft(e.target.value)}
                      onBlur={commitReorder}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitReorder(); if (e.key === 'Escape') { setReorderDraft(item.reorderLevel != null ? String(item.reorderLevel) : ''); setEditingReorder(false); } }}
                      className="pos-input"
                      disabled={published}
                    />
                  ) : (
                    <button
                      onClick={() => { if (!published) { setReorderDraft(item.reorderLevel != null ? String(item.reorderLevel) : ''); setEditingReorder(true); } }}
                      className="pos-value-btn"
                      style={published ? { cursor: 'default', opacity: 0.7 } : {}}
                    >
                      {item.reorderLevel != null ? item.reorderLevel : '—'}
                    </button>
                  )}
                </div>
              </div>
            </div>

        <div className="pos-drawer-footer">
          {!published ? (
            <>
              <div className="pos-locked-hint" style={{ flex: 1 }}>
                Changing name, description, images, or other details requires admin review
              </div>
              <button onClick={() => onPublish(item)} className="pos-publish-btn">
                Publish
              </button>
            </>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%', padding: '8px 0' }}>
              This item is already published to the marketplace
            </div>
          )}
        </div>
      </div>
    </>
  );
};
