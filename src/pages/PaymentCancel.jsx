import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <main className="payment-result-page">
      <div className="payment-result-card payment-result--cancel">
        <div className="payment-result-icon">
          <XCircle size={56} strokeWidth={1.5} />
        </div>
        <h1>Payment Cancelled</h1>
        <p className="payment-result-msg">
          Your payment was not completed. No charges have been made.
        </p>
        <p className="payment-result-note">
          Your items are still in your bag — you can try again whenever you're ready.
        </p>

        <div className="payment-result-actions">
          <Link to="/checkout" className="btn btn-primary">
            <ArrowLeft size={16} />
            Return to Checkout
          </Link>
          <Link to="/shop" className="btn btn-outline">
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
