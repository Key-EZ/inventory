import { useState } from 'react';

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
  onDeleteAgency
}) {
  const [activeTab, setActiveTab] = useState('custodians'); // 'custodians', 'org', 'options'
  const [landingBadgeInput, setLandingBadgeInput] = useState(landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');
  const [newLandCatInput, setNewLandCatInput] = useState('');
  const [newEquipCatInput, setNewEquipCatInput] = useState('');
  const [newAgencyInput, setNewAgencyInput] = useState('');

  // Adjust input state when badge text prop changes during render
  const [prevLandingBadgeText, setPrevLandingBadgeText] = useState(landingBadgeText);
  if (landingBadgeText !== prevLandingBadgeText) {
    setPrevLandingBadgeText(landingBadgeText);
    setLandingBadgeInput(landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');
  }

  // Custodian Form Modal states
  const [isCustFormOpen, setIsCustFormOpen] = useState(false);
  const [editingCust, setEditingCust] = useState(null);

  const [custName, setCustName] = useState('');
  const [custPosition, setCustPosition] = useState('');
  const [custDivision, setCustDivision] = useState('');
  const [custDepartment, setCustDepartment] = useState('');
  const [custEmail, setCustEmail] = useState('');

  // Inline inputs for divisions/departments/positions/brands/locations
  const [newDivisionInput, setNewDivisionInput] = useState('');
  const [newDepartmentInput, setNewDepartmentInput] = useState('');
  const [newPositionInput, setNewPositionInput] = useState('');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [newLocationInput, setNewLocationInput] = useState('');

  // Settings for Repair Request Print Signatories
  const [agencyInput, setAgencyInput] = useState(() => localStorage.getItem('print_rr_agency') || 'เทศบาลตำบลเสาธงหิน');
  const [docNoInput, setDocNoInput] = useState(() => localStorage.getItem('print_rr_docNo') || 'ทบ. ๕๑๐๐๘/');
  const [subjectInput, setSubjectInput] = useState(() => localStorage.getItem('print_rr_subject') || 'ขออนุมัติซ่อมแซมครุภัณฑ์');

  const [reqName, setReqName] = useState(() => localStorage.getItem('print_rr_requesterName') || 'นายสมชาย ใจดี');
  const [reqPos, setReqPos] = useState(() => localStorage.getItem('print_rr_requesterPosition') || 'เจ้าหน้าที่พัสดุ');

  const [budgetAudName, setBudgetAudName] = useState(() => localStorage.getItem('print_rr_budgetAuditorName') || 'นางสาวจงดี มีทรัพย์');
  const [budgetAudPos, setBudgetAudPos] = useState(() => localStorage.getItem('print_rr_budgetAuditorPosition') || 'เจ้าหน้าที่การเงินและบัญชี');

  const [c1Name, setC1Name] = useState(() => localStorage.getItem('print_rr_comm1Name') || 'นายสมบูรณ์ ดีพร้อม');
  const [c1Pos, setC1Pos] = useState(() => localStorage.getItem('print_rr_comm1Position') || 'นายช่างโยธา');

  const [c2Name, setC2Name] = useState(() => localStorage.getItem('print_rr_comm2Name') || 'นายรักชาติ ยิ่งชีพ');
  const [c2Pos, setC2Pos] = useState(() => localStorage.getItem('print_rr_comm2Position') || 'เจ้าพนักงานธุรการ');

  const [c3Name, setC3Name] = useState(() => localStorage.getItem('print_rr_comm3Name') || 'นายวิทยา เก่งกาจ');
  const [c3Pos, setC3Pos] = useState(() => localStorage.getItem('print_rr_comm3Position') || 'เจ้าพนักงานพัสดุ');

  const [dirName, setDirName] = useState(() => localStorage.getItem('print_rr_directorName') || 'นายวิเชียร ยอดแก้ว');
  const [dirPos, setDirPos] = useState(() => localStorage.getItem('print_rr_directorPosition') || 'ผู้อำนวยการกองช่าง');

  const [clkName, setClkName] = useState(() => localStorage.getItem('print_rr_clerkName') || 'นายอดิศร วงศ์เจริญ');
  const [clkPos, setClkPos] = useState(() => localStorage.getItem('print_rr_clerkPosition') || 'ปลัดเทศบาลตำบลเสาธงหิน');

  const [mayorName, setMayorName] = useState(() => localStorage.getItem('print_rr_mayorName') || 'นายเกรียงไกร ไตรธรรม');
  const [mayorPos, setMayorPos] = useState(() => localStorage.getItem('print_rr_mayorPosition') || 'นายกเทศมนตรีตำบลเสาธงหิน');

  // --- Custodian Modal Controls ---
  const handleOpenAddCust = () => {
    setEditingCust(null);
    setCustName('');
    setCustPosition(positions[0] || '');
    setCustDivision(divisions[0] || '');
    setCustDepartment(departments[0] || '');
    setCustEmail('');
    setIsCustFormOpen(true);
  };

  const handleOpenEditCust = (cust) => {
    setEditingCust(cust);
    setCustName(cust.name || '');
    setCustPosition(cust.position || positions[0] || '');
    setCustDivision(cust.division || divisions[0] || '');
    setCustDepartment(cust.department || departments[0] || '');
    setCustEmail(cust.email || '');
    setIsCustFormOpen(true);
  };

  const handleCloseCustForm = () => {
    setIsCustFormOpen(false);
    setEditingCust(null);
  };

  const handleSaveRepairPrintSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('print_rr_agency', agencyInput);
    localStorage.setItem('print_rr_docNo', docNoInput);
    localStorage.setItem('print_rr_subject', subjectInput);
    localStorage.setItem('print_rr_requesterName', reqName);
    localStorage.setItem('print_rr_requesterPosition', reqPos);
    localStorage.setItem('print_rr_budgetAuditorName', budgetAudName);
    localStorage.setItem('print_rr_budgetAuditorPosition', budgetAudPos);
    localStorage.setItem('print_rr_comm1Name', c1Name);
    localStorage.setItem('print_rr_comm1Position', c1Pos);
    localStorage.setItem('print_rr_comm2Name', c2Name);
    localStorage.setItem('print_rr_comm2Position', c2Pos);
    localStorage.setItem('print_rr_comm3Name', c3Name);
    localStorage.setItem('print_rr_comm3Position', c3Pos);
    localStorage.setItem('print_rr_directorName', dirName);
    localStorage.setItem('print_rr_directorPosition', dirPos);
    localStorage.setItem('print_rr_clerkName', clkName);
    localStorage.setItem('print_rr_clerkPosition', clkPos);
    localStorage.setItem('print_rr_mayorName', mayorName);
    localStorage.setItem('print_rr_mayorPosition', mayorPos);
    alert('บันทึกการตั้งค่าข้อมูลใบแจ้งซ่อมสำเร็จ');
  };

  const handleSubmitCust = (e) => {
    e.preventDefault();
    if (!custName) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    const payload = {
      id: editingCust?.id || `cust-${Date.now()}`,
      name: custName,
      position: custPosition,
      division: custDivision,
      department: custDepartment,
      email: custEmail
    };

    if (editingCust) {
      onEditCustodian(payload);
    } else {
      onAddCustodian(payload);
    }
    handleCloseCustForm();
  };

  // --- Division & Department Handlers ---
  const handleAddDiv = (e) => {
    e.preventDefault();
    const val = newDivisionInput.trim();
    if (!val) return;
    if (divisions.includes(val)) {
      alert('มีชื่อกองนี้อยู่แล้วในระบบ');
      return;
    }
    onAddDivision(val);
    setNewDivisionInput('');
  };

  const handleAddDept = (e) => {
    e.preventDefault();
    const val = newDepartmentInput.trim();
    if (!val) return;
    if (departments.includes(val)) {
      alert('มีชื่อฝ่าย/แผนกนี้อยู่แล้วในระบบ');
      return;
    }
    onAddDepartment(val);
    setNewDepartmentInput('');
  };

  const handleEditDivPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อกอง/กองทุน:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (divisions.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อกองนี้อยู่แล้วในระบบ');
      return;
    }
    onEditDivision(oldVal, trimmed);
  };

  const handleEditDeptPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อฝ่าย/แผนก:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (departments.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อฝ่าย/แผนกนี้อยู่แล้วในระบบ');
      return;
    }
    onEditDepartment(oldVal, trimmed);
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

  const handleDeleteDivCheck = (divName) => {
    const inUse = custodians.some(cust => cust.division === divName);
    if (inUse) {
      alert(`ไม่สามารถลบกอง "${divName}" ได้ เนื่องจากมีบุคลากรในสังกัดกองนี้อยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบกอง "${divName}" ใช่หรือไม่?`)) {
      onDeleteDivision(divName);
    }
  };

  const handleDeleteDeptCheck = (deptName) => {
    const inUse = custodians.some(cust => cust.department === deptName);
    if (inUse) {
      alert(`ไม่สามารถลบฝ่าย/แผนก "${deptName}" ได้ เนื่องจากมีบุคลากรในสังกัดฝ่าย/แผนกนี้อยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบฝ่าย/แผนก "${deptName}" ใช่หรือไม่?`)) {
      onDeleteDepartment(deptName);
    }
  };

  // --- Dynamic Option CRUD Handlers ---
  const handleAddPos = (e) => {
    e.preventDefault();
    const val = newPositionInput.trim();
    if (!val) return;
    if (positions.includes(val)) {
      alert('มีชื่อตำแหน่งนี้อยู่แล้วในระบบ');
      return;
    }
    onAddPosition(val);
    setNewPositionInput('');
  };

  const handleAddBrnd = (e) => {
    e.preventDefault();
    const val = newBrandInput.trim();
    if (!val) return;
    if (brands.includes(val)) {
      alert('มีชื่อยี่ห้อนี้อยู่แล้วในระบบ');
      return;
    }
    onAddBrand(val);
    setNewBrandInput('');
  };

  const handleAddLoc = (e) => {
    e.preventDefault();
    const val = newLocationInput.trim();
    if (!val) return;
    if (locations.includes(val)) {
      alert('มีชื่อสถานที่ตั้งนี้อยู่แล้วในระบบ');
      return;
    }
    onAddLocation(val);
    setNewLocationInput('');
  };

  const handleEditPosPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อตำแหน่ง:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (positions.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อตำแหน่งนี้อยู่แล้วในระบบ');
      return;
    }
    onEditPosition(oldVal, trimmed);
  };

  const handleEditBrndPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อยี่ห้อ:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (brands.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อยี่ห้อนี้อยู่แล้วในระบบ');
      return;
    }
    onEditBrand(oldVal, trimmed);
  };

  const handleEditLocPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อสถานที่ตั้ง:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (locations.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อสถานที่ตั้งนี้อยู่แล้วในระบบ');
      return;
    }
    onEditLocation(oldVal, trimmed);
  };

  const handleDeletePositionCheck = (pos) => {
    const inUse = custodians.some(c => c.position === pos);
    if (inUse) {
      alert(`ไม่สามารถลบตำแหน่ง "${pos}" ได้ เนื่องจากมีบุคลากรใช้งานตำแหน่งนี้อยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบตำแหน่ง "${pos}" ใช่หรือไม่?`)) {
      onDeletePosition(pos);
    }
  };

  const handleDeleteBrandCheck = (brnd) => {
    const inUse = assets.some(a => a.general_info?.brand === brnd);
    if (inUse) {
      alert(`ไม่สามารถลบยี่ห้อ "${brnd}" ได้ เนื่องจากมีครุภัณฑ์ลงทะเบียนไว้ภายใต้ชื่อยี่ห้อนี้`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบยี่ห้อ "${brnd}" ใช่หรือไม่?`)) {
      onDeleteBrand(brnd);
    }
  };

  const handleDeleteLocCheck = (loc) => {
    const inUse = assets.some(a => a.usage?.location === loc);
    if (inUse) {
      alert(`ไม่สามารถลบสถานที่ตั้ง "${loc}" ได้ เนื่องจากมีครุภัณฑ์จัดตั้งอยู่ในสถานที่นี้`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบสถานที่ตั้ง "${loc}" ใช่หรือไม่?`)) {
      onDeleteLocation(loc);
    }
  };

  const handleAddAgency = (e) => {
    e.preventDefault();
    const val = newAgencyInput.trim();
    if (!val) return;
    if (agencies.includes(val)) {
      alert('มีชื่อส่วนราชการนี้อยู่แล้วในระบบ');
      return;
    }
    onAddAgency(val);
    setNewAgencyInput('');
  };

  const handleEditAgencyPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อส่วนราชการ:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (agencies.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อส่วนราชการนี้อยู่แล้วในระบบ');
      return;
    }
    onEditAgency(oldVal, trimmed);
  };

  const handleDeleteAgencyCheck = (agency) => {
    const inUse = assets.some(a =>
      a.budget_owner === agency ||
      (a.custodian_history && a.custodian_history.some(ch => ch.budget_owner === agency))
    );
    if (inUse) {
      alert(`ไม่สามารถลบชื่อส่วนราชการ "${agency}" ได้ เนื่องจากมีประวัติการดูแลหรือข้อมูลพัสดุใช้งานอยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบชื่อส่วนราชการ "${agency}" ใช่หรือไม่?`)) {
      onDeleteAgency(agency);
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
          ⚙️ จัดการตัวเลือก (ตำแหน่ง/ยี่ห้อ/สถานที่)
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
          🔧 ตั้งค่าใบแจ้งซ่อม
        </button>
      </div>

      {/* Tab 1: Custodians list */}
      {activeTab === 'custodians' && (
        <div className="layout-card table-data-card animate-fade-in">
          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ตำแหน่ง</th>
                  <th>กอง (Division)</th>
                  <th>ฝ่าย/แผนก (Department)</th>
                  <th>e-mail (SSO Link)</th>
                  <th className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {custodians.length > 0 ? (
                  custodians.map(cust => (
                    <tr key={cust.id} className="table-row-hover">
                      <td>
                        <span className="cust-row-name">{cust.name}</span>
                      </td>
                      <td>{cust.position || '-'}</td>
                      <td>{cust.division || '-'}</td>
                      <td>{cust.department || '-'}</td>
                      <td><code style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>{cust.email || '-'}</code></td>
                      <td className="text-center">
                        <div className="table-actions">
                          <button className="btn-table-edit" onClick={() => handleOpenEditCust(cust)}>
                            ✏️ แก้ไข
                          </button>
                          <button className="btn-table-delete" onClick={() => handleDeleteCustCheck(cust)}>
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-empty-row">
                      ไม่มีข้อมูลผู้รับผิดชอบดูแล (กรุณากดปุ่มเพิ่มด้านขวาบน)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Division & Department Management */}
      {activeTab === 'org' && (
        <div className="settings-split-grid animate-fade-in">
          {/* Bureau/Division Column */}
          <div className="layout-card">
            <h3>🏢 รายการกอง / สำนัก</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ใช้เลือกเป็นสังกัดหลักของผู้ดูแลครุภัณฑ์
            </p>

            <form onSubmit={handleAddDiv} className="settings-inline-add-form">
              <input
                type="text"
                value={newDivisionInput}
                onChange={(e) => setNewDivisionInput(e.target.value)}
                placeholder="เช่น กองช่าง, สำนักปลัด"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {divisions.length > 0 ? (
                divisions.map(divName => (
                  <div key={divName} className="settings-list-row">
                    <span className="settings-item-name">{divName}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditDivPrompt(divName)}>
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteDivCheck(divName)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลกอง</div>
              )}
            </div>
          </div>

          {/* Section/Department Column */}
          <div className="layout-card">
            <h3>📂 รายการฝ่าย / แผนก</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ใช้เลือกเป็นฝ่ายปฏิบัติการย่อยของผู้ดูแลครุภัณฑ์
            </p>

            <form onSubmit={handleAddDept} className="settings-inline-add-form">
              <input
                type="text"
                value={newDepartmentInput}
                onChange={(e) => setNewDepartmentInput(e.target.value)}
                placeholder="เช่น ฝ่ายพัฒนาระบบ, ฝ่ายธุรการ"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {departments.length > 0 ? (
                departments.map(deptName => (
                  <div key={deptName} className="settings-list-row">
                    <span className="settings-item-name">{deptName}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditDeptPrompt(deptName)}>
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteDeptCheck(deptName)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลฝ่าย/แผนก</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Dropdown Options Management */}
      {activeTab === 'options' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--element-gap)' }}>
          {/* Position Column */}
          <div className="layout-card">
            <h3>👤 รายการตำแหน่ง</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกตำแหน่งในข้อมูลผู้ดูแลครุภัณฑ์
            </p>

            <form onSubmit={handleAddPos} className="settings-inline-add-form">
              <input
                type="text"
                value={newPositionInput}
                onChange={(e) => setNewPositionInput(e.target.value)}
                placeholder="เช่น ผู้อำนวยการกอง, นักวิชาการ"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {positions.length > 0 ? (
                positions.map(pos => (
                  <div key={pos} className="settings-list-row">
                    <span className="settings-item-name">{pos}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditPosPrompt(pos)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeletePositionCheck(pos)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลตำแหน่ง</div>
              )}
            </div>
          </div>

          {/* Brand Column */}
          <div className="layout-card">
            <h3>🏷️ รายการยี่ห้อ</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกยี่ห้อในข้อมูลครุภัณฑ์
            </p>

            <form onSubmit={handleAddBrnd} className="settings-inline-add-form">
              <input
                type="text"
                value={newBrandInput}
                onChange={(e) => setNewBrandInput(e.target.value)}
                placeholder="เช่น Apple, Lenovo, Sony"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {brands.length > 0 ? (
                brands.map(brnd => (
                  <div key={brnd} className="settings-list-row">
                    <span className="settings-item-name">{brnd}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditBrndPrompt(brnd)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteBrandCheck(brnd)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลยี่ห้อ</div>
              )}
            </div>
          </div>

          {/* Location Column */}
          <div className="layout-card">
            <h3>📍 รายการสถานที่ตั้ง</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกสถานที่จัดวางในระบบครุภัณฑ์
            </p>

            <form onSubmit={handleAddLoc} className="settings-inline-add-form">
              <input
                type="text"
                value={newLocationInput}
                onChange={(e) => setNewLocationInput(e.target.value)}
                placeholder="เช่น ห้องประชุม 2, อาคารพัสดุ"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {locations.length > 0 ? (
                locations.map(loc => (
                  <div key={loc} className="settings-list-row">
                    <span className="settings-item-name">{loc}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditLocPrompt(loc)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteLocCheck(loc)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลสถานที่ตั้ง</div>
              )}
            </div>
          </div>

          {/* Government Agency Column */}
          <div className="layout-card">
            <h3>🏛️ รายการส่วนราชการ</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกส่วนราชการในการกำหนดผู้ใช้-ดูแล
            </p>

            <form onSubmit={handleAddAgency} className="settings-inline-add-form">
              <input
                type="text"
                value={newAgencyInput}
                onChange={(e) => setNewAgencyInput(e.target.value)}
                placeholder="เช่น กองช่าง, กองการศึกษา"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {agencies.length > 0 ? (
                agencies.map(agency => (
                  <div key={agency} className="settings-list-row">
                    <span className="settings-item-name">{agency}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditAgencyPrompt(agency)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteAgencyCheck(agency)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลส่วนราชการ</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Landing Badge Configuration */}
      {activeTab === 'landing' && (
        <div className="layout-card animate-fade-in" style={{ maxWidth: '600px' }}>
          <h3>🏷️ ตั้งค่าข้อความ</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            แก้ไขข้อความป้ายชื่อ (Badge) ที่แสดงอยู่ด้านบนสุดของหน้าแรก (Landing Page)
          </p>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ข้อความป้ายชื่อ *</label>
            <input
              type="text"
              value={landingBadgeInput}
              onChange={(e) => setLandingBadgeInput(e.target.value)}
              placeholder="เช่น ระบบดิจิทัลบริหารทรัพย์สิน"
              className="filter-input-element"
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <button
            onClick={() => {
              if (!landingBadgeInput.trim()) {
                alert('กรุณากรอกข้อความป้ายชื่อ');
                return;
              }
              onSaveLandingBadge(landingBadgeInput.trim());
              alert('บันทึกการตั้งค่าป้ายชื่อเรียบร้อยแล้ว');
            }}
            className="button-primary"
            style={{ padding: '10px 20px' }}
          >
            💾 บันทึกการตั้งค่า
          </button>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="settings-split-grid animate-fade-in">
          {/* Land Building Categories */}
          <div className="layout-card">
            <h3>📗 หมวดหมู่ พ.ด.1 (ที่ดิน/โรงเรือน)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              จัดการตัวเลือกหมวดหมู่ย่อยสำหรับที่ดินและสิ่งก่อสร้าง
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = newLandCatInput.trim();
                if (!val) return;
                if (landBuildingCategories.includes(val)) {
                  alert('มีหมวดหมู่นี้อยู่แล้วในระบบ');
                  return;
                }
                onAddLandCategory(val);
                setNewLandCatInput('');
              }}
              className="settings-inline-add-form"
            >
              <input
                type="text"
                value={newLandCatInput}
                onChange={(e) => setNewLandCatInput(e.target.value)}
                placeholder="เช่น อาคารโรงยิม, ลานจอดรถ"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {landBuildingCategories.length > 0 ? (
                landBuildingCategories.map(cat => (
                  <div key={cat} className="settings-list-row">
                    <span className="settings-item-name">{cat}</span>
                    <div className="settings-item-actions">
                      <button
                        className="btn-mini-action"
                        onClick={() => {
                          const newVal = prompt('แก้ไขชื่อหมวดหมู่ พ.ด.1:', cat);
                          if (newVal === null) return;
                          const trimmed = newVal.trim();
                          if (!trimmed) return;
                          if (landBuildingCategories.includes(trimmed) && trimmed !== cat) {
                            alert('มีชื่อหมวดหมู่นี้อยู่แล้วในระบบ');
                            return;
                          }
                          onEditLandCategory(cat, trimmed);
                        }}
                        type="button"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-mini-action btn-mini-delete"
                        onClick={() => {
                          const inUse = assets.some(a => a.category === cat && a.asset_type === 'LAND_BUILDING');
                          if (inUse) {
                            alert(`ไม่สามารถลบหมวดหมู่ "${cat}" ได้ เนื่องจากมีทรัพย์สินใช้งานอยู่`);
                            return;
                          }
                          if (window.confirm(`คุณแน่ใจว่าต้องการลบหมวดหมู่ "${cat}" ใช่หรือไม่?`)) {
                            onDeleteLandCategory(cat);
                          }
                        }}
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลหมวดหมู่</div>
              )}
            </div>
          </div>

          {/* Equipment Categories */}
          <div className="layout-card">
            <h3>📒 หมวดหมู่ พ.ด.2 (ครุภัณฑ์)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              จัดการตัวเลือกหมวดหมู่ย่อยสำหรับครุภัณฑ์และยานพาหนะ
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = newEquipCatInput.trim();
                if (!val) return;
                if (equipmentCategories.includes(val)) {
                  alert('มีหมวดหมู่นี้อยู่แล้วในระบบ');
                  return;
                }
                onAddEquipmentCategory(val);
                setNewEquipCatInput('');
              }}
              className="settings-inline-add-form"
            >
              <input
                type="text"
                value={newEquipCatInput}
                onChange={(e) => setNewEquipCatInput(e.target.value)}
                placeholder="เช่น ครุภัณฑ์งานสนาม, สินทรัพย์ดิจิทัล"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {equipmentCategories.length > 0 ? (
                equipmentCategories.map(cat => (
                  <div key={cat} className="settings-list-row">
                    <span className="settings-item-name">{cat}</span>
                    <div className="settings-item-actions">
                      <button
                        className="btn-mini-action"
                        onClick={() => {
                          const newVal = prompt('แก้ไขชื่อหมวดหมู่ พ.ด.2:', cat);
                          if (newVal === null) return;
                          const trimmed = newVal.trim();
                          if (!trimmed) return;
                          if (equipmentCategories.includes(trimmed) && trimmed !== cat) {
                            alert('มีชื่อหมวดหมู่นี้อยู่แล้วในระบบ');
                            return;
                          }
                          onEditEquipmentCategory(cat, trimmed);
                        }}
                        type="button"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-mini-action btn-mini-delete"
                        onClick={() => {
                          const inUse = assets.some(a => a.category === cat && a.asset_type === 'EQUIPMENT');
                          if (inUse) {
                            alert(`ไม่สามารถลบหมวดหมู่ "${cat}" ได้ เนื่องจากมีครุภัณฑ์ใช้งานอยู่`);
                            return;
                          }
                          if (window.confirm(`คุณแน่ใจว่าต้องการลบหมวดหมู่ "${cat}" ใช่หรือไม่?`)) {
                            onDeleteEquipmentCategory(cat);
                          }
                        }}
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลหมวดหมู่</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'repair_print' && (
        <form onSubmit={handleSaveRepairPrintSettings} className="layout-card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>🔧 การตั้งค่าลายมือชื่อและข้อมูลใบแจ้งซ่อม</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Group 1: General document meta */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>📝 ข้อมูลเอกสารทั่วไป</h4>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>ชื่อส่วนราชการ</label>
                <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={agencyInput} onChange={(e) => setAgencyInput(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>เลขที่หนังสือเริ่มต้น</label>
                <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={docNoInput} onChange={(e) => setDocNoInput(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>เรื่อง</label>
                <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} />
              </div>
            </div>

            {/* Group 2: Requester & Budget Auditor */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>🧑‍💼 ผู้เสนอเรื่อง & ตรวจงบประมาณ</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>ชื่อผู้เสนอ/แจ้งซ่อม</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={reqName} onChange={(e) => setReqName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={reqPos} onChange={(e) => setReqPos(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div className="form-group">
                  <label>ชื่อผู้ตรวจงบประมาณ</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={budgetAudName} onChange={(e) => setBudgetAudName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={budgetAudPos} onChange={(e) => setBudgetAudPos(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Group 3: Inspection Committee */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>📋 คณะกรรมการตรวจสภาพครุภัณฑ์ (3 ท่าน)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 1 (ประธานกรรมการ)</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={c1Name} onChange={(e) => setC1Name(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={c1Pos} onChange={(e) => setC1Pos(e.target.value)} />
                </div>
              </div>
              
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 2 (กรรมการ)</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={c2Name} onChange={(e) => setC2Name(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={c2Pos} onChange={(e) => setC2Pos(e.target.value)} />
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 3 (กรรมการ)</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={c3Name} onChange={(e) => setC3Name(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={c3Pos} onChange={(e) => setC3Pos(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Group 4: Executives Signatories */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>🏢 รายชื่อคณะผู้บริหารระดับสูง</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ผู้อำนวยการกอง</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={dirName} onChange={(e) => setDirName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={dirPos} onChange={(e) => setDirPos(e.target.value)} />
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ปลัดเทศบาล</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={clkName} onChange={(e) => setClkName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={clkPos} onChange={(e) => setClkPos(e.target.value)} />
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>นายกเทศมนตรี</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={mayorName} onChange={(e) => setMayorName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={mayorPos} onChange={(e) => setMayorPos(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="submit" className="button-primary" style={{ padding: '10px 24px' }}>
              💾 บันทึกการตั้งค่า
            </button>
          </div>
        </form>
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
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="เช่น นายสมเกียรติ ใจซื่อ"
                  required
                />
              </div>

              <div className="form-group">
                <label>ตำแหน่ง *</label>
                {positions.length > 0 ? (
                  <select
                    value={custPosition}
                    onChange={(e) => setCustPosition(e.target.value)}
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
                      value={custDivision}
                      onChange={(e) => setCustDivision(e.target.value)}
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
                      value={custDepartment}
                      onChange={(e) => setCustDepartment(e.target.value)}
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
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="เช่น somkiat.j@office.go.th"
                />
                <span className="field-hint">ระบบจะใช้ email ในการยืนยันสิทธิ์ Admin/Staff/User ผ่าน SSO</span>
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
