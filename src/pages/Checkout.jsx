import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ChevronRight, Truck, ChevronDown } from 'lucide-react';
import { useBag } from '../context/BagContext';
import { products, formatPrice } from '../data/products';
import { buildPayfastData, PAYFAST_URL } from '../utils/payfast';
import { supabase } from '../utils/supabase';

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
];

export default function Checkout() {
  const { items } = useBag();
  const formRef = useRef(null);

  const [contact, setContact] = useState({ email: '', phone: '' });
  const [delivery, setDelivery] = useState({
    firstName: '', lastName: '', company: '',
    address: '', apartment: '', city: '',
    province: '', postalCode: '', country: 'South Africa',
  });
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState({
    firstName: '', lastName: '', company: '',
    address: '', apartment: '', city: '',
    province: '', postalCode: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const bagProducts = items.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, qty: item.qty } : null;
  }).filter(Boolean);

  const subtotal = bagProducts.reduce((sum, p) => sum + p.price * p.qty, 0);
  const totalItems = bagProducts.reduce((sum, p) => sum + p.qty, 0);

  if (bagProducts.length === 0) {
    return (
      <main className="co-page">
        <div className="co-container">
          <h1 className="co-page-title">CHECKOUT</h1>
          <div className="co-empty">
            <h2>Your shopping bag is empty</h2>
            <p>Add items to your bag before checking out.</p>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  function validate() {
    const e = {};
    if (!contact.email.trim()) e['contact.email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e['contact.email'] = 'Invalid email';
    if (contact.phone && !/^0\d{9}$/.test(contact.phone.replace(/\s/g, '')))
      e['contact.phone'] = 'Enter a valid SA number';
    if (!delivery.firstName.trim()) e['delivery.firstName'] = 'Required';
    if (!delivery.lastName.trim()) e['delivery.lastName'] = 'Required';
    if (!delivery.address.trim()) e['delivery.address'] = 'Required';
    if (!delivery.city.trim()) e['delivery.city'] = 'Required';
    if (!delivery.province) e['delivery.province'] = 'Required';
    if (!delivery.postalCode.trim()) e['delivery.postalCode'] = 'Required';
    else if (!/^\d{4}$/.test(delivery.postalCode)) e['delivery.postalCode'] = 'Enter a 4-digit code';
    if (!billingSame) {
      if (!billing.firstName.trim()) e['billing.firstName'] = 'Required';
      if (!billing.lastName.trim()) e['billing.lastName'] = 'Required';
      if (!billing.address.trim()) e['billing.address'] = 'Required';
      if (!billing.city.trim()) e['billing.city'] = 'Required';
      if (!billing.province) e['billing.province'] = 'Required';
      if (!billing.postalCode.trim()) e['billing.postalCode'] = 'Required';
    }
    return e;
  }

  function fieldErr(key) { return errors[key] ? 'co-input--error' : ''; }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);

    const paymentId = `GM-${Date.now()}`;
    const customer = {
      firstName: delivery.firstName,
      lastName: delivery.lastName,
      email: contact.email,
      phone: contact.phone,
    };
    const data = buildPayfastData({ items: bagProducts, customer, paymentId });

    /* ── Save order to Supabase ── */
    const orderPayload = {
      order_id: paymentId,
      first_name: delivery.firstName,
      last_name: delivery.lastName,
      email: contact.email,
      contact: contact.phone || '',
      item: JSON.stringify(
        bagProducts.map(p => ({
          id: p.id, brand: p.brand, name: p.name,
          qty: p.qty, price: p.price,
          ...(p.originalPrice ? { originalPrice: p.originalPrice } : {}),
        }))
      ),
      description: bagProducts.map(p => `${p.brand} ${p.name} x${p.qty}`).join(', '),
      quantity: bagProducts.reduce((s, p) => s + p.qty, 0),
      amount: String(subtotal),
      country: delivery.country,
      street_address: delivery.address,
      apartment: delivery.apartment || '',
      city: delivery.city,
      province: delivery.province,
      postal_code: delivery.postalCode,
      company: delivery.company || '',
      device: navigator.userAgent,
      status: 'pending',
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('Orders').insert([orderPayload]);
        if (error) console.error('Supabase order insert error:', error);
        else console.log('Order saved to Supabase:', paymentId);
      } catch (err) {
        console.error('Supabase network error:', err);
      }
    } else {
      console.warn('Supabase client not initialised – order not saved');
    }

    sessionStorage.setItem('gm_pending_order', JSON.stringify({
      paymentId,
      items: bagProducts.map(p => ({ id: p.id, name: p.name, qty: p.qty, price: p.price })),
      subtotal, customer, delivery,
    }));

    const form = formRef.current;
    form.innerHTML = '';
    for (const [key, val] of Object.entries(data)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    }
    form.submit();
  }

  /* ── Sidebar product list (reused in desktop + mobile) ── */
  const orderItems = bagProducts.map(p => (
    <div key={p.id} className="co-item">
      <div className="co-item-img-wrap">
        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="co-item-img" />}
        {p.qty > 1 && <span className="co-item-badge">{p.qty}</span>}
      </div>
      <div className="co-item-details">
        <span className="co-item-brand">{p.brand}</span>
        <span className="co-item-name">{p.name}</span>
        <span className="co-item-qty">Qty: {p.qty}</span>
      </div>
      <span className="co-item-price">
        {p.originalPrice && <span className="co-item-price-original">{formatPrice(p.originalPrice * p.qty)}</span>}
        {formatPrice(p.price * p.qty)}
      </span>
    </div>
  ));

  const orderTotals = (
    <div className="co-totals">
      <div className="co-totals-row">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="co-totals-row">
        <span>Shipping</span>
        <span className="co-totals-free">Complimentary</span>
      </div>
      <div className="co-totals-row co-totals-row--grand">
        <span>Total</span>
        <span className="co-totals-grand-price"><small>ZAR</small>{formatPrice(subtotal)}</span>
      </div>
    </div>
  );

  return (
    <main className="co-page">
      <div className="co-container">
        {/* ── Page header ── */}
        <h1 className="co-page-title">CHECKOUT</h1>

        {/* ── Breadcrumb steps ── */}
        <nav className="co-steps" aria-label="Checkout steps">
          <span className="co-step co-step--active">Your Details</span>
          <ChevronRight size={14} className="co-step-sep" />
          <span className="co-step co-step--active">Delivery</span>
          <ChevronRight size={14} className="co-step-sep" />
          <span className="co-step co-step--active">Payment</span>
        </nav>

        {/* ── Mobile order summary toggle ── */}
        <details className="co-mobile-summary">
          <summary className="co-mobile-summary-bar">
            <span className="co-mobile-summary-left">
              <ChevronDown size={16} />
              Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
            <span className="co-mobile-summary-price">{formatPrice(subtotal)}</span>
          </summary>
          <div className="co-mobile-summary-body">
            {orderItems}
            {orderTotals}
          </div>
        </details>

        <div className="co-layout">
          {/* ─── LEFT: FORM ─── */}
          <div className="co-main">
            <form className="co-form" onSubmit={handleSubmit} noValidate>

              {/* Contact Information */}
              <section className="co-section">
                <h2 className="co-section-heading">CONTACT INFORMATION</h2>
                <div className="co-field">
                  <label>Email Address *</label>
                  <input
                    type="email" placeholder="you@example.com"
                    autoComplete="email"
                    value={contact.email}
                    onChange={ev => { setContact(p => ({ ...p, email: ev.target.value })); setErrors(p => ({ ...p, 'contact.email': '' })); }}
                    className={fieldErr('contact.email')}
                  />
                  {errors['contact.email'] && <span className="co-field-error">{errors['contact.email']}</span>}
                </div>
                <div className="co-field">
                  <label>Phone Number</label>
                  <input
                    type="tel" placeholder="0XX XXX XXXX (optional)"
                    autoComplete="tel"
                    value={contact.phone}
                    onChange={ev => { setContact(p => ({ ...p, phone: ev.target.value })); setErrors(p => ({ ...p, 'contact.phone': '' })); }}
                    className={fieldErr('contact.phone')}
                  />
                  {errors['contact.phone'] && <span className="co-field-error">{errors['contact.phone']}</span>}
                </div>
              </section>

              {/* Delivery Address */}
              <section className="co-section">
                <h2 className="co-section-heading">DELIVERY ADDRESS</h2>
                <div className="co-field">
                  <label>Country / Region</label>
                  <input type="text" value="South Africa" disabled className="co-input--disabled" />
                </div>
                <div className="co-row">
                  <div className="co-field">
                    <label>First Name *</label>
                    <input type="text" placeholder=""
                      autoComplete="shipping given-name"
                      value={delivery.firstName}
                      onChange={ev => { setDelivery(p => ({ ...p, firstName: ev.target.value })); setErrors(p => ({ ...p, 'delivery.firstName': '' })); }}
                      className={fieldErr('delivery.firstName')} />
                    {errors['delivery.firstName'] && <span className="co-field-error">{errors['delivery.firstName']}</span>}
                  </div>
                  <div className="co-field">
                    <label>Last Name *</label>
                    <input type="text" placeholder=""
                      autoComplete="shipping family-name"
                      value={delivery.lastName}
                      onChange={ev => { setDelivery(p => ({ ...p, lastName: ev.target.value })); setErrors(p => ({ ...p, 'delivery.lastName': '' })); }}
                      className={fieldErr('delivery.lastName')} />
                    {errors['delivery.lastName'] && <span className="co-field-error">{errors['delivery.lastName']}</span>}
                  </div>
                </div>
                <div className="co-field">
                  <label>Company</label>
                  <input type="text" placeholder="(optional)"
                    autoComplete="shipping organization"
                    value={delivery.company}
                    onChange={ev => setDelivery(p => ({ ...p, company: ev.target.value }))} />
                </div>
                <div className="co-field">
                  <label>Street Address *</label>
                  <input type="text" placeholder=""
                    autoComplete="shipping address-line1"
                    value={delivery.address}
                    onChange={ev => { setDelivery(p => ({ ...p, address: ev.target.value })); setErrors(p => ({ ...p, 'delivery.address': '' })); }}
                    className={fieldErr('delivery.address')} />
                  {errors['delivery.address'] && <span className="co-field-error">{errors['delivery.address']}</span>}
                </div>
                <div className="co-field">
                  <label>Apartment / Suite / Unit</label>
                  <input type="text" placeholder="(optional)"
                    autoComplete="shipping address-line2"
                    value={delivery.apartment}
                    onChange={ev => setDelivery(p => ({ ...p, apartment: ev.target.value }))} />
                </div>
                <div className="co-row co-row--3">
                  <div className="co-field">
                    <label>City *</label>
                    <input type="text" placeholder=""
                      autoComplete="shipping address-level2"
                      value={delivery.city}
                      onChange={ev => { setDelivery(p => ({ ...p, city: ev.target.value })); setErrors(p => ({ ...p, 'delivery.city': '' })); }}
                      className={fieldErr('delivery.city')} />
                    {errors['delivery.city'] && <span className="co-field-error">{errors['delivery.city']}</span>}
                  </div>
                  <div className="co-field co-field--select">
                    <label>Province *</label>
                    <select
                      autoComplete="shipping address-level1"
                      value={delivery.province}
                      onChange={ev => { setDelivery(p => ({ ...p, province: ev.target.value })); setErrors(p => ({ ...p, 'delivery.province': '' })); }}
                      className={`${!delivery.province ? 'co-select--placeholder' : ''} ${fieldErr('delivery.province')}`}
                    >
                      <option value="">Select</option>
                      {SA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors['delivery.province'] && <span className="co-field-error">{errors['delivery.province']}</span>}
                  </div>
                  <div className="co-field">
                    <label>Postal Code *</label>
                    <input type="text" placeholder=""
                      autoComplete="shipping postal-code"
                      value={delivery.postalCode}
                      onChange={ev => { setDelivery(p => ({ ...p, postalCode: ev.target.value })); setErrors(p => ({ ...p, 'delivery.postalCode': '' })); }}
                      className={fieldErr('delivery.postalCode')} />
                    {errors['delivery.postalCode'] && <span className="co-field-error">{errors['delivery.postalCode']}</span>}
                  </div>
                </div>
              </section>

              {/* Shipping Method */}
              <section className="co-section">
                <h2 className="co-section-heading">SHIPPING METHOD</h2>
                <div className="co-shipping-option co-shipping-option--active">
                  <div className="co-shipping-radio"><span className="co-radio-dot" /></div>
                  <div className="co-shipping-info">
                    <Truck size={16} />
                    <span>Insured Express Delivery</span>
                  </div>
                  <span className="co-shipping-price">FREE</span>
                </div>
              </section>

              {/* Payment */}
              <section className="co-section">
                <h2 className="co-section-heading">PAYMENT</h2>
                <p className="co-section-note">
                  <Lock size={14} />
                  All transactions are secure and encrypted.
                </p>
                <div className="co-payment-box">
                  <div className="co-payment-header">
                    <div className="co-payment-radio"><span className="co-radio-dot" /></div>
                    <span>PayFast — Secure Checkout</span>
                    <div className="co-payment-badges">
                      <span className="co-badge">Visa</span>
                      <span className="co-badge">Mastercard</span>
                      <span className="co-badge">EFT</span>
                    </div>
                  </div>
                  <p className="co-payment-note">
                    After clicking "Complete Purchase", you will be redirected to PayFast to complete your payment securely.
                  </p>
                </div>
              </section>

              {/* Billing Address */}
              <section className="co-section">
                <h2 className="co-section-heading">BILLING ADDRESS</h2>
                <label className="co-radio-label">
                  <input type="radio" name="billing" checked={billingSame} onChange={() => setBillingSame(true)} />
                  <span>Same as delivery address</span>
                </label>
                <label className="co-radio-label">
                  <input type="radio" name="billing" checked={!billingSame} onChange={() => setBillingSame(false)} />
                  <span>Use a different billing address</span>
                </label>

                {!billingSame && (
                  <div className="co-billing-fields">
                    <div className="co-row">
                      <div className="co-field">
                        <label>First Name *</label>
                        <input type="text"
                          autoComplete="billing given-name"
                          value={billing.firstName}
                          onChange={ev => { setBilling(p => ({ ...p, firstName: ev.target.value })); setErrors(p => ({ ...p, 'billing.firstName': '' })); }}
                          className={fieldErr('billing.firstName')} />
                        {errors['billing.firstName'] && <span className="co-field-error">{errors['billing.firstName']}</span>}
                      </div>
                      <div className="co-field">
                        <label>Last Name *</label>
                        <input type="text"
                          autoComplete="billing family-name"
                          value={billing.lastName}
                          onChange={ev => { setBilling(p => ({ ...p, lastName: ev.target.value })); setErrors(p => ({ ...p, 'billing.lastName': '' })); }}
                          className={fieldErr('billing.lastName')} />
                        {errors['billing.lastName'] && <span className="co-field-error">{errors['billing.lastName']}</span>}
                      </div>
                    </div>
                    <div className="co-field">
                      <label>Company</label>
                      <input type="text" placeholder="(optional)"
                        autoComplete="billing organization"
                        value={billing.company}
                        onChange={ev => setBilling(p => ({ ...p, company: ev.target.value }))} />
                    </div>
                    <div className="co-field">
                      <label>Street Address *</label>
                      <input type="text"
                        autoComplete="billing address-line1"
                        value={billing.address}
                        onChange={ev => { setBilling(p => ({ ...p, address: ev.target.value })); setErrors(p => ({ ...p, 'billing.address': '' })); }}
                        className={fieldErr('billing.address')} />
                      {errors['billing.address'] && <span className="co-field-error">{errors['billing.address']}</span>}
                    </div>
                    <div className="co-field">
                      <label>Apartment / Suite / Unit</label>
                      <input type="text" placeholder="(optional)"
                        autoComplete="billing address-line2"
                        value={billing.apartment}
                        onChange={ev => setBilling(p => ({ ...p, apartment: ev.target.value }))} />
                    </div>
                    <div className="co-row co-row--3">
                      <div className="co-field">
                        <label>City *</label>
                        <input type="text"
                          autoComplete="billing address-level2"
                          value={billing.city}
                          onChange={ev => { setBilling(p => ({ ...p, city: ev.target.value })); setErrors(p => ({ ...p, 'billing.city': '' })); }}
                          className={fieldErr('billing.city')} />
                        {errors['billing.city'] && <span className="co-field-error">{errors['billing.city']}</span>}
                      </div>
                      <div className="co-field co-field--select">
                        <label>Province *</label>
                        <select
                          autoComplete="billing address-level1"
                          value={billing.province}
                          onChange={ev => { setBilling(p => ({ ...p, province: ev.target.value })); setErrors(p => ({ ...p, 'billing.province': '' })); }}
                          className={`${!billing.province ? 'co-select--placeholder' : ''} ${fieldErr('billing.province')}`}
                        >
                          <option value="">Select</option>
                          {SA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {errors['billing.province'] && <span className="co-field-error">{errors['billing.province']}</span>}
                      </div>
                      <div className="co-field">
                        <label>Postal Code *</label>
                        <input type="text"
                          autoComplete="billing postal-code"
                          value={billing.postalCode}
                          onChange={ev => { setBilling(p => ({ ...p, postalCode: ev.target.value })); setErrors(p => ({ ...p, 'billing.postalCode': '' })); }}
                          className={fieldErr('billing.postalCode')} />
                        {errors['billing.postalCode'] && <span className="co-field-error">{errors['billing.postalCode']}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Submit */}
              <button type="submit" className="co-submit" disabled={submitting}>
                {submitting ? 'REDIRECTING TO PAYFAST…' : 'COMPLETE PURCHASE'}
              </button>

              <div className="co-trust">
                <ShieldCheck size={14} />
                <span>Secured by PayFast — PCI DSS Level 1 Compliant</span>
              </div>
            </form>

            <form ref={formRef} method="post" action={PAYFAST_URL} style={{ display: 'none' }} />
          </div>

          {/* ─── RIGHT: ORDER SUMMARY ─── */}
          <aside className="co-sidebar">
            <h2 className="co-sidebar-heading">ORDER SUMMARY</h2>
            <div className="co-sidebar-items">{orderItems}</div>
            {orderTotals}
          </aside>
        </div>
      </div>
    </main>
  );
}
