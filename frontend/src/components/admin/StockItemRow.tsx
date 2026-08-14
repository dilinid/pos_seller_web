import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { StockBadge } from '../ui/StockBadge';
import { useProductDraftStore } from '../../stores/product-draft.store';
import { useMarketplaceStore } from '../../stores/marketplace.store';
import type { ProductDraft } from '../../types/product-draft.type';

interface StockItemRowProps {
  draft: ProductDraft;
}

export const StockItemRow: React.FC<StockItemRowProps> = ({ draft }) => {
  const updateDraft = useProductDraftStore((s) => s.updateDraft);
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const syncQuantity = (newQty: number) => {
    const val = Math.max(0, Math.round(newQty));
    updateDraft(draft.id, { quantity: val });
    if (draft.publishedProductId) {
      useMarketplaceStore.getState().updateProduct(draft.publishedProductId || draft.id, { quantity: val });
    }
  };

  const commitAdd = () => {
    const val = parseInt(addValue, 10);
    if (!isNaN(val) && val > 0) {
      syncQuantity(draft.quantity + val);
    }
    setAddValue('');
    setAdding(false);
  };

  const cancelAdd = () => {
    setAddValue('');
    setAdding(false);
  };

  const newQty = adding && addValue ? draft.quantity + (parseInt(addValue, 10) || 0) : null;

  return (
    <div className={`stock-row${draft.quantity <= 0 ? ' stock-row-out' : ''}`}>
      <div className="stock-row-main">
        <div className="stock-row-image">
          <span style={{ fontSize: '1.6rem' }}>{draft.image || '📦'}</span>
        </div>
        <div className="stock-row-info">
          <div className="stock-row-name">{draft.name}</div>
          <div className="stock-row-meta">{draft.unit} · {draft.categoryId}</div>
        </div>
      </div>

      <div className="stock-row-actions">
        <div className="stock-row-top">
          <div className="stock-display-qty">
            <span className="stock-display-label">Stock</span>
            <span className={`stock-display-value${draft.reorderLevel != null && draft.quantity <= draft.reorderLevel && draft.quantity > 0 ? ' stock-low' : ''}${draft.quantity <= 0 ? ' stock-out' : ''}`}>
              {draft.quantity}
            </span>
          </div>

          {!adding && (
            <button onClick={() => setAdding(true)} className="stock-add-trigger">
              <Plus size={15} /> Add Stock
            </button>
          )}

          {adding && (
            <div className="stock-calc">
              <span className="stock-calc-current">{draft.quantity}</span>
              <span className="stock-calc-op">+</span>
              <input
                ref={inputRef}
                type="number" step="1" min="1"
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitAdd();
                  if (e.key === 'Escape') cancelAdd();
                }}
                className="stock-calc-input"
                placeholder="0"
              />
              {newQty != null && (
                <>
                  <span className="stock-calc-eq">=</span>
                  <span className="stock-calc-new">{newQty}</span>
                </>
              )}
              <button onClick={commitAdd} className="stock-action-btn stock-action-add">Add</button>
              <button onClick={cancelAdd} className="stock-action-btn stock-action-cancel"><X size={14} /></button>
            </div>
          )}
        </div>

        <div className="stock-row-bottom">
          <span className="stock-reorder">
            Reorder at: <strong>{draft.reorderLevel != null ? draft.reorderLevel : '—'}</strong>
          </span>
          <StockBadge quantity={draft.quantity} reorderLevel={draft.reorderLevel} size="sm" />
        </div>
      </div>
    </div>
  );
};
