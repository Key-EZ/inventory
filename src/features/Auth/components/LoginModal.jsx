import { useEffect, useCallback } from 'react';

export default function LoginModal({
  onClose,
  onLoginSuccess,
  ssoError,
  setSsoError
}) {
  // Clear any existing SSO error when opening modal
  useEffect(() => {
    return () => {
      if (setSsoError) setSsoError(null);
    };
  }, [setSsoError]);

  const handleSsoRedirect = useCallback(() => {
    if (setSsoError) setSsoError(null);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : 'http://localhost:5000/api');
    window.location.href = `${apiBaseUrl}/auth/sso/redirect`;
  }, [setSsoError]);

  return (
    <div className="modal-backdrop" style={{ backdropFilter: 'blur(8px)', zIndex: 1100 }}>
      <div className="modal-content-card" style={{ maxWidth: '420px', padding: '28px', borderRadius: '16px' }}>
        <div className="modal-header-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 0 0' }}>เข้าสู่ระบบ</h2>
          <button className="close-btn" onClick={onClose} type="button" style={{ fontSize: '1.5rem' }}>&times;</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px', marginBottom: '24px' }}>
          กรุณาเข้าสู่ระบบด้วยบัญชีร่วมขององค์กรเพื่อใช้งานระบบ
        </p>

        {ssoError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid rgb(239, 68, 68)',
            color: 'rgb(220, 38, 38)',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            marginBottom: '20px',
            lineHeight: '1.5'
          }}>
            ⚠️ {ssoError}
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
          <button
            type="button"
            onClick={handleSsoRedirect}
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
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            🔑 เข้าสู่ระบบด้วย Authentik (SSO)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="button-primary"
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
