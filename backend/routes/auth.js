import express from 'express';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { addAuditLogServer } from '../utils/helpers.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, email } = req.body;

  // Admin login
  if (username && password) {
    const rows = await executeQuery('SELECT `value` FROM system_settings WHERE `key` = "adminUser"');
    const admin = rows.length > 0 ? JSON.parse(rows[0].value) : { username: 'admin', password: 'admin1234' };
    
    if (username === admin.username && password === admin.password) {
      const userPayload = { name: 'admin', email: 'admin@system.local', role: 'ADMIN' };
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
      await addAuditLogServer('เข้าระบบ', 'ลงชื่อเข้าใช้งานระบบด้วยบัญชีผู้ดูแลระบบ (Admin)', 'admin');
      return res.json({ success: true, token, user: userPayload });
    }
    return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
  }

  // SSO login
  if (email) {
    const rows = await executeQuery('SELECT * FROM custodians WHERE LOWER(email) = ?', [String(email).toLowerCase()]);
    if (rows.length > 0) {
      const custodian = rows[0];
      const userPayload = { name: custodian.name, email: custodian.email, role: 'CUSTODIAN' };
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
      await addAuditLogServer('เข้าระบบ', `ลงชื่อเข้าใช้งานระบบด้วยบัญชี SSO: ${custodian.name}`, custodian.name);
      return res.json({ success: true, token, user: userPayload });
    }
    return res.status(401).json({ success: false, message: 'ไม่พบบัญชีอีเมลนี้ในฐานข้อมูลพนักงานผู้ดูแลรับผิดชอบ' });
  }

  return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ' });
});

export default router;
