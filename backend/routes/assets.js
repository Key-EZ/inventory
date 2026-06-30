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
    depreciation_rate_percent: dep.depreciationRatePercent,
    accumulated_depreciation: dep.accumulatedDepreciation,
    book_value: dep.bookValue
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
    depreciation_rate_percent: dep.depreciationRatePercent,
    accumulated_depreciation: dep.accumulatedDepreciation,
    book_value: dep.bookValue
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

  if (dbData.repairRequests) {
    dbData.repairRequests = dbData.repairRequests.filter(r => r.asset_id !== req.params.id);
  }

  addAuditLogServer(dbData, 'ลบ', `ลบข้อมูลครุภัณฑ์ออกจากระบบ: ${asset.name} รหัส ${asset.asset_code}`, req.user.name);
  await writeDb(dbData);

  res.json({ success: true, message: 'ลบข้อมูลครุภัณฑ์เรียบร้อยแล้ว' });
});

router.post('/import', async (req, res) => {
  const { assets: importedAssets, mode } = req.body;
  if (!Array.isArray(importedAssets)) {
    return res.status(400).json({ success: false, message: 'Invalid assets list format' });
  }

  const dbData = await readDb();

  // Perform calculations for imported assets
  const calculatedAssets = importedAssets.map(asset => {
    const dep = calculateDepreciation(
      asset.asset_code,
      asset.unit_price,
      asset.category,
      dbData.categoryDepreciationYears
    );
    return {
      ...asset,
      depreciation_rate_percent: dep.depreciationRatePercent,
      accumulated_depreciation: dep.accumulatedDepreciation,
      book_value: dep.bookValue
    };
  });

  let addedCount = 0;
  let updatedCount = 0;

  if (mode === 'replace') {
    dbData.assets = calculatedAssets;
    addedCount = calculatedAssets.length;
    // Clear repair requests since old assets are replaced
    if (dbData.repairRequests) {
      dbData.repairRequests = [];
    }
  } else {
    // Merge mode
    const currentAssetsMap = new Map(dbData.assets.map(a => [a.asset_code, a]));
    calculatedAssets.forEach(newAsset => {
      if (currentAssetsMap.has(newAsset.asset_code)) {
        const existing = currentAssetsMap.get(newAsset.asset_code);
        newAsset.id = existing.id;
        if ((!newAsset.maintenances || newAsset.maintenances.length === 0) && existing.maintenances && existing.maintenances.length > 0) {
          newAsset.maintenances = existing.maintenances;
        }
        currentAssetsMap.set(newAsset.asset_code, newAsset);
        updatedCount++;
      } else {
        currentAssetsMap.set(newAsset.asset_code, newAsset);
        addedCount++;
      }
    });
    dbData.assets = Array.from(currentAssetsMap.values());
  }

  addAuditLogServer(dbData, 'ตั้งค่าระบบ', `นำเข้าข้อมูลครุภัณฑ์สำเร็จ (นำเข้าใหม่: ${addedCount} รายการ, อัปเดตข้อมูลเดิม: ${updatedCount} รายการ)`, req.user?.name || 'ระบบ');
  await writeDb(dbData);

  res.json({
    success: true,
    added: addedCount,
    updated: updatedCount,
    assets: dbData.assets
  });
});

export default router;
