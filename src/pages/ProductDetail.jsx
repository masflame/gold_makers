import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Heart, ShoppingBag, ArrowLeft, Share2, Shield, Truck, RotateCcw, Minus, Plus, Check } from 'lucide-react';
import { products, formatPrice } from '../data/products';
import { useBag } from '../context/BagContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const typeIcons = {
  watch: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="24" cy="24" r="1" fill="currentColor" opacity="0.6" />
      <line x1="24" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="24" y1="24" x2="33" y2="28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1m = 24 + 20 * Math.cos(angle);
        const y1m = 24 + 20 * Math.sin(angle);
        const x2m = 24 + (i % 3 === 0 ? 17 : 18.5) * Math.cos(angle);
        const y2m = 24 + (i % 3 === 0 ? 17 : 18.5) * Math.sin(angle);
        return <line key={i} x1={x1m} y1={y1m} x2={x2m} y2={y2m} stroke="currentColor" strokeWidth={i % 3 === 0 ? '1' : '0.5'} />;
      })}
    </svg>
  ),
  ring: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="24" rx="14" ry="18" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="24" cy="24" rx="10" ry="14" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="24" cy="7" r="3" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  ),
  necklace: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M12 8 Q24 38 36 8" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="24" cy="34" r="4" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  ),
  chain: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <ellipse cx="20" cy="16" rx="6" ry="8" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="28" cy="24" rx="6" ry="8" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="20" cy="32" rx="6" ry="8" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  earring: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <line x1="24" y1="6" x2="24" y2="16" stroke="currentColor" strokeWidth="1" />
      <circle cx="24" cy="28" r="12" stroke="currentColor" strokeWidth="1" />
      <circle cx="24" cy="28" r="4" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  ),
};

function getSpecs(product) {
  const specs = [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.name },
  ];
  if (product.ref) specs.push({ label: 'Reference', value: product.ref });
  if (product.gender) specs.push({ label: 'Gender', value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1) });
  if (product.year) specs.push({ label: 'Year', value: product.year });
  specs.push({ label: 'Condition', value: product.condition });
  if (product.material) specs.push({ label: 'Material', value: product.material });
  if (product.details) specs.push({ label: 'Details', value: product.details });
  if (product.location) specs.push({ label: 'Location', value: product.location });
  if (product.dealer) specs.push({ label: 'Dealer', value: product.dealer });
  const cat = product.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  specs.push({ label: 'Category', value: cat });
  return specs;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useBag();
  const { toggle, has } = useWishlist();

  const handleAddToBag = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="pdp-not-found">
        <h2>Product not found</h2>
        <p>The item you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="pdp-back-link">Back to Shop</Link>
      </div>
    );
  }

  const isWatch = product.type === 'watch';
  const iconFn = typeIcons[product.type] || typeIcons.ring;
  const specs = getSpecs(product);
  const gallery = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

  const related = products
    .filter(p => p.id !== product.id && p.type === product.type)
    .slice(0, 4);

  const categoryLabel = product.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={`pdp${isWatch ? ' pdp--watch' : ''}`}>
      {/* Back button */}
      <button className="pdp-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Main Layout */}
      <div className="pdp-main">
        {/* Left: Image Gallery – Hero + collage grid */}
        <div className="pdp-gallery">
          {/* Hero image */}
          <div className="pdp-hero">
            {product.condition === 'Unworn' && <span className="pdp-badge">Unworn</span>}
            {product.condition === 'New' && <span className="pdp-badge">New</span>}
            {gallery.length > 0 ? (
              <img src={gallery[activeImg]} alt={`${product.name}`} className="pdp-hero-img" />
            ) : (
              <div className="pdp-hero-placeholder">
                {iconFn(120)}
              </div>
            )}
          </div>
          {/* Collage grid of remaining images */}
          {gallery.length > 1 && (
            <div className="pdp-collage">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  className={`pdp-collage-item${i === activeImg ? ' pdp-collage-item--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`${product.name} - ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="pdp-info">
          <span className="pdp-info-brand">{product.brand}</span>
          <h1 className="pdp-info-name">{product.name}</h1>
          {product.ref && <span className="pdp-info-ref">Ref. {product.ref}</span>}

          <div className="pdp-info-meta">
            <span className="pdp-info-condition">{product.condition}</span>
            {product.material && <><span className="pdp-info-dot" /><span>{product.material}</span></>}
            {product.details && <><span className="pdp-info-dot" /><span>{product.details}</span></>}
            {product.gender && <><span className="pdp-info-dot" /><span>{product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}</span></>}
          </div>

          <div className="pdp-info-price">
            {formatPrice(product.price, product.currency)}
          </div>
          <span className="pdp-info-tax">Tax included. Shipping calculated at checkout.</span>

          {/* Trust icons */}
          <div className="pdp-trust">
            <div className="pdp-trust-item">
              <Shield size={16} />
              <span>Authenticated</span>
            </div>
            <div className="pdp-trust-item">
              <Truck size={16} />
              <span>Free Insured Shipping</span>
            </div>
            <div className="pdp-trust-item">
              <RotateCcw size={16} />
              <span>14 Day Returns</span>
            </div>
          </div>

          {/* Quantity + Add to Bag */}
          <div className="pdp-actions">
            <div className="pdp-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
            <button className={`pdp-add-to-cart${added ? ' pdp-add-to-cart--added' : ''}`} onClick={handleAddToBag}>
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
              <span>{added ? 'Added to Bag' : 'Add to Bag'}</span>
            </button>
            <button
              className={`pdp-wishlist-btn${has(product.id) ? ' pdp-wishlist-btn--active' : ''}`}
              onClick={() => toggle(product.id)}
              aria-label="Toggle wishlist"
            >
              <Heart size={16} fill={has(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Secondary actions */}
          <div className="pdp-secondary">
            <button className="pdp-share">
              <Share2 size={14} />
              <span>Share</span>
            </button>
            <button className="pdp-enquire">Enquire About This Piece</button>
          </div>

          {/* Tabs: Specs / Description */}
          <div className="pdp-tabs">
            <button
              className={`pdp-tab${activeTab === 'specs' ? ' pdp-tab--active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
            <button
              className={`pdp-tab${activeTab === 'desc' ? ' pdp-tab--active' : ''}`}
              onClick={() => setActiveTab('desc')}
            >
              Description
            </button>
            <button
              className={`pdp-tab${activeTab === 'shipping' ? ' pdp-tab--active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Returns
            </button>
          </div>
          <div className="pdp-tab-content">
            {activeTab === 'specs' && (
              <table className="pdp-specs">
                <tbody>
                  {specs.map(s => (
                    <tr key={s.label}>
                      <td>{s.label}</td>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'desc' && (
              <div className="pdp-desc">
                <p>
                  The {product.brand} {product.name}{product.ref ? ` (Ref. ${product.ref})` : ''} is a
                  {product.condition === 'Unworn' || product.condition === 'New' ? ` ${product.condition.toLowerCase()}` : ` ${product.condition.toLowerCase()}`} piece
                  {product.material ? ` crafted in ${product.material}` : ''} from {product.brand}.
                  {isWatch
                    ? ` This timepiece embodies the heritage and craftsmanship of ${product.brand}.`
                    : ` A true expression of ${product.brand}'s exceptional artistry and design language.`
                  }
                </p>
                <p>
                  Every piece sold by Gold Makers is independently verified for authenticity
                  and comes with our comprehensive guarantee.
                </p>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="pdp-desc">
                <p><strong>Free Insured Shipping</strong> – All orders ship fully insured via premium courier. Delivery within 2-5 business days locally, 7-14 days internationally.</p>
                <p><strong>International Shipping</strong> – Available to select countries. Rates calculated at checkout.</p>
                <p><strong>Returns</strong> – We accept returns within 14 days of delivery. Items must be in original, unworn condition with all packaging and documentation.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pdp-related">
          <h2>You May Also Like</h2>
          <div className="pdp-related-grid">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
