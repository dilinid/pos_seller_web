import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Printer, Pencil, Eye, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import {
  fetchPickupList,
  fetchPickupDetail,
  printPickupOrder,
  updatePickupRemarks,
  confirmPickupOrder,
  type PickupOrder,
  type PickupItem,
} from '../apis/pickup.api';

const STATUS_STYLES: Record<PickupOrder['status'], { bg: string; color: string }> = {
  Pending: { bg: '#fef3c7', color: '#d97706' },
  Confirmed: { bg: '#dcfce7', color: '#16a34a' },
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '1px solid var(--border-color)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-color)',
  whiteSpace: 'nowrap',
};

function formatOrderDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function printPickupRecord(order: PickupOrder, items: PickupItem[]) {
  const rowsHtml = items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.itemCode}</td>
          <td>${item.itemName}</td>
          <td>${item.location}</td>
          <td>${item.qtyOrdered}</td>
        </tr>
      `,
    )
    .join('');

  const html = `
    <html>
      <head>
        <title>${order.pickNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h2 { margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; font-size: 13px; }
          th { background: #f3f4f6; text-transform: uppercase; font-size: 11px; }
        </style>
      </head>
      <body>
        <h2>Pick Up List — ${order.pickNo}</h2>
        <p>
          <strong>Order No:</strong> ${order.orderNo}<br/>
          <strong>Order Date:</strong> ${formatOrderDate(order.orderDate)}<br/>
          <strong>Customer:</strong> ${order.customer}<br/>
          <strong>Status:</strong> ${order.status}
          ${order.remarks ? `<br/><strong>Remarks:</strong> ${order.remarks}` : ''}
        </p>
        <table>
          <thead>
            <tr><th>#</th><th>Item Code</th><th>Item Name</th><th>Location</th><th>Qty Ordered</th></tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

const SellerPickupList: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [remarksDraft, setRemarksDraft] = useState<Record<string, string>>({});
  const [printingOrderNo, setPrintingOrderNo] = useState<string | null>(null);

  const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'view' | null>(null);
  const [items, setItems] = useState<PickupItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [qtyToPick, setQtyToPick] = useState<Record<number, number>>({});
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.orderNo === selectedOrderNo);
  const allChecked = items.length > 0 && items.every((i) => checkedItems[i.lineno]);
  const isEditing = viewMode === 'edit';

  const loadOrders = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchPickupList();
      setOrders(data);
      setRemarksDraft(Object.fromEntries(data.map((o) => [o.orderNo, o.remarks])));
    } catch {
      setLoadError('Failed to load the pick up list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const applyOrderUpdate = (updated: PickupOrder) => {
    setOrders((prev) => prev.map((o) => (o.orderNo === updated.orderNo ? updated : o)));
    setRemarksDraft((prev) => ({ ...prev, [updated.orderNo]: updated.remarks }));
  };

  const handlePrint = async (order: PickupOrder) => {
    setPrintingOrderNo(order.orderNo);
    try {
      const detail = await printPickupOrder(order.orderNo);
      applyOrderUpdate(detail.order);
      printPickupRecord(detail.order, detail.items);
    } catch {
      alert('Failed to print this pick up record. Please try again.');
    } finally {
      setPrintingOrderNo(null);
    }
  };

  const openOrder = async (order: PickupOrder, mode: 'edit' | 'view') => {
    setSelectedOrderNo(order.orderNo);
    setViewMode(mode);
    setQtyToPick({});
    setCheckedItems({});
    setConfirmError(null);
    setDetailLoading(true);
    try {
      const detail = await fetchPickupDetail(order.orderNo);
      setItems(detail.items);
      setQtyToPick(
        Object.fromEntries(detail.items.map((i) => [i.lineno, i.qtyPicked ?? i.qtyOrdered])),
      );
    } catch {
      setItems([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = (order: PickupOrder) => {
    if (order.status === 'Confirmed') return;
    openOrder(order, 'edit');
  };

  const handleView = (order: PickupOrder) => {
    openOrder(order, 'view');
  };

  const handleClose = () => {
    setSelectedOrderNo(null);
    setViewMode(null);
    setItems([]);
    setQtyToPick({});
    setCheckedItems({});
    setConfirmError(null);
  };

  const handleQtyChange = (lineno: number, value: number, max: number) => {
    const clamped = Number.isNaN(value) ? 0 : Math.max(0, Math.min(value, max));
    setQtyToPick((prev) => ({ ...prev, [lineno]: clamped }));
  };

  const toggleItem = (lineno: number) => {
    setCheckedItems((prev) => ({ ...prev, [lineno]: !prev[lineno] }));
  };

  const toggleAll = () => {
    const next = !allChecked;
    const updated: Record<number, boolean> = {};
    items.forEach((i) => {
      updated[i.lineno] = next;
    });
    setCheckedItems(updated);
  };

  const handleConfirmPicked = async () => {
    if (!selectedOrderNo) return;
    setConfirmSubmitting(true);
    setConfirmError(null);
    try {
      const payloadItems = items.map((i) => ({
        lineno: i.lineno,
        qtyPicked: qtyToPick[i.lineno] ?? i.qtyOrdered,
      }));
      const detail = await confirmPickupOrder(selectedOrderNo, payloadItems, remarksDraft[selectedOrderNo]);
      applyOrderUpdate(detail.order);
      handleClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to confirm this pick up. Please try again.';
      setConfirmError(message);
    } finally {
      setConfirmSubmitting(false);
    }
  };

  const handleRemarksChange = (orderNo: string, value: string) => {
    setRemarksDraft((prev) => ({ ...prev, [orderNo]: value }));
  };

  const handleRemarksBlur = async (order: PickupOrder) => {
    if (!order.pickNo) return; // no pos_itempick row yet — nothing to persist to
    const value = remarksDraft[order.orderNo] ?? '';
    if (value === order.remarks) return;
    try {
      const updated = await updatePickupRemarks(order.orderNo, value);
      applyOrderUpdate(updated);
    } catch {
      setRemarksDraft((prev) => ({ ...prev, [order.orderNo]: order.remarks }));
    }
  };

  const today = new Date().toLocaleDateString('en-GB');

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px' }}>Pick Up List</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Warehouse / picker view for outstanding customer orders
        </p>
      </div>

      <div className="premium-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingCart size={18} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Pick Up List</h3>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div><strong>Date:</strong> {today}</div>
            <div><strong>Picker:</strong> {user?.name || 'Unassigned'}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Loading pick up list…
          </div>
        ) : loadError ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>{loadError}</p>
            <button type="button" onClick={loadOrders} className="btn btn-primary">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No orders currently need picking.
          </div>
        ) : (
        <div style={{ overflowX: 'auto', marginBottom: selectedOrderNo ? '28px' : 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Pick #</th>
                <th style={thStyle}>Order No</th>
                <th style={thStyle}>Order Date</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Total Items</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Print</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isSelected = order.orderNo === selectedOrderNo;
                const statusStyle = STATUS_STYLES[order.status];
                const isConfirmed = order.status === 'Confirmed';
                const isPrinting = printingOrderNo === order.orderNo;
                return (
                  <tr
                    key={order.orderNo}
                    style={{ background: isSelected ? 'var(--primary-light)' : 'transparent' }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)' }}>
                      {order.pickNo || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>}
                    </td>
                    <td style={tdStyle}>{order.orderNo}</td>
                    <td style={tdStyle}>{formatOrderDate(order.orderDate)}</td>
                    <td style={tdStyle}>{order.customer}</td>
                    <td style={tdStyle}>{order.totalItems}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px',
                        borderRadius: '20px', background: statusStyle.bg, color: statusStyle.color,
                        whiteSpace: 'nowrap',
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => handlePrint(order)}
                        disabled={isPrinting}
                        title={order.pickNo ? 'Reprint this pick up record' : 'Print this pick up record'}
                        style={{
                          background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px',
                          padding: '5px 7px', cursor: isPrinting ? 'wait' : 'pointer',
                          color: 'var(--text-secondary)', display: 'inline-flex',
                        }}
                      >
                        {isPrinting ? <Loader2 size={14} className="spin" /> : <Printer size={14} />}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'normal' }}>
                      <input
                        type="text"
                        value={remarksDraft[order.orderNo] ?? ''}
                        onChange={(e) => handleRemarksChange(order.orderNo, e.target.value)}
                        onBlur={() => handleRemarksBlur(order)}
                        disabled={!order.pickNo}
                        placeholder={order.pickNo ? 'Add remarks' : 'Print to add remarks'}
                        className="form-input"
                        style={{ minWidth: '140px', padding: '5px 8px', fontSize: '0.8rem' }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(order)}
                          disabled={isConfirmed}
                          title={isConfirmed ? 'Confirmed pick ups cannot be edited' : 'Edit this pick up'}
                          style={{
                            background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px',
                            padding: '5px 7px', cursor: isConfirmed ? 'not-allowed' : 'pointer',
                            color: isConfirmed ? 'var(--text-muted)' : 'var(--primary)',
                            opacity: isConfirmed ? 0.5 : 1, display: 'inline-flex',
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleView(order)}
                          title="View this pick up"
                          style={{
                            background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px',
                            padding: '5px 7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'inline-flex',
                          }}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}

        {selectedOrderNo && selectedOrder && (
          <>
            {detailLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading items…
              </div>
            ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {isEditing && (
                      <th style={{ ...thStyle, width: '36px' }}>
                        <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor: 'var(--primary)' }} />
                      </th>
                    )}
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Item Code</th>
                    <th style={thStyle}>Item Name</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Qty Ordered</th>
                    <th style={thStyle}>{isEditing ? 'Qty to Pick' : 'Qty Picked'}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.lineno}>
                      {isEditing && (
                        <td style={tdStyle}>
                          <input
                            type="checkbox"
                            checked={!!checkedItems[item.lineno]}
                            onChange={() => toggleItem(item.lineno)}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                        </td>
                      )}
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)' }}>{item.itemCode}</td>
                      <td style={tdStyle}>{item.itemName}</td>
                      <td style={tdStyle}>{item.location}</td>
                      <td style={tdStyle}>{item.qtyOrdered}</td>
                      <td style={tdStyle}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            max={item.qtyOrdered}
                            value={qtyToPick[item.lineno] ?? item.qtyOrdered}
                            onChange={(e) => handleQtyChange(item.lineno, Number(e.target.value), item.qtyOrdered)}
                            className="form-input"
                            style={{ width: '70px', padding: '6px 8px', fontSize: '0.85rem' }}
                          />
                        ) : (
                          item.qtyPicked ?? item.qtyOrdered
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={isEditing ? 7 : 6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No items for this pick.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}

            {confirmError && (
              <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '12px', textAlign: 'right' }}>
                {confirmError}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn"
                    style={{ background: '#9ca3af', color: '#ffffff' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPicked}
                    disabled={confirmSubmitting || detailLoading}
                    className="btn btn-primary"
                    style={{ opacity: confirmSubmitting ? 0.6 : 1, cursor: confirmSubmitting ? 'wait' : 'pointer' }}
                  >
                    {confirmSubmitting ? 'Confirming…' : 'Confirm Picked'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn"
                  style={{ background: '#9ca3af', color: '#ffffff' }}
                >
                  Close
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SellerPickupList;
