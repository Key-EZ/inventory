import { useState, useEffect } from 'react';
import BaseLayout from './components/BaseLayout';
import AssetForm from './features/Assets/components/AssetForm';
import AssetTable from './features/Assets/components/AssetTable';
import CustodianHistoryModal from './features/Assets/components/CustodianHistoryModal';
import AssetDashboard from './features/Dashboard/components/AssetDashboard';
import CenteredLanding from './features/Dashboard/components/CenteredLanding';
import SettingsPanel from './features/Settings/components/SettingsPanel';
import InventoryPrint from './features/Assets/components/InventoryPrint';
import GetRepair from './features/Repairs/components/GetRepair';
import RepairJobs from './features/Repairs/components/RepairJobs';
import AuditLogPanel from './features/AuditLogs/components/AuditLogPanel';
import RepairRequestPrint from './features/Repairs/components/RepairRequestPrint';
import LoginModal from './features/Auth/components/LoginModal';

import useAppLayout from './hooks/useAppLayout';
import useInventory from './store/useInventory';

export default function App() {
  const [activeCustodianAsset, setActiveCustodianAsset] = useState(null);
  const [isCustodianModalOpen, setIsCustodianModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const {
    activeLayout,
    isDarkMode,
    isFormOpen,
    editingAsset,
    printingAsset,
    printingRepairRequest,
    setPrintingRepairRequest,
    searchQueryFromLanding,
    isMobileMenuOpen,
    selectedAssetForRepair,
    isRepairFormOpen,
    repairActiveTab,
    setIsMobileMenuOpen,
    toggleTheme,
    changeLayout,
    openAddForm,
    openEditForm,
    closeForm,
    openRepairForm,
    closeRepairForm,
    openPrintAsset,
    closePrintAsset,
    navigateFromLanding,
    fontScale,
    adjustFontScale
  } = useAppLayout();

  const {
    assets,
    divisions,
    departments,
    custodians,
    positions,
    brands,
    locations,
    landingBadgeText,
    landBuildingCategories,
    equipmentCategories,
    categoryDepreciationYears,
    agencies,
    auditLogs,
    repairRequests,
    handleClearAuditLogs,
    handleSaveLandingBadge,
    handleSubmitForm,
    handleDeleteAsset,
    handleCreateRepairRequest,
    handleStartRepairJob,
    handleRejectRepairJob,
    handleCompleteRepairJob,
    handleAddCustodian,
    handleEditCustodian,
    handleDeleteCustodian,
    handleAddDivision,
    handleEditDivision,
    handleDeleteDivision,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    handleAddPosition,
    handleEditPosition,
    handleDeletePosition,
    handleAddBrand,
    handleEditBrand,
    handleDeleteBrand,
    handleAddLocation,
    handleEditLocation,
    handleDeleteLocation,
    handleAddLandCategory,
    handleEditLandCategory,
    handleDeleteLandCategory,
    handleAddEquipmentCategory,
    handleEditEquipmentCategory,
    handleDeleteEquipmentCategory,
    handleAddAgency,
    handleEditAgency,
    handleDeleteAgency,
    sellers,
    handleAddSeller,
    handleEditSeller,
    handleDeleteSeller,
    importAssetsData,
    currentUser,
    isAdmin,
    isSystemAdmin,
    logout,
    handleLoginSuccess,
    ssoError,
    setSsoError
  } = useInventory();

  // --- Auto-open Login Modal if SSO fails ---
  useEffect(() => {
    if (ssoError) {
      setIsLoginModalOpen(true);
    }
  }, [ssoError]);

  // --- Auth Guards ---
  const handleMenuClick = (layout) => {
    if (layout === 'settings' && !isSystemAdmin) {
      alert('เฉพาะผู้ใช้งานระดับ Admin เท่านั้นที่สามารถเข้าใช้งานเมนูนี้ได้');
      setIsLoginModalOpen(true);
      return;
    }
    if ((layout === 'audit_log' || layout === 'repair_jobs') && !isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    changeLayout(layout);
  };

  const handleOpenAddForm = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    openAddForm();
  };

  const handleOpenEditForm = (asset) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    openEditForm(asset);
  };

  const handleOpenRepairForm = (asset, tab) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    openRepairForm(asset, tab);
  };

  const handleOpenCustodianModal = (item) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setActiveCustodianAsset(item);
    setIsCustodianModalOpen(true);
  };

  const handleGuardedDeleteAsset = (id) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    handleDeleteAsset(id);
  };


  const handleGuardedStartRepairJob = (requestId) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    handleStartRepairJob(requestId);
  };

  const handleGuardedRejectRepairJob = (requestId, reason) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    handleRejectRepairJob(requestId, reason);
  };

  const handleGuardedCompleteRepairJob = (requestId, cost, contractor, approvalDate, documentNumber, notes) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    handleCompleteRepairJob(requestId, cost, contractor, approvalDate, documentNumber, notes);
  };

  const handleGuardedClearAuditLogs = () => {
    if (!isSystemAdmin) {
      alert('เฉพาะผู้ใช้งานระดับ Admin เท่านั้นที่สามารถล้างประวัติระบบได้');
      return;
    }
    handleClearAuditLogs();
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
            <li className="sidebar-menu-item" onClick={logout} style={{ color: 'rgb(220, 38, 38)' }}>
              🔓 ออกจากระบบ
            </li>
          </>
        ) : (
          <li className="sidebar-menu-item" onClick={() => setIsLoginModalOpen(true)} style={{ color: '#4f46e5', fontWeight: 'bold' }}>
            🔒 เข้าสู่ระบบ Admin/SSO
          </li>
        )}

        <div className="sidebar-menu-divider"></div>

        <li className="sidebar-menu-item" onClick={handleOpenAddForm}>
          ➕ ลงทะเบียนครุภัณฑ์ใหม่
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
    'centered': 'ค้นหา',
    'settings': 'ตั้งค่าระบบครุภัณฑ์',
    'repair_jobs': 'งานซ่อมอุปกรณ์',
    'audit_log': 'ประวัติระบบ (Audit Log)'
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
              onDeleteAsset={handleGuardedDeleteAsset}
              onRepairAsset={handleOpenRepairForm}
              onPrintAsset={openPrintAsset}
              onViewRepairHistory={(asset) => handleOpenRepairForm(asset, 'history')}
              onManageCustodian={handleOpenCustodianModal}
              initialSearchQuery={searchQueryFromLanding}
            />
          </div>
        )}

        {activeLayout === 'bento' && (
          <AssetDashboard
            assets={assets}
            onAddClick={handleOpenAddForm}
            onViewDetails={() => changeLayout('sidebar')}
          />
        )}

        {activeLayout === 'centered' && (
          <CenteredLanding
            assets={assets}
            onNavigate={navigateFromLanding}
            onAddClick={handleOpenAddForm}
            onEditAsset={handleOpenEditForm}
            landingBadgeText={landingBadgeText}
          />
        )}



        {activeLayout === 'settings' && (
          <SettingsPanel
            assets={assets}
            custodians={custodians}
            divisions={divisions}
            departments={departments}
            positions={positions}
            categoryDepreciationYears={categoryDepreciationYears}
            brands={brands}
            locations={locations}
            landingBadgeText={landingBadgeText}
            onSaveLandingBadge={handleSaveLandingBadge}
            landBuildingCategories={landBuildingCategories}
            equipmentCategories={equipmentCategories}
            onAddLandCategory={handleAddLandCategory}
            onEditLandCategory={handleEditLandCategory}
            onDeleteLandCategory={handleDeleteLandCategory}
            onAddEquipmentCategory={handleAddEquipmentCategory}
            onEditEquipmentCategory={handleEditEquipmentCategory}
            onDeleteEquipmentCategory={handleDeleteEquipmentCategory}
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
            agencies={agencies}
            onAddAgency={handleAddAgency}
            onEditAgency={handleEditAgency}
            onDeleteAgency={handleDeleteAgency}
            sellers={sellers}
            onAddSeller={handleAddSeller}
            onEditSeller={handleEditSeller}
            onDeleteSeller={handleDeleteSeller}
            onImportAssets={importAssetsData}
            categoryDepreciationYears={categoryDepreciationYears}
          />
        )}

        {activeLayout === 'repair_jobs' && (
          <RepairJobs
            assets={assets}
            repairRequests={repairRequests}
            onStartRepairJob={handleGuardedStartRepairJob}
            onRejectRepairJob={handleGuardedRejectRepairJob}
            onCompleteRepairJob={handleGuardedCompleteRepairJob}
          />
        )}

        {activeLayout === 'audit_log' && (
          <AuditLogPanel
            auditLogs={auditLogs}
            onClearLogs={handleGuardedClearAuditLogs}
            isSystemAdmin={isSystemAdmin}
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
          landBuildingCategories={landBuildingCategories}
          equipmentCategories={equipmentCategories}
          categoryDepreciationYears={categoryDepreciationYears}
          agencies={agencies}
          positions={positions}
          departments={departments}
          onSubmit={handleSubmitForm}
          onClose={closeForm}
          sellers={sellers}
          categoryDepreciationYears={categoryDepreciationYears}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => {
            setIsLoginModalOpen(false);
            if (ssoError) setSsoError(null);
          }}
          onLoginSuccess={handleLoginSuccess}
          custodians={custodians}
          ssoError={ssoError}
          setSsoError={setSsoError}
        />
      )}

      {isRepairFormOpen && (
        <GetRepair
          assets={assets}
          repairRequests={repairRequests}
          onCreateRepairRequest={handleCreateRepairRequest}
          preselectedAsset={selectedAssetForRepair}
          onClearPreselectedAsset={() => openRepairForm(null)}
          onClose={closeRepairForm}
          initialTab={repairActiveTab}
          onPrintRepairRequest={setPrintingRepairRequest}
        />
      )}

      {printingAsset && (
        <InventoryPrint
          asset={printingAsset}
          onClose={closePrintAsset}
        />
      )}

      {printingRepairRequest && (
        <RepairRequestPrint
          repairRequest={printingRepairRequest}
          asset={assets.find(a => a.id === printingRepairRequest.asset_id)}
          onClose={() => setPrintingRepairRequest(null)}
        />
      )}

      {isCustodianModalOpen && (
        <CustodianHistoryModal
          asset={activeCustodianAsset}
          custodians={custodians}
          agencies={agencies}
          positions={positions}
          onSubmit={(updatedAsset) => {
            handleSubmitForm(updatedAsset);
            setIsCustodianModalOpen(false);
          }}
          onClose={() => setIsCustodianModalOpen(false)}
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
                  <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); logout(); }} style={{ color: 'rgb(220, 38, 38)' }}>
                    🔓 ออกจากระบบ
                  </li>
                </>
              ) : (
                <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} style={{ color: '#4f46e5', fontWeight: 'bold' }}>
                  🔒 เข้าสู่ระบบ Admin/SSO
                </li>
              )}

              <div className="sidebar-menu-divider"></div>

              <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); handleOpenAddForm(); }}>
                ➕ ลงทะเบียนครุภัณฑ์ใหม่
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
