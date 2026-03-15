import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    const maxQty = product.stock ?? quantity;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product._id === product._id);
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, maxQty);
        return prevItems.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [...prevItems, { product, quantity: Math.min(quantity, maxQty) }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product._id === productId
            ? { ...item, quantity: Math.min(quantity, item.product.stock ?? quantity) }
            : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Memoize derived values to avoid recalculation on every render
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);
  const getCartCount = useCallback(() => cartCount, [cartCount]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    cartTotal,
    cartCount,
    isEmpty: cartItems.length === 0
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, cartTotal, cartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
