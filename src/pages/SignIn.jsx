import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { buildCanonical } from '../config/seo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithEmail, signInWithGoogle, hasClient } = useAuth();
  const requestedNext = new URLSearchParams(location.search).get('next');
  const nextPath = requestedNext && requestedNext.startsWith('/') ? requestedNext : '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      navigate(nextPath, { replace: true });
    }
  }, [navigate, nextPath, user]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setBusy(true);
    const { error } = await signInWithEmail({ email, password });
    setBusy(false);

    if (error) {
      setErrorMessage(error.message || 'Unable to sign in.');
      return;
    }

    navigate(nextPath, { replace: true });
  }

  async function handleGoogleSignIn() {
    setErrorMessage('');
    setBusy(true);
    const { error } = await signInWithGoogle(nextPath);
    setBusy(false);

    if (error) {
      setErrorMessage(error.message || 'Unable to start Google sign in.');
    }
  }

  return (
    <main className="auth-page">
      <Seo
        title="Sign In"
        description="Sign in to your Gold Makers account to manage your details and purchases."
        canonical={buildCanonical('/sign-in')}
        noindex
      />
      <section className="auth-card auth-card--narrow">
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Access your Gold Makers account with email/password or Google.</p>

        {!hasClient && (
          <div className="auth-alert">
            Account service is not configured. Confirm your account Supabase environment keys.
          </div>
        )}

        {!!location.state?.message && <div className="auth-alert">{location.state.message}</div>}
        {!!errorMessage && <div className="auth-alert">{errorMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="signin-email">Email Address</label>
            <input
              id="signin-email"
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              className="auth-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="auth-actions">
            <button className="auth-btn auth-btn--primary" type="submit" disabled={busy || !hasClient}>
              {busy ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              className="auth-btn auth-btn--secondary"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={busy || !hasClient}
            >
              Continue with Google
            </button>
          </div>
        </form>

        <div className="auth-links">
          <Link to="/sign-up">Create a new account</Link>
          <Link to="/accounts">Accounts page</Link>
        </div>
      </section>
    </main>
  );
}
