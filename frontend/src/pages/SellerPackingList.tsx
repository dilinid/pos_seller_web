import { useEffect, useMemo, useState } from 'react';
import { PackageCheck, Printer, CheckCircle, ArrowLeft, Pencil, Eye } from 'lucide-react';
import {
  fetchPackageTypes,
  fetchPackingList,
  fetchPackingDetail,
  markPacked,
  updatePackingRemarks,
  markDelivered,
  type PackageType,
  type PackingOrder,
  type PackingDetail,
} from '../apis/packing.api';
import { fetchStaff, type StaffMember } from '../apis/staff.api';

const STATUS_STYLES: Record<PackingOrder['status'], { bg: string; color: string }> = {
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

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

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
  const [records, setRecords] = useState<PackingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [remarksDraft, setRemarksDraft] = useState<Record<string, string>>({});

  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);
  const [detail, setDetail] = useState<PackingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [packageTypeId, setPackageTypeId] = useState<number | ''>('');
  const [packerId, setPackerId] = useState<number | ''>('');
  const [weightInput, setWeightInput] = useState('');
  const [packSubmitting, setPackSubmitting] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [deliverSubmitting, setDeliverSubmitting] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchPackingList();
      setRecords(data);
      setRemarksDraft(Object.fromEntries(data.map((o) => [o.orderNo, o.remarks])));
    } catch {
      setLoadError('Failed to load the packing list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    fetchPackageTypes().then(setPackageTypes).catch(() => setPackageTypes([]));
    fetchStaff().then(setStaff).catch(() => setStaff([]));
  }, []);

  const applyOrderUpdate = (updated: PackingOrder) => {
    setRecords((prev) => prev.map((o) => (o.orderNo === updated.orderNo ? updated : o)));
    setRemarksDraft((prev) => ({ ...prev, [updated.orderNo]: updated.remarks }));
  };

  const handleOpenRecord = async (orderNo: string) => {
    setSelectedOrderNo(orderNo);
    setDetailLoading(true);
    setPackError(null);
    setPackageTypeId('');
    setPackerId('');
    setWeightInput('');
    try {
      const data = await fetchPackingDetail(orderNo);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedOrderNo(null);
    setDetail(null);
    setPackError(null);
  };

  const handleRemarksChange = (orderNo: string, value: string) => {
    setRemarksDraft((prev) => ({ ...prev, [orderNo]: value }));
  };

  const handleRemarksBlur = async (order: PackingOrder) => {
    if (!order.packNo) return; // no pos_itempack row yet — nothing to persist to
    const value = remarksDraft[order.orderNo] ?? '';
    if (value === order.remarks) return;
    try {
      const updated = await updatePackingRemarks(order.orderNo, value);
      applyOrderUpdate(updated);
    } catch {
      setRemarksDraft((prev) => ({ ...prev, [order.orderNo]: order.remarks }));
    }
  };

  const handleMarkPacked = async () => {
    if (!selectedOrderNo) return;
    const weight = Number(weightInput);
    if (packageTypeId === '' || packerId === '' || Number.isNaN(weight) || weight <= 0) {
      setPackError('Select a package type, a packer, and enter a valid weight.');
      return;
    }
    setPackSubmitting(true);
    setPackError(null);
    try {
      const updated = await markPacked(selectedOrderNo, {
        packageTypeId: Number(packageTypeId),
        packerId: Number(packerId),
        weight,
        remarks: remarksDraft[selectedOrderNo],
      });
      setDetail(updated);
      applyOrderUpdate(updated.order);
    } catch (err) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to mark this order as packed. Please try again.';
      setPackError(message);
    } finally {
      setPackSubmitting(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedOrderNo || !detail) return;
    window.print();
    if (detail.order.status !== 'Packed & Ready') return; // already Delivered — just reprint
    setDeliverSubmitting(true);
    try {
      const updated = await markDelivered(selectedOrderNo);
      setDetail(updated);
      applyOrderUpdate(updated.order);
    } catch {
      // printing already happened; surface nothing further, list will just retain its status
    } finally {
      setDeliverSubmitting(false);
    }
  };

  if (!selectedOrderNo) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px' }}>Packing List</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Packer view for confirming picked orders before shipping
          </p>
        </div>

        <div className="premium-card" style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading packing list…
            </div>
          ) : loadError ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>{loadError}</p>
              <button type="button" onClick={loadRecords} className="btn btn-primary">Retry</button>
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No confirmed pick ups are waiting to be packed.
            </div>
          ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Pack #</th>
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
                    <tr key={r.orderNo}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {r.packNo || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.orderNo}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.customer}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.totalItems}</td>
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
                          value={remarksDraft[r.orderNo] ?? ''}
                          onChange={(e) => handleRemarksChange(r.orderNo, e.target.value)}
                          onBlur={() => handleRemarksBlur(r)}
                          disabled={!r.packNo}
                          placeholder={r.packNo ? 'Add remarks' : 'Pack to add remarks'}
                          className="form-input"
                          style={{ minWidth: '140px', padding: '5px 8px', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenRecord(r.orderNo)}
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
                            onClick={() => handleOpenRecord(r.orderNo)}
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
          )}
        </div>
      </div>
    );
  }

  const record = detail?.order;
  const items = detail?.items ?? [];
  const isPending = record?.status === 'Pending';
  const canPrint = !!record && record.status !== 'Pending';

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
        {detailLoading || !record ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Loading…
          </div>
        ) : (
        <>
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
            <div><strong>Pack #:</strong> {record.packNo || '—'}</div>
            <div><strong>Date:</strong> {formatDate(record.date)}</div>
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
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{record.shippingAddress || '—'}</div>
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
              {items.map((item, index) => (
                <tr key={item.lineno}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--primary)' }}>{item.itemCode}</td>
                  <td style={tdStyle}>{item.itemName}</td>
                  <td style={tdStyle}>{item.qtyOrdered}</td>
                  <td style={tdStyle}>{item.qtyPicked ?? '—'}</td>
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
            {isPending ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Package Type
                  <select
                    value={packageTypeId}
                    onChange={(e) => setPackageTypeId(e.target.value ? Number(e.target.value) : '')}
                    className="form-input"
                    style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }}
                  >
                    <option value="">Select a package type…</option>
                    {packageTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.type}
                        {t.length && t.width && t.height ? ` (${t.length} x ${t.width} x ${t.height} cm)` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Packer
                  <select
                    value={packerId}
                    onChange={(e) => setPackerId(e.target.value ? Number(e.target.value) : '')}
                    className="form-input"
                    style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }}
                  >
                    <option value="">Select a packer…</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Weight (kg)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="form-input"
                    style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }}
                  />
                </label>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Package Type</span>
                <span style={{ fontWeight: 600 }}>{record.packageType || '—'}</span>
                <span style={{ color: 'var(--text-muted)' }}>Weight</span>
                <span style={{ fontWeight: 600 }}>{record.weight != null ? `${record.weight} kg` : '—'}</span>
                <span style={{ color: 'var(--text-muted)' }}>Dimensions</span>
                <span style={{ fontWeight: 600 }}>{record.dimensions || '—'}</span>
                <span style={{ color: 'var(--text-muted)' }}>Packed By</span>
                <span style={{ fontWeight: 600 }}>{record.packedBy || '—'}</span>
              </div>
            )}
          </div>

          <div className="premium-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px' }}>Notes</h4>
            <p style={{ fontSize: '0.85rem', margin: '0 0 16px' }}>{record.remarks || 'No remarks added.'}</p>
            {record.packNo && <Barcode value={record.packNo} />}
          </div>
        </div>

        {packError && (
          <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'right' }}>{packError}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!canPrint || deliverSubmitting}
            className="btn"
            style={{
              background: 'var(--primary)', color: '#ffffff',
              opacity: canPrint ? 1 : 0.5, cursor: canPrint ? 'pointer' : 'not-allowed',
            }}
            title={canPrint ? 'Print packing list' : 'Mark as packed & ready before printing'}
          >
            <Printer size={16} />
            {deliverSubmitting ? 'Printing…' : 'Print Packing List'}
          </button>
          <button
            type="button"
            onClick={handleMarkPacked}
            disabled={!isPending || packSubmitting}
            className="btn"
            style={{
              background: '#16a34a', color: '#ffffff',
              opacity: !isPending || packSubmitting ? 0.6 : 1,
              cursor: !isPending || packSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            <CheckCircle size={16} />
            {isPending ? (packSubmitting ? 'Marking…' : 'Mark as Packed & Ready') : 'Packed & Ready ✓'}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default SellerPackingList;
