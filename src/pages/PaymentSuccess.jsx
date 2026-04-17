import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useBag } from '../context/BagContext';

export default function PaymentSuccess() {
  const { clearBag } = useBag();

  const order = (() => {
    try { return JSON.parse(sessionStorage.getItem('gm_pending_order')); }
    catch { return null; }
  })();

  useEffect(() => {
    // Clear the bag after successful payment
    clearBag();
    return () => sessionStorage.removeItem('gm_pending_order');
  }, [clearBag]);

  return (
    <main className="payment-result-page">
      <div className="payment-result-card payment-result--success">
        <div className="payment-result-icon">
          <CheckCircle size={56} strokeWidth={1.5} />
        </div>
        <h1>Payment Successful</h1>
        <p className="payment-result-msg">
          Thank you for your purchase! Your order has been confirmed.
        </p>

        {order && (
          <div className="payment-result-details">
            <span className="payment-result-id">Order {order.paymentId}</span>
            <div className="payment-result-items">
              {order.items.map(i => (
                <div key={i.id} className="payment-result-item">
                  <span>{i.qty}x {i.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="payment-result-note">
          A confirmation email will be sent to {order?.customer?.email || 'your email address'}.
        </p>

        <div className="payment-result-actions">
          <Link to="/shop" className="btn btn-primary">
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
