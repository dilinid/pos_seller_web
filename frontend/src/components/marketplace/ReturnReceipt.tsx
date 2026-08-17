import type { OrderItem } from '../../types/marketplace.type';
import { formatCurrency } from '../../utils/currency';

interface ReturnReceiptProps {
  returnOrderId: string;
  originalOrderId: string;
  /** Where the original order was placed — resolved via the order's own
   * pos_loc (see OrderOut.originalLocationName/Address). Falls back to the
   * store's own name/pickup address if the location couldn't be resolved. */
  originalLocationName: string;
  originalLocationAddress: string;
  /** Where the buyer chose to drop off / ship back this return (see
   * ReturnRequestForm's location dropdown). */
  returnLocationName: string;
  returnLocationAddress: string;
  orderedAt: string;
  printedAt: Date;
  items: OrderItem[];
  totalAmount: number;
}

function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** Printable return receipt — rendered off-screen at all times (see .print-only
 * in index.css) and only made visible by the browser's print stylesheet, so it
 * never needs its own modal/dialog. */
export const ReturnReceipt: React.FC<ReturnReceiptProps> = ({
  returnOrderId, originalOrderId, originalLocationName, originalLocationAddress,
  returnLocationName, returnLocationAddress, orderedAt, printedAt, items, totalAmount,
}) => {
  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-sans)', color: '#000' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>Return Receipt</h1>
      <div style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Return Request No: {returnOrderId}</div>

      <table style={{ width: '100%', fontSize: '0.85rem', marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 600 }}>Original Order No:</td>
            <td style={{ padding: '2px 0' }}>{originalOrderId}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 600, verticalAlign: 'top' }}>Original Location:</td>
            <td style={{ padding: '2px 0' }}>{originalLocationName}{originalLocationAddress ? ` — ${originalLocationAddress}` : ''}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 600, verticalAlign: 'top' }}>Return Location:</td>
            <td style={{ padding: '2px 0' }}>{returnLocationName}{returnLocationAddress ? ` — ${returnLocationAddress}` : ''}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 600 }}>Ordered Date:</td>
            <td style={{ padding: '2px 0' }}>{orderedAt ? formatDateTime(orderedAt) : '—'}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 600 }}>Printed Date:</td>
            <td style={{ padding: '2px 0' }}>{formatDateTime(printedAt)}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '6px 4px' }}>Item</th>
            <th style={{ textAlign: 'right', padding: '6px 4px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '6px 4px' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '6px 4px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={`${item.productId}-${idx}`} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '6px 4px' }}>{item.productName}</td>
              <td style={{ textAlign: 'right', padding: '6px 4px' }}>{item.quantity} {item.unit}</td>
              <td style={{ textAlign: 'right', padding: '6px 4px' }}>{formatCurrency(item.price)}</td>
              <td style={{ textAlign: 'right', padding: '6px 4px' }}>{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'right', padding: '10px 4px 0', fontWeight: 700 }}>Total</td>
            <td style={{ textAlign: 'right', padding: '10px 4px 0', fontWeight: 700 }}>{formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
