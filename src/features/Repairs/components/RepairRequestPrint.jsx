import { useEffect, useRef } from 'react';
import MemoPrintLayoutVertical from './MemoPrintLayoutVertical';

export default function RepairRequestPrint({ repairRequest, asset, onClose, currentUser, custodians }) {
  const memoRef = useRef(null);

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
  
  const docDate = repairRequest?.request_date || '';

  const subject = localStorage.getItem('print_rr_subject') || 'ขออนุมัติซ่อมแซมครุภัณฑ์';
  
  // Resolve reporter from currently logged-in user
  let requesterName = localStorage.getItem('print_rr_requesterName') || 'นายสมชาย ใจดี';
  let requesterPosition = localStorage.getItem('print_rr_requesterPosition') || 'เจ้าหน้าที่พัสดุ';

  if (currentUser) {
    const loggedInCustodian = custodians?.find(
      (c) => c.email?.toLowerCase() === currentUser.email?.toLowerCase()
    );
    if (loggedInCustodian) {
      requesterName = loggedInCustodian.name;
      requesterPosition = loggedInCustodian.position || 'เจ้าหน้าที่';
    } else {
      requesterName = currentUser.name || 'ผู้ดูแลระบบ';
      requesterPosition = currentUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่';
    }
  }

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

  const handleExportDoc = async () => {
    const element = memoRef.current;
    if (!element) return;
    
    let htmlContent = element.innerHTML;

    // Convert relative Garuda path to Base64 so it works offline and in Word
    let base64Krut = '';
    try {
      const response = await fetch(window.location.origin + '/krut-1.5-cm.png');
      const blob = await response.blob();
      base64Krut = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Failed to load Garuda image as base64', e);
    }

    if (base64Krut) {
      htmlContent = htmlContent.replace('/krut-1.5-cm.png', base64Krut);
    }

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>บันทึกข้อความ</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4 portrait;
      margin: 25mm 20mm 20mm 30mm;
    }
    body {
      font-family: 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', Arial, sans-serif;
      font-size: 16pt;
      line-height: 1.5;
      color: #000000;
    }
    strong { font-weight: bold; }
    img { height: 1.5cm; width: auto; }
    .memo-title { text-align: center; font-size: 29pt; font-weight: bold; margin-bottom: 20px; }
    .memo-header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .memo-header-table td { padding: 4px 0; vertical-align: bottom; }
    .memo-body { text-align: justify; margin-bottom: 20px; }
    .memo-paragraph { text-indent: 2.5cm; margin-bottom: 12px; line-height: 1.6; text-align: justify; }
    .memo-signatures-grid { width: 100%; margin-top: 15px; margin-bottom: 15px; }
    .memo-signature-block { text-align: center; }
    .memo-section-divider { border-top: 1px dashed #000000; margin: 15px 0; padding-top: 10px; }
    .memo-committee-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .memo-committee-table td { padding: 6px 0; vertical-align: middle; }
    .dotted-line { border-bottom: 1px dotted #000000; display: inline-block; }
  </style>
</head>
<body>`;
    const footer = `</body></html>`;

    const fullHtml = header + htmlContent + footer;
    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const cleanAssetCode = asset.asset_code ? asset.asset_code.replace(/\//g, '-') : 'unknown';
    a.download = `บันทึกข้อความ_แจ้งซ่อม_${cleanAssetCode}.doc`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="memo-print-layout">
      {/* Dynamic style override to force portrait printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait !important;
            margin: 25mm 20mm 20mm 30mm !important;
          }
        }
      `}</style>
      <div className="memo-preview-area">
        <div className="no-print-zone" style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
          <button onClick={handlePrint} className="print-btn">
            🖨️ สั่งพิมพ์เอกสาร
          </button>
          <button onClick={handleExportDoc} className="print-btn" style={{ backgroundColor: '#185abd', borderColor: '#185abd', color: '#ffffff' }}>
            📝 ส่งออกไฟล์ Word (.doc)
          </button>
          <button onClick={onClose} className="print-btn print-btn-close">
            ❌ ปิดหน้าต่าง
          </button>
        </div>
        <div ref={memoRef}>
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
    </div>
  );
}
