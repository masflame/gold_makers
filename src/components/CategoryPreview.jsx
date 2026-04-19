import { useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from './ProductCard';

export default memo(function CategoryPreview({ categoryId, title, limit = 6 }) {
  const items = useMemo(
    () => {
      const catProducts = products.filter((p) => p.category === categoryId);
      if (categoryId !== 'watches') {
        catProducts.sort((a, b) => {
          const aCartier = a.brand === 'Cartier' ? 0 : 1;
          const bCartier = b.brand === 'Cartier' ? 0 : 1;
          return aCartier - bCartier;
        });
      }
      return catProducts.slice(0, limit);
    },
    [categoryId, limit]
  );

  if (items.length === 0) return null;

  return (
    <section className="section category-preview">
      <div className="section-container">
        <div className="section-header" data-scroll="fade-up">
          <h2 className="section-title">{title}</h2>
          <Link to={`/shop?category=${categoryId}`} className="section-view-all">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="products-grid">
          {items.map((product, i) => (
            <div key={product.id} data-scroll="fade-up" style={{ transitionDelay: `${i * 80}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
