import { useMemo, useState } from 'react';
import { PackageCheck, Printer, CheckCircle, ArrowLeft, Pencil, Eye } from 'lucide-react';

type PackingStatus = 'Pending' |  'Packed & Ready'  | 'Delivered';

interface PackingItem {
  code: string;
  name: string;
  qtyOrdered: number;
  qtyPicked: number;
  packed: boolean;
}

interface PackingRecord {
  packNo: string;
  date: string;
  orderNo: string;
  customer: string;
  shippingAddress: string;
  items: PackingItem[];
  packageType: string;
  weight: string;
  dimensions: string;
  packedBy: string;
  notes: string;
  status: PackingStatus;
  remarks: string;
}

const INITIAL_RECORDS: PackingRecord[] = [
  {
    packNo: 'PL-0001',
    date: '26/07/2025 01:15 PM',
    orderNo: 'ORD-2025-000124',
    customer: 'Nimal Perera',
    shippingAddress: 'No. 45, Galle Road, Colombo 03',
    items: [
      { code: 'HP1001', name: 'Wireless Headphone', qtyOrdered: 1, qtyPicked: 1, packed: true },
      { code: 'SW2001', name: 'Smart Watch', qtyOrdered: 1, qtyPicked: 1, packed: true },
      { code: 'BS3001', name: 'Bluetooth Speaker', qtyOrdered: 1, qtyPicked: 1, packed: true },
    ],
    packageType: 'Medium Box',
    weight: '1.25 kg',
    dimensions: '25 x 18 x 10 cm',
    packedBy: 'Saman Perera',
    notes: 'Thank you for shopping with us!',
    status: 'Pending',
    remarks: '',
  },
  {
    packNo: 'PL-0002',
    date: '26/07/2025 02:05 PM',
    orderNo: 'ORD-2025-000125',
    customer: 'Kavindu Silva',
    shippingAddress: 'No. 12, Kandy Road, Kurunegala',
    items: [
      { code: 'TS4002', name: 'Cotton T-Shirt (L)', qtyOrdered: 1, qtyPicked: 1, packed: true },
      { code: 'SN5003', name: 'Running Sneakers', qtyOrdered: 1, qtyPicked: 1, packed: true },
    ],
    packageType: 'Small Box',
    weight: '0.85 kg',
    dimensions: '20 x 15 x 10 cm',
    packedBy: 'Saman Perera',
    notes: 'Handle with care - fragile item inside.',
    status: 'Pending',
    remarks: '',
  },
  {
    packNo: 'PL-0003',
    date: '26/07/2025 02:40 PM',
    orderNo: 'ORD-2025-000126',
    customer: 'Tharushi Abey.',
    shippingAddress: 'No. 78, Negombo Road, Gampaha',
    items: [
      { code: 'LP6001', name: 'Laptop Stand', qtyOrdered: 1, qtyPicked: 1, packed: true },
      { code: 'MS6002', name: 'Wireless Mouse', qtyOrdered: 2, qtyPicked: 2, packed: true },
      { code: 'KB6003', name: 'Mechanical Keyboard', qtyOrdered: 1, qtyPicked: 1, packed: true },
      { code: 'HD6004', name: 'HDMI Cable 2m', qtyOrdered: 1, qtyPicked: 1, packed: true },
    ],
    packageType: 'Large Box',
    weight: '3.40 kg',
    dimensions: '40 x 30 x 20 cm',
    packedBy: 'Ruwan Jayasuriya',
    notes: 'Thank you for shopping with us!',
    status: 'Pending',
    remarks: '',
  },
  {
    packNo: 'PL-0004',
    date: '26/07/2025 03:10 PM',
    orderNo: 'ORD-2025-000127',
    customer: 'Danushka Bandara',
    shippingAddress: 'No. 5, Station Road, Matara',
    items: [
      { code: 'PB7001', name: 'Power Bank 10000mAh', qtyOrdered: 1, qtyPicked: 1, packed: true },
    ],
    packageType: 'Small Box',
    weight: '0.45 kg',
    dimensions: '15 x 12 x 8 cm',
    packedBy: 'Saman Perera',
    notes: 'Thank you for shopping with us!',
    status: 'Pending',
    remarks: '',
  },
  {
    packNo: 'PL-0005',
    date: '26/07/2025 03:45 PM',
    orderNo: 'ORD-2025-000128',
    customer: 'Sanduni Fernando',
    shippingAddress: 'No. 23, Temple Lane, Kandy',
    items: [
      { code: 'BE8001', name: 'Bluetooth Earbuds', qtyOrdered: 1, qtyPicked: 1, packed: true },
      { code: 'PC8002', name: 'Phone Case', qtyOrdered: 1, qtyPicked: 1, packed: true },
    ],
    packageType: 'Small Box',
    weight: '0.60 kg',
    dimensions: '18 x 14 x 8 cm',
    packedBy: 'Ruwan Jayasuriya',
    notes: 'Thank you for shopping with us!',
    status: 'Pending',
    remarks: '',
  },
];

const STATUS_STYLES: Record<PackingStatus, { bg: string; color: string }> = {
  Pending: { bg: '#fef3c7', color: '#d97706' },
  'Packed & Ready': { bg: '#dcfce7', color: '#16a34a' },
  Delivered: { bg: '#dbeafe', color: '#2563eb' },
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
};

// Deterministic pseudo-barcode bars derived from the pack number, purely decorative.
function Barcode({ value }: { value: string }) {
  const bars = useMemo(
    () => value.split('').map((ch, i) => 2 + ((ch.charCodeAt(0) + i * 7) % 5)),
    [value],
  );
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px', height: '46px' }}>
        {bars.map((w, i) => (
          <div key={i} style={{ width: `${w}px`, height: '100%', background: '#111827' }} />
        ))}
      </div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', marginTop: '6px' }}>
        {value}
      </div>
    </div>
  );
}

const SellerPackingList: React.FC = () => {
  const [records, setRecords] = useState<PackingRecord[]>(INITIAL_RECORDS);
  const [selectedPackNo, setSelectedPackNo] = useState<string | null>(null);

  const record = useMemo(
    () => records.find((r) => r.packNo === selectedPackNo) ?? null,
    [records, selectedPackNo],
  );

  const handleOpenRecord = (packNo: string) => {
    setSelectedPackNo(packNo);
  };

  const handleBackToList = () => {
    setSelectedPackNo(null);
  };

  const handleRemarksChange = (packNo: string, value: string) => {
    setRecords((prev) => prev.map((r) => (r.packNo === packNo ? { ...r, remarks: value } : r)));
  };

  const handleMarkPacked = () => {
    if (!selectedPackNo) return;
    setRecords((prev) =>
      prev.map((r) => (r.packNo === selectedPackNo ? { ...r, status: 'Packed & Ready' } : r)),
    );
  };

  const handlePrint = () => {
    if (!selectedPackNo) return;
    window.print();
    setRecords((prev) =>
      prev.map((r) => (r.packNo === selectedPackNo ? { ...r, status: 'Delivered' } : r)),
    );
  };

  if (!record) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px' }}>Packing List</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Packer view for confirming picked orders before shipping
          </p>
        </div>

        <div className="premium-card" style={{ padding: '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Pack List No</th>
                  <th style={thStyle}>Order No</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Total Items</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Remarks</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const statusStyle = STATUS_STYLES[r.status];
                  const isLocked = r.status !== 'Pending';
                  return (
                    <tr key={r.packNo}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{r.packNo}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.orderNo}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.date}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.customer}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.items.length}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px',
                          borderRadius: '20px', background: statusStyle.bg, color: statusStyle.color,
                          whiteSpace: 'nowrap',
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'normal' }}>
                        <input
                          type="text"
                          value={r.remarks}
                          onChange={(e) => handleRemarksChange(r.packNo, e.target.value)}
                          placeholder="Add remarks"
                          className="form-input"
                          style={{ minWidth: '140px', padding: '5px 8px', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenRecord(r.packNo)}
                            disabled={isLocked}
                            title={isLocked ? 'Packed & ready records cannot be edited' : 'Edit this packing list'}
                            style={{
                              background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px',
                              padding: '5px 7px', cursor: isLocked ? 'not-allowed' : 'pointer',
                              color: isLocked ? 'var(--text-muted)' : 'var(--primary)',
                              opacity: isLocked ? 0.5 : 1, display: 'inline-flex',
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRecord(r.packNo)}
                            title="View this packing list"
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
        </div>
      </div>
    );
  }

  const canPrint = record.status !== 'Pending';

  return (
    <div>
      <button
        type="button"
        onClick={handleBackToList}
        className="prod-back-btn"
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to Packing List
      </button>

      <div className="premium-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PackageCheck size={18} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Packing List</h3>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div><strong>Pack List No:</strong> {record.packNo}</div>
            <div><strong>Date:</strong> {record.date}</div>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', alignItems: 'start', padding: '16px', borderRadius: '10px',
          background: 'var(--bg-secondary)', marginBottom: '24px',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Order No</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{record.orderNo}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{record.customer}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Shipping Address</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{record.shippingAddress}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Item Code</th>
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Qty Ordered</th>
                <th style={thStyle}>Qty Picked</th>
                <th style={thStyle}>Packed</th>
              </tr>
            </thead>
            <tbody>
              {record.items.map((item, index) => (
                <tr key={item.code}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)' }}>{item.code}</td>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{item.qtyOrdered}</td>
                  <td style={tdStyle}>{item.qtyPicked}</td>
                  <td style={tdStyle}>
                    {item.packed ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '22px', height: '22px', borderRadius: '6px',
                        background: '#dcfce7', color: '#16a34a',
                      }}>
                        <CheckCircle size={14} />
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="premium-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px' }}>Packaging Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '10px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Package Type</span>
              <span style={{ fontWeight: 600 }}>{record.packageType}</span>
              <span style={{ color: 'var(--text-muted)' }}>Weight</span>
              <span style={{ fontWeight: 600 }}>{record.weight}</span>
              <span style={{ color: 'var(--text-muted)' }}>Dimensions</span>
              <span style={{ fontWeight: 600 }}>{record.dimensions}</span>
              <span style={{ color: 'var(--text-muted)' }}>Packed By</span>
              <span style={{ fontWeight: 600 }}>{record.packedBy}</span>
            </div>
          </div>

          <div className="premium-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px' }}>Notes</h4>
            <p style={{ fontSize: '0.85rem', margin: '0 0 16px' }}>{record.notes}</p>
            <Barcode value={record.packNo} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!canPrint}
            className="btn"
            style={{
              background: 'var(--primary)', color: '#ffffff',
              opacity: canPrint ? 1 : 0.5, cursor: canPrint ? 'pointer' : 'not-allowed',
            }}
            title={canPrint ? 'Print packing list' : 'Mark as packed & ready before printing'}
          >
            <Printer size={16} />
            Print Packing List
          </button>
          <button
            type="button"
            onClick={handleMarkPacked}
            disabled={record.status !== 'Pending'}
            className="btn"
            style={{
              background: '#16a34a', color: '#ffffff',
              opacity: record.status !== 'Pending' ? 0.6 : 1,
              cursor: record.status !== 'Pending' ? 'not-allowed' : 'pointer',
            }}
          >
            <CheckCircle size={16} />
            {record.status === 'Pending' ? 'Mark as Packed & Ready' : 'Packed & Ready ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerPackingList;
