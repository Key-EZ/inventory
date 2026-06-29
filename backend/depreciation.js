/**
 * Calculates straight-line depreciation for an asset based on code-parsed acquisition year and price.
 * 
 * @param {string} assetCode - Code in XXX/YY/ZZZZ format
 * @param {number} unitPrice - Price per unit
 * @param {string} categoryName - Name of the category
 * @param {Object} categoryDepreciationYears - Dictionary of category depreciation years
 * @param {string} [asOfDateStr] - Target date for calculation (default is today)
 * @returns {Object} { accumulatedDepreciation, bookValue, depreciationRatePercent }
 */
export function calculateDepreciation(assetCode, unitPrice, categoryName, categoryDepreciationYears, asOfDateStr) {
  const price = parseFloat(unitPrice) || 0;
  if (price <= 0) {
    return { accumulatedDepreciation: 0, bookValue: 0, depreciationRatePercent: 0 };
  }

  // Handle flexible signature:
  // calculateDepreciation(assetCode, unitPrice, asOfDateStr)
  // calculateDepreciation(assetCode, unitPrice, categoryName, categoryDepreciationYears, asOfDateStr)
  let catName = categoryName;
  let depMapping = categoryDepreciationYears;
  let dateStr = asOfDateStr;

  if (typeof categoryName === 'string' && !categoryDepreciationYears) {
    // If 4th arg is missing, the 3rd arg might be asOfDateStr
    const isDate = categoryName.includes('-') || !isNaN(Date.parse(categoryName));
    if (isDate) {
      dateStr = categoryName;
      catName = undefined;
    }
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

  // Determine depreciation rate: prioritize custom mapping, fallback to legacy prefix codes
  let rate = 10; // Default 10%
  let customYearsFound = false;

  if (catName && depMapping && depMapping[catName] !== undefined) {
    const years = parseFloat(depMapping[catName]);
    customYearsFound = true;
    if (years <= 0) {
      rate = 0;
    } else {
      rate = 100 / years;
    }
  }

  if (!customYearsFound) {
    if (categoryCode === '101') {
      rate = 0;
    } else if (categoryCode === '102' || categoryCode === '103') {
      rate = 5;
    } else if (categoryCode === '412') {
      rate = 20;
    } else if (categoryCode === '312') {
      rate = 20;
    } else if (categoryCode === '313') {
      rate = 20;
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
  const targetDate = dateStr ? new Date(dateStr) : new Date();

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
