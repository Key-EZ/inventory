import { useEffect } from 'react';
import MemoPrintLayoutVertical from './MemoPrintLayoutVertical';

export default function RepairRequestPrint({ repairRequest, asset, onClose }) {
  // Sync printable state class to body
  useEffect(() => {
    document.body.classList.add('modal-print-open');
    return () => {
      document.body.classList.remove('modal-print-open');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!repairRequest || !asset) return null;

  // Retrieve values from localStorage (fallback to defaults if empty)
  const agency = localStorage.getItem('print_rr_agency') || 'เทศบาลตำบลเสาธงหิน';
  const docNo = localStorage.getItem('print_rr_docNo') || 'ทบ. ๕๑๐๐๘/';
  
  let docDate = '';
  if (repairRequest?.request_date) {
    const dateParts = repairRequest.request_date.split('T')[0].split('-');
    if (dateParts.length === 3) {
      docDate = `${dateParts[2]}/${dateParts[1]}/${parseInt(dateParts[0]) + 543}`;
    }
  }

  const subject = localStorage.getItem('print_rr_subject') || 'ขออนุมัติซ่อมแซมครุภัณฑ์';
  const requesterName = localStorage.getItem('print_rr_requesterName') || 'นายสมชาย ใจดี';
  const requesterPosition = localStorage.getItem('print_rr_requesterPosition') || 'เจ้าหน้าที่พัสดุ';
  const budgetAuditorName = localStorage.getItem('print_rr_budgetAuditorName') || 'นางสาวจงดี มีทรัพย์';
  const budgetAuditorPosition = localStorage.getItem('print_rr_budgetAuditorPosition') || 'เจ้าหน้าที่การเงินและบัญชี';
  const comm1Name = localStorage.getItem('print_rr_comm1Name') || 'นายสมบูรณ์ ดีพร้อม';
  const comm1Position = localStorage.getItem('print_rr_comm1Position') || 'นายช่างโยธา';
  const comm2Name = localStorage.getItem('print_rr_comm2Name') || 'นายรักชาติ ยิ่งชีพ';
  const comm2Position = localStorage.getItem('print_rr_comm2Position') || 'เจ้าพนักงานธุรการ';
  const comm3Name = localStorage.getItem('print_rr_comm3Name') || 'นายวิทยา เก่งกาจ';
  const comm3Position = localStorage.getItem('print_rr_comm3Position') || 'เจ้าพนักงานพัสดุ';
  const directorName = localStorage.getItem('print_rr_directorName') || 'นายวิเชียร ยอดแก้ว';
  const directorPosition = localStorage.getItem('print_rr_directorPosition') || 'ผู้อำนวยการกองช่าง';
  const clerkName = localStorage.getItem('print_rr_clerkName') || 'นายอดิศร วงศ์เจริญ';
  const clerkPosition = localStorage.getItem('print_rr_clerkPosition') || 'ปลัดเทศบาลตำบลเสาธงหิน';
  const mayorName = localStorage.getItem('print_rr_mayorName') || 'นายเกรียงไกร ไตรธรรม';
  const mayorPosition = localStorage.getItem('print_rr_mayorPosition') || 'นายกเทศมนตรีตำบลเสาธงหิน';
  const estimatedCost = repairRequest?.repair_cost ? String(repairRequest.repair_cost) : '';
  const notes = '';

  return (
    <div className="memo-print-layout">
      <div className="memo-preview-area">
        <div className="no-print-zone" style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
          <button onClick={handlePrint} className="print-btn">
            🖨️ สั่งพิมพ์เอกสาร
          </button>
          <button onClick={onClose} className="print-btn print-btn-close">
            ❌ ปิดหน้าต่าง
          </button>
        </div>
        <MemoPrintLayoutVertical
          asset={asset}
          repairRequest={repairRequest}
          agency={agency}
          docNo={docNo}
          docDate={docDate}
          subject={subject}
          requesterName={requesterName}
          requesterPosition={requesterPosition}
          estimatedCost={estimatedCost}
          comm1Name={comm1Name}
          comm1Position={comm1Position}
          comm2Name={comm2Name}
          comm2Position={comm2Position}
          comm3Name={comm3Name}
          comm3Position={comm3Position}
          budgetAuditorName={budgetAuditorName}
          budgetAuditorPosition={budgetAuditorPosition}
          directorName={directorName}
          directorPosition={directorPosition}
          clerkName={clerkName}
          clerkPosition={clerkPosition}
          mayorName={mayorName}
          mayorPosition={mayorPosition}
          notes={notes}
        />
      </div>
    </div>
  );
}
