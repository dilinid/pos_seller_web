import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useProductDraftStore } from '../stores/product-draft.store';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { ProductCard } from '../components/seller/ProductCard';
import { ProductDetailDrawer } from '../components/seller/ProductDetailDrawer';
import type { ProductDraftStatus } from '../types/product-draft.type';
import type { ProductDraft } from '../types/product-draft.type';

type TabFilter = 'all' | ProductDraftStatus;

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending_review', label: 'Pending' },
  { key: 'draft', label: 'Drafts' },
];

const SellerProducts: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const drafts = useProductDraftStore((s) => s.items);
  const updateDraft = useProductDraftStore((s) => s.updateDraft);
  const submitForReview = useProductDraftStore((s) => s.submitForReview);
  const publishDraft = useProductDraftStore((s) => s.publishDraft);
  const marketplaceProducts = useMarketplaceStore((s) => s.products);

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<ProductDraft | null>(null);

  const sellerDrafts = useMemo(
    () => drafts.filter((d) => d.sellerUserId === user?.id),
    [drafts, user?.id]
  );

  const filtered = useMemo(() => {
    if (activeTab === 'all') return sellerDrafts;
    return sellerDrafts.filter((d) => d.status === activeTab);
  }, [sellerDrafts, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sellerDrafts.length };
    for (const d of sellerDrafts) {
      counts[d.status] = (counts[d.status] || 0) + 1;
    }
    return counts;
  }, [sellerDrafts]);

  const handlePriceChange = useCallback((id: string, price: number) => {
    updateDraft(id, { price });
    const draft = drafts.find((d) => d.id === id);
    if (draft?.publishedProductId) {
      useMarketplaceStore.getState().updateProduct(draft.publishedProductId, { price });
    }
    setSelectedDraft((prev) => prev && prev.id === id ? { ...prev, price } : prev);
  }, [updateDraft, drafts]);

  const handleMrpChange = useCallback((id: string, mrp: number | undefined) => {
    updateDraft(id, { mrp });
    const draft = drafts.find((d) => d.id === id);
    if (draft?.publishedProductId) {
      useMarketplaceStore.getState().updateProduct(draft.publishedProductId, { mrp });
    }
    setSelectedDraft((prev) => prev && prev.id === id ? { ...prev, mrp } : prev);
  }, [updateDraft, drafts]);

  const handleQuantityChange = useCallback((id: string, quantity: number) => {
    updateDraft(id, { quantity });
    setSelectedDraft((prev) => prev && prev.id === id ? { ...prev, quantity } : prev);
  }, [updateDraft]);

  const handleReorderLevelChange = useCallback((id: string, reorderLevel: number | undefined) => {
    updateDraft(id, { reorderLevel });
    const draft = drafts.find((d) => d.id === id);
    if (draft?.publishedProductId) {
      useMarketplaceStore.getState().updateProduct(draft.publishedProductId, { reorderLevel });
    }
    setSelectedDraft((prev) => prev && prev.id === id ? { ...prev, reorderLevel } : prev);
  }, [updateDraft, drafts]);

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    try {
      await submitForReview(id);
    } finally {
      setSubmitting(null);
    }
  };

  const handlePublish = (id: string) => {
    setPublishing(id);
    publishDraft(id);
    setPublishing(null);
    setSelectedDraft(null);
  };

  const handleViewDetails = useCallback((draft: ProductDraft) => {
    setSelectedDraft(draft);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedDraft(null);
  }, []);

  const sellerPublishedCount = marketplaceProducts.filter(
    (p) => p.sellerId === user?.id
  ).length;

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '60px 20px' }}><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;
  }

  return (
    <div>
      {selectedDraft && (
        <ProductDetailDrawer
          draft={selectedDraft}
          onClose={handleCloseDetails}
          onPriceChange={handlePriceChange}
          onMrpChange={handleMrpChange}
          onQuantityChange={handleQuantityChange}
          onReorderLevelChange={handleReorderLevelChange}
          onSubmit={handleSubmit}
          onPublish={handlePublish}
          submitting={submitting === selectedDraft.id}
          publishing={publishing === selectedDraft.id}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 2px' }}>Products</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            {sellerDrafts.length} product{sellerDrafts.length !== 1 ? 's' : ''} · {sellerPublishedCount} published in marketplace
          </p>
        </div>
        <button onClick={() => navigate('/seller/products/add')} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="prod-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`prod-tab${activeTab === tab.key ? ' active' : ''}`}
          >
            {tab.label}
            {(tabCounts[tab.key] ?? 0) > 0 && (
              <span className="prod-tab-count">{tabCounts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="pos-empty" style={{ marginTop: '24px' }}>
          <Package size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>
            {activeTab === 'all' ? 'No Products Yet' : `No ${activeTab} Products`}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 16px' }}>
            {activeTab === 'all'
              ? 'Add your first product to start selling on the marketplace'
              : `No products with "${activeTab}" status`}
          </p>
          {activeTab === 'all' && (
            <button onClick={() => navigate('/seller/products/add')} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '24px', fontSize: '0.85rem' }}>
              Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="pos-items-list">
          {filtered.map((draft) => (
            <ProductCard
              key={draft.id}
              draft={draft}
              onPriceChange={handlePriceChange}
              onMrpChange={handleMrpChange}
              onQuantityChange={handleQuantityChange}
              onReorderLevelChange={handleReorderLevelChange}
              onSubmit={handleSubmit}
              onPublish={handlePublish}
              onViewDetails={handleViewDetails}
              submitting={submitting === draft.id}
              publishing={publishing === draft.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
