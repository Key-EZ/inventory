import { calculateDepreciation } from '../depreciation.js';

export const addAuditLogServer = (dbData, action, details, userName) => {
  const newLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    user: userName || 'ระบบ'
  };
  dbData.auditLogs.unshift(newLog);
  // Cap logs at 500
  if (dbData.auditLogs.length > 500) {
    dbData.auditLogs = dbData.auditLogs.slice(0, 500);
  }
};

export const recalculateAllAssetsDepreciation = (dbData, updatedMapping) => {
  dbData.assets = dbData.assets.map(asset => {
    const dep = calculateDepreciation(
      asset.asset_code,
      asset.unit_price,
      asset.category,
      updatedMapping
    );
    return {
      ...asset,
      depreciation_rate_percent: dep.depreciationRatePercent,
      accumulated_depreciation: dep.accumulatedDepreciation,
      book_value: dep.bookValue
    };
  });
};
