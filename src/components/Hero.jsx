import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '../assets/background/hero.mp4';

export default function Hero() {
  const heroRef = useRef();
  const videoRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = heroRef.current?.offsetHeight || 1;
        if (y < h) {
          const ratio = y / h;
          if (videoRef.current) {
            videoRef.current.style.transform = `translateY(${y * 0.35}px) scale(${1 + ratio * 0.08})`;
          }
          if (contentRef.current) {
            contentRef.current.style.transform = `translateY(${y * 0.25}px)`;
            contentRef.current.style.opacity = Math.max(0, 1 - ratio * 1.6);
          }
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero hero--sticky" ref={heroRef}>
      <video
        ref={videoRef}
        className="hero-video"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="hero-overlay" />
      <div className="hero-content" ref={contentRef}>
        <h1 className="hero-title">
          <span>Buy, Trade, Own<br /></span>
          <span>the Finest.<br /></span>
        </h1>
        <p className="hero-subtitle">
          Explore our curated collection of gold chains, rings, necklaces and luxury watches - crafted for timeless elegance.
        </p>
        <Link to="/shop" className="btn btn-primary btn-lg hero-cta">
          Discover the Collection
        </Link>
      </div>
    </section>
  );
}
