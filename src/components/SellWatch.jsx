import { Link } from 'react-router-dom';
import { DollarSign, ArrowLeftRight, TrendingUp, Banknote } from 'lucide-react';
import sellImg from '../assets/cards/Sell.jpg';
import tradeImg from '../assets/cards/Trade.jpg';
import exchangeImg from '../assets/cards/Exchange.jpg';

export default function SellWatch() {
  return (
    <section className="section info-cards-section">
      <div className="section-container">
        <div className="info-cards">
          <div className="info-card" data-scroll="slide-right" style={{ transitionDelay: '0ms' }}>
            <div className="info-card-img">
              <img src={sellImg} alt="Sell for Cash" />
            </div>
            <div className="info-card-content">
              <h2>Sell for Cash</h2>
              <p>
                Receive up to <strong>75% of your piece's value</strong> in cash within 10 days of authentication process.
              </p>
              <Link to="/sell" className="btn btn-dark">
                <DollarSign size={16} />
                Request Valuation
              </Link>
            </div>
          </div>
          <div className="info-card" data-scroll="slide-left" style={{ transitionDelay: '150ms' }}>
            <div className="info-card-img">
              <img src={tradeImg} alt="Trade / Loan" />
            </div>
            <div className="info-card-content">
              <h2>Trade / Loan</h2>
              <p>
                Receive a cash loan of up to <strong>65% of your piece's value</strong>, to be repaid within 30 days.
                After the initial period, the loan accrues an additional <strong>5% every 15 days</strong>.
                We accept watches, rings, chains, necklaces & earrings from leading houses.
              </p>
              <Link to="/trade" className="btn btn-dark">
                <Banknote size={16} />
                Apply for Loan
              </Link>
            </div>
          </div>
          <div className="info-card" data-scroll="slide-right" style={{ transitionDelay: '300ms' }}>
            <div className="info-card-img">
              <img src={exchangeImg} alt="Exchange Your Jewelry" />
            </div>
            <div className="info-card-content">
              <h2>Exchange Your Jewelry</h2>
              <p>
                Trade in your current piece and receive <strong>80% of its value</strong> towards
                any item in our collection. Elevate your style effortlessly.
              </p>
              <Link to="/exchange" className="btn btn-dark">
                <ArrowLeftRight size={16} />
                Exchange Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
