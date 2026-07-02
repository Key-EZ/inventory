import { useState } from 'react';

export default function RepairPrintTab() {
  const [printConfig, setPrintConfig] = useState(() => ({
    agency: localStorage.getItem('print_rr_agency') || 'เทศบาลตำบลเสาธงหิน',
    docNo: localStorage.getItem('print_rr_docNo') || 'ทบ. ๕๑๐๐๘/',
    subject: localStorage.getItem('print_rr_subject') || 'ขออนุมัติซ่อมแซมครุภัณฑ์',
    requesterName: localStorage.getItem('print_rr_requesterName') || 'นายสมชาย ใจดี',
    requesterPosition: localStorage.getItem('print_rr_requesterPosition') || 'เจ้าหน้าที่พัสดุ',
    budgetAuditorName: localStorage.getItem('print_rr_budgetAuditorName') || 'นางสาวจงดี มีทรัพย์',
    budgetAuditorPosition: localStorage.getItem('print_rr_budgetAuditorPosition') || 'เจ้าหน้าที่การเงินและบัญชี',
    comm1Name: localStorage.getItem('print_rr_comm1Name') || 'นายสมบูรณ์ ดีพร้อม',
    comm1Position: localStorage.getItem('print_rr_comm1Position') || 'นายช่างโยธา',
    comm2Name: localStorage.getItem('print_rr_comm2Name') || 'นายรักชาติ ยิ่งชีพ',
    comm2Position: localStorage.getItem('print_rr_comm2Position') || 'เจ้าพนักงานธุรการ',
    comm3Name: localStorage.getItem('print_rr_comm3Name') || 'นายวิทยา เก่งกาจ',
    comm3Position: localStorage.getItem('print_rr_comm3Position') || 'เจ้าพนักงานพัสดุ',
    directorName: localStorage.getItem('print_rr_directorName') || 'นายวิเชียร ยอดแก้ว',
    directorPosition: localStorage.getItem('print_rr_directorPosition') || 'ผู้อำนวยการกองช่าง',
    clerkName: localStorage.getItem('print_rr_clerkName') || 'นายอดิศร วงศ์เจริญ',
    clerkPosition: localStorage.getItem('print_rr_clerkPosition') || 'ปลัดเทศบาลตำบลเสาธงหิน',
    mayorName: localStorage.getItem('print_rr_mayorName') || 'นายเกรียงไกร ไตรธรรม',
    mayorPosition: localStorage.getItem('print_rr_mayorPosition') || 'นายกเทศมนตรีตำบลเสาธงหิน',
    ledgerAgency: localStorage.getItem('print_ledger_agency') || 'เทศบาลตำบลเสาธงหิน',
    ledgerOffice: localStorage.getItem('print_ledger_office') || '',
    ledgerAmphoe: localStorage.getItem('print_ledger_amphoe') || 'บางใหญ่',
    ledgerProvince: localStorage.getItem('print_ledger_province') || 'นนทบุรี'
  }));

  const handlePrintConfigChange = (e) => {
    const { name, value } = e.target;
    setPrintConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveRepairPrintSettings = (e) => {
    e.preventDefault();
    Object.entries(printConfig).forEach(([key, value]) => {
      if (['ledgerAgency', 'ledgerOffice', 'ledgerAmphoe', 'ledgerProvince'].includes(key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        localStorage.setItem(`print_${snakeKey}`, value);
      } else {
        localStorage.setItem(`print_rr_${key}`, value);
      }
    });
    alert('บันทึกการตั้งค่าข้อมูลการพิมพ์เรียบร้อยแล้ว');
  };

  return (
    <form onSubmit={handleSaveRepairPrintSettings} className="layout-card animate-fade-in" style={{ padding: '24px' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>🔧 การตั้งค่าข้อมูลและการพิมพ์เอกสาร</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Group 0: Ledger print configuration */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>📋 ข้อมูลทะเบียนคุมพัสดุ (พ.ด.1/พ.ด.2)</h4>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>ส่วนราชการหลัก</label>
            <input type="text" name="ledgerAgency" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerAgency} onChange={handlePrintConfigChange} />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>หน่วยงาน/สำนักงาน (เว้นว่างเพื่ออิงตามแผนกผู้ดูแล)</label>
            <input type="text" name="ledgerOffice" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerOffice} onChange={handlePrintConfigChange} placeholder="เช่น กองช่าง" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>อำเภอ</label>
              <input type="text" name="ledgerAmphoe" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerAmphoe} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>จังหวัด</label>
              <input type="text" name="ledgerProvince" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerProvince} onChange={handlePrintConfigChange} />
            </div>
          </div>
        </div>

        {/* Group 1: General document meta */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>📝 ข้อมูลเอกสารทั่วไป</h4>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>ชื่อส่วนราชการ</label>
            <input type="text" name="agency" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.agency} onChange={handlePrintConfigChange} />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>เลขที่หนังสือเริ่มต้น</label>
            <input type="text" name="docNo" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.docNo} onChange={handlePrintConfigChange} />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>เรื่อง</label>
            <input type="text" name="subject" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.subject} onChange={handlePrintConfigChange} />
          </div>
        </div>

        {/* Group 2: Requester & Budget Auditor */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>🧑‍💼 ผู้เสนอเรื่อง & ตรวจงบประมาณ</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div className="form-group">
              <label>ชื่อผู้เสนอ/แจ้งซ่อม</label>
              <input type="text" name="requesterName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.requesterName} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="requesterPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.requesterPosition} onChange={handlePrintConfigChange} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <div className="form-group">
              <label>ชื่อผู้ตรวจงบประมาณ</label>
              <input type="text" name="budgetAuditorName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.budgetAuditorName} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="budgetAuditorPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.budgetAuditorPosition} onChange={handlePrintConfigChange} />
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
              <input type="text" name="comm1Name" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm1Name} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="comm1Position" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm1Position} onChange={handlePrintConfigChange} />
            </div>
          </div>
          
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 2 (กรรมการ)</strong>
            <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
              <label>ชื่อ-นามสกุล</label>
              <input type="text" name="comm2Name" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm2Name} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="comm2Position" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm2Position} onChange={handlePrintConfigChange} />
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 3 (กรรมการ)</strong>
            <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
              <label>ชื่อ-นามสกุล</label>
              <input type="text" name="comm3Name" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm3Name} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="comm3Position" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm3Position} onChange={handlePrintConfigChange} />
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
              <input type="text" name="directorName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.directorName} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="directorPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.directorPosition} onChange={handlePrintConfigChange} />
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ปลัดเทศบาล</strong>
            <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
              <label>ชื่อ-นามสกุล</label>
              <input type="text" name="clerkName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.clerkName} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="clerkPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.clerkPosition} onChange={handlePrintConfigChange} />
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>นายกเทศมนตรี</strong>
            <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
              <label>ชื่อ-นามสกุล</label>
              <input type="text" name="mayorName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.mayorName} onChange={handlePrintConfigChange} />
            </div>
            <div className="form-group">
              <label>ตำแหน่ง</label>
              <input type="text" name="mayorPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.mayorPosition} onChange={handlePrintConfigChange} />
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
  );
}
