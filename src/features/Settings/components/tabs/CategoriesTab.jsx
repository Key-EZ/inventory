import { useState } from 'react';

export default function CategoriesTab({
  assets = [],
  landBuildingCategories = [],
  equipmentCategories = [],
  categoryDepreciationYears = {},
  onAddLandCategory,
  onEditLandCategory,
  onDeleteLandCategory,
  onAddEquipmentCategory,
  onEditEquipmentCategory,
  onDeleteEquipmentCategory
}) {
  const [newLandCatInput, setNewLandCatInput] = useState('');
  const [newLandCatYearsInput, setNewLandCatYearsInput] = useState('20');
  const [newEquipCatInput, setNewEquipCatInput] = useState('');
  const [newEquipCatYearsInput, setNewEquipCatYearsInput] = useState('5');

  const landTypes = ['LAND_BUILDING'];

  return (
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
            const yearsNum = parseInt(newLandCatYearsInput) || 0;
            onAddLandCategory(val, yearsNum);
            setNewLandCatInput('');
            setNewLandCatYearsInput('20');
          }}
          className="settings-inline-add-form"
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            value={newLandCatInput}
            onChange={(e) => setNewLandCatInput(e.target.value)}
            placeholder="ชื่อหมวดหมู่ เช่น อาคารโรงยิม"
            className="filter-input-element"
            style={{ flex: 2, minWidth: '200px' }}
          />
          <input
            type="number"
            value={newLandCatYearsInput}
            onChange={(e) => setNewLandCatYearsInput(e.target.value)}
            placeholder="อายุการใช้งาน (ปี)"
            className="filter-input-element"
            style={{ flex: 1, minWidth: '120px' }}
            min="0"
          />
          <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
            เพิ่ม
          </button>
        </form>

        <div className="settings-inline-list">
          {landBuildingCategories.length > 0 ? (
            landBuildingCategories.map(cat => {
              const years = categoryDepreciationYears && categoryDepreciationYears[cat] !== undefined ? categoryDepreciationYears[cat] : 20;
              const rate = years > 0 ? (100 / years).toFixed(1) : 0;
              return (
                <div key={cat} className="settings-list-row">
                  <div className="settings-item-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="settings-item-name" style={{ fontWeight: 'bold' }}>{cat}</span>
                    <span className="settings-item-subtext" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      อายุการใช้งาน: {years} ปี (อัตราค่าเสื่อม {rate}% / ปี)
                    </span>
                  </div>
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
                        
                        const newYearsStr = prompt(`แก้ไขอายุการใช้งาน (ปี) ของหมวดหมู่ "${trimmed}":`, years.toString());
                        if (newYearsStr === null) return;
                        const newYears = parseInt(newYearsStr);
                        if (isNaN(newYears) || newYears < 0) {
                          alert('กรุณากรอกอายุการใช้งานเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
                          return;
                        }
                        
                        onEditLandCategory(cat, trimmed, newYears);
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
              );
            })
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
            const yearsNum = parseInt(newEquipCatYearsInput) || 5;
            onAddEquipmentCategory(val, yearsNum);
            setNewEquipCatInput('');
            setNewEquipCatYearsInput('5');
          }}
          className="settings-inline-add-form"
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            value={newEquipCatInput}
            onChange={(e) => setNewEquipCatInput(e.target.value)}
            placeholder="ชื่อหมวดหมู่ เช่น ครุภัณฑ์งานสนาม"
            className="filter-input-element"
            style={{ flex: 2, minWidth: '200px' }}
          />
          <input
            type="number"
            value={newEquipCatYearsInput}
            onChange={(e) => setNewEquipCatYearsInput(e.target.value)}
            placeholder="อายุการใช้งาน (ปี)"
            className="filter-input-element"
            style={{ flex: 1, minWidth: '120px' }}
            min="0"
          />
          <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
            เพิ่ม
          </button>
        </form>

        <div className="settings-inline-list">
          {equipmentCategories.length > 0 ? (
            equipmentCategories.map(cat => {
              const years = categoryDepreciationYears && categoryDepreciationYears[cat] !== undefined ? categoryDepreciationYears[cat] : 5;
              const rate = years > 0 ? (100 / years).toFixed(1) : 0;
              return (
                <div key={cat} className="settings-list-row">
                  <div className="settings-item-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="settings-item-name" style={{ fontWeight: 'bold' }}>{cat}</span>
                    <span className="settings-item-subtext" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      อายุการใช้งาน: {years} ปี (อัตราค่าเสื่อม {rate}% / ปี)
                    </span>
                  </div>
                  <div className="settings-item-actions">
                    <button
                      className="btn-mini-action"
                      onClick={() => {
                        const newVal = prompt('EDIT EQUIPMENT CATEGORY พ.ด.2:', cat);
                        if (newVal === null) return;
                        const trimmed = newVal.trim();
                        if (!trimmed) return;
                        if (equipmentCategories.includes(trimmed) && trimmed !== cat) {
                          alert('มีชื่อหมวดหมู่นี้อยู่แล้วในระบบ');
                          return;
                        }
                        
                        const newYearsStr = prompt(`แก้ไขอายุการใช้งาน (ปี) ของหมวดหมู่ "${trimmed}":`, years.toString());
                        if (newYearsStr === null) return;
                        const newYears = parseInt(newYearsStr);
                        if (isNaN(newYears) || newYears < 0) {
                          alert('กรุณากรอกอายุการใช้งานเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
                          return;
                        }
                        
                        onEditEquipmentCategory(cat, trimmed, newYears);
                      }}
                      type="button"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-mini-action btn-mini-delete"
                      onClick={() => {
                        const inUse = assets.some(a => a.category === cat && !landTypes.includes(a.asset_type));
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
              );
            })
          ) : (
            <div className="table-empty-row">ไม่มีข้อมูลหมวดหมู่</div>
          )}
        </div>
      </div>
    </div>
  );
}
