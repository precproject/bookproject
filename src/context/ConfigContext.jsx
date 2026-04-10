import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const ConfigContext = createContext();

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
        // Safe fallback so your app never crashes if the server has a hiccup
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

    // 2. Fetch again whenever they switch tabs and come back to your website!
    window.addEventListener('focus', fetchConfig);

    // Clean up
    return () => window.removeEventListener('focus', fetchConfig);
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isConfigLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};