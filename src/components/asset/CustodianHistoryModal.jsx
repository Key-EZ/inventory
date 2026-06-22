import { useState } from 'react';

export default function CustodianHistoryModal({
  asset,
  custodians = [],
  agencies = [],
  positions = [],
  onSubmit,
  onClose
}) {
  const [localHistory, setLocalHistory] = useState(asset ? asset.custodian_history || [] : []);
  
  // Sub-form state variables
  const [year, setYear] = useState('');
  const [budgetOwner, setBudgetOwner] = useState('');
  const [custodianName, setCustodianName] = useState('');
  const [sectionHead, setSectionHead] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleAddOrEdit = () => {
    if (!year.trim() || !budgetOwner.trim() || !sectionHead.trim()) {
      alert('กรุณากรอกข้อมูล ปี พ.ศ., ส่วนราชการ และตำแหน่งหัวหน้าส่วน ให้ครบถ้วน');
      return;
    }

    if (editingId) {
      // Edit existing entry
      setLocalHistory(localHistory.map(item => item.id === editingId ? {
        id: editingId,
        year: year.trim(),
        budget_owner: budgetOwner.trim(),
        custodian_name: custodianName ? custodianName.trim() : '',
        section_head: sectionHead.trim()
      } : item));
      setEditingId(null);
    } else {
      // Add new entry
      const newEntry = {
        id: `custhist-${Date.now()}`,
        year: year.trim(),
        budget_owner: budgetOwner.trim(),
        custodian_name: custodianName ? custodianName.trim() : '',
        section_head: sectionHead.trim()
      };
      setLocalHistory([...localHistory, newEntry]);
    }

    // Reset sub-form inputs
    setYear('');
    setBudgetOwner('');
    setCustodianName('');
    setSectionHead('');
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setYear(item.year || '');
    setBudgetOwner(item.budget_owner || '');
    setCustodianName(item.custodian_name || '');
    setSectionHead(item.section_head || '');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('คุณแน่ใจว่าต้องการลบประวัติผู้รับผิดชอบดูแลพัสดุรายการนี้ใช่หรือไม่?')) {
      setLocalHistory(localHistory.filter(item => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setYear('');
        setBudgetOwner('');
        setCustodianName('');
        setSectionHead('');
      }
    }
  };

  const handleSaveAll = () => {
    // Determine overall budget_owner from the latest custodian history entry
    let finalBudgetOwner = asset?.budget_owner || '';
    if (localHistory.length > 0) {
      const sorted = [...localHistory].sort((a, b) => {
        const yA = parseInt(a.year) || 0;
        const yB = parseInt(b.year) || 0;
        return yB - yA;
      });
      finalBudgetOwner = sorted[0]?.budget_owner || '';
    }

    const updatedAsset = {
      ...asset,
      custodian_history: localHistory,
      budget_owner: finalBudgetOwner
    };

    onSubmit(updatedAsset);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content-card" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header-section">
          <h2>👤 จัดการประวัติผู้รับผิดชอบพัสดุ</h2>
          <button className="close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        <div className="asset-form-body" style={{ padding: '20px' }}>
          {/* Asset Info Header Card */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>รหัสพัสดุ: </span>
              <strong style={{ color: 'var(--primary-color)' }}>{asset?.asset_code || '-'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ชื่อพัสดุ: </span>
              <strong>{asset?.name || '-'}</strong>
            </div>
          </div>

          {/* Add/Edit Sub-Form */}
          <div className="maint-entry-box">
            <h4>{editingId ? '✏️ แก้ไขข้อมูลผู้รับผิดชอบ' : '➕ เพิ่มผู้รับผิดชอบดูแล'}</h4>
            <div className="maint-form-grid">
              <div className="form-group">
                <label>ปี พ.ศ. *</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="เช่น 2569"
                />
              </div>
              <div className="form-group">
                <label>ชื่อส่วนราชการ *</label>
                {agencies.length > 0 ? (
                  <select
                    value={budgetOwner}
                    onChange={(e) => setBudgetOwner(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกส่วนราชการ --</option>
                    {agencies.map(agency => (
                      <option key={agency} value={agency}>{agency}</option>
                    ))}
                  </select>
                ) : (
                  <select disabled value="">
                    <option value="">-- ไม่มีข้อมูลส่วนราชการในระบบ --</option>
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>ชื่อผู้รับผิดชอบดูแล</label>
                {custodians.length > 0 ? (
                  <select
                    value={custodianName}
                    onChange={(e) => setCustodianName(e.target.value)}
                  >
                    <option value="">-- เลือกผู้รับผิดชอบดูแล (ถ้ามี) --</option>
                    {custodians.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.position || '-'})</option>
                    ))}
                  </select>
                ) : (
                  <select disabled value="">
                    <option value="">-- ไม่มีข้อมูลรายชื่อผู้ดูแลในระบบ --</option>
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>ชื่อหัวหน้าส่วน *</label>
                {positions.length > 0 ? (
                  <select
                    value={sectionHead}
                    onChange={(e) => setSectionHead(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกตำแหน่งหัวหน้าส่วน --</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                ) : (
                  <select disabled value="">
                    <option value="">-- ไม่มีข้อมูลรายชื่อตำแหน่งในระบบ --</option>
                  </select>
                )}
              </div>
            </div>
            <button
              type="button"
              className="button-primary maint-add-btn"
              onClick={handleAddOrEdit}
            >
              {editingId ? 'บันทึกการแก้ไข' : 'บันทึกรายการเพิ่ม'}
            </button>
            {editingId && (
              <button
                type="button"
                className="button-secondary maint-cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setYear('');
                  setBudgetOwner('');
                  setCustodianName('');
                  setSectionHead('');
                }}
              >
                ยกเลิกแก้ไข
              </button>
            )}
          </div>

          {/* Custodian History Table */}
          <div className="maint-table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table className="maint-log-table">
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>ครั้งที่</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>ปี พ.ศ.</th>
                  <th style={{ width: '25%' }}>ชื่อส่วนราชการ</th>
                  <th style={{ width: '25%' }}>ชื่อผู้รับผิดชอบดูแล</th>
                  <th style={{ width: '20%' }}>ชื่อหัวหน้าส่วน</th>
                  <th style={{ width: '10%' }} className="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {localHistory.length > 0 ? (
                  localHistory.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ textAlign: 'center' }}>{item.year}</td>
                      <td>{item.budget_owner}</td>
                      <td>{item.custodian_name || '-'}</td>
                      <td>{item.section_head}</td>
                      <td className="text-center">
                        <div className="maint-row-actions">
                          <span
                            className="action-maint-edit"
                            onClick={() => handleEditClick(item)}
                            title="แก้ไขรายการ"
                          >
                            ✏️
                          </span>
                          <span
                            className="action-maint-delete"
                            onClick={() => handleDeleteClick(item.id)}
                            title="ลบรายการ"
                          >
                            🗑️
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-8 font-italic" style={{ padding: '16px 0' }}>ยังไม่มีรายการผู้รับผิดชอบดูแลสำหรับทรัพย์สินนี้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Actions Footer */}
          <div className="form-actions-footer" style={{ marginTop: '20px', padding: '10px 0 0 0', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn-cancel" type="button" onClick={onClose}>ยกเลิก</button>
            <button className="btn-save button-primary" type="button" onClick={handleSaveAll}>
              บันทึกการเปลี่ยนแปลงทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
