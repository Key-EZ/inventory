import express from 'express';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { addAuditLogServer } from '../utils/helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Access token missing' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN' && decoded.role !== 'CUSTODIAN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized role' });
    }
    const auditLogs = await executeQuery('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(auditLogs);
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
});

router.delete('/', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  try {
    await executeQuery('DELETE FROM audit_logs');
    await addAuditLogServer('ระบบ', 'ล้างประวัติการใช้งานระบบ (Audit Log) ทั้งหมด', req.user.name);
    res.json({ success: true, message: 'ล้างประวัติการใช้งานระบบเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Failed to clear audit logs:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการล้างประวัติการใช้งาน' });
  }
});

export default router;
