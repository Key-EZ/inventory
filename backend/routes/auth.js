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
      const userPayload = { name: custodian.name, email: custodian.email, role: custodian.role || 'CUSTODIAN' };
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
      await addAuditLogServer('เข้าระบบ', `ลงชื่อเข้าใช้งานระบบด้วยบัญชี SSO: ${custodian.name}`, custodian.name);
      return res.json({ success: true, token, user: userPayload });
    }
    return res.status(401).json({ success: false, message: 'ไม่พบบัญชีอีเมลนี้ในฐานข้อมูลพนักงานผู้ดูแลรับผิดชอบ' });
  }

  return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ' });
});

// GET /api/auth/sso/redirect - Redirects to Authentik login page
router.get('/auth/sso/redirect', (req, res) => {
  const authentikUrl = process.env.AUTHENTIK_URL ? process.env.AUTHENTIK_URL.replace(/\/+$/, '') : '';
  const clientId = process.env.SSO_CLIENT_ID;
  const redirectUri = process.env.SSO_REDIRECT_URI;

  if (!authentikUrl || !clientId || !redirectUri) {
    return res.status(500).json({ success: false, message: 'SSO configuration is incomplete in .env' });
  }

  const authUrl = `${authentikUrl}/application/o/authorize/?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid+profile+email`;
  res.redirect(authUrl);
});

// GET /api/auth/sso/callback - Receives authorization code from Authentik
router.get('/auth/sso/callback', async (req, res) => {
  const { code, error, error_description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    console.error('Authentik authorization error:', error, error_description);
    return res.redirect(`${frontendUrl}/?sso_error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/?sso_error=${encodeURIComponent('Missing authorization code')}`);
  }

  try {
    const authentikUrl = process.env.AUTHENTIK_URL ? process.env.AUTHENTIK_URL.replace(/\/+$/, '') : '';
    const clientId = process.env.SSO_CLIENT_ID;
    const clientSecret = process.env.SSO_CLIENT_SECRET;
    const redirectUri = process.env.SSO_REDIRECT_URI;

    // Exchange auth code for token
    const tokenResponse = await fetch(`${authentikUrl}/application/o/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Authentik token exchange error:', errText);
      return res.redirect(`${frontendUrl}/?sso_error=${encodeURIComponent('Failed to exchange authorization code for token')}`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Fetch user profile info
    const userinfoResponse = await fetch(`${authentikUrl}/application/o/userinfo/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userinfoResponse.ok) {
      const errText = await userinfoResponse.text();
      console.error('Authentik userinfo error:', errText);
      return res.redirect(`${frontendUrl}/?sso_error=${encodeURIComponent('Failed to retrieve user information from Authentik')}`);
    }

    const userinfo = await userinfoResponse.json();
    const email = userinfo.email;

    if (!email) {
      return res.redirect(`${frontendUrl}/?sso_error=${encodeURIComponent('User profile does not contain an email address')}`);
    }

    // Find custodian with matching email
    const rows = await executeQuery('SELECT * FROM custodians WHERE LOWER(email) = ?', [String(email).toLowerCase()]);
    if (rows.length > 0) {
      const custodian = rows[0];
      const userPayload = { name: custodian.name, email: custodian.email, role: custodian.role || 'CUSTODIAN' };
      const localToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
      await addAuditLogServer('เข้าระบบ', `ลงชื่อเข้าใช้งานระบบด้วยบัญชี SSO: ${custodian.name}`, custodian.name);

      return res.redirect(`${frontendUrl}/?sso_token=${localToken}&sso_user=${encodeURIComponent(JSON.stringify(userPayload))}`);
    }

    // Support Admin SSO login if matching admin@system.local
    if (email.toLowerCase() === 'admin@system.local') {
      const userPayload = { name: 'admin', email: 'admin@system.local', role: 'ADMIN' };
      const localToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });
      await addAuditLogServer('เข้าระบบ', 'ลงชื่อเข้าใช้งานระบบด้วยบัญชีผู้ดูแลระบบ (Admin via SSO)', 'admin');

      return res.redirect(`${frontendUrl}/?sso_token=${localToken}&sso_user=${encodeURIComponent(JSON.stringify(userPayload))}`);
    }

    // Email not found in database
    return res.redirect(`${frontendUrl}/?sso_error=${encodeURIComponent(`ไม่พบบัญชีอีเมลนี้ในฐานข้อมูลพนักงานผู้ดูแลรับผิดชอบ (${email})`)}`);
  } catch (err) {
    console.error('Error during SSO processing:', err);
    return res.redirect(`${frontendUrl}/?sso_error=${encodeURIComponent(`เกิดข้อผิดพลาดภายในระบบ: ${err.message}`)}`);
  }
});

export default router;
