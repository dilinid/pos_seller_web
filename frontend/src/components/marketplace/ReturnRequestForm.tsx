import { useState } from 'react';
import type { OrderItem, ReturnReason } from '../../types/marketplace.type';
import { RETURN_REASON_META, RETURN_REASON_VALUES } from '../../data/order-status';
import { ProductImage } from '../ui/ProductImage';
import { formatCurrency } from '../../utils/currency';

interface ReturnableItem {
  item: OrderItem;
  /** How many units of this line are still eligible to be returned (ordered
   * quantity minus whatever's already been returned in earlier requests). */
  maxQuantity: number;
}

interface ReturnRequestFormProps {
  items: ReturnableItem[];
  onCancel: () => void;
  onSubmit: (selections: { item: OrderItem; quantity: number }[], reason: ReturnReason, note: string) => void;
  /** True once this request has been successfully submitted — freezes every
   * field plus Cancel/Submit, and is the only state in which Print is enabled. */
  submitted?: boolean;
  onPrint?: () => void;
}

export const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({ items, onCancel, onSubmit, submitted = false, onPrint }) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(items.map(({ item, maxQuantity }) => [item.productId, maxQuantity]))
  );
  const [reason, setReason] = useState<ReturnReason | ''>('');
  const [note, setNote] = useState('');

  const selectedItems = items.filter(({ item }) => selected[item.productId]);
  const canSubmit = !submitted && selectedItems.length > 0 && reason.length > 0;

  const toggleItem = (productId: string) => {
    setSelected((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleQtyChange = (productId: string, value: number, max: number) => {
    const clamped = Number.isNaN(value) ? 1 : Math.max(1, Math.min(value, max));
    setQuantities((prev) => ({ ...prev, [productId]: clamped }));
  };

  const handleSubmit = () => {
    if (!canSubmit || !reason) return;
    const selections = selectedItems.map(({ item }) => ({
      item,
      quantity: quantities[item.productId] ?? 1,
    }));
    onSubmit(selections, reason, note);
  };

  return (
    <div style={{
      padding: '14px', borderRadius: '10px', background: '#fffbeb',
      border: '1px solid #fde68a',
    }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', marginBottom: '10px' }}>
        Select items to return
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
        {items.map(({ item, maxQuantity }) => {
          const isChecked = !!selected[item.productId];
          return (
            <div
              key={item.productId}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px', borderRadius: '8px',
                background: isChecked ? '#fff' : 'transparent',
                border: isChecked ? '1px solid #fde68a' : '1px solid transparent',
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleItem(item.productId)}
                disabled={submitted}
                style={{ accentColor: '#d97706', flexShrink: 0 }}
              />
              <ProductImage image={item.productImage} alt={item.productName} size="1.1rem" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.productName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {formatCurrency(item.price)} · {maxQuantity} {item.unit} eligible
                </div>
              </div>
              {isChecked && (
                <input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantities[item.productId] ?? maxQuantity}
                  onChange={(e) => handleQtyChange(item.productId, Number(e.target.value), maxQuantity)}
                  disabled={submitted}
                  className="form-input"
                  style={{ width: '60px', padding: '5px 6px', fontSize: '0.8rem', flexShrink: 0 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Reason for return
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as ReturnReason)}
          disabled={submitted}
          className="form-input"
          style={{ fontSize: '0.82rem', padding: '7px 10px' }}
        >
          <option value="">Select a reason…</option>
          {RETURN_REASON_VALUES.map((r) => (
            <option key={r} value={r}>{RETURN_REASON_META[r].label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Additional notes (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={submitted}
          rows={2}
          placeholder="Tell us more about the issue…"
          className="form-input"
          style={{ fontSize: '0.82rem', padding: '8px 10px', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitted}
          className="btn btn-secondary"
          style={{ padding: '7px 16px', fontSize: '0.8rem', opacity: submitted ? 0.5 : 1, cursor: submitted ? 'not-allowed' : 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onPrint}
          disabled={!submitted}
          className="btn btn-secondary"
          style={{ padding: '7px 16px', fontSize: '0.8rem', opacity: submitted ? 1 : 0.5, cursor: submitted ? 'pointer' : 'not-allowed' }}
        >
          Print
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn btn-primary"
          style={{ padding: '7px 16px', fontSize: '0.8rem', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          {submitted ? 'Submitted' : 'Submit Return Request'}
        </button>
      </div>
    </div>
  );
};
