import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { buildCanonical } from '../config/seo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function formatDate(value) {
  if (!value) return 'Not available';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function Account() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  const merged = useMemo(() => ({
    firstName: profile?.first_name || user?.user_metadata?.first_name || user?.user_metadata?.given_name || '',
    lastName: profile?.last_name || user?.user_metadata?.last_name || user?.user_metadata?.family_name || '',
    username: profile?.username || user?.user_metadata?.username || user?.user_metadata?.preferred_username || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.user_metadata?.phone || '',
    gender: profile?.gender || user?.user_metadata?.gender || '',
    purchaseCount: profile?.purchase_count ?? 0,
    joined: profile?.created_at || user?.created_at || null,
  }), [profile, user]);

  async function handleSignOut() {
    await signOut();
    navigate('/sign-in', { replace: true });
  }

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-card auth-card--narrow">Loading account...</section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <Seo
        title="My Account"
        description="Manage your Gold Makers account profile and purchase activity."
        canonical={buildCanonical('/account')}
        noindex
      />
      <section className="auth-card">
        <h1 className="auth-title">My Account</h1>
        <p className="auth-subtitle">Your account is synced with the GoldMakers_Users table.</p>

        <div className="account-grid">
          <div className="account-item">
            <span className="account-item-label">First Name</span>
            <span className="account-item-value">{merged.firstName || 'Not set'}</span>
          </div>
          <div className="account-item">
            <span className="account-item-label">Last Name</span>
            <span className="account-item-value">{merged.lastName || 'Not set'}</span>
          </div>
          <div className="account-item">
            <span className="account-item-label">Username</span>
            <span className="account-item-value">{merged.username || 'Not set'}</span>
          </div>
          <div className="account-item">
            <span className="account-item-label">Email</span>
            <span className="account-item-value">{merged.email || 'Not set'}</span>
          </div>
          <div className="account-item">
            <span className="account-item-label">Phone</span>
            <span className="account-item-value">{merged.phone || 'Not set'}</span>
          </div>
          <div className="account-item">
            <span className="account-item-label">Gender</span>
            <span className="account-item-value">{merged.gender || 'Not set'}</span>
          </div>
          <div className="account-item">
            <span className="account-item-label">Purchase Count</span>
            <span className="account-item-value">{merged.purchaseCount}</span>
          </div>
          <div className="account-item">
            <span className="account-item-label">Joined</span>
            <span className="account-item-value">{formatDate(merged.joined)}</span>
          </div>
        </div>

        <div className="auth-actions">
          <button className="auth-btn auth-btn--primary" type="button" onClick={handleSignOut}>
            Sign Out
          </button>
          <Link to="/shop" className="auth-btn auth-btn--secondary">Continue Shopping</Link>
        </div>
      </section>
    </main>
  );
}
