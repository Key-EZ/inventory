import { useState } from 'react';

export default function RepairJobs({
  assets = [],
  repairRequests = [],
  onStartRepairJob,
  onRejectRepairJob,
  onCompleteRepairJob
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  // Modals state
  const [completingRequest, setCompletingRequest] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(null);

  // Completion Form States
  const [completionForm, setCompletionForm] = useState({
    repairCost: '',
    contractor: '',
    approvalDate: '',
    documentNumber: '',
    officerNotes: ''
  });

  const handleCompletionChange = (e) => {
    const { name, value } = e.target;
    setCompletionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Rejection Form States
  const [rejectionReason, setRejectionReason] = useState('');

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
      const year = d.getFullYear() + 543;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year} ${hours}:${minutes} น.`;
    } catch {
      return dateStr;
    }
  };

  // Helper to find latest custodian
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

  // Filter requests
  const filteredRequests = filterStatus === 'ALL'
    ? repairRequests
    : repairRequests.filter(req => req.status === filterStatus);

  // Search filter
  const displayRequests = filteredRequests.filter(req => {
    const asset = assets.find(a => a.id === req.asset_id);
    const assetName = asset ? (asset.name || '').toLowerCase() : '';
    const assetCode = asset ? (asset.asset_code || '').toLowerCase() : '';
    const problem = (req.problem_description || '').toLowerCase();
    const query = searchText.toLowerCase();
    return assetName.includes(query) || assetCode.includes(query) || problem.includes(query);
  });

  // Action Handlers
  const handleOpenComplete = (req) => {
    setCompletingRequest(req);
    setCompletionForm({
      repairCost: '',
      contractor: '',
      approvalDate: '',
      documentNumber: '',
      officerNotes: ''
    });
  };

  const handleCloseComplete = () => {
    setCompletingRequest(null);
  };

  const handleOpenReject = (req) => {
    setRejectingRequest(req);
    setRejectionReason('');
  };

  const handleCloseReject = () => {
    setRejectingRequest(null);
  };

  const handleSubmitComplete = (e) => {
    e.preventDefault();
    if (!completingRequest) return;
    const { repairCost, contractor, approvalDate, documentNumber, officerNotes } = completionForm;
    if (!repairCost || !contractor.trim() || !approvalDate.trim() || !documentNumber.trim()) {
      alert('กรุณากรอกข้อมูลการซ่อมให้ครบถ้วน');
      return;
    }
    onCompleteRepairJob(
      completingRequest.id,
      parseFloat(repairCost),
      contractor.trim(),
      approvalDate.trim(),
      documentNumber.trim(),
      officerNotes.trim()
    );
    handleCloseComplete();
  };

  const handleSubmitReject = (e) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      alert('กรุณากรอกเหตุผลที่ปฏิเสธการแจ้งซ่อม');
      return;
    }
    onRejectRepairJob(rejectingRequest.id, rejectionReason.trim());
    handleCloseReject();
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
          <h2>งานซ่อมและบำรุงรักษาอุปกรณ์</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ติดตามและบริหารจัดการงานซ่อมพัสดุครุภัณฑ์ในระบบ</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="form-tabs" style={{ marginBottom: '8px' }}>
        <button
          type="button"
          className={`tab-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterStatus('ALL')}
        >
          ทั้งหมด ({repairRequests.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilterStatus('PENDING')}
        >
          รอดำเนินการ ({repairRequests.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => setFilterStatus('IN_PROGRESS')}
        >
          กำลังซ่อม ({repairRequests.filter(r => r.status === 'IN_PROGRESS').length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('COMPLETED')}
        >
          เสร็จสิ้น ({repairRequests.filter(r => r.status === 'COMPLETED').length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterStatus === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('REJECTED')}
        >
          ยกเลิก ({repairRequests.filter(r => r.status === 'REJECTED').length})
        </button>
      </div>

      {/* Main Table view */}
      <div className="layout-card table-data-card animate-fade-in" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="ค้นหาตามชื่อครุภัณฑ์, รหัสครุภัณฑ์ หรืออาการชำรุด..."
            style={{ width: '100%', maxWidth: '400px', padding: '8px 12px' }}
          />
        </div>

        <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ลำดับ</th>
                <th style={{ width: '160px' }}>วัน-เวลาที่แจ้ง</th>
                <th style={{ width: '220px' }}>ครุภัณฑ์ / รหัส</th>
                <th style={{ width: '120px' }}>ผู้ดูแลรับผิดชอบ</th>
                <th>อาการชำรุด / ปัญหา</th>
                <th style={{ width: '110px', textAlign: 'center' }}>สถานะ</th>
                <th style={{ width: '200px', textAlign: 'center' }}>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {displayRequests.length > 0 ? (
                [...displayRequests]
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
                          <strong>{asset ? asset.name : 'ไม่พบครุภัณฑ์'}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            รหัส: {asset ? asset.asset_code : '-'}
                            {asset?.serial_number && ` | S/N: ${asset.serial_number}`}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {asset ? getLatestCustodian(asset) : '-'}
                        </td>
                        <td style={{ fontSize: '0.9rem', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '250px' }}>
                          {req.problem_description}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`ledger-status-badge ${getStatusClass(req.status)}`}>
                            {getStatusLabel(req.status)}
                          </span>
                        </td>
                        <td>
                          {req.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                className="button-primary"
                                style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                                onClick={() => onStartRepairJob(req.id)}
                              >
                                🛠️ รับดำเนินการ
                              </button>
                              <button
                                className="button-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--status-pending-text)' }}
                                onClick={() => handleOpenReject(req)}
                              >
                                ❌ ปฏิเสธ
                              </button>
                            </div>
                          )}

                          {req.status === 'IN_PROGRESS' && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                className="button-primary"
                                style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'var(--status-active-bar)', borderColor: 'var(--status-active-bar)' }}
                                onClick={() => handleOpenComplete(req)}
                              >
                                ✅ ซ่อมเสร็จสิ้น
                              </button>
                              <button
                                className="button-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--status-pending-text)' }}
                                onClick={() => handleOpenReject(req)}
                              >
                                ❌ ปฏิเสธ
                              </button>
                            </div>
                          )}

                          {req.status === 'COMPLETED' && (
                            <div style={{ fontSize: '0.8rem', padding: '4px' }}>
                              <span style={{ color: 'var(--status-active-text)' }}>✔️ เสร็จสิ้นการซ่อม</span>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                                ค่าซ่อม: {parseFloat(req.repair_cost || 0).toLocaleString()} บาท
                              </div>
                            </div>
                          )}

                          {req.status === 'REJECTED' && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--status-disposed-text)', padding: '4px' }}>
                              <span>❌ ยกเลิกการซ่อม</span>
                              <div style={{ fontSize: '0.75rem', marginTop: '2px', fontStyle: 'italic' }}>
                                เหตุผล: {req.rejection_reason || '-'}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="7" className="table-empty-row" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    ไม่มีรายการคำขอแจ้งซ่อมพัสดุในหมวดหมู่นี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Repair Modal */}
      {completingRequest && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header-section">
              <h2>🛠️ บันทึกผลการดำเนินการซ่อมแซม</h2>
              <button className="close-btn" onClick={handleCloseComplete}>&times;</button>
            </div>

            <form onSubmit={handleSubmitComplete} className="asset-form-body" style={{ padding: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '8px' }}>
                <strong>พัสดุ:</strong> {assets.find(a => a.id === completingRequest.asset_id)?.name || 'ไม่พบครุภัณฑ์'}
                <br />
                <strong>อาการเสีย:</strong> {completingRequest.problem_description}
              </div>

              <div className="form-group">
                <label>ค่าใช้จ่ายในการซ่อมแซม (บาท) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="repairCost"
                  value={completionForm.repairCost}
                  onChange={handleCompletionChange}
                  placeholder="เช่น 2500"
                  required
                />
              </div>

              <div className="form-group">
                <label>บริษัท / ผู้รับจ้างซ่อมแซม *</label>
                <input
                  type="text"
                  name="contractor"
                  value={completionForm.contractor}
                  onChange={handleCompletionChange}
                  placeholder="เช่น หจก. นนทบุรีไอที"
                  required
                />
              </div>

              <div className="form-group">
                <label>เลขที่หนังสืออนุมัติ *</label>
                <input
                  type="text"
                  name="documentNumber"
                  value={completionForm.documentNumber}
                  onChange={handleCompletionChange}
                  placeholder="เช่น นบ 5420X/XXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>วันเดือนปีที่อนุมัติ *</label>
                <input
                  type="date"
                  name="approvalDate"
                  value={completionForm.approvalDate}
                  onChange={handleCompletionChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>บันทึกหรือหมายเหตุเพิ่มเติม (ของเจ้าหน้าที่)</label>
                <textarea
                  rows={2}
                  name="officerNotes"
                  value={completionForm.officerNotes}
                  onChange={handleCompletionChange}
                  placeholder="รายละเอียดอะไหล่ที่เปลี่ยน หรือหมายเหตุเพิ่มเติม..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="submit" className="button-primary" style={{ padding: '8px 16px', backgroundColor: 'var(--status-active-bar)', borderColor: 'var(--status-active-bar)' }}>
                  บันทึกเสร็จสิ้น
                </button>
                <button type="button" className="button-secondary" style={{ padding: '8px 16px' }} onClick={handleCloseComplete}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Repair Modal */}
      {rejectingRequest && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header-section">
              <h2>❌ ปฏิเสธการแจ้งซ่อมพัสดุ</h2>
              <button className="close-btn" onClick={handleCloseReject}>&times;</button>
            </div>

            <form onSubmit={handleSubmitReject} className="asset-form-body" style={{ padding: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '8px' }}>
                <strong>พัสดุ:</strong> {assets.find(a => a.id === rejectingRequest.asset_id)?.name || 'ไม่พบครุภัณฑ์'}
                <br />
                <strong>อาการเสีย:</strong> {rejectingRequest.problem_description}
              </div>

              <div className="form-group">
                <label>เหตุผลที่ปฏิเสธหรือยกเลิกการซ่อมแซม *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="เช่น อุปกรณ์อยู่ในระยะรับประกันของบริษัทซัพพลายเออร์ หรือ ไม่ใช่ความเสียหายจากการทำงานปกติ..."
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="submit" className="button-primary" style={{ padding: '8px 16px', backgroundColor: 'var(--status-pending-bar)', borderColor: 'var(--status-pending-bar)' }}>
                  ยืนยันการปฏิเสธ
                </button>
                <button type="button" className="button-secondary" style={{ padding: '8px 16px' }} onClick={handleCloseReject}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
