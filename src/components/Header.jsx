import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { useBag } from '../context/BagContext';
import { useWishlist } from '../context/WishlistContext';
import BagDrawer from './BagDrawer';

const navLinks = [
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Shop', path: '/shop', hasDropdown: true, dropdownType: 'categories' },
  { label: 'Brands', path: '/brands', hasDropdown: true, dropdownType: 'brands' },
  { label: 'Sell / Trade-In', path: '/sell' },
  { label: 'About', path: '/about' },
];

const brandDropdown = [
  'Audemars Piguet', 'Bell & Ross', 'Breitling', 'Bulgari', 'Cartier',
  'Franck Muller', 'Hublot', 'Longines', 'Michel Herbelin', 'Montblanc',
  'Omega', 'Panerai', 'Patek Philippe', 'Richard Mille', 'Rolex',
  'TAG Heuer', 'Tiffany & Co', 'Van Cleef & Arpels', 'Zermatt Diamonds',
];

const categoryDropdown = [
  { label: 'All Jewelry', path: '/shop' },
  { label: 'Men', path: '/shop?gender=men' },
  { label: 'Women', path: '/shop?gender=women' },
  { label: 'Watches', path: '/shop?category=watches' },
  { label: 'Rings', path: '/shop?category=rings' },
  { label: 'Wedding Bands', path: '/shop?category=wedding-bands' },
  { label: 'Necklaces', path: '/shop?category=necklaces' },
  { label: 'Pendants', path: '/shop?category=pendants' },
  { label: 'Earrings', path: '/shop?category=earrings' },
  { label: 'Bracelets', path: '/shop?category=bracelets' },
];

export default function Header() {
  const [pinned, setPinned] = useState(false);
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const headerRef = useRef(null);
  const pinnedRef = useRef(false);
  const visibleRef = useRef(false);
  const location = useLocation();
  const { totalItems, setDrawerOpen } = useBag();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const headerH = headerRef.current?.offsetHeight || 120;

        if (y > headerH + 60) {
          if (!pinnedRef.current) {
            pinnedRef.current = true;
            setPinned(true);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => { visibleRef.current = true; setVisible(true); });
            });
          }
        } else {
          if (visibleRef.current) { visibleRef.current = false; setVisible(false); }
          if (pinnedRef.current && y < headerH * 0.3) { pinnedRef.current = false; setPinned(false); }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    pinnedRef.current = false;
    visibleRef.current = false;
    setPinned(false);
    setVisible(false);
  }, [location]);

  const isHome = location.pathname === '/';

  const headerClasses = [
    'header-wrap',
    pinned ? 'header-wrap--pinned' : '',
    visible ? 'header-wrap--visible' : '',
    isHome && !pinned ? 'header-wrap--hero' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={headerClasses} ref={headerRef}>
        <header className="header">
          <div className="header-inner">
            {/* Left: Icons */}
            <div className="header-actions">
              <button
                className="header-icon"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist" className="header-icon desktop-only" aria-label="Wishlist">
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
              </Link>
              <Link to="/account" className="header-icon desktop-only" aria-label="Account">
                <User size={18} strokeWidth={1.5} />
              </Link>
              <button className="header-icon" aria-label="Bag" onClick={() => setDrawerOpen(true)}>
                <ShoppingBag size={18} strokeWidth={1.5} />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </button>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="logo">
              <span className="logo-chromex">GOLD</span>
              <span className="logo-360">MAKERS</span>
            </Link>

            {/* Right: Nav links (desktop) / Hamburger (mobile) */}
            <div className="header-right">
              <nav className="nav desktop-only">
                {navLinks.map((link) => (
                  <div
                    key={link.label}
                    className="nav-item"
                    onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.dropdownType)}
                    onMouseLeave={() => link.hasDropdown && setOpenDropdown(null)}
                  >
                    <Link
                      to={link.path}
                      className={`nav-link${location.pathname === link.path ? ' active' : ''}`}
                    >
                      {link.label}
                      {link.hasDropdown && <ChevronDown size={12} style={{ marginLeft: 4, opacity: 0.5 }} />}
                    </Link>
                    {link.dropdownType === 'brands' && openDropdown === 'brands' && (
                      <div className="dropdown">
                        <div className="dropdown-grid">
                          {brandDropdown.map((b) => (
                            <Link
                              key={b}
                              to={`/shop?brand=${b.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                              className="dropdown-link"
                            >
                              {b}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {link.dropdownType === 'categories' && openDropdown === 'categories' && (
                      <div className="dropdown">
                        <div className="dropdown-list">
                          {categoryDropdown.map((cat) => (
                            <Link
                              key={cat.label}
                              to={cat.path}
                              className="dropdown-link"
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <button
                className="header-icon mobile-only"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search overlay */}
          {searchOpen && (
            <div className="search-overlay">
              <div className="search-overlay-inner">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search jewelry, watches, brands..."
                  className="search-input"
                  autoFocus
                />
                <button
                  className="header-icon"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <nav className="mobile-nav">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.path} className="mobile-nav-link">
              {link.label}
            </Link>
          ))}
          <div className="mobile-nav-divider" />
          <span className="mobile-nav-heading">Categories</span>
          {categoryDropdown.map((cat) => (
            <Link key={cat.label} to={cat.path} className="mobile-nav-link mobile-nav-link--sub">
              {cat.label}
            </Link>
          ))}
          <div className="mobile-nav-divider" />
          <Link to="/wishlist" className="mobile-nav-link">Wishlist</Link>
          <Link to="/account" className="mobile-nav-link">Account</Link>
        </nav>
      </div>

      <BagDrawer />
    </>
  );
}
