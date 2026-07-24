import useChangePassword from '../hooks/useChangePassword';

export default function ChangePasswordModal({ onClose }) {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    errorMsg,
    successMsg,
    loading,
    handleSubmit
  } = useChangePassword({ onClose });

  return (
    <div className="modal-backdrop" style={{ backdropFilter: 'blur(8px)', zIndex: 1200 }}>
      <div className="modal-content-card" style={{ maxWidth: '400px', padding: '28px', borderRadius: '16px' }}>
        <div className="modal-header-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 auto 0 0' }}>🔑 เปลี่ยนรหัสผ่าน Admin</h2>
          <button className="close-btn" onClick={onClose} type="button" style={{ fontSize: '1.5rem' }}>&times;</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', marginBottom: '20px' }}>
          กำหนดรหัสผ่านใหม่สำหรับเข้าใช้งานระบบด้วยบัญชีแอดมินท้องถิ่น
        </p>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid rgb(239, 68, 68)',
            color: 'rgb(220, 38, 38)',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderLeft: '4px solid rgb(16, 185, 129)',
            color: 'rgb(5, 150, 105)',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>รหัสผ่านปัจจุบัน *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านปัจจุบัน..."
              className="filter-input-element"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>รหัสผ่านใหม่ *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="อย่างน้อย 4 ตัวอักษร..."
              className="filter-input-element"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>ยืนยันรหัสผ่านใหม่ *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง..."
              className="filter-input-element"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="button-primary"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                padding: '11px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px',
                backgroundColor: 'var(--theme-color, #4f46e5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
