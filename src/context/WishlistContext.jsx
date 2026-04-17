import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const WishlistContext = createContext();

const STORAGE_KEY = 'goldmakers_wishlist';

function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* quota exceeded */ }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(loadWishlist);

  useEffect(() => {
    saveWishlist(ids);
  }, [ids]);

  const idSet = useMemo(() => new Set(ids), [ids]);

  const toggle = useCallback((productId) => {
    setIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const remove = useCallback((productId) => {
    setIds(prev => prev.filter(id => id !== productId));
  }, []);

  const has = useCallback((productId) => idSet.has(productId), [idSet]);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(() => ({
    ids, toggle, remove, has, clear, count: ids.length
  }), [ids, toggle, remove, has, clear]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
