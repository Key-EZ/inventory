import useAssetTable from '../../hooks/useAssetTable';

export default function AssetTable({
  assets,
  onEditAsset,
  onDeleteAsset,
  onRepairAsset,
  onPrintAsset,
  onManageCustodian,
  initialSearchQuery = ''
}) {
  const {
    search,
    filterStatus,
    filterCategory,
    sortBy,
    currentPage,
    openMenuId,
    categories,
    totalItems,
    totalPages,
    paginatedAssets,
    handleSearchChange,
    handleStatusChange,
    handleCategoryChange,
    handleSortChange,
    handleClearFilters,
    setCurrentPage,
    toggleMenu,
    closeMenu
  } = useAssetTable({
    assets,
    initialSearchQuery
  });

  const statusBadges = {
    'ใช้งาน': 'status-badge-active',
    'ชำรุด': 'status-badge-damaged',
    'รอจำหน่าย': 'status-badge-pending',
    'จำหน่ายแล้ว': 'status-badge-disposed'
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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="รหัสพัสดุ, ชื่อ, ยี่ห้อ, ทะเบียน, ที่ตั้ง..."
              className="filter-input-element"
            />
          </div>

          {/* Status Select */}
          <div className="filter-group-item">
            <label>สถานะ</label>
            <select
              value={filterStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
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
              onChange={(e) => handleCategoryChange(e.target.value)}
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
              onChange={(e) => handleSortChange(e.target.value)}
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
                <th style={{ width: '12%' }}>รหัสพัสดุ</th>
                <th style={{ width: '38%' }}>รายการทรัพย์สิน / พัสดุ</th>
                <th style={{ width: '25%' }}>หน่วยดูแล/สถานที่ตั้ง</th>
                <th style={{ width: '10%' }}>สถานะ</th>
                <th style={{ width: '15%' }} className="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.length > 0 ? (
                paginatedAssets.map(item => {
                  const isMenuOpen = openMenuId === item.id;
                  return (
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
                      <td
                        className="text-center"
                        style={{
                          overflow: 'visible',
                          position: 'relative',
                          zIndex: isMenuOpen ? 50 : 1,
                          paddingTop: isMenuOpen ? '60px' : '16px',
                          paddingBottom: isMenuOpen ? '60px' : '16px',
                          transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <div className="table-actions" style={{ overflow: 'visible' }}>
                          <div className={`radial-menu-container ${isMenuOpen ? 'active' : ''}`}>
                            <button
                              className={`btn-radial-trigger ${isMenuOpen ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(item.id);
                              }}
                              title="จัดการครุภัณฑ์"
                            >
                              ⚙️
                            </button>

                            {isMenuOpen && (
                              <div
                                className="radial-menu-overlay"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeMenu();
                                }}
                              />
                            )}

                            <div className={`radial-menu-options ${isMenuOpen ? 'open' : ''}`}>
                              {/* บน (สีฟ้า): แก้ไข */}
                              <button
                                className="radial-btn btn-top"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditAsset(item);
                                  closeMenu();
                                }}
                              >
                                ✏️
                                <span className="radial-tooltip">แก้ไข</span>
                              </button>

                              {/* ขวา (สีแดง): ลบ */}
                              <button
                                className="radial-btn btn-right"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteAsset(item.id);
                                  closeMenu();
                                }}
                              >
                                🗑️
                                <span className="radial-tooltip">ลบ</span>
                              </button>

                              {/* ล่างขวา: พิมพ์ */}
                              <button
                                className="radial-btn btn-bottom-right"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPrintAsset(item);
                                  closeMenu();
                                }}
                              >
                                🖨️
                                <span className="radial-tooltip">พิมพ์</span>
                              </button>

                              {/* ล่างซ้าย: แจ้งซ่อม */}
                              <button
                                className="radial-btn btn-bottom-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRepairAsset(item);
                                  closeMenu();
                                }}
                              >
                                🔧
                                <span className="radial-tooltip">แจ้งซ่อม</span>
                              </button>

                              {/* ซ้าย: ผู้รับผิดชอบ */}
                              <button
                                className="radial-btn btn-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onManageCustodian(item);
                                  closeMenu();
                                }}
                              >
                                👤
                                <span className="radial-tooltip">ผู้รับผิดชอบ</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
