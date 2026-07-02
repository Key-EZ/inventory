import { useState } from 'react';

export default function OrgTab({
  divisions = [],
  departments = [],
  onAddDivision,
  onEditDivision,
  onDeleteDivision,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment
}) {
  const [newDivisionInput, setNewDivisionInput] = useState('');
  const [newDepartmentInput, setNewDepartmentInput] = useState('');

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

  const handleDeleteDivCheck = (val) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบชื่อกอง "${val}" ใช่หรือไม่?`)) {
      onDeleteDivision(val);
    }
  };

  const handleDeleteDeptCheck = (val) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบชื่อฝ่าย/แผนก "${val}" ใช่หรือไม่?`)) {
      onDeleteDepartment(val);
    }
  };

  return (
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
                  <button className="btn-mini-action" onClick={() => handleEditDivPrompt(divName)} type="button">
                    ✏️
                  </button>
                  <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteDivCheck(divName)} type="button">
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
                  <button className="btn-mini-action" onClick={() => handleEditDeptPrompt(deptName)} type="button">
                    ✏️
                  </button>
                  <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteDeptCheck(deptName)} type="button">
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
  );
}
