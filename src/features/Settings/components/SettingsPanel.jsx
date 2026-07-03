import { useState } from 'react';
import CustodiansTab from './tabs/CustodiansTab';
import OrgTab from './tabs/OrgTab';
import OptionsTab from './tabs/OptionsTab';
import LandingTab from './tabs/LandingTab';
import CategoriesTab from './tabs/CategoriesTab';
import RepairPrintTab from './tabs/RepairPrintTab';
import DataManagementTab from './tabs/DataManagementTab';

export default function SettingsPanel({
  assets,
  custodians,
  divisions,
  departments,
  positions = [],
  brands = [],
  locations = [],
  landingBadgeText,
  onSaveLandingBadge,
  landBuildingCategories = [],
  equipmentCategories = [],
  categoryDepreciationYears = {},
  onAddLandCategory,
  onEditLandCategory,
  onDeleteLandCategory,
  onAddEquipmentCategory,
  onEditEquipmentCategory,
  onDeleteEquipmentCategory,
  onAddCustodian,
  onEditCustodian,
  onDeleteCustodian,
  onAddDivision,
  onEditDivision,
  onDeleteDivision,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onAddPosition,
  onEditPosition,
  onDeletePosition,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  agencies = [],
  onAddAgency,
  onEditAgency,
  onDeleteAgency,
  sellers = [],
  onAddSeller,
  onEditSeller,
  onDeleteSeller,
  onImportAssets
}) {
  const [activeTab, setActiveTab] = useState('custodians'); // 'custodians', 'org', 'options'

  // Custodian Form Modal states
  const [isCustFormOpen, setIsCustFormOpen] = useState(false);
  const [editingCust, setEditingCust] = useState(null);

  const [custodianForm, setCustodianForm] = useState({
    name: '',
    position: '',
    division: '',
    department: '',
    email: '',
    role: 'CUSTODIAN'
  });

  const handleCustodianFormChange = (e) => {
    const { name, value } = e.target;
    setCustodianForm(prev => ({ ...prev, [name]: value }));
  };

  // --- Custodian Modal Controls ---
  const handleOpenAddCust = () => {
    setEditingCust(null);
    setCustodianForm({
      name: '',
      position: positions[0] || '',
      division: divisions[0] || '',
      department: departments[0] || '',
      email: '',
      role: 'CUSTODIAN'
    });
    setIsCustFormOpen(true);
  };

  const handleOpenEditCust = (cust) => {
    setEditingCust(cust);
    setCustodianForm({
      name: cust.name || '',
      position: cust.position || positions[0] || '',
      division: cust.division || divisions[0] || '',
      department: cust.department || departments[0] || '',
      email: cust.email || '',
      role: cust.role || 'CUSTODIAN'
    });
    setIsCustFormOpen(true);
  };

  const handleCloseCustForm = () => {
    setIsCustFormOpen(false);
    setEditingCust(null);
  };

  const handleSubmitCust = (e) => {
    e.preventDefault();
    if (!custodianForm.name) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    const payload = {
      id: editingCust?.id || `cust-${Date.now()}`,
      ...custodianForm
    };

    if (editingCust) {
      onEditCustodian(payload);
    } else {
      onAddCustodian(payload);
    }
    handleCloseCustForm();
  };

  // Safe checks for deletion (if in use)
  const handleDeleteCustCheck = (cust) => {
    const inUse = assets.some(asset => asset.usage?.custodian === cust.name);
    if (inUse) {
      alert(`ไม่สามารถลบผู้รับผิดชอบ "${cust.name}" ได้ เนื่องจากมีครุภัณฑ์ลงทะเบียนไว้ในชื่อบุคคลนี้`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบผู้รับผิดชอบ "${cust.name}" ใช่หรือไม่?`)) {
      onDeleteCustodian(cust.id);
    }
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="flex-center-between">
        <div>
          <h2>ตั้งค่าระบบครุภัณฑ์</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>จัดการข้อมูลผู้รับผิดชอบและหน่วยงาน กอง/ฝ่าย/แผนก ที่ใช้งานภายในระบบ</p>
        </div>
        {activeTab === 'custodians' && (
          <button className="button-primary" onClick={handleOpenAddCust}>
            ➕ เพิ่มผู้รับผิดชอบดูแล
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="form-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'custodians' ? 'active' : ''}`}
          onClick={() => setActiveTab('custodians')}
        >
          👤 ผู้รับผิดชอบดูแล ({custodians.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'org' ? 'active' : ''}`}
          onClick={() => setActiveTab('org')}
        >
          🏢 จัดการหน่วยงาน (กอง / ฝ่าย)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'options' ? 'active' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          ⚙️ จัดการตัวเลือก (ตำแหน่ง/ยี่ห้อ/สถานที่/ผู้ขาย)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'landing' ? 'active' : ''}`}
          onClick={() => setActiveTab('landing')}
        >
          🏷️ ป้ายชื่อหน้าแรก
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 หมวดหมู่ทรัพย์สิน
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'repair_print' ? 'active' : ''}`}
          onClick={() => setActiveTab('repair_print')}
        >
          🔧 ตั้งค่าการพิมพ์
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'data_management' ? 'active' : ''}`}
          onClick={() => setActiveTab('data_management')}
        >
          📂 นำเข้า/ส่งออกข้อมูล
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'custodians' && (
        <CustodiansTab
          custodians={custodians}
          onEdit={handleOpenEditCust}
          onDelete={handleDeleteCustCheck}
        />
      )}

      {activeTab === 'org' && (
        <OrgTab
          divisions={divisions}
          departments={departments}
          onAddDivision={onAddDivision}
          onEditDivision={onEditDivision}
          onDeleteDivision={onDeleteDivision}
          onAddDepartment={onAddDepartment}
          onEditDepartment={onEditDepartment}
          onDeleteDepartment={onDeleteDepartment}
        />
      )}

      {activeTab === 'options' && (
        <OptionsTab
          positions={positions}
          onAddPosition={onAddPosition}
          onEditPosition={onEditPosition}
          onDeletePosition={onDeletePosition}
          brands={brands}
          onAddBrand={onAddBrand}
          onEditBrand={onEditBrand}
          onDeleteBrand={onDeleteBrand}
          locations={locations}
          onAddLocation={onAddLocation}
          onEditLocation={onEditLocation}
          onDeleteLocation={onDeleteLocation}
          agencies={agencies}
          onAddAgency={onAddAgency}
          onEditAgency={onEditAgency}
          onDeleteAgency={onDeleteAgency}
          sellers={sellers}
          onAddSeller={onAddSeller}
          onEditSeller={onEditSeller}
          onDeleteSeller={onDeleteSeller}
        />
      )}

      {activeTab === 'landing' && (
        <LandingTab
          landingBadgeText={landingBadgeText}
          onSaveLandingBadge={onSaveLandingBadge}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab
          assets={assets}
          landBuildingCategories={landBuildingCategories}
          equipmentCategories={equipmentCategories}
          categoryDepreciationYears={categoryDepreciationYears}
          onAddLandCategory={onAddLandCategory}
          onEditLandCategory={onEditLandCategory}
          onDeleteLandCategory={onDeleteLandCategory}
          onAddEquipmentCategory={onAddEquipmentCategory}
          onEditEquipmentCategory={onEditEquipmentCategory}
          onDeleteEquipmentCategory={onDeleteEquipmentCategory}
        />
      )}

      {activeTab === 'repair_print' && (
        <RepairPrintTab />
      )}

      {activeTab === 'data_management' && (
        <DataManagementTab
          assets={assets}
          onImportAssets={onImportAssets}
        />
      )}

      {/* Custodian Add/Edit Modal */}
      {isCustFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header-section">
              <h2>{editingCust ? 'แก้ไขข้อมูลผู้รับผิดชอบดูแล' : 'เพิ่มผู้รับผิดชอบดูแล'}</h2>
              <button className="close-btn" onClick={handleCloseCustForm}>&times;</button>
            </div>

            <form onSubmit={handleSubmitCust} className="asset-form-body">
              <div className="form-group">
                <label>ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  name="name"
                  value={custodianForm.name}
                  onChange={handleCustodianFormChange}
                  placeholder="เช่น นายสมเกียรติ ใจซื่อ"
                  required
                />
              </div>

              <div className="form-group">
                <label>ตำแหน่ง *</label>
                {positions.length > 0 ? (
                  <select
                    name="position"
                    value={custodianForm.position}
                    onChange={handleCustodianFormChange}
                    required
                  >
                    <option value="">-- เลือกตำแหน่ง --</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                ) : (
                  <div className="read-only-box" style={{ color: 'var(--status-pending-text)' }}>
                    ⚠️ กรุณาไปเพิ่มตำแหน่งในหน้าการตั้งค่าก่อน
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>กอง / สำนัก *</label>
                  {divisions.length > 0 ? (
                    <select
                      name="division"
                      value={custodianForm.division}
                      onChange={handleCustodianFormChange}
                      required
                    >
                      {divisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="read-only-box" style={{ color: 'var(--status-pending-text)' }}>
                      ⚠️ กรุณาไปเพิ่มกองในเมนูการตั้งค่าก่อน
                    </div>
                  )}
                </div>

                <div className="form-group col">
                  <label>ฝ่าย / แผนก *</label>
                  {departments.length > 0 ? (
                    <select
                      name="department"
                      value={custodianForm.department}
                      onChange={handleCustodianFormChange}
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="read-only-box" style={{ color: 'var(--status-pending-text)' }}>
                      ⚠️ กรุณาไปเพิ่มฝ่ายในเมนูการตั้งค่าก่อน
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>e-mail (สำหรับเชื่อมโยงการ Login SSO ในอนาคต)</label>
                <input
                  type="email"
                  name="email"
                  value={custodianForm.email}
                  onChange={handleCustodianFormChange}
                  placeholder="เช่น somkiat.j@office.go.th"
                />
                <span className="field-hint">ระบบจะใช้ email ในการยืนยันสิทธิ์ Admin/Staff/User ผ่าน SSO</span>
              </div>

              <div className="form-group">
                <label>บทบาทผู้ใช้งาน (Role) *</label>
                <select
                  name="role"
                  value={custodianForm.role}
                  onChange={handleCustodianFormChange}
                  required
                >
                  <option value="CUSTODIAN">Custodian (ผู้รับผิดชอบดูแลพัสดุ)</option>
                  <option value="TECHNICIAN">Technician (นายช่าง/ช่างเทคนิค)</option>
                  <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                </select>
                <span className="field-hint">สิทธิ์ในการเข้าถึงฟังก์ชันต่างๆ ของระบบ</span>
              </div>

              <div className="form-actions-footer">
                <button className="btn-cancel" type="button" onClick={handleCloseCustForm}>ยกเลิก</button>
                <button
                  className="button-primary"
                  type="submit"
                  disabled={divisions.length === 0 || departments.length === 0}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
