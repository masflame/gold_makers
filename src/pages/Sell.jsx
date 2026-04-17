import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ChevronRight, Check, DollarSign, ArrowLeft, Camera, X } from 'lucide-react';
import { brands, categories, products } from '../data/products';
import CustomSelect from '../components/CustomSelect';
import { validatePersonalInfo, isValid } from '../utils/validate';

const STEPS = [
  'Item Details',
  'Condition',
  'Personal Info',
  'Review & Agreement',
  'Confirmation',
];

const WATCH_MODELS = {};
products
  .filter((p) => p.category === 'watches')
  .forEach((p) => {
    if (!WATCH_MODELS[p.brand]) WATCH_MODELS[p.brand] = new Set();
    if (p.ref) WATCH_MODELS[p.brand].add(p.ref);
    if (p.name && p.name !== 'Index Htm') WATCH_MODELS[p.brand].add(p.name);
  });

Object.keys(WATCH_MODELS).forEach((b) => {
  WATCH_MODELS[b] = [...WATCH_MODELS[b]].sort();
});

const ITEM_CATEGORIES = categories.map((c) => c.name);

function getPhotoSlots(category) {
  const common = [
    { key: 'box', label: 'Original Box' },
    { key: 'receipt', label: 'Proof of Purchase' },
    { key: 'extra', label: 'Additional' },
  ];
  switch (category) {
    case 'Watches':
      return [
        { key: 'front', label: 'Front / Dial' },
        { key: 'back', label: 'Caseback' },
        { key: 'side', label: 'Side Profile' },
        { key: 'serial', label: 'Serial / Model No.' },
        { key: 'papers', label: 'Papers / Certificate' },
        ...common,
      ];
    case 'Rings':
    case 'Wedding Bands':
      return [
        { key: 'front', label: 'Top View' },
        { key: 'side', label: 'Side Profile' },
        { key: 'inner', label: 'Inner Band / Hallmark' },
        { key: 'worn', label: 'On-Hand / Scale' },
        { key: 'papers', label: 'Certificate / Valuation' },
        ...common,
      ];
    case 'Necklaces':
    case 'Pendants':
      return [
        { key: 'front', label: 'Full Front View' },
        { key: 'pendant', label: 'Pendant Close-Up' },
        { key: 'clasp', label: 'Clasp / Hallmark' },
        { key: 'papers', label: 'Certificate / Valuation' },
        ...common,
      ];
    case 'Earrings':
      return [
        { key: 'front', label: 'Front View (Pair)' },
        { key: 'back', label: 'Back / Fastening' },
        { key: 'detail', label: 'Stone Close-Up' },
        { key: 'papers', label: 'Certificate / Valuation' },
        ...common,
      ];
    case 'Bracelets':
      return [
        { key: 'front', label: 'Full Front View' },
        { key: 'clasp', label: 'Clasp Close-Up' },
        { key: 'detail', label: 'Detail / Hallmark' },
        { key: 'worn', label: 'On-Wrist / Scale' },
        { key: 'papers', label: 'Certificate / Valuation' },
        ...common,
      ];
    default:
      return [
        { key: 'front', label: 'Front View' },
        { key: 'back', label: 'Back View' },
        { key: 'detail', label: 'Detail Close-Up' },
        { key: 'papers', label: 'Certificate / Valuation' },
        ...common,
      ];
  }
}

export default function Sell() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    itemCategory: '',
    itemCategoryManual: '',
    showCategoryManual: false,
    brand: '',
    brandManual: '',
    showBrandManual: false,
    model: '',
    modelManual: '',
    showModelManual: false,
    description: '',
    photos: {},
    hasBox: '',
    hasPapers: '',
    hasReceipt: '',
    isUnworn: '',
    year: '',
    expectedPrice: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    idNumber: '',
    idPhoto: null,
    agreedTerms: false,
    signature: '',
  });

  const sigCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const touch = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const isWatch = form.itemCategory === 'Watches';
  const availableModels = isWatch && form.brand ? WATCH_MODELS[form.brand] || [] : [];

  const canNext = () => {
    if (step === 0) {
      const hasCat = form.itemCategory || form.itemCategoryManual;
      if (isWatch) {
        const hasBrand = form.brand || form.brandManual;
        return hasCat && hasBrand;
      }
      return !!hasCat;
    }
    if (step === 1) return form.hasBox && form.hasPapers && form.hasReceipt && form.isUnworn;
    if (step === 2) {
      const errs = validatePersonalInfo(form);
      return isValid(errs);
    }
    if (step === 3) return form.agreedTerms && form.signature.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step === 2) {
      const errs = validatePersonalInfo(form);
      setErrors(errs);
      setTouched(Object.keys(errs).reduce((a, k) => ({ ...a, [k]: true }), {}));
      if (!isValid(errs)) return;
    }
    if (canNext()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSlotUpload = (slotKey, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set('photos', { ...form.photos, [slotKey]: url });
    e.target.value = '';
  };

  const removeSlotPhoto = (slotKey) => {
    const updated = { ...form.photos };
    if (updated[slotKey]) URL.revokeObjectURL(updated[slotKey]);
    delete updated[slotKey];
    set('photos', updated);
  };

  /* Signature pad */
  const startDraw = (e) => {
    setIsDrawing(true);
    const ctx = sigCanvasRef.current.getContext('2d');
    const rect = sigCanvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = sigCanvasRef.current.getContext('2d');
    const rect = sigCanvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A2B3C';
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const endDraw = () => {
    setIsDrawing(false);
    if (sigCanvasRef.current) set('signature', sigCanvasRef.current.toDataURL());
  };
  const clearSig = () => {
    const ctx = sigCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
    set('signature', '');
  };

  return (
    <div className="service-page">
      <div className="service-page-inner">
        <Link to="/" className="service-back"><ArrowLeft size={16} /> Back to Home</Link>

        <div className="service-header">
          <h1>Sell for Cash</h1>
          <p className="service-tagline">Get an offer in 48 hours. Ship for free. Get paid within 10 days. No fees. No hidden costs.</p>
        </div>

        {/* Progress stepper */}
        <div className="stepper">
          {STEPS.map((label, i) => (
            <div key={label} className={`stepper-step ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`}>
              <div className="stepper-circle">{i < step ? <Check size={14} /> : i + 1}</div>
              <span className="stepper-label">{label}</span>
              {i < STEPS.length - 1 && <div className="stepper-line" />}
            </div>
          ))}
        </div>

        {/* ---- STEP 0: Item Details ---- */}
        {step === 0 && (
          <div className="service-step">
            <h2>Item Details</h2>

            <label className="field-label">Item Category</label>
            {!form.showCategoryManual ? (
              <>
                <CustomSelect
                  value={form.itemCategory}
                  onChange={(val) => set('itemCategory', val)}
                  options={ITEM_CATEGORIES}
                  placeholder="Select category..."
                />
                <button type="button" className="cant-find" onClick={() => set('showCategoryManual', true)}>Can't find it?</button>
              </>
            ) : (
              <input className="field-input" placeholder="Type category manually..." value={form.itemCategoryManual} onChange={(e) => set('itemCategoryManual', e.target.value)} />
            )}

            {isWatch && (
              <>
                <label className="field-label">Brand</label>
                {!form.showBrandManual ? (
                  <>
                    <CustomSelect
                      value={form.brand}
                      onChange={(val) => set('brand', val)}
                      options={brands.map((b) => ({ value: b.name, label: b.name }))}
                      placeholder="Select brand..."
                    />
                    <button type="button" className="cant-find" onClick={() => set('showBrandManual', true)}>Can't find it?</button>
                  </>
                ) : (
                  <input className="field-input" placeholder="Type brand manually..." value={form.brandManual} onChange={(e) => set('brandManual', e.target.value)} />
                )}

                <label className="field-label">Model / Reference</label>
                {!form.showModelManual ? (
                  <>
                    <CustomSelect
                      value={form.model}
                      onChange={(val) => set('model', val)}
                      options={availableModels}
                      placeholder="Select model..."
                      disabled={!form.brand || availableModels.length === 0}
                    />
                    <button type="button" className="cant-find" onClick={() => set('showModelManual', true)}>Can't find it?</button>
                  </>
                ) : (
                  <input className="field-input" placeholder="Type model or reference..." value={form.modelManual} onChange={(e) => set('modelManual', e.target.value)} />
                )}
              </>
            )}

            <label className="field-label">Description / Additional Details</label>
            <textarea className="field-textarea" rows={3} placeholder="Material, size, stone details, any damage..." value={form.description} onChange={(e) => set('description', e.target.value)} />

            <label className="field-label">Photos</label>
            <p className="photo-guide-hint">Upload clear photos for each category below to help us assess your item accurately.</p>
            <div className="photo-guide-grid">
              {getPhotoSlots(form.itemCategory).map((slot) => (
                <div key={slot.key} className={`photo-guide-slot${form.photos[slot.key] ? ' filled' : ''}`}> 
                  {form.photos[slot.key] ? (
                    <>
                      <img src={form.photos[slot.key]} alt={slot.label} className="photo-guide-img" />
                      <button type="button" className="photo-guide-remove" onClick={() => removeSlotPhoto(slot.key)}><X size={14} /></button>
                    </>
                  ) : (
                    <label className="photo-guide-upload">
                      <Camera size={20} />
                      <span className="photo-guide-label">{slot.label}</span>
                      <input type="file" accept="image/*" hidden onChange={(e) => handleSlotUpload(slot.key, e)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- STEP 1: Condition ---- */}
        {step === 1 && (
          <div className="service-step">
            <h2>Item Condition</h2>

            <div className="yn-group">
              <label className="field-label">Do you have the original box?</label>
              <div className="yn-btns">
                <button className={form.hasBox === 'yes' ? 'active' : ''} onClick={() => set('hasBox', 'yes')}>Yes</button>
                <button className={form.hasBox === 'no' ? 'active' : ''} onClick={() => set('hasBox', 'no')}>No</button>
              </div>
            </div>
            <div className="yn-group">
              <label className="field-label">Do you have the original papers?</label>
              <div className="yn-btns">
                <button className={form.hasPapers === 'yes' ? 'active' : ''} onClick={() => set('hasPapers', 'yes')}>Yes</button>
                <button className={form.hasPapers === 'no' ? 'active' : ''} onClick={() => set('hasPapers', 'no')}>No</button>
              </div>
            </div>
            <div className="yn-group">
              <label className="field-label">Do you have proof of purchase?</label>
              <div className="yn-btns">
                <button className={form.hasReceipt === 'yes' ? 'active' : ''} onClick={() => set('hasReceipt', 'yes')}>Yes</button>
                <button className={form.hasReceipt === 'no' ? 'active' : ''} onClick={() => set('hasReceipt', 'no')}>No</button>
              </div>
            </div>
            <div className="yn-group">
              <label className="field-label">Is your item unworn with factory stickers intact?</label>
              <div className="yn-btns">
                <button className={form.isUnworn === 'yes' ? 'active' : ''} onClick={() => set('isUnworn', 'yes')}>Yes</button>
                <button className={form.isUnworn === 'no' ? 'active' : ''} onClick={() => set('isUnworn', 'no')}>No</button>
              </div>
            </div>

            <label className="field-label">What year is your item?</label>
            <CustomSelect
              value={form.year}
              onChange={(val) => set('year', val)}
              options={Array.from({ length: 40 }, (_, i) => String(2026 - i))}
              placeholder="Select year..."
            />

            <label className="field-label">How much are you expecting? (ZAR)</label>
            <div className="price-input-wrap">
              <span className="price-prefix">R</span>
              <input className="field-input price-input" type="number" placeholder="e.g. 50000" value={form.expectedPrice} onChange={(e) => set('expectedPrice', e.target.value)} />
            </div>
          </div>
        )}

        {/* ---- STEP 2: Personal Info ---- */}
        {step === 2 && (
          <div className="service-step">
            <h2>Personal Information</h2>
            <div className="form-grid-2">
              <div className={touched.fullName && errors.fullName ? 'field-group has-error' : 'field-group'}>
                <label className="field-label">Full Name *</label>
                <input className="field-input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} onBlur={() => { touch('fullName'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                {touched.fullName && errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className={touched.email && errors.email ? 'field-group has-error' : 'field-group'}>
                <label className="field-label">Email Address *</label>
                <input className="field-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={() => { touch('email'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className={touched.phone && errors.phone ? 'field-group has-error' : 'field-group'}>
                <label className="field-label">Phone Number *</label>
                <input className="field-input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => { touch('phone'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                {touched.phone && errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className={touched.idNumber && errors.idNumber ? 'field-group has-error' : 'field-group'}>
                <label className="field-label">SA ID Number *</label>
                <input className="field-input" maxLength={13} inputMode="numeric" pattern="\d{13}" value={form.idNumber} onChange={(e) => set('idNumber', e.target.value.replace(/\D/g, '').slice(0, 13))} onBlur={() => { touch('idNumber'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                <span className="field-hint">13-digit South African ID number</span>
                {touched.idNumber && errors.idNumber && <span className="field-error">{errors.idNumber}</span>}
              </div>
              <div className={touched.address && errors.address ? 'field-group has-error span-2' : 'field-group span-2'}>
                <label className="field-label">Street Address *</label>
                <input className="field-input" value={form.address} onChange={(e) => set('address', e.target.value)} onBlur={() => { touch('address'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                {touched.address && errors.address && <span className="field-error">{errors.address}</span>}
              </div>
              <div className={touched.city && errors.city ? 'field-group has-error' : 'field-group'}>
                <label className="field-label">City *</label>
                <input className="field-input" value={form.city} onChange={(e) => set('city', e.target.value)} onBlur={() => { touch('city'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                {touched.city && errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className={touched.province && errors.province ? 'field-group has-error' : 'field-group'}>
                <label className="field-label">Province *</label>
                <input className="field-input" value={form.province} onChange={(e) => set('province', e.target.value)} onBlur={() => { touch('province'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                {touched.province && errors.province && <span className="field-error">{errors.province}</span>}
              </div>
              <div className={touched.postalCode && errors.postalCode ? 'field-group has-error' : 'field-group'}>
                <label className="field-label">Postal Code *</label>
                <input className="field-input" maxLength={4} inputMode="numeric" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, '').slice(0, 4))} onBlur={() => { touch('postalCode'); setErrors((prev) => ({ ...prev, ...validatePersonalInfo(form) })); }} />
                {touched.postalCode && errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
              </div>
              <div className="field-group">
                <label className="field-label">Upload ID Document</label>
                <label className="photo-upload-btn compact">
                  <Upload size={16} />
                  <span>{form.idPhoto ? 'Uploaded' : 'Choose file'}</span>
                  <input type="file" accept="image/*,.pdf" hidden onChange={(e) => set('idPhoto', e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ---- STEP 3: Review & Agreement ---- */}
        {step === 3 && (
          <div className="service-step">
            <h2>Review & Legal Agreement</h2>

            <div className="review-summary">
              <h3>Item Summary</h3>
              <div className="review-row"><span>Category:</span><span>{form.itemCategory || form.itemCategoryManual}</span></div>
              {(form.brand || form.brandManual) && <div className="review-row"><span>Brand:</span><span>{form.brand || form.brandManual}</span></div>}
              {(form.model || form.modelManual) && <div className="review-row"><span>Model:</span><span>{form.model || form.modelManual}</span></div>}
              <div className="review-row"><span>Original Box:</span><span>{form.hasBox === 'yes' ? 'Yes' : 'No'}</span></div>
              <div className="review-row"><span>Original Papers:</span><span>{form.hasPapers === 'yes' ? 'Yes' : 'No'}</span></div>
              <div className="review-row"><span>Proof of Purchase:</span><span>{form.hasReceipt === 'yes' ? 'Yes' : 'No'}</span></div>
              <div className="review-row"><span>Condition:</span><span>{form.isUnworn === 'yes' ? 'Unworn' : 'Pre-owned'}</span></div>
              {form.year && <div className="review-row"><span>Year:</span><span>{form.year}</span></div>}
              {form.expectedPrice && <div className="review-row"><span>Expected Price:</span><span>R {Number(form.expectedPrice).toLocaleString()}</span></div>}

              <h3>Personal Details</h3>
              <div className="review-row"><span>Name:</span><span>{form.fullName}</span></div>
              <div className="review-row"><span>Email:</span><span>{form.email}</span></div>
              <div className="review-row"><span>Phone:</span><span>{form.phone}</span></div>
              <div className="review-row"><span>ID Number:</span><span>{form.idNumber}</span></div>
              <div className="review-row"><span>Address:</span><span>{form.address}, {form.city}, {form.province} {form.postalCode}</span></div>
            </div>

            <div className="legal-doc">
              <h3>Sale Agreement</h3>
              <div className="legal-text">
                <p><strong>GOLD MAKERS (PTY) LTD - OUTRIGHT SALE AGREEMENT</strong></p>
                <p>Date: {new Date().toLocaleDateString('en-ZA')}</p>
                <p>Seller: {form.fullName} (ID: {form.idNumber})</p>
                <br/>
                <p>1. <strong>Transfer of Ownership:</strong> By signing this agreement, I ({form.fullName}) hereby transfer full ownership of the item described above to Gold Makers (Pty) Ltd.</p>
                <p>2. <strong>Valuation:</strong> I understand that Gold Makers will authenticate and appraise my item within 1-2 business days of receiving it. The final offer may differ from any preliminary estimate.</p>
                <p>3. <strong>Payment Terms:</strong> Upon acceptance of the final offer, payment of up to 75% of the appraised value will be disbursed via bank transfer (EFT) within 24 hours.</p>
                <p>4. <strong>Authentication:</strong> If the item does not pass authentication or its condition differs materially from the description provided, Gold Makers reserves the right to revise the offer or return the item at no cost to the seller.</p>
                <p>5. <strong>Timeline:</strong> Day 1-2: Shipping. Day 3-4: Authentication. Day 5: Offer. Day 6-10: Payment.</p>
                <p>6. <strong>Anti-Money Laundering (AML):</strong> In compliance with the Financial Intelligence Centre Act (FICA), I confirm my identity and the lawful provenance of this item.</p>
                <p>7. <strong>Cooling-Off Period:</strong> The seller may cancel this agreement within 5 business days of signing, provided the item has not yet been resold.</p>
                <p>8. <strong>Governing Law:</strong> This agreement is governed by the laws of the Republic of South Africa.</p>
              </div>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" checked={form.agreedTerms} onChange={(e) => set('agreedTerms', e.target.checked)} />
              I have read and agree to the Sale Agreement terms and conditions
            </label>

            <div className="sig-section">
              <label className="field-label">Your Signature</label>
              <canvas
                ref={sigCanvasRef}
                width={400}
                height={120}
                className="sig-canvas"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              <button type="button" className="btn-clear-sig" onClick={clearSig}>Clear Signature</button>
            </div>
          </div>
        )}

        {/* ---- STEP 4: Confirmation ---- */}
        {step === 4 && (
          <div className="service-step confirmation-step">
            <div className="confirm-icon"><Check size={48} /></div>
            <h2>Application Submitted</h2>
            <p>Thank you, <strong>{form.fullName}</strong>. Your sale request has been received.</p>
            <p>Reference: <strong>SELL-{Date.now().toString(36).toUpperCase()}</strong></p>

            <div className="status-tracker">
              <h3>Your Progress</h3>
              <div className="tracker-steps">
                {[
                  { label: 'Submitted', desc: 'Your item details have been received', done: true },
                  { label: 'Under Review', desc: 'Our team reviews your form, details & photos', done: false },
                  { label: 'Collection Scheduled', desc: 'Our courier will collect your item at a convenient time', done: false },
                  { label: 'Authenticating', desc: 'Our gemologists inspect your item', done: false },
                  { label: 'Offer Ready', desc: 'Accept or decline the final valuation', done: false },
                  { label: 'Payment Sent', desc: 'Cash deposited via EFT within 24 hours', done: false },
                ].map((t, i) => (
                  <div key={i} className={`tracker-step ${t.done ? 'done' : ''}`}>
                    <div className="tracker-dot">{t.done ? <Check size={12} /> : i + 1}</div>
                    <div>
                      <strong>{t.label}</strong>
                      <span>{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/" className="btn btn-dark" style={{ marginTop: 24 }}>Return Home</Link>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="service-nav">
            {step > 0 && <button className="btn btn-outline" onClick={prev}>Back</button>}
            <button className="btn btn-dark" onClick={next} disabled={!canNext()}>
              {step === 3 ? 'Submit Application' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
