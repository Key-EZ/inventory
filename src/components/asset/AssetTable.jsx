import { useState, useMemo } from 'react';

export default function AssetTable({ assets, onEditAsset, onDeleteAsset, onRepairAsset, onPrintAsset, onViewRepairHistory, initialSearchQuery = '' }) {
  // Filter & Search states
  const [search, setSearch] = useState(initialSearchQuery);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [filterCategory, setFilterCategory] = useState('ทั้งหมด');

  // Sort states
  const [sortBy, setSortBy] = useState('code-asc'); // date-desc, date-asc, cost-desc, cost-asc, id-asc, bookvalue-desc, code-asc

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique categories for filtering
  const categories = useMemo(() => {
    const catSet = new Set(assets.map(item => item.category).filter(Boolean));
    return ['ทั้งหมด', ...Array.from(catSet)];
  }, [assets]);

  // Filtered and sorted assets
  const processedAssets = useMemo(() => {
    let result = [...assets];

    // 1. Text Search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(item =>
        (item.asset_code || '').toLowerCase().includes(q) ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.responsible_department || '').toLowerCase().includes(q) ||
        (item.manufacturer_brand || '').toLowerCase().includes(q) ||
        (item.chassis_number || '').toLowerCase().includes(q) ||
        (item.vehicle_registration || '').toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (filterStatus !== 'ทั้งหมด') {
      result = result.filter(item => item.status === filterStatus);
    }

    // 3. Category Filter
    if (filterCategory !== 'ทั้งหมด') {
      result = result.filter(item => item.category === filterCategory);
    }

    // 5. Sorting
    result.sort((a, b) => {
      // Helper to parse acquisition year from code XXX-YY-ZZZZ
      const getYear = (code) => {
        const parts = String(code || '').split('-');
        if (parts.length >= 2) return parseInt(parts[1]) || 0;
        return 0;
      };

      switch (sortBy) {
        case 'code-asc':
          return (a.asset_code || '').localeCompare(b.asset_code || '');
        case 'year-desc':
          return getYear(b.asset_code) - getYear(a.asset_code);
        case 'year-asc':
          return getYear(a.asset_code) - getYear(b.asset_code);
        case 'cost-desc':
          return (b.unit_price || 0) - (a.unit_price || 0);
        case 'cost-asc':
          return (a.unit_price || 0) - (b.unit_price || 0);
        case 'bookvalue-desc':
          return (b.book_value || 0) - (a.book_value || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [assets, search, filterStatus, filterCategory, sortBy]);

  // Reset page when filters change during render (React-recommended pattern)
  const [prevFilters, setPrevFilters] = useState({ search, filterStatus, filterCategory, sortBy });
  if (
    prevFilters.search !== search ||
    prevFilters.filterStatus !== filterStatus ||
    prevFilters.filterCategory !== filterCategory ||
    prevFilters.sortBy !== sortBy
  ) {
    setPrevFilters({ search, filterStatus, filterCategory, sortBy });
    setCurrentPage(1);
  }

  // Pagination math
  const totalItems = processedAssets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedAssets.slice(startIndex, startIndex + itemsPerPage);
  }, [processedAssets, currentPage]);

  const statusBadges = {
    'ใช้งาน': 'status-badge-active',
    'ชำรุด': 'status-badge-damaged',
    'รอจำหน่าย': 'status-badge-pending',
    'จำหน่ายแล้ว': 'status-badge-disposed'
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterStatus('ทั้งหมด');
    setFilterCategory('ทั้งหมด');
    setSortBy('code-asc');
  };

  return (
    <div className="table-view-container">
      {/* Search & Filter Panel */}
      <div className="layout-card filter-panel-card">
        <div className="filter-panel-header">
          <h3>🔍 ค้นหาและตัวกรองข้อมูล</h3>
          {(search || filterStatus !== 'ทั้งหมด' || filterCategory !== 'ทั้งหมด' || sortBy !== 'code-asc') && (
            <button className="btn-clear-filter" onClick={handleClearFilters}>
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>

        <div className="filter-grid">
          {/* Search Box */}
          <div className="filter-group-item">
            <label>คำค้นหา</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="รหัสพัสดุ, ชื่อ, ยี่ห้อ, ทะเบียน, ที่ตั้ง..."
              className="filter-input-element"
            />
          </div>

          {/* Status Select */}
          <div className="filter-group-item">
            <label>สถานะ</label>
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

          {/* Category Select */}
          <div className="filter-group-item">
            <label>หมวดหมู่พัสดุ</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-input-element"
            >
              <option value="ทั้งหมด">ทั้งหมดทุกหมวดหมู่</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div className="filter-group-item">
            <label>จัดเรียงตาม</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-input-element"
            >
              <option value="code-asc">รหัสพัสดุ (น้อย ➔ มาก)</option>
              <option value="year-desc">ปีที่จัดหา ล่าสุด ➔ เก่าสุด</option>
              <option value="year-asc">ปีที่จัดหา เก่าสุด ➔ ล่าสุด</option>
              <option value="cost-desc">ราคาทุน สูง ➔ ต่ำ</option>
              <option value="cost-asc">ราคาทุน ต่ำ ➔ สูง</option>
              <option value="bookvalue-desc">มูลค่าสุทธิ สูง ➔ ต่ำ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="layout-card table-data-card animate-fade-in" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
          <div className="results-indicator">
            พบครุภัณฑ์ทั้งหมด <strong>{totalItems}</strong> รายการ
            {totalItems !== assets.length && ` (จากข้อมูลหลัก ${assets.length} รายการ)`}
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>รหัสพัสดุ</th>
                <th style={{ width: '20%' }}>รายการทรัพย์สิน / พัสดุ</th>
                <th style={{ width: '20%' }}>หน่วยดูแล/สถานที่ตั้ง</th>
                <th style={{ width: '5%' }}>สถานะ</th>
                <th style={{ width: '35%' }} className="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.length > 0 ? (
                paginatedAssets.map(item => (
                  <tr key={item.id} className="table-row-hover">
                    <td className="table-cell-id"><strong>{item.asset_code}</strong></td>
                    <td className="table-cell-name">
                      <div className="item-name-main">{item.name}</div>
                      <div className="item-name-sub">
                        <span style={{
                          color: item.asset_type === 'LAND_BUILDING' ? 'var(--status-active-text)' : 'var(--primary-color)',
                          fontWeight: '600',
                          marginRight: '6px'
                        }}>
                          [{item.category || (item.asset_type === 'LAND_BUILDING' ? 'พ.ด.1 ที่ดิน/โรงเรือน' : 'พ.ด.2 ครุภัณฑ์')}]
                        </span>
                        {item.asset_type === 'LAND_BUILDING' ? (
                          <span>{item.building_style || 'ที่ดินเปล่า'}</span>
                        ) : (
                          <span>{item.manufacturer_brand} {item.serial_number && `(SN: ${item.serial_number})`}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="custodian-text">🏢 {item.responsible_department || 'ไม่ระบุหน่วยงาน'}</div>
                      <div className="location-text">📍 {item.location || 'ไม่ระบุสถานที่'}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusBadges[item.status || 'ใช้งาน']}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="table-actions">
                        <button className="btn-table-print" onClick={() => onPrintAsset(item)} title="พิมพ์เอกสาร">
                          🖨️ พิมพ์
                        </button>
                        <button className="btn-table-repair" onClick={() => onRepairAsset(item)} title="แจ้งซ่อม">
                          🔧 แจ้งซ่อม
                        </button>
                        <button className="btn-table-history" onClick={() => onViewRepairHistory(item)} title="ประวัติการซ่อมแซม">
                          📜 ประวัติซ่อม
                        </button>
                        <button className="btn-table-edit" onClick={() => onEditAsset(item)} title="แก้ไขข้อมูล">
                          ✏️ แก้ไข
                        </button>
                        <button className="btn-table-delete" onClick={() => onDeleteAsset(item.id)} title="ลบข้อมูล">
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="table-empty-row">
                    🔍 ไม่พบข้อมูลพัสดุที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="table-pagination">
            <button
              className="page-nav-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ◀ ย้อนกลับ
            </button>
            <div className="page-indicator">
              หน้า <strong>{currentPage}</strong> จากทั้งหมด <strong>{totalPages}</strong> หน้า
            </div>
            <button
              className="page-nav-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ถัดไป ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
