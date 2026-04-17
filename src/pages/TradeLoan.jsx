import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ChevronRight, Check, Banknote, ArrowLeft, Camera, X } from 'lucide-react';
import { brands, categories, products } from '../data/products';
import CustomSelect from '../components/CustomSelect';
import { validatePersonalInfo, isValid } from '../utils/validate';

const STEPS = [
  'Item Details',
  'Condition',
  'Loan Details',
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

function calcFees(principal) {
  const p = Number(principal) || 0;
  return {
    day30: p,
    day45: Math.round(p * 1.05),
    day60: Math.round(p * 1.10),
  };
}

export default function TradeLoan() {
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
    estimatedValue: '',
    desiredLoanAmount: '',
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

  const maxLoan = Math.round(Number(form.estimatedValue || 0) * 0.65);
  const fees = calcFees(form.desiredLoanAmount || maxLoan);

  const canNext = () => {
    if (step === 0) {
      const hasCat = form.itemCategory || form.itemCategoryManual;
      if (isWatch) return hasCat && (form.brand || form.brandManual);
      return !!hasCat;
    }
    if (step === 1) return form.hasBox && form.hasPapers && form.hasReceipt && form.isUnworn;
    if (step === 2) return form.estimatedValue;
    if (step === 3) {
      const errs = validatePersonalInfo(form);
      return isValid(errs);
    }
    if (step === 4) return form.agreedTerms && form.signature.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step === 3) {
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
          <h1>Trade / Loan</h1>
          <p className="service-tagline">Get cash now and reclaim your jewelry later. Repay within 30 days with zero interest.</p>
        </div>

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
          </div>
        )}

        {/* ---- STEP 2: Loan Details ---- */}
        {step === 2 && (
          <div className="service-step">
            <h2>Loan Details</h2>

            <label className="field-label">Estimated Value of Your Item (ZAR) *</label>
            <div className="price-input-wrap">
              <span className="price-prefix">R</span>
              <input className="field-input price-input" type="number" placeholder="e.g. 100000" value={form.estimatedValue} onChange={(e) => set('estimatedValue', e.target.value)} />
            </div>

            {form.estimatedValue && (
              <>
                <div className="loan-calc-box">
                  <p className="loan-calc-label">Maximum loan amount (65%)</p>
                  <p className="loan-calc-value">R {maxLoan.toLocaleString()}</p>
                </div>

                <label className="field-label">Desired Loan Amount (ZAR)</label>
                <div className="price-input-wrap">
                  <span className="price-prefix">R</span>
                  <input className="field-input price-input" type="number" placeholder={`Up to R ${maxLoan.toLocaleString()}`} max={maxLoan} value={form.desiredLoanAmount} onChange={(e) => set('desiredLoanAmount', e.target.value)} />
                </div>

                <div className="fee-table">
                  <h3>Repayment Schedule</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Repayment Amount</th>
                        <th>Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Day 1 - 30</td>
                        <td>R {fees.day30.toLocaleString()}</td>
                        <td>0% (interest-free)</td>
                      </tr>
                      <tr>
                        <td>Day 31 - 45</td>
                        <td>R {fees.day45.toLocaleString()}</td>
                        <td>+5%</td>
                      </tr>
                      <tr>
                        <td>Day 46 - 60</td>
                        <td>R {fees.day60.toLocaleString()}</td>
                        <td>+10%</td>
                      </tr>
                      <tr className="fee-default">
                        <td>After 60 days</td>
                        <td colSpan={2}>Item ownership transfers to Gold Makers</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ---- STEP 3: Personal Info ---- */}
        {step === 3 && (
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

        {/* ---- STEP 4: Review & Agreement ---- */}
        {step === 4 && (
          <div className="service-step">
            <h2>Review & Loan Agreement</h2>

            <div className="review-summary">
              <h3>Item Summary</h3>
              <div className="review-row"><span>Category:</span><span>{form.itemCategory || form.itemCategoryManual}</span></div>
              {(form.brand || form.brandManual) && <div className="review-row"><span>Brand:</span><span>{form.brand || form.brandManual}</span></div>}
              {(form.model || form.modelManual) && <div className="review-row"><span>Model:</span><span>{form.model || form.modelManual}</span></div>}
              <div className="review-row"><span>Estimated Value:</span><span>R {Number(form.estimatedValue).toLocaleString()}</span></div>
              <div className="review-row"><span>Loan Amount:</span><span>R {Number(form.desiredLoanAmount || maxLoan).toLocaleString()}</span></div>

              <h3>Personal Details</h3>
              <div className="review-row"><span>Name:</span><span>{form.fullName}</span></div>
              <div className="review-row"><span>Email:</span><span>{form.email}</span></div>
              <div className="review-row"><span>Phone:</span><span>{form.phone}</span></div>
              <div className="review-row"><span>ID Number:</span><span>{form.idNumber}</span></div>
              <div className="review-row"><span>Address:</span><span>{form.address}, {form.city}, {form.province} {form.postalCode}</span></div>
            </div>

            <div className="legal-doc">
              <h3>Pawn Loan Agreement</h3>
              <div className="legal-text">
                <p><strong>GOLD MAKERS (PTY) LTD - COLLATERAL LOAN AGREEMENT</strong></p>
                <p>Date: {new Date().toLocaleDateString('en-ZA')}</p>
                <p>Borrower: {form.fullName} (ID: {form.idNumber})</p>
                <br/>
                <p>1. <strong>Loan Amount:</strong> Gold Makers agrees to lend the Borrower R {Number(form.desiredLoanAmount || maxLoan).toLocaleString()} against the item described above as collateral.</p>
                <p>2. <strong>Collateral:</strong> The Borrower pledges the described item as security for this loan. The item will be stored in Gold Makers' insured vault.</p>
                <p>3. <strong>Repayment Terms:</strong></p>
                <ul>
                  <li>Day 1 - 30: Repay R {fees.day30.toLocaleString()} (0% interest)</li>
                  <li>Day 31 - 45: Repay R {fees.day45.toLocaleString()} (+5% late fee)</li>
                  <li>Day 46 - 60: Repay R {fees.day60.toLocaleString()} (+10% total fee)</li>
                  <li>After 60 days: Full ownership of the collateral item transfers to Gold Makers.</li>
                </ul>
                <p>4. <strong>Disbursement:</strong> Loan funds will be transferred via EFT within 24 hours of item authentication and agreement signing.</p>
                <p>5. <strong>Item Return:</strong> Upon full repayment, the item will be returned within 48 hours via insured courier or available for collection.</p>
                <p>6. <strong>Default:</strong> If the Borrower fails to repay within 60 days, the Borrower forfeits all rights to the collateral item. Written notice of default will be sent to the Borrower's registered email and address.</p>
                <p>7. <strong>Loan Extension:</strong> The Borrower may request a loan extension before Day 30 by paying the applicable fee to extend for an additional 15-30 days.</p>
                <p>8. <strong>Reminders:</strong> Automated reminders will be sent at Day 20, 28, 30, 35, 45, and 55.</p>
                <p>9. <strong>Anti-Money Laundering (AML):</strong> In compliance with FICA, the Borrower confirms their identity and the lawful provenance of the collateral item.</p>
                <p>10. <strong>Collateral Receipt:</strong> The Borrower will receive a digital collateral receipt upon item verification. This receipt serves as proof of pledge.</p>
                <p>11. <strong>Governing Law:</strong> This agreement is governed by the laws of the Republic of South Africa, including the National Credit Act where applicable.</p>
              </div>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" checked={form.agreedTerms} onChange={(e) => set('agreedTerms', e.target.checked)} />
              I have read and agree to the Pawn Loan Agreement terms and conditions
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

        {/* ---- STEP 5: Confirmation ---- */}
        {step === 5 && (
          <div className="service-step confirmation-step">
            <div className="confirm-icon"><Check size={48} /></div>
            <h2>Loan Application Submitted</h2>
            <p>Thank you, <strong>{form.fullName}</strong>. Your loan request has been received.</p>
            <p>Reference: <strong>LOAN-{Date.now().toString(36).toUpperCase()}</strong></p>

            <div className="loan-summary-card">
              <div className="review-row"><span>Loan Amount:</span><span>R {Number(form.desiredLoanAmount || maxLoan).toLocaleString()}</span></div>
              <div className="review-row"><span>Repay by:</span><span>30 days from authentication</span></div>
              <div className="review-row"><span>Late fee:</span><span>+5% every 15 days after Day 30</span></div>
            </div>

            <div className="status-tracker">
              <h3>Your Progress</h3>
              <div className="tracker-steps">
                {[
                  { label: 'Submitted', desc: 'Your loan request has been received', done: true },
                  { label: 'Under Review', desc: 'Our team reviews your form, details & photos', done: false },
                  { label: 'Collection Scheduled', desc: 'Our courier will collect your item at a convenient time', done: false },
                  { label: 'Authentication', desc: 'Our experts verify and appraise your item', done: false },
                  { label: 'Loan Approved', desc: 'Accept the loan terms and amount', done: false },
                  { label: 'Cash Disbursed', desc: 'Funds deposited via EFT within 24 hours', done: false },
                  { label: 'Repayment', desc: 'Repay within 30 days to reclaim your item', done: false },
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

        {step < 5 && (
          <div className="service-nav">
            {step > 0 && <button className="btn btn-outline" onClick={prev}>Back</button>}
            <button className="btn btn-dark" onClick={next} disabled={!canNext()}>
              {step === 4 ? 'Submit Application' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
