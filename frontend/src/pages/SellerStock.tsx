import { useMemo, useState } from 'react';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useProductDraftStore } from '../stores/product-draft.store';
import { StockItemRow } from '../components/seller/StockItemRow';
import { StockBadge } from '../components/ui/StockBadge';
import { sortByStockPriority, groupByStockStatus, isLowStock } from '../utils/stock.utils';

const SellerStock: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const drafts = useProductDraftStore((s) => s.items);
  const [searchQuery, setSearchQuery] = useState('');

  const sellerDrafts = useMemo(
    () => drafts.filter((d) => d.sellerUserId === user?.id),
    [drafts, user?.id]
  );

  const filtered = useMemo(() => {
    let result = sortByStockPriority(sellerDrafts);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || d.unit.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sellerDrafts, searchQuery]);

  const { lowStock, inStock } = useMemo(() => groupByStockStatus(filtered), [filtered]);

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '60px 20px' }}><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <button onClick={() => navigate('/seller/products')} className="prod-back-btn">
            <ArrowLeft size={16} /> Back to Products
          </button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 2px' }}>
            Stock Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            {sellerDrafts.length} product{sellerDrafts.length !== 1 ? 's' : ''} ·{' '}
            {lowStock.length} low stock · {sellerDrafts.filter((d) => d.quantity <= 0).length} out of stock
          </p>
        </div>
      </div>

      <div className="stock-search">
        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="stock-search-input"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="pos-empty" style={{ marginTop: '24px' }}>
          <Package size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>
            {searchQuery ? 'No matching products' : 'No Products'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            {searchQuery ? 'Try a different search term' : 'Add products to start tracking stock'}
          </p>
        </div>
      ) : (
        <div className="stock-list">
          {lowStock.length > 0 && (
            <>
              <div className="stock-section-header">
                Low Stock / Out of Stock
                <StockBadge quantity={0} reorderLevel={0} size="sm" />
              </div>
              {lowStock.map((draft) => (
                <StockItemRow key={draft.id} draft={draft} />
              ))}
            </>
          )}

          {inStock.length > 0 && (
            <>
              <div className="stock-section-header" style={{ marginTop: lowStock.length > 0 ? '16px' : 0 }}>
                In Stock
              </div>
              {inStock.map((draft) => (
                <StockItemRow key={draft.id} draft={draft} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerStock;
