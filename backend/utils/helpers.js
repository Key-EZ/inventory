import { calculateDepreciation } from '../depreciation.js';
import { executeQuery, getPool } from '../db.js';

export const addAuditLogServer = async (action, details, userName) => {
  try {
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    const user = userName || 'ระบบ';

    await executeQuery(
      'INSERT INTO audit_logs (id, timestamp, action, details, user) VALUES (?, ?, ?, ?, ?)',
      [id, timestamp, action, details, user]
    );

    // Cap audit logs at 500 rows to match previous behavior
    const countRows = await executeQuery('SELECT COUNT(*) as count FROM audit_logs');
    if (countRows[0] && countRows[0].count > 500) {
      // Find oldest logs to delete
      const offset = 500;
      const deleteCount = countRows[0].count - offset;
      
      // Get IDs of oldest records
      const oldestLogs = await executeQuery(
        'SELECT id FROM audit_logs ORDER BY timestamp ASC LIMIT ?',
        [deleteCount]
      );
      
      if (oldestLogs.length > 0) {
        const ids = oldestLogs.map(log => log.id);
        await executeQuery(
          `DELETE FROM audit_logs WHERE id IN (${ids.map(() => '?').join(',')})`,
          ids
        );
      }
    }
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
};

export const recalculateAllAssetsDepreciation = async (updatedMapping) => {
  const pool = getPool();
  if (!pool) return;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [assets] = await connection.query('SELECT id, asset_code, unit_price, category FROM assets');

    for (const asset of assets) {
      const dep = calculateDepreciation(
        asset.asset_code,
        Number(asset.unit_price) || 0,
        asset.category,
        updatedMapping
      );

      await connection.query(
        'UPDATE assets SET depreciation_rate_percent = ?, accumulated_depreciation = ?, book_value = ? WHERE id = ?',
        [dep.depreciationRatePercent, dep.accumulatedDepreciation, dep.bookValue, asset.id]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Failed to recalculate asset depreciations:', error);
    throw error;
  } finally {
    connection.release();
  }
};
