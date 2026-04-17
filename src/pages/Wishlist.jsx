import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { products, formatPrice } from '../data/products';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { ids, clear } = useWishlist();
  const wishlisted = products.filter(p => ids.includes(p.id));

  return (
    <main className="wishlist-page">
      <div className="wishlist-inner">
        <div className="wishlist-header">
          <h1 className="wishlist-title">Your Wishlist</h1>
          <p className="wishlist-count">{wishlisted.length} {wishlisted.length === 1 ? 'item' : 'items'}</p>
        </div>

        {wishlisted.length === 0 ? (
          <div className="wishlist-empty">
            <Heart size={48} strokeWidth={1} />
            <h2>Your wishlist is empty</h2>
            <p>Browse our collection and save the pieces you love.</p>
            <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
          </div>
        ) : (
          <>
            <div className="wishlist-actions-bar">
              <button className="shop-clear-all" onClick={clear}>
                <Trash2 size={12} /> Clear All
              </button>
            </div>
            <div className="products-grid wishlist-grid">
              {wishlisted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
