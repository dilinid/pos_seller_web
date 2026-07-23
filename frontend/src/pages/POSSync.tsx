import { useEffect, useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { usePushItemStore } from '../stores/push-item.store';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { PushItemCard } from '../components/seller/PushItemCard';
import { PushItemDetailDrawer } from '../components/seller/PushItemDetailDrawer';
import { PublishConfirmModal } from '../components/seller/PublishConfirmModal';
import type { PushItem } from '../types/push-item.type';
import type { Product } from '../types/marketplace.type';

const POSSync: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const items = usePushItemStore((s) => s.items);
  const updatePriceQuantity = usePushItemStore((s) => s.updatePriceQuantity);
  const publishItem = usePushItemStore((s) => s.publishItem);
  const seedMockData = usePushItemStore((s) => s.seedMockData);
  const addProduct = useMarketplaceStore((s) => s.addProduct);

  const [pendingPublish, setPendingPublish] = useState<PushItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<PushItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user?.id) seedMockData(user.id);
  }, [user?.id, seedMockData]);

  const pending = items.filter(
    (i) => i.userId === user?.id && i.status === 'ready_to_publish'
  );
  const published = items.filter(
    (i) => i.userId === user?.id && i.status === 'published'
  );

  const handlePriceChange = useCallback((itemId: string, price: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item) updatePriceQuantity(itemId, price, item.quantity, item.mrp, item.reorderLevel);
  }, [updatePriceQuantity, items]);

  const handleMrpChange = useCallback((itemId: string, mrp: number | undefined) => {
    const item = items.find((i) => i.id === itemId);
    if (item) updatePriceQuantity(itemId, item.price, item.quantity, mrp, item.reorderLevel);
  }, [updatePriceQuantity, items]);

  const handleQuantityChange = useCallback((itemId: string, quantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item) updatePriceQuantity(itemId, item.price, quantity, item.mrp, item.reorderLevel);
  }, [updatePriceQuantity, items]);

  const handleReorderLevelChange = useCallback((itemId: string, reorderLevel: number | undefined) => {
    const item = items.find((i) => i.id === itemId);
    if (item) updatePriceQuantity(itemId, item.price, item.quantity, item.mrp, reorderLevel);
  }, [updatePriceQuantity, items]);

  const handlePublish = useCallback((item: PushItem) => {
    setPendingPublish(item);
  }, []);

  const handleViewDetails = useCallback((item: PushItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const confirmPublish = useCallback(() => {
    if (!pendingPublish) return;

    const published = publishItem(pendingPublish.id);
    if (!published) {
      setToast({ type: 'error', message: 'Failed to publish item.' });
      setPendingPublish(null);
      return;
    }

    const newProduct: Product = {
      id: `product_${published.id}`,
      name: published.name,
      price: published.price,
      mrp: published.mrp,
      categoryId: published.categoryId,
      subCategoryId: published.subCategoryId,
      sellerId: published.sellerId,
      unit: published.unit,
      image: published.image,
      images: published.images,
      description: published.description,
      rating: 0,
      reviewCount: 0,
      features: published.features,
      specifications: published.specifications,
    };

    addProduct(newProduct);
    setPendingPublish(null);
    setToast({ type: 'success', message: `"${published.name}" published to marketplace!` });
  }, [pendingPublish, publishItem, addProduct]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1100,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 18px', borderRadius: '12px',
          background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: toast.type === 'success' ? '#16a34a' : '#dc2626',
          fontSize: '0.85rem', fontWeight: 500,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px', marginLeft: '4px', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {pendingPublish && (
        <PublishConfirmModal
          item={pendingPublish}
          onConfirm={confirmPublish}
          onCancel={() => setPendingPublish(null)}
        />
      )}

      {selectedItem && (
        <PushItemDetailDrawer
          item={selectedItem}
          published={selectedItem.status === 'published'}
          onClose={handleCloseDetails}
          onPriceChange={handlePriceChange}
          onMrpChange={handleMrpChange}
          onQuantityChange={handleQuantityChange}
          onReorderLevelChange={handleReorderLevelChange}
          onPublish={handlePublish}
        />
      )}

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            POS Sync
          </h2>
          {pending.length > 0 && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              background: 'var(--primary-light)', color: 'var(--primary)',
              padding: '2px 10px', borderRadius: '20px',
            }}>
              +{pending.length} pending
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Products synced from your POS system to the marketplace
        </p>
      </div>

      {pending.length + published.length === 0 ? (
        <div className="pos-empty">
          <Upload size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>
            No Synced Products Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: 0 }}>
            When your POS system pushes products to the marketplace, they will appear here for review and publishing.
          </p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div className="pos-section-title">
                Pending Sync
                <span className="pos-section-count">{pending.length}</span>
              </div>
              <div className="pos-items-list">
                {pending.map((item) => (
                  <PushItemCard
                    key={item.id}
                    item={item}
                    onPriceChange={handlePriceChange}
                    onMrpChange={handleMrpChange}
                    onQuantityChange={handleQuantityChange}
                    onReorderLevelChange={handleReorderLevelChange}
                    onPublish={handlePublish}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {published.length > 0 && (
            <div>
              <div className="pos-section-title">
                Published
                <span className="pos-section-count">{published.length}</span>
              </div>
              <div className="pos-items-list">
                {published.map((item) => (
                  <div key={item.id} className="pos-item-card pos-item-published" onClick={() => handleViewDetails(item)} style={{ cursor: 'pointer' }}>
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
                          <span className="pos-item-badge pos-badge-published">Published</span>
                        </div>
                        <div className="pos-item-meta" style={{ marginTop: '8px' }}>
                          <span>${item.price.toFixed(2)}</span>
                          {item.mrp != null && <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.78rem' }}>${item.mrp.toFixed(2)}</span>}
                          <span>Qty: {item.quantity}</span>
                          {item.reorderLevel != null && <span>Reorder: {item.reorderLevel}</span>}
                          <span>
                            Published {item.publishedAt
                              ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default POSSync;
