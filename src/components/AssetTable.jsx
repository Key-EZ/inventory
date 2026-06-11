import React, { useState, useMemo } from 'react';

export default function AssetTable({ assets, onEditAsset, onDeleteAsset, initialSearchQuery = '' }) {
  // Filter & Search states
  const [search, setSearch] = useState(initialSearchQuery);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [filterLocation, setFilterLocation] = useState('ทั้งหมด');

  // Sort states
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, cost-desc, cost-asc, id-asc, bookvalue-desc

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique locations for filtering
  const locations = useMemo(() => {
    const locSet = new Set(assets.map(item => item.usage?.location).filter(Boolean));
    return ['ทั้งหมด', ...Array.from(locSet)];
  }, [assets]);

  // Filtered and sorted assets
  const processedAssets = useMemo(() => {
    let result = [...assets];

    // 1. Text Search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(item =>
        (item.usage?.asset_id || '').toLowerCase().includes(q) ||
        (item.general_info?.asset_name || '').toLowerCase().includes(q) ||
        (item.general_info?.brand || '').toLowerCase().includes(q) ||
        (item.general_info?.model || '').toLowerCase().includes(q) ||
        (item.usage?.custodian || '').toLowerCase().includes(q) ||
        (item.usage?.location || '').toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (filterStatus !== 'ทั้งหมด') {
      result = result.filter(item => item.usage?.status === filterStatus);
    }

    // 3. Location Filter
    if (filterLocation !== 'ทั้งหมด') {
      result = result.filter(item => item.usage?.location === filterLocation);
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.source_and_value?.acquisition_date) - new Date(a.source_and_value?.acquisition_date);
        case 'date-asc':
          return new Date(a.source_and_value?.acquisition_date) - new Date(b.source_and_value?.acquisition_date);
        case 'cost-desc':
          return (b.source_and_value?.cost_price || 0) - (a.source_and_value?.cost_price || 0);
        case 'cost-asc':
          return (a.source_and_value?.cost_price || 0) - (b.source_and_value?.cost_price || 0);
        case 'id-asc':
          return (a.usage?.asset_id || '').localeCompare(b.usage?.asset_id || '');
        case 'bookvalue-desc':
          return (b.financial_status?.book_value || 0) - (a.financial_status?.book_value || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [assets, search, filterStatus, filterLocation, sortBy]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterLocation, sortBy]);

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
    setFilterLocation('ทั้งหมด');
    setSortBy('date-desc');
  };

  return (
    <div className="table-view-container">
      {/* Search & Filter Panel */}
      <div className="layout-card filter-panel-card">
        <div className="filter-panel-header">
          <h3>🔍 ค้นหาและตัวกรองข้อมูล</h3>
          {(search || filterStatus !== 'ทั้งหมด' || filterLocation !== 'ทั้งหมด' || sortBy !== 'date-desc') && (
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
              placeholder="รหัส, ชื่อครุภัณฑ์, ยี่ห้อ, ผู้ดูแล..."
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
              <option value="ใช้งาน">ใช้งาน (Active)</option>
              <option value="ชำรุด">ชำรุด (Damaged)</option>
              <option value="รอจำหน่าย">รอจำหน่าย (Pending Disposal)</option>
              <option value="จำหน่ายแล้ว">จำหน่ายแล้ว (Disposed)</option>
            </select>
          </div>

          {/* Location Select */}
          <div className="filter-group-item">
            <label>สถานที่ตั้ง</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="filter-input-element"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
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
              <option value="date-desc">วันที่ได้มาล่าสุด ➔ เก่าสุด</option>
              <option value="date-asc">วันที่ได้มาเก่าสุด ➔ ล่าสุด</option>
              <option value="cost-desc">ราคาทุน สูง ➔ ต่ำ</option>
              <option value="cost-asc">ราคาทุน ต่ำ ➔ สูง</option>
              <option value="id-asc">รหัสครุภัณฑ์</option>
              <option value="bookvalue-desc">มูลค่าสุทธิ สูง ➔ ต่ำ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="layout-card table-data-card">
        <div className="table-data-header">
          <div className="results-indicator">
            พบครุภัณฑ์ทั้งหมด <strong>{totalItems}</strong> รายการ
            {totalItems !== assets.length && ` (จากข้อมูลหลัก ${assets.length} รายการ)`}
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>รหัสครุภัณฑ์</th>
                <th>รายการครุภัณฑ์</th>
                <th>วันที่ได้มา</th>
                <th>ราคาทุน (บาท)</th>
                <th>ค่าเสื่อมสะสม</th>
                <th>มูลค่าสุทธิ (Book Value)</th>
                <th>ผู้ดูแล/สถานที่ตั้ง</th>
                <th>สถานะ</th>
                <th className="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.length > 0 ? (
                paginatedAssets.map(item => (
                  <tr key={item.id} className="table-row-hover">
                    <td className="table-cell-id"><strong>{item.usage?.asset_id}</strong></td>
                    <td className="table-cell-name">
                      <div className="item-name-main">{item.general_info?.asset_name}</div>
                      <div className="item-name-sub">
                        {item.general_info?.brand && <span>ยี่ห้อ: {item.general_info.brand}</span>}
                        {item.general_info?.model && <span> รุ่น: {item.general_info.model}</span>}
                      </div>
                    </td>
                    <td>{item.source_and_value?.acquisition_date}</td>
                    <td className="text-right">
                      {(item.source_and_value?.cost_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-depreciation">
                      -{(item.financial_status?.accumulated_depreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-bookvalue">
                      <strong>{(item.financial_status?.book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </td>
                    <td>
                      <div className="custodian-text">👤 {item.usage?.custodian || 'ไม่ระบุผู้ดูแล'}</div>
                      <div className="location-text">📍 {item.usage?.location || 'ไม่ระบุสถานที่'}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusBadges[item.usage?.status || 'ใช้งาน']}`}>
                        {item.usage?.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="table-actions">
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
                  <td colSpan="9" className="table-empty-row">
                    🔍 ไม่พบข้อมูลครุภัณฑ์ที่ตรงกับเงื่อนไขการค้นหา
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
