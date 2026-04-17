import { Link } from 'react-router-dom';
import { Shield, Award, Users, Clock, Phone, Mail, Gem } from 'lucide-react';
import aboutVideo from '../assets/background/about.mp4';
import aboutRightVideo from '../assets/background/about-right.mp4';
import authenticityBg from '../assets/background/Authenticit.jpg';
import qualityBg from '../assets/background/Quality.jpg';
import clientBg from '../assets/background/Client .mp4';
import timelessBg from '../assets/background/Timeless .mp4';

const VALUES = [
  { icon: Shield, title: 'Authenticity Guaranteed', desc: 'Every piece is meticulously verified by our in-house experts before it reaches you.', bg: authenticityBg, type: 'image' },
  { icon: Award, title: 'Uncompromising Quality', desc: 'We source only the finest jewelry and timepieces from the world\'s most prestigious brands.', bg: qualityBg, type: 'image' },
  { icon: Users, title: 'Client First', desc: 'Personalised service is at the heart of everything we do - from consultation to after-care.', bg: clientBg, type: 'video' },
  { icon: Clock, title: 'Timeless Craft', desc: 'We celebrate the artistry behind every gemstone, setting and movement.', bg: timelessBg, type: 'video' },
];

const MILESTONES = [
  { year: '2015', text: 'Gold Makers founded with a vision to redefine pre-owned luxury.' },
  { year: '2017', text: 'Expanded into certified watches - Rolex, Cartier, Richard Mille and more.' },
  { year: '2019', text: 'Launched our Sell, Trade & Exchange programme, giving clients more flexibility.' },
  { year: '2021', text: 'Introduced lab-grown diamond collections alongside natural stones.' },
  { year: '2023', text: 'Launched our online concierge service and global sourcing network.' },
  { year: '2025', text: 'Over 10,000 clients served - and growing every day.' },
];

export default function About() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <video className="about-hero-video" src={aboutVideo} autoPlay loop muted playsInline />
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <span className="about-hero-tag">Our Story</span>
          <h1 className="about-hero-title">The Art of Luxury,<br />Perfected</h1>
          <p className="about-hero-subtitle">
            Gold Makers was founded on a single belief - that exceptional jewelry and timepieces deserve exceptional care, transparency and craftsmanship at every stage.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="about-intro section">
        <div className="section-container">
          <div className="about-intro-grid">
            <div className="about-intro-text">
              <h2 className="about-intro-heading">Who We Are</h2>
              <p>
                Gold Makers is a trusted online destination for pre-owned and brand-new luxury watches, fine jewelry, engagement rings and bespoke pieces. We import globally from the world's top houses, and our expert team combines decades of horological and gemological knowledge with a passion for connecting people with pieces they'll treasure forever.
              </p>
              <p>
                Whether you're looking to buy your first luxury timepiece, sell a family heirloom, or trade in for something new - we make the process seamless, transparent and rewarding.
              </p>
            </div>
            <div className="about-intro-stats-box">
              <video className="about-intro-stats-video" src={aboutRightVideo} autoPlay loop muted playsInline />
              <div className="about-intro-stats-overlay" />
              <div className="about-intro-stats">
                <div className="about-stat">
                  <span className="about-stat-number">10K+</span>
                  <span className="about-stat-label">Clients Served</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">50+</span>
                  <span className="about-stat-label">Premium Brands</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">10+</span>
                  <span className="about-stat-label">Years of Expertise</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">100%</span>
                  <span className="about-stat-label">Authenticity Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values section">
        <div className="section-container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>What We Stand For</h2>
          <div className="about-values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="about-value-card">
                {v.type === 'video' ? (
                  <video className="about-value-bg" src={v.bg} autoPlay loop muted playsInline />
                ) : (
                  <img className="about-value-bg" src={v.bg} alt="" />
                )}
                <div className="about-value-overlay" />
                <div className="about-value-content">
                  <div className="about-value-icon"><v.icon size={24} /></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="about-timeline section">
        <div className="section-container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>Our Journey</h2>
          <div className="about-timeline-track">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="about-milestone">
                <div className="about-milestone-dot" />
                <div className="about-milestone-year">{m.year}</div>
                <p className="about-milestone-text">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="section-container" style={{ textAlign: 'center' }}>
          <Gem size={32} style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16 }} />
          <h2 className="about-cta-title">Experience Gold Makers</h2>
          <p className="about-cta-subtitle">Browse our curated collection online or speak with one of our specialists.</p>
          <div className="about-cta-actions">
            <Link to="/shop" className="btn btn-primary" style={{ background: '#fff', color: 'var(--black)', borderColor: '#fff' }}>
              Shop Collection
            </Link>
            <Link to="/sell" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
              Sell or Trade
            </Link>
          </div>
          <div className="about-contact-row">
            <a href="tel:+27110001234" className="about-contact-item"><Phone size={14} /> +27 11 000 1234</a>
            <a href="mailto:hello@goldmakers.co.za" className="about-contact-item"><Mail size={14} /> hello@goldmakers.co.za</a>
            <span className="about-contact-item"><Mail size={14} /> Online Retailer - Worldwide Shipping</span>
          </div>
        </div>
      </section>
    </main>
  );
}
