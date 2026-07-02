import { useState } from 'react';

export default function OptionsTab({
  positions = [],
  onAddPosition,
  onEditPosition,
  onDeletePosition,
  brands = [],
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  locations = [],
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
  onDeleteSeller
}) {
  const [newPositionInput, setNewPositionInput] = useState('');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [newLocationInput, setNewLocationInput] = useState('');
  const [newAgencyInput, setNewAgencyInput] = useState('');
  const [newSellerInput, setNewSellerInput] = useState('');

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
      alert('มีสถานที่นี้อยู่แล้วในระบบ');
      return;
    }
    onAddLocation(val);
    setNewLocationInput('');
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

  const handleAddSel = (e) => {
    e.preventDefault();
    const val = newSellerInput.trim();
    if (!val) return;
    if (sellers.includes(val)) {
      alert('มีชื่อผู้ขาย/คู่สัญญานี้อยู่แล้วในระบบ');
      return;
    }
    onAddSeller(val);
    setNewSellerInput('');
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
      alert('มีสถานที่นี้อยู่แล้วในระบบ');
      return;
    }
    onEditLocation(oldVal, trimmed);
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

  const handleEditSelPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อผู้ขาย / คู่สัญญา:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (sellers.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อผู้ขาย/คู่สัญญานี้อยู่แล้วในระบบ');
      return;
    }
    onEditSeller(oldVal, trimmed);
  };

  const handleDeletePositionCheck = (val) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบตำแหน่ง "${val}" ใช่หรือไม่?`)) {
      onDeletePosition(val);
    }
  };

  const handleDeleteBrandCheck = (val) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบยี่ห้อ "${val}" ใช่หรือไม่?`)) {
      onDeleteBrand(val);
    }
  };

  const handleDeleteLocCheck = (val) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบสถานที่ตั้ง "${val}" ใช่หรือไม่?`)) {
      onDeleteLocation(val);
    }
  };

  const handleDeleteAgencyCheck = (val) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบส่วนราชการ "${val}" ใช่หรือไม่?`)) {
      onDeleteAgency(val);
    }
  };

  const handleDeleteSelCheck = (val) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบผู้ขาย "${val}" ใช่หรือไม่?`)) {
      onDeleteSeller(val);
    }
  };

  return (
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

      {/* Seller Column */}
      <div className="layout-card">
        <h3>🤝 รายการผู้ขาย / คู่สัญญา</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
          ตัวเลือกผู้ขายในการลงทะเบียนจัดหาพัสดุ
        </p>

        <form onSubmit={handleAddSel} className="settings-inline-add-form">
          <input
            type="text"
            value={newSellerInput}
            onChange={(e) => setNewSellerInput(e.target.value)}
            placeholder="เช่น บจก. เอสเอสพี, หจก. นนทบุรี"
            className="filter-input-element"
          />
          <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
            เพิ่ม
          </button>
        </form>

        <div className="settings-inline-list">
          {sellers.length > 0 ? (
            sellers.map(seller => (
              <div key={seller} className="settings-list-row">
                <span className="settings-item-name">{seller}</span>
                <div className="settings-item-actions">
                  <button className="btn-mini-action" onClick={() => handleEditSelPrompt(seller)} type="button">
                    ✏️
                  </button>
                  <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteSelCheck(seller)} type="button">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="table-empty-row">ไม่มีข้อมูลผู้ขาย</div>
          )}
        </div>
      </div>
    </div>
  );
}
