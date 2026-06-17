/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

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
  onDeleteLocation
}) {
  const [activeTab, setActiveTab] = useState('custodians'); // 'custodians', 'org', 'options'
  const [landingBadgeInput, setLandingBadgeInput] = useState(landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');

  useEffect(() => {
    if (landingBadgeText) {
      setLandingBadgeInput(landingBadgeText);
    }
  }, [landingBadgeText]);
  
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
        </div>
      )}

      {/* Tab 4: Landing Badge Configuration */}
      {activeTab === 'landing' && (
        <div className="layout-card animate-fade-in" style={{ maxWidth: '600px' }}>
          <h3>🏷️ ตั้งค่าข้อความ Landing Badge</h3>
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
