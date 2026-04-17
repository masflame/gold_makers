import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="newsletter">
      <div className="section-container">
        <div className="newsletter-inner" data-scroll="fade-up">
          <div className="newsletter-text">
            <h2>Stay in the World of Gold Makers</h2>
            <p>
              Receive exclusive previews of new collections, private sale invitations,
              and curated content from our maison.
            </p>
          </div>
          {submitted ? (
            <div className="newsletter-success">Thank you for subscribing!</div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button type="submit" className="btn btn-dark">
                Sign Up
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
