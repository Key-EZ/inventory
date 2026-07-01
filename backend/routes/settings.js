import express from 'express';
import { executeQuery, getPool, seedRelationalDb, getDefaultData } from '../db.js';
import { addAuditLogServer, recalculateAllAssetsDepreciation } from '../utils/helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT `key`, `value` FROM system_settings');
    const settings = {};
    rows.forEach(r => {
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch {
        settings[r.key] = r.value;
      }
    });

    const custodians = await executeQuery('SELECT * FROM custodians');
    res.json({
      divisions: settings.divisions || [],
      departments: settings.departments || [],
      custodians: custodians,
      positions: settings.positions || [],
      brands: settings.brands || [],
      locations: settings.locations || [],
      landBuildingCategories: settings.landBuildingCategories || [],
      equipmentCategories: settings.equipmentCategories || [],
      categoryDepreciationYears: settings.categoryDepreciationYears || {},
      agencies: settings.agencies || [],
      sellers: settings.sellers || [],
      landingBadgeText: settings.landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน'
    });
  } catch (error) {
    console.error('Failed to get settings:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการโหลดตั้งค่าระบบ' });
  }
});

router.put('/', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const keys = [
      'divisions', 'departments', 'positions', 'brands',
      'locations', 'landBuildingCategories', 'equipmentCategories',
      'categoryDepreciationYears', 'agencies', 'sellers', 'landingBadgeText'
    ];

    let hasDepreciationChanged = false;
    let oldMapping = '{}';

    const [oldDepRows] = await connection.query('SELECT `value` FROM system_settings WHERE `key` = "categoryDepreciationYears"');
    if (oldDepRows.length > 0) {
      oldMapping = oldDepRows[0].value;
    }

    for (const key of keys) {
      if (req.body[key] !== undefined) {
        const valStr = typeof req.body[key] === 'string' ? req.body[key] : JSON.stringify(req.body[key]);
        await connection.query(
          'INSERT INTO system_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
          [key, valStr, valStr]
        );

        if (key === 'categoryDepreciationYears') {
          const newMapping = JSON.stringify(req.body[key]);
          if (oldMapping !== newMapping) {
            hasDepreciationChanged = true;
          }
        }
      }
    }

    if (req.body.custodians !== undefined) {
      await connection.query('DELETE FROM custodians');
      for (const cust of req.body.custodians) {
        await connection.query(
          'INSERT INTO custodians (id, name, position, division, department, email) VALUES (?, ?, ?, ?, ?, ?)',
          [cust.id, cust.name, cust.position || '', cust.division || '', cust.department || '', cust.email || '']
        );
      }
    }

    await connection.commit();

    if (hasDepreciationChanged) {
      await recalculateAllAssetsDepreciation(req.body.categoryDepreciationYears);
      await addAuditLogServer('ตั้งค่าระบบ', 'ปรับปรุงตารางค่าเสื่อมราคาหมวดหมู่และคำนวณข้อมูลสินทรัพย์ใหม่ทั้งหมด', req.user.name);
    } else {
      await addAuditLogServer('ตั้งค่าระบบ', 'ปรับปรุงการตั้งค่าระบบและบัญชีตัวเลือกมาสเตอร์ลิสต์', req.user.name);
    }

    res.json({ success: true, message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to save settings:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่าระบบ' });
  } finally {
    connection.release();
  }
});



export default router;
