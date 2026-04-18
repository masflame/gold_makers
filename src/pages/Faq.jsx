import { useState } from 'react';
import { ChevronDown, Shield, Truck, CreditCard, RefreshCw, Watch, Gem, HelpCircle } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    icon: Truck,
    heading: 'Shipping & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'All orders are dispatched within 1–2 business days. Delivery typically takes 3–5 business days within South Africa. International orders may take 7–14 business days depending on the destination.',
      },
      {
        q: 'Is shipping insured?',
        a: 'Yes. Every order ships fully insured at no additional cost. Our packages are discreetly labelled and require a signature on delivery for your protection.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship worldwide. International shipping costs and timelines are calculated at checkout based on your destination.',
      },
      {
        q: 'Can I track my order?',
        a: 'Absolutely. Once your order is dispatched, you\'ll receive an email with a tracking number and a link to monitor your delivery in real-time.',
      },
    ],
  },
  {
    icon: CreditCard,
    heading: 'Payment & Pricing',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards via PayFast, as well as instant EFT. All transactions are processed through a PCI-compliant, 256-bit encrypted gateway.',
      },
      {
        q: 'Are your prices negotiable?',
        a: 'Our prices are carefully set to reflect fair market value. However, we occasionally run promotions and launch sales — sign up for our newsletter to be the first to know.',
      },
      {
        q: 'Do you offer payment plans or financing?',
        a: 'We are currently exploring financing options. Please contact us directly to discuss arrangements for high-value purchases.',
      },
      {
        q: 'Why are some items on sale?',
        a: 'We periodically run launch promotions and seasonal sales to make luxury more accessible. Sale prices are genuine reductions from verified market prices.',
      },
    ],
  },
  {
    icon: Shield,
    heading: 'Authenticity & Quality',
    items: [
      {
        q: 'Are all your products authentic?',
        a: 'Every single piece is verified by our in-house team of certified horologists and gemologists. We guarantee 100% authenticity on every item we sell.',
      },
      {
        q: 'Do items come with certificates?',
        a: 'Yes. All watches and fine jewelry include a certificate of authenticity. Where available, original brand certificates, boxes and documentation are included.',
      },
      {
        q: 'What condition are your pre-owned items in?',
        a: 'All pre-owned items undergo a rigorous inspection process. Each listing clearly states the condition — from "Like New" to "Excellent" — with detailed photographs so you know exactly what to expect.',
      },
      {
        q: 'Do you sell lab-grown diamonds?',
        a: 'Yes, we offer both natural and lab-grown diamond collections. Each is clearly labelled so you can make an informed choice based on your preference.',
      },
    ],
  },
  {
    icon: Watch,
    heading: 'Watches',
    items: [
      {
        q: 'Are your watches serviced before sale?',
        a: 'All pre-owned watches are inspected and serviced as needed by our certified watchmakers. Each piece is tested for accuracy, water resistance and overall functionality.',
      },
      {
        q: 'Do watches come with a warranty?',
        a: 'Yes. Every watch includes a 12-month Gold Makers warranty covering mechanical defects. Brand warranties are transferred where applicable.',
      },
      {
        q: 'Which watch brands do you carry?',
        a: 'We carry Rolex, Cartier, Richard Mille, Tag Heuer, Bulgari, Franck Muller, Tiffany & Co., Michel Herbelin, and many more. Our inventory is constantly updated.',
      },
    ],
  },
  {
    icon: Gem,
    heading: 'Jewelry',
    items: [
      {
        q: 'Can I customise an engagement ring?',
        a: 'We offer bespoke consultation for engagement rings and special pieces. Contact us with your vision and budget, and our designers will work with you to create something unique.',
      },
      {
        q: 'What metals do you work with?',
        a: 'Our collections feature 18K and 24K gold (yellow, white, rose), platinum, sterling silver and palladium. Material details are specified on every product listing.',
      },
      {
        q: 'Do you offer ring resizing?',
        a: 'Yes. Most rings can be resized within a range. Contact us after purchase and we\'ll arrange resizing before dispatch at no extra charge.',
      },
    ],
  },
  {
    icon: RefreshCw,
    heading: 'Sell, Trade & Exchange',
    items: [
      {
        q: 'How does selling my watch or jewelry work?',
        a: 'Simply submit your item through our Sell page with photos and details. Our experts will provide a market-based valuation within 24 hours. If you accept, we arrange insured collection and payment within 48 hours.',
      },
      {
        q: 'What is your Trade-In programme?',
        a: 'Trade in your current piece towards something new. We\'ll value your item and apply the amount as credit against your next purchase — often more advantageous than selling outright.',
      },
      {
        q: 'How does the Exchange programme differ?',
        a: 'Our Exchange programme allows a direct swap of your item for another of equal or similar value in our collection. It\'s the simplest way to refresh your collection.',
      },
      {
        q: 'How quickly will I receive payment for a sale?',
        a: 'Once your item is received and verified, payment is processed within 48 hours via EFT to your nominated bank account.',
      },
    ],
  },
  {
    icon: HelpCircle,
    heading: 'Returns & Support',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day return window from the date of delivery. Items must be returned in their original condition and packaging. Custom or bespoke items are excluded.',
      },
      {
        q: 'How do I contact customer support?',
        a: 'You can reach us via email, phone or WhatsApp. Our support team is available Monday to Saturday, 9am to 6pm SAST. Visit our Contact page for full details.',
      },
      {
        q: 'What if my item arrives damaged?',
        a: 'In the unlikely event of transit damage, contact us immediately with photographs. We\'ll arrange a full replacement or refund at no cost to you.',
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-item--open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <ChevronDown size={18} className="faq-chevron" />
      </button>
      <div className="faq-answer">
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <main className="faq-page">
      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-hero-content">
          <span className="faq-hero-tag">Support</span>
          <h1 className="faq-hero-title">Frequently Asked Questions</h1>
          <p className="faq-hero-subtitle">
            Everything you need to know about shopping with Gold Makers — from authenticity
            and shipping to our sell, trade and exchange services.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="faq-body">
        <div className="faq-container">
          {FAQ_SECTIONS.map(section => (
            <div key={section.heading} className="faq-section">
              <div className="faq-section-header">
                <section.icon size={22} className="faq-section-icon" />
                <h2>{section.heading}</h2>
              </div>
              <div className="faq-items">
                {section.items.map(item => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="faq-cta">
        <div className="faq-cta-inner">
          <h2>Still Have Questions?</h2>
          <p>Our team is here to help. Reach out and we'll respond within 24 hours.</p>
          <div className="faq-cta-actions">
            <a href="mailto:info@goldmakers.co.za" className="btn btn-primary">Email Us</a>
            <a href="https://wa.me/27000000000" className="btn btn-outline" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
  );
}
