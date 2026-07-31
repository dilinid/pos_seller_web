import { useMemo, useState } from 'react';
import { ShoppingCart, Printer } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

interface PickupOrder {
  pickNo: string;
  orderNo: string;
  orderDate: string;
  customer: string;
  totalItems: number;
  status: 'Pending' | 'Picked';
}

interface PickupItem {
  code: string;
  name: string;
  location: string;
  qtyOrdered: number;
}

const INITIAL_ORDERS: PickupOrder[] = [
  { pickNo: 'PK-0001', orderNo: 'ORD-2025-000124', orderDate: '26/07/2025 10:15 AM', customer: 'Nimal Perera', totalItems: 3, status: 'Pending' },
  { pickNo: 'PK-0002', orderNo: 'ORD-2025-000125', orderDate: '26/07/2025 10:20 AM', customer: 'Kavindu Silva', totalItems: 2, status: 'Pending' },
  { pickNo: 'PK-0003', orderNo: 'ORD-2025-000126', orderDate: '26/07/2025 11:00 AM', customer: 'Tharushi Abey.', totalItems: 4, status: 'Pending' },
  { pickNo: 'PK-0004', orderNo: 'ORD-2025-000127', orderDate: '26/07/2025 11:30 AM', customer: 'Danushka Bandara', totalItems: 1, status: 'Pending' },
  { pickNo: 'PK-0005', orderNo: 'ORD-2025-000128', orderDate: '26/07/2025 12:10 PM', customer: 'Sanduni Fernando', totalItems: 2, status: 'Pending' },
];

const ITEMS_BY_PICK: Record<string, PickupItem[]> = {
  'PK-0001': [
    { code: 'HP1001', name: 'Wireless Headphone', location: 'A-01-02', qtyOrdered: 1 },
    { code: 'SW2001', name: 'Smart Watch', location: 'A-02-03', qtyOrdered: 1 },
    { code: 'BS3001', name: 'Bluetooth Speaker', location: 'B-01-04', qtyOrdered: 1 },
  ],
  'PK-0002': [
    { code: 'TS4002', name: 'Cotton T-Shirt (L)', location: 'C-03-01', qtyOrdered: 1 },
    { code: 'SN5003', name: 'Running Sneakers', location: 'C-04-02', qtyOrdered: 1 },
  ],
  'PK-0003': [
    { code: 'LP6001', name: 'Laptop Stand', location: 'A-05-01', qtyOrdered: 1 },
    { code: 'MS6002', name: 'Wireless Mouse', location: 'A-05-02', qtyOrdered: 2 },
    { code: 'KB6003', name: 'Mechanical Keyboard', location: 'A-05-03', qtyOrdered: 1 },
    { code: 'HD6004', name: 'HDMI Cable 2m', location: 'A-06-01', qtyOrdered: 1 },
  ],
  'PK-0004': [
    { code: 'PB7001', name: 'Power Bank 10000mAh', location: 'B-02-01', qtyOrdered: 1 },
  ],
  'PK-0005': [
    { code: 'BE8001', name: 'Bluetooth Earbuds', location: 'B-02-02', qtyOrdered: 1 },
    { code: 'PC8002', name: 'Phone Case', location: 'B-03-01', qtyOrdered: 1 },
  ],
};

const STATUS_STYLES: Record<PickupOrder['status'], { bg: string; color: string }> = {
  Pending: { bg: '#fef3c7', color: '#d97706' },
  Picked: { bg: '#dcfce7', color: '#16a34a' },
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

const SellerPickupList: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<PickupOrder[]>(INITIAL_ORDERS);
  const [selectedPickNo, setSelectedPickNo] = useState(INITIAL_ORDERS[0].pickNo);
  const [qtyToPick, setQtyToPick] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const items = useMemo(() => ITEMS_BY_PICK[selectedPickNo] ?? [], [selectedPickNo]);
  const selectedOrder = orders.find((o) => o.pickNo === selectedPickNo);
  const allChecked = items.length > 0 && items.every((i) => checkedItems[i.code]);

  const handleSelectPick = (pickNo: string) => {
    setSelectedPickNo(pickNo);
    setQtyToPick({});
    setCheckedItems({});
  };

  const handleQtyChange = (code: string, value: number, max: number) => {
    const clamped = Number.isNaN(value) ? 0 : Math.max(0, Math.min(value, max));
    setQtyToPick((prev) => ({ ...prev, [code]: clamped }));
  };

  const toggleItem = (code: string) => {
    setCheckedItems((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleAll = () => {
    const next = !allChecked;
    const updated: Record<string, boolean> = {};
    items.forEach((i) => {
      updated[i.code] = next;
    });
    setCheckedItems(updated);
  };

  const handleConfirmPicked = () => {
    setOrders((prev) =>
      prev.map((o) => (o.pickNo === selectedPickNo ? { ...o, status: 'Picked' } : o)),
    );
  };

  const handleCancel = () => {
    setQtyToPick({});
    setCheckedItems({});
  };

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-GB');
  const isConfirmDisabled = !selectedOrder || selectedOrder.status === 'Picked';

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

        <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Pick #</th>
                <th style={thStyle}>Order No</th>
                <th style={thStyle}>Order Date</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Total Items</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isSelected = order.pickNo === selectedPickNo;
                const statusStyle = STATUS_STYLES[order.status];
                return (
                  <tr
                    key={order.pickNo}
                    onClick={() => handleSelectPick(order.pickNo)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)' }}>{order.pickNo}</td>
                    <td style={tdStyle}>{order.orderNo}</td>
                    <td style={tdStyle}>{order.orderDate}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '36px' }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor: 'var(--primary)' }} />
                </th>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Item Code</th>
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Qty Ordered</th>
                <th style={thStyle}>Qty to Pick</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.code}>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.code]}
                      onChange={() => toggleItem(item.code)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </td>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)' }}>{item.code}</td>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{item.location}</td>
                  <td style={tdStyle}>{item.qtyOrdered}</td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      min={0}
                      max={item.qtyOrdered}
                      value={qtyToPick[item.code] ?? item.qtyOrdered}
                      onChange={(e) => handleQtyChange(item.code, Number(e.target.value), item.qtyOrdered)}
                      className="form-input"
                      style={{ width: '70px', padding: '6px 8px', fontSize: '0.85rem' }}
                    />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No items for this pick.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn"
            style={{ background: 'var(--primary)', color: '#ffffff' }}
          >
            <Printer size={16} />
            Print Pick Up List
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn"
            style={{ background: '#9ca3af', color: '#ffffff' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmPicked}
            disabled={isConfirmDisabled}
            className="btn btn-primary"
            style={isConfirmDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            {selectedOrder?.status === 'Picked' ? 'Picked ✓' : 'Confirm Picked'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerPickupList;
