import { useState } from 'react';

export default function CenteredLanding({ assets, onNavigate, onAddClick, onEditAsset, landingBadgeText }) {
  const [searchQuery, setSearchQuery] = useState('');

  const totalCount = assets.length;
  const totalCost = assets.reduce((sum, item) => sum + (item.unit_price || 0), 0);
  const activeCount = assets.filter(item => item.status === 'ใช้งาน').length;

  // Filter assets based on search query
  const filteredAssets = searchQuery.trim() === '' ? [] : assets.filter(asset => {
    const query = searchQuery.toLowerCase();
    return (
      (asset.asset_code || '').toLowerCase().includes(query) ||
      (asset.name || '').toLowerCase().includes(query) ||
      (asset.manufacturer_brand || '').toLowerCase().includes(query) ||
      (asset.responsible_department || '').toLowerCase().includes(query) ||
      (asset.location || '').toLowerCase().includes(query)
    );
  }).slice(0, 5); // Limit search results on landing to 5 items

  return (
    <div className="landing-layout-wrapper">
      {/* App Hero Branding */}
      <div className="landing-hero animate-fade-in">
        <div className="landing-badge">{landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน'}</div>
        <h1 className="landing-title">ระบบทะเบียนพัสดุ</h1>
        <p className="landing-subtitle">
          จัดการบันทึกทะเบียน ควบคุมบัญชี และประเมินค่าเสื่อมราคาทรัพย์สินตามหลักเกณฑ์ราชการ
        </p>
      </div>

      {/* Primary Landing Metrics */}
      <div className="landing-stats-grid">
        <div className="layout-card landing-stat-card">
          <span className="stat-card-title">พัสดุทั้งหมด</span>
          <span className="stat-card-value">{totalCount} รายการ</span>
        </div>
        <div className="layout-card landing-stat-card">
          <span className="stat-card-title">มูลค่าราคาทุนรวม</span>
          <span className="stat-card-value value-text">฿{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="layout-card landing-stat-card">
          <span className="stat-card-title">พัสดุพร้อมใช้งาน</span>
          <span className="stat-card-value active-text">{activeCount} รายการ</span>
        </div>
      </div>

      {/* Main Centralized Search Bar */}
      <div className="landing-search-container layout-card">
        <div className="search-input-wrapper">
          <span className="search-icon-inside">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด่วนด้วย รหัสพัสดุ, ชื่อพัสดุ, ยี่ห้อ, แผนกรับผิดชอบ, หรือสถานที่..."
            className="landing-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>&times;</button>
          )}
        </div>

        {/* Dynamic Search Results */}
        {searchQuery.trim() !== '' && (
          <div className="quick-search-results-panel">
            <h4 className="results-header-text">
              ผลลัพธ์การค้นหาด่วน ({filteredAssets.length} จาก {assets.filter(asset => {
                const query = searchQuery.toLowerCase();
                return (
                  (asset.asset_code || '').toLowerCase().includes(query) ||
                  (asset.name || '').toLowerCase().includes(query)
                );
              }).length} รายการ)
            </h4>

            {filteredAssets.length > 0 ? (
              <div className="results-list">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="search-result-item" onClick={() => onEditAsset(asset)}>
                    <div className="result-main-info">
                      <span className="result-id-badge">{asset.asset_code}</span>
                      <span className="result-name-text">{asset.name}</span>
                      <span className="result-brand-model">
                        {asset.asset_type === 'LAND_BUILDING'
                          ? (asset.document_of_title || 'โฉนด')
                          : `${asset.manufacturer_brand || ''} ${asset.serial_number || ''}`}
                      </span>
                    </div>
                    <div className="result-meta-info">
                      <span className="result-location">📍 {asset.location || 'ไม่ระบุสถานที่'}</span>
                      <span className="result-status-badge" data-status={asset.status}>
                        {asset.status}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="see-all-results-tip" onClick={() => onNavigate('sidebar', searchQuery)}>
                  ดูรายการค้นหาทั้งหมดในตารางพัสดุ ➔
                </div>
              </div>
            ) : (
              <div className="empty-results-text">ไม่พบรายการพัสดุที่ค้นหา</div>
            )}
          </div>
        )}
      </div>

      {/* Navigation & Action Links */}
      <div className="landing-quick-actions">
        <button
          className="button-primary landing-action-btn"
          onClick={onAddClick}
        >
          ➕ ลงทะเบียนจัดหาพัสดุใหม่
        </button>
        <button
          className="landing-action-btn btn-secondary-outline"
          onClick={() => onNavigate('sidebar')}
        >
          📂 ทะเบียนคุมพัสดุ
        </button>
        <button
          className="landing-action-btn btn-secondary-outline"
          onClick={() => onNavigate('bento')}
        >
          📊 Dashboard
        </button>
      </div>
    </div>
  );
}
