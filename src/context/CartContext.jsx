import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load initial cart from LocalStorage, or start empty
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('chintamukti_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to LocalStorage whenever the cart changes
  useEffect(() => {
    localStorage.setItem('chintamukti_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.bookId === book._id);
      if (existingItem) {
        // If it's already in the cart, just increase the quantity
        return prevItems.map((item) =>
          item.bookId === book._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // Otherwise, add the new book
      return [...prevItems, { 
        bookId: book._id, 
        name: book.title, 
        price: book.price, 
        qty: 1, 
        type: book.type 
      }];
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.bookId !== bookId));
  };

  const updateQuantity = (bookId, qty) => {
    if (qty < 1) {
      removeFromCart(bookId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.bookId === bookId ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('chintamukti_cart');
  };

  // Helper values
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  const requiresShipping = cartItems.some(item => item.type === 'Physical');

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartCount, cartSubtotal, requiresShipping 
    }}>
      {children}
    </CartContext.Provider>
  );
};