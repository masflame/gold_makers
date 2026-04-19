import { Link } from 'react-router-dom';

import watchesImg from '../assets/shop/watches/rolex/rolex-datejust-36-unisex-watch-3/rolex-datejust-36-unisex-watch/biJr2JOdOcRapA8_a4cccce7-6201-4c34-b4d8-fc76d8d25197.jpg';
import ringsImg from '../assets/background/rings.jpg';
import necklacesImg from '../assets/background/necklaces.jpg';
import earringsImg from '../assets/background/earings.jpg';
import pendantsImg from '../assets/background/pendants.jpg';
import weddingBandsImg from '../assets/background/wedding bands.jpg';
import braceletsImg from '../assets/background/bracelets.jpg';

const items = [
  { id: 'watches', name: 'Watches', image: watchesImg },
  { id: 'rings', name: 'Rings', image: ringsImg },
  { id: 'necklaces', name: 'Necklaces', image: necklacesImg },
  { id: 'earrings', name: 'Earrings', image: earringsImg },
  { id: 'pendants', name: 'Pendants', image: pendantsImg },
  { id: 'wedding-bands', name: 'Wedding Bands', image: weddingBandsImg },
  { id: 'bracelets', name: 'Bracelets', image: braceletsImg },
];

export default function Categories() {
  return (
    <section className="section categories">
      <div className="section-container">
        <h2 className="section-title" data-scroll="fade-up" style={{ marginBottom: 48, textAlign: 'center' }}>Explore Our Collections</h2>
        <div className="category-icons-grid">
          {items.map((cat, i) => (
            <Link key={cat.id} to={`/shop?category=${cat.id}`} className="category-icon-card" data-scroll="fade-up" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="category-icon-bg">
                <img src={cat.image} alt={cat.name} className="category-icon-img" />
              </div>
              <span className="category-icon-label">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
