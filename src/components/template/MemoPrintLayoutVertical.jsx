export default function MemoPrintLayoutVertical({
  asset,
  repairRequest,
  agency,
  docNo,
  docDate,
  subject,
  requesterName,
  requesterPosition,
  estimatedCost,
  comm1Name,
  comm1Position,
  comm2Name,
  comm2Position,
  comm3Name,
  comm3Position,
  budgetAuditorName,
  budgetAuditorPosition,
  directorName,
  directorPosition,
  clerkName,
  clerkPosition,
  mayorName,
  mayorPosition,
  notes,
}) {
  return (
    <div className="a4-portrait-page a4-Vertical-page">
      {/* Memorandum Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        <img
          src="/krut-1.5-cm.png"
          alt="ตราครุฑ"
          style={{ height: '1.5cm', width: 'auto', position: 'absolute', left: '0', top: '0' }}
        />
        <div className="memo-title" style={{ flex: '1', textAlign: 'center', margin: '0 0 20px 0' }}>
          บันทึกข้อความ
        </div>
      </div>

      {/* Memorandum Meta Table */}
      <table className="memo-header-table">
        <tbody>
          <tr>
            <td style={{ width: '97%' }}>
              <strong>ส่วนราชการ</strong> <span className="dotted-line" style={{ width: '80%' }}>{agency}</span>
            </td>
          </tr>
          <tr>
            <td style={{ width: '97%' }}>
              <strong>ที่</strong> <span className="dotted-line" style={{ width: '47%' }}>{docNo}</span>
              <strong>วันที่</strong> <span className="dotted-line" style={{ width: '40%' }}>{docDate}</span>
            </td>
          </tr>
          <tr>
            <td>
              <strong>เรื่อง</strong> <span className="dotted-line" style={{ width: '90%', fontWeight: 'bold' }}>{subject}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Memorandum Content Body */}
      <div className="memo-body">
        <div style={{ marginBottom: '14px' }}>
          <strong>เรียน</strong> นายกเทศมนตรีตำบลเสาธงหิน
        </div>

        <div className="memo-paragraph">
          ด้วยกอง {asset.responsible_department || 'งานพัสดุ'} มีความประสงค์จะขออนุมัติ
          ดำเนินการซ่อมแซมทรัพย์สินครุภัณฑ์ประเภท {asset.category || 'ครุภัณฑ์'} ประจำหน่วยงาน
          รหัสครุภัณฑ์ {asset.asset_code} รายการ {asset.name}
          ซึ่งได้เกิดการชำรุดเสียหาย โดยมีอาการชำรุดเสียหายคือ {repairRequest.problem_description}
          ส่งผลให้ไม่สามารถใช้งานราชการเพื่อตอบสนองการปฏิบัติงานได้อย่างสมบูรณ์และปกติ
        </div>

        <div className="memo-paragraph">
          ในการนี้ เพื่อให้ครุภัณฑ์ดังกล่าวสามารถนำกลับมาใช้งานราชการได้ตามปกติป้องกันมิให้เกิดการชำรุดเสียหายเพิ่มมากขึ้นและเพื่อให้การปฏิบัติราชการเป็นไปด้วยความเรียบร้อยมีประสิทธิภาพสูงสุด จึงขอส่งมอบครุภัณฑ์ดังกล่าวเพื่อเสนอแต่งตั้งคณะกรรมการดำเนินการตรวจสอบสภาพความชำรุดประเมินราคาความเสียหายเพื่อทำการจัดจ้างซ่อมแซมต่อไป
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
  );
}
