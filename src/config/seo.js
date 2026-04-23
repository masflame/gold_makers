export const SITE_NAME = 'Gold Makers';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.goldmakers.co.za').replace(/\/$/, '');
export const SITE_DESCRIPTION =
  'Gold Makers offers authenticated luxury watches and fine jewelry, including Rolex, Cartier, engagement rings, bracelets, and more.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/gm-icon.png`;

const BUSINESS_EMAIL = import.meta.env.VITE_BUSINESS_EMAIL?.trim();
const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_PHONE?.trim();
const BUSINESS_SAME_AS = (import.meta.env.VITE_BUSINESS_SAME_AS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export const BUSINESS = {
  legalName: 'Gold Makers',
  areaServed: 'ZA',
  ...(BUSINESS_EMAIL ? { email: BUSINESS_EMAIL } : {}),
  ...(BUSINESS_PHONE ? { telephone: BUSINESS_PHONE } : {}),
  sameAs: BUSINESS_SAME_AS,
};

export function buildCanonical(pathname = '/', search = '') {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_URL}${safePath}${search}`;
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS.legalName,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    areaServed: BUSINESS.areaServed,
    ...(BUSINESS.email ? { email: BUSINESS.email } : {}),
    ...(BUSINESS.telephone ? { telephone: BUSINESS.telephone } : {}),
    ...(BUSINESS.sameAs.length ? { sameAs: BUSINESS.sameAs } : {}),
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-ZA',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?query={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
