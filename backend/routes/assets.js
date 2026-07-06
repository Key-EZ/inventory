import express from 'express';
import { executeQuery, getPool } from '../db.js';
import { calculateDepreciation } from '../depreciation.js';
import { addAuditLogServer } from '../utils/helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const assets = await executeQuery('SELECT * FROM assets');
    const maintenances = await executeQuery('SELECT * FROM maintenances');
    
    const maintsMap = {};
    maintenances.forEach(m => {
      if (!maintsMap[m.asset_id]) {
        maintsMap[m.asset_id] = [];
      }
      maintsMap[m.asset_id].push({
        id: m.id,
        approval_date: m.approval_date,
        document_number: m.document_number,
        description: m.description,
        cost: Number(m.cost) || 0,
        contractor: m.contractor
      });
    });
    
    const populatedAssets = assets.map(asset => ({
      ...asset,
      unit_price: Number(asset.unit_price) || 0,
      depreciation_rate_percent: Number(asset.depreciation_rate_percent) || 0,
      accumulated_depreciation: Number(asset.accumulated_depreciation) || 0,
      book_value: Number(asset.book_value) || 0,
      maintenances: maintsMap[asset.id] || []
    }));
    
    res.json(populatedAssets);
  } catch (error) {
    console.error('Failed to get assets:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลครุภัณฑ์' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assets = await executeQuery('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (assets.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์/ทรัพย์สิน' });
    }
    const asset = assets[0];
    const maintenances = await executeQuery('SELECT * FROM maintenances WHERE asset_id = ?', [req.params.id]);
    
    res.json({
      ...asset,
      unit_price: Number(asset.unit_price) || 0,
      depreciation_rate_percent: Number(asset.depreciation_rate_percent) || 0,
      accumulated_depreciation: Number(asset.accumulated_depreciation) || 0,
      book_value: Number(asset.book_value) || 0,
      maintenances: maintenances.map(m => ({
        id: m.id,
        approval_date: m.approval_date,
        document_number: m.document_number,
        description: m.description,
        cost: Number(m.cost) || 0,
        contractor: m.contractor
      }))
    });
  } catch (error) {
    console.error('Failed to get asset details:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดครุภัณฑ์' });
  }
});

router.post('/', async (req, res) => {
  try {
    const assetData = req.body;
    
    const rows = await executeQuery('SELECT `value` FROM system_settings WHERE `key` = "categoryDepreciationYears"');
    const categoryDepreciationYears = rows.length > 0 ? JSON.parse(rows[0].value) : {};
    
    const dep = calculateDepreciation(
      assetData.asset_code,
      assetData.unit_price,
      assetData.category,
      categoryDepreciationYears
    );
    
    const newAssetId = `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    await executeQuery(
      `INSERT INTO assets (
        id, asset_type, category, asset_code, name, location, acquisition_method,
        delivery_document_no, delivery_document_date, seller_name, unit_price,
        budget_owner, responsible_department, status, document_of_title, area_size,
        building_style, manufacturer_brand, serial_number, engine_number, chassis_number,
        vehicle_registration, color, warranty_start_date, warranty_end_date, warranty_company,
        depreciation_rate_percent, accumulated_depreciation, book_value, model, type, appearance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAssetId, assetData.asset_type, assetData.category, assetData.asset_code, assetData.name, assetData.location || '',
        assetData.acquisition_method || '', assetData.delivery_document_no || '', assetData.delivery_document_date || '',
        assetData.seller_name || '', assetData.unit_price || 0, assetData.budget_owner || '', assetData.responsible_department || '',
        assetData.status || 'ใช้งาน', assetData.document_of_title || '', assetData.area_size || '', assetData.building_style || '',
        assetData.manufacturer_brand || '', assetData.serial_number || '', assetData.engine_number || '', assetData.chassis_number || '',
        assetData.vehicle_registration || '', assetData.color || '', assetData.warranty_start_date || '', assetData.warranty_end_date || '',
        assetData.warranty_company || '', dep.depreciationRatePercent, dep.accumulatedDepreciation, dep.bookValue,
        assetData.model || '', assetData.type || '', assetData.appearance || ''
      ]
    );
    
    const responseAsset = {
      ...assetData,
      id: newAssetId,
      unit_price: Number(assetData.unit_price) || 0,
      depreciation_rate_percent: dep.depreciationRatePercent,
      accumulated_depreciation: dep.accumulatedDepreciation,
      book_value: dep.bookValue,
      maintenances: []
    };
    
    await addAuditLogServer('ลงทะเบียน', `ลงทะเบียนครุภัณฑ์ใหม่: ${responseAsset.name} รหัส ${responseAsset.asset_code}`, req.user.name);
    
    res.status(201).json(responseAsset);
  } catch (error) {
    console.error('Failed to create asset:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสพัสดุนี้ถูกใช้ลงทะเบียนไปแล้ว กรุณากรอกรหัสพัสดุอื่น' });
    }
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียนครุภัณฑ์' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const assetData = req.body;
    const existing = await executeQuery('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์/ทรัพย์สิน' });
    }
    
    const rows = await executeQuery('SELECT `value` FROM system_settings WHERE `key` = "categoryDepreciationYears"');
    const categoryDepreciationYears = rows.length > 0 ? JSON.parse(rows[0].value) : {};
    
    const dep = calculateDepreciation(
      assetData.asset_code,
      assetData.unit_price,
      assetData.category,
      categoryDepreciationYears
    );
    
    await executeQuery(
      `UPDATE assets SET
        asset_type = ?, category = ?, asset_code = ?, name = ?, location = ?, acquisition_method = ?,
        delivery_document_no = ?, delivery_document_date = ?, seller_name = ?, unit_price = ?,
        budget_owner = ?, responsible_department = ?, status = ?, document_of_title = ?, area_size = ?,
        building_style = ?, manufacturer_brand = ?, serial_number = ?, engine_number = ?, chassis_number = ?,
        vehicle_registration = ?, color = ?, warranty_start_date = ?, warranty_end_date = ?, warranty_company = ?,
        depreciation_rate_percent = ?, accumulated_depreciation = ?, book_value = ?, model = ?, type = ?, appearance = ?
      WHERE id = ?`,
      [
        assetData.asset_type, assetData.category, assetData.asset_code, assetData.name, assetData.location || '',
        assetData.acquisition_method || '', assetData.delivery_document_no || '', assetData.delivery_document_date || '',
        assetData.seller_name || '', assetData.unit_price || 0, assetData.budget_owner || '', assetData.responsible_department || '',
        assetData.status || 'ใช้งาน', assetData.document_of_title || '', assetData.area_size || '', assetData.building_style || '',
        assetData.manufacturer_brand || '', assetData.serial_number || '', assetData.engine_number || '', assetData.chassis_number || '',
        assetData.vehicle_registration || '', assetData.color || '', assetData.warranty_start_date || '', assetData.warranty_end_date || '',
        assetData.warranty_company || '', dep.depreciationRatePercent, dep.accumulatedDepreciation, dep.bookValue,
        assetData.model || '', assetData.type || '', assetData.appearance || '', req.params.id
      ]
    );
    
    const updatedAsset = {
      ...req.body,
      id: req.params.id,
      unit_price: Number(assetData.unit_price) || 0,
      depreciation_rate_percent: dep.depreciationRatePercent,
      accumulated_depreciation: dep.accumulatedDepreciation,
      book_value: dep.bookValue
    };
    
    const maintenances = await executeQuery('SELECT * FROM maintenances WHERE asset_id = ?', [req.params.id]);
    updatedAsset.maintenances = maintenances.map(m => ({
      id: m.id,
      approval_date: m.approval_date,
      document_number: m.document_number,
      description: m.description,
      cost: Number(m.cost) || 0,
      contractor: m.contractor
    }));
    
    await addAuditLogServer('แก้ไข', `แก้ไขข้อมูลครุภัณฑ์: ${updatedAsset.name} รหัส ${updatedAsset.asset_code}`, req.user.name);
    
    res.json(updatedAsset);
  } catch (error) {
    console.error('Failed to update asset:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสพัสดุนี้ถูกใช้ลงทะเบียนไปแล้ว กรุณากรอกรหัสพัสดุอื่น' });
    }
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลครุภัณฑ์' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await executeQuery('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์/ทรัพย์สิน' });
    }
    
    const asset = existing[0];
    await executeQuery('DELETE FROM assets WHERE id = ?', [req.params.id]);
    
    await addAuditLogServer('ลบ', `ลบข้อมูลครุภัณฑ์ออกจากระบบ: ${asset.name} รหัส ${asset.asset_code}`, req.user.name);
    
    res.json({ success: true, message: 'ลบข้อมูลครุภัณฑ์เรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Failed to delete asset:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูลครุภัณฑ์' });
  }
});

router.post('/import', async (req, res) => {
  const { assets: importedAssets, mode } = req.body;
  if (!Array.isArray(importedAssets)) {
    return res.status(400).json({ success: false, message: 'Invalid assets list format' });
  }
  
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [depRows] = await connection.query('SELECT `value` FROM system_settings WHERE `key` = "categoryDepreciationYears"');
    const categoryDepreciationYears = depRows.length > 0 ? JSON.parse(depRows[0].value) : {};
    
    if (mode === 'replace') {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE maintenances');
      await connection.query('TRUNCATE TABLE repair_requests');
      await connection.query('TRUNCATE TABLE assets');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const asset of importedAssets) {
      const dep = calculateDepreciation(
        asset.asset_code,
        asset.unit_price,
        asset.category,
        categoryDepreciationYears
      );
      
      const [existing] = await connection.query('SELECT id FROM assets WHERE asset_code = ?', [asset.asset_code]);
      
      if (existing.length > 0) {
        const existingId = existing[0].id;
        await connection.query(
          `UPDATE assets SET
            asset_type = ?, category = ?, name = ?, location = ?, acquisition_method = ?,
            delivery_document_no = ?, delivery_document_date = ?, seller_name = ?, unit_price = ?,
            budget_owner = ?, responsible_department = ?, status = ?, document_of_title = ?, area_size = ?,
            building_style = ?, manufacturer_brand = ?, serial_number = ?, engine_number = ?, chassis_number = ?,
            vehicle_registration = ?, color = ?, warranty_start_date = ?, warranty_end_date = ?, warranty_company = ?,
            depreciation_rate_percent = ?, accumulated_depreciation = ?, book_value = ?
          WHERE id = ?`,
          [
            asset.asset_type, asset.category, asset.name, asset.location || '', asset.acquisition_method || '',
            asset.delivery_document_no || '', asset.delivery_document_date || '', asset.seller_name || '', asset.unit_price || 0,
            asset.budget_owner || '', asset.responsible_department || '', asset.status || 'ใช้งาน', asset.document_of_title || '', asset.area_size || '',
            asset.building_style || '', asset.manufacturer_brand || '', asset.serial_number || '', asset.engine_number || '', asset.chassis_number || '',
            asset.vehicle_registration || '', asset.color || '', asset.warranty_start_date || '', asset.warranty_end_date || '', asset.warranty_company || '',
            dep.depreciationRatePercent, dep.accumulatedDepreciation, dep.bookValue, existingId
          ]
        );
        
        if (Array.isArray(asset.maintenances)) {
          for (const maint of asset.maintenances) {
            await connection.query(
              'INSERT INTO maintenances (id, asset_id, approval_date, document_number, description, cost, contractor) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE description = ?',
              [maint.id || `maint-${Date.now()}-${Math.floor(Math.random() * 100)}`, existingId, maint.approval_date, maint.document_number, maint.description, maint.cost || 0, maint.contractor || '', maint.description]
            );
          }
        }
        updatedCount++;
      } else {
        const newAssetId = asset.id || `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await connection.query(
          `INSERT INTO assets (
            id, asset_type, category, asset_code, name, location, acquisition_method,
            delivery_document_no, delivery_document_date, seller_name, unit_price,
            budget_owner, responsible_department, status, document_of_title, area_size,
            building_style, manufacturer_brand, serial_number, engine_number, chassis_number,
            vehicle_registration, color, warranty_start_date, warranty_end_date, warranty_company,
            depreciation_rate_percent, accumulated_depreciation, book_value
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newAssetId, asset.asset_type, asset.category, asset.asset_code, asset.name, asset.location || '',
            asset.acquisition_method || '', asset.delivery_document_no || '', asset.delivery_document_date || '',
            asset.seller_name || '', asset.unit_price || 0, asset.budget_owner || '', asset.responsible_department || '',
            asset.status || 'ใช้งาน', asset.document_of_title || '', asset.area_size || '', asset.building_style || '',
            asset.manufacturer_brand || '', asset.serial_number || '', asset.engine_number || '', asset.chassis_number || '',
            asset.vehicle_registration || '', asset.color || '', asset.warranty_start_date || '', asset.warranty_end_date || '',
            asset.warranty_company || '', dep.depreciationRatePercent, dep.accumulatedDepreciation, dep.bookValue
          ]
        );
        
        if (Array.isArray(asset.maintenances)) {
          for (const maint of asset.maintenances) {
            await connection.query(
              'INSERT INTO maintenances (id, asset_id, approval_date, document_number, description, cost, contractor) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [maint.id || `maint-${Date.now()}-${Math.floor(Math.random() * 100)}`, newAssetId, maint.approval_date, maint.document_number, maint.description, maint.cost || 0, maint.contractor || '']
            );
          }
        }
        addedCount++;
      }
    }
    
    await connection.commit();
    
    await addAuditLogServer('ตั้งค่าระบบ', `นำเข้าข้อมูลครุภัณฑ์สำเร็จ (นำเข้าใหม่: ${addedCount} รายการ, อัปเดตข้อมูลเดิม: ${updatedCount} รายการ)`, req.user?.name || 'ระบบ');
    
    const [allAssets] = await connection.query('SELECT * FROM assets');
    const [allMaints] = await connection.query('SELECT * FROM maintenances');
    
    const maintsMap = {};
    allMaints.forEach(m => {
      if (!maintsMap[m.asset_id]) {
        maintsMap[m.asset_id] = [];
      }
      maintsMap[m.asset_id].push({
        id: m.id,
        approval_date: m.approval_date,
        document_number: m.document_number,
        description: m.description,
        cost: Number(m.cost) || 0,
        contractor: m.contractor
      });
    });
    
    const populatedAssets = allAssets.map(asset => ({
      ...asset,
      unit_price: Number(asset.unit_price) || 0,
      depreciation_rate_percent: Number(asset.depreciation_rate_percent) || 0,
      accumulated_depreciation: Number(asset.accumulated_depreciation) || 0,
      book_value: Number(asset.book_value) || 0,
      maintenances: maintsMap[asset.id] || []
    }));
    
    res.json({
      success: true,
      added: addedCount,
      updated: updatedCount,
      assets: populatedAssets
    });
  } catch (error) {
    await connection.rollback();
    console.error('Import failed:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลครุภัณฑ์' });
  } finally {
    connection.release();
  }
});

export default router;
