import apiClient from "../api/client";

const REF_KEY = 'chintamukti_ref';
const EXPIRY_KEY = 'chintamukti_ref_expiry';
const REF_NAME_KEY = 'chintamukti_ref_name'; // We save the friend's name here so we don't have to ask the database again on refresh

export const captureAndVerifyReferral = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('ref');

  if (code) {
    try {
      // 1. Verify against the backend
      const response = await apiClient.get(`/public/referrals/verify/${code}`);
      
      if (response.data.valid) {
        // Calculate the exact time 2 days (48 hours) from right now
        const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000;
        const expiry = new Date().getTime() + twoDaysInMilliseconds;

        localStorage.setItem(REF_KEY, code.toUpperCase());
        localStorage.setItem(EXPIRY_KEY, expiry.toString());
        localStorage.setItem(REF_NAME_KEY, response.data.referrerName);

        // 3. Clean up the URL so the user doesn't copy/paste it accidentally to others
        window.history.replaceState({}, document.title, window.location.pathname);

        return response.data.referrerName; // Return the name to show a welcome message
      }
    } catch (error) {
      console.warn("Invalid referral code.");
      // Optionally clean the URL even if it's invalid
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // SCENARIO 2: The user refreshed the page (or came back the next day)
  const savedCode = localStorage.getItem(REF_KEY);
  const savedExpiry = localStorage.getItem(EXPIRY_KEY);
  const savedName = localStorage.getItem(REF_NAME_KEY);

  // If we remember them...
  if (savedCode && savedExpiry && savedName) {
    // Check the clock. Have 2 days passed?
    if (new Date().getTime() > parseInt(savedExpiry, 10)) {
      // The 2 days are up! Throw the memory away.
      localStorage.removeItem(REF_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      localStorage.removeItem(REF_NAME_KEY);
      return null;
    }
    
    // The 2 days are NOT up yet! Return the friend's name to turn the VIP button back on.
    return savedName;
  }

  return null;
};

export const saveReferralCode = (code) => {
  if (!code) return;
  const data = { code, timestamp: Date.now() };
  localStorage.setItem(REF_KEY, JSON.stringify(data));
};

export const getValidReferralCode = () => {
  const code = localStorage.getItem(REF_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (!code || !expiry) return null;
  
  // Check if expired
  if (new Date().getTime() > parseInt(expiry, 10)) {
    localStorage.removeItem(REF_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(REF_NAME_KEY);
    return null;
  }
  
  return code;
};