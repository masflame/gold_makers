const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'src', 'data', 'products.js');
const OUT_FILE = path.join(ROOT, 'public', 'sitemap.xml');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://www.goldmakers.co.za').replace(/\/$/, '');
const TODAY = new Date().toISOString().split('T')[0];

const STATIC_ROUTES = [
  '/',
  '/shop',
  '/about',
  '/faq',
  '/sell',
  '/trade',
  '/exchange',
];

function getProductIds(source) {
  const matches = source.matchAll(/\bid:\s*(\d+)/g);
  const ids = [];
  for (const match of matches) {
    ids.push(Number(match[1]));
  }
  return [...new Set(ids)].sort((a, b) => a - b);
}

function toUrlEntry(route, priority, changefreq) {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${route}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function main() {
  const source = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  const productIds = getProductIds(source);

  const staticEntries = STATIC_ROUTES.map((route) =>
    toUrlEntry(route, route === '/' ? '1.0' : '0.8', route === '/' ? 'daily' : 'weekly')
  );

  const productEntries = productIds.map((id) =>
    toUrlEntry(`/product/${id}`, '0.7', 'weekly')
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...productEntries,
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(OUT_FILE, xml, 'utf8');
  console.log(`Sitemap generated with ${STATIC_ROUTES.length + productIds.length} URLs -> ${OUT_FILE}`);
}

main();
