import { useState, useRef, useEffect } from 'react';
import { Clock, Package, MapPin } from 'lucide-react';
import type { PushItem } from '../../types/push-item.type';

interface PushItemCardProps {
  item: PushItem;
  onPriceChange: (itemId: string, price: number) => void;
  onMrpChange: (itemId: string, mrp: number | undefined) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onReorderLevelChange: (itemId: string, reorderLevel: number | undefined) => void;
  onPublish: (item: PushItem) => void;
  onViewDetails: (item: PushItem) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export const PushItemCard: React.FC<PushItemCardProps> = ({ item, onPriceChange, onMrpChange, onQuantityChange, onReorderLevelChange, onPublish, onViewDetails }) => {
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
    <div className="pos-item-card" onClick={() => onViewDetails(item)} style={{ cursor: 'pointer' }}>
      <div className="pos-item-main">
        <div className="pos-item-image">
          <span style={{ fontSize: '2rem' }}>{item.image}</span>
        </div>
        <div className="pos-item-body">
          <div className="pos-item-header">
            <div>
              <div className="pos-item-name">{item.name}</div>
              <div className="pos-item-unit">{item.unit}</div>
            </div>
            <span className="pos-item-badge pos-badge-ready">Ready to Publish</span>
          </div>
          <p className="pos-item-desc">{item.description}</p>

          <div className="pos-item-meta">
            <span><Package size={13} /> {item.categoryId}</span>
            <span><Clock size={13} /> Synced {timeAgo(item.pushedAt)}</span>
            {item.pickupAddress && (
              <span><MapPin size={13} /> {item.pickupAddress}</span>
            )}
          </div>

          <div className="pos-item-editable-fields">
            <div className="pos-field">
              <label className="pos-field-label">Price</label>
              <div className="pos-field-control">
                {editingPrice ? (
                  <input
                    ref={priceRef}
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceDraft}
                    onChange={(e) => setPriceDraft(e.target.value)}
                    onBlur={commitPrice}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') { setPriceDraft(String(item.price)); setEditingPrice(false); } }}
                    className="pos-input"
                  />
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setPriceDraft(String(item.price)); setEditingPrice(true); }} className="pos-value-btn">
                    ${item.price.toFixed(2)}
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
                      onKeyDown={(e) => { if (e.key === 'Enter') commitMrp(); if (e.key === 'Escape') { setMrpDraft(item.mrp != null ? String(item.mrp) : ''); setEditingMrp(false); } }}
                      className="pos-input"
                    />
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setMrpDraft(item.mrp != null ? String(item.mrp) : ''); setEditingMrp(true); }} className="pos-value-btn">
                      {item.mrp != null ? `$${item.mrp.toFixed(2)}` : '—'}
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
                    type="number"
                    step="1"
                    min="0"
                    value={qtyDraft}
                    onChange={(e) => setQtyDraft(e.target.value)}
                    onBlur={commitQty}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitQty(); if (e.key === 'Escape') { setQtyDraft(String(item.quantity)); setEditingQty(false); } }}
                    className="pos-input"
                  />
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setQtyDraft(String(item.quantity)); setEditingQty(true); }} className="pos-value-btn">
                    {item.quantity}
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
                      onKeyDown={(e) => { if (e.key === 'Enter') commitReorder(); if (e.key === 'Escape') { setReorderDraft(item.reorderLevel != null ? String(item.reorderLevel) : ''); setEditingReorder(false); } }}
                      className="pos-input"
                    />
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setReorderDraft(item.reorderLevel != null ? String(item.reorderLevel) : ''); setEditingReorder(true); }} className="pos-value-btn">
                      {item.reorderLevel != null ? item.reorderLevel : '—'}
                    </button>
                  )}
                </div>
              </div>
          </div>

          <div className="pos-item-footer">
            <div className="pos-locked-hint">
              Changing name, description, images, or other details requires admin review
            </div>
            <button onClick={(e) => { e.stopPropagation(); onPublish(item); }} className="pos-publish-btn">
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
