import { useState } from 'react';
import { csvToAssets } from '../../../../utils/csvParser';

export default function DataManagementTab({ assets = [], onImportAssets }) {
  const [importMode, setImportMode] = useState('merge'); // 'merge', 'replace'
  const [previewData, setPreviewData] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(assets, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `inventory_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error('Export failed', e);
      alert('ไม่สามารถส่งออกข้อมูลได้');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    const isJson = file.name.endsWith('.json');
    const isCsv = file.name.endsWith('.csv');

    if (!isJson && !isCsv) {
      alert('กรุณาเลือกไฟล์ .json หรือ .csv เท่านั้น');
      return;
    }

    reader.onload = (e) => {
      const text = e.target.result;
      try {
        let assetsList = [];
        if (isJson) {
          assetsList = JSON.parse(text);
          if (!Array.isArray(assetsList)) {
            throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง (ต้องเป็นรายการอาร์เรย์ของทรัพย์สิน)');
          }
        } else if (isCsv) {
          assetsList = csvToAssets(text);
        }

        // Validate preview
        const rowErrors = [];
        const validatedList = assetsList.map((item, idx) => {
          const rowNum = idx + 1;
          const errors = [];
          if (!item.name) errors.push('ไม่มีชื่อพัสดุ');
          if (!item.asset_code) errors.push('ไม่มีรหัสพัสดุ');
          if (!item.category) errors.push('ไม่มีหมวดหมู่');
          if (!item.asset_type || (item.asset_type !== 'LAND_BUILDING' && item.asset_type !== 'EQUIPMENT')) {
            errors.push('ประเภทไม่ถูกต้อง (ต้องเป็น LAND_BUILDING หรือ EQUIPMENT)');
          }
          if (errors.length > 0) {
            rowErrors.push(`แถวที่ ${rowNum}: ${errors.join(', ')}`);
          }
          return {
            ...item,
            _rowNum: rowNum,
            _errors: errors
          };
        });

        setPreviewData(validatedList);
        setParseErrors(rowErrors);
        setImportResult(null);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = async () => {
    const validItems = previewData.filter(item => item._errors.length === 0);
    if (validItems.length === 0) {
      alert('ไม่มีข้อมูลที่ถูกต้องในการนำเข้า');
      return;
    }

    if (importMode === 'replace') {
      if (!window.confirm('คำเตือน: คุณเลือกการนำเข้าแบบเขียนทับทั้งหมด (Replace) ข้อมูลทรัพย์สินเดิมของคุณจะถูกลบและแทนที่ด้วยข้อมูลใหม่ ยืนยันการดำเนินการหรือไม่?')) {
        return;
      }
    }

    const cleanItems = validItems.map(item => {
      const copy = { ...item };
      delete copy._rowNum;
      delete copy._errors;
      return copy;
    });
    
    try {
      const result = await onImportAssets(cleanItems, importMode);
      setImportResult(result);
      setPreviewData([]);
      setParseErrors([]);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + err.message);
    }
  };

  const handleCancelImport = () => {
    setPreviewData([]);
    setParseErrors([]);
    setImportResult(null);
  };

  return (
    <div className="layout-card animate-fade-in" style={{ padding: '24px' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
        📂 จัดการและสำรองข้อมูลครุภัณฑ์
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Export Card */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '12px', fontSize: '1.1rem' }}>
              📥 ส่งออกข้อมูล (Backup)
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '20px' }}>
              ส่งออกข้อมูลทะเบียนครุภัณฑ์และสิ่งก่อสร้างทั้งหมดในระบบเป็นไฟล์ JSON (.json) เพื่อใช้เป็นข้อมูลสำรอง หรือนำไปย้ายเข้าสู่ระบบในเครื่องคอมพิวเตอร์อื่น
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleExportJSON}
            className="button-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            💾 ส่งออกข้อมูลพัสดุทั้งหมด (JSON)
          </button>
        </div>

        {/* Import Config Card */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>
            ⚙️ การตั้งค่าสำหรับการนำเข้า
          </h4>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>รูปแบบการนำเข้าข้อมูล (Import Mode)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  name="importMode" 
                  value="merge" 
                  checked={importMode === 'merge'} 
                  onChange={() => setImportMode('merge')} 
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong>นำเข้าแบบอัปเดตและเพิ่มใหม่ (Merge)</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                    หากตรวจพบรหัสพัสดุ (asset_code) ตรงกัน ระบบจะอัปเดตข้อมูลพัสดุแถวนั้นด้วยข้อมูลใหม่ หากยังไม่มีจะทำการเพิ่มรายการใหม่เข้าไป
                  </div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '4px' }}>
                <input 
                  type="radio" 
                  name="importMode" 
                  value="replace" 
                  checked={importMode === 'replace'} 
                  onChange={() => setImportMode('replace')} 
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong style={{ color: 'var(--status-damaged-text)' }}>นำเข้าแบบเขียนทับทั้งหมด (Replace)</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                    ล้างฐานข้อมูลครุภัณฑ์เดิมทั้งหมดในเครื่อง และใช้รายการพัสดุจากไฟล์ที่อัปโหลดเข้าแทนที่ (แนะนำให้ส่งออกข้อมูลเก็บไว้ก่อนทำการสำรองด้วยวิธีนี้)
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Import Dropzone / File Picker */}
      {!previewData.length && !importResult && (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('import-file-input').click()}
          style={{
            border: dragActive ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
            backgroundColor: dragActive ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}
        >
          <input 
            id="import-file-input"
            type="file" 
            accept=".json,.csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📂</div>
          <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '6px' }}>
            ลากและวางไฟล์สำรอง (.json) หรือ ไฟล์ตาราง (.csv) ที่นี่
          </strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '12px' }}>
            รองรับไฟล์ข้อมูลรูปแบบ JSON หรือไฟล์ CSV ที่มีส่วนหัวตามที่กำหนดในระบบ
          </span>
          <button type="button" className="button-secondary" style={{ pointerEvents: 'none' }}>
            เลือกไฟล์จากเครื่องคอมพิวเตอร์
          </button>
        </div>
      )}

      {/* Import Result Feedback */}
      {importResult && (
        <div style={{ 
          backgroundColor: importResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: importResult.success ? '1px solid var(--status-active-text)' : '1px solid var(--status-damaged-text)',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          color: importResult.success ? 'var(--status-active-text)' : 'var(--status-damaged-text)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>
            {importResult.success ? '✅ นำเข้าข้อมูลสำเร็จเรียบร้อย!' : '❌ การนำเข้าข้อมูลล้มเหลว'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
            {importResult.success && `ระบบได้ดำเนินการประมวลผลข้อมูลในไฟล์แล้ว โดยมีรายละเอียดดังนี้: เพิ่มข้อมูลครุภัณฑ์ใหม่ ${importResult.added} รายการ, อัปเดตข้อมูลพัสดุเดิม ${importResult.updated} รายการ`}
            {!importResult.success && importResult.errors && importResult.errors.join(', ')}
          </p>
          {importResult.errors && importResult.errors.length > 0 && (
            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px' }}>
              <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>คำเตือน / ข้อผิดพลาดบางรายการ ({importResult.errors.length}):</strong>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <button 
            type="button" 
            className="button-secondary" 
            onClick={() => setImportResult(null)} 
            style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            ตกลง
          </button>
        </div>
      )}

      {/* Validation Errors Panel */}
      {parseErrors.length > 0 && (
        <div style={{ 
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid var(--status-pending-text)',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          color: 'var(--status-pending-text)'
        }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>
            ⚠️ พบข้อผิดพลาดหรือข้อมูลที่ไม่สมบูรณ์ ({parseErrors.length} แถว)
          </h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem' }}>
            แถวเหล่านี้มีคุณสมบัติที่จำเป็นไม่ถูกต้องหรือไม่ครบถ้วน (เช่น ไม่มีรหัสพัสดุ ไม่มีชื่อ หรือไม่มีหมวดหมู่) และจะไม่ถูกนำเข้าระบบ
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.75rem', maxHeight: '120px', overflowY: 'auto' }}>
            {parseErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Section */}
      {previewData.length > 0 && (
        <div className="animate-fade-in" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0 }}>
              👀 พรีวิวข้อมูลก่อนนำเข้า ({previewData.filter(item => item._errors.length === 0).length} / {previewData.length} รายการที่สมบูรณ์)
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-cancel" onClick={handleCancelImport} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                ยกเลิก
              </button>
              <button 
                type="button" 
                className="button-primary" 
                onClick={handleConfirmImport} 
                disabled={previewData.filter(item => item._errors.length === 0).length === 0}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                🚀 ยืนยันนำเข้าข้อมูล
              </button>
            </div>
          </div>

          <div className="settings-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table className="settings-table">
              <thead>
                <tr>
                  <th style={{ width: '8%' }}>แถว</th>
                  <th style={{ width: '15%' }}>รหัสพัสดุ</th>
                  <th style={{ width: '30%' }}>รายการพัสดุ / ชื่อ</th>
                  <th style={{ width: '15%' }}>ประเภท/หมวดหมู่</th>
                  <th style={{ width: '15%' }}>หน่วยงานดูแล/สถานที่</th>
                  <th style={{ width: '17%' }}>ตรวจสอบความถูกต้อง</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, index) => {
                  const hasError = item._errors.length > 0;
                  return (
                    <tr key={index} style={{ backgroundColor: hasError ? 'rgba(239, 68, 68, 0.05)' : 'inherit' }}>
                      <td>{item._rowNum}</td>
                      <td style={{ fontWeight: '600' }}>{item.asset_code || '-'}</td>
                      <td>
                        <div>{item.name || <em style={{ color: 'red' }}>(ไม่มีชื่อ)</em>}</div>
                        {item.manufacturer_brand && (
                          <small style={{ color: 'var(--text-muted)' }}>ยี่ห้อ: {item.manufacturer_brand}</small>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginRight: '4px' }}>
                          {item.asset_type === 'LAND_BUILDING' ? 'ที่ดิน/อาคาร' : 'ครุภัณฑ์'}
                        </span>
                        <small>{item.category || '-'}</small>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{item.responsible_department || '-'}</div>
                        <small style={{ color: 'var(--text-muted)' }}>📍 {item.location || '-'}</small>
                      </td>
                      <td>
                        {hasError ? (
                          <span style={{ color: 'var(--status-damaged-text)', fontWeight: '600', fontSize: '0.75rem' }}>
                            ❌ ไม่สมบูรณ์: {item._errors.join(', ')}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--status-active-text)', fontWeight: '600', fontSize: '0.75rem' }}>
                             สมบูรณ์พร้อมนำเข้า
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
