import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { buildCanonical } from '../config/seo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function SignUp() {
  const navigate = useNavigate();
  const { signUpWithEmail, hasClient } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};

    if (!form.firstName.trim()) next.firstName = 'First name is required.';
    if (!form.lastName.trim()) next.lastName = 'Last name is required.';
    if (!form.username.trim()) next.username = 'Username is required.';

    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';

    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    if (!form.gender) next.gender = 'Gender is required.';

    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';

    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';

    return next;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setErrorMessage('');

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setBusy(true);
    const { error } = await signUpWithEmail(form);
    setBusy(false);

    if (error) {
      setErrorMessage(error.message || 'Unable to create account.');
      return;
    }

    navigate('/sign-in', {
      replace: true,
      state: { message: 'Account created. Please sign in to continue.' },
    });
  }

  return (
    <main className="auth-page">
      <Seo
        title="Sign Up"
        description="Create your Gold Makers account with your profile details."
        canonical={buildCanonical('/sign-up')}
        noindex
      />
      <section className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Email sign up includes all required profile fields for your user table.</p>

        {!hasClient && (
          <div className="auth-alert">
            Account service is not configured. Confirm your account Supabase environment keys.
          </div>
        )}

        {!!errorMessage && <div className="auth-alert">{errorMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="signup-first-name">First Name</label>
              <input
                id="signup-first-name"
                className={`auth-input ${errors.firstName ? 'auth-input--error' : ''}`}
                type="text"
                value={form.firstName}
                onChange={(ev) => setField('firstName', ev.target.value)}
                autoComplete="given-name"
              />
              {!!errors.firstName && <span className="auth-field-error">{errors.firstName}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-last-name">Last Name</label>
              <input
                id="signup-last-name"
                className={`auth-input ${errors.lastName ? 'auth-input--error' : ''}`}
                type="text"
                value={form.lastName}
                onChange={(ev) => setField('lastName', ev.target.value)}
                autoComplete="family-name"
              />
              {!!errors.lastName && <span className="auth-field-error">{errors.lastName}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                className={`auth-input ${errors.username ? 'auth-input--error' : ''}`}
                type="text"
                value={form.username}
                onChange={(ev) => setField('username', ev.target.value)}
                autoComplete="username"
              />
              {!!errors.username && <span className="auth-field-error">{errors.username}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                type="email"
                value={form.email}
                onChange={(ev) => setField('email', ev.target.value)}
                autoComplete="email"
              />
              {!!errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-phone">Phone</label>
              <input
                id="signup-phone"
                className={`auth-input ${errors.phone ? 'auth-input--error' : ''}`}
                type="tel"
                value={form.phone}
                onChange={(ev) => setField('phone', ev.target.value)}
                autoComplete="tel"
              />
              {!!errors.phone && <span className="auth-field-error">{errors.phone}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-gender">Gender</label>
              <select
                id="signup-gender"
                className={`auth-select ${errors.gender ? 'auth-select--error' : ''}`}
                value={form.gender}
                onChange={(ev) => setField('gender', ev.target.value)}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                ))}
              </select>
              {!!errors.gender && <span className="auth-field-error">{errors.gender}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                type="password"
                value={form.password}
                onChange={(ev) => setField('password', ev.target.value)}
                autoComplete="new-password"
              />
              {!!errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                id="signup-confirm-password"
                className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                type="password"
                value={form.confirmPassword}
                onChange={(ev) => setField('confirmPassword', ev.target.value)}
                autoComplete="new-password"
              />
              {!!errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="auth-actions">
            <button className="auth-btn auth-btn--primary" type="submit" disabled={busy || !hasClient || hasErrors}>
              {busy ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="auth-links">
          <Link to="/sign-in">Already have an account? Sign in</Link>
          <Link to="/accounts">Accounts page</Link>
        </div>
      </section>
    </main>
  );
}
