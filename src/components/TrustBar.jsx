import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Award, Globe } from 'lucide-react';

const items = [
  { icon: ShieldCheck, title: 'Authenticity Guaranteed', desc: 'Every piece verified by experts', link: '/about' },
  { icon: Globe, title: 'Global Imports', desc: 'Sourced from top houses worldwide', link: '/about' },
  { icon: Truck, title: 'Free Delivery', desc: 'Insured & tracked worldwide', link: '/shipping' },
  { icon: Award, title: 'Sell · Trade · Exchange', desc: 'Up to 80% value on trade-ins', link: '/sell' },
];

export default function TrustBar() {
  return (
    <section className="trust-bar">
      {items.map(({ icon: Icon, title, desc, link }, i) => (
        <Link key={title} to={link} className="trust-item" data-scroll="fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
          <Icon size={22} strokeWidth={1.5} />
          <div className="trust-text">
            <strong>{title}</strong>
            <span>{desc}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
