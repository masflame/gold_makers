import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag, ArrowRight, Mail, Package, Shield } from 'lucide-react';
import { useBag } from '../context/BagContext';
import { products, formatPrice } from '../data/products';

export default function PaymentSuccess() {
  const { clearBag } = useBag();

  const order = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('gm_pending_order')); }
    catch { return null; }
  }, []);

  /* Resolve full product data from products array (fallback for sessionStorage issues) */
  const orderItems = useMemo(() => {
    if (!order?.items) return [];
    return order.items.map(i => {
      const full = products.find(p => p.id === i.id);
      return {
        id: i.id,
        name: full?.name || i.name,
        brand: full?.brand || '',
        image: full?.image || '',
        price: i.price,
        qty: i.qty,
      };
    });
  }, [order]);

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = orderItems.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    clearBag();
    return () => sessionStorage.removeItem('gm_pending_order');
  }, [clearBag]);

  return (
    <main className="pr-page">
      <div className="pr-container">
        {/* Hero confirmation */}
        <div className="pr-hero">
          <div className="pr-checkmark">
            <div className="pr-checkmark-ring" />
            <Check size={32} strokeWidth={2.5} />
          </div>
          <h1 className="pr-title">Thank You for Your Order</h1>
          <p className="pr-subtitle">
            Your payment has been confirmed and your order is being prepared.
          </p>
          {order?.paymentId && (
            <span className="pr-order-ref">{order.paymentId}</span>
          )}
        </div>

        {/* Order summary card */}
        {orderItems.length > 0 && (
          <div className="pr-card">
            <h2 className="pr-card-heading">Order Summary</h2>
            <div className="pr-items">
              {orderItems.map(item => (
                <div key={item.id} className="pr-item">
                  <div className="pr-item-image">
                    {item.image
                      ? <img src={item.image} alt={item.name} />
                      : <div className="pr-item-placeholder"><Package size={20} /></div>
                    }
                  </div>
                  <div className="pr-item-info">
                    {item.brand && <span className="pr-item-brand">{item.brand}</span>}
                    <span className="pr-item-name">{item.name}</span>
                    <span className="pr-item-qty">Qty: {item.qty}</span>
                  </div>
                  <span className="pr-item-price">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="pr-totals">
              <div className="pr-totals-row">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="pr-totals-row">
                <span>Shipping</span>
                <span className="pr-free">Complimentary</span>
              </div>
              <div className="pr-totals-row pr-totals-total">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info bar */}
        <div className="pr-info-bar">
          <div className="pr-info-item">
            <Mail size={18} />
            <div>
              <strong>Confirmation Email</strong>
              <p>A receipt has been sent to {order?.customer?.email || 'your email address'}.</p>
            </div>
          </div>
          <div className="pr-info-item">
            <Package size={18} />
            <div>
              <strong>Shipping &amp; Delivery</strong>
              <p>You'll receive tracking details once your order ships.</p>
            </div>
          </div>
          <div className="pr-info-item">
            <Shield size={18} />
            <div>
              <strong>Authenticity Guaranteed</strong>
              <p>Every piece comes with a certificate of authenticity.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pr-actions">
          <Link to="/shop" className="btn btn-primary pr-btn-primary">
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
          <Link to="/" className="pr-btn-link">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
