/**
 * Calculates straight-line depreciation for an asset based on code-parsed acquisition year and price.
 * 
 * @param {string} assetCode - Code in XXX/YY/ZZZZ format
 * @param {number} unitPrice - Price per unit
 * @param {string} [asOfDateStr] - Target date for calculation (default is today)
 * @returns {Object} { accumulatedDepreciation, bookValue, depreciationRatePercent }
 */
export function calculateDepreciation(assetCode, unitPrice, asOfDateStr, categoryName, categoryDepreciationYears) {
  const price = parseFloat(unitPrice) || 0;
  if (price <= 0) {
    return { accumulatedDepreciation: 0, bookValue: 0, depreciationRatePercent: 0 };
  }

  const code = String(assetCode || '');
  const parts = code.split('/');
  
  let categoryCode = '311';
  let acquisitionYearBE = 67;
  
  if (parts.length >= 2) {
    categoryCode = parts[0].trim();
    acquisitionYearBE = parseInt(parts[1].trim()) || 67;
  } else {
    const match = code.match(/^(\d{3})(\d{2})/);
    if (match) {
      categoryCode = match[1];
      acquisitionYearBE = parseInt(match[2]) || 67;
    }
  }

  // Determine depreciation rate
  let rate = 10; // Default 10%
  if (categoryName && categoryDepreciationYears && categoryDepreciationYears[categoryName] !== undefined) {
    const years = parseInt(categoryDepreciationYears[categoryName]);
    if (years === 0) {
      rate = 0; // 0 years means no depreciation (like land)
    } else if (years > 0) {
      rate = 100 / years; // Straight-line rate
    }
  } else {
    // Determine depreciation rate by local gov standard prefix codes
    if (categoryCode === '101') {
      rate = 0;   // Land (ที่ดิน) has 0% depreciation
    } else if (categoryCode === '102' || categoryCode === '103') {
      rate = 5;   // Buildings / Structures 5%
    } else if (categoryCode === '412') {
      rate = 20;  // Computer hardware 20%
    } else if (categoryCode === '312') {
      rate = 20;  // Vehicles 20%
    } else if (categoryCode === '313') {
      rate = 20;  // Electrical/Radio 20%
    }
  }

  if (rate === 0) {
    return { accumulatedDepreciation: 0, bookValue: price, depreciationRatePercent: 0 };
  }

  // Calculate year in CE (BE - 543)
  const fullBE = 2500 + acquisitionYearBE;
  const ceYear = fullBE - 543;

  // Assume acquisition date is Jan 1st of the year
  const acquisitionDate = new Date(`${ceYear}-01-01`);
  const targetDate = asOfDateStr ? new Date(asOfDateStr) : new Date();

  if (isNaN(acquisitionDate.getTime()) || acquisitionDate > targetDate) {
    return { accumulatedDepreciation: 0, bookValue: price, depreciationRatePercent: rate };
  }

  const diffTime = Math.abs(targetDate - acquisitionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const annualDepreciation = price * (rate / 100);
  const dailyDepreciation = annualDepreciation / 365;
  
  let accumulatedDepreciation = dailyDepreciation * diffDays;
  
  const maxDepreciation = price - 1; 
  if (accumulatedDepreciation > maxDepreciation) {
    accumulatedDepreciation = maxDepreciation;
  }

  accumulatedDepreciation = Math.round(accumulatedDepreciation * 100) / 100;
  const bookValue = Math.max(1, Math.round((price - accumulatedDepreciation) * 100) / 100);

  return {
    accumulatedDepreciation,
    bookValue,
    depreciationRatePercent: rate
  };
}
