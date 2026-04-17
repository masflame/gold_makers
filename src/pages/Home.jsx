import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import Categories from '../components/Categories';
import CategoryPreview from '../components/CategoryPreview';
import FeaturedBrands from '../components/FeaturedBrands';
import SellWatch from '../components/SellWatch';
import Newsletter from '../components/Newsletter';

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Content slides over the sticky hero like a curtain */}
      <div className="scroll-curtain">
        <TrustBar />
        <Categories />
        <CategoryPreview categoryId="watches" title="Luxury Timepieces" />
        <CategoryPreview categoryId="rings" title="Engagement Rings" />
        <CategoryPreview categoryId="wedding-bands" title="Wedding Bands" />
        <CategoryPreview categoryId="necklaces" title="Necklaces" />
        <CategoryPreview categoryId="pendants" title="Pendants" />
        <CategoryPreview categoryId="earrings" title="Earrings" />
        <CategoryPreview categoryId="bracelets" title="Bracelets" />
        <FeaturedBrands />
        <SellWatch />
        <Newsletter />
      </div>
    </main>
  );
}
