import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Newsletter row in footer */}
      <div className="footer-newsletter">
        <span className="footer-newsletter-label">GOLD MAKERS NEWSLETTER</span>
        <Link to="/newsletter" className="footer-newsletter-btn">Sign Up</Link>
      </div>

      {/* Quick links row */}
      <div className="footer-quick">
        <Link to="/articles" className="footer-quick-link">ARTICLES</Link>
        <Link to="/videos" className="footer-quick-link">VIDEOS</Link>
        <Link to="/help" className="footer-quick-link">CONTACT US</Link>
      </div>

      {/* Main footer columns */}
      <div className="footer-columns">
        <div className="footer-col">
          <h4>Help</h4>
          <Link to="/help">Contact Us</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/glossary">Glossary of Terms</Link>
          <Link to="/guide">Jewelry Guide</Link>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/new-arrivals">New Arrivals</Link>
          <Link to="/shop">All Jewelry</Link>
          <Link to="/shop?category=watches">Watches</Link>
          <Link to="/shop?category=rings">Rings</Link>
          <Link to="/shop?category=wedding-bands">Wedding Bands</Link>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <Link to="/sell">Sell for Cash</Link>
          <Link to="/trade-in">Trade-In</Link>
          <Link to="/exchange">Exchange</Link>
          <Link to="/warranty">Warranty</Link>
          <Link to="/finance">Finance</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/awards">Awards</Link>
          <Link to="/press">Press</Link>
          <Link to="/testimonials">Testimonials</Link>
        </div>
        <div className="footer-col">
          <h4>Also of Interest</h4>
          <Link to="/shop?category=necklaces">Necklaces</Link>
          <Link to="/shop?category=earrings">Earrings</Link>
          <Link to="/shop?category=pendants">Pendants</Link>
          <Link to="/shop?category=bracelets">Bracelets</Link>
        </div>
      </div>

      {/* Social & contact */}
      <div className="footer-social-row">
        <div className="footer-socials">
          <a href="#" className="social-link" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="#" className="social-link" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg>
          </a>
          <a href="#" className="social-link" aria-label="YouTube">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 9.71a8.5 8.5 0 0 0-.91-4.13 2.92 2.92 0 0 0-1.72-1.12A69.13 69.13 0 0 0 12 4.22a69.13 69.13 0 0 0-8.37.24 2.92 2.92 0 0 0-1.72 1.12A8.5 8.5 0 0 0 1 9.71a52.8 52.8 0 0 0 0 4.58 8.5 8.5 0 0 0 .91 4.13 2.92 2.92 0 0 0 1.72 1.12 69.13 69.13 0 0 0 8.37.24 69.13 69.13 0 0 0 8.37-.24 2.92 2.92 0 0 0 1.72-1.12 8.5 8.5 0 0 0 .91-4.13 52.8 52.8 0 0 0 0-4.58zM9.74 14.85V8.44l5.56 3.21z"/></svg>
          </a>
        </div>
        <a href="tel:+27110000000" className="footer-phone">
          <Phone size={16} />
          +27 11 000 0000
        </a>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Gold Makers. All rights reserved.</span>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
