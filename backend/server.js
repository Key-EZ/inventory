import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, getDefaultData } from './db.js';
import { calculateDepreciation } from './depreciation.js';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'super-secret-key-12345';

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authMiddleware = (req, res, next) => {
  // Allow read-only guest access for all GET endpoints
  if (req.method === 'GET') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};

// --- Audit Log Server Helper ---
const addAuditLogServer = (dbData, action, details, userName) => {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    user: userName || 'ผู้ใช้งานระบบ'
  };
  dbData.auditLogs = [newLog, ...dbData.auditLogs];
};

// --- Depreciation Bulk Recalculation Server Helper ---
const recalculateAllAssetsDepreciation = (dbData, updatedMapping) => {
  dbData.assets = dbData.assets.map(asset => {
    const dep = calculateDepreciation(
      asset.asset_code,
      asset.unit_price,
      asset.category,
      updatedMapping
    );
    return {
      ...asset,
      depreciation_rate_percent: dep.depreciation_rate_percent,
      accumulated_depreciation: dep.accumulated_depreciation,
      book_value: dep.book_value
    };
  });
};

// --- Authentication Routes ---
app.post('/api/login', (req, res) => {
  const { username, password, email } = req.body;
  const dbData = readDb();

  // Admin login
  if (username && password) {
    const admin = dbData.adminUser || { username: 'admin', password: 'admin1234' };
    if (username === admin.username && password === admin.password) {
      const userPayload = { name: 'admin', email: 'admin@system.local', role: 'ADMIN' };
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
      addAuditLogServer(dbData, 'เข้าระบบ', 'ลงชื่อเข้าใช้งานระบบด้วยบัญชีผู้ดูแลระบบ (Admin)', 'admin');
      writeDb(dbData);
      return res.json({ success: true, token, user: userPayload });
    }
    return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
  }

  // SSO login
  if (email) {
    const custodian = dbData.custodians.find(c => String(c.email).toLowerCase() === String(email).toLowerCase());
    if (custodian) {
      const userPayload = { name: custodian.name, email: custodian.email, role: 'CUSTODIAN' };
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
      addAuditLogServer(dbData, 'เข้าระบบ', `ลงชื่อเข้าใช้งานระบบด้วยบัญชี SSO: ${custodian.name}`, custodian.name);
      writeDb(dbData);
      return res.json({ success: true, token, user: userPayload });
    }
    return res.status(401).json({ success: false, message: 'ไม่พบบัญชีอีเมลนี้ในฐานข้อมูลพนักงานผู้ดูแลรับผิดชอบ' });
  }

  return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ' });
});

app.use(authMiddleware);

// --- Settings Panel / Configuration Routes ---
app.get('/api/settings', (req, res) => {
  const dbData = readDb();
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

app.put('/api/settings', (req, res) => {
  const dbData = readDb();
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

  writeDb(dbData);
  res.json({ success: true, message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' });
});

app.post('/api/settings/reset', (req, res) => {
  const defaultData = getDefaultData();
  addAuditLogServer(defaultData, 'ระบบ', 'รีเซ็ตระบบกลับสู่การตั้งค่ามาตรฐานและข้อมูลตัวอย่าง', req.user.name);
  writeDb(defaultData);
  res.json({ success: true, message: 'รีเซ็ตข้อมูลระบบเป็นค่าเริ่มต้นเสร็จสิ้น' });
});

// --- Assets Routes ---
app.get('/api/assets', (req, res) => {
  const dbData = readDb();
  res.json(dbData.assets);
});

app.get('/api/assets/:id', (req, res) => {
  const dbData = readDb();
  const asset = dbData.assets.find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์/ทรัพย์สิน' });
  }
  res.json(asset);
});

app.post('/api/assets', (req, res) => {
  const dbData = readDb();
  const assetData = req.body;

  // Calculate dynamic depreciation properties
  const dep = calculateDepreciation(
    assetData.asset_code,
    assetData.unit_price,
    assetData.category,
    dbData.categoryDepreciationYears
  );

  const newAsset = {
    ...assetData,
    id: assetData.id || `asset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    depreciation_rate_percent: dep.depreciation_rate_percent,
    accumulated_depreciation: dep.accumulated_depreciation,
    book_value: dep.book_value,
    maintenances: assetData.maintenances || []
  };

  dbData.assets = [newAsset, ...dbData.assets];
  addAuditLogServer(dbData, 'ครุภัณฑ์', `ลงทะเบียนครุภัณฑ์ใหม่: ${newAsset.name} (รหัส: ${newAsset.asset_code})`, req.user.name);

  writeDb(dbData);
  res.status(201).json(newAsset);
});

app.put('/api/assets/:id', (req, res) => {
  const dbData = readDb();
  const index = dbData.assets.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์ที่ต้องการแก้ไข' });
  }

  const assetData = req.body;
  const dep = calculateDepreciation(
    assetData.asset_code,
    assetData.unit_price,
    assetData.category,
    dbData.categoryDepreciationYears
  );

  dbData.assets[index] = {
    ...dbData.assets[index],
    ...assetData,
    depreciation_rate_percent: dep.depreciation_rate_percent,
    accumulated_depreciation: dep.accumulated_depreciation,
    book_value: dep.book_value
  };

  addAuditLogServer(dbData, 'ครุภัณฑ์', `แก้ไขข้อมูลครุภัณฑ์: ${assetData.name} (รหัส: ${assetData.asset_code})`, req.user.name);
  writeDb(dbData);
  res.json(dbData.assets[index]);
});

app.delete('/api/assets/:id', (req, res) => {
  const dbData = readDb();
  const assetToDelete = dbData.assets.find(a => a.id === req.params.id);

  if (!assetToDelete) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์ที่ต้องการลบ' });
  }

  dbData.assets = dbData.assets.filter(a => a.id !== req.params.id);
  dbData.repairRequests = dbData.repairRequests.filter(r => r.asset_id !== req.params.id);

  addAuditLogServer(dbData, 'ครุภัณฑ์', `ลบข้อมูลครุภัณฑ์: ${assetToDelete.name} (รหัส: ${assetToDelete.asset_code})`, req.user.name);
  writeDb(dbData);
  res.json({ success: true, message: 'ลบข้อมูลครุภัณฑ์เรียบร้อยแล้ว' });
});

// --- Repairs Routes ---
app.get('/api/repairs', (req, res) => {
  const dbData = readDb();
  res.json(dbData.repairRequests);
});

app.post('/api/repairs', (req, res) => {
  const dbData = readDb();
  const { asset_id, problem_description } = req.body;

  const asset = dbData.assets.find(a => a.id === asset_id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบอุปกรณ์ที่แจ้งซ่อม' });
  }

  const newRequest = {
    id: `repair-${Date.now()}`,
    asset_id,
    request_date: new Date().toISOString(),
    problem_description,
    status: 'PENDING',
    rejection_reason: '',
    repair_cost: 0,
    contractor: '',
    approval_date: '',
    document_number: '',
    officer_notes: ''
  };

  dbData.repairRequests = [newRequest, ...dbData.repairRequests];
  asset.status = 'ชำรุด';

  addAuditLogServer(dbData, 'งานซ่อม', `แจ้งซ่อมอุปกรณ์สำหรับครุภัณฑ์รหัส: ${asset.asset_code} (ปัญหา: ${problem_description})`, req.user.name);
  writeDb(dbData);
  res.status(201).json(newRequest);
});

app.put('/api/repairs/:id/start', (req, res) => {
  const dbData = readDb();
  const reqObj = dbData.repairRequests.find(r => r.id === req.params.id);

  if (!reqObj) {
    return res.status(404).json({ success: false, message: 'ไม่พบรายการแจ้งซ่อม' });
  }

  reqObj.status = 'IN_PROGRESS';
  const asset = dbData.assets.find(a => a.id === reqObj.asset_id);
  if (asset) {
    asset.status = 'กำลังซ่อม';
    addAuditLogServer(dbData, 'งานซ่อม', `เริ่มดำเนินการซ่อมแซมครุภัณฑ์รหัส: ${asset.asset_code}`, req.user.name);
  }

  writeDb(dbData);
  res.json(reqObj);
});

app.put('/api/repairs/:id/reject', (req, res) => {
  const dbData = readDb();
  const { reason } = req.body;
  const reqObj = dbData.repairRequests.find(r => r.id === req.params.id);

  if (!reqObj) {
    return res.status(404).json({ success: false, message: 'ไม่พบรายการแจ้งซ่อม' });
  }

  reqObj.status = 'REJECTED';
  reqObj.rejection_reason = reason;

  const asset = dbData.assets.find(a => a.id === reqObj.asset_id);
  if (asset) {
    asset.status = 'ใช้งาน';
    addAuditLogServer(dbData, 'งานซ่อม', `ปฏิเสธการแจ้งซ่อมของครุภัณฑ์รหัส: ${asset.asset_code} (เหตุผล: ${reason})`, req.user.name);
  }

  writeDb(dbData);
  res.json(reqObj);
});

app.put('/api/repairs/:id/complete', (req, res) => {
  const dbData = readDb();
  const { cost, contractor, approvalDate, documentNumber, notes } = req.body;
  const reqObj = dbData.repairRequests.find(r => r.id === req.params.id);

  if (!reqObj) {
    return res.status(404).json({ success: false, message: 'ไม่พบรายการแจ้งซ่อม' });
  }

  reqObj.status = 'COMPLETED';
  reqObj.repair_cost = parseFloat(cost) || 0;
  reqObj.contractor = contractor;
  reqObj.approval_date = approvalDate;
  reqObj.document_number = documentNumber;
  reqObj.officer_notes = notes;
  reqObj.completion_date = new Date().toISOString();

  const asset = dbData.assets.find(a => a.id === reqObj.asset_id);
  if (asset) {
    const newMaintenanceLog = {
      id: `maint-${Date.now()}`,
      approval_date: approvalDate,
      document_number: documentNumber,
      description: reqObj.problem_description + (notes ? ` (${notes})` : ''),
      cost: parseFloat(cost) || 0,
      contractor: contractor
    };

    asset.maintenances = [...(asset.maintenances || []), newMaintenanceLog];
    asset.status = 'ใช้งาน';
    addAuditLogServer(dbData, 'งานซ่อม', `ซ่อมแซมเสร็จสิ้นสำหรับครุภัณฑ์รหัส: ${asset.asset_code} (ค่าใช้จ่าย: ${cost} บาท, ผู้รับจ้าง: ${contractor})`, req.user.name);
  }

  writeDb(dbData);
  res.json(reqObj);
});

// --- Audit Logs Routes ---
app.get('/api/audit-logs', (req, res) => {
  const dbData = readDb();
  res.json(dbData.auditLogs);
});

app.delete('/api/audit-logs', (req, res) => {
  const dbData = readDb();
  dbData.auditLogs = [
    {
      id: `log-${Date.now()}-clear`,
      timestamp: new Date().toISOString(),
      action: 'ระบบ',
      details: 'ล้างประวัติการใช้งานระบบ (Audit Log) ทั้งหมด',
      user: req.user.name
    }
  ];
  writeDb(dbData);
  res.json({ success: true, message: 'ล้างประวัติการใช้งานระบบเรียบร้อยแล้ว' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
