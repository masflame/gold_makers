import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import { buildCanonical } from '../config/seo';

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <main className="pdp-not-found">
      <Seo
        title="Page Not Found"
        description="The page you requested does not exist. Explore our curated luxury watches and fine jewelry collections."
        canonical={buildCanonical(pathname)}
        noindex
      />
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you are looking for may have moved or no longer exists.</p>
      <Link to="/shop" className="pdp-back-link">Browse Collection</Link>
    </main>
  );
}
