import express from 'express';
import { executeQuery, getPool } from '../db.js';
import { addAuditLogServer } from '../utils/helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const repairs = await executeQuery('SELECT * FROM repair_requests');
    res.json(repairs);
  } catch (error) {
    console.error('Failed to get repairs:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอส่งซ่อม' });
  }
});

router.post('/', async (req, res) => {
  try {
    const reqObj = req.body;
    const newRequestId = `repair-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    await executeQuery(
      `INSERT INTO repair_requests (
        id, asset_id, request_date, problem_description, status, rejection_reason,
        repair_cost, contractor, approval_date, document_number, officer_notes
      ) VALUES (?, ?, ?, ?, 'PENDING', '', 0, '', '', '', '')`,
      [newRequestId, reqObj.asset_id, reqObj.request_date, reqObj.problem_description]
    );

    const assets = await executeQuery('SELECT name FROM assets WHERE id = ?', [reqObj.asset_id]);
    const assetName = assets.length > 0 ? assets[0].name : 'ไม่ระบุชื่อครุภัณฑ์';

    await addAuditLogServer('แจ้งซ่อม', `ยื่นคำขอส่งซ่อมสำหรับครุภัณฑ์: ${assetName}`, req.user.name);

    res.status(201).json({
      ...reqObj,
      id: newRequestId,
      status: 'PENDING',
      rejection_reason: '',
      repair_cost: 0,
      contractor: '',
      approval_date: '',
      document_number: '',
      officer_notes: ''
    });
  } catch (error) {
    console.error('Failed to create repair request:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการยื่นคำขอส่งซ่อม' });
  }
});

router.put('/:id/start', async (req, res) => {
  try {
    const repairs = await executeQuery('SELECT * FROM repair_requests WHERE id = ?', [req.params.id]);
    if (repairs.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลคำขอส่งซ่อม' });
    }
    const repair = repairs[0];

    await executeQuery('UPDATE repair_requests SET status = "IN_PROGRESS" WHERE id = ?', [req.params.id]);

    const assets = await executeQuery('SELECT name FROM assets WHERE id = ?', [repair.asset_id]);
    const assetName = assets.length > 0 ? assets[0].name : 'ไม่ระบุชื่อครุภัณฑ์';

    await addAuditLogServer('ดำเนินการซ่อม', `รับงานซ่อมและกำลังดำเนินการสำหรับครุภัณฑ์: ${assetName}`, req.user.name);

    res.json({
      ...repair,
      status: 'IN_PROGRESS'
    });
  } catch (error) {
    console.error('Failed to start repair request:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดำเนินการรับงานซ่อม' });
  }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const repairs = await executeQuery('SELECT * FROM repair_requests WHERE id = ?', [req.params.id]);
    if (repairs.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลคำขอส่งซ่อม' });
    }
    const repair = repairs[0];
    const reason = req.body.reason || 'ไม่ระบุสาเหตุ';

    await executeQuery('UPDATE repair_requests SET status = "REJECTED", rejection_reason = ? WHERE id = ?', [reason, req.params.id]);

    const assets = await executeQuery('SELECT name FROM assets WHERE id = ?', [repair.asset_id]);
    const assetName = assets.length > 0 ? assets[0].name : 'ไม่ระบุชื่อครุภัณฑ์';

    await addAuditLogServer('ปฏิเสธคำซ่อม', `ปฏิเสธคำส่งซ่อมสำหรับครุภัณฑ์: ${assetName} (สาเหตุ: ${reason})`, req.user.name);

    res.json({
      ...repair,
      status: 'REJECTED',
      rejection_reason: reason
    });
  } catch (error) {
    console.error('Failed to reject repair request:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอส่งซ่อม' });
  }
});

router.put('/:id/complete', async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [repairs] = await connection.query('SELECT * FROM repair_requests WHERE id = ?', [req.params.id]);
    if (repairs.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลคำขอส่งซ่อม' });
    }
    const repair = repairs[0];

    const status = 'COMPLETED';
    const cost = Number(req.body.cost) || 0;
    const contractor = req.body.contractor || '';
    const approvalDate = req.body.approvalDate || '';
    const documentNumber = req.body.documentNumber || '';
    const notes = req.body.notes || '';

    await connection.query(
      `UPDATE repair_requests SET
        status = ?, repair_cost = ?, contractor = ?, approval_date = ?, document_number = ?, officer_notes = ?
      WHERE id = ?`,
      [status, cost, contractor, approvalDate, documentNumber, notes, req.params.id]
    );

    const [assets] = await connection.query('SELECT name FROM assets WHERE id = ?', [repair.asset_id]);
    const assetName = assets.length > 0 ? assets[0].name : 'ไม่ระบุชื่อครุภัณฑ์';

    const maintId = `maint-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    await connection.query(
      `INSERT INTO maintenances (id, asset_id, approval_date, document_number, description, cost, contractor)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [maintId, repair.asset_id, approvalDate, documentNumber, repair.problem_description, cost, contractor]
    );

    await connection.commit();

    await addAuditLogServer('ซ่อมเสร็จสิ้น', `บันทึกซ่อมบำรุงครุภัณฑ์เสร็จสมบูรณ์: ${assetName} (ค่าใช้จ่าย: ${cost} บาท)`, req.user.name);

    res.json({
      ...repair,
      status,
      repair_cost: cost,
      contractor,
      approval_date: approvalDate,
      document_number: documentNumber,
      officer_notes: notes
    });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to complete repair request:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดำเนินการคำขอส่งซ่อมเสร็จสิ้น' });
  } finally {
    connection.release();
  }
});

export default router;
