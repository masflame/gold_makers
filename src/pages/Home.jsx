import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import Categories from '../components/Categories';
import CategoryPreview from '../components/CategoryPreview';
import FeaturedBrands from '../components/FeaturedBrands';
import SellWatch from '../components/SellWatch';
import Newsletter from '../components/Newsletter';
import EditorialSplit from '../components/EditorialSplit';
import VideoShowcase from '../components/VideoShowcase';
import DualCards from '../components/DualCards';

/* ── Placeholder media - swap these for your actual files ── */
import editorialImg1 from '../assets/background/Quality.jpg';
import editorialImg2 from '../assets/background/Authenticit.jpg';
import showcaseVideo from '../assets/background/Timeless .mp4';
import craftedVideo from '../assets/background/crafted.mp4';
import forHimVideo from '../assets/background/for him.mp4';
import forHerVideo from '../assets/background/for her.mp4';
import dualImg1 from '../assets/cards/Sell.jpg';
import dualImg2 from '../assets/cards/Trade.jpg';

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Content slides over the sticky hero like a curtain */}
      <div className="scroll-curtain">
        <TrustBar />
        <Categories />
        <CategoryPreview categoryId="watches" title="Luxury Timepieces" />

        {/* ── Editorial: Craftsmanship ── */}
        <EditorialSplit
          image={editorialImg1}
          video={craftedVideo}
          tagline="Our Heritage"
          title="Crafted for Generations"
          subtitle="Every piece in our collection is hand-selected for its provenance, condition and timeless appeal. We partner with the world's most revered houses to bring you nothing less than extraordinary."
          cta="Our Story"
          ctaLink="/about"
        />

        <CategoryPreview categoryId="rings" title="Engagement Rings" />
        <CategoryPreview categoryId="wedding-bands" title="Wedding Bands" />

        {/* ── Video Showcase ── */}
        <VideoShowcase
          video={showcaseVideo}
          title="Timeless Elegance"
          subtitle="Where heritage meets modern luxury. Discover pieces that transcend trends and become part of your legacy."
          cta="Shop the Collection"
          ctaLink="/shop"
        />

        <CategoryPreview categoryId="necklaces" title="Necklaces" />
        <CategoryPreview categoryId="pendants" title="Pendants" />

        {/* ── Dual Collection Cards ── */}
        <DualCards cards={[
          {
            image: dualImg1,
            video: forHimVideo,
            title: 'For Him',
            subtitle: 'Bold watches & statement pieces.',
            link: '/shop?gender=men',
          },
          {
            image: dualImg2,
            video: forHerVideo,
            title: 'For Her',
            subtitle: 'Exquisite rings, necklaces & earrings.',
            link: '/shop?gender=women',
          },
        ]} />

        <CategoryPreview categoryId="earrings" title="Earrings" />
        <CategoryPreview categoryId="bracelets" title="Bracelets" />

        {/* ── Editorial: Heritage (reversed layout) ── */}
        <EditorialSplit
          image={editorialImg2}
          tagline="Trust & Quality"
          title="Authenticated & Certified"
          subtitle="Every item undergoes rigorous verification by our master horologists and gemologists. Shop with absolute confidence, authenticity guaranteed."
          cta="Learn More"
          ctaLink="/about"
          reverse
        />

        <FeaturedBrands />
        <SellWatch />
        <Newsletter />
      </div>
    </main>
  );
}
