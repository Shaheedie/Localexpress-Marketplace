import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('localexpress_cart');
    return saved ? JSON.parse(saved) : [];
  });

  function save(next) {
    setItems(next);
    localStorage.setItem('localexpress_cart', JSON.stringify(next));
  }

  function addToCart(product, quantity = 1) {
    const existing = items.find((item) => item.id === product.id);
    let next;
    if (existing) {
      next = items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
    } else {
      next = [...items, { ...product, quantity }];
    }
    save(next);
  }

  function updateQuantity(productId, quantity) {
    const next = items.map((item) => item.id === productId ? { ...item, quantity: Math.max(1, Number(quantity)) } : item);
    save(next);
  }

  function removeFromCart(productId) {
    save(items.filter((item) => item.id !== productId));
  }

  function clearCart() {
    save([]);
  }

  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const count = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  const value = useMemo(() => ({ items, count, total, addToCart, updateQuantity, removeFromCart, clearCart }), [items, count, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
