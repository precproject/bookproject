import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/client';

// Also exporting the hook directly from here is a great pattern!
export const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({ isPrebookActive: true });
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await apiClient.get('/config/public');
        setConfig(data);
      } catch (error) {
        console.error("Failed to load store configuration:", error);
        // Safe fallback
        setConfig({
          uiConfig: { showRecentOrdersPopup: true },
          taxConfig: { isGstEnabled: false, gstPercentage: 0 },
          delivery: { shippingCharge: 50 },
          general: { storeName: 'SahakarStree' }
        });
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
    // CRITICAL FIX: Removed the window 'focus' event listener. 
    // Config only needs to load once per session!
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isConfigLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);