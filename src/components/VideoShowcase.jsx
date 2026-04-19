import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

/**
 * Full-width autoplaying background video with centered overlay text.
 * Props: video, poster (fallback image), title, subtitle, cta, ctaLink
 */
export default function VideoShowcase({
  video,
  poster,
  title,
  subtitle,
  cta = 'Explore',
  ctaLink = '/shop',
}) {
  const videoRef = useRef();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
    return () => document.removeEventListener('touchstart', tryPlay);
  }, []);

  return (
    <section className="vid-showcase" data-scroll="fade-up">
      <div className="vid-showcase-bg">
        {video ? (
          <video
            ref={videoRef}
            className="vid-showcase-video"
            src={video}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        ) : (
          <img className="vid-showcase-poster" src={poster} alt={title} loading="lazy" />
        )}
        <div className="vid-showcase-overlay" />
      </div>
      <div className="vid-showcase-content">
        <h2 className="vid-showcase-title">{title}</h2>
        <p className="vid-showcase-subtitle">{subtitle}</p>
        <Link to={ctaLink} className="btn btn-primary vid-showcase-cta">
          {cta}
        </Link>
      </div>
    </section>
  );
}
