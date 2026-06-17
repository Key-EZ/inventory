import { useState, useMemo } from 'react';

const landTypes = ['ที่ดินที่มีกรรมสิทธิ์', 'อาคารสำนักงาน', 'สิ่งปลูกสร้าง'];

export default function ReportPanel({ assets = [], custodians = [], locations = [] }) {
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
    const assetId = asset.usage?.asset_id || '';
    const match = assetId.match(/^\d{3}/);
    if (match) {
      return { code: match[0], name: asset.general_info?.asset_type || 'ครุภัณฑ์ทั่วไป' };
    }
    
    const type = asset.general_info?.asset_type || 'ครุภัณฑ์สำนักงาน';
    const mapping = {
      'ที่ดินที่มีกรรมสิทธิ์': { code: '101', name: 'ที่ดินที่มีกรรมสิทธิ์' },
      'อาคารสำนักงาน': { code: '102', name: 'อาคารสำนักงาน' },
      'สิ่งปลูกสร้าง': { code: '103', name: 'สิ่งปลูกสร้าง' },
      'ครุภัณฑ์สำนักงาน': { code: '311', name: 'ครุภัณฑ์สำนักงาน' },
      'ครุภัณฑ์ยานพาหนะและขนส่ง': { code: '312', name: 'ครุภัณฑ์ยานพาหนะ' },
      'ครุภัณฑ์ไฟฟ้าและวิทยุ': { code: '313', name: 'ครุภัณฑ์ไฟฟ้าและวิทยุ' },
      'ครุภัณฑ์โฆษณาและเผยแพร่': { code: '314', name: 'ครุภัณฑ์โฆษณาและเผยแพร่' },
      'ครุภัณฑ์งานบ้านงานครัว': { code: '315', name: 'ครุภัณฑ์งานบ้านงานครัว' },
      'ครุภัณฑ์วิทยาศาสตร์และการแพทย์': { code: '316', name: 'ครุภัณฑ์วิทยาศาสตร์ทางการแพทย์' },
      'ครุภัณฑ์กีฬา': { code: '317', name: 'ครุภัณฑ์กีฬา' },
      'ครุภัณฑ์คอมพิวเตอร์': { code: '412', name: 'ครุภัณฑ์คอมพิวเตอร์' },
      'สินทรัพย์ไม่มีตัวตนอื่น': { code: '501', name: 'สินทรัพย์ไม่มีตัวตนอื่น' }
    };
    return mapping[type] || { code: '999', name: type };
  };

  // --- Extract Filter Options ---
  const departmentsList = useMemo(() => {
    const depts = new Set(custodians.map(c => c.department).filter(Boolean));
    return ['ทั้งหมด', ...Array.from(depts)];
  }, [custodians]);

  const yearsList = useMemo(() => {
    const years = new Set(
      assets
        .map(a => {
          const dateStr = a.source_and_value?.acquisition_date;
          if (!dateStr) return null;
          const yr = new Date(dateStr).getFullYear();
          return isNaN(yr) ? null : yr;
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
          (item.usage?.asset_id || '').toLowerCase().includes(q) ||
          (item.general_info?.asset_name || '').toLowerCase().includes(q) ||
          (item.usage?.custodian || '').toLowerCase().includes(q) ||
          (item.general_info?.brand || '').toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // 2. Status
      if (filterStatus !== 'ทั้งหมด' && item.usage?.status !== filterStatus) {
        return false;
      }

      // 3. Location
      if (filterLocation !== 'ทั้งหมด' && item.usage?.location !== filterLocation) {
        return false;
      }

      // 4. Department (Look up custodian's department)
      if (filterDepartment !== 'ทั้งหมด') {
        const custodianName = item.usage?.custodian;
        const custObj = custodians.find(c => c.name === custodianName);
        if (!custObj || custObj.department !== filterDepartment) {
          return false;
        }
      }

      // 5. Acquisition Year
      if (filterYear !== 'ทั้งหมด') {
        const dateStr = item.source_and_value?.acquisition_date;
        if (!dateStr) return false;
        const yr = new Date(dateStr).getFullYear();
        if (yr !== parseInt(filterYear)) {
          return false;
        }
      }

      return true;
    });
  }, [assets, custodians, searchQuery, filterStatus, filterLocation, filterDepartment, filterYear]);

  // --- Split into พ.ด. 1 (Land & Buildings) and พ.ด. 2 (Equipment) ---
  
  const pd1Assets = useMemo(() => {
    return filteredAssets.filter(item => landTypes.includes(item.general_info?.asset_type));
  }, [filteredAssets]);

  const pd2Assets = useMemo(() => {
    return filteredAssets.filter(item => !landTypes.includes(item.general_info?.asset_type));
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
      groups[code].totalCost += item.source_and_value?.cost_price || 0;
      groups[code].totalDepreciation += item.financial_status?.accumulated_depreciation || 0;
      groups[code].totalBookValue += item.financial_status?.book_value || 0;
    });

    return Object.values(groups).sort((a, b) => a.code.localeCompare(b.code));
  }, [filteredAssets]);

  // --- Calculations for Stats Cards (based on selected ledger view) ---
  const activeAssetsList = activeLedger === 'pd1' ? pd1Assets : activeLedger === 'pd2' ? pd2Assets : filteredAssets;

  const stats = useMemo(() => {
    const count = activeAssetsList.length;
    const totalCost = activeAssetsList.reduce((sum, item) => sum + (item.source_and_value?.cost_price || 0), 0);
    const totalDepreciation = activeAssetsList.reduce((sum, item) => sum + (item.financial_status?.accumulated_depreciation || 0), 0);
    const totalBookValue = activeAssetsList.reduce((sum, item) => sum + (item.financial_status?.book_value || 0), 0);

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
        "ชื่อพัสดุ",
        "ประเภทพัสดุ",
        "ที่ตั้งของพัสดุ",
        "ลักษณะการได้มา",
        "ราคาต่อหน่วย",
        "ผู้ดูแล",
        "สถานะ"
      ];
      rows = pd1Assets.map(item => [
        item.usage?.asset_id || '',
        item.general_info?.asset_name || '',
        item.general_info?.asset_type || '',
        item.usage?.location || '',
        item.source_and_value?.procurement_method || '',
        item.source_and_value?.cost_price || 0,
        item.usage?.custodian || '',
        item.usage?.status || ''
      ]);
    } else if (activeLedger === 'pd2') {
      filename = `ทะเบียนครุภัณฑ์_พด2_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        "เลขรหัสพัสดุ",
        "ชื่อครุภัณฑ์",
        "ยี่ห้อ/รุ่น",
        "แบบ/ลักษณะ",
        "ราคาต่อหน่วย",
        "อัตราค่าเสื่อม (%)",
        "ค่าเสื่อมสะสม",
        "มูลค่าคงเหลือสุทธิ",
        "ผู้ดูแล",
        "สถานที่ตั้ง",
        "สถานะ"
      ];
      rows = pd2Assets.map(item => [
        item.usage?.asset_id || '',
        item.general_info?.asset_name || '',
        `${item.general_info?.brand || ''} ${item.general_info?.model || ''}`.trim(),
        item.general_info?.description || '',
        item.source_and_value?.cost_price || 0,
        item.financial_status?.depreciation_rate_percent || 0,
        item.financial_status?.accumulated_depreciation || 0,
        item.financial_status?.book_value || 0,
        item.usage?.custodian || '',
        item.usage?.location || '',
        item.usage?.status || ''
      ]);
    } else {
      filename = `บัญชีงบหน้าประจำเลขรหัสพัสดุ_พด3_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        "รหัสประเภทพัสดุ (3 หลักแรก)",
        "ประเภทพัสดุ",
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
              <span className="stat-desc">ค่าเสื่อมคิดตามวันใช้งานจริง</span>
            </div>
            <div className="report-stat-card card-bookvalue">
              <span className="stat-label">มูลค่าคงเหลือสุทธิรวม (Book Value)</span>
              <div className="stat-value">฿{stats.totalBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <span className="stat-desc">หลังหักค่าเสื่อม (รักษามูลค่าขั้นต่ำ 1 บ.)</span>
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
              placeholder="รหัส, ชื่อพัสดุ, ผู้ดูแล..."
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
            <label>ฝ่าย/แผนก (ผู้รับผิดชอบ)</label>
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
            <label>ปีที่ได้รับกรรมสิทธิ์ (ค.ศ.)</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="filter-input-element"
            >
              <option value="ทั้งหมด">ทั้งหมดทุกปี</option>
              {yearsList.filter(y => y !== 'ทั้งหมด').map(year => (
                <option key={year} value={year}>{year} (พ.ศ. {year + 543})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="report-action-buttons">
          <button className="button-primary btn-print-report" onClick={handlePrint} type="button">
            🖨️ พิมพ์รายงาน (A4 Landscape)
          </button>
          <button className="button-secondary btn-export-csv" onClick={handleExportCSV} type="button">
            📥 ส่งออกไฟล์ Excel (CSV)
          </button>
        </div>
      </div>

      {/* 4. Report Contents (Printable Sheet) */}
      <div className="printable-report-sheet">
        {/* Print Only Header */}
        <div className="print-header-only">
          <div className="print-gov-title">
            <h2>ทะเบียนทรัพย์สินและพัสดุองค์กรปกครองส่วนท้องถิ่น</h2>
            <div className="print-subtitle">
              {activeLedger === 'pd1' && 'แบบทะเบียนพัสดุที่ดินและสิ่งก่อสร้าง (แบบ พ.ด.1)'}
              {activeLedger === 'pd2' && 'แบบทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์ และสัตว์พาหนะ (แบบ พ.ด.2)'}
              {activeLedger === 'pd3' && 'บัญชีงบหน้าประจำเลขรหัสพัสดุ (แบบ พ.ด.3)'}
            </div>
            <div className="print-meta-info">
              <span>พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span> | สถานะตัวกรอง: {filterStatus !== 'ทั้งหมด' ? `สถานะ: ${filterStatus}` : 'ทุกสถานะ'} | {filterLocation !== 'ทั้งหมด' ? `สถานที่: ${filterLocation}` : 'ทุกสถานที่'}</span>
            </div>
          </div>
        </div>

        {/* --- Render พ.ด. 1 --- */}
        {activeLedger === 'pd1' && (
          <div className="ledger-table-wrapper">
            <div className="ledger-title-bar pd1-bar">
              <span>📗 ทะเบียนพัสดุที่ดินและสิ่งก่อสร้าง (แบบ พ.ด.1)</span>
              <span className="item-count-badge no-print">{pd1Assets.length} รายการ</span>
            </div>
            <table className="ledger-data-table table-pd1">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>เลขรหัสพัสดุ</th>
                  <th style={{ width: '25%' }}>ชื่อทรัพย์สิน/พัสดุ</th>
                  <th style={{ width: '15%' }}>ประเภทพัสดุ</th>
                  <th style={{ width: '20%' }}>ที่ตั้ง/สถานที่ตั้ง</th>
                  <th style={{ width: '12%' }}>ลักษณะการได้กรรมสิทธิ์</th>
                  <th style={{ width: '13%' }} className="text-right">ราคาพัสดุต่อหน่วย (บาท)</th>
                  <th style={{ width: '15%' }}>หน่วยงานดูแลรับผิดชอบ</th>
                  <th style={{ width: '10%' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {pd1Assets.length > 0 ? (
                  pd1Assets.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.usage?.asset_id}</strong></td>
                      <td>
                        <div className="item-title">{item.general_info?.asset_name}</div>
                        {item.general_info?.description && <div className="item-sub-desc">{item.general_info.description}</div>}
                      </td>
                      <td>{item.general_info?.asset_type}</td>
                      <td>{item.usage?.location || 'ไม่ระบุสถานที่'}</td>
                      <td>{item.source_and_value?.procurement_method || '-'}</td>
                      <td className="text-right">{(item.source_and_value?.cost_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <div>{item.usage?.custodian || 'ไม่ระบุ'}</div>
                      </td>
                      <td>
                        <span className={`ledger-status-badge status-${item.usage?.status}`}>
                          {item.usage?.status}
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
              {pd1Assets.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-right font-bold">รวมมูลค่าทั้งสิ้น:</td>
                    <td className="text-right font-bold cost-color">
                      ฿{stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* --- Render พ.ด. 2 --- */}
        {activeLedger === 'pd2' && (
          <div className="ledger-table-wrapper">
            <div className="ledger-title-bar pd2-bar">
              <span>📒 ทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์ และสัตว์พาหนะ (แบบ พ.ด.2)</span>
              <span className="item-count-badge no-print">{pd2Assets.length} รายการ</span>
            </div>
            <table className="ledger-data-table table-pd2">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>เลขรหัสพัสดุ</th>
                  <th style={{ width: '20%' }}>ชื่อครุภัณฑ์/ยี่ห้อ/รุ่น</th>
                  <th style={{ width: '18%' }}>แบบ/ลักษณะ/รหัสประจำตัว</th>
                  <th style={{ width: '12%' }} className="text-right">ราคาทุนต่อหน่วย (บาท)</th>
                  <th style={{ width: '7%' }} className="text-center">ค่าเสื่อม (%)</th>
                  <th style={{ width: '11%' }} className="text-right">ค่าเสื่อมราคาสะสม (บาท)</th>
                  <th style={{ width: '11%' }} className="text-right">มูลค่าสุทธิ (Book Value)</th>
                  <th style={{ width: '15%' }}>ผู้รับผิดชอบ/สถานที่</th>
                  <th style={{ width: '9%' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {pd2Assets.length > 0 ? (
                  pd2Assets.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.usage?.asset_id}</strong></td>
                      <td>
                        <div className="item-title">{item.general_info?.asset_name}</div>
                        <div className="item-sub-desc">{item.general_info?.brand} {item.general_info?.model}</div>
                      </td>
                      <td>
                        <div className="item-sub-desc">{item.general_info?.description || '-'}</div>
                        {item.source_and_value?.receipt_number && <div className="item-sub-desc text-muted">บิล: {item.source_and_value.receipt_number}</div>}
                      </td>
                      <td className="text-right">{(item.source_and_value?.cost_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-center">{item.financial_status?.depreciation_rate_percent}%</td>
                      <td className="text-right text-depreciation">{(item.financial_status?.accumulated_depreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right text-bookvalue">{(item.financial_status?.book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <div className="custodian-text">👤 {item.usage?.custodian || 'ไม่ระบุผู้ดูแล'}</div>
                        <div className="location-text">📍 {item.usage?.location || 'ไม่ระบุสถานที่'}</div>
                      </td>
                      <td>
                        <span className={`ledger-status-badge status-${item.usage?.status}`}>
                          {item.usage?.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-ledger-row">ไม่มีข้อมูลครุภัณฑ์ที่ตรงตามเงื่อนไข</td>
                  </tr>
                )}
              </tbody>
              {pd2Assets.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right font-bold">รวมยอดสะสม:</td>
                    <td className="text-right font-bold cost-color">
                      ฿{stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                    <td className="text-right font-bold depreciation-color">
                      ฿{stats.totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right font-bold bookvalue-color">
                      ฿{stats.totalBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* --- Render พ.ด. 3 --- */}
        {activeLedger === 'pd3' && (
          <div className="ledger-table-wrapper">
            <div className="ledger-title-bar pd3-bar">
              <span>📙 บัญชีงบหน้าประจำเลขรหัสพัสดุ (แบบ พ.ด.3)</span>
              <span className="item-count-badge no-print">{pd3Summaries.length} กลุ่มประเภทพัสดุ</span>
            </div>
            <table className="ledger-data-table table-pd3">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>ประเภทรหัสพัสดุ (3 หลักแรก)</th>
                  <th style={{ width: '35%' }}>ชื่อรายการพัสดุ/ประเภทพัสดุหลัก</th>
                  <th style={{ width: '12%' }} className="text-center">จำนวนรายการ</th>
                  <th style={{ width: '16%' }} className="text-right">ราคาทุนรวม (บาท)</th>
                  <th style={{ width: '16%' }} className="text-right">ค่าเสื่อมสะสมรวม (บาท)</th>
                  <th style={{ width: '16%' }} className="text-right">มูลค่าสุทธิรวม (บาท)</th>
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
                    <td colSpan="6" className="empty-ledger-row">ไม่มีข้อมูลประเภทพัสดุที่สามารถจัดรวบรวมได้</td>
                  </tr>
                )}
              </tbody>
              {pd3Summaries.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan="2" className="text-right font-bold">รวมยอดสรุปงบหน้าทั้งสิ้น:</td>
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
