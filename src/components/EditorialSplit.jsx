import { Link } from 'react-router-dom';

/**
 * Full-bleed editorial split — large image one side, text + CTA other.
 * Props: image, video (optional), title, subtitle, cta, ctaLink, reverse (flip layout)
 */
export default function EditorialSplit({
  image,
  video,
  title,
  subtitle,
  cta = 'Discover',
  ctaLink = '/shop',
  reverse = false,
}) {
  return (
    <section className={`ed-split ${reverse ? 'ed-split--reverse' : ''}`} data-scroll="fade-up">
      <div className="ed-split-media">
        {video ? (
          <video
            className="ed-split-video"
            src={video}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        ) : (
          <img className="ed-split-img" src={image} alt={title} loading="lazy" />
        )}
      </div>
      <div className="ed-split-content">
        <h2 className="ed-split-title">{title}</h2>
        <p className="ed-split-subtitle">{subtitle}</p>
        <Link to={ctaLink} className="ed-split-cta">
          {cta}
          <span className="ed-split-cta-line" />
        </Link>
      </div>
    </section>
  );
}
