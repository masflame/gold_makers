import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { formatPrice } from '../data/products';
import { useWishlist } from '../context/WishlistContext';

const typeIcons = {
  watch: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="24" cy="24" r="1" fill="currentColor" opacity="0.6" />
      <line x1="24" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="24" y1="24" x2="33" y2="28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 24 + 20 * Math.cos(angle);
        const y1 = 24 + 20 * Math.sin(angle);
        const x2 = 24 + (i % 3 === 0 ? 17 : 18.5) * Math.cos(angle);
        const y2 = 24 + (i % 3 === 0 ? 17 : 18.5) * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={i % 3 === 0 ? '1' : '0.5'} />;
      })}
    </svg>
  ),
  ring: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="24" rx="14" ry="18" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="24" cy="24" rx="10" ry="14" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="24" cy="7" r="3" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  ),
  necklace: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M12 8 Q24 38 36 8" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="24" cy="34" r="4" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  ),
  chain: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <ellipse cx="20" cy="16" rx="6" ry="8" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="28" cy="24" rx="6" ry="8" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="20" cy="32" rx="6" ry="8" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  earring: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <line x1="24" y1="6" x2="24" y2="16" stroke="currentColor" strokeWidth="1" />
      <circle cx="24" cy="28" r="12" stroke="currentColor" strokeWidth="1" />
      <circle cx="24" cy="28" r="4" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  ),
};

export default memo(function ProductCard({ product }) {
  const icon = typeIcons[product.type] || typeIcons.ring;
  const isWatch = product.type === 'watch';
  const { toggle, has } = useWishlist();
  const isWishlisted = has(product.id);

  return (
    <Link to={`/product/${product.id}`} className={`product-card${isWatch ? ' product-card--watch' : ''}`}>
      <div className="product-image-placeholder">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        ) : (
          icon
        )}
      </div>
      {product.condition === 'New' && (
        <span className="product-badge">New</span>
      )}
      <button
        className={`product-wishlist${isWishlisted ? ' product-wishlist--active' : ''}`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
      >
        <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>
      <div className="product-card-hover">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-model">{product.name}</h3>
        {product.ref && <span className="product-ref">Ref. {product.ref}</span>}
        {isWatch && (product.material || product.movement || product.caseSize) ? (
          <div className="product-watch-specs">
            {product.material && <div className="watch-spec-row"><span className="watch-spec-label">Case</span><span>{product.material}</span></div>}
            {product.dialColor && <div className="watch-spec-row"><span className="watch-spec-label">Dial</span><span>{product.dialColor}</span></div>}
            {product.bracelet && <div className="watch-spec-row"><span className="watch-spec-label">Strap</span><span>{product.bracelet}</span></div>}
            {product.movement && <div className="watch-spec-row"><span className="watch-spec-label">Movement</span><span>{product.movement}</span></div>}
            {product.caseSize && <div className="watch-spec-row"><span className="watch-spec-label">Size</span><span>{product.caseSize}</span></div>}
            {product.crystal && <div className="watch-spec-row"><span className="watch-spec-label">Crystal</span><span>{product.crystal}</span></div>}
          </div>
        ) : (
          <div className="product-specs">
            {product.material ? (
              <>
                <span>{product.material}</span>
                {product.details && <><span className="spec-dot" /><span>{product.details}</span></>}
              </>
            ) : product.details ? (
              <span>{product.details}</span>
            ) : isWatch ? (
              <>
                <span>{product.condition}</span>
                <span className="spec-dot" />
                <span>Luxury Timepiece</span>
                {product.gender && product.gender !== 'unisex' && (
                  <><span className="spec-dot" /><span>{product.gender === 'men' ? "Men's" : "Women's"}</span></>
                )}
              </>
            ) : null}
          </div>
        )}
        <div className="product-price">{formatPrice(product.price, product.currency)}</div>
        <span className="product-explore">
          Explore <ArrowRight size={13} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
});
