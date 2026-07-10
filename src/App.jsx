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
import AdminLoginPage from './features/Auth/components/AdminLoginPage';
import ChangePasswordModal from './features/Auth/components/ChangePasswordModal';

import Sidebar from './features/Layout/components/Sidebar';
import Header from './features/Layout/components/Header';
import MobileMenu from './features/Layout/components/MobileMenu';

import useAppLayout from './hooks/useAppLayout';
import useInventory from './store/useInventory';

export default function App() {
  const [activeCustodianAsset, setActiveCustodianAsset] = useState(null);
  const [isCustodianModalOpen, setIsCustodianModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

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
    isTechnician,
    logout,
    handleLoginSuccess,
    ssoError,
    setSsoError
  } = useInventory();

  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname === '/admin' || window.location.pathname === '/admin/';
  });

  useEffect(() => {
    if (isAdminRoute && currentUser?.role === 'ADMIN') {
      setIsAdminRoute(false);
      window.history.replaceState({}, document.title, '/');
      changeLayout('settings');
    }
  }, [isAdminRoute, currentUser, changeLayout]);

  const handleAppLoginSuccess = (user, token) => {
    handleLoginSuccess(user, token);
    setIsAdminRoute(false);
  };


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

  const handleLogout = () => {
    logout();
    changeLayout('centered');
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
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!isTechnician && !isSystemAdmin) {
      alert('เฉพาะผู้ใช้งานระดับช่างเทคนิค (Technician) หรือผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถรับงานซ่อมได้');
      return;
    }
    handleStartRepairJob(requestId);
  };

  const handleGuardedRejectRepairJob = (requestId, reason) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!isTechnician && !isSystemAdmin) {
      alert('เฉพาะผู้ใช้งานระดับช่างเทคนิค (Technician) หรือผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถปฏิเสธงานซ่อมได้');
      return;
    }
    handleRejectRepairJob(requestId, reason);
  };

  const handleGuardedCompleteRepairJob = (requestId, cost, contractor, approvalDate, documentNumber, notes, listRepairsItem) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!isTechnician && !isSystemAdmin) {
      alert('เฉพาะผู้ใช้งานระดับช่างเทคนิค (Technician) หรือผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถบันทึกซ่อมเสร็จได้');
      return;
    }
    handleCompleteRepairJob(requestId, cost, contractor, approvalDate, documentNumber, notes, listRepairsItem);
  };

  const handleGuardedClearAuditLogs = () => {
    if (!isSystemAdmin) {
      alert('เฉพาะผู้ใช้งานระดับ Admin เท่านั้นที่สามารถล้างประวัติระบบได้');
      return;
    }
    handleClearAuditLogs();
  };

  // --- Sub-components / Props ---

  // --- Sub-components / Props ---

  // 1. Sidebar Content
  const sidebarContent = (
    <Sidebar
      activeLayout={activeLayout}
      isSystemAdmin={isSystemAdmin}
      currentUser={currentUser}
      handleMenuClick={handleMenuClick}
      setIsChangePasswordOpen={setIsChangePasswordOpen}
      handleLogout={handleLogout}
      setIsLoginModalOpen={setIsLoginModalOpen}
      handleOpenAddForm={handleOpenAddForm}
    />
  );

  // 2. Header Content
  const headerContent = (
    <Header
      activeLayout={activeLayout}
      isSystemAdmin={isSystemAdmin}
      changeLayout={changeLayout}
      handleMenuClick={handleMenuClick}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      fontScale={fontScale}
      adjustFontScale={adjustFontScale}
      toggleTheme={toggleTheme}
      isDarkMode={isDarkMode}
    />
  );

  if (isAdminRoute) {
    return <AdminLoginPage onLoginSuccess={handleAppLoginSuccess} />;
  }

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
          onLoginSuccess={handleAppLoginSuccess}
          ssoError={ssoError}
          setSsoError={setSsoError}
        />
      )}

      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
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
          currentUser={currentUser}
          custodians={custodians}
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
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeLayout={activeLayout}
        isSystemAdmin={isSystemAdmin}
        handleMenuClick={handleMenuClick}
        currentUser={currentUser}
        setIsChangePasswordOpen={setIsChangePasswordOpen}
        handleLogout={handleLogout}
        setIsLoginModalOpen={setIsLoginModalOpen}
        handleOpenAddForm={handleOpenAddForm}
      />
    </>
  );
}
