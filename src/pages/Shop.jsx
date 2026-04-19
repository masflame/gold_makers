import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { products, brands, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import CustomSelect from '../components/CustomSelect';

const ITEMS_PER_PAGE = 40;

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Brand: A → Z', value: 'brand-asc' },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section-toggle" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <div className={`filter-section-body${open ? ' filter-section-body--open' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sidebarRef = useRef(null);
  const knobRef = useRef(null);

  /* ── Custom scroll knob for sidebar ── */
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const knob = knobRef.current;
    const KNOB_H = 32;
    let dragging = false;
    let startY = 0;
    let startScroll = 0;

    function update() {
      if (!knob) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) { knob.style.opacity = '0'; return; }
      const trackH = clientHeight - 8;
      const top = 4 + (scrollTop / maxScroll) * (trackH - KNOB_H);
      knob.style.opacity = '1';
      knob.style.transform = `translateY(${top}px)`;
    }

    function onScroll() { update(); }

    function onPointerDown(e) {
      e.preventDefault();
      dragging = true;
      startY = e.clientY;
      startScroll = el.scrollTop;
      knob.classList.add('active');
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const { scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const trackH = clientHeight - 8;
      const dy = e.clientY - startY;
      const scrollDelta = (dy / (trackH - KNOB_H)) * maxScroll;
      el.scrollTop = startScroll + scrollDelta;
    }

    function onPointerUp() {
      dragging = false;
      knob.classList.remove('active');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    if (knob) knob.addEventListener('pointerdown', onPointerDown);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (knob) knob.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      ro.disconnect();
    };
  }, []);

  const activeBrands = searchParams.getAll('brand');
  const activeCategories = searchParams.getAll('category');
  const activeGender = searchParams.get('gender') || '';
  const brandsKey = activeBrands.join(',');
  const categoriesKey = activeCategories.join(',');

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeBrands.length > 0) {
      const brandSet = new Set(activeBrands);
      result = result.filter(
        (p) => brandSet.has(p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
      );
    }
    if (activeCategories.length > 0) {
      const catSet = new Set(activeCategories);
      result = result.filter((p) => catSet.has(p.category));
    }
    if (activeGender) {
      result = result.filter((p) =>
        p.gender === activeGender || p.gender === 'unisex'
      );
    }
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'brand-asc': result.sort((a, b) => a.brand.localeCompare(b.brand)); break;
      default: {
        const onlyWatches = activeCategories.length === 1 && activeCategories.includes('watches');
        const noSpecificBrand = activeBrands.length === 0;
        if (!onlyWatches && noSpecificBrand) {
          result.sort((a, b) => {
            if (a.category === 'watches' && b.category === 'watches') return b.id - a.id;
            if (a.category !== 'watches' && b.category !== 'watches') {
              const ac = a.brand === 'Cartier' ? 0 : 1;
              const bc = b.brand === 'Cartier' ? 0 : 1;
              return ac - bc || b.id - a.id;
            }
            return b.id - a.id;
          });
        } else {
          result.sort((a, b) => b.id - a.id);
        }
        break;
      }
    }
    return result;
  }, [brandsKey, categoriesKey, activeGender, sort]);

  // Reset visible count and scroll to top when filters/sort change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [brandsKey, categoriesKey, activeGender, sort]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const clearFilters = () => setSearchParams({});
  const hasActiveFilter = activeBrands.length > 0 || activeCategories.length > 0 || !!activeGender;

  // Memoize filter counts
  const categoryFiltered = useMemo(() =>
    activeCategories.length > 0
      ? products.filter(p => activeCategories.includes(p.category))
      : products,
    [categoriesKey]
  );
  const brandFiltered = useMemo(() =>
    activeBrands.length > 0
      ? products.filter(p => activeBrands.includes(p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')))
      : products,
    [brandsKey]
  );

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  return (
    <main className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <h1 className="shop-title">
          {activeBrands.length === 1
            ? brands.find((b) => b.slug === activeBrands[0])?.name || 'Jewelry'
            : activeCategories.length === 1 && activeBrands.length === 0
              ? categories.find((c) => c.id === activeCategories[0])?.name || 'Jewelry'
              : activeGender === 'men' ? "Men's Collection"
              : activeGender === 'women' ? "Women's Collection"
              : 'All Jewelry'}
        </h1>
        <p className="shop-count">{filtered.length} items</p>
      </div>

      {/* Toolbar: filter label + chips + sort */}
      <div className="shop-toolbar">
        <button className="shop-filter-label" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {hasActiveFilter && <span className="filter-badge">{activeBrands.length + activeCategories.length}</span>}
        </button>
        {hasActiveFilter && (
          <div className="shop-active-filters">
            {activeBrands.map(slug => (
              <button key={slug} className="active-filter-chip" onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams();
                  prev.getAll('brand').filter(v => v !== slug).forEach(v => next.append('brand', v));
                  prev.getAll('category').forEach(v => next.append('category', v));
                  if (prev.get('gender')) next.set('gender', prev.get('gender'));
                  return next;
                });
              }}>
                {brands.find(b => b.slug === slug)?.name || slug}
                <X size={12} />
              </button>
            ))}
            {activeCategories.map(id => (
              <button key={id} className="active-filter-chip" onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams();
                  prev.getAll('brand').forEach(v => next.append('brand', v));
                  prev.getAll('category').filter(v => v !== id).forEach(v => next.append('category', v));
                  if (prev.get('gender')) next.set('gender', prev.get('gender'));
                  return next;
                });
              }}>
                {categories.find(c => c.id === id)?.name || id}
                <X size={12} />
              </button>
            ))}
            {activeGender && (
              <button className="active-filter-chip" onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams();
                  prev.getAll('brand').forEach(v => next.append('brand', v));
                  prev.getAll('category').forEach(v => next.append('category', v));
                  return next;
                });
              }}>
                {activeGender === 'men' ? 'Men' : 'Women'}
                <X size={12} />
              </button>
            )}
            <button className="shop-clear-all" onClick={clearFilters}>Clear All</button>
          </div>
        )}

        <div className="shop-toolbar-right">
          <div className="sort-select">
            <label className="sort-label">Sort by</label>
            <CustomSelect
              value={sort}
              onChange={setSort}
              options={sortOptions}
            />
          </div>
        </div>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="shop-layout">
        {/* Mobile filter backdrop */}
        <div className={`filter-backdrop${filterOpen ? ' open' : ''}`} onClick={() => setFilterOpen(false)} />
        <aside className={`shop-sidebar${filterOpen ? ' open' : ''}`} ref={sidebarRef} data-lenis-prevent>
          <div className="sidebar-scroll-knob" ref={knobRef} />
          <div className="filter-drawer-header">
            <span className="filter-drawer-title">Filters</span>
            <button className="filter-drawer-close" onClick={() => setFilterOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <FilterSection title="Brand" defaultOpen={true}>
            {brands.map((b) => {
              const count = categoryFiltered.filter(p => p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === b.slug).length;
              const isActive = activeBrands.includes(b.slug);
              return (
                <button
                  key={b.id}
                  className={`filter-item${isActive ? ' filter-item--active' : ''}`}
                  onClick={() => {
                    setSearchParams(prev => {
                      const next = new URLSearchParams();
                      const currentBrands = prev.getAll('brand');
                      const newBrands = isActive
                        ? currentBrands.filter(v => v !== b.slug)
                        : [...currentBrands, b.slug];
                      newBrands.forEach(v => next.append('brand', v));
                      prev.getAll('category').forEach(v => next.append('category', v));
                      if (prev.get('gender')) next.set('gender', prev.get('gender'));
                      return next;
                    });
                  }}
                >
                  <span className="filter-check">{isActive ? '✓' : ''}</span>
                  <span className="filter-label">{b.name}</span>
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </FilterSection>

          <FilterSection title="Category" defaultOpen={true}>
            {categories.map((c) => {
              const count = brandFiltered.filter(p => p.category === c.id).length;
              const isActive = activeCategories.includes(c.id);
              return (
                <button
                  key={c.id}
                  className={`filter-item${isActive ? ' filter-item--active' : ''}`}
                  onClick={() => {
                    setSearchParams(prev => {
                      const next = new URLSearchParams();
                      prev.getAll('brand').forEach(v => next.append('brand', v));
                      const currentCats = prev.getAll('category');
                      const newCats = isActive
                        ? currentCats.filter(v => v !== c.id)
                        : [...currentCats, c.id];
                      newCats.forEach(v => next.append('category', v));
                      if (prev.get('gender')) next.set('gender', prev.get('gender'));
                      return next;
                    });
                  }}
                >
                  <span className="filter-check">{isActive ? '✓' : ''}</span>
                  <span className="filter-label">{c.name}</span>
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </FilterSection>

          <FilterSection title="Gender" defaultOpen={!!activeGender}>
            {['men', 'women'].map((g) => {
              const label = g === 'men' ? 'Men' : 'Women';
              const count = products.filter(p => p.gender === g || p.gender === 'unisex').length;
              const isActive = activeGender === g;
              return (
                <button
                  key={g}
                  className={`filter-item${isActive ? ' filter-item--active' : ''}`}
                  onClick={() => {
                    setSearchParams(prev => {
                      const next = new URLSearchParams();
                      prev.getAll('brand').forEach(v => next.append('brand', v));
                      prev.getAll('category').forEach(v => next.append('category', v));
                      if (!isActive) next.set('gender', g);
                      return next;
                    });
                  }}
                >
                  <span className="filter-check">{isActive ? '✓' : ''}</span>
                  <span className="filter-label">{label}</span>
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </FilterSection>

          <FilterSection title="Price Range" defaultOpen={false}>
            {[
              { label: 'Under R 10,000', min: 0, max: 10000 },
              { label: 'R 10,000 – R 50,000', min: 10000, max: 50000 },
              { label: 'R 50,000 – R 100,000', min: 50000, max: 100000 },
              { label: 'R 100,000 – R 250,000', min: 100000, max: 250000 },
              { label: 'Over R 250,000', min: 250000, max: Infinity },
            ].map(range => {
              const count = products.filter(p => p.price >= range.min && p.price < range.max).length;
              return (
                <button key={range.label} className="filter-item" disabled={count === 0}>
                  <span className="filter-check" />
                  <span className="filter-label">{range.label}</span>
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </FilterSection>

          <FilterSection title="Condition" defaultOpen={false}>
            {['Unworn', 'Very good', 'Good'].map(cond => {
              const count = products.filter(p => p.condition === cond).length;
              return (
                <button key={cond} className="filter-item" disabled={count === 0}>
                  <span className="filter-check" />
                  <span className="filter-label">{cond}</span>
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </FilterSection>
          <div className="filter-drawer-apply">
            <button className="btn btn-primary filter-apply-btn" onClick={() => setFilterOpen(false)}>
              Show {filtered.length} Results
            </button>
          </div>
        </aside>

        {/* Product grid */}
        <div className="products-grid shop-grid">
          {filtered.length === 0 ? (
            <div className="no-results">
              <p>No items found matching your filters.</p>
              <button className="btn btn-outline" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
        {hasMore && (
          <div className="shop-load-more">
            <button className="btn btn-outline shop-load-more-btn" onClick={loadMore}>
              Load More ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
