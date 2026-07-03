import { useState } from 'react';
import { login } from '../services/authService';


export default function LoginModal({
  onClose,
  onLoginSuccess,
  custodians = [],
  ssoError,
  setSsoError
}) {
  const [activeTab, setActiveTab] = useState('sso'); // 'sso' | 'admin'
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // List of suggestion emails for SSO testing
  const ssoSuggestions = custodians.slice(0, 3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = activeTab === 'sso' 
        ? { email: emailInput.trim() } 
        : { username: usernameInput.trim(), password: passwordInput };

      const data = await login(payload);

      if (data.success) {
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setErrorMsg(data.message || 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error('Login request failed', err);
      // Client-only local authentication fallback if backend is offline
      if (activeTab === 'sso') {
        const email = emailInput.trim().toLowerCase();
        const custodian = custodians.find(c => String(c.email).toLowerCase() === email);
        if (custodian) {
          onLoginSuccess({
            name: custodian.name,
            email: custodian.email,
            role: 'CUSTODIAN'
          }, 'offline-token-custodian');
          onClose();
        } else {
          setErrorMsg('ไม่พบอีเมลนี้ในข้อมูลพนักงานผู้ดูแล (โหมดออฟไลน์)');
        }
      } else {
        if (usernameInput.trim() === 'admin' && passwordInput === 'admin1234') {
          onLoginSuccess({
            name: 'admin',
            email: 'admin@system.local',
            role: 'ADMIN'
          }, 'offline-token-admin');
          onClose();
        } else {
          setErrorMsg('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (โหมดออฟไลน์)');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ backdropFilter: 'blur(8px)', zIndex: 1100 }}>
      <div className="modal-content-card" style={{ maxWidth: '420px', padding: '24px' }}>
        <div className="modal-header-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 0 0' }}>เข้าสู่ระบบ</h2>
          <button className="close-btn" onClick={onClose} type="button" style={{ fontSize: '1.5rem' }}>&times;</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px', marginBottom: '20px' }}>
          กรุณาเลือกช่องทางการเข้าสู่ระบบเพื่อจัดการทะเบียนพัสดุ
        </p>

        {/* Tabs Headers */}
        <div className="form-tabs" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'sso' ? 'active' : ''}`}
            onClick={() => { setActiveTab('sso'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '10px 0' }}
          >
            🔑 SSO Login
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '10px 0' }}
          >
            ⚙️ Admin Login
          </button>
        </div>

        {(errorMsg || ssoError) && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid rgb(239, 68, 68)',
            color: 'rgb(220, 38, 38)',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            marginBottom: '16px'
          }}>
            {errorMsg || ssoError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'sso' ? (
            /* SSO Login Form */
            <div style={{ textAlign: 'center', padding: '12px 0 20px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                เข้าสู่ระบบอย่างปลอดภัยโดยใช้บัญชีร่วมขององค์กรผ่าน Authentik
              </p>
              <button
                type="button"
                onClick={() => {
                  if (setSsoError) setSsoError(null);
                  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                  window.location.href = `${apiBaseUrl}/auth/sso/redirect`;
                }}
                className="button-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                🔑 เข้าสู่ระบบด้วย Authentik
              </button>
            </div>
          ) : (
            /* Admin Login Form */
            <div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>ชื่อผู้ใช้งาน *</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  className="filter-input-element"
                  style={{ width: '100%', padding: '10px' }}
                  required={activeTab === 'admin'}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>รหัสผ่าน *</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="filter-input-element"
                  style={{ width: '100%', padding: '10px' }}
                  required={activeTab === 'admin'}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  ข้อมูลผู้ดูแลเริ่มต้น: <code>admin</code> / <code>admin1234</code>
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              className="button-primary"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                padding: '12px'
              }}
            >
              ยกเลิก
            </button>
            {activeTab === 'admin' && (
              <button
                type="submit"
                disabled={loading}
                className="button-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
