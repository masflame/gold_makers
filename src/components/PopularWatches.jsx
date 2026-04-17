import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from './ProductCard';

export default function PopularWatches() {
  const featured = products.filter((p) => p.featured).slice(0, 8);

  return (
    <section className="section popular-watches">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Popular Right Now</h2>
          <Link to="/shop" className="section-view-all">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="products-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
