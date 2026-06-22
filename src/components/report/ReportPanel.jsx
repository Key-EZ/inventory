import { useState, useMemo } from 'react';
import { formatThaiDateString } from '../../utils/dateUtils';

const landTypes = ['LAND_BUILDING'];

export default function ReportPanel({ assets = [], locations = [] }) {
  // --- States ---
  const [activeLedger, setActiveLedger] = useState('pd2'); // 'pd1', 'pd2', 'pd3'
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('ทั้งหมด');
  const [filterDepartment, setFilterDepartment] = useState('ทั้งหมด');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [filterYear, setFilterYear] = useState('ทั้งหมด');

  // Helper mapping: Category mapping for custom formatting/code parsing
  const getCategoryDetails = (asset) => {
    const codeStr = asset.asset_code || '';
    const parts = codeStr.split('-');
    let code = '311';
    if (parts.length >= 1) {
      code = parts[0].trim();
    }
    const mapping = {
      '101': 'ที่ดินที่มีกรรมสิทธิ์',
      '102': 'อาคารสำนักงาน',
      '103': 'สิ่งปลูกสร้าง',
      '311': 'ครุภัณฑ์สำนักงาน',
      '312': 'ครุภัณฑ์ยานพาหนะและขนส่ง',
      '313': 'ครุภัณฑ์ไฟฟ้าและวิทยุ',
      '314': 'ครุภัณฑ์โฆษณาและเผยแพร่',
      '315': 'ครุภัณฑ์งานบ้านงานครัว',
      '316': 'ครุภัณฑ์วิทยาศาสตร์และการแพทย์',
      '317': 'ครุภัณฑ์กีฬา',
      '412': 'ครุภัณฑ์คอมพิวเตอร์',
      '501': 'สินทรัพย์ไม่มีตัวตนอื่น'
    };
    return { code, name: asset.category || mapping[code] || 'ครุภัณฑ์ประเภทอื่น' };
  };

  // --- Extract Filter Options ---
  const departmentsList = useMemo(() => {
    const depts = new Set(assets.map(a => a.responsible_department).filter(Boolean));
    return ['ทั้งหมด', ...Array.from(depts)];
  }, [assets]);

  const yearsList = useMemo(() => {
    const years = new Set(
      assets
        .map(a => {
          const code = a.asset_code || '';
          const parts = code.split('-');
          if (parts.length >= 2) {
            const yr = parseInt(parts[1]);
            return isNaN(yr) ? null : yr;
          }
          return null;
        })
        .filter(Boolean)
    );
    return ['ทั้งหมด', ...Array.from(years).sort((a, b) => b - a)];
  }, [assets]);

  // --- Filter Logic ---
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      // 1. Text Search (ID, Name, Custodian)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesText =
          (item.asset_code || '').toLowerCase().includes(q) ||
          (item.name || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q) ||
          (item.responsible_department || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q) ||
          (item.manufacturer_brand || '').toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // 2. Status
      if (filterStatus !== 'ทั้งหมด' && item.status !== filterStatus) {
        return false;
      }

      // 3. Location
      if (filterLocation !== 'ทั้งหมด' && item.location !== filterLocation) {
        return false;
      }

      // 4. Department
      if (filterDepartment !== 'ทั้งหมด' && item.responsible_department !== filterDepartment) {
        return false;
      }

      // 5. Acquisition Year
      if (filterYear !== 'ทั้งหมด') {
        const code = item.asset_code || '';
        const parts = code.split('-');
        if (parts.length >= 2) {
          const yr = parseInt(parts[1]);
          if (yr !== parseInt(filterYear)) return false;
        } else {
          return false;
        }
      }

      return true;
    });
  }, [assets, searchQuery, filterStatus, filterLocation, filterDepartment, filterYear]);

  // --- Split into พ.ด. 1 (Land & Buildings) and พ.ด. 2 (Equipment) ---
  const pd1Assets = useMemo(() => {
    return filteredAssets.filter(item => landTypes.includes(item.asset_type));
  }, [filteredAssets]);

  const pd2Assets = useMemo(() => {
    return filteredAssets.filter(item => !landTypes.includes(item.asset_type));
  }, [filteredAssets]);

  // --- พ.ด. 3 Aggregates ---
  const pd3Summaries = useMemo(() => {
    const groups = {};
    filteredAssets.forEach(item => {
      const { code, name } = getCategoryDetails(item);
      if (!groups[code]) {
        groups[code] = {
          code,
          name,
          count: 0,
          totalCost: 0,
          totalDepreciation: 0,
          totalBookValue: 0
        };
      }
      groups[code].count += 1;
      groups[code].totalCost += item.unit_price || 0;
      groups[code].totalDepreciation += item.accumulated_depreciation || 0;
      groups[code].totalBookValue += item.book_value || 0;
    });

    return Object.values(groups).sort((a, b) => a.code.localeCompare(b.code));
  }, [filteredAssets]);

  // --- Calculations for Stats Cards ---
  const activeAssetsList = activeLedger === 'pd1' ? pd1Assets : activeLedger === 'pd2' ? pd2Assets : filteredAssets;

  const stats = useMemo(() => {
    const count = activeAssetsList.length;
    const totalCost = activeAssetsList.reduce((sum, item) => sum + (item.unit_price || 0), 0);
    const totalDepreciation = activeAssetsList.reduce((sum, item) => sum + (item.accumulated_depreciation || 0), 0);
    const totalBookValue = activeAssetsList.reduce((sum, item) => sum + (item.book_value || 0), 0);

    return { count, totalCost, totalDepreciation, totalBookValue };
  }, [activeAssetsList]);

  // --- Handlers ---
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterLocation('ทั้งหมด');
    setFilterDepartment('ทั้งหมด');
    setFilterStatus('ทั้งหมด');
    setFilterYear('ทั้งหมด');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers;
    let rows;
    let filename;

    if (activeLedger === 'pd1') {
      filename = `ทะเบียนที่ดินและสิ่งก่อสร้าง_พด1_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        "เลขรหัสพัสดุ",
        "หมวดหมู่ทรัพย์สิน",
        "ชื่อพัสดุ",
        "ที่ตั้งของพัสดุ",
        "ลักษณะการได้กรรมสิทธิ์",
        "เลขที่ใบส่งของ/สัญญา",
        "วันเดือนปีเอกสาร",
        "ผู้ขาย",
        "ราคาต่อหน่วย",
        "เจ้าของงบประมาณ",
        "ส่วนราชการดูแลรับผิดชอบ",
        "เอกสารสิทธิ์",
        "เนื้อที่",
        "ลักษณะโรงเรือน",
        "สถานะ"
      ];
      rows = pd1Assets.map(item => [
        item.asset_code || '',
        item.category || '',
        item.name || '',
        item.location || '',
        item.acquisition_method || '',
        item.delivery_document_no || '',
        item.delivery_document_date || '',
        item.seller_name || '',
        item.unit_price || 0,
        item.budget_owner || '',
        item.responsible_department || '',
        item.document_of_title || '',
        item.area_size || '',
        item.building_style || '',
        item.status || ''
      ]);
    } else if (activeLedger === 'pd2') {
      filename = `ทะเบียนครุภัณฑ์_พด2_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        "เลขรหัสพัสดุ",
        "หมวดหมู่ครุภัณฑ์",
        "ชื่อครุภัณฑ์",
        "ยี่ห้อ",
        "เลขที่ใบส่งของ/สัญญา",
        "วันเดือนปีเอกสาร",
        "ผู้ขาย",
        "ราคาต่อหน่วย",
        "อัตราค่าเสื่อม (%)",
        "ค่าเสื่อมสะสม",
        "มูลค่าคงเหลือสุทธิ",
        "สถานที่ตั้ง",
        "หน่วยดูแลรับผิดชอบ",
        "Serial Number",
        "หมายเลขทะเบียนรถ",
        "สีพัสดุ",
        "สถานะ"
      ];
      rows = pd2Assets.map(item => [
        item.asset_code || '',
        item.category || '',
        item.name || '',
        item.manufacturer_brand || '',
        item.delivery_document_no || '',
        item.delivery_document_date || '',
        item.seller_name || '',
        item.unit_price || 0,
        item.depreciation_rate_percent || 0,
        item.accumulated_depreciation || 0,
        item.book_value || 0,
        item.location || '',
        item.responsible_department || '',
        item.serial_number || '',
        item.vehicle_registration || '',
        item.color || '',
        item.status || ''
      ]);
    } else {
      filename = `บัญชีงบหน้าประจำเลขรหัสพัสดุ_พด3_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        "รหัสประเภทพัสดุ (3 หลักแรก)",
        "ประเภทพัสดุหลัก",
        "จำนวนรายการ",
        "มูลค่าราคาทุนรวม",
        "ค่าเสื่อมสะสมรวม",
        "มูลค่าคงเหลือสุทธิรวม"
      ];
      rows = pd3Summaries.map(item => [
        item.code,
        item.name,
        item.count,
        item.totalCost,
        item.totalDepreciation,
        item.totalBookValue
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const themeClasses = {
    pd1: 'ledger-pd1',
    pd2: 'ledger-pd2',
    pd3: 'ledger-pd3'
  };

  return (
    <div className={`report-panel-container ${themeClasses[activeLedger]}`}>
      {/* 1. Ledger Selector Tabs */}
      <div className="report-ledger-tabs no-print">
        <button
          className={`ledger-tab-btn pd1-btn ${activeLedger === 'pd1' ? 'active' : ''}`}
          onClick={() => setActiveLedger('pd1')}
        >
          🟢 ทะเบียน พ.ด.1 (ที่ดินและสิ่งก่อสร้าง)
        </button>
        <button
          className={`ledger-tab-btn pd2-btn ${activeLedger === 'pd2' ? 'active' : ''}`}
          onClick={() => setActiveLedger('pd2')}
        >
          🟡 ทะเบียน พ.ด.2 (ครุภัณฑ์และสัตว์พาหนะ)
        </button>
        <button
          className={`ledger-tab-btn pd3-btn ${activeLedger === 'pd3' ? 'active' : ''}`}
          onClick={() => setActiveLedger('pd3')}
        >
          🟠 บัญชี พ.ด.3 (งบหน้ารหัสพัสดุ)
        </button>
      </div>

      {/* 2. Dynamic KPI Cards */}
      <div className="report-stats-grid no-print">
        <div className="report-stat-card card-count">
          <span className="stat-label">จำนวนรายการ</span>
          <div className="stat-value">{stats.count} <span className="stat-unit">รายการ</span></div>
          <span className="stat-desc">ตามเงื่อนไขตัวกรองปัจจุบัน</span>
        </div>
        <div className="report-stat-card card-cost">
          <span className="stat-label">มูลค่าราคาทุนรวม</span>
          <div className="stat-value">฿{stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="stat-desc">ราคาทุนจัดหาเริ่มแรก</span>
        </div>
        {activeLedger !== 'pd1' && (
          <>
            <div className="report-stat-card card-depreciation">
              <span className="stat-label">ค่าเสื่อมราคาสะสมรวม</span>
              <div className="stat-value">฿{stats.totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span className="stat-desc">ค่าเสื่อมประเมินตามรหัสและราคาทุน</span>
            </div>
            <div className="report-stat-card card-bookvalue">
              <span className="stat-label">มูลค่าคงเหลือสุทธิรวม (Book Value)</span>
              <div className="stat-value">฿{stats.totalBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span className="stat-desc">หลังหักค่าเสื่อมสะสม (ขั้นต่ำ 1 บ.)</span>
            </div>
          </>
        )}
      </div>

      {/* 3. Filter Section */}
      <div className="layout-card report-filter-card no-print">
        <div className="filter-panel-header">
          <h3>🔍 ค้นหาและคัดกรองสำหรับรายงาน</h3>
          {(searchQuery || filterLocation !== 'ทั้งหมด' || filterDepartment !== 'ทั้งหมด' || filterStatus !== 'ทั้งหมด' || filterYear !== 'ทั้งหมด') && (
            <button className="btn-clear-filter" onClick={handleClearFilters}>
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>

        <div className="filter-grid">
          <div className="filter-group-item">
            <label>ค้นหาข้อความ</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="รหัส, ชื่อพัสดุ, ยี่ห้อ..."
              className="filter-input-element"
            />
          </div>

          <div className="filter-group-item">
            <label>สถานที่ตั้ง</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="filter-input-element"
            >
              <option value="ทั้งหมด">ทั้งหมดทุกสถานที่</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="filter-group-item">
            <label>ส่วนราชการผู้รับผิดชอบ</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="filter-input-element"
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group-item">
            <label>สถานะพัสดุ</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-input-element"
            >
              <option value="ทั้งหมด">ทั้งหมดทุกสถานะ</option>
              <option value="ใช้งาน">ใช้งาน</option>
              <option value="ชำรุด">ชำรุด</option>
              <option value="รอจำหน่าย">รอจำหน่าย</option>
              <option value="จำหน่ายแล้ว">จำหน่ายแล้ว</option>
            </select>
          </div>

          <div className="filter-group-item">
            <label>ปีที่ได้กรรมสิทธิ์ (พ.ศ.)</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="filter-input-element"
            >
              <option value="ทั้งหมด">ทั้งหมดทุกปี</option>
              {yearsList.filter(y => y !== 'ทั้งหมด').map(year => (
                <option key={year} value={year}>พ.ศ. 25{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="report-action-buttons">
          <button className="button-primary btn-print-report" onClick={handlePrint} type="button">
            🖨️ พิมพ์สมุดทะเบียน (A4 Landscape)
          </button>
          <button className="button-secondary btn-export-csv" onClick={handleExportCSV} type="button">
            📥 ส่งออกไฟล์ Excel (CSV)
          </button>
        </div>
      </div>

      {/* 4. Report Contents (Printable Sheet) */}
      <div className="printable-report-sheet">
        {/* Print Header only when printing the summary index */}
        <div className="print-header-only">
          <div className="print-gov-title">
            <h2>สมุดทะเบียนคุมสินทรัพย์และพัสดุองค์กรปกครองส่วนท้องถิ่น</h2>
            <div className="print-subtitle">
              {activeLedger === 'pd1' && 'แบบทะเบียนพัสดุที่ดินและสิ่งก่อสร้าง (หน้า 1 - แบบ พ.ด.1)'}
              {activeLedger === 'pd2' && 'แบบทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์ และสัตว์พาหนะ (หน้า 1 - แบบ พ.ด.2)'}
              {activeLedger === 'pd3' && 'บัญชีงบหน้าประจำเลขรหัสพัสดุ (แบบ พ.ด.3)'}
            </div>
            <div className="print-meta-info">
              <span>พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span> | ตัวกรอง: {filterDepartment !== 'ทั้งหมด' ? `หน่วยงาน: ${filterDepartment}` : 'ทุกส่วนราชการ'} | {filterLocation !== 'ทั้งหมด' ? `สถานที่: ${filterLocation}` : 'ทุกพื้นที่'}</span>
            </div>
          </div>
        </div>

        {/* --- Render พ.ด. 1 --- */}
        {activeLedger === 'pd1' && (
          <div className="printable-ledger-cards-wrapper">
            {/* Table View for Screen */}
            <div className="ledger-table-wrapper no-print">
              <div className="ledger-title-bar pd1-bar">
                <span>📗 ทะเบียนพัสดุที่ดินและสิ่งก่อสร้าง (แบบ พ.ด.1)</span>
                <span className="item-count-badge">{pd1Assets.length} รายการ</span>
              </div>
              <table className="ledger-data-table table-pd1">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>เลขรหัสพัสดุ</th>
                    <th style={{ width: '22%' }}>ชื่อที่ดิน/สิ่งก่อสร้าง</th>
                    <th style={{ width: '18%' }}>เอกสารสิทธิ์ / เนื้อที่</th>
                    <th style={{ width: '18%' }}>ที่ตั้งพัสดุ</th>
                    <th style={{ width: '10%' }}>การได้มา</th>
                    <th style={{ width: '12%' }} className="text-right">ราคาทุนต่อหน่วย (บาท)</th>
                    <th style={{ width: '15%' }}>ส่วนราชการดูแล</th>
                    <th style={{ width: '8%' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {pd1Assets.length > 0 ? (
                    pd1Assets.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.asset_code}</strong></td>
                        <td>
                          <div className="item-title">{item.name}</div>
                          <div className="item-sub-desc">
                            <span style={{ color: 'var(--status-active-text)', fontWeight: '600', marginRight: '6px' }}>
                              [{item.category || 'ที่ดินและสิ่งก่อสร้าง'}]
                            </span>
                            {item.building_style}
                          </div>
                        </td>
                        <td>
                          <div>{item.document_of_title || '-'}</div>
                          <div className="item-sub-desc">{item.area_size}</div>
                        </td>
                        <td>{item.location}</td>
                        <td>{item.acquisition_method}</td>
                        <td className="text-right">{(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>{item.responsible_department}</td>
                        <td>
                          <span className={`ledger-status-badge status-${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-ledger-row">ไม่มีข้อมูลที่ดินและสิ่งก่อสร้างที่ตรงตามเงื่อนไข</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print View: Breaks into Card Pages for each individual asset */}
            <div className="print-only-cards-section">
              {pd1Assets.map(item => (
                <div key={item.id} className="print-card-page-break">
                  {/* หน้า 1: รายละเอียด */}
                  <div className="official-card-wrapper theme-pd1-border">
                    <div className="official-card-header bg-pd1-header">
                      <h3>ทะเบียนที่ดินและสิ่งก่อสร้าง (แบบ พ.ด.1)</h3>
                      <div className="card-header-right">
                        <span>เลขรหัสพัสดุ: </span>
                        <strong>{item.asset_code}</strong>
                      </div>
                    </div>
                    
                    <div className="official-card-grid">
                      <div className="grid-cell span-3">
                        <span className="card-cell-label">ชื่อทรัพย์สิน/พัสดุ</span>
                        <div className="card-cell-val font-bold text-lg">{item.name}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">หมวดหมู่ทรัพย์สิน</span>
                        <div className="card-cell-val font-bold">{item.category || 'ที่ดินและสิ่งก่อสร้าง'}</div>
                      </div>

                      <div className="grid-cell span-2">
                        <span className="card-cell-label">ที่ตั้งของพัสดุ</span>
                        <div className="card-cell-val">{item.location || '-'}</div>
                      </div>
                      <div className="grid-cell span-2">
                        <span className="card-cell-label">ชนิดและเลขที่เอกสารสิทธิ์ (โฉนด/น.ส.3)</span>
                        <div className="card-cell-val font-bold">{item.document_of_title || 'ไม่มี/ไม่ระบุ'}</div>
                      </div>

                      <div className="grid-cell">
                        <span className="card-cell-label">จำนวนเนื้อที่</span>
                        <div className="card-cell-val">{item.area_size || '-'}</div>
                      </div>
                      <div className="grid-cell span-2">
                        <span className="card-cell-label">ลักษณะโรงเรือน/สิ่งก่อสร้าง</span>
                        <div className="card-cell-val">{item.building_style || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">สถานะพัสดุ</span>
                        <div className="card-cell-val font-bold">{item.status}</div>
                      </div>

                      <div className="grid-cell">
                        <span className="card-cell-label">ลักษณะการได้กรรมสิทธิ์</span>
                        <div className="card-cell-val">{item.acquisition_method}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">เลขที่ใบส่งของ/สัญญา</span>
                        <div className="card-cell-val">{item.delivery_document_no || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">วันเดือนปีเอกสาร</span>
                        <div className="card-cell-val">
                          {item.delivery_document_date ? formatThaiDateString(item.delivery_document_date) : '-'}
                        </div>
                      </div>
                      <div className="grid-cell span-2">
                        <span className="card-cell-label">ผู้ขาย / คู่สัญญา</span>
                        <div className="card-cell-val">{item.seller_name || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">ราคาต่อหน่วย (บาท)</span>
                        <div className="card-cell-val font-bold cost-color">
                          ฿{(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="grid-cell span-2">
                        <span className="card-cell-label">เจ้าของงบประมาณ</span>
                        <div className="card-cell-val">{item.budget_owner || '-'}</div>
                      </div>
                      <div className="grid-cell span-2">
                        <span className="card-cell-label">ส่วนราชการที่รับดูแลรับผิดชอบ</span>
                        <div className="card-cell-val font-bold">{item.responsible_department}</div>
                      </div>
                    </div>
                  </div>

                  {/* หน้า 2: ประวัติการบำรุงรักษา */}
                  <div className="official-card-wrapper theme-pd1-border mt-8 page-break-before-always">
                    <div className="official-card-header bg-pd1-header">
                      <h3>ประวัติการซ่อมแซมและบำรุงรักษา (แบบ พ.ด.1 หน้า 2)</h3>
                      <div className="card-header-right">
                        <span>เลขรหัสพัสดุ: </span>
                        <strong>{item.asset_code}</strong>
                      </div>
                    </div>
                    <table className="card-maint-table">
                      <thead>
                        <tr>
                          <th style={{ width: '8%' }}>ครั้งที่</th>
                          <th style={{ width: '25%' }}>หนังสืออนุมัติจัดจ้าง</th>
                          <th style={{ width: '37%' }}>รายการซ่อมแซมและบำรุงรักษา</th>
                          <th style={{ width: '15%' }} className="text-right">จำนวนเงินค่าซ่อม (บาท)</th>
                          <th style={{ width: '15%' }}>ชื่อผู้รับจ้าง</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.maintenances && item.maintenances.length > 0 ? (
                          item.maintenances.map((maint, idx) => (
                            <tr key={maint.id}>
                              <td className="text-center">{idx + 1}</td>
                              <td>
                                {maint.document_number || ''}
                                {maint.approval_date ? ` ลงวันที่ ${formatThaiDateString(maint.approval_date)}` : ''}
                                {!maint.document_number && !maint.approval_date && (maint.approval_no_date || '-')}
                              </td>
                              <td>{maint.description}</td>
                              <td className="text-right">{(maint.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td>{maint.contractor || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr>
                              <td className="text-center">1</td>
                              <td></td>
                              <td>(ไม่มีประวัติการซ่อมบำรุงรักษา)</td>
                              <td></td>
                              <td></td>
                            </tr>
                            {[2, 3, 4, 5].map(num => (
                              <tr key={num}>
                                <td className="text-center">{num}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Render พ.ด. 2 --- */}
        {activeLedger === 'pd2' && (
          <div className="printable-ledger-cards-wrapper">
            {/* Table View for Screen */}
            <div className="ledger-table-wrapper no-print">
              <div className="ledger-title-bar pd2-bar">
                <span>📒 ทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์ และสัตว์พาหนะ (แบบ พ.ด.2)</span>
                <span className="item-count-badge">{pd2Assets.length} รายการ</span>
              </div>
              <table className="ledger-data-table table-pd2">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>เลขรหัสพัสดุ</th>
                    <th style={{ width: '22%' }}>ชื่อครุภัณฑ์/ตราสินค้า</th>
                    <th style={{ width: '15%' }}>รหัสโรงงาน/ทะเบียน</th>
                    <th style={{ width: '12%' }} className="text-right">ราคาทุนต่อหน่วย (บาท)</th>
                    <th style={{ width: '10%' }} className="text-right">ค่าเสื่อมสะสม (บาท)</th>
                    <th style={{ width: '10%' }} className="text-right">มูลค่าคงเหลือ (บาท)</th>
                    <th style={{ width: '12%' }}>สถานที่ตั้ง</th>
                    <th style={{ width: '7%' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {pd2Assets.length > 0 ? (
                    pd2Assets.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.asset_code}</strong></td>
                        <td>
                          <div className="item-title">{item.name}</div>
                          <div className="item-sub-desc">
                            <span style={{ color: 'var(--primary-color)', fontWeight: '600', marginRight: '6px' }}>
                              [{item.category || 'ครุภัณฑ์'}]
                            </span>
                            {item.manufacturer_brand} {item.color}
                          </div>
                        </td>
                        <td>
                          <div className="item-title">{item.vehicle_registration || item.serial_number || '-'}</div>
                          <div className="item-sub-desc">{item.chassis_number && `แคชชี: ${item.chassis_number}`}</div>
                        </td>
                        <td className="text-right">{(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-right text-depreciation">{(item.accumulated_depreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-right text-bookvalue">{(item.book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>{item.location}</td>
                        <td>
                          <span className={`ledger-status-badge status-${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-ledger-row">ไม่มีข้อมูลครุภัณฑ์ที่ตรงตามเงื่อนไข</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print View: Breaks into Card Pages for each individual asset */}
            <div className="print-only-cards-section">
              {pd2Assets.map(item => (
                <div key={item.id} className="print-card-page-break">
                  {/* หน้า 1: รายละเอียด */}
                  <div className="official-card-wrapper theme-pd2-border">
                    <div className="official-card-header bg-pd2-header">
                      <h3>ทะเบียนคุมครุภัณฑ์ ปศุสัตว์ และสัตว์พาหนะ (แบบ พ.ด.2)</h3>
                      <div className="card-header-right">
                        <span>เลขรหัสพัสดุ: </span>
                        <strong>{item.asset_code}</strong>
                      </div>
                    </div>
                    
                    <div className="official-card-grid">
                      <div className="grid-cell span-3">
                        <span className="card-cell-label">ชื่อพัสดุ/ครุภัณฑ์ (หมวดหมู่: {item.category || 'ครุภัณฑ์'})</span>
                        <div className="card-cell-val font-bold text-lg">{item.name}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">ตราสินค้า/ผู้ผลิต</span>
                        <div className="card-cell-val font-bold">{item.manufacturer_brand || 'ไม่ระบุ'}</div>
                      </div>

                      <div className="grid-cell">
                        <span className="card-cell-label">หมายเลขประจำพัสดุ (Serial No.)</span>
                        <div className="card-cell-val">{item.serial_number || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">หมายเลขเครื่องยนต์</span>
                        <div className="card-cell-val">{item.engine_number || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">หมายเลขตัวถัง (แคสซี)</span>
                        <div className="card-cell-val">{item.chassis_number || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">หมายเลขทะเบียนรถยนต์</span>
                        <div className="card-cell-val font-bold">{item.vehicle_registration || '-'}</div>
                      </div>

                      <div className="grid-cell">
                        <span className="card-cell-label">สีพัสดุ</span>
                        <div className="card-cell-val">{item.color || '-'}</div>
                      </div>
                      <div className="grid-cell span-2">
                        <span className="card-cell-label">การรับประกัน (วันสิ้นสุด/สัญญา)</span>
                        <div className="card-cell-val">{item.warranty_detail || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">สถานะพัสดุ</span>
                        <div className="card-cell-val font-bold">{item.status}</div>
                      </div>

                      <div className="grid-cell">
                        <span className="card-cell-label">ลักษณะการได้กรรมสิทธิ์</span>
                        <div className="card-cell-val">{item.acquisition_method}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">เลขที่ใบส่งของ/สัญญา</span>
                        <div className="card-cell-val">{item.delivery_document_no || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">วันเดือนปีเอกสาร</span>
                        <div className="card-cell-val">
                          {item.delivery_document_date ? formatThaiDateString(item.delivery_document_date) : '-'}
                        </div>
                      </div>
                      <div className="grid-cell span-2">
                        <span className="card-cell-label">ผู้ขาย / คู่สัญญา</span>
                        <div className="card-cell-val">{item.seller_name || '-'}</div>
                      </div>
                      <div className="grid-cell">
                        <span className="card-cell-label">ราคาทุนต่อหน่วย</span>
                        <div className="card-cell-val font-bold cost-color">
                          ฿{(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="grid-cell span-2">
                        <span className="card-cell-label">แหล่งเก็บใบส่งของ/ที่ตั้ง</span>
                        <div className="card-cell-val">{item.location || '-'}</div>
                      </div>
                      <div className="grid-cell span-2">
                        <span className="card-cell-label">ส่วนราชการที่รับผิดชอบ</span>
                        <div className="card-cell-val font-bold">{item.responsible_department}</div>
                      </div>

                      {/* Depreciation Subgroup in card */}
                      <div className="grid-cell span-4 bg-light-row">
                        <div className="flex-center-between font-bold" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                          <span>📈 การคำนวณค่าเสื่อมราคาสะสม</span>
                          <span>อัตรา: {item.depreciation_rate_percent}% ต่อปี</span>
                        </div>
                        <div className="official-card-grid-inner">
                          <div>
                            <span className="card-cell-label">ราคาทุนจัดหา</span>
                            <div className="card-cell-val">฿{(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          </div>
                          <div>
                            <span className="card-cell-label">ค่าเสื่อมสะสมสุทธิ</span>
                            <div className="card-cell-val text-depreciation">-฿{(item.accumulated_depreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          </div>
                          <div>
                            <span className="card-cell-label">มูลค่าคงเหลือสุทธิ</span>
                            <div className="card-cell-val text-bookvalue font-bold">฿{(item.book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* หน้า 2: ประวัติการบำรุงรักษา */}
                  <div className="official-card-wrapper theme-pd2-border mt-8 page-break-before-always">
                    <div className="official-card-header bg-pd2-header">
                      <h3>ประวัติการซ่อมแซมและบำรุงรักษา (แบบ พ.ด.2 หน้า 2)</h3>
                      <div className="card-header-right">
                        <span>เลขรหัสพัสดุ: </span>
                        <strong>{item.asset_code}</strong>
                      </div>
                    </div>
                    <table className="card-maint-table">
                      <thead>
                        <tr>
                          <th style={{ width: '8%' }}>ครั้งที่</th>
                          <th style={{ width: '25%' }}>หนังสืออนุมัติซ่อมแซม</th>
                          <th style={{ width: '37%' }}>รายการซ่อมแซมหรือเปลี่ยนอะไหล่</th>
                          <th style={{ width: '15%' }} className="text-right">จำนวนเงินค่าซ่อม (บาท)</th>
                          <th style={{ width: '15%' }}>ชื่อผู้รับจ้าง</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.maintenances && item.maintenances.length > 0 ? (
                          item.maintenances.map((maint, idx) => (
                            <tr key={maint.id}>
                              <td className="text-center">{idx + 1}</td>
                              <td>
                                {maint.document_number || ''}
                                {maint.approval_date ? ` ลงวันที่ ${formatThaiDateString(maint.approval_date)}` : ''}
                                {!maint.document_number && !maint.approval_date && (maint.approval_no_date || '-')}
                              </td>
                              <td>{maint.description}</td>
                              <td className="text-right">{(maint.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td>{maint.contractor || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr>
                              <td className="text-center">1</td>
                              <td></td>
                              <td>(ไม่มีประวัติการซ่อมบำรุงรักษา)</td>
                              <td></td>
                              <td></td>
                            </tr>
                            {[2, 3, 4, 5].map(num => (
                              <tr key={num}>
                                <td className="text-center">{num}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                            ))}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Render พ.ด. 3 --- */}
        {activeLedger === 'pd3' && (
          <div className="ledger-table-wrapper">
            <div className="ledger-title-bar pd3-bar">
              <span>📙 บัญชีงบหน้าประจำเลขรหัสพัสดุ (แบบ พ.ด.3)</span>
              <span className="item-count-badge no-print">{pd3Summaries.length} กลุ่มรหัสประเภท</span>
            </div>
            <table className="ledger-data-table table-pd3">
              <thead>
                <tr>
                  <th style={{ width: '15%' }} className="text-center">ประเภทรหัสพัสดุ (3 หลักแรก)</th>
                  <th style={{ width: '35%' }}>ชื่อประเภทหลักของพัสดุ (ตามบัญชี พ.ด.5/6)</th>
                  <th style={{ width: '12%' }} className="text-center">จำนวนรายการ</th>
                  <th style={{ width: '16%' }} className="text-right">ราคาทุนสะสมรวม (บาท)</th>
                  <th style={{ width: '16%' }} className="text-right">ค่าเสื่อมสะสมรวม (บาท)</th>
                  <th style={{ width: '16%' }} className="text-right">มูลค่าคงเหลือสุทธิรวม (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {pd3Summaries.length > 0 ? (
                  pd3Summaries.map(group => (
                    <tr key={group.code}>
                      <td className="text-center"><strong>{group.code}</strong></td>
                      <td><strong>{group.name}</strong></td>
                      <td className="text-center">{group.count} รายการ</td>
                      <td className="text-right">{(group.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right text-depreciation">{(group.totalDepreciation).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right text-bookvalue">{(group.totalBookValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-ledger-row">ไม่มีข้อมูลพัสดุแยกประเภทสำหรับรวบรวม</td>
                  </tr>
                )}
              </tbody>
              {pd3Summaries.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan="2" className="text-right font-bold">ยอดสรุปงบหน้ารวมทั้งสิ้น:</td>
                    <td className="text-center font-bold">{stats.count} รายการ</td>
                    <td className="text-right font-bold cost-color">
                      ฿{stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right font-bold depreciation-color">
                      ฿{stats.totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right font-bold bookvalue-color">
                      ฿{stats.totalBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
