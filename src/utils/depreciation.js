/**
 * Calculates straight-line depreciation for an asset.
 * 
 * @param {string} acquisitionDateStr - Date in YYYY-MM-DD format
 * @param {number} costPrice - Original price of the asset
 * @param {number} depreciationRatePercent - Annual depreciation rate (e.g. 20%)
 * @param {string} [asOfDateStr] - Target date for calculation (default is today)
 * @returns {Object} { accumulatedDepreciation, bookValue }
 */
export function calculateDepreciation(acquisitionDateStr, costPrice, depreciationRatePercent, asOfDateStr) {
  const cost = parseFloat(costPrice) || 0;
  const rate = parseFloat(depreciationRatePercent) || 0;
  
  if (cost <= 0) {
    return { accumulatedDepreciation: 0, bookValue: 0 };
  }

  const acquisitionDate = new Date(acquisitionDateStr);
  const targetDate = asOfDateStr ? new Date(asOfDateStr) : new Date();

  // If acquisition date is invalid or in the future
  if (isNaN(acquisitionDate.getTime()) || acquisitionDate > targetDate) {
    return { accumulatedDepreciation: 0, bookValue: cost };
  }

  // Calculate time difference in days
  const diffTime = Math.abs(targetDate - acquisitionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Straight-line formula (using 365 days a year)
  const annualDepreciation = cost * (rate / 100);
  const dailyDepreciation = annualDepreciation / 365;
  
  let accumulatedDepreciation = dailyDepreciation * diffDays;
  
  // Standard accounting rule in Thailand: Salvage value is usually 1 Baht minimum, 
  // so accumulated depreciation cannot reduce book value below 1 Baht unless disposed.
  const maxDepreciation = cost - 1; 
  if (accumulatedDepreciation > maxDepreciation) {
    accumulatedDepreciation = maxDepreciation;
  }

  // Round to 2 decimal places
  accumulatedDepreciation = Math.round(accumulatedDepreciation * 100) / 100;
  const bookValue = Math.max(1, Math.round((cost - accumulatedDepreciation) * 100) / 100);

  return {
    accumulatedDepreciation,
    bookValue
  };
}
