import useAdminLogin from '../hooks/useAdminLogin';

export default function AdminLoginPage({ onLoginSuccess }) {
  const {
    username,
    setUsername,
    password,
    setPassword,
    errorMsg,
    loading,
    handleSubmit,
    handleBackToHome
  } = useAdminLogin({ onLoginSuccess });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 30% 20%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#f8fafc',
      zIndex: 2000,
      overflow: 'hidden'
    }}>
      {/* Decorative ambient light circles */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        top: '-10%',
        left: '20%',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        bottom: '10%',
        right: '15%',
        borderRadius: '50%',
        background: 'rgba(236, 72, 153, 0.1)',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        margin: '20px',
        padding: '40px',
        borderRadius: '24px',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        animation: 'cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        position: 'relative'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes cardEnter {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .admin-input::placeholder {
            color: #64748b;
          }
          .admin-input:focus {
            outline: none;
            border-color: #6366f1 !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25) !important;
          }
          .admin-btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            transition: all 0.2s ease-in-out;
            cursor: pointer;
          }
          .admin-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5);
            background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
          }
          .admin-btn-primary:active {
            transform: translateY(0);
          }
          .admin-btn-link {
            color: #94a3b8;
            transition: color 0.2s;
            cursor: pointer;
            text-decoration: none;
            background: none;
            border: none;
            font-size: 0.875rem;
          }
          .admin-btn-link:hover {
            color: #f1f5f9;
          }
        `}} />

        {/* Shield/Key Icon & Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            fontSize: '2rem',
            marginBottom: '16px'
          }}>
            🛡️
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 8px 0' }}>
            ผู้ดูแลระบบ
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ (Admin)
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚠️ <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้งาน..."
              className="admin-input"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '1rem',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="admin-input"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '1rem',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'admin-spin 0.8s linear infinite'
                }} />
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes admin-spin { to { transform: rotate(360deg); } }
                `}} />
                กำลังเข้าระบบ...
              </>
            ) : (
              'เข้าสู่ระบบแอดมิน'
            )}
          </button>
        </form>

        {/* Action link */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button
            type="button"
            className="admin-btn-link"
            onClick={handleBackToHome}
          >
            ← กลับไปหน้าสืบค้นหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
