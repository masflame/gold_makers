import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowLeft, ShoppingBag, Shield } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function PaymentCancel() {
  const order = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('gm_pending_order')); }
    catch { return null; }
  }, []);

  useEffect(() => {
    if (order?.paymentId) {
      supabase
        .from('Orders')
        .update({ status: 'cancelled' })
        .eq('order_id', order.paymentId)
        .then(({ error }) => {
          if (error) console.error('Failed to update order status:', error);
        });
    }
  }, []);

  return (
    <main className="pr-page">
      <div className="pr-container">
        {/* Hero */}
        <div className="pr-hero">
          <div className="pr-checkmark pr-checkmark--cancel">
            <div className="pr-checkmark-ring pr-checkmark-ring--cancel" />
            <X size={30} strokeWidth={2.5} />
          </div>
          <h1 className="pr-title">Payment Not Completed</h1>
          <p className="pr-subtitle">
            Your order was not processed and no charges have been made.
            <br />Your items are still waiting in your bag.
          </p>
        </div>

        {/* Reassurance card */}
        <div className="pr-card pr-card--cancel">
          <div className="pr-cancel-reassure">
            <Shield size={20} />
            <div>
              <strong>Your information is secure</strong>
              <p>No payment was taken. You can safely return to checkout whenever you're ready.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pr-actions">
          <Link to="/checkout" className="btn btn-primary pr-btn-primary">
            <ArrowLeft size={16} />
            Return to Checkout
          </Link>
          <Link to="/shop" className="pr-btn-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
