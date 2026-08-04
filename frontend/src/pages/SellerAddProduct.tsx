import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useSellerStore } from '../stores/seller.store';
import { useProductDraftStore } from '../stores/product-draft.store';
import { MARKETPLACE_CATEGORIES } from '../data/categories';
import { EmojiPicker } from '../components/seller/EmojiPicker';
import { FeatureEditor } from '../components/seller/FeatureEditor';
import { SpecEditor } from '../components/seller/SpecEditor';
import { ProductStatusBadge } from '../components/seller/ProductStatusBadge';
import { SuccessOverlay } from '../components/seller/SuccessOverlay';
import type { SellerProfile } from '../types/seller.type';

function hasDeliveryConfig(profile: SellerProfile): boolean {
  return Object.keys(profile.districtFees ?? {}).length > 0
    && (profile.weightFeeBrackets ?? []).length > 0;
}

function hasPickupConfig(profile: SellerProfile): boolean {
  return (profile.pickupAddress ?? '').trim().length > 0;
}

const SellerAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { draftId } = useParams<{ draftId: string }>();
  const user = useAuthStore((s) => s.user);
  const sellerProfile = useSellerStore((s) => s.profile);
  const items = useProductDraftStore((s) => s.items);
  const saveDraft = useProductDraftStore((s) => s.saveDraft);
  const updateDraft = useProductDraftStore((s) => s.updateDraft);
  const submitForReview = useProductDraftStore((s) => s.submitForReview);

  const isEdit = !!draftId;
  const existingDraft = isEdit ? items.find((d) => d.id === draftId) : undefined;
  const isPublished = existingDraft?.status === 'published';
  const isApproved = existingDraft?.status === 'approved';
  const canEditAll = true;

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showDraftOverlay, setShowDraftOverlay] = useState(false);
  const [needsReReview, setNeedsReReview] = useState(false);

  const categories = MARKETPLACE_CATEGORIES;
  const currentCategory = categories.find((c) => c.id === categoryId);
  const subCategories = (currentCategory as any)?.subCategories ?? [];

  useEffect(() => {
    if (existingDraft) {
      setName(existingDraft.name);
      setUnit(existingDraft.unit);
      setCategoryId(existingDraft.categoryId);
      setSubCategoryId(existingDraft.subCategoryId);
      setDescription(existingDraft.description);
      setImage(existingDraft.image);
      setImages(existingDraft.images);
      setPrice(String(existingDraft.price));
      setMrp(existingDraft.mrp != null ? String(existingDraft.mrp) : '');
      setQuantity(String(existingDraft.quantity));
      setReorderLevel(existingDraft.reorderLevel != null ? String(existingDraft.reorderLevel) : '');
      setWeight(existingDraft.weight != null ? String(existingDraft.weight) : '');
      setVolume(existingDraft.volume != null ? String(existingDraft.volume) : '');
      setFeatures(existingDraft.features);
      setSpecifications(existingDraft.specifications);
      setDeliveryAvailable(existingDraft.deliveryAvailable);
      setPickupAvailable(existingDraft.pickupAvailable);
    }
  }, [existingDraft]);

  const FAST_TRACK_FIELDS = new Set(['price', 'mrp', 'quantity', 'reorderLevel']);

  function detectChanges(): { fastTrackOnly: boolean; changedFields: string[] } {
    if (!existingDraft) return { fastTrackOnly: true, changedFields: [] };
    const current = collectData();
    const changed: string[] = [];
    const draft = existingDraft;
    if (current.price !== draft.price) changed.push('price');
    if (current.mrp !== draft.mrp) changed.push('mrp');
    if (current.quantity !== draft.quantity) changed.push('quantity');
    if (current.name !== draft.name) changed.push('name');
    if (current.description !== draft.description) changed.push('description');
    if (current.categoryId !== draft.categoryId) changed.push('categoryId');
    if (current.subCategoryId !== draft.subCategoryId) changed.push('subCategoryId');
    if (current.unit !== draft.unit) changed.push('unit');
    if (current.image !== draft.image) changed.push('image');
    if (JSON.stringify(current.images) !== JSON.stringify(draft.images)) changed.push('images');
    if (current.weight !== draft.weight) changed.push('weight');
    if (current.volume !== draft.volume) changed.push('volume');
    if (JSON.stringify(current.features) !== JSON.stringify(draft.features)) changed.push('features');
    if (JSON.stringify(current.specifications) !== JSON.stringify(draft.specifications)) changed.push('specifications');
    if (current.deliveryAvailable !== draft.deliveryAvailable) changed.push('deliveryAvailable');
    if (current.pickupAvailable !== draft.pickupAvailable) changed.push('pickupAvailable');
    const fullReview = changed.filter((f) => !FAST_TRACK_FIELDS.has(f));
    return { fastTrackOnly: fullReview.length === 0, changedFields: changed };
  }

  useEffect(() => {
    if (!existingDraft) { setNeedsReReview(false); return; }
    const { fastTrackOnly } = detectChanges();
    if (isPublished || isApproved) {
      setNeedsReReview(!fastTrackOnly);
    } else {
      setNeedsReReview(false);
    }
  });


  const collectData = () => ({
    name,
    description,
    categoryId,
    subCategoryId,
    unit,
    image: image || '📦',
    images,
    price: parseFloat(price) || 0,
    mrp: mrp ? parseFloat(mrp) : undefined,
    quantity: parseInt(quantity, 10) || 0,
    reorderLevel: reorderLevel ? parseInt(reorderLevel, 10) : undefined,
    weight: weight ? parseFloat(weight) : null,
    volume: volume ? parseFloat(volume) : null,
    features,
    specifications,
    deliveryAvailable,
    pickupAvailable,
  });

  const validate = (): string | null => {
    if (!name.trim()) return 'Product name is required';
    if (!unit.trim()) return 'Unit is required';
    if (!categoryId) return 'Category is required';
    if (!subCategoryId) return 'Subcategory is required';
    if (!description.trim()) return 'Description is required';
    if (!price || parseFloat(price) <= 0) return 'Price must be greater than 0';
    if (mrp && parseFloat(mrp) <= parseFloat(price)) return 'MRP must be higher than the selling price';
    if (!quantity || parseInt(quantity, 10) < 0) return 'Quantity is required';

    if (!deliveryAvailable && !pickupAvailable) {
      return 'Select at least one delivery option (Delivery or Pickup) for this product.';
    }
    if (deliveryAvailable && !hasDeliveryConfig(sellerProfile)) {
      return 'Configure your delivery settings (district fees and weight brackets) in your Seller Profile before offering delivery.';
    }
    if (pickupAvailable && !hasPickupConfig(sellerProfile)) {
      return 'Add your pickup address in your Seller Profile before offering pickup.';
    }

    return null;
  };

  const handleSaveDraft = () => {
    if (!user?.id) return;
    const err = validate();
    if (err) { setStatusMsg({ type: 'error', text: err }); return; }

    if (isEdit && existingDraft) {
      updateDraft(existingDraft.id, collectData());
    } else {
      saveDraft(user.id, collectData());
    }
    setShowDraftOverlay(true);
  };

  const handleQuickSave = async () => {
    if (!user?.id || !existingDraft) return;
    const err = validate();
    if (err) { setStatusMsg({ type: 'error', text: err }); return; }
    updateDraft(existingDraft.id, collectData());
    setShowDraftOverlay(true);
  };

  const handleSubmitForReview = async () => {
    if (!user?.id) return;
    const err = validate();
    if (err) { setStatusMsg({ type: 'error', text: err }); return; }

    let draftIdToSubmit = existingDraft?.id;

    if (!draftIdToSubmit) {
      const draft = saveDraft(user.id, collectData());
      draftIdToSubmit = draft.id;
    } else {
      updateDraft(existingDraft!.id, collectData());
    }

    setSubmitting(true);
    setStatusMsg(null);
    try {
      await submitForReview(draftIdToSubmit);
      setShowSuccessOverlay(true);
    } catch {
      setStatusMsg({ type: 'error', text: 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '60px 20px' }}><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;
  }

  return (
    <div>
      {statusMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: '10px', marginBottom: '20px',
          background: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: statusMsg.type === 'success' ? '#16a34a' : '#dc2626',
          fontSize: '0.85rem', fontWeight: 500,
        }}>
          {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {statusMsg.text}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <button onClick={() => navigate('/seller/products')} className="prod-back-btn">
            <ArrowLeft size={16} /> Back to Products
          </button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 2px' }}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            {isEdit ? 'Update your product details' : 'Create a new product listing for the marketplace'}
          </p>
        </div>
        {existingDraft && <ProductStatusBadge status={existingDraft.status} />}
      </div>

      {(isPublished || isApproved) && needsReReview && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
          background: '#fffbeb', border: '1px solid #fde68a',
          color: '#92400e', fontSize: '0.85rem', lineHeight: 1.5,
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>{isPublished ? 'Editing Published Product' : 'Editing Approved Product'}</strong><br />
            {isPublished ? (
              <>Changes to <strong>Name, Description, Images, Features, and other details</strong> will remove this product from the marketplace until re-approved. Price and quantity updates take effect immediately.</>
            ) : (
              <>Changes to <strong>Name, Description, Images, Features, and other details</strong> will require re-approval before you can publish. Price and quantity updates are saved without re-approval.</>
            )}
          </div>
        </div>
      )}

      {(isPublished || isApproved) && !needsReReview && existingDraft && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          color: '#166534', fontSize: '0.85rem', lineHeight: 1.5,
        }}>
          <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Fast-track Update</strong><br />
            {isPublished
              ? 'Only Price, MRP, and Quantity are changing. These updates take effect immediately without admin review.'
              : 'Only Price, MRP, and Quantity are changing. These updates are saved and will apply when you publish.'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Basic Information */}
        <div className="prod-section-card">
          <div className="prod-section-title">
            <span className="prod-section-icon">📋</span> Basic Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Product Name *</label>
              <input
                type="text" className="form-input"
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Whole Milk"
                disabled={!canEditAll}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Unit *</label>
              <input
                type="text" className="form-input"
                value={unit} onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 1L Carton"
                disabled={!canEditAll}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category *</label>
              <select className="form-input" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); }} disabled={!canEditAll}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subcategory *</label>
              <select className="form-input" value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} disabled={!canEditAll || !categoryId}>
                <option value="">Select subcategory</option>
                {subCategories.map((sc: any) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Description *</label>
            <textarea
              className="form-input" rows={4}
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product in detail..."
              disabled={!canEditAll}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>
        </div>

        {/* Media */}
        <div className="prod-section-card">
          <div className="prod-section-title">
            <span className="prod-section-icon">🖼️</span> Media
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Main Image</label>
              <EmojiPicker value={image} onChange={setImage} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Additional Images</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-flex' }}>
                    <span style={{ fontSize: '1.5rem', cursor: 'default' }}>{img}</span>
                    {canEditAll && (
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, j) => j !== i))}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          width: '16px', height: '16px', borderRadius: '50%',
                          background: '#fee2e2', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, color: '#dc2626', fontSize: '10px',
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {canEditAll && (
                  <EmojiPicker
                    value=""
                    onChange={(emoji) => setImages([...images, emoji])}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="prod-section-card">
          <div className="prod-section-title">
            <span className="prod-section-icon">💰</span> Pricing & Stock
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Price (Rs.) *</label>
              <input
                type="number" step="0.01" min="0" className="form-input"
                value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">MRP (Rs.) <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.72rem' }}>Original price</span></label>
              <input
                type="number" step="0.01" min="0" className="form-input"
                value={mrp} onChange={(e) => setMrp(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Quantity in Stock *</label>
              <input
                type="number" step="1" min="0" className="form-input"
                value={quantity} onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Reorder Level</label>
              <input
                type="number" step="1" min="0" className="form-input"
                value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Weight (kg)</label>
              <input
                type="number" step="0.01" min="0" className="form-input"
                value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 1.5"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Volume (m³)</label>
              <input
                type="number" step="0.01" min="0" className="form-input"
                value={volume} onChange={(e) => setVolume(e.target.value)}
                placeholder="e.g. 0.02"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="prod-section-card">
          <div className="prod-section-title">
            <span className="prod-section-icon">🏷️</span> Features
          </div>
          <FeatureEditor features={features} onChange={setFeatures} disabled={!canEditAll} />
        </div>

        {/* Specifications */}
        <div className="prod-section-card">
          <div className="prod-section-title">
            <span className="prod-section-icon">📊</span> Specifications
          </div>
          <SpecEditor specifications={specifications} onChange={setSpecifications} disabled={!canEditAll} />
        </div>

        {/* Delivery Options */}
        <div className="prod-section-card">
          <div className="prod-section-title">
            <span className="prod-section-icon">🚚</span> Delivery Options
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
            <label className="prod-check-label">
              <input type="checkbox" checked={deliveryAvailable} onChange={(e) => setDeliveryAvailable(e.target.checked)} disabled={!canEditAll} />
              Delivery Available
            </label>
            <label className="prod-check-label">
              <input type="checkbox" checked={pickupAvailable} onChange={(e) => setPickupAvailable(e.target.checked)} disabled={!canEditAll} />
              Pickup Available
            </label>
          </div>
          {(!deliveryAvailable && !pickupAvailable) && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', background: '#fef2f2',
              border: '1px solid #fecaca', fontSize: '0.82rem', color: '#dc2626',
            }}>
              <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Select at least Delivery or Pickup for this product.
            </div>
          )}
          {deliveryAvailable && !hasDeliveryConfig(sellerProfile) && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', background: '#fffbeb',
              border: '1px solid #fde68a', fontSize: '0.82rem', color: '#92400e',
            }}>
              <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Configure district fees and weight brackets in your{' '}
              <Link to="/seller/settings" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Seller Profile
              </Link>{' '}
              before offering delivery.
            </div>
          )}
          {pickupAvailable && !hasPickupConfig(sellerProfile) && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', background: '#fffbeb',
              border: '1px solid #fde68a', fontSize: '0.82rem', color: '#92400e',
            }}>
              <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Add your pickup address in your{' '}
              <Link to="/seller/settings" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Seller Profile
              </Link>{' '}
              before offering pickup.
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="prod-form-footer">
        <button onClick={() => navigate('/seller/products')} className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem' }}>
          Cancel
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canEditAll && (
            <button onClick={handleSaveDraft} className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> Save as Draft
            </button>
          )}
          {isPublished || isApproved ? (
            needsReReview ? (
              <button
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {submitting ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit for Re-Review</>
                )}
              </button>
            ) : (
              <button
                onClick={handleQuickSave}
                disabled={submitting || detectChanges().changedFields.length === 0}
                className="btn btn-primary"
                style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={16} /> Save Changes
              </button>
            )
          ) : (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {submitting ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
              ) : (
                <><Send size={16} /> Submit for Review</>
              )}
            </button>
          )}
        </div>
      </div>
      <SuccessOverlay
        visible={showDraftOverlay}
        title={(isPublished || isApproved) && !needsReReview ? 'Changes Saved!' : 'Saved!'}
        message={(isPublished || isApproved) && !needsReReview
          ? isPublished
            ? 'Price and quantity updates are now live in the marketplace.'
            : 'Price and quantity updates are saved. You can publish when ready.'
          : isEdit ? 'Your changes have been saved.' : 'Your draft has been saved.'}
        duration={2000}
        onClose={() => navigate('/seller/products')}
      />
      <SuccessOverlay
        visible={showSuccessOverlay}
        title={isPublished || isApproved ? 'Submitted for Re-Review' : 'Product Approved!'}
        message={
          isPublished
            ? 'Your product has been removed from the marketplace and submitted for re-approval. It will reappear once approved.'
            : isApproved
              ? 'Your product has been submitted for re-approval. You can publish it once approved.'
              : 'Your product has been approved. Redirecting to your products...'
        }
        onClose={() => navigate('/seller/products')}
      />
    </div>
  );
};

export default SellerAddProduct;
