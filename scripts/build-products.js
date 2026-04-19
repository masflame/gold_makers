/**
 * Reads all JSON files from src/assets/shop/ and generates src/data/products.js
 * Run with: node scripts/build-products.js
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, dirname, relative, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SHOP = join(ROOT, 'src', 'assets', 'shop');
const DATA_OUT = join(ROOT, 'src', 'data', 'products.js');

// ----------  helpers  ----------

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cleanProductName(raw) {
  return raw.replace(/\s*\|.*$/i, '').trim();
}

function inferBrand(name, description = '', jsonPath = '') {
  const text = (name + ' ' + description + ' ' + jsonPath).toLowerCase();
  const brandMap = [
    ['rolex', 'Rolex'],
    ['omega', 'Omega'],
    ['tag heuer', 'TAG Heuer'], ['tag-heuer', 'TAG Heuer'],
    ['cartier', 'Cartier'],
    ['breitling', 'Breitling'],
    ['hublot', 'Hublot'],
    ['panerai', 'Panerai'],
    ['bulgari', 'Bulgari'], ['bvlgari', 'Bulgari'],
    ['franck muller', 'Franck Muller'], ['franck-muller', 'Franck Muller'],
    ['richard mille', 'Richard Mille'], ['richard-mille', 'Richard Mille'],
    ['patek philippe', 'Patek Philippe'], ['patek-philippe', 'Patek Philippe'],
    ['audemars piguet', 'Audemars Piguet'], ['audemars-piguet', 'Audemars Piguet'],
    ['bell & ross', 'Bell & Ross'], ['bell ross', 'Bell & Ross'], ['bell-ross', 'Bell & Ross'],
    ['montblanc', 'Montblanc'],
    ['michel herbelin', 'Michel Herbelin'], ['michel-herbelin', 'Michel Herbelin'],
    ['tiffany', 'Tiffany & Co'],
    ['van cleef', 'Van Cleef & Arpels'], ['vancleef', 'Van Cleef & Arpels'],
    ['longines', 'Longines'],
    ['tudor', 'Tudor'],
    ['chopard', 'Chopard'],
    // Model-based inference
    ['octo', 'Bulgari'], ['serpenti', 'Bulgari'], ['lvcea', 'Bulgari'], ['diagono', 'Bulgari'], ['aluminium', 'Bulgari'],
    ['royal oak', 'Audemars Piguet'], ['royal-oak', 'Audemars Piguet'],
    ['nautilus', 'Patek Philippe'], ['calatrava', 'Patek Philippe'], ['aquanaut', 'Patek Philippe'],
    ['rm 0', 'Richard Mille'], ['rm-0', 'Richard Mille'], ['rm 1', 'Richard Mille'], ['rm-1', 'Richard Mille'],
    ['br 0', 'Bell & Ross'], ['br-0', 'Bell & Ross'], ['br 1', 'Bell & Ross'],
    ['newport', 'Michel Herbelin'], ['cap camarat', 'Michel Herbelin'], ['galet', 'Michel Herbelin'],
    ['aquaracer', 'TAG Heuer'], ['carrera', 'TAG Heuer'], ['formula 1', 'TAG Heuer'], ['formula-1', 'TAG Heuer'], ['monaco', 'TAG Heuer'],
    ['seamaster', 'Omega'], ['speedmaster', 'Omega'], ['constellation', 'Omega'], ['de ville', 'Omega'],
    ['datejust', 'Rolex'], ['submariner', 'Rolex'], ['daytona', 'Rolex'], ['gmt-master', 'Rolex'], ['day-date', 'Rolex'], ['daydate', 'Rolex'], ['explorer', 'Rolex'], ['yacht-master', 'Rolex'], ['air-king', 'Rolex'], ['milgauss', 'Rolex'], ['cellini', 'Rolex'], ['sky-dweller', 'Rolex'],
    ['spirit', 'Longines'], ['master collection', 'Longines'], ['hydroconquest', 'Longines'], ['conquest', 'Longines'], ['dolce vita', 'Longines'], ['prima luna', 'Longines'], ['grande classique', 'Longines'],
    ['luminor', 'Panerai'], ['radiomir', 'Panerai'], ['submersible', 'Panerai'],
    ['navitimer', 'Breitling'], ['chronomat', 'Breitling'], ['superocean', 'Breitling'], ['avenger', 'Breitling'],
    ['big bang', 'Hublot'], ['classic fusion', 'Hublot'], ['spirit of big bang', 'Hublot'],
    ['santos', 'Cartier'], ['tank', 'Cartier'], ['ballon bleu', 'Cartier'], ['panthere', 'Cartier'], ['ronde', 'Cartier'], ['pasha', 'Cartier'],
    ['timewalker', 'Montblanc'], ['1858', 'Montblanc'], ['star legacy', 'Montblanc'], ['summit', 'Montblanc'], ['boheme', 'Montblanc'],
    ['alhambra', 'Van Cleef & Arpels'],
    ['atlas', 'Tiffany & Co'],
  ];
  for (const [kw, brand] of brandMap) {
    if (text.includes(kw)) return brand;
  }
  return 'Zermatt Diamonds';
}

function inferGender(filePath, name) {
  const lp = filePath.toLowerCase();
  const ln = name.toLowerCase();
  if (lp.includes('\\men\\') || lp.includes('/men/')) return 'men';
  if (lp.includes('\\women\\') || lp.includes('/women/')) return 'women';
  if (ln.includes("men's") || ln.includes('mens')) return 'men';
  if (ln.includes('ladies') || ln.includes("women's") || ln.includes('womens')) return 'women';
  return 'unisex';
}

// ----------  extract structured watch details from description  ----------

function parseWatchDetails(desc) {
  if (!desc || desc.length < 15) return {};
  // Skip generic marketing text (Chrono24 listing pages)
  if (/watches in stock now|new offers daily|save favorite|buy your dream|on chrono24/i.test(desc)) return {};
  const result = {};

  // Structured fields: "Key: Value" extraction
  const fields = {
    ref:        /Model\s*Number:\s*([A-Z0-9\-./]+)/i,
    material:   /Case\s*Material:\s*(.+?)(?=\s+Dial\s|$)/i,
    dialColor:  /Dial\s*Color:\s*(.+?)(?=\s+Bracelet|$)/i,
    bracelet:   /Bracelet\/Strap:\s*(.+?)(?=\s+Clasp|$)/i,
    clasp:      /Clasp\s*Type:\s*(.+?)(?=\s+Movement|$)/i,
    movement:   /Movement:\s*(.+?)(?=\s+Screw|$)/i,
    bezel:      /Bezel:\s*(.+?)(?=\s+Crystal|$)/i,
    crystal:    /Crystal:\s*(.+?)(?=\s+Case\s*Back|$)/i,
    caseSize:   /Case\s*Diameter:\s*(\d+\s*mm)/i,
  };
  for (const [key, re] of Object.entries(fields)) {
    const m = desc.match(re);
    if (m) result[key] = m[1].trim();
  }

  // Build a details string from bracelet/dial/size
  if (result.bracelet || result.dialColor) {
    const parts = [];
    if (result.dialColor) parts.push(result.dialColor + ' Dial');
    if (result.bracelet) parts.push(result.bracelet);
    if (result.caseSize) parts.push(result.caseSize);
    result.details = parts.join(' · ');
  }

  if (Object.keys(result).length > 0) return result;

  // Freeform format: "Stainless steel rectangular watch with a white antique dial..."
  const materials = ['stainless steel', 'yellow gold', 'white gold', 'rose gold', 'titanium', 'ceramic', 'platinum', 'gold plated', 'rose gold plated', 'pvd'];
  const lc = desc.toLowerCase();
  for (const m of materials) {
    if (lc.includes(m)) { result.material = m.replace(/\b\w/g, c => c.toUpperCase()); break; }
  }
  const dialRe = /(?:with\s+(?:an?\s+)?)?(\w+(?:\s+\w+)?)\s+dial/i;
  const dm = desc.match(dialRe);
  if (dm) {
    const raw = dm[1].replace(/\b\w/g, c => c.toUpperCase());
    if (!['A', 'An', 'The'].includes(raw)) result.details = raw + ' Dial';
  }
  const sizeMatch = desc.match(/(\d{2,3})\s*mm/i);
  if (sizeMatch) {
    result.caseSize = sizeMatch[1] + 'mm';
    result.details = (result.details ? result.details + ' · ' : '') + result.caseSize;
  }
  return result;
}

// ----------  build image index (fast)  ----------

console.log('Building image index...');
const imageIndex = new Map();
// Maps parent-folder absolute path -> array of { filename, relPath }
const folderIndex = new Map();

function indexImages(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        indexImages(full);
      } else {
        const ext = e.name.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
          const rel = relative(join(ROOT, 'src', 'data'), full).split('\\').join('/');
          if (!imageIndex.has(e.name)) {
            imageIndex.set(e.name, rel);
          }
          // Track images grouped by their parent folder
          if (!folderIndex.has(dir)) folderIndex.set(dir, []);
          folderIndex.get(dir).push({ filename: e.name, relPath: rel });
        }
      }
    }
  } catch {}
}

indexImages(SHOP);
console.log(`  Indexed ${imageIndex.size} images in ${folderIndex.size} folders`);

// ----------  category config  ----------

const CATEGORY_FOLDERS = {
  watches: { id: 'watches', type: 'watch', name: 'Watches' },
  bracelets: { id: 'bracelets', type: 'bracelet', name: 'Bracelets' },
  earings: { id: 'earrings', type: 'earring', name: 'Earrings' },
  necklaces: { id: 'necklaces', type: 'necklace', name: 'Necklaces' },
  pendants: { id: 'pendants', type: 'pendant', name: 'Pendants' },
  rings: { id: 'rings', type: 'ring', name: 'Rings' },
  'wedding bands': { id: 'wedding-bands', type: 'ring', name: 'Wedding Bands' },
};

// ----------  folder-first product discovery  ----------

function findJsonFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findJsonFiles(full));
    else if (entry.name.endsWith('.json')) results.push(full);
  }
  return results;
}

function nameFromAsset(assetFilename, fallbackBrand) {
  if (!assetFilename) return fallbackBrand;
  let name = assetFilename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_][a-z0-9]{10,}$/i, '')
    .replace(/-?(Square|Width|ExtraLarge)\d*/gi, '')
    .replace(/-?\d{6,}$/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < 3) return fallbackBrand;
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

function nameFromFolder(folderName, fallbackBrand) {
  if (!folderName || /^New folder/i.test(folderName)) return fallbackBrand;
  if (/^\d+$/.test(folderName)) return fallbackBrand;
  // Convert slug to title case
  let name = folderName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < 3) return fallbackBrand;
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

const IMG_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);

// Find all leaf image folders (folders that directly contain image files)
// If a folder has both images AND subfolders, skip loose images (they're listing-page junk)
// If a leaf folder has >20 images, skip it (dump folder, not a real product)
function findLeafImageFolders(dir) {
  const result = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const images = entries.filter(e => !e.isDirectory() && IMG_EXTS.has(e.name.toLowerCase().split('.').pop()));
    const subdirs = entries.filter(e => e.isDirectory());
    if (images.length > 0 && subdirs.length === 0) {
      // Pure leaf folder – only include if not a dump (<= 20 images)
      if (images.length <= 20) {
        result.push({
          absFolder: dir,
          images: images.map(e => ({
            filename: e.name,
            relPath: relative(join(ROOT, 'src', 'data'), join(dir, e.name)).split('\\').join('/')
          }))
        });
      }
    }
    // Recurse into subdirectories (skip loose images if subdirs exist)
    for (const sub of subdirs) {
      result.push(...findLeafImageFolders(join(dir, sub.name)));
    }
  } catch {}
  return result;
}

// Group leaf folders into product groups.
// If all siblings in a parent have ≤2 images each, merge them at parent level
// (handles bulgari-2 style: ProductName/numericId/single-image)
function groupIntoProducts(leafFolders) {
  const byParent = new Map();
  for (const lf of leafFolders) {
    const parent = dirname(lf.absFolder);
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(lf);
  }
  const result = [];
  for (const [parent, children] of byParent) {
    const allSmall = children.every(c => c.images.length <= 2);
    if (allSmall && children.length > 1) {
      // Merge: all images from sibling folders become one product
      const allImages = children.flatMap(c => c.images);
      result.push({ absFolder: parent, images: allImages });
    } else {
      for (const child of children) {
        result.push(child);
      }
    }
  }
  return result;
}

// ----------  build JSON metadata index  ----------

// For each category, build a map: asset_filename -> { row, jsonFile }
function buildAssetMetadata(catDir) {
  const meta = new Map();
  const jsonFiles = findJsonFiles(catDir);
  for (const jsonFile of jsonFiles) {
    let rows;
    try { rows = JSON.parse(readFileSync(jsonFile, 'utf-8')); } catch { continue; }
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (row.asset_filename && !meta.has(row.asset_filename)) {
        meta.set(row.asset_filename, { row, jsonFile });
      }
    }
  }
  return meta;
}

// ----------  process categories  ----------

const allProducts = [];
const seenFolders = new Set();
const brandSet = new Map();
let nextId = 1;

for (const [folderName, catInfo] of Object.entries(CATEGORY_FOLDERS)) {
  const catDir = join(SHOP, folderName);
  if (!existsSync(catDir)) continue;

  // Phase 1: Index all JSON metadata for this category
  const assetMeta = buildAssetMetadata(catDir);

  // Phase 2: Find all product folders from disk structure
  const leafFolders = findLeafImageFolders(catDir);
  const productGroups = groupIntoProducts(leafFolders);

  // Phase 3: Create one product per folder group
  for (const { absFolder, images } of productGroups) {
    if (images.length === 0) continue;

    const folderKey = absFolder.split('\\').join('/');
    if (seenFolders.has(folderKey)) continue;
    seenFolders.add(folderKey);

    // Find best JSON metadata match from any image in this group
    let bestRow = null, bestJsonFile = '';
    for (const img of images) {
      const meta = assetMeta.get(img.filename);
      if (meta) { bestRow = meta.row; bestJsonFile = meta.jsonFile; break; }
    }

    // Derive product info
    const folderBasename = basename(absFolder);
    const parentBasename = basename(dirname(absFolder));
    const jsonBasename = bestJsonFile ? bestJsonFile.split(/[/\\]/).pop().replace('.json', '') : '';
    const pathContext = absFolder + ' ' + jsonBasename;

    // Brand
    let brand;
    if (bestRow) {
      const rawName = (bestRow.product_name || '').trim();
      brand = inferBrand(
        rawName + ' ' + (bestRow.asset_filename || '') + ' ' + jsonBasename,
        bestRow.product_description || '',
        bestJsonFile || absFolder
      );
    } else {
      brand = inferBrand(folderBasename + ' ' + parentBasename, '', absFolder);
    }

    // Name: prefer JSON product_name, then folder name, then asset filename
    let name;
    if (bestRow) {
      const rawName = (bestRow.product_name || '').trim();
      if (rawName && !rawName.includes('Chrono24') && !rawName.includes('chrono24') && rawName.length > 3) {
        name = cleanProductName(rawName);
      } else {
        // Try folder name, then asset filename
        name = nameFromFolder(folderBasename, null) || nameFromFolder(parentBasename, null) || nameFromAsset(images[0].filename, brand);
      }
    } else {
      name = nameFromFolder(folderBasename, null) || nameFromFolder(parentBasename, null) || nameFromAsset(images[0].filename, brand);
    }
    if (!name) name = brand;

    // Skip straps and swatches
    if (name.toLowerCase().includes('strap') || name.toLowerCase().includes('swatch')) continue;

    // Price – detect currency and convert to ZAR
    const USD_TO_ZAR = 18.5;
    const CHF_TO_ZAR = 21;
    const EUR_TO_ZAR = 20;
    let price = 0;
    if (bestRow && bestRow.price) {
      const priceStr = bestRow.price.toString().trim();
      const numericVal = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
      if (priceStr.startsWith('$') || priceStr.includes('USD')) {
        price = Math.round(numericVal * USD_TO_ZAR);
      } else if (priceStr.includes('CHF')) {
        price = Math.round(numericVal * CHF_TO_ZAR);
      } else if (priceStr.includes('EUR') || priceStr.startsWith('€')) {
        price = Math.round(numericVal * EUR_TO_ZAR);
      } else {
        // ZAR or plain number – use as-is
        price = numericVal >= 100 ? Math.round(numericVal) : 0;
      }
    }
    if (price < 100) continue;

    // Condition
    const condition = bestRow && (bestRow.product_description || '').toLowerCase().includes('pre-owned') ? 'Pre-owned' : 'New';

    // Gender
    const gender = catInfo.id === 'watches' ? inferGender(absFolder, name) : null;

    // Parse watch-specific details from description
    const desc = bestRow ? (bestRow.product_description || '') : '';
    const watchDetails = catInfo.type === 'watch' ? parseWatchDetails(desc) : {};

    // Image paths
    const allImportPaths = images.map(img => img.relPath);

    if (!brandSet.has(brand)) {
      brandSet.set(brand, { name: brand, slug: slugify(brand) });
    }

    allProducts.push({
      id: nextId++,
      type: catInfo.type,
      brand,
      name,
      price,
      currency: 'ZAR',
      condition,
      importPath: allImportPaths[0],
      allImportPaths,
      category: catInfo.id,
      gender,
      featured: price > 50000,
      slug: slugify(folderBasename) || slugify(name),
      ...watchDetails,
    });
  }
}

// ----------  generate output  ----------

console.log(`Generating products.js with ${allProducts.length} products...`);

const imports = [];
const importVarMap = new Map();      // id -> cover var name
const galleryVarMap = new Map();     // id -> [var1, var2, ...]
let imgIdx = 0;
for (const p of allProducts) {
  const paths = p.allImportPaths || (p.importPath ? [p.importPath] : []);
  const vars = [];
  for (const ip of paths) {
    const varName = `img${imgIdx++}`;
    imports.push(`import ${varName} from '${ip}';`);
    vars.push(varName);
  }
  if (vars.length > 0) {
    importVarMap.set(p.id, vars[0]);
    galleryVarMap.set(p.id, vars);
  }
}

const brandsArr = [...brandSet.values()]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((b, i) => ({ id: i + 1, ...b }));

const categoriesArr = [
  { id: 'watches', name: 'Watches', description: 'Luxury timepieces from top brands' },
  { id: 'rings', name: 'Rings', description: 'Engagement, wedding & statement rings' },
  { id: 'wedding-bands', name: 'Wedding Bands', description: 'Diamond & gold wedding bands' },
  { id: 'necklaces', name: 'Necklaces', description: 'Pendants & designer necklaces' },
  { id: 'pendants', name: 'Pendants', description: 'Diamond pendants & halo settings' },
  { id: 'earrings', name: 'Earrings', description: 'Studs, hoops & drop earrings' },
  { id: 'bracelets', name: 'Bracelets', description: 'Diamond & gold bracelets' },
];

function productToJS(p) {
  const imgVar = importVarMap.get(p.id) || 'null';
  const galleryVars = galleryVarMap.get(p.id) || [];
  const imagesStr = galleryVars.length > 0 ? `[${galleryVars.join(', ')}]` : `${imgVar} ? [${imgVar}] : []`;
  const esc = s => (s || '').replace(/'/g, "\\'");
  const genderLine = p.gender ? `\n    gender: '${p.gender}',` : '';
  const refLine = p.ref ? `\n    ref: '${esc(p.ref)}',` : '';
  const materialLine = p.material ? `\n    material: '${esc(p.material)}',` : '';
  const detailsLine = p.details ? `\n    details: '${esc(p.details)}',` : '';
  const dialLine = p.dialColor ? `\n    dialColor: '${esc(p.dialColor)}',` : '';
  const movementLine = p.movement ? `\n    movement: '${esc(p.movement)}',` : '';
  const caseSizeLine = p.caseSize ? `\n    caseSize: '${esc(p.caseSize)}',` : '';
  const crystalLine = p.crystal ? `\n    crystal: '${esc(p.crystal)}',` : '';
  const bezelLine = p.bezel ? `\n    bezel: '${esc(p.bezel)}',` : '';
  const braceletLine = p.bracelet ? `\n    bracelet: '${esc(p.bracelet)}',` : '';
  return `  {
    id: ${p.id},
    type: '${p.type}',
    brand: '${p.brand.replace(/'/g, "\\'")}',
    name: '${p.name.replace(/'/g, "\\'")}',
    price: ${p.price},
    currency: 'ZAR',
    condition: '${p.condition}',
    image: ${imgVar},
    images: ${imagesStr},
    category: '${p.category}',${genderLine}${refLine}${materialLine}${detailsLine}${dialLine}${movementLine}${caseSizeLine}${crystalLine}${bezelLine}${braceletLine}
    featured: ${p.featured},
  }`;
}

const output = `// Auto-generated from shop asset JSONs \u2014 do not edit manually
// Run: node scripts/build-products.js
${imports.join('\n')}

export const brands = ${JSON.stringify(brandsArr, null, 2)};

export const categories = ${JSON.stringify(categoriesArr, null, 2)};

export const products = [
${allProducts.map(productToJS).join(',\n')}
];

export const tradeInPolicy = {
  cashOut: {
    label: 'Sell for Cash',
    percent: 75,
    description: 'Get up to 75% of item value in cash within 30 days',
    bonus: '+5% every 15 days after initial offer period',
  },
  exchange: {
    label: 'Exchange',
    percent: 80,
    description: 'Exchange your item for another worth 80% of its value',
  },
};

export const formatPrice = (price, currency = 'ZAR') => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
`;

writeFileSync(DATA_OUT, output, 'utf-8');

const catCounts = {};
for (const p of allProducts) catCounts[p.category] = (catCounts[p.category] || 0) + 1;
console.log(`\n\u2713 Generated ${allProducts.length} products`);
console.log(`  Brands (${brandsArr.length}): ${brandsArr.map(b => b.name).join(', ')}`);
for (const c of categoriesArr) console.log(`  ${c.name}: ${catCounts[c.id] || 0} products`);
console.log(`  Images resolved: ${importVarMap.size}/${allProducts.length}`);
console.log(`  Output: ${DATA_OUT}`);
