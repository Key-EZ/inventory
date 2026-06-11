import React, { useState, useEffect } from 'react';
import BaseLayout from './components/BaseLayout';
import AssetForm from './components/AssetForm';
import AssetTable from './components/AssetTable';
import BentoDashboard from './components/BentoDashboard';
import CenteredLanding from './components/CenteredLanding';
import { getSeedAssets } from './utils/mockData';

export default function App() {
  // --- States ---
  const [assets, setAssets] = useState([]);
  const [activeLayout, setActiveLayout] = useState('centered'); // 'sidebar', 'bento', 'centered'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchQueryFromLanding, setSearchQueryFromLanding] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Initial Load ---
  useEffect(() => {
    // 1. Load assets
    const savedAssets = localStorage.getItem('inventory_assets');
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        console.error('Error parsing saved assets, seeding instead', e);
        const seed = getSeedAssets();
        setAssets(seed);
        localStorage.setItem('inventory_assets', JSON.stringify(seed));
      }
    } else {
      const seed = getSeedAssets();
      setAssets(seed);
      localStorage.setItem('inventory_assets', JSON.stringify(seed));
    }

    // 2. Load layout preference
    const savedLayout = localStorage.getItem('inventory_layout');
    if (savedLayout) {
      setActiveLayout(savedLayout);
    }

    // 3. Load theme preference
    const savedTheme = localStorage.getItem('inventory_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // --- Helpers ---
  const saveAssetsToStateAndStorage = (newAssetsList) => {
    setAssets(newAssetsList);
    localStorage.setItem('inventory_assets', JSON.stringify(newAssetsList));
  };

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('inventory_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('inventory_theme', 'light');
    }
  };

  const handleChangeLayout = (layout) => {
    setActiveLayout(layout);
    localStorage.setItem('inventory_layout', layout);
    setIsMobileMenuOpen(false);
  };

  // --- CRUD Operations ---
  const handleOpenAddForm = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (assetData) => {
    const index = assets.findIndex(a => a.id === assetData.id);
    let updatedAssets = [];

    if (index >= 0) {
      // Edit
      updatedAssets = [...assets];
      updatedAssets[index] = assetData;
    } else {
      // Add new
      updatedAssets = [assetData, ...assets];
    }

    saveAssetsToStateAndStorage(updatedAssets);
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id) => {
    const assetToDelete = assets.find(a => a.id === id);
    const assetName = assetToDelete?.general_info?.asset_name || 'ครุภัณฑ์นี้';

    if (window.confirm(`คุณต้องการลบข้อมูลครุภัณฑ์ "${assetName}" ใช่หรือไม่?`)) {
      const filtered = assets.filter(a => a.id !== id);
      saveAssetsToStateAndStorage(filtered);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดและดาวน์โหลดข้อมูลครุภัณฑ์ตัวอย่าง 8 รายการกลับมาใช่หรือไม่? (ข้อมูลเดิมของคุณจะถูกแทนที่)')) {
      const seed = getSeedAssets();
      saveAssetsToStateAndStorage(seed);
      alert('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว');
    }
  };

  // Navigation helper from Centered Landing
  const handleNavigateFromLanding = (layout, searchVal = '') => {
    if (searchVal) {
      setSearchQueryFromLanding(searchVal);
    } else {
      setSearchQueryFromLanding('');
    }
    handleChangeLayout(layout);
  };

  // --- Sub-components / Props ---

  // 1. Sidebar Content
  const sidebarContent = (
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
          onClick={() => handleChangeLayout('sidebar')}
        >
          📋 ทะเบียนครุภัณฑ์
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('bento')}
        >
          📊 Dashboard
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('centered')}
        >
          🔍 ค้นหา
        </li>

        <div className="sidebar-menu-divider"></div>

        <li className="sidebar-menu-item" onClick={handleOpenAddForm}>
          ➕ ลงทะเบียนครุภัณฑ์ใหม่
        </li>
        <li className="sidebar-menu-item" onClick={handleResetDemoData}>
          🔄 รีเซ็ตข้อมูลตัวอย่าง
        </li>
      </ul>

      <div className="sidebar-footer">
        <div>v1.0.0 (React JS)</div>
        <div>ระบบจัดการทรัพย์สิน</div>
      </div>
    </>
  );

  // 2. Header Content
  const layoutTitles = {
    'sidebar': 'ทะเบียนครุภัณฑ์',
    'bento': 'Dashboard',
    'centered': 'ค้นหา'
  };

  const headerContent = (
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
            onClick={() => handleChangeLayout('sidebar')}
            title="Sidebar Table View"
          >
            ทะเบียนครุภัณฑ์
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'bento' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('bento')}
            title="Bento Analytics Dashboard"
          >
            Dashboard
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'centered' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('centered')}
            title="Centered Search Page"
          >
            ค้นหา
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={handleToggleTheme}
          title={isDarkMode ? 'เปิดโหมดกลางวัน (Light Mode)' : 'เปิดโหมดกลางคืน (Dark Mode)'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <BaseLayout
        sidebar={sidebarContent}
        header={headerContent}
        activeLayout={activeLayout}
        config={{
          borderRadius: '12px',
          themeColor: '#4f46e5',
          elementGap: '16px'
        }}
      >
        {/* Render Layout Contents */}
        {activeLayout === 'sidebar' && (
          <div className="flex-column-gap">
            <div className="flex-center-between">
              <div>
                <h2>ทะเบียนครุภัณฑ์ทั้งหมด</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>บันทึกรายละเอียด รายการ ราคา วันที่ได้มา และค่าเสื่อมสะสม</p>
              </div>
              <button className="button-primary" onClick={handleOpenAddForm}>
                ➕ ลงทะเบียนครุภัณฑ์ใหม่
              </button>
            </div>
            <AssetTable
              assets={assets}
              onEditAsset={handleOpenEditForm}
              onDeleteAsset={handleDeleteAsset}
              initialSearchQuery={searchQueryFromLanding}
            />
          </div>
        )}

        {activeLayout === 'bento' && (
          <BentoDashboard
            assets={assets}
            onAddClick={handleOpenAddForm}
            onResetDemo={handleResetDemoData}
            onViewDetails={() => handleChangeLayout('sidebar')}
          />
        )}

        {activeLayout === 'centered' && (
          <CenteredLanding
            assets={assets}
            onNavigate={handleNavigateFromLanding}
            onAddClick={handleOpenAddForm}
            onEditAsset={handleOpenEditForm}
          />
        )}
      </BaseLayout>

      {/* Slide-over Drawer / Modal Form */}
      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          onSubmit={handleSubmitForm}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Mobile Drawer Navigation Sidebar */}
      {isMobileMenuOpen && (
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
                onClick={() => handleChangeLayout('sidebar')}
              >
                📋 ทะเบียนครุภัณฑ์
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('bento')}
              >
                📊 Dashboard
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('centered')}
              >
                🔍 ค้นหา
              </li>

              <div className="sidebar-menu-divider"></div>

              <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); handleOpenAddForm(); }}>
                ➕ ลงทะเบียนครุภัณฑ์ใหม่
              </li>
              <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); handleResetDemoData(); }}>
                🔄 รีเซ็ตข้อมูลตัวอย่าง
              </li>
            </ul>

            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
              <div>v1.0.0 (React JS)</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
