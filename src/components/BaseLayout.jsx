// layout.jsx - โครงสร้างจัดหน้าแบบคลีน มีความยืดหยุ่นสูงรองรับ Responsive


export default function BaseLayout({ children, sidebar, header, activeLayout = 'sidebar', config = {} }) {
  // สไตล์ไดนามิกสำหรับระยะขอบและความโค้งมน
  const layoutStyles = {
    '--border-radius': config.borderRadius || '12px',
    '--primary-color': config.themeColor || '#4f46e5',
    '--element-gap': config.elementGap || '16px',
  };

  if (activeLayout === 'bento') {
    return (
      <div style={layoutStyles} className="bento-container">
        <header className="layout-header">{header}</header>
        <main className="bento-grid-wrapper">
          {children}
        </main>
      </div>
    );
  }

  if (activeLayout === 'centered') {
    return (
      <div style={layoutStyles} className="centered-container">
        <header className="layout-header">{header}</header>
        <main className="centered-main-content">
          {children}
        </main>
      </div>
    );
  }

  // รูปแบบเริ่มต้น: Sidebar Layout
  return (
    <div style={layoutStyles} className="sidebar-layout-container">
      <aside className="layout-sidebar">
        {sidebar}
      </aside>
      <div className="layout-main-area">
        <header className="layout-header">{header}</header>
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
