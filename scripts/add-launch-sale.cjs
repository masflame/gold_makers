/**
 * Add launch sale prices to products.js
 * Adds `originalPrice` and `salePercent` fields to ~80% of products.
 * The current `price` becomes the sale price; `originalPrice` is the higher pre-sale price.
 *
 * Discount tiers:
 *   - Ultra-luxury (>R500k): 12–20% off
 *   - High-luxury (R100k–R500k): 18–28% off
 *   - Mid-range (R30k–R100k): 22–35% off
 *   - Accessible (R5k–R30k): 28–40% off
 *   - Jewellery (non-watch): 25–45% off
 *
 * Run with: node scripts/add-launch-sale.cjs
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'products.js');
let src = fs.readFileSync(filePath, 'utf8');

// Seeded PRNG for reproducibility
let seed = 31415;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed >> 16) / 32768;
}

function pickPercent(min, max) {
  // Round to nearest whole percent
  return Math.round(min + rand() * (max - min));
}

function getSalePercent(price, type, brand) {
  // Some ultra-premium brands get smaller discounts (more exclusive feel)
  const ultraPremium = ['Richard Mille', 'Patek Philippe', 'Audemars Piguet'];
  const premium = ['Rolex', 'Cartier', 'Van Cleef & Arpels', 'Hublot', 'Omega', 'Panerai'];

  if (type === 'watch') {
    if (ultraPremium.includes(brand)) return pickPercent(12, 20);
    if (premium.includes(brand)) return pickPercent(18, 28);
    if (price > 500000) return pickPercent(12, 22);
    if (price > 100000) return pickPercent(22, 32);
    if (price > 30000) return pickPercent(28, 38);
    return pickPercent(30, 42);
  }

  // Jewellery categories
  if (price > 30000) return pickPercent(22, 35);
  if (price > 15000) return pickPercent(28, 40);
  return pickPercent(32, 45);
}

function roundPrice(price) {
  // Round up to nearest 100
  return Math.ceil(price / 100) * 100;
}

// Parse every product block to find its price line and add originalPrice + salePercent
const blockRe = /\{\s*\n\s*id:\s*(\d+),\s*\n\s*type:\s*'([^']+)',\s*\n\s*brand:\s*'([^']*)',\s*\n\s*name:\s*'[^']*',\s*\n\s*price:\s*(\d+),/g;

let match;
const edits = [];

while ((match = blockRe.exec(src)) !== null) {
  const [fullMatch, idStr, type, brand, priceStr] = match;
  const id = +idStr;
  const currentPrice = +priceStr;

  // ~85% of items go on sale
  if (rand() < 0.15) continue;

  const pct = getSalePercent(currentPrice, type, brand);
  // originalPrice = currentPrice / (1 - pct/100)  →  current price IS the sale price
  const originalPrice = roundPrice(currentPrice / (1 - pct / 100));

  // Find position of the `price: XXXXX,` line to insert after it
  const priceToken = `price: ${currentPrice},`;
  const priceOffset = fullMatch.indexOf(priceToken);
  const absPos = match.index + priceOffset + priceToken.length;

  edits.push({ id, pct, originalPrice, currentPrice, absPos });
}

console.log(`Adding sale prices to ${edits.length} products.\n`);

// Apply edits from end→start
edits.sort((a, b) => b.absPos - a.absPos);

for (const e of edits) {
  const insert = `\n    originalPrice: ${e.originalPrice},\n    salePercent: ${e.pct},`;
  src = src.substring(0, e.absPos) + insert + src.substring(e.absPos);
}

fs.writeFileSync(filePath, src, 'utf8');

// Summary
const byCat = {};
edits.forEach(e => {
  const key = e.pct + '%';
  byCat[key] = (byCat[key] || 0) + 1;
});

console.log('Discount distribution:');
Object.entries(byCat).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([pct, count]) => {
  console.log(`  ${pct.padStart(3)}: ${count} items`);
});

const totalOnSale = edits.length;
const avgDiscount = edits.reduce((s, e) => s + e.pct, 0) / edits.length;
console.log(`\nTotal on sale: ${totalOnSale}`);
console.log(`Average discount: ${avgDiscount.toFixed(1)}%`);
console.log(`\n✔ Added originalPrice & salePercent to ${totalOnSale} products`);
