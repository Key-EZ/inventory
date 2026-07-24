import { useState, useEffect, useRef, useCallback } from 'react';
import useAssetTable from '../hooks/useAssetTable';
import useInventory from '../../../store/useInventory';
import AssetActionMenu from './AssetActionMenu';

const getCategoryIcon = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('คอมพิวเตอร์') || cat.includes('computer')) return '💻';
  if (cat.includes('ยานพาหนะ') || cat.includes('รถ') || cat.includes('vehicle') || cat.includes('car')) return '🚗';
  if (cat.includes('สำนักงาน') || cat.includes('office')) return '📁';
  if (cat.includes('ที่ดิน') || cat.includes('อาคาร') || cat.includes('สิ่งก่อสร้าง') || cat.includes('land') || cat.includes('building')) return '🏢';
  if (cat.includes('ไฟฟ้า') || cat.includes('วิทยุ') || cat.includes('electric')) return '⚡';
  if (cat.includes('การเกษตร') || cat.includes('agri')) return '🚜';
  if (cat.includes('โฆษณา') || cat.includes('เผยแพร่')) return '📢';
  if (cat.includes('วิทยาศาสตร์') || cat.includes('แพทย์') || cat.includes('sci')) return '🔬';
  if (cat.includes('งานบ้าน') || cat.includes('ครัว')) return '🍳';
  if (cat.includes('ดนตรี') || cat.includes('กีฬา')) return '🎵';
  return '📦';
};

const statusBadges = {
  'ใช้งาน': 'status-badge-active',
  'ชำรุด': 'status-badge-damaged',
  'กำลังซ่อม': 'status-badge-repair',
  'รอจำหน่าย': 'status-badge-pending',
  'จำหน่ายแล้ว': 'status-badge-disposed'
};

export default function AssetTable({
  assets,
  onEditAsset,
  onDeleteAsset,
  onRepairAsset,
  onPrintAsset,
  onManageCustodian,
  initialSearchQuery = ''
}) {
  const { currentUser } = useInventory();

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
    closeMenu,
    filterMyAssets,
    handleMyAssetsChange
  } = useAssetTable({
    assets,
    initialSearchQuery,
    currentUser
  });

  // Local storage persisted preferences
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('assetTable_viewMode') || 'table';
  });

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const stored = localStorage.getItem('assetTable_visibleColumns');
      return stored ? JSON.parse(stored) : ['code', 'name', 'location', 'status', 'actions'];
    } catch {
      return ['code', 'name', 'location', 'status', 'actions'];
    }
  });

  const [actionMenuType, setActionMenuType] = useState(() => {
    return localStorage.getItem('assetTable_actionMenuType') || 'dropdown';
  });

  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef(null);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('assetTable_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('assetTable_visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem('assetTable_actionMenuType', actionMenuType);
  }, [actionMenuType]);

  // Click away listener for Column Dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) {
        setColumnDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyCode = useCallback((e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(code);
    setTimeout(() => setCopiedCodeId(null), 1500);
  }, []);

  const toggleColumn = useCallback((col) => {
    setVisibleColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  }, []);

  return (
    <div className="table-view-container">
      {/* Search & Filter Panel */}
      <div className="layout-card filter-panel-card">
        <div className="filter-panel-header">
          <h3>🔍 ค้นหาและตัวกรองข้อมูล</h3>
          {(search || filterStatus !== 'ทั้งหมด' || filterCategory !== 'ทั้งหมด' || sortBy !== 'code-asc' || filterMyAssets) && (
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
              <option value="กำลังซ่อม">กำลังซ่อม</option>
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

        {currentUser && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', userSelect: 'none', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={filterMyAssets}
                onChange={(e) => handleMyAssetsChange(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              📋 เฉพาะครุภัณฑ์ในความรับผิดชอบของฉัน ({currentUser.name})
            </label>
          </div>
        )}

        {/* Active Filter Tags */}
        {(search || filterStatus !== 'ทั้งหมด' || filterCategory !== 'ทั้งหมด' || filterMyAssets) && (
          <div className="filter-tags-container">
            <span className="filter-tags-label">ตัวกรองที่เลือก:</span>
            {search && (
               <span className="filter-tag">
                 ค้นหา: "{search}"
                 <button className="btn-clear-tag" onClick={() => handleSearchChange('')}>×</button>
               </span>
            )}
            {filterStatus !== 'ทั้งหมด' && (
               <span className="filter-tag">
                 สถานะ: {filterStatus}
                 <button className="btn-clear-tag" onClick={() => handleStatusChange('ทั้งหมด')}>×</button>
               </span>
            )}
            {filterCategory !== 'ทั้งหมด' && (
               <span className="filter-tag">
                 หมวดหมู่: {filterCategory}
                 <button className="btn-clear-tag" onClick={() => handleCategoryChange('ทั้งหมด')}>×</button>
               </span>
            )}
            {filterMyAssets && (
               <span className="filter-tag">
                 👤 ครุภัณฑ์ของฉัน
                 <button className="btn-clear-tag" onClick={() => handleMyAssetsChange(false)}>×</button>
               </span>
            )}
          </div>
        )}
      </div>

      {/* Main Data Layout Card */}
      <div className="layout-card table-data-card animate-fade-in" style={{ padding: '20px', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div className="results-indicator">
            พบครุภัณฑ์ทั้งหมด <strong>{totalItems}</strong> รายการ
            {totalItems !== assets.length && ` (จากข้อมูลหลัก ${assets.length} รายการ)`}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Action Menu Style Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>รูปแบบเมนู:</span>
              <div className="view-toggle-container">
                <button
                  className={`view-toggle-btn ${actionMenuType === 'dropdown' ? 'active' : ''}`}
                  onClick={() => setActionMenuType('dropdown')}
                  title="เมนูดรอปดาวน์แบบลอย (ไม่ขยับความสูงแถว)"
                >
                  ⚡ ดรอปดาวน์
                </button>
                <button
                  className={`view-toggle-btn ${actionMenuType === 'radial' ? 'active' : ''}`}
                  onClick={() => setActionMenuType('radial')}
                  title="เมนูวงกลม (ขยายพื้นที่แถว)"
                >
                  ⭕ วงกลม
                </button>
              </div>
            </div>

            {/* Column Selector (only in list/table view) */}
            {viewMode === 'table' && (
              <div className="column-selector-container" ref={columnDropdownRef}>
                <button
                  className="column-selector-trigger"
                  onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
                >
                  ⚙️ เลือกคอลัมน์
                </button>
                {columnDropdownOpen && (
                  <div className="column-selector-dropdown">
                    <label className="column-option-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes('code')}
                        onChange={() => toggleColumn('code')}
                      />
                      รหัสพัสดุ
                    </label>
                    <label className="column-option-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes('name')}
                        onChange={() => toggleColumn('name')}
                      />
                      รายการทรัพย์สิน
                    </label>
                    <label className="column-option-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes('location')}
                        onChange={() => toggleColumn('location')}
                      />
                      สถานที่ตั้ง/ผู้ดูแล
                    </label>
                    <label className="column-option-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes('price')}
                        onChange={() => toggleColumn('price')}
                      />
                      ราคาทุน
                    </label>
                    <label className="column-option-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes('bookvalue')}
                        onChange={() => toggleColumn('bookvalue')}
                      />
                      มูลค่าสุทธิ
                    </label>
                    <label className="column-option-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes('status')}
                        onChange={() => toggleColumn('status')}
                      />
                      สถานะ
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="view-toggle-container">
              <button
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                📋 ตาราง
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
              >
                🎴 การ์ด
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'card' ? (
          /* Card View Layout */
          <div className="asset-card-grid">
            {paginatedAssets.length > 0 ? (
              paginatedAssets.map(item => {
                const isMenuOpen = openMenuId === item.id;
                const bookValuePercentage = item.unit_price > 0 
                  ? Math.max(0, Math.min(100, (item.book_value / item.unit_price) * 100))
                  : 0;
                
                // Color mapping for progress bar
                let progressBarColor = 'var(--status-active-bar)';
                if (bookValuePercentage <= 20) progressBarColor = 'var(--status-pending-bar)';
                else if (bookValuePercentage <= 50) progressBarColor = 'var(--status-damaged-bar)';

                return (
                  <div key={item.id} className="asset-card">
                    <div className="asset-card-header">
                      <strong 
                        className="asset-card-code" 
                        onClick={(e) => handleCopyCode(e, item.asset_code)}
                        title="คลิกเพื่อคัดลอกรหัสพัสดุ"
                      >
                        {item.asset_code} {copiedCodeId === item.asset_code ? '✓' : '📋'}
                      </strong>
                      <span className={`status-badge ${statusBadges[item.status || 'ใช้งาน']}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="asset-card-title-section">
                      <div className="asset-card-icon-wrapper">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="asset-card-title-content">
                        <div className="asset-card-name" title={item.name}>{item.name}</div>
                        <div className="asset-card-category">
                          {item.category || (item.asset_type === 'LAND_BUILDING' ? 'ที่ดินและสิ่งก่อสร้าง' : 'ครุภัณฑ์')}
                        </div>
                      </div>
                    </div>

                    <div className="asset-card-details">
                      <div className="asset-card-detail-item">
                        🏢 {item.responsible_department || 'ไม่ระบุหน่วยงาน'}
                      </div>
                      <div className="asset-card-detail-item">
                        📍 {item.location || 'ไม่ระบุสถานที่'}
                      </div>
                      {item.serial_number && (
                        <div className="asset-card-detail-item" title={item.serial_number}>
                          🏷️ SN: {item.serial_number}
                        </div>
                      )}
                    </div>

                    <div className="asset-card-financials">
                      <div className="asset-card-fin-row">
                        <span className="asset-card-fin-label">ราคาทุน:</span>
                        <span className="asset-card-fin-value">
                          {item.unit_price ? `${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท` : '-'}
                        </span>
                      </div>
                      <div className="asset-card-fin-row">
                        <span className="asset-card-fin-label">มูลค่าคงเหลือ:</span>
                        <span className="asset-card-fin-value" style={{ color: 'var(--status-active-text)' }}>
                          {item.book_value !== undefined ? `${Number(item.book_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท` : '-'}
                        </span>
                      </div>
                      <div className="asset-card-dep-progress-bar">
                        <div 
                          className="asset-card-dep-progress-fill" 
                          style={{ 
                            width: `${bookValuePercentage}%`,
                            backgroundColor: progressBarColor
                          }} 
                        />
                      </div>
                    </div>

                    <div className="asset-card-footer">
                      <span className="asset-card-brand">
                        {item.manufacturer_brand ? `ยี่ห้อ: ${item.manufacturer_brand}` : (item.building_style ? `สไตล์: ${item.building_style}` : '')}
                      </span>
                      
                      {/* Action Menu inside Card */}
                      <AssetActionMenu
                        item={item}
                        isMenuOpen={isMenuOpen}
                        actionMenuType={actionMenuType}
                        toggleMenu={toggleMenu}
                        closeMenu={closeMenu}
                        onEditAsset={onEditAsset}
                        onDeleteAsset={onDeleteAsset}
                        onRepairAsset={onRepairAsset}
                        onPrintAsset={onPrintAsset}
                        onManageCustodian={onManageCustodian}
                        radialStyle={{ transform: 'scale(0.85)' }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="table-empty-row" style={{ gridColumn: '1 / -1', padding: '40px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                🔍 ไม่พบข้อมูลพัสดุที่ตรงกับเงื่อนไขการค้นหา
              </div>
            )}
          </div>
        ) : (
          /* List Table View Layout */
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {visibleColumns.includes('code') && <th style={{ width: '15%' }}>รหัสพัสดุ</th>}
                  {visibleColumns.includes('name') && <th style={{ width: '32%' }}>รายการทรัพย์สิน / พัสดุ</th>}
                  {visibleColumns.includes('location') && <th style={{ width: '22%' }}>หน่วยดูแล/สถานที่ตั้ง</th>}
                  {visibleColumns.includes('price') && <th style={{ width: '12%' }} className="text-right">ราคาทุน</th>}
                  {visibleColumns.includes('bookvalue') && <th style={{ width: '12%' }} className="text-right">มูลค่าคงเหลือ</th>}
                  {visibleColumns.includes('status') && <th style={{ width: '10%' }}>สถานะ</th>}
                  <th style={{ width: '10%' }} className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.length > 0 ? (
                  paginatedAssets.map(item => {
                    const isMenuOpen = openMenuId === item.id;
                    return (
                      <tr key={item.id} className="table-row-hover">
                        {visibleColumns.includes('code') && (
                          <td className="table-cell-id">
                            <strong 
                              className="asset-card-code" 
                              onClick={(e) => handleCopyCode(e, item.asset_code)}
                              title="คลิกเพื่อคัดลอกรหัสพัสดุ"
                            >
                              {item.asset_code} {copiedCodeId === item.asset_code ? '✓' : '📋'}
                            </strong>
                          </td>
                        )}
                        
                        {visibleColumns.includes('name') && (
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
                        )}
                        
                        {visibleColumns.includes('location') && (
                          <td>
                            <div className="custodian-text">🏢 {item.responsible_department || 'ไม่ระบุหน่วยงาน'}</div>
                            <div className="location-text">📍 {item.location || 'ไม่ระบุสถานที่'}</div>
                          </td>
                        )}
                        
                        {visibleColumns.includes('price') && (
                          <td className="text-right" style={{ fontWeight: '500' }}>
                            {item.unit_price ? `${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท` : '-'}
                          </td>
                        )}

                        {visibleColumns.includes('bookvalue') && (
                          <td className="text-right" style={{ fontWeight: '600', color: 'var(--status-active-text)' }}>
                            {item.book_value !== undefined ? `${Number(item.book_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท` : '-'}
                          </td>
                        )}
                        
                        {visibleColumns.includes('status') && (
                          <td>
                            <span className={`status-badge ${statusBadges[item.status || 'ใช้งาน']}`}>
                              {item.status}
                            </span>
                          </td>
                        )}

                        <td
                          className="text-center"
                          style={{
                            overflow: 'visible',
                            position: 'relative',
                            zIndex: isMenuOpen ? 50 : 1,
                            paddingTop: (isMenuOpen && actionMenuType === 'radial') ? '60px' : '16px',
                            paddingBottom: (isMenuOpen && actionMenuType === 'radial') ? '60px' : '16px',
                            transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <AssetActionMenu
                            item={item}
                            isMenuOpen={isMenuOpen}
                            actionMenuType={actionMenuType}
                            toggleMenu={toggleMenu}
                            closeMenu={closeMenu}
                            onEditAsset={onEditAsset}
                            onDeleteAsset={onDeleteAsset}
                            onRepairAsset={onRepairAsset}
                            onPrintAsset={onPrintAsset}
                            onManageCustodian={onManageCustodian}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="table-empty-row">
                      🔍 ไม่พบข้อมูลพัสดุที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
