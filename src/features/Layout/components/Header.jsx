export default function Header({
  activeLayout,
  isSystemAdmin,
  changeLayout,
  handleMenuClick,
  setIsMobileMenuOpen,
  fontScale,
  adjustFontScale,
  toggleTheme,
  isDarkMode
}) {
  const layoutTitles = {
    'sidebar': 'ทะเบียนครุภัณฑ์',
    'bento': 'Dashboard',
    'centered': 'ค้นหา',
    'settings': 'ตั้งค่าระบบครุภัณฑ์',
    'repair_jobs': 'งานซ่อมอุปกรณ์',
    'audit_log': 'ประวัติระบบ (Audit Log)'
  };

  return (
    <>
      <div className="header-title">
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
          title="เปิดเมนู"
        >
          ☰
        </button>
        <span>🏢</span>
        <span>{layoutTitles[activeLayout]}</span>
      </div>

      <div className="header-actions">
        {/* Layout Selector */}
        <div className="layout-toggle-group">
          <button
            className={`layout-toggle-btn ${activeLayout === 'sidebar' ? 'active' : ''}`}
            onClick={() => changeLayout('sidebar')}
            title="Sidebar Table View"
          >
            ทะเบียนครุภัณฑ์
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'bento' ? 'active' : ''}`}
            onClick={() => changeLayout('bento')}
            title="Bento Analytics Dashboard"
          >
            Dashboard
          </button>

          <button
            className={`layout-toggle-btn ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
            onClick={() => changeLayout('repair_jobs')}
            title="งานซ่อมอุปกรณ์"
          >
            งานซ่อม
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'centered' ? 'active' : ''}`}
            onClick={() => changeLayout('centered')}
            title="Centered Search Page"
          >
            ค้นหา
          </button>
          {isSystemAdmin && (
            <>
              <button
                className={`layout-toggle-btn ${activeLayout === 'settings' ? 'active' : ''}`}
                onClick={() => handleMenuClick('settings')}
                title="Settings Panel"
              >
                ตั้งค่า
              </button>
              <button
                className={`layout-toggle-btn ${activeLayout === 'audit_log' ? 'active' : ''}`}
                onClick={() => handleMenuClick('audit_log')}
                title="Audit Log"
              >
                ประวัติระบบ
              </button>
            </>
          )}
        </div>

        {/* Font Scaling Buttons */}
        <div className="font-scale-group" style={{ display: 'flex', gap: '4px', marginRight: '12px', alignItems: 'center' }}>
          <button
            type="button"
            className={`layout-toggle-btn ${fontScale === 'small' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.8rem', minWidth: '32px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => adjustFontScale('small')}
            title="ลดขนาดตัวอักษร"
          >
            A-
          </button>
          <button
            type="button"
            className={`layout-toggle-btn ${fontScale === 'normal' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.85rem', fontWeight: 'bold', minWidth: '32px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => adjustFontScale('normal')}
            title="ขนาดตัวอักษรปกติ"
          >
            A
          </button>
          <button
            type="button"
            className={`layout-toggle-btn ${fontScale === 'large' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.95rem', minWidth: '32px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => adjustFontScale('large')}
            title="เพิ่มขนาดตัวอักษร"
          >
            A+
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDarkMode ? 'เปิดโหมดกลางวัน (Light Mode)' : 'เปิดโหมดกลางคืน (Dark Mode)'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </>
  );
}
