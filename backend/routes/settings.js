import express from 'express';
import { readDb, writeDb, getDefaultData } from '../db.js';
import { addAuditLogServer, recalculateAllAssetsDepreciation } from '../utils/helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const dbData = await readDb();
  res.json({
    divisions: dbData.divisions,
    departments: dbData.departments,
    custodians: dbData.custodians,
    positions: dbData.positions,
    brands: dbData.brands,
    locations: dbData.locations,
    landBuildingCategories: dbData.landBuildingCategories,
    equipmentCategories: dbData.equipmentCategories,
    categoryDepreciationYears: dbData.categoryDepreciationYears,
    agencies: dbData.agencies,
    sellers: dbData.sellers,
    landingBadgeText: dbData.landingBadgeText
  });
});

router.put('/', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  const dbData = await readDb();
  const keys = [
    'divisions', 'departments', 'custodians', 'positions', 'brands',
    'locations', 'landBuildingCategories', 'equipmentCategories',
    'categoryDepreciationYears', 'agencies', 'sellers', 'landingBadgeText'
  ];

  let hasDepreciationChanged = false;
  const oldMapping = JSON.stringify(dbData.categoryDepreciationYears);

  keys.forEach(key => {
    if (req.body[key] !== undefined) {
      dbData[key] = req.body[key];
      if (key === 'categoryDepreciationYears') {
        const newMapping = JSON.stringify(req.body[key]);
        if (oldMapping !== newMapping) {
          hasDepreciationChanged = true;
        }
      }
    }
  });

  if (hasDepreciationChanged) {
    recalculateAllAssetsDepreciation(dbData, dbData.categoryDepreciationYears);
    addAuditLogServer(dbData, 'ตั้งค่าระบบ', 'ปรับปรุงตารางค่าเสื่อมราคาหมวดหมู่และคำนวณข้อมูลสินทรัพย์ใหม่ทั้งหมด', req.user.name);
  } else {
    addAuditLogServer(dbData, 'ตั้งค่าระบบ', 'ปรับปรุงการตั้งค่าระบบและบัญชีตัวเลือกมาสเตอร์ลิสต์', req.user.name);
  }

  await writeDb(dbData);
  res.json({ success: true, message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' });
});

router.post('/reset', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  const defaultData = getDefaultData();
  addAuditLogServer(defaultData, 'ระบบ', 'รีเซ็ตระบบกลับสู่การตั้งค่ามาตรฐานและข้อมูลตัวอย่าง', req.user.name);
  await writeDb(defaultData);
  res.json({ success: true, message: 'รีเซ็ตข้อมูลระบบเป็นค่าเริ่มต้นเสร็จสิ้น' });
});

export default router;
