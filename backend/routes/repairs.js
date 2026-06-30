import express from 'express';
import { readDb, writeDb } from '../db.js';
import { addAuditLogServer } from '../utils/helpers.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbData = readDb();
  res.json(dbData.repairRequests || []);
});

router.post('/', (req, res) => {
  const dbData = readDb();
  const reqObj = req.body;

  const newRequest = {
    ...reqObj,
    id: `repair-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'PENDING',
    rejection_reason: '',
    repair_cost: 0,
    contractor: '',
    approval_date: '',
    document_number: '',
    officer_notes: ''
  };

  if (!dbData.repairRequests) {
    dbData.repairRequests = [];
  }

  const asset = dbData.assets.find(a => a.id === reqObj.asset_id);
  const assetName = asset ? asset.name : 'ไม่ระบุชื่อครุภัณฑ์';

  dbData.repairRequests.push(newRequest);
  addAuditLogServer(dbData, 'แจ้งซ่อม', `ยื่นคำขอส่งซ่อมสำหรับครุภัณฑ์: ${assetName}`, req.user.name);
  writeDb(dbData);

  res.status(201).json(newRequest);
});

router.put('/:id/start', (req, res) => {
  const dbData = readDb();
  const index = dbData.repairRequests.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลคำขอส่งซ่อม' });
  }

  const reqObj = dbData.repairRequests[index];
  reqObj.status = 'IN_PROGRESS';

  const asset = dbData.assets.find(a => a.id === reqObj.asset_id);
  const assetName = asset ? asset.name : 'ไม่ระบุชื่อครุภัณฑ์';

  addAuditLogServer(dbData, 'ดำเนินการซ่อม', `รับงานซ่อมและกำลังดำเนินการสำหรับครุภัณฑ์: ${assetName}`, req.user.name);
  writeDb(dbData);

  res.json(reqObj);
});

router.put('/:id/reject', (req, res) => {
  const dbData = readDb();
  const index = dbData.repairRequests.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลคำขอส่งซ่อม' });
  }

  const reqObj = dbData.repairRequests[index];
  reqObj.status = 'REJECTED';
  reqObj.rejection_reason = req.body.reason || 'ไม่ระบุสาเหตุ';

  const asset = dbData.assets.find(a => a.id === reqObj.asset_id);
  const assetName = asset ? asset.name : 'ไม่ระบุชื่อครุภัณฑ์';

  addAuditLogServer(dbData, 'ปฏิเสธคำซ่อม', `ปฏิเสธคำส่งซ่อมสำหรับครุภัณฑ์: ${assetName} (สาเหตุ: ${reqObj.rejection_reason})`, req.user.name);
  writeDb(dbData);

  res.json(reqObj);
});

router.put('/:id/complete', (req, res) => {
  const dbData = readDb();
  const index = dbData.repairRequests.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลคำขอส่งซ่อม' });
  }

  const reqObj = dbData.repairRequests[index];
  reqObj.status = 'COMPLETED';
  reqObj.repair_cost = Number(req.body.cost) || 0;
  reqObj.contractor = req.body.contractor || '';
  reqObj.approval_date = req.body.approvalDate || '';
  reqObj.document_number = req.body.documentNumber || '';
  reqObj.officer_notes = req.body.notes || '';

  // Update asset maintenance history as well
  const assetIndex = dbData.assets.findIndex(a => a.id === reqObj.asset_id);
  if (assetIndex !== -1) {
    const asset = dbData.assets[assetIndex];
    if (!asset.maintenances) {
      asset.maintenances = [];
    }
    asset.maintenances.push({
      id: `maint-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      approval_date: reqObj.approval_date,
      document_number: reqObj.document_number,
      description: reqObj.problem_description,
      cost: reqObj.repair_cost,
      contractor: reqObj.contractor
    });
    addAuditLogServer(dbData, 'ซ่อมเสร็จสิ้น', `บันทึกซ่อมบำรุงครุภัณฑ์เสร็จสมบูรณ์: ${asset.name} (ค่าใช้จ่าย: ${reqObj.repair_cost} บาท)`, req.user.name);
  }

  writeDb(dbData);
  res.json(reqObj);
});

export default router;
