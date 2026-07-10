import { useState } from 'react';
import { formatThaiDateString } from '../../../utils/dateUtils';

export default function GetRepair({
  assets = [],
  repairRequests = [],
  onCreateRepairRequest,
  preselectedAsset = null,
  onClearPreselectedAsset,
  onClose,
  initialTab = 'new_request',
  onPrintRepairRequest
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab); // 'new_request', 'history'
  const [showOnlyPreselectedHistory, setShowOnlyPreselectedHistory] = useState(!!preselectedAsset);
  const [problemDescription, setProblemDescription] = useState('');
  const [listBrokenItem, setListBrokenItem] = useState('');

  // Helper to find latest custodian name from custodian history (sorted by year descending)
  const getLatestCustodian = (asset) => {
    if (!asset.custodian_history || asset.custodian_history.length === 0) {
      return '-';
    }
    const sorted = [...asset.custodian_history].sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearB - yearA;
    });
    return sorted[0].custodian_name || '-';
  };

  // Format Thai dates
  const formatDateThai = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear() + 543; // Buddhist Era
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year} ${hours}:${minutes} น.`;
    } catch {
      return dateStr;
    }
  };

  const handleSubmitRepair = async (e) => {
    e.preventDefault();
    if (!preselectedAsset || !problemDescription.trim() || !listBrokenItem.trim()) {
      alert('กรุณากรอกข้อมูลและรายละเอียดชิ้นส่วนที่ชำรุดเสียหายให้ครบถ้วน');
      return;
    }
    const success = await onCreateRepairRequest(preselectedAsset.id, problemDescription.trim(), listBrokenItem.trim());
    if (success) {
      setProblemDescription('');
      setListBrokenItem('');
      if (onClearPreselectedAsset) onClearPreselectedAsset();
      setActiveSubTab('history');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'IN_PROGRESS': return 'กำลังซ่อม';
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'REJECTED': return 'ยกเลิก';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'repair-status-pending';
      case 'IN_PROGRESS': return 'repair-status-progress';
      case 'COMPLETED': return 'repair-status-completed';
      case 'REJECTED': return 'repair-status-rejected';
      default: return '';
    }
  };

  // Filter history requests if preselectedAsset is active and toggle is on
  const filteredHistoryRequests = (preselectedAsset && showOnlyPreselectedHistory)
    ? repairRequests.filter(req => req.asset_id === preselectedAsset.id)
    : repairRequests;

  return (
    <div className="modal-backdrop">
      <div className="modal-content-card" style={{ maxWidth: '900px' }}>
        <div className="modal-header-section" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2>🔧 แจ้งซ่อมครุภัณฑ์</h2>
          <button className="close-btn" onClick={onClose} type="button" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="flex-column-gap">
          {/* Navigation tabs */}
          <div className="form-tabs" style={{ marginBottom: '8px' }}>
        <button
          type="button"
          className={`tab-btn ${activeSubTab === 'new_request' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('new_request')}
        >
          🔧 แจ้งซ่อมครุภัณฑ์ใหม่
        </button>
        <button
          type="button"
          className={`tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          📜 ประวัติการแจ้งซ่อม ({preselectedAsset ? repairRequests.filter(req => req.asset_id === preselectedAsset.id).length : repairRequests.length})
        </button>
      </div>

      {activeSubTab === 'new_request' && (
        <div className="layout-card animate-fade-in" style={{ padding: '24px' }}>
          {!preselectedAsset ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              ⚠️ กรุณาเลือกครุภัณฑ์ที่ต้องการแจ้งซ่อมโดยคลิกปุ่ม <strong>"🔧 แจ้งซ่อม"</strong> ในตารางทะเบียนครุภัณฑ์
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>📋 ยืนยันข้อมูลครุภัณฑ์</h3>
              </div>

              {/* Asset Detail Preview Card */}
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderLeft: '4px solid var(--primary-color)', 
                  padding: '20px', 
                  borderRadius: '0 8px 8px 0', 
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ชื่อทรัพย์สิน</div>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{preselectedAsset.name}</strong>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>รหัสครุภัณฑ์</div>
                  <div style={{ fontSize: '0.95rem' }}>{preselectedAsset.asset_code || '-'}</div>
 
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>หมวดหมู่</div>
                  <div style={{ fontSize: '0.95rem' }}>{preselectedAsset.category || '-'}</div>
                </div>
 
                <div>
                  {preselectedAsset.serial_number && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serial Number (S/N)</div>
                      <div style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>{preselectedAsset.serial_number}</div>
                    </>
                  )}
                  {preselectedAsset.vehicle_registration && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: preselectedAsset.serial_number ? '12px' : '0' }}>เลขทะเบียนรถ</div>
                      <div style={{ fontSize: '0.95rem' }}>{preselectedAsset.vehicle_registration}</div>
                    </>
                  )}
 
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>สถานที่ตั้งพัสดุ / แหล่งเก็บใบส่งของ</div>
                  <div style={{ fontSize: '0.95rem' }}>{preselectedAsset.location || '-'}</div>
 
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>ผู้รับผิดชอบดูแลล่าสุด</div>
                  <div style={{ fontSize: '0.95rem' }}>{getLatestCustodian(preselectedAsset)}</div>
                </div>
              </div>
 
              <form onSubmit={handleSubmitRepair}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                    รายการซ่อมแซม (ชิ้นส่วนที่ชำรุดเสียหายที่ต้องการให้ซ่อมแซม) *
                  </label>
                  <textarea
                    rows={4}
                    value={listBrokenItem}
                    onChange={(e) => setListBrokenItem(e.target.value)}
                    placeholder="ระบุอาการชำรุดและรายการที่ต้องการให้ซ่อมแซม เช่น เมนบอร์ดชำรุดเปิดเครื่องไม่ติด, ลูกกลิ้งดึงกระดาษสึกกระดาษติดบ่อย..."
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                  />
                </div>
 
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="button-primary" style={{ padding: '10px 20px' }}>
                    🚀 ส่งข้อมูลแจ้งซ่อม
                  </button>
                  <button type="button" className="button-secondary" style={{ padding: '10px 20px' }} onClick={() => { if (onClearPreselectedAsset) onClearPreselectedAsset(); if (onClose) onClose(); }}>
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="layout-card table-data-card animate-fade-in" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>📜 รายการประวัติแจ้งซ่อม</h3>
            {preselectedAsset && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showOnlyPreselectedHistory}
                  onChange={(e) => setShowOnlyPreselectedHistory(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>แสดงเฉพาะของครุภัณฑ์นี้ (<strong>{preselectedAsset.asset_code}</strong>)</span>
              </label>
            )}
          </div>

          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ลำดับ</th>
                  <th style={{ width: '180px' }}>วันที่แจ้งซ่อม</th>
                  <th>ครุภัณฑ์ / รหัส</th>
                  <th>รายละเอียดอาการเสีย</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>สถานะ</th>
                  <th>ข้อมูลซ่อมแซม (ถ้าเสร็จสิ้น)</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>พิมพ์เอกสาร</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistoryRequests.length > 0 ? (
                  [...filteredHistoryRequests]
                    .sort((a, b) => new Date(b.request_date) - new Date(a.request_date))
                    .map((req, idx) => {
                      const asset = assets.find(a => a.id === req.asset_id);
                      return (
                        <tr key={req.id} className="table-row-hover">
                          <td>{idx + 1}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {formatDateThai(req.request_date)}
                          </td>
                          <td>
                            <strong>{asset ? asset.name : 'ไม่พบข้อมูลครุภัณฑ์'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              รหัส: {asset ? asset.asset_code : '-'}
                              {asset?.serial_number && ` | S/N: ${asset.serial_number}`}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            <div><strong>อาการเสีย:</strong> {req.problem_description}</div>
                            {req.list_broken_item && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <strong>รายการชำรุด:</strong> {req.list_broken_item}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`ledger-status-badge ${getStatusClass(req.status)}`}>
                              {getStatusLabel(req.status)}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {req.status === 'REJECTED' && (
                              <div style={{ color: 'var(--status-pending-text)' }}>
                                <strong>เหตุผลที่ยกเลิก:</strong> {req.rejection_reason || '-'}
                              </div>
                            )}
                            {req.status === 'COMPLETED' && (
                              <div>
                                <div style={{ color: 'var(--status-active-text)' }}>
                                  <strong>ค่าซ่อม:</strong> {parseFloat(req.repair_cost || 0).toLocaleString()} บาท
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <strong>ผู้รับจ้าง:</strong> {req.contractor || '-'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <strong>เอกสารอนุมัติ:</strong> {req.document_number ? `${req.document_number} (ลงวันที่ ${formatThaiDateString(req.approval_date)})` : (req.approval_no_date || '-')}
                                </div>
                              </div>
                            )}
                            {req.status === 'PENDING' && (
                              <span style={{ color: 'var(--text-muted)' }}>รอดำเนินการตรวจสอบ</span>
                            )}
                            {req.status === 'IN_PROGRESS' && (
                              <span style={{ color: 'var(--status-damaged-text)' }}>กำลังดำเนินงานซ่อมแซม...</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-table-print"
                              onClick={() => onPrintRepairRequest(req)}
                              title="พิมพ์ใบแจ้งซ่อม"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              🖨️ พิมพ์
                            </button>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="7" className="table-empty-row" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      ยังไม่มีประวัติการส่งข้อมูลแจ้งซ่อมอุปกรณ์
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
