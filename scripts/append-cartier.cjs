/**
 * Appends new Cartier jewelry items to the EXISTING products.js
 * without touching existing products (preserves sales, prices, etc.)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'src', 'data', 'products.js');
const SHOP = path.join(ROOT, 'src', 'assets', 'shop');

// ---------- config ----------
const NEW_SOURCES = [
  {
    json: 'rings/rings-cartier.json',
    imageDir: 'rings/rings-cartier',
    category: 'rings',
    type: 'ring',
    brand: 'Cartier',
    baseName: 'Cartier Ring',
    // Base price R560,550 from USD $30,300 - vary ±40%
    priceRange: [180_000, 750_000],
  },
  {
    json: 'bracelets/bracelets cartier.json',
    imageDir: 'bracelets/bracelets cartier',
    category: 'bracelets',
    type: 'bracelet',
    brand: 'Cartier',
    baseName: 'Cartier Bracelet',
    // Base price R135,975 from USD $7,350 - vary
    priceRange: [55_000, 220_000],
  },
  {
    json: 'earings/earrings cartier.json',
    imageDir: 'earings/earrings cartier',
    category: 'earrings',
    type: 'earring',
    brand: 'Cartier',
    baseName: 'Cartier Earring',
    // Base price R109,150 from USD $5,900 - vary
    priceRange: [42_000, 185_000],
  },
  {
    json: 'necklaces/neckalces-cartier.json',
    imageDir: 'necklaces/neckalces-cartier',
    category: 'necklaces',
    type: 'necklace',
    brand: 'Cartier',
    baseName: 'Cartier Necklace',
    // Base price R530,950 from USD $28,700 - vary
    priceRange: [150_000, 850_000],
  },
  {
    json: 'necklaces/necklaces-2.json',
    imageDir: 'necklaces/necklaces-2',
    category: 'necklaces',
    type: 'necklace',
    brand: 'L\'Atelier Paris',
    baseName: 'Designer Necklace',
    useSourcePrices: true, // necklaces-2 has varied prices already
  },
  {
    json: 'necklaces/necklaces-3.json',
    imageDir: 'necklaces/necklaces-3',
    category: 'necklaces',
    type: 'necklace',
    brand: 'Cartier',
    baseName: 'Cartier Necklace',
    priceRange: [150_000, 850_000],
  },
  {
    json: 'necklaces/necklaces-cartier-4.json',
    imageDir: 'necklaces/necklaces-cartier-3',
    category: 'necklaces',
    type: 'necklace',
    brand: 'Cartier',
    baseName: 'Cartier Necklace',
    priceRange: [150_000, 850_000],
  },
  {
    json: 'wedding bands/wedding-bands cartier.json',
    imageDir: 'wedding bands/wedding-bands cartier',
    category: 'wedding-bands',
    type: 'ring',
    brand: 'Cartier',
    baseName: 'Cartier Wedding Band',
    // Base R26,270 from USD $1,420 - vary
    priceRange: [12_000, 55_000],
  },
];

// ---------- helpers ----------

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function roundToNearest(val, nearest) {
  return Math.round(val / nearest) * nearest;
}

function getImageFiles(dir) {
  const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
  const results = [];
  
  function walk(d) {
    try {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) {
          walk(full);
        } else if (exts.has(path.extname(e.name).toLowerCase())) {
          // Relative path from src/data/ to the image
          const rel = path.relative(path.join(ROOT, 'src', 'data'), full).split('\\').join('/');
          results.push(rel);
        }
      }
    } catch {}
  }
  walk(dir);
  return results;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------- read existing products.js ----------

let src = fs.readFileSync(PRODUCTS_FILE, 'utf-8');

// Find last import index
const importMatches = [...src.matchAll(/^import img(\d+)/gm)];
let nextImgIdx = 0;
if (importMatches.length > 0) {
  nextImgIdx = parseInt(importMatches[importMatches.length - 1][1]) + 1;
}

// Find last product id
const idMatches = [...src.matchAll(/^\s+id: (\d+)/gm)];
let nextProductId = 1;
if (idMatches.length > 0) {
  nextProductId = parseInt(idMatches[idMatches.length - 1][1]) + 1;
}

console.log(`Starting from img${nextImgIdx}, product id ${nextProductId}`);

// ---------- generate new products ----------

const newImports = [];
const newProducts = [];
const rand = seededRandom(42); // deterministic

let totalAdded = 0;
let totalSales = 0;

for (const source of NEW_SOURCES) {
  const jsonPath = path.join(SHOP, source.json);
  const imgDir = path.join(SHOP, source.imageDir);
  
  if (!fs.existsSync(jsonPath)) {
    console.log(`  SKIP: ${source.json} not found`);
    continue;
  }
  
  const items = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const allImages = getImageFiles(imgDir);
  
  if (allImages.length === 0) {
    console.log(`  SKIP: No images in ${source.imageDir}`);
    continue;
  }
  
  // Distribute images across items (1 image per product for Cartier - each is unique product photo)
  const itemCount = Math.min(items.length, allImages.length);
  
  console.log(`  ${source.json}: ${itemCount} products from ${items.length} items, ${allImages.length} images`);
  
  for (let i = 0; i < itemCount; i++) {
    const item = items[i];
    const imgPath = allImages[i];
    
    // Generate import
    const varName = `img${nextImgIdx++}`;
    newImports.push(`import ${varName} from '${imgPath}';`);
    
    // Price
    let price;
    if (source.useSourcePrices) {
      price = Math.round(parseFloat(String(item.price).replace(/[^0-9.]/g, '')));
    } else {
      const [min, max] = source.priceRange;
      price = roundToNearest(min + rand() * (max - min), 500);
    }
    
    if (price < 100) continue;
    
    // Sale (75% chance, 15-40% off)
    let saleLine = '';
    if (rand() < 0.75) {
      const salePercent = Math.round(15 + rand() * 25);
      const originalPrice = roundToNearest(price / (1 - salePercent / 100), 100);
      saleLine = `\n    originalPrice: ${originalPrice},\n    salePercent: ${salePercent},`;
      totalSales++;
    }
    
    // Name variation
    const nameVariants = {
      'Cartier Ring': ['Cartier Love Ring', 'Cartier Trinity Ring', 'Cartier Juste Un Clou Ring', 'Cartier Clash Ring', 'Cartier Panthere Ring', 'Cartier Etincelle Ring', 'Cartier Destinee Ring', 'Cartier Agrafe Ring', 'Cartier Nouvelle Vague Ring', 'Cartier Cactus Ring'],
      'Cartier Bracelet': ['Cartier Love Bracelet', 'Cartier Juste Un Clou Bracelet', 'Cartier Trinity Bracelet', 'Cartier Clash Bracelet', 'Cartier Panthere Bracelet', 'Cartier Ecrou Bracelet', 'Cartier Diamants Legers Bracelet', 'Cartier Cactus Bracelet'],
      'Cartier Earring': ['Cartier Love Earrings', 'Cartier Trinity Earrings', 'Cartier Panthere Earrings', 'Cartier Clash Earrings', 'Cartier Diamants Legers Earrings', 'Cartier Etincelle Earrings', 'Cartier Juste Un Clou Earrings'],
      'Cartier Necklace': ['Cartier Love Necklace', 'Cartier Trinity Necklace', 'Cartier Panthere Necklace', 'Cartier Juste Un Clou Necklace', 'Cartier Clash Necklace', 'Cartier Diamants Legers Necklace', 'Cartier Amulette Necklace', 'Cartier Cactus Necklace'],
      'Cartier Wedding Band': ['Cartier Love Wedding Band', 'Cartier Trinity Wedding Band', 'Cartier 1895 Wedding Band', 'Cartier Ballerine Wedding Band', 'Cartier Destinee Wedding Band', 'Cartier Ruban Wedding Band', 'Cartier Vendome Wedding Band'],
    };
    
    const variants = nameVariants[source.baseName] || [source.baseName];
    const name = variants[Math.floor(rand() * variants.length)];
    
    const esc = s => (s || '').replace(/'/g, "\\'");
    
    const productStr = `  {
    id: ${nextProductId++},
    type: '${source.type}',
    brand: '${esc(source.brand)}',
    name: '${esc(name)}',
    price: ${price},${saleLine}
    currency: 'ZAR',
    condition: 'New',
    image: ${varName},
    images: [${varName}],
    category: '${source.category}',
    featured: ${price > 50000},
  }`;
    
    newProducts.push(productStr);
    totalAdded++;
  }
}

console.log(`\nAdding ${totalAdded} new products (${totalSales} with sales)`);

// ---------- patch products.js ----------

// 1. Insert new imports after last import line
const lastImportIdx = src.lastIndexOf('\nimport img');
const afterLastImport = src.indexOf('\n', lastImportIdx + 1);
const insertImportsAt = src.indexOf('\n', afterLastImport);

// Actually, find the blank line after all imports
const importEndMatch = src.match(/^import img\d+ from '[^']+';$/gm);
const lastImportLine = importEndMatch[importEndMatch.length - 1];
const lastImportPos = src.lastIndexOf(lastImportLine) + lastImportLine.length;

src = src.slice(0, lastImportPos) + '\n' + newImports.join('\n') + src.slice(lastImportPos);

// 2. Insert new products before the closing ]; of products array
const closingBracket = src.lastIndexOf('\n];');
src = src.slice(0, closingBracket) + ',\n' + newProducts.join(',\n') + '\n];' + src.slice(closingBracket + 3);

fs.writeFileSync(PRODUCTS_FILE, src, 'utf-8');

// Verify
const finalSales = (src.match(/salePercent/g) || []).length;
const finalProducts = (src.match(/^\s+id: \d+/gm) || []).length;
console.log(`\nFinal: ${finalProducts} products, ${finalSales} with sales`);
console.log('Done!');
