import React, { createContext, useState, useContext } from 'react';
import { adminService } from '../api/service/adminService';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // CACHE: Stores orders by their MongoDB _id to prevent duplicate data
  // Example: { "60d5ecb...": { order details }, "60d5ecc...": { order details } }
  const [orderCache, setOrderCache] = useState({});

  // Smart Fetch: Calls the API, and silently adds the results to our cache
  const fetchAdminOrders = async (params) => {
    try {
      const data = await adminService.getOrdersPaginated(params);
      
      // Add the newly fetched orders into our global cache
      setOrderCache(prevCache => {
        const newCache = { ...prevCache };
        data.orders.forEach(order => {
          newCache[order._id] = order;
        });
        return newCache;
      });

      return data; // Return the pagination details to the component
    } catch (error) {
      console.error("Failed to fetch paginated orders:", error);
      throw error;
    }
  };

  // Instant UI Update: Updates the cache directly
  const updateLocalOrder = (orderId, updatedFields) => {
    setOrderCache(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], ...updatedFields }
    }));
  };

  return (
    <AdminContext.Provider value={{ orderCache, fetchAdminOrders, updateLocalOrder }}>
      {children}
    </AdminContext.Provider>
  );
};