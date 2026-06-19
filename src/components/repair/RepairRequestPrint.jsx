import { useState, useEffect } from 'react';
import { formatThaiDateString } from '../../utils/dateUtils';

export default function RepairRequestPrint({ repairRequest, asset, onClose }) {
  // Sync printable state class to body
  useEffect(() => {
    document.body.classList.add('modal-print-open');
    return () => {
      document.body.classList.remove('modal-print-open');
    };
  }, []);

  // Form Section States for UI collapsibles
  const [activeSection, setActiveSection] = useState('general');

  // Input states initialized from localStorage or defaults
  const [agency, setAgency] = useState(() => localStorage.getItem('print_rr_agency') || 'เทศบาลตำบลเสาธงหิน');
  const [docNo, setDocNo] = useState(() => localStorage.getItem('print_rr_docNo') || 'ทบ. ๕๑๐๐๘/');
  const [docDate, setDocDate] = useState(() => {
    if (repairRequest?.request_date) {
      const dateParts = repairRequest.request_date.split('T')[0].split('-');
      if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${parseInt(dateParts[0]) + 543}`;
      }
    }
    return '';
  });
  const [subject, setSubject] = useState(() => localStorage.getItem('print_rr_subject') || 'ขออนุมัติซ่อมแซมครุภัณฑ์');

  // Signatory Names & Positions
  const [requesterName, setRequesterName] = useState(() => localStorage.getItem('print_rr_requesterName') || 'นายสมชาย ใจดี');
  const [requesterPosition, setRequesterPosition] = useState(() => localStorage.getItem('print_rr_requesterPosition') || 'เจ้าหน้าที่พัสดุ');

  const [budgetAuditorName, setBudgetAuditorName] = useState(() => localStorage.getItem('print_rr_budgetAuditorName') || 'นางสาวจงดี มีทรัพย์');
  const [budgetAuditorPosition, setBudgetAuditorPosition] = useState(() => localStorage.getItem('print_rr_budgetAuditorPosition') || 'เจ้าหน้าที่การเงินและบัญชี');

  const [comm1Name, setComm1Name] = useState(() => localStorage.getItem('print_rr_comm1Name') || 'นายสมบูรณ์ ดีพร้อม');
  const [comm1Position, setComm1Position] = useState(() => localStorage.getItem('print_rr_comm1Position') || 'นายช่างโยธา');

  const [comm2Name, setComm2Name] = useState(() => localStorage.getItem('print_rr_comm2Name') || 'นายรักชาติ ยิ่งชีพ');
  const [comm2Position, setComm2Position] = useState(() => localStorage.getItem('print_rr_comm2Position') || 'เจ้าพนักงานธุรการ');

  const [comm3Name, setComm3Name] = useState(() => localStorage.getItem('print_rr_comm3Name') || 'นายวิทยา เก่งกาจ');
  const [comm3Position, setComm3Position] = useState(() => localStorage.getItem('print_rr_comm3Position') || 'เจ้าพนักงานพัสดุ');

  const [directorName, setDirectorName] = useState(() => localStorage.getItem('print_rr_directorName') || 'นายวิเชียร ยอดแก้ว');
  const [directorPosition, setDirectorPosition] = useState(() => localStorage.getItem('print_rr_directorPosition') || 'ผู้อำนวยการกองช่าง');

  const [clerkName, setClerkName] = useState(() => localStorage.getItem('print_rr_clerkName') || 'นายอดิศร วงศ์เจริญ');
  const [clerkPosition, setClerkPosition] = useState(() => localStorage.getItem('print_rr_clerkPosition') || 'ปลัดเทศบาลตำบลเสาธงหิน');

  const [mayorName, setMayorName] = useState(() => localStorage.getItem('print_rr_mayorName') || 'นายเกรียงไกร ไตรธรรม');
  const [mayorPosition, setMayorPosition] = useState(() => localStorage.getItem('print_rr_mayorPosition') || 'นายกเทศมนตรีตำบลเสาธงหิน');

  const [estimatedCost, setEstimatedCost] = useState(() => repairRequest?.repair_cost ? String(repairRequest.repair_cost) : '');
  const [notes, setNotes] = useState('');

  // Persist configurations to localStorage on save
  const handleSaveConfigs = () => {
    localStorage.setItem('print_rr_agency', agency);
    localStorage.setItem('print_rr_docNo', docNo);
    localStorage.setItem('print_rr_subject', subject);
    localStorage.setItem('print_rr_requesterName', requesterName);
    localStorage.setItem('print_rr_requesterPosition', requesterPosition);
    localStorage.setItem('print_rr_budgetAuditorName', budgetAuditorName);
    localStorage.setItem('print_rr_budgetAuditorPosition', budgetAuditorPosition);
    localStorage.setItem('print_rr_comm1Name', comm1Name);
    localStorage.setItem('print_rr_comm1Position', comm1Position);
    localStorage.setItem('print_rr_comm2Name', comm2Name);
    localStorage.setItem('print_rr_comm2Position', comm2Position);
    localStorage.setItem('print_rr_comm3Name', comm3Name);
    localStorage.setItem('print_rr_comm3Position', comm3Position);
    localStorage.setItem('print_rr_directorName', directorName);
    localStorage.setItem('print_rr_directorPosition', directorPosition);
    localStorage.setItem('print_rr_clerkName', clerkName);
    localStorage.setItem('print_rr_clerkPosition', clerkPosition);
    localStorage.setItem('print_rr_mayorName', mayorName);
    localStorage.setItem('print_rr_mayorPosition', mayorPosition);
    alert('บันทึกรายชื่อผู้ลงนามเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!repairRequest || !asset) return null;

  return (
    <div className="memo-print-layout">
      {/* Configuration Sidebar Panel (Screen Only) */}
      <div className="memo-config-sidebar no-print-zone">
        <h3>📝 ตั้งค่าใบแจ้งซ่อม</h3>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            className={`tab-btn ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            ทั่วไป
          </button>
          <button
            type="button"
            className={`tab-btn ${activeSection === 'people' ? 'active' : ''}`}
            onClick={() => setActiveSection('people')}
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            ผู้แจ้ง/งบ
          </button>
          <button
            type="button"
            className={`tab-btn ${activeSection === 'committee' ? 'active' : ''}`}
            onClick={() => setActiveSection('committee')}
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            คณะกรรมการ
          </button>
          <button
            type="button"
            className={`tab-btn ${activeSection === 'executives' ? 'active' : ''}`}
            onClick={() => setActiveSection('executives')}
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            ผู้บริหาร
          </button>
        </div>

        {/* Form Inputs based on active tab */}
        {activeSection === 'general' && (
          <div className="animate-fade-in">
            <div className="form-group">
              <label>ส่วนราชการ</label>
              <input type="text" value={agency} onChange={(e) => setAgency(e.target.value)} />
            </div>
            <div className="form-group">
              <label>เลขที่หนังสือ</label>
              <input type="text" value={docNo} onChange={(e) => setDocNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>วันที่พิมพ์</label>
              <input type="text" value={docDate} onChange={(e) => setDocDate(e.target.value)} placeholder="เช่น 19 มิถุนายน 2569" />
            </div>
            <div className="form-group">
              <label>เรื่อง</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="form-group">
              <label>ประมาณการราคาค่าซ่อม (บาท)</label>
              <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="ระบุจำนวนเงินหากประเมินแล้ว" />
            </div>
            <div className="form-group">
              <label>หมายเหตุเพิ่มเติม (แสดงท้ายบันทึก)</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ข้อความหมายเหตุเพิ่มเติม..." />
            </div>
          </div>
        )}

        {activeSection === 'people' && (
          <div className="animate-fade-in">
            <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--primary-color)' }}>🧑‍💼 ผู้เสนอความเห็น/ผู้รายงาน</div>
            <div className="form-group">
              <label>ชื่อผู้แจ้งซ่อม</label>
              <input type="text" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>ตำแหน่งผู้แจ้งซ่อม</label>
              <input type="text" value={requesterPosition} onChange={(e) => setRequesterPosition(e.target.value)} />
            </div>

            <div style={{ fontWeight: '600', marginTop: '20px', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--primary-color)' }}>💰 ผู้ตรวจสอบงบประมาณ</div>
            <div className="form-group">
              <label>ชื่อผู้ตรวจงบประมาณ</label>
              <input type="text" value={budgetAuditorName} onChange={(e) => setBudgetAuditorName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>ตำแหน่งผู้ตรวจงบประมาณ</label>
              <input type="text" value={budgetAuditorPosition} onChange={(e) => setBudgetAuditorPosition(e.target.value)} />
            </div>
          </div>
        )}

        {activeSection === 'committee' && (
          <div className="animate-fade-in">
            <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--primary-color)' }}>📋 คณะกรรมการตรวจสภาพ (3 คน)</div>
            
            <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '10px', marginBottom: '15px' }}>
              <div className="form-group">
                <label>กรรมการคนที่ 1 (ประธาน)</label>
                <input type="text" value={comm1Name} onChange={(e) => setComm1Name(e.target.value)} />
              </div>
              <div className="form-group">
                <label>ตำแหน่งกรรมการคนที่ 1</label>
                <input type="text" value={comm1Position} onChange={(e) => setComm1Position(e.target.value)} />
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '10px', marginBottom: '15px' }}>
              <div className="form-group">
                <label>กรรมการคนที่ 2</label>
                <input type="text" value={comm2Name} onChange={(e) => setComm2Name(e.target.value)} />
              </div>
              <div className="form-group">
                <label>ตำแหน่งกรรมการคนที่ 2</label>
                <input type="text" value={comm2Position} onChange={(e) => setComm2Position(e.target.value)} />
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: '10px', marginBottom: '15px' }}>
              <div className="form-group">
                <label>กรรมการคนที่ 3</label>
                <input type="text" value={comm3Name} onChange={(e) => setComm3Name(e.target.value)} />
              </div>
              <div className="form-group">
                <label>ตำแหน่งกรรมการคนที่ 3</label>
                <input type="text" value={comm3Position} onChange={(e) => setComm3Position(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'executives' && (
          <div className="animate-fade-in">
            <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--primary-color)' }}>🏢 คณะผู้บริหารระดับสูง</div>
            
            <div style={{ marginBottom: '15px' }}>
              <div className="form-group">
                <label>ชื่อผู้อำนวยการกอง</label>
                <input type="text" value={directorName} onChange={(e) => setDirectorName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>ตำแหน่งผู้อำนวยการกอง</label>
                <input type="text" value={directorPosition} onChange={(e) => setDirectorPosition(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div className="form-group">
                <label>ชื่อปลัดเทศบาล</label>
                <input type="text" value={clerkName} onChange={(e) => setClerkName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>ตำแหน่งปลัดเทศบาล</label>
                <input type="text" value={clerkPosition} onChange={(e) => setClerkPosition(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div className="form-group">
                <label>ชื่อนายกเทศมนตรี</label>
                <input type="text" value={mayorName} onChange={(e) => setMayorName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>ตำแหน่งนายกเทศมนตรี</label>
                <input type="text" value={mayorPosition} onChange={(e) => setMayorPosition(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Buttons Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button onClick={handlePrint} className="button-primary" style={{ padding: '12px', fontSize: '0.95rem' }}>
            🖨️ สั่งพิมพ์ใบแจ้งซ่อม
          </button>
          <button onClick={handleSaveConfigs} className="button-secondary" style={{ padding: '10px' }}>
            💾 บันทึกเป็นค่าเริ่มต้น
          </button>
          <button onClick={onClose} className="button-danger" style={{ padding: '10px', backgroundColor: 'var(--status-damaged-text)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ❌ ปิดหน้าจอนี้
          </button>
        </div>
      </div>

      {/* A4 Live Print Preview Panel */}
      <div className="memo-preview-area">
        <div className="a4-portrait-page">
          
          {/* Memorandum Header Title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Emblem_of_Thailand.svg/120px-Emblem_of_Thailand.svg.png"
              alt="ตราครุฑ"
              style={{ width: '60px', height: 'auto', position: 'absolute', left: '0', top: '0' }}
            />
            <div className="memo-title" style={{ flex: '1', textAlign: 'center', margin: '0 0 20px 0' }}>
              บันทึกข้อความ
            </div>
          </div>

          {/* Memorandum Meta Table */}
          <table className="memo-header-table">
            <tbody>
              <tr>
                <td style={{ width: '55%' }}>
                  <strong>ส่วนราชการ</strong> <span className="dotted-line" style={{ width: '70%' }}>{agency}</span>
                </td>
                <td style={{ width: '45%' }}>
                  &nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ width: '55%' }}>
                  <strong>ที่</strong> <span className="dotted-line" style={{ width: '85%' }}>{docNo}</span>
                </td>
                <td style={{ width: '45%' }}>
                  <strong>วันที่</strong> <span className="dotted-line" style={{ width: '80%' }}>{docDate}</span>
                </td>
              </tr>
              <tr>
                <td colSpan="2" className="memo-subject-line">
                  <strong>เรื่อง</strong> <span className="dotted-line" style={{ width: '90%', fontWeight: 'bold' }}>{subject}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Memorandum Content Body */}
          <div className="memo-body">
            <div style={{ marginBottom: '14px' }}>
              <strong>เรียน</strong> นายกเทศมนตรีตำบลเสาธงหิน (ผ่านปลัดเทศบาลตำบลเสาธงหิน)
            </div>

            <div className="memo-paragraph">
              ด้วยกอง/งาน <span className="dotted-line" style={{ width: '180px', textAlign: 'center' }}>{asset.responsible_department || 'งานพัสดุ'}</span> มีความประสงค์จะขออนุมัติดำเนินการซ่อมแซมทรัพย์สินครุภัณฑ์ประเภท <strong>{asset.category || 'ครุภัณฑ์'}</strong> รหัสครุภัณฑ์ <strong>{asset.asset_code}</strong> รายการ <strong>{asset.name}</strong> ประจำหน่วยงาน ซึ่งได้เกิดการชำรุดเสียหาย โดยมีอาการชำรุดเสียหายคือ <strong>{repairRequest.problem_description}</strong> ส่งผลให้ไม่สามารถใช้งานราชการเพื่อตอบสนองการปฏิบัติงานได้อย่างสมบูรณ์และปกติ
            </div>

            <div className="memo-paragraph">
              ในการนี้ เพื่อให้ครุภัณฑ์ดังกล่าวสามารถนำกลับมาใช้งานราชการได้ตามปกติ ป้องกันมิให้เกิดการชำรุดเสียหายเพิ่มมากขึ้น และเพื่อให้การปฏิบัติราชการเป็นไปด้วยความเรียบร้อย มีประสิทธิภาพสูงสุด จึงขอส่งมอบครุภัณฑ์ดังกล่าวเพื่อเสนอแต่งตั้งคณะกรรมการดำเนินการตรวจสอบสภาพความชำรุดประเมินราคาความเสียหายเพื่อทำการจัดจ้างซ่อมแซมต่อไป
            </div>

            <div className="memo-paragraph" style={{ marginBottom: '24px' }}>
              จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ
            </div>
          </div>

          {/* Requester Signature Grid */}
          <div className="memo-signatures-grid" style={{ marginBottom: '15px' }}>
            <div>&nbsp;</div>
            <div className="memo-signature-block">
              <div style={{ marginBottom: '24px' }}>(ลงชื่อ)............................................................ ผู้แจ้ง/รายงาน</div>
              <div>( {requesterName} )</div>
              <div style={{ fontSize: '14px', color: '#333', marginTop: '2px' }}>ตำแหน่ง {requesterPosition}</div>
            </div>
          </div>

          <div className="memo-section-divider"></div>

          {/* Committee Inspection Section */}
          <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>📋 ความเห็นของเจ้าหน้าที่พัสดุ / บันทึกผลการตรวจสภาพครุภัณฑ์</div>
          <div style={{ textIndent: '1.5cm', fontSize: '14.5px', lineHeight: '1.6' }}>
            ได้ดำเนินการตรวจสอบสภาพความชำรุดเสียหายของครุภัณฑ์ <strong>{asset.name} (รหัส {asset.asset_code})</strong> แล้ว ปรากฏว่าเกิดการชำรุดเสียหายตามสภาพจริงดังกล่าว เห็นควรดำเนินการจัดจ้างซ่อมแซมให้อยู่ในสภาพใช้งานราชการได้ตามปกติ โดยประมาณการค่าซ่อมแซมเบื้องต้นเป็นเงินสุทธิ <span className="dotted-line" style={{ width: '120px', textAlign: 'center', fontWeight: 'bold' }}>{estimatedCost ? parseFloat(estimatedCost).toLocaleString() : '........................'}</span> บาท
          </div>

          {/* Committee Table */}
          <table className="memo-committee-table" style={{ marginTop: '12px' }}>
            <tbody>
              <tr>
                <td style={{ width: '45%' }}>
                  1. (ลงชื่อ)............................................................ ประธานกรรมการ
                  <div style={{ paddingLeft: '50px', fontSize: '13.5px', marginTop: '2px' }}>( {comm1Name} ) {comm1Position}</div>
                </td>
                <td style={{ width: '10%' }}>&nbsp;</td>
                <td style={{ width: '45%' }}>
                  2. (ลงชื่อ)............................................................ กรรมการ
                  <div style={{ paddingLeft: '50px', fontSize: '13.5px', marginTop: '2px' }}>( {comm2Name} ) {comm2Position}</div>
                </td>
              </tr>
              <tr>
                <td style={{ width: '45%', paddingTop: '10px' }}>
                  3. (ลงชื่อ)............................................................ กรรมการ
                  <div style={{ paddingLeft: '50px', fontSize: '13.5px', marginTop: '2px' }}>( {comm3Name} ) {comm3Position}</div>
                </td>
                <td colSpan="2">&nbsp;</td>
              </tr>
            </tbody>
          </table>

          {/* Budget Audit Block */}
          <div className="memo-section-divider" style={{ margin: '15px 0' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14.5px' }}>
            <div style={{ borderRight: '1px solid #ddd', paddingRight: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>💰 การตรวจสอบงบประมาณ</div>
              <div style={{ marginBottom: '8px' }}>[  ] มีงบประมาณเพียงพอเพื่อดำเนินการซ่อมแซม</div>
              <div style={{ marginBottom: '16px' }}>[  ] อื่นๆ ..............................................................</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '18px' }}>(ลงชื่อ)............................................................ ผู้ตรวจ</div>
                <div>( {budgetAuditorName} )</div>
                <div style={{ fontSize: '13px', marginTop: '2px' }}>{budgetAuditorPosition}</div>
              </div>
            </div>
            
            <div style={{ paddingLeft: '5px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>🏢 ความเห็นของผู้อำนวยการกอง</div>
              <div style={{ marginBottom: '24px' }}>เห็นควรเสนอผ่านปลัดเทศบาล เพื่อเสนออนุมัติต่อไป</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '18px' }}>(ลงชื่อ)............................................................ ผอ.กอง</div>
                <div>( {directorName} )</div>
                <div style={{ fontSize: '13px', marginTop: '2px' }}>{directorPosition}</div>
              </div>
            </div>
          </div>

          {/* Executive Clerk & Mayor Approval Block */}
          <div className="memo-section-divider" style={{ margin: '15px 0' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14.5px' }}>
            <div style={{ borderRight: '1px solid #ddd', paddingRight: '15px', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'left' }}>👔 ความเห็นของปลัดเทศบาล</div>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>[  ] เห็นควรอนุมัติเพื่อดำเนินราชการต่อไป</div>
              <div style={{ marginBottom: '18px' }}>(ลงชื่อ)............................................................ ปลัดเทศบาล</div>
              <div>( {clerkName} )</div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>{clerkPosition}</div>
            </div>
            
            <div style={{ paddingLeft: '5px', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'left' }}>👑 คำสั่ง/อนุมัติ นายกเทศมนตรี</div>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>[  ] อนุมัติการแจ้งซ่อมและแต่งตั้งคณะกรรมการ</div>
              <div style={{ marginBottom: '18px' }}>(ลงชื่อ)............................................................ นายกเทศมนตรี</div>
              <div>( {mayorName} )</div>
              <div style={{ fontSize: '13px', marginTop: '2px' }}>{mayorPosition}</div>
            </div>
          </div>

          {/* Footer Notes (If any) */}
          {notes && (
            <div style={{ marginTop: '25px', fontSize: '12px', color: '#555', fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: '8px' }}>
              <strong>หมายเหตุ:</strong> {notes}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
