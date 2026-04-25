import { Link, Navigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { buildCanonical } from '../config/seo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function Accounts() {
  const { user, loading, profile } = useAuth();

  if (!loading && user) {
    return <Navigate to="/account" replace />;
  }

  return (
    <main className="auth-page">
      <Seo
        title="Accounts"
        description="Choose sign in or sign up to access your Gold Makers account."
        canonical={buildCanonical('/accounts')}
        noindex
      />
      <section className="auth-card auth-card--narrow">
        <h1 className="auth-title">Accounts</h1>
        <p className="auth-subtitle">
          Sign in or create a new account. Email sign up writes to your GoldMakers_Users profile table.
        </p>

        {!!profile?.email && (
          <div className="auth-alert">
            Last detected account: {profile.email}
          </div>
        )}

        <div className="auth-actions">
          <Link className="auth-btn auth-btn--primary" to="/sign-in">Sign In</Link>
          <Link className="auth-btn auth-btn--secondary" to="/sign-up">Sign Up</Link>
        </div>
      </section>
    </main>
  );
}
