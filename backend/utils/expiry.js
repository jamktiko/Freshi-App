/*
 * Calculates the expiry status based on a given expiration date.
 * @param {string} expirationDate - The expiration date (e.g., 'YYYY-MM-DD')
 * @returns {string} 'expired', 'expiring_soon', or 'fresh'

export function checkExpiry(expirationDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'expiring_soon';
  return 'fresh';
}
*/
