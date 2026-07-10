export default function MobileMenu({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeLayout,
  isSystemAdmin,
  handleMenuClick,
  currentUser,
  setIsChangePasswordOpen,
  handleLogout,
  setIsLoginModalOpen,
  handleOpenAddForm
}) {
  if (!isMobileMenuOpen) return null;

  return (
    <>
      <div className="mobile-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`mobile-sidebar-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="sidebar-brand">
            <span>📦</span>
            <strong>เมนูระบบครุภัณฑ์</strong>
          </div>
          <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-menu-item ${activeLayout === 'sidebar' ? 'active' : ''}`}
            onClick={() => { setIsMobileMenuOpen(false); handleMenuClick('sidebar'); }}
          >
            📋 ทะเบียนครุภัณฑ์
          </li>
          <li
            className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
            onClick={() => { setIsMobileMenuOpen(false); handleMenuClick('bento'); }}
          >
            📊 Dashboard
          </li>
          <li
            className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
            onClick={() => { setIsMobileMenuOpen(false); handleMenuClick('centered'); }}
          >
            🔍 ค้นหา
          </li>

          <li
            className={`sidebar-menu-item ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
            onClick={() => { setIsMobileMenuOpen(false); handleMenuClick('repair_jobs'); }}
          >
            🛠️ งานซ่อมอุปกรณ์
          </li>
          {isSystemAdmin && (
            <li
              className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
              onClick={() => { setIsMobileMenuOpen(false); handleMenuClick('settings'); }}
            >
              ⚙️ ตั้งค่าระบบ
            </li>
          )}
          <li
            className={`sidebar-menu-item ${activeLayout === 'audit_log' ? 'active' : ''}`}
            onClick={() => { setIsMobileMenuOpen(false); handleMenuClick('audit_log'); }}
          >
            📜 ประวัติระบบ (Audit Log)
          </li>

          <div className="sidebar-menu-divider"></div>

          {/* Mobile Auth */}
          {currentUser ? (
            <>
              <li className="sidebar-menu-item" style={{ cursor: 'default', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                👤 {currentUser.name}
              </li>
               {currentUser.name === 'admin' && (
                <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); setIsChangePasswordOpen(true); }} style={{ color: '#eab308' }}>
                  🔑 เปลี่ยนรหัสผ่าน Admin
                </li>
              )}
              <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} style={{ color: 'rgb(220, 38, 38)' }}>
                🔓 ออกจากระบบ
              </li>
            </>
          ) : (
            <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} style={{ color: '#4f46e5', fontWeight: 'bold' }}>
              🔒 เข้าสู่ระบบ Admin/SSO
            </li>
          )}
        </ul>

        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <div>v1.0.0 (React JS)</div>
        </div>
      </div>
    </>
  );
}
