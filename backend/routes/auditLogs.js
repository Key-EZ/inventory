import express from 'express';
import jwt from 'jsonwebtoken';
import { readDb, writeDb } from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';

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
    const dbData = await readDb();
    res.json(dbData.auditLogs);
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
});

router.delete('/', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  const dbData = await readDb();
  dbData.auditLogs = [
    {
      id: `log-${Date.now()}-clear`,
      timestamp: new Date().toISOString(),
      action: 'ระบบ',
      details: 'ล้างประวัติการใช้งานระบบ (Audit Log) ทั้งหมด',
      user: req.user.name
    }
  ];
  await writeDb(dbData);
  res.json({ success: true, message: 'ล้างประวัติการใช้งานระบบเรียบร้อยแล้ว' });
});

export default router;
