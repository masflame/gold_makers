import { Link } from 'react-router-dom';
import { brands } from '../data/products';
import { ArrowRight } from 'lucide-react';

import audemarsPiguetImg from '../assets/shop/watches/men/audemars piguet/index-htm/New folder/15769055-1b58f5poay8ivuh1dqh2pqgn-Square480.jpg';
import bellRossImg from '../assets/shop/watches/men/bell ross/br-05-mod2918-htm/New folder/44384508-22b0bux0ygknqldvoeouxbm8-Square480.jpg';
import breitlingImg from '../assets/shop/watches/men/breitling/breitling-avenger-avenger-seawolf-limited-edition-mens-watch/breitling-avenger-avenger-seawolf-limited-edition-men-s-watch/aeSaOFH0tMKliwz.jpg';
import bulgariImg from '../assets/shop/watches/bulgari/index-htm/New folder/404a9qmsovua-lx3y3xq3fzhfwezhd1hx0ixa-Square480.jpg';
import cartierImg from '../assets/shop/watches/cartier/cartier-ballon-bleu-ladies-watch-2/cartier-ballon-bleu-ladies-watch/Ho1MClEkRbXpI30_df5b106a-5c1a-48c7-900a-c2cb17d5b1f9.jpg';
import franckMullerImg from '../assets/shop/watches/franck muller/index-htm/New folder/0g00fax1zbnb-b50rfmwd1qwhurvehn1ne4ve-Square480.jpg';
import hublotImg from '../assets/shop/watches/men/hublot/hublot-aero-big-bang-chronograph-automatic-mens-watch/hublot-aero-big-bang-chronograph-automatic-men-s-watch/fJIZN8VP5gRaPi_6bf61361-7aa7-41ec-a42d-85c1a05b8e8b.jpg';
import longinesImg from '../assets/shop/watches/luxury-watches-1/24mm-la-grande-classique-yg-pvd-black-leather/24mm-la-grande-classique-yg-pvd-black-leather/L4.209.2.11.2_FACE.jpg';
import michelHerbelinImg from '../assets/shop/watches/luxury-watches-1/32mm-gold-plated-newport-blue/32mm-gold-plated-newport-blue/IMG_0533.jpg';
import montblancImg from '../assets/shop/watches/men/montblanc/index-htm/New folder/01yp58x4ihpe-el9azgnxm7gzarxkw999elcw-Square480.jpg';
import omegaImg from '../assets/shop/watches/men/omega/omega-chronostop-vintage-mens-watch-1/omega-chronostop-vintage-men-s-watch/01qCTNVQH8PJ9s_132a1945-a9d7-4ccf-ae0a-6d3700215dd9.jpg';
import paneriImg from '../assets/shop/watches/men/panerai/panerai-luminor-automatic-power-reserve-mens-watch-4/panerai-luminor-automatic-power-reserve-men-s-watch/5qtj5mnwl4hpEFq.jpg';
import patekPhilippeImg from '../assets/shop/watches/men/patek philippe/index-htm/New folder/23492626-3n6p8yiro9owyug4l59659o9-Square480.jpg';
import richardMilleImg from '../assets/shop/watches/richard mille/New folder/0py4aiqnn8ua-b3f78wjwmyx7mmrkt6amb8in-Square480.jpg';
import rolexImg from '../assets/shop/watches/rolex/rolex-datejust-36-unisex-watch-3/rolex-datejust-36-unisex-watch/biJr2JOdOcRapA8_a4cccce7-6201-4c34-b4d8-fc76d8d25197.jpg';
import tagHeuerImg from '../assets/shop/watches/luxury-watches-1/40mm-aquaracer-quartz-blue/40mm-aquaracer-quartz-blue/Web-2000px-WBP1113-BA0000_SOLDAT.jpg';
import tiffanyCoImg from '../assets/shop/watches/tiffany & Co/index-htm/New folder/18618626-762gyz903vv34stdd7y7rqh0-Square480.jpg';
import vanCleefImg from '../assets/shop/watches/women/vancleef and arpels/index-htm/New folder/42492395-31oekqtvrz30cq5qkb1vi8u0-Square480.jpg';
import zermattImg from '../assets/shop/watches/luxury-watches-1/31mm-m-band-gold-plated-black-dial/31mm-m-band-gold-plated-black-dial/17082BP64.jpg';

const brandImages = {
  'audemars-piguet': audemarsPiguetImg,
  'bell-ross': bellRossImg,
  'breitling': breitlingImg,
  'bulgari': bulgariImg,
  'cartier': cartierImg,
  'franck-muller': franckMullerImg,
  'hublot': hublotImg,
  'longines': longinesImg,
  'michel-herbelin': michelHerbelinImg,
  'montblanc': montblancImg,
  'omega': omegaImg,
  'panerai': paneriImg,
  'patek-philippe': patekPhilippeImg,
  'richard-mille': richardMilleImg,
  'rolex': rolexImg,
  'tag-heuer': tagHeuerImg,
  'tiffany-co': tiffanyCoImg,
  'van-cleef-arpels': vanCleefImg,
  'zermatt-diamonds': zermattImg,
};

export default function FeaturedBrands() {
  return (
    <section className="section featured-brands">
      <div className="section-container">
        <div className="section-header" data-scroll="fade-up">
          <h2 className="section-title">Our Maisons</h2>
          <Link to="/brands" className="section-view-all">
            All Brands <ArrowRight size={14} />
          </Link>
        </div>
        <div className="brands-grid">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/shop?brand=${brand.slug}`}
              className="brand-card"
            >
              <img
                src={brandImages[brand.slug]}
                alt={brand.name}
                className="brand-card-img"
              />
              <div className="brand-card-overlay" />
              <span className="brand-name">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
