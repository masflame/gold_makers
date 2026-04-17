/**
 * Fix placeholder prices (3344) in products.js
 * Assigns realistic ZAR prices based on item type, category, and name keywords.
 * 
 * Reference prices from correctly-priced items:
 *   Bracelets:     R39,900 (18ct gold flower bracelet)
 *   Earrings:      R9,999 – R25,900 (flower earrings to 1.5ct lab grown)
 *   Necklaces:     R29,900 (18ct gold flower necklaces)
 *   Pendants:      R31,900 (lab grown diamond pendant)
 *   Rings:         R4,900 – R55,000 (0.23ct band to 2.94ct platinum)
 *   Wedding Bands: R3,000 – R7,200 (bezel set to eternity)
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'products.js');
let src = fs.readFileSync(filePath, 'utf8');

// Seeded pseudo-random for consistent results (simple LCG)
let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed >> 16) / 32768; // 0..1
}

// Vary a base price by ±offset in steps of 'step'
function vary(base, offset, step) {
  const steps = Math.round(offset / step);
  const delta = (Math.round(rand() * steps * 2) - steps) * step;
  return base + delta;
}

function getPrice(name, type, category) {
  const n = name.toLowerCase();

  // ── BRACELETS ──
  if (type === 'bracelet') {
    if (n.includes('tennis')) return vary(45000, 5000, 1000);
    return vary(28000, 5000, 1000);
  }

  // ── EARRINGS ──
  if (type === 'earring') {
    if (n.includes('double halo'))     return vary(17900, 2000, 500);
    if (n.includes('vault lock'))      return vary(18900, 2000, 500);
    if (n.includes('drop'))            return vary(16900, 2000, 500);
    if (n.includes('trillogy') || n.includes('trilogy')) return vary(15900, 2000, 500);
    if (n.includes('halo'))            return vary(14900, 2000, 500);
    if (n.includes('hoop'))            return vary(12900, 2000, 500);
    if (n.includes('huggie'))          return vary(11900, 1500, 500);
    if (n.includes('cluster'))         return vary(13900, 2000, 500);
    if (n.includes('solitaire') || n.includes('solitair')) return vary(12900, 2000, 500);
    if (n.includes('stud'))            return vary(9900, 1500, 500);
    if (n.includes('jacket'))          return vary(8900, 1000, 500);
    if (n.includes('tube set'))        return vary(10900, 1500, 500);
    if (n.includes('sun set') || n.includes('aesthetic')) return vary(11900, 1500, 500);
    if (n.includes('pave'))            return vary(13900, 1500, 500);
    if (n.includes('3 stone') || n.includes('three stone')) return vary(14900, 2000, 500);
    return vary(12900, 2000, 500);
  }

  // ── NECKLACES ──
  if (type === 'necklace') {
    if (n.includes('chain') && n.includes('1.1'))  return vary(5900, 1000, 500);
    if (n.includes('chain'))           return vary(7900, 1500, 500);
    if (n.includes('cross'))           return vary(14900, 2000, 500);
    if (n.includes('halo'))            return vary(18900, 3000, 500);
    if (n.includes('heart') || n.includes('hear shape')) return vary(16900, 2000, 500);
    if (n.includes('butterfly'))       return vary(16900, 1500, 500);
    if (n.includes('star'))            return vary(15900, 2000, 500);
    if (n.includes('circle'))          return vary(13900, 1500, 500);
    if (n.includes('drop'))            return vary(17900, 2000, 500);
    return vary(14900, 2000, 500);
  }

  // ── PENDANTS ──
  if (type === 'pendant') {
    if (n.includes('double halo'))     return vary(16900, 2000, 500);
    if (n.includes('halo'))            return vary(12900, 2000, 500);
    if (n.includes('solitaire') || n.includes('solitair')) return vary(8900, 1500, 500);
    if (n.includes('cluster'))         return vary(14900, 2000, 500);
    if (n.includes('flower') || n.includes('star')) return vary(13900, 1500, 500);
    if (n.includes('heart'))           return vary(14900, 2000, 500);
    if (n.includes('two tone'))        return vary(15900, 2000, 500);
    if (n.includes('emerald'))         return vary(11900, 1500, 500);
    return vary(11900, 2000, 500);
  }

  // ── RINGS (engagement rings) ──
  if (type === 'ring' && (category === 'rings' || n.includes('engagement'))) {
    if (n.includes('platinum'))        return vary(35900, 5000, 1000);
    if (n.includes('hidden halo'))     return vary(29900, 4000, 1000);
    if (n.includes('vintage'))         return vary(25900, 3000, 1000);
    if (n.includes('3 stone') || n.includes('trilogy') || n.includes('trillogy')) return vary(27900, 4000, 1000);
    if (n.includes('halo') && (n.includes('square') || n.includes('cushion'))) return vary(26900, 3000, 1000);
    if (n.includes('halo') && n.includes('pear'))  return vary(25900, 3000, 1000);
    if (n.includes('halo') && n.includes('flower')) return vary(27900, 3000, 1000);
    if (n.includes('halo'))            return vary(24900, 3000, 1000);
    if (n.includes('multirow'))        return vary(23900, 3000, 1000);
    if (n.includes('bypass'))          return vary(21900, 2000, 1000);
    if (n.includes('spiral'))          return vary(23900, 2000, 1000);
    if (n.includes('twisted'))         return vary(22900, 2000, 1000);
    if (n.includes('channel set'))     return vary(22900, 2000, 1000);
    if (n.includes('prong set'))       return vary(21900, 2000, 1000);
    if (n.includes('single row'))      return vary(19900, 2000, 1000);
    if (n.includes('solitaire') || n.includes('solitair')) return vary(19900, 3000, 1000);
    if (n.includes('remount'))         return vary(16900, 2000, 1000);
    if (n.includes('oval') || n.includes('pear')) return vary(24900, 3000, 1000);
    if (n.includes('marquise'))        return vary(25900, 3000, 1000);
    if (n.includes('rose gold'))       return vary(23900, 3000, 1000);
    if (n.includes('yellow gold'))     return vary(22900, 2000, 1000);
    if (n.includes('white gold'))      return vary(22900, 2000, 1000);
    if (n.includes('lab grown'))       return vary(24900, 4000, 1000);
    return vary(21900, 3000, 1000);
  }

  // ── WEDDING BANDS ──
  if (type === 'ring' && (category === 'wedding-bands' || n.includes('wedding') || n.includes('band') || n.includes('eternity'))) {
    if (n.includes('full') && n.includes('eternity')) return vary(16900, 2000, 500);
    if (n.includes('eternity'))        return vary(14900, 2000, 500);
    if (n.includes('princess cut'))    return vary(11900, 1500, 500);
    if (n.includes('pave'))            return vary(9900, 1500, 500);
    if (n.includes('vintage'))         return vary(8900, 1500, 500);
    if (n.includes('channel'))         return vary(9900, 1500, 500);
    if (n.includes('bar set'))         return vary(8400, 1000, 500);
    if (n.includes('bezel'))           return vary(7900, 1000, 500);
    if (n.includes('prong set'))       return vary(8400, 1500, 500);
    if (n.includes('curved'))          return vary(7400, 1000, 500);
    if (n.includes('braided'))         return vary(7400, 1000, 500);
    if (n.includes('twisted'))         return vary(7400, 1000, 500);
    if (n.includes('lab grown'))       return vary(8900, 1500, 500);
    if (n.includes('straight'))        return vary(5900, 1000, 500);
    return vary(6900, 1500, 500);
  }

  // fallback
  return vary(12900, 2000, 500);
}

// Find all products with price: 3344 and replace with calculated prices
const productBlockRegex = /\{\s*\n\s*id:\s*(\d+),\s*\n\s*type:\s*'([^']+)',\s*\n\s*brand:\s*'([^']*)',\s*\n\s*name:\s*'([^']*)',\s*\n\s*price:\s*3344,\s*\n\s*currency:\s*'[^']*',\s*\n[^}]*?category:\s*'([^']*)'/g;

let match;
const replacements = [];

while ((match = productBlockRegex.exec(src)) !== null) {
  const [fullMatch, id, type, brand, name, category] = match;
  const newPrice = getPrice(name, type, category);
  // Find exact position of "price: 3344" within this match
  const priceStr = 'price: 3344,';
  const offset = fullMatch.indexOf(priceStr);
  const absPos = match.index + offset;
  replacements.push({ id: +id, name, type, category, oldPrice: 3344, newPrice, absPos });
}

console.log(`Found ${replacements.length} items to fix.\n`);

// Apply replacements from end to start to maintain positions
replacements.sort((a, b) => b.absPos - a.absPos);

for (const r of replacements) {
  src = src.substring(0, r.absPos) + `price: ${r.newPrice},` + src.substring(r.absPos + 'price: 3344,'.length);
}

fs.writeFileSync(filePath, src, 'utf8');

// Print summary sorted by id
replacements.sort((a, b) => a.id - b.id);

const cats = {};
for (const r of replacements) {
  const cat = r.category || r.type;
  if (!cats[cat]) cats[cat] = [];
  cats[cat].push(r);
}

for (const [cat, items] of Object.entries(cats)) {
  console.log(`\n── ${cat.toUpperCase()} (${items.length} items) ──`);
  const prices = items.map(i => i.newPrice).sort((a, b) => a - b);
  console.log(`  Price range: R${prices[0].toLocaleString()} – R${prices[prices.length - 1].toLocaleString()}`);
  for (const item of items) {
    console.log(`  #${item.id} R${item.newPrice.toLocaleString().padStart(6)} │ ${item.name}`);
  }
}

console.log(`\n✔ Updated ${replacements.length} prices in products.js`);
