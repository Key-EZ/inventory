/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useState, useEffect } from 'react';
import BaseLayout from './components/BaseLayout';
import AssetForm from './components/AssetForm';
import AssetTable from './components/AssetTable';
import BentoDashboard from './components/BentoDashboard';
import CenteredLanding from './components/CenteredLanding';
import SettingsPanel from './components/SettingsPanel';
import ReportPanel from './components/ReportPanel';
import InventoryPrint from './components/InventoryPrint';
import { getSeedAssets, defaultDivisions, defaultDepartments, defaultCustodians, defaultPositions, defaultBrands, defaultLocations } from './utils/mockData';

export default function App() {
  // --- States ---
  const [assets, setAssets] = useState([]);
  const [activeLayout, setActiveLayout] = useState('centered'); // 'sidebar', 'bento', 'centered'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [printingAsset, setPrintingAsset] = useState(null);
  const [searchQueryFromLanding, setSearchQueryFromLanding] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- Settings States ---
  const [custodians, setCustodians] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);

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

    // 4. Load divisions
    const savedDivs = localStorage.getItem('inventory_divisions');
    if (savedDivs) {
      try {
        setDivisions(JSON.parse(savedDivs));
      } catch (e) {
        setDivisions(defaultDivisions);
      }
    } else {
      setDivisions(defaultDivisions);
      localStorage.setItem('inventory_divisions', JSON.stringify(defaultDivisions));
    }

    // 5. Load departments
    const savedDepts = localStorage.getItem('inventory_departments');
    if (savedDepts) {
      try {
        setDepartments(JSON.parse(savedDepts));
      } catch (e) {
        setDepartments(defaultDepartments);
      }
    } else {
      setDepartments(defaultDepartments);
      localStorage.setItem('inventory_departments', JSON.stringify(defaultDepartments));
    }

    // 6. Load custodians
    const savedCusts = localStorage.getItem('inventory_custodians');
    if (savedCusts) {
      try {
        setCustodians(JSON.parse(savedCusts));
      } catch (e) {
        setCustodians(defaultCustodians);
      }
    } else {
      setCustodians(defaultCustodians);
      localStorage.setItem('inventory_custodians', JSON.stringify(defaultCustodians));
    }

    // 7. Load positions
    const savedPositions = localStorage.getItem('inventory_positions');
    if (savedPositions) {
      try {
        setPositions(JSON.parse(savedPositions));
      } catch (e) {
        setPositions(defaultPositions);
      }
    } else {
      setPositions(defaultPositions);
      localStorage.setItem('inventory_positions', JSON.stringify(defaultPositions));
    }

    // 8. Load brands
    const savedBrands = localStorage.getItem('inventory_brands');
    if (savedBrands) {
      try {
        setBrands(JSON.parse(savedBrands));
      } catch (e) {
        setBrands(defaultBrands);
      }
    } else {
      setBrands(defaultBrands);
      localStorage.setItem('inventory_brands', JSON.stringify(defaultBrands));
    }

    // 9. Load locations
    const savedLocations = localStorage.getItem('inventory_locations');
    if (savedLocations) {
      try {
        setLocations(JSON.parse(savedLocations));
      } catch (e) {
        setLocations(defaultLocations);
      }
    } else {
      setLocations(defaultLocations);
      localStorage.setItem('inventory_locations', JSON.stringify(defaultLocations));
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
    let updatedAssets;

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
      saveDivisions(defaultDivisions);
      saveDepartments(defaultDepartments);
      saveCustodians(defaultCustodians);
      savePositions(defaultPositions);
      saveBrands(defaultBrands);
      saveLocations(defaultLocations);
      alert('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว');
    }
  };

  // --- Settings CRUD Helpers ---
  const saveDivisions = (list) => {
    setDivisions(list);
    localStorage.setItem('inventory_divisions', JSON.stringify(list));
  };

  const saveDepartments = (list) => {
    setDepartments(list);
    localStorage.setItem('inventory_departments', JSON.stringify(list));
  };

  const saveCustodians = (list) => {
    setCustodians(list);
    localStorage.setItem('inventory_custodians', JSON.stringify(list));
  };

  const savePositions = (list) => {
    setPositions(list);
    localStorage.setItem('inventory_positions', JSON.stringify(list));
  };

  const saveBrands = (list) => {
    setBrands(list);
    localStorage.setItem('inventory_brands', JSON.stringify(list));
  };

  const saveLocations = (list) => {
    setLocations(list);
    localStorage.setItem('inventory_locations', JSON.stringify(list));
  };

  const handleAddCustodian = (cust) => {
    saveCustodians([cust, ...custodians]);
  };

  const handleEditCustodian = (cust) => {
    const index = custodians.findIndex(c => c.id === cust.id);
    if (index >= 0) {
      const updated = [...custodians];
      updated[index] = cust;
      saveCustodians(updated);
    }
  };

  const handleDeleteCustodian = (id) => {
    saveCustodians(custodians.filter(c => c.id !== id));
  };

  const handleAddDivision = (div) => {
    saveDivisions([...divisions, div]);
  };

  const handleEditDivision = (oldDiv, newDiv) => {
    saveDivisions(divisions.map(d => d === oldDiv ? newDiv : d));
    // Sync custodians
    saveCustodians(custodians.map(c => c.division === oldDiv ? { ...c, division: newDiv } : c));
  };

  const handleDeleteDivision = (div) => {
    saveDivisions(divisions.filter(d => d !== div));
  };

  const handleAddDepartment = (dept) => {
    saveDepartments([...departments, dept]);
  };

  const handleEditDepartment = (oldDept, newDept) => {
    saveDepartments(departments.map(d => d === oldDept ? newDept : d));
    // Sync custodians
    saveCustodians(custodians.map(c => c.department === oldDept ? { ...c, department: newDept } : c));
  };

  const handleDeleteDepartment = (dept) => {
    saveDepartments(departments.filter(d => d !== dept));
  };

  const handleAddPosition = (pos) => {
    savePositions([...positions, pos]);
  };

  const handleEditPosition = (oldPos, newPos) => {
    savePositions(positions.map(p => p === oldPos ? newPos : p));
    // Sync custodians
    saveCustodians(custodians.map(c => c.position === oldPos ? { ...c, position: newPos } : c));
  };

  const handleDeletePosition = (pos) => {
    savePositions(positions.filter(p => p !== pos));
  };

  const handleAddBrand = (brnd) => {
    saveBrands([...brands, brnd]);
  };

  const handleEditBrand = (oldBrnd, newBrnd) => {
    saveBrands(brands.map(b => b === oldBrnd ? newBrnd : b));
    // Sync assets
    saveAssetsToStateAndStorage(assets.map(a => a.general_info?.brand === oldBrnd ? {
      ...a,
      general_info: { ...a.general_info, brand: newBrnd }
    } : a));
  };

  const handleDeleteBrand = (brnd) => {
    saveBrands(brands.filter(b => b !== brnd));
  };

  const handleAddLocation = (loc) => {
    saveLocations([...locations, loc]);
  };

  const handleEditLocation = (oldLoc, newLoc) => {
    saveLocations(locations.map(l => l === oldLoc ? newLoc : l));
    // Sync assets
    saveAssetsToStateAndStorage(assets.map(a => a.usage?.location === oldLoc ? {
      ...a,
      usage: { ...a.usage, location: newLoc }
    } : a));
  };

  const handleDeleteLocation = (loc) => {
    saveLocations(locations.filter(l => l !== loc));
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
        <li
          className={`sidebar-menu-item ${activeLayout === 'reports' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('reports')}
        >
          📈 รายงาน พ.ด.1-3
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('settings')}
        >
          ⚙️ ตั้งค่าระบบ
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
    'reports': 'รายงานสรุป พ.ด.1-3',
    'centered': 'ค้นหา',
    'settings': 'ตั้งค่าระบบครุภัณฑ์'
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
            className={`layout-toggle-btn ${activeLayout === 'reports' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('reports')}
            title="พ.ด. 1, พ.ด. 2, และ พ.ด. 3"
          >
            รายงาน
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'centered' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('centered')}
            title="Centered Search Page"
          >
            ค้นหา
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'settings' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('settings')}
            title="Settings Panel"
          >
            ตั้งค่า
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
              onPrintAsset={(item) => setPrintingAsset(item)}
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

        {activeLayout === 'reports' && (
          <ReportPanel
            assets={assets}
            custodians={custodians}
            locations={locations}
          />
        )}

        {activeLayout === 'settings' && (
          <SettingsPanel
            assets={assets}
            custodians={custodians}
            divisions={divisions}
            departments={departments}
            positions={positions}
            brands={brands}
            locations={locations}
            onAddCustodian={handleAddCustodian}
            onEditCustodian={handleEditCustodian}
            onDeleteCustodian={handleDeleteCustodian}
            onAddDivision={handleAddDivision}
            onEditDivision={handleEditDivision}
            onDeleteDivision={handleDeleteDivision}
            onAddDepartment={handleAddDepartment}
            onEditDepartment={handleEditDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            onAddPosition={handleAddPosition}
            onEditPosition={handleEditPosition}
            onDeletePosition={handleDeletePosition}
            onAddBrand={handleAddBrand}
            onEditBrand={handleEditBrand}
            onDeleteBrand={handleDeleteBrand}
            onAddLocation={handleAddLocation}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
          />
        )}
      </BaseLayout>

      {/* Slide-over Drawer / Modal Form */}
      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          custodians={custodians}
          brands={brands}
          locations={locations}
          onSubmit={handleSubmitForm}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {printingAsset && (
        <InventoryPrint
          asset={printingAsset}
          onClose={() => setPrintingAsset(null)}
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
              <li
                className={`sidebar-menu-item ${activeLayout === 'reports' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('reports')}
              >
                📈 รายงาน พ.ด.1-3
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('settings')}
              >
                ⚙️ ตั้งค่าระบบ
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
