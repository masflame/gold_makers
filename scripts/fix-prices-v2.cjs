/**
 * Fix incorrect/scraped prices across all product categories.
 *
 * Known bad prices (from CSV scraping artifacts):
 *   Watches:
 *     Bulgari         R4,486   -> R60k–R250k
 *     Michel Herbelin R2,049   -> R15k–R45k
 *     Montblanc       R4,814   -> R25k–R120k
 *     Tiffany & Co    R5,549 / R5,762 -> R40k–R180k
 *     Rolex           R15,675  -> R100k–R950k
 *     Cartier         R16,400  -> R80k–R400k
 *     Van Cleef       R15,856  -> R100k–R500k
 *     Patek Philippe  R18,749  -> R300k–R2M
 *     Franck Muller   R20,032  -> R80k–R450k
 *     Richard Mille   R41,890 / R42,424 -> R500k–R5M
 *     Bell & Ross     R42,482  -> R55k–R180k
 *     Audemars Piguet R51,455  -> R200k–R1.5M
 *   Wedding Bands:
 *     R6,400 -> R7k–R17k
 *   Necklaces/Rings with R16,400 -> proper price
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'products.js');
let src = fs.readFileSync(filePath, 'utf8');

// Seeded pseudo-random (LCG) for consistent results
let seed = 7777;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed >> 16) / 32768;
}

/** Return a price varying around `base` by ±offset, in steps of `step` */
function vary(base, offset, step) {
  const steps = Math.round(offset / step);
  const delta = (Math.round(rand() * steps * 2) - steps) * step;
  return Math.max(step, base + delta);
}

/** Pick a random price from a [min,max] range in 100-increments */
function randRange(min, max) {
  const step = max > 100000 ? 10000 : max > 50000 ? 5000 : 1000;
  const steps = Math.floor((max - min) / step);
  return min + Math.round(rand() * steps) * step;
}

// ── Known bad prices (the exact values to match) ──
const BAD_WATCH_PRICES = new Set([
  4486,    // Bulgari
  2049,    // Michel Herbelin
  4814,    // Montblanc
  5549,    // Tiffany & Co
  5762,    // Tiffany & Co
  15675,   // Rolex
  16400,   // Cartier (watches only)
  15856,   // Van Cleef & Arpels
  18749,   // Patek Philippe
  20032,   // Franck Muller
  41890,   // Richard Mille
  42424,   // Richard Mille
  42482,   // Bell & Ross
  51455,   // Audemars Piguet
]);

const BAD_WEDDING_BAND_PRICES = new Set([6400]);
const BAD_NECKLACE_PRICES = new Set([16400]);
const BAD_RING_PRICES = new Set([16400]);

// ── Realistic price ranges per watch brand (ZAR) ──
function getWatchPrice(brand, name) {
  const n = name.toLowerCase();

  switch (brand) {
    case 'Bulgari':
      if (n.includes('serpenti'))   return randRange(120000, 220000);
      if (n.includes('octo'))      return randRange(80000, 180000);
      if (n.includes('lvcea'))     return randRange(90000, 160000);
      if (n.includes('aluminium')) return randRange(60000, 95000);
      return randRange(70000, 200000);

    case 'Michel Herbelin':
      if (n.includes('newport'))      return randRange(18000, 32000);
      if (n.includes('cap camarat'))  return randRange(22000, 38000);
      if (n.includes('galet'))        return randRange(20000, 35000);
      return randRange(16000, 40000);

    case 'Montblanc':
      if (n.includes('1858'))          return randRange(45000, 85000);
      if (n.includes('star legacy'))   return randRange(50000, 95000);
      if (n.includes('timewalker'))    return randRange(35000, 70000);
      if (n.includes('summit'))        return randRange(28000, 55000);
      if (n.includes('boheme'))        return randRange(40000, 75000);
      return randRange(30000, 90000);

    case 'Tiffany & Co':
      if (n.includes('atlas'))   return randRange(45000, 120000);
      return randRange(45000, 160000);

    case 'Rolex':
      if (n.includes('daytona'))       return randRange(350000, 850000);
      if (n.includes('submariner'))    return randRange(180000, 380000);
      if (n.includes('gmt'))           return randRange(200000, 420000);
      if (n.includes('day-date') || n.includes('daydate')) return randRange(350000, 750000);
      if (n.includes('datejust'))      return randRange(150000, 350000);
      if (n.includes('sky-dweller'))   return randRange(400000, 800000);
      if (n.includes('yacht'))         return randRange(250000, 500000);
      if (n.includes('explorer'))      return randRange(150000, 300000);
      if (n.includes('milgauss'))      return randRange(180000, 320000);
      if (n.includes('air-king'))      return randRange(130000, 250000);
      if (n.includes('cellini'))       return randRange(200000, 400000);
      return randRange(150000, 500000);

    case 'Cartier':
      if (n.includes('santos'))        return randRange(95000, 250000);
      if (n.includes('tank'))          return randRange(80000, 220000);
      if (n.includes('ballon bleu'))   return randRange(100000, 280000);
      if (n.includes('panthere'))      return randRange(85000, 200000);
      if (n.includes('pasha'))         return randRange(110000, 300000);
      if (n.includes('ronde'))         return randRange(80000, 180000);
      return randRange(85000, 320000);

    case 'Van Cleef & Arpels':
      if (n.includes('alhambra'))      return randRange(150000, 400000);
      return randRange(120000, 450000);

    case 'Patek Philippe':
      if (n.includes('nautilus'))      return randRange(600000, 1800000);
      if (n.includes('aquanaut'))      return randRange(500000, 1200000);
      if (n.includes('calatrava'))     return randRange(400000, 900000);
      return randRange(350000, 1500000);

    case 'Franck Muller':
      if (n.includes('vanguard'))      return randRange(100000, 280000);
      if (n.includes('master'))        return randRange(120000, 350000);
      if (n.includes('long island'))   return randRange(80000, 200000);
      return randRange(90000, 380000);

    case 'Richard Mille':
      if (n.includes('rm 011') || n.includes('rm-011')) return randRange(2000000, 4500000);
      if (n.includes('rm 035') || n.includes('rm-035')) return randRange(800000, 1800000);
      if (n.includes('rm 07')  || n.includes('rm-07'))  return randRange(900000, 2200000);
      if (n.includes('rm 01')  || n.includes('rm-01'))  return randRange(1200000, 3000000);
      return randRange(600000, 3500000);

    case 'Bell & Ross':
      if (n.includes('br 05') || n.includes('br-05'))   return randRange(65000, 140000);
      if (n.includes('br 03') || n.includes('br-03'))   return randRange(55000, 120000);
      if (n.includes('br 01') || n.includes('br-01'))   return randRange(80000, 160000);
      return randRange(60000, 160000);

    case 'Audemars Piguet':
      if (n.includes('royal oak') && n.includes('offshore')) return randRange(350000, 1200000);
      if (n.includes('royal oak'))     return randRange(300000, 1000000);
      return randRange(250000, 1200000);

    default:
      return randRange(45000, 120000);
  }
}

function getWeddingBandPrice(name) {
  const n = name.toLowerCase();
  if (n.includes('full') && n.includes('eternity')) return vary(16900, 2000, 500);
  if (n.includes('eternity'))        return vary(14900, 2000, 500);
  if (n.includes('princess'))        return vary(11900, 1500, 500);
  if (n.includes('pave'))            return vary(9900, 1500, 500);
  if (n.includes('vintage'))         return vary(8900, 1500, 500);
  if (n.includes('channel'))         return vary(9900, 1500, 500);
  if (n.includes('bar set'))         return vary(8400, 1000, 500);
  if (n.includes('bezel'))           return vary(7900, 1000, 500);
  if (n.includes('prong'))           return vary(8400, 1500, 500);
  if (n.includes('curved'))          return vary(8400, 1000, 500);
  if (n.includes('braided'))         return vary(8400, 1000, 500);
  if (n.includes('twisted'))         return vary(8400, 1000, 500);
  if (n.includes('straight'))        return vary(7400, 1000, 500);
  return vary(8900, 1500, 500);
}

function getNecklacePrice(name) {
  const n = name.toLowerCase();
  if (n.includes('chain'))     return vary(7900, 1500, 500);
  if (n.includes('halo'))      return vary(18900, 3000, 500);
  if (n.includes('cross'))     return vary(14900, 2000, 500);
  if (n.includes('heart'))     return vary(16900, 2000, 500);
  if (n.includes('butterfly')) return vary(16900, 1500, 500);
  if (n.includes('drop'))      return vary(17900, 2000, 500);
  return vary(14900, 2000, 500);
}

function getRingPrice(name) {
  const n = name.toLowerCase();
  if (n.includes('eternity'))  return vary(14900, 2000, 500);
  if (n.includes('halo'))      return vary(24900, 3000, 1000);
  if (n.includes('solitaire')) return vary(19900, 3000, 1000);
  return vary(21900, 3000, 1000);
}

// ── Parse all products and fix bad prices ──
// Regex captures: id, type, brand, name, price, then rest up to category
const blockRe = /\{\s*\n\s*id:\s*(\d+),\s*\n\s*type:\s*'([^']+)',\s*\n\s*brand:\s*'([^']*)',\s*\n\s*name:\s*'([^']*)',\s*\n\s*price:\s*(\d+),\s*\n\s*currency:\s*'[^']*',\s*\n[^}]*?category:\s*'([^']*)'/g;

let match;
const replacements = [];

while ((match = blockRe.exec(src)) !== null) {
  const [fullMatch, id, type, brand, name, priceStr, category] = match;
  const price = +priceStr;
  let newPrice = null;

  // WATCHES
  if (type === 'watch' && BAD_WATCH_PRICES.has(price)) {
    newPrice = getWatchPrice(brand, name);
  }
  // WEDDING BANDS
  else if (type === 'ring' && (category === 'wedding-bands' || name.toLowerCase().includes('wedding') || name.toLowerCase().includes('band')) && BAD_WEDDING_BAND_PRICES.has(price)) {
    newPrice = getWeddingBandPrice(name);
  }
  // NECKLACES
  else if (type === 'necklace' && BAD_NECKLACE_PRICES.has(price)) {
    newPrice = getNecklacePrice(name);
  }
  // RINGS (non wedding-band)
  else if (type === 'ring' && category !== 'wedding-bands' && BAD_RING_PRICES.has(price)) {
    newPrice = getRingPrice(name);
  }

  if (newPrice !== null) {
    const priceToken = `price: ${price},`;
    const offset = fullMatch.indexOf(priceToken);
    const absPos = match.index + offset;
    replacements.push({ id: +id, brand, name, type, category, oldPrice: price, newPrice, absPos, len: priceToken.length });
  }
}

console.log(`Found ${replacements.length} items with bad prices to fix.\n`);

// Apply from end→start to keep positions valid
replacements.sort((a, b) => b.absPos - a.absPos);
for (const r of replacements) {
  src = src.substring(0, r.absPos) + `price: ${r.newPrice},` + src.substring(r.absPos + r.len);
}

fs.writeFileSync(filePath, src, 'utf8');

// ── Summary ──
replacements.sort((a, b) => a.id - b.id);
const byBrand = {};
for (const r of replacements) {
  const key = r.brand || r.category;
  if (!byBrand[key]) byBrand[key] = [];
  byBrand[key].push(r);
}

for (const [key, items] of Object.entries(byBrand).sort()) {
  const prices = items.map(i => i.newPrice).sort((a, b) => a - b);
  console.log(`\n── ${key} (${items.length} items) ──`);
  console.log(`  Old: R${items[0].oldPrice.toLocaleString()} → New range: R${prices[0].toLocaleString()} – R${prices[prices.length - 1].toLocaleString()}`);
  items.slice(0, 3).forEach(i =>
    console.log(`  #${i.id} R${i.oldPrice.toLocaleString()} → R${i.newPrice.toLocaleString()} │ ${i.name.substring(0, 50)}`)
  );
  if (items.length > 3) console.log(`  ... and ${items.length - 3} more`);
}

console.log(`\n✔ Fixed ${replacements.length} prices in products.js`);
