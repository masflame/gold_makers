import { Link } from 'react-router-dom';

/**
 * Two side-by-side collection cards with hover zoom.
 * Props: cards – array of { image, title, subtitle, link }
 */
export default function DualCards({ cards = [] }) {
  if (cards.length < 2) return null;

  return (
    <section className="dual-cards" data-scroll="fade-up">
      {cards.slice(0, 2).map((card, i) => (
        <Link to={card.link} key={i} className="dual-card">
          <div className="dual-card-img-wrap">
            <img className="dual-card-img" src={card.image} alt={card.title} loading="lazy" />
          </div>
          <div className="dual-card-content">
            <h3 className="dual-card-title">{card.title}</h3>
            {card.subtitle && <p className="dual-card-subtitle">{card.subtitle}</p>}
            <span className="dual-card-cta">
              Discover
              <span className="dual-card-cta-line" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
