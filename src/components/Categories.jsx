import { Link } from 'react-router-dom';

import watchesImg from '../assets/shop/watches/rolex/rolex-datejust-36-unisex-watch-3/rolex-datejust-36-unisex-watch/biJr2JOdOcRapA8_a4cccce7-6201-4c34-b4d8-fc76d8d25197.jpg';
import ringsImg from '../assets/shop/rings/engagement-rings-1/0-23ct-lab-grown-wedding-band-set-in-9ct-yellow-gold-copy-1/2-27ct-lab-grown-diamond-asscher-cut-set-in-platinum/1_393c7a80-5043-4ae9-ae64-5e82b27ea7c8.jpg';
import necklacesImg from '../assets/shop/necklaces/necklaces-A/bangle-italian-made-70538/flower-necklace-set-in-18ct-white-gold/1_d930c289-e058-4a12-b1fd-eeb2682dea0d.jpg';
import earringsImg from '../assets/shop/earings/earrings/0-50ct-lab-grown-round-brilliant-diamond-earrings-set-in-9ct-yellow-gold-1ct-total-diamond-weight/1-5ct-lab-grown-round-brilliant-diamond-earrings-set-in-9ct-white-gold-3ct-total/1_2733a5a5-ce16-4c03-9b42-a5dcd790d979.jpg';
import pendantsImg from '../assets/shop/pendants/pendants/3-stone-emerald-cut-pendant-32609/emerald-cut-pendant/32609_4e38456a-6d8f-4b38-9ff2-bc728a9afa91.jpg';
import weddingBandsImg from '../assets/shop/wedding bands/wedding-bands-test/straight-diamond-wedding-band-51096-w-10/diamond-wedding-band/51096-W.jpg';
import braceletsImg from '../assets/shop/bracelets/bracelets/flower-necklace-set-in-18ct-yellow-gold-copy-2/flower-bracelet-set-in-18ct-white-gold-turquoise/1_4a334074-f3eb-4060-8b18-8ae7653a78c9.jpg';

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
