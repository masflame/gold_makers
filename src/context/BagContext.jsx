import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BagContext = createContext();

const STORAGE_KEY = 'goldmakers_bag';

function loadBag() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBag(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* quota exceeded – silently fail */ }
}

export function BagProvider({ children }) {
  const [items, setItems] = useState(loadBag);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    saveBag(items);
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty };
        return updated;
      }
      return [...prev, { id: product.id, qty }];
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty < 1) return removeItem(productId);
    setItems(prev => prev.map(i => i.id === productId ? { ...i, qty } : i));
  }, [removeItem]);

  const clearBag = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <BagContext.Provider value={{
      items, totalItems, drawerOpen,
      setDrawerOpen, addItem, removeItem, updateQty, clearBag,
    }}>
      {children}
    </BagContext.Provider>
  );
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag must be used within BagProvider');
  return ctx;
}
