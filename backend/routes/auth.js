import express from 'express';
import jwt from 'jsonwebtoken';
import { readDb, writeDb } from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { addAuditLogServer } from '../utils/helpers.js';

const router = express.Router();

router.post('/login', (req, res) => {
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

export default router;
