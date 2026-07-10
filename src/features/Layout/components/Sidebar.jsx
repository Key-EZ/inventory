export default function Sidebar({
  activeLayout,
  isSystemAdmin,
  currentUser,
  handleMenuClick,
  setIsChangePasswordOpen,
  handleLogout,
  setIsLoginModalOpen,
  handleOpenAddForm
}) {
  return (
    <>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span>📦</span>
          <div>
            <strong>ทะเบียนครุภัณฑ์</strong>
            <div className="app-brand-subtitle">Asset Management</div>
          </div>
        </div>
      </div>

      <ul className="sidebar-menu">
        <li
          className={`sidebar-menu-item ${activeLayout === 'sidebar' ? 'active' : ''}`}
          onClick={() => handleMenuClick('sidebar')}
        >
          📋 ทะเบียนครุภัณฑ์
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
          onClick={() => handleMenuClick('bento')}
        >
          📊 Dashboard
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
          onClick={() => handleMenuClick('centered')}
        >
          🔍 ค้นหา
        </li>

        <li
          className={`sidebar-menu-item ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
          onClick={() => handleMenuClick('repair_jobs')}
        >
          🛠️ งานซ่อมอุปกรณ์
        </li>
        {isSystemAdmin && (
          <li
            className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
            onClick={() => handleMenuClick('settings')}
          >
            ⚙️ ตั้งค่าระบบ
          </li>
        )}
        <li
          className={`sidebar-menu-item ${activeLayout === 'audit_log' ? 'active' : ''}`}
          onClick={() => handleMenuClick('audit_log')}
        >
          📜 ประวัติระบบ (Audit Log)
        </li>

        <div className="sidebar-menu-divider"></div>

        {/* Authentication Menu Item */}
        {currentUser ? (
          <>
            <li className="sidebar-menu-item" style={{ cursor: 'default', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              👤 {currentUser.name} ({currentUser.role === 'ADMIN' ? 'Admin' : currentUser.role === 'TECHNICIAN' ? 'นายช่าง' : 'SSO'})
            </li>
            {currentUser.name === 'admin' && (
              <li className="sidebar-menu-item" onClick={() => setIsChangePasswordOpen(true)} style={{ color: '#eab308' }}>
                🔑 เปลี่ยนรหัสผ่าน Admin
              </li>
            )}
            <li className="sidebar-menu-item" onClick={handleLogout} style={{ color: 'rgb(220, 38, 38)' }}>
              🔓 ออกจากระบบ
            </li>
          </>
        ) : (
          <li className="sidebar-menu-item" onClick={() => setIsLoginModalOpen(true)} style={{ color: '#4f46e5', fontWeight: 'bold' }}>
            🔒 เข้าสู่ระบบ Admin/SSO
          </li>
        )}
      </ul>

      <div className="sidebar-footer">
        <div>v1.0.0 (React JS)</div>
        <div>ระบบจัดการทรัพย์สิน</div>
      </div>
    </>
  );
}
