const REFERRAL_KEY = 'chintamukti_ref';
const EXPIRY_TIME = 2 * 24 * 60 * 60 * 1000; // 2 Days in milliseconds

export const saveReferralCode = (code) => {
  if (!code) return;
  const data = { code, timestamp: Date.now() };
  localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
};

export const getValidReferralCode = () => {
  const dataStr = localStorage.getItem(REFERRAL_KEY);
  if (!dataStr) return null;

  const data = JSON.parse(dataStr);
  
  // Check if expired
  if (Date.now() - data.timestamp > EXPIRY_TIME) {
    localStorage.removeItem(REFERRAL_KEY);
    return null;
  }
  
  return data.code;
};