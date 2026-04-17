import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useBag } from '../context/BagContext';
import { products, formatPrice } from '../data/products';

export default function BagDrawer() {
  const { items, totalItems, drawerOpen, setDrawerOpen, updateQty, removeItem, clearBag } = useBag();
  const navigate = useNavigate();

  const bagProducts = items.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, qty: item.qty } : null;
  }).filter(Boolean);

  const subtotal = bagProducts.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`bag-backdrop${drawerOpen ? ' bag-backdrop--open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className={`bag-drawer${drawerOpen ? ' bag-drawer--open' : ''}`}>
        <div className="bag-drawer-header">
          <h2>Your Bag ({totalItems})</h2>
          <button className="bag-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close bag">
            <X size={20} />
          </button>
        </div>

        {bagProducts.length === 0 ? (
          <div className="bag-drawer-empty">
            <ShoppingBag size={40} strokeWidth={1} />
            <p>Your bag is empty</p>
            <Link to="/shop" className="bag-drawer-shop" onClick={() => setDrawerOpen(false)}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="bag-drawer-items">
              {bagProducts.map(p => (
                <div key={p.id} className="bag-item">
                  <Link
                    to={`/product/${p.id}`}
                    className={`bag-item-image${p.type === 'watch' ? ' bag-item-image--watch' : ''}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span className="bag-item-type">{p.type}</span>
                  </Link>
                  <div className="bag-item-info">
                    <span className="bag-item-brand">{p.brand}</span>
                    <Link
                      to={`/product/${p.id}`}
                      className="bag-item-name"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {p.name}
                    </Link>
                    <span className="bag-item-ref">Ref. {p.ref}</span>
                    <div className="bag-item-row">
                      <div className="bag-item-qty">
                        <button onClick={() => updateQty(p.id, p.qty - 1)} aria-label="Decrease">
                          <Minus size={12} />
                        </button>
                        <span>{p.qty}</span>
                        <button onClick={() => updateQty(p.id, p.qty + 1)} aria-label="Increase">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="bag-item-price">{formatPrice(p.price * p.qty, p.currency)}</span>
                    </div>
                  </div>
                  <button className="bag-item-remove" onClick={() => removeItem(p.id)} aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bag-drawer-footer">
              <div className="bag-drawer-subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <span className="bag-drawer-tax">Tax included. Shipping calculated at checkout.</span>
              <button className="bag-drawer-checkout" onClick={() => { setDrawerOpen(false); navigate('/checkout'); }}>Checkout</button>
              <button className="bag-drawer-continue" onClick={() => setDrawerOpen(false)}>
                Continue Shopping
              </button>
              {items.length > 1 && (
                <button className="bag-drawer-clear" onClick={clearBag}>
                  Clear Bag
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
