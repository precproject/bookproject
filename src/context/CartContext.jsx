import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import apiClient from '../api/client';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const isInitialMount = useRef(true);

  // 1. Load initial cart from LocalStorage, or start empty
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('chintamukti_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error parsing local cart:", error);
      return [];
    }
  });

  // 2. FETCH CLOUD CART ON LOGIN
  useEffect(() => {
    const fetchCloudCart = async () => {
      if (user) {
        try {
          const { data } = await apiClient.get('/user/cart');
          const cloudCart = data.cart || [];
          
          if (cartItems.length > 0 && cloudCart.length === 0) {
            // User had items in local guest cart, logged in, and cloud was empty.
            // Push local cart to cloud.
            await apiClient.put('/user/cart', { cart: cartItems });
          } else if (cloudCart.length > 0) {
            // User has a saved cart in the cloud, pull it down to the device.
            setCartItems(cloudCart);
            localStorage.setItem('chintamukti_cart', JSON.stringify(cloudCart));
          }
        } catch (error) {
          console.error("Failed to sync cart from cloud:", error);
        }
      }
    };
    
    fetchCloudCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 3. SAVE CART CHANGES (To LocalStorage & Cloud)
  useEffect(() => {
    // Always keep LocalStorage updated for offline/guest mode
    localStorage.setItem('chintamukti_cart', JSON.stringify(cartItems));

    // Prevent overriding cloud cart on the very first render cycle
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // If user is logged in, sync to cloud database
    if (user) {
      // Use a "Debounce" (500ms delay). If the user clicks "+" 5 times rapidly, 
      // it only sends 1 request to the backend instead of 5.
      const syncTimer = setTimeout(async () => {
        try {
          await apiClient.put('/user/cart', { cart: cartItems });
        } catch (error) {
          console.error("Failed to update cloud cart:", error);
        }
      }, 500);
      
      return () => clearTimeout(syncTimer); // Cleanup timer if cart changes again quickly
    }
  }, [cartItems, user]);

  // --- CART ACTIONS (Pure state updates, Effects handle the saving) ---

  const addToCart = (book) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.bookId === book._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.bookId === book._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
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

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('chintamukti_cart');
    if (user) {
      try {
        await apiClient.put('/user/cart', { cart: [] });
      } catch (error) {
        console.error("Failed to clear cloud cart");
      }
    }
  };

  // --- HELPER VALUES ---
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