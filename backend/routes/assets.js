import express from 'express';
import { readDb, writeDb } from '../db.js';
import { calculateDepreciation } from '../depreciation.js';
import { addAuditLogServer } from '../utils/helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const dbData = await readDb();
  res.json(dbData.assets);
});

router.get('/:id', async (req, res) => {
  const dbData = await readDb();
  const asset = dbData.assets.find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์/ทรัพย์สิน' });
  }
  res.json(asset);
});

router.post('/', async (req, res) => {
  const dbData = await readDb();
  const assetData = req.body;

  // Perform backend depreciation calculations
  const dep = calculateDepreciation(
    assetData.asset_code,
    assetData.unit_price,
    assetData.category,
    dbData.categoryDepreciationYears
  );

  const newAsset = {
    ...assetData,
    id: `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    depreciation_rate_percent: dep.depreciation_rate_percent,
    accumulated_depreciation: dep.accumulated_depreciation,
    book_value: dep.book_value
  };

  dbData.assets.push(newAsset);
  addAuditLogServer(dbData, 'ลงทะเบียน', `ลงทะเบียนครุภัณฑ์ใหม่: ${newAsset.name} รหัส ${newAsset.asset_code}`, req.user.name);
  await writeDb(dbData);

  res.status(201).json(newAsset);
});

router.put('/:id', async (req, res) => {
  const dbData = await readDb();
  const index = dbData.assets.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์/ทรัพย์สิน' });
  }

  const oldAsset = dbData.assets[index];
  const assetData = req.body;

  // Recalculate depreciation
  const dep = calculateDepreciation(
    assetData.asset_code,
    assetData.unit_price,
    assetData.category,
    dbData.categoryDepreciationYears
  );

  const updatedAsset = {
    ...oldAsset,
    ...assetData,
    depreciation_rate_percent: dep.depreciation_rate_percent,
    accumulated_depreciation: dep.accumulated_depreciation,
    book_value: dep.book_value
  };

  dbData.assets[index] = updatedAsset;
  addAuditLogServer(dbData, 'แก้ไข', `แก้ไขข้อมูลครุภัณฑ์: ${updatedAsset.name} รหัส ${updatedAsset.asset_code}`, req.user.name);
  await writeDb(dbData);

  res.json(updatedAsset);
});

router.delete('/:id', async (req, res) => {
  const dbData = await readDb();
  const index = dbData.assets.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์/ทรัพย์สิน' });
  }

  const asset = dbData.assets[index];
  dbData.assets.splice(index, 1);
  addAuditLogServer(dbData, 'ลบ', `ลบข้อมูลครุภัณฑ์ออกจากระบบ: ${asset.name} รหัส ${asset.asset_code}`, req.user.name);
  await writeDb(dbData);

  res.json({ success: true, message: 'ลบข้อมูลครุภัณฑ์เรียบร้อยแล้ว' });
});

export default router;
