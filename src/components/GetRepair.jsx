import { useState } from 'react';

export default function GetRepair({ assets = [], repairRequests = [], onCreateRepairRequest }) {
  const [activeSubTab, setActiveSubTab] = useState('new_request'); // 'new_request', 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');

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

  // Search filter
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matches = trimmedQuery ? assets.filter(asset => {
    const code = (asset.asset_code || '').toLowerCase();
    const serial = (asset.serial_number || '').toLowerCase();
    const reg = (asset.vehicle_registration || '').toLowerCase();
    return code.includes(trimmedQuery) || serial.includes(trimmedQuery) || reg.includes(trimmedQuery);
  }) : [];

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const handleSubmitRepair = (e) => {
    e.preventDefault();
    if (!selectedAsset || !problemDescription.trim()) {
      alert('กรุณากรอกรายละเอียดอาการเสีย');
      return;
    }
    onCreateRepairRequest(selectedAsset.id, problemDescription.trim());
    setSelectedAsset(null);
    setProblemDescription('');
    setSearchQuery('');
    setActiveSubTab('history');
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

  return (
    <div className="flex-column-gap">
      <div className="flex-center-between">
        <div>
          <h2>แจ้งซ่อมอุปกรณ์</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>แจ้งซ่อมครุภัณฑ์ที่ชำรุด เสียหาย หรือทำงานผิดปกติ</p>
        </div>
      </div>

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
          📜 ประวัติการแจ้งซ่อม ({repairRequests.length})
        </button>
      </div>

      {activeSubTab === 'new_request' && (
        <div className="layout-card animate-fade-in" style={{ padding: '24px' }}>
          {!selectedAsset ? (
            <div>
              <h3 style={{ marginBottom: '8px' }}>🔍 ค้นหาครุภัณฑ์ที่ต้องการแจ้งซ่อม</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                พิมพ์รหัสครุภัณฑ์, Serial Number (S/N) หรือ เลขทะเบียนรถ
              </p>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ตัวอย่าง: 412-67-0001, Dell, กข-5642..."
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                />
              </div>

              {trimmedQuery && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>ผลลัพธ์การค้นหา ({matches.length})</h4>
                  {matches.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {matches.map(asset => (
                        <div
                          key={asset.id}
                          className="table-row-hover"
                          style={{
                            padding: '14px 18px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => handleSelectAsset(asset)}
                        >
                          <div>
                            <strong style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>{asset.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              รหัส: {asset.asset_code || '-'} 
                              {asset.serial_number && ` | S/N: ${asset.serial_number}`}
                              {asset.vehicle_registration && ` | ทะเบียน: ${asset.vehicle_registration}`}
                            </div>
                          </div>
                          <button className="button-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            เลือกอุปกรณ์
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                      ❌ ไม่พบข้อมูลครุภัณฑ์ที่ตรงกับคำค้นหา
                    </div>
                  )}
                </div>
              )}

              {!trimmedQuery && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  💡 ค้นหาครุภัณฑ์ด้านบนเพื่อเริ่มขั้นตอนแจ้งซ่อม
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>📋 ยืนยันข้อมูลครุภัณฑ์</h3>
                <button type="button" className="button-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setSelectedAsset(null)}>
                  🔄 ค้นหาใหม่
                </button>
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
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{selectedAsset.name}</strong>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>รหัสครุภัณฑ์</div>
                  <div style={{ fontSize: '0.95rem' }}>{selectedAsset.asset_code || '-'}</div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>หมวดหมู่</div>
                  <div style={{ fontSize: '0.95rem' }}>{selectedAsset.category || '-'}</div>
                </div>

                <div>
                  {selectedAsset.serial_number && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serial Number (S/N)</div>
                      <div style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>{selectedAsset.serial_number}</div>
                    </>
                  )}
                  {selectedAsset.vehicle_registration && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: selectedAsset.serial_number ? '12px' : '0' }}>เลขทะเบียนรถ</div>
                      <div style={{ fontSize: '0.95rem' }}>{selectedAsset.vehicle_registration}</div>
                    </>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>สถานที่ตั้งพัสดุ / แหล่งเก็บใบส่งของ</div>
                  <div style={{ fontSize: '0.95rem' }}>{selectedAsset.location || '-'}</div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>ผู้รับผิดชอบดูแลล่าสุด</div>
                  <div style={{ fontSize: '0.95rem' }}>{getLatestCustodian(selectedAsset)}</div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitRepair}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    ระบุอาการเสีย หรือปัญหาที่พบ *
                  </label>
                  <textarea
                    rows={4}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="ตัวอย่าง: เครื่องพิมพ์กระดาษติดบ่อย, เครื่องชาร์จไม่เข้า, ระบบจอบิดเบี้ยว หรืออื่นๆ..."
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="button-primary" style={{ padding: '10px 20px' }}>
                    🚀 ส่งข้อมูลแจ้งซ่อม
                  </button>
                  <button type="button" className="button-secondary" style={{ padding: '10px 20px' }} onClick={() => setSelectedAsset(null)}>
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
          <h3 style={{ marginBottom: '16px' }}>📜 รายการประวัติแจ้งซ่อมของคุณ</h3>

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
                </tr>
              </thead>
              <tbody>
                {repairRequests.length > 0 ? (
                  [...repairRequests]
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
                            {req.problem_description}
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
                                  <strong>เอกสารอนุมัติ:</strong> {req.approval_no_date || '-'}
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
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="6" className="table-empty-row" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
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
  );
}
