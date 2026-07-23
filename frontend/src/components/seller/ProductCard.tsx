import { useState, useRef, useEffect } from 'react';
import { Clock, Package, MapPin, FileEdit, Send, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSellerStore } from '../../stores/seller.store';
import { ProductStatusBadge } from './ProductStatusBadge';
import type { ProductDraft } from '../../types/product-draft.type';

interface ProductCardProps {
  draft: ProductDraft;
  onPriceChange: (id: string, price: number) => void;
  onMrpChange: (id: string, mrp: number | undefined) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onReorderLevelChange: (id: string, reorderLevel: number | undefined) => void;
  onSubmit: (id: string) => void;
  onPublish: (id: string) => void;
  onViewDetails: (draft: ProductDraft) => void;
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

export const ProductCard: React.FC<ProductCardProps> = ({
  draft, onPriceChange, onMrpChange, onQuantityChange, onReorderLevelChange, onSubmit, onPublish, onViewDetails, submitting, publishing,
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

  const sellerProfile = useSellerStore((s) =>
    s.profiles.find((p) => p.userId === draft.sellerUserId && p.status === 'approved'),
  );
  const pickupAddress = sellerProfile?.pickupAddress || '';

  const canEditInline = draft.status === 'draft' || draft.status === 'changes_requested' || draft.status === 'approved' || draft.status === 'published';
  const isLocked = draft.status === 'approved';

  return (
    <div className="pos-item-card" onClick={() => onViewDetails(draft)} style={{ cursor: 'pointer' }}>
      <div className="pos-item-main">
        <div className="pos-item-image">
          <span style={{ fontSize: '2rem' }}>{draft.image || '📦'}</span>
        </div>
        <div className="pos-item-body">
          <div className="pos-item-header">
            <div>
              <div className="pos-item-name">{draft.name}</div>
              <div className="pos-item-unit">{draft.unit}</div>
            </div>
            <ProductStatusBadge status={draft.status} />
          </div>

          <p className="pos-item-desc">{draft.description}</p>

          <div className="pos-item-meta">
            <span><Package size={13} /> {draft.categoryId}</span>
            <span><Clock size={13} /> Created {timeAgo(draft.createdAt)}</span>
            {pickupAddress && (
              <span><MapPin size={13} /> {pickupAddress}</span>
            )}
          </div>

          {canEditInline && (
            <div className="pos-item-editable-fields">
              <div className="pos-field">
                <label className="pos-field-label">Price</label>
                <div className="pos-field-control">
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
                      onClick={(e) => { e.stopPropagation(); setPriceDraft(String(draft.price)); setEditingPrice(true); }}
                      className="pos-value-btn"
                    >
                      ${draft.price.toFixed(2)}
                    </button>
                  )}
                </div>
              </div>
              <div className="pos-field">
                <label className="pos-field-label">MRP</label>
                <div className="pos-field-control">
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
                      onClick={(e) => { e.stopPropagation(); setMrpDraft(draft.mrp != null ? String(draft.mrp) : ''); setEditingMrp(true); }}
                      className="pos-value-btn"
                    >
                      {draft.mrp != null ? `$${draft.mrp.toFixed(2)}` : '—'}
                    </button>
                  )}
                </div>
              </div>
              <div className="pos-field">
                <label className="pos-field-label">Quantity</label>
                <div className="pos-field-control">
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
                      onClick={(e) => { e.stopPropagation(); setQtyDraft(String(draft.quantity)); setEditingQty(true); }}
                      className="pos-value-btn"
                    >
                      {draft.quantity}
                    </button>
                  )}
                </div>
              </div>
              <div className="pos-field">
                <label className="pos-field-label">Reorder</label>
                <div className="pos-field-control">
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
                      onClick={(e) => { e.stopPropagation(); setReorderDraft(draft.reorderLevel != null ? String(draft.reorderLevel) : ''); setEditingReorder(true); }}
                      className="pos-value-btn"
                    >
                      {draft.reorderLevel != null ? draft.reorderLevel : '—'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!canEditInline && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <span>${draft.price.toFixed(2)}</span>
              {draft.mrp != null && <span style={{ color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'line-through' }}>${draft.mrp.toFixed(2)}</span>}
              <span>Qty: {draft.quantity}</span>
              {draft.reorderLevel != null && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Reorder: {draft.reorderLevel}</span>}
            </div>
          )}

          {draft.status === 'draft' && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/seller/products/edit/${draft.id}`); }} className="prod-action-btn">
                <FileEdit size={15} /> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); onSubmit(draft.id); }} disabled={submitting} className="prod-action-btn prod-action-primary">
                {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          )}
          {draft.status === 'changes_requested' && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/seller/products/edit/${draft.id}`); }} className="prod-action-btn">
                <FileEdit size={15} /> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); onSubmit(draft.id); }} disabled={submitting} className="prod-action-btn prod-action-primary">
                {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          )}
          {draft.status === 'pending_review' && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {draft.publishedAt ? (
                <>Under re-review — previously published. Product is hidden from marketplace until approved.</>
              ) : (
                <>Under review...</>
              )}
            </div>
          )}
          {draft.status === 'approved' && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/seller/products/edit/${draft.id}`); }} className="prod-action-btn">
                <FileEdit size={15} /> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); onPublish(draft.id); }} disabled={publishing} className="pos-publish-btn">
                {publishing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={15} />}
                {publishing ? ' Publishing...' : ' Publish'}
              </button>
            </div>
          )}
          {draft.status === 'published' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Published {draft.publishedAt ? new Date(draft.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </div>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/?product=${draft.id}`); }} className="prod-action-btn">
                <ExternalLink size={15} /> View in Marketplace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
