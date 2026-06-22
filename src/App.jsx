import BaseLayout from './components/BaseLayout';
import AssetForm from './components/asset/AssetForm';
import AssetTable from './components/asset/AssetTable';
import BentoDashboard from './components/BentoDashboard';
import CenteredLanding from './components/CenteredLanding';
import SettingsPanel from './components/SettingsPanel';
import ReportPanel from './components/report/ReportPanel';
import InventoryPrint from './components/template/InventoryPrint';
import GetRepair from './components/repair/GetRepair';
import RepairJobs from './components/repair/RepairJobs';
import AuditLogPanel from './components/AuditLogPanel';
import RepairRequestPrint from './components/template/RepairRequestPrint';

import useAppLayout from './hooks/useAppLayout';
import useInventory from './hooks/useInventory';

export default function App() {
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
    agencies,
    auditLogs,
    repairRequests,
    handleClearAuditLogs,
    handleSaveLandingBadge,
    handleSubmitForm,
    handleDeleteAsset,
    handleResetDemoData,
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
    handleDeleteSeller
  } = useInventory();

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
          onClick={() => changeLayout('sidebar')}
        >
          📋 ทะเบียนครุภัณฑ์
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
          onClick={() => changeLayout('bento')}
        >
          📊 Dashboard
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
          onClick={() => changeLayout('centered')}
        >
          🔍 ค้นหา
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'reports' ? 'active' : ''}`}
          onClick={() => changeLayout('reports')}
        >
          📈 รายงาน พ.ด.1-3
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
          onClick={() => changeLayout('repair_jobs')}
        >
          🛠️ งานซ่อมอุปกรณ์
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
          onClick={() => changeLayout('settings')}
        >
          ⚙️ ตั้งค่าระบบ
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'audit_log' ? 'active' : ''}`}
          onClick={() => changeLayout('audit_log')}
        >
          📜 ประวัติระบบ (Audit Log)
        </li>

        <div className="sidebar-menu-divider"></div>

        <li className="sidebar-menu-item" onClick={openAddForm}>
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
            className={`layout-toggle-btn ${activeLayout === 'reports' ? 'active' : ''}`}
            onClick={() => changeLayout('reports')}
            title="พ.ด. 1, พ.ด. 2, และ พ.ด. 3"
          >
            รายงาน
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
          <button
            className={`layout-toggle-btn ${activeLayout === 'settings' ? 'active' : ''}`}
            onClick={() => changeLayout('settings')}
            title="Settings Panel"
          >
            ตั้งค่า
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'audit_log' ? 'active' : ''}`}
            onClick={() => changeLayout('audit_log')}
            title="Audit Log"
          >
            ประวัติระบบ
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
              <button className="button-primary" onClick={openAddForm}>
                ➕ ลงทะเบียนครุภัณฑ์ใหม่
              </button>
            </div>
            <AssetTable
              assets={assets}
              onEditAsset={openEditForm}
              onDeleteAsset={handleDeleteAsset}
              onRepairAsset={openRepairForm}
              onPrintAsset={openPrintAsset}
              onViewRepairHistory={(asset) => openRepairForm(asset, 'history')}
              initialSearchQuery={searchQueryFromLanding}
            />
          </div>
        )}

        {activeLayout === 'bento' && (
          <BentoDashboard
            assets={assets}
            onAddClick={openAddForm}
            onResetDemo={handleResetDemoData}
            onViewDetails={() => changeLayout('sidebar')}
          />
        )}

        {activeLayout === 'centered' && (
          <CenteredLanding
            assets={assets}
            onNavigate={navigateFromLanding}
            onAddClick={openAddForm}
            onEditAsset={openEditForm}
            landingBadgeText={landingBadgeText}
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
          />
        )}

        {activeLayout === 'repair_jobs' && (
          <RepairJobs
            assets={assets}
            repairRequests={repairRequests}
            onStartRepairJob={handleStartRepairJob}
            onRejectRepairJob={handleRejectRepairJob}
            onCompleteRepairJob={handleCompleteRepairJob}
          />
        )}

        {activeLayout === 'audit_log' && (
          <AuditLogPanel
            auditLogs={auditLogs}
            onClearLogs={handleClearAuditLogs}
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
          agencies={agencies}
          positions={positions}
          onSubmit={handleSubmitForm}
          onClose={closeForm}
          sellers={sellers}
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
                onClick={() => changeLayout('sidebar')}
              >
                📋 ทะเบียนครุภัณฑ์
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
                onClick={() => changeLayout('bento')}
              >
                📊 Dashboard
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
                onClick={() => changeLayout('centered')}
              >
                🔍 ค้นหา
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'reports' ? 'active' : ''}`}
                onClick={() => changeLayout('reports')}
              >
                📈 รายงาน พ.ด.1-3
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
                onClick={() => changeLayout('repair_jobs')}
              >
                🛠️ งานซ่อมอุปกรณ์
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
                onClick={() => changeLayout('settings')}
              >
                ⚙️ ตั้งค่าระบบ
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'audit_log' ? 'active' : ''}`}
                onClick={() => changeLayout('audit_log')}
              >
                📜 ประวัติระบบ (Audit Log)
              </li>

              <div className="sidebar-menu-divider"></div>

              <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); openAddForm(); }}>
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
