
export default function BentoDashboard({ assets, onAddClick, onResetDemo, onViewDetails }) {
  // 1. Calculations
  const totalCount = assets.length;
  const totalCost = assets.reduce((sum, item) => sum + (item.unit_price || 0), 0);
  const totalDepreciation = assets.reduce((sum, item) => sum + (item.accumulated_depreciation || 0), 0);
  const totalBookValue = assets.reduce((sum, item) => sum + (item.book_value || 0), 0);

  // Status breakdown
  const statusCounts = assets.reduce((acc, item) => {
    const status = item.status || 'ใช้งาน';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    'ใช้งาน': { bg: '#dcfce7', text: '#15803d', bar: '#22c55e' },
    'ชำรุด': { bg: '#fef3c7', text: '#b45309', bar: '#f59e0b' },
    'รอจำหน่าย': { bg: '#fee2e2', text: '#b91c1c', bar: '#ef4444' },
    'จำหน่ายแล้ว': { bg: '#f1f5f9', text: '#475569', bar: '#64748b' }
  };

  // Location breakdown
  const locationCounts = assets.reduce((acc, item) => {
    const loc = item.location || 'ไม่ระบุสถานที่';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const sortedLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Recent assets (sorted by acquisition year in code descending)
  const getYear = (code) => {
    const parts = String(code || '').split('/');
    if (parts.length >= 2) return parseInt(parts[1]) || 0;
    return 0;
  };

  const recentAssets = [...assets]
    .sort((a, b) => getYear(b.asset_code) - getYear(a.asset_code))
    .slice(0, 4);

  return (
    <>
      {/* 1. Quick Stats: Total Count */}
      <div className="layout-card bento-card col-span-1">
        <span className="bento-label">จำนวนพัสดุในระบบ</span>
        <div className="bento-value highlight-num">{totalCount} <span className="bento-unit">รายการ</span></div>
        <div className="bento-desc">คุมทะเบียน พ.ด.1 และ พ.ด.2 รวมกัน</div>
      </div>

      {/* 2. Quick Stats: Total Cost */}
      <div className="layout-card bento-card col-span-2">
        <span className="bento-label">มูลค่าสินทรัพย์ราคาทุนรวม</span>
        <div className="bento-value cost-color">฿{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="bento-desc">ราคาทุนจัดหาเริ่มแรกทั้งหมด</div>
      </div>

      {/* 3. Action Hub */}
      <div className="layout-card bento-card col-span-1 flex-center-between bg-primary-gradient">
        <h4 className="bento-action-title">จัดการข้อมูลพัสดุ</h4>
        <div className="bento-action-buttons">
          <button className="bento-btn-action btn-add-new" onClick={onAddClick}>
            ➕ ลงทะเบียนพัสดุใหม่
          </button>
          <button className="bento-btn-action btn-reset" onClick={onResetDemo}>
            🔄 โหลดข้อมูลตัวอย่าง
          </button>
        </div>
      </div>

      {/* 4. Quick Stats: Book Value */}
      <div className="layout-card bento-card col-span-2">
        <span className="bento-label">มูลค่าคงเหลือสุทธิ (Book Value)</span>
        <div className="bento-value bookvalue-color">฿{totalBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="bento-desc">หลังหักค่าเสื่อมราคาทางบัญชีสะสม</div>
      </div>

      {/* 5. Quick Stats: Accumulated Depreciation */}
      <div className="layout-card bento-card col-span-2">
        <span className="bento-label">ค่าเสื่อมราคาสะสมทั้งหมด</span>
        <div className="bento-value depreciation-color">฿{totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="bento-desc">คิดเป็น {totalCost > 0 ? ((totalDepreciation / totalCost) * 100).toFixed(1) : 0}% ของราคาทุนสะสม</div>
      </div>

      {/* 6. Status distribution */}
      <div className="layout-card bento-card col-span-2 row-span-2">
        <h3 className="bento-section-title">สัดส่วนสถานะการใช้งาน</h3>
        <div className="bento-status-list">
          {['ใช้งาน', 'ชำรุด', 'รอจำหน่าย', 'จำหน่ายแล้ว'].map(statusName => {
            const count = statusCounts[statusName] || 0;
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
            const theme = statusColors[statusName] || { bg: '#f1f5f9', text: '#475569', bar: '#64748b' };
            
            return (
              <div key={statusName} className="status-progress-item">
                <div className="status-progress-info">
                  <span className="status-badge-custom" style={{ backgroundColor: theme.bg, color: theme.text }}>
                    {statusName}
                  </span>
                  <span className="status-progress-count">{count} รายการ ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${percentage}%`, backgroundColor: theme.bar }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Locations breakdown */}
      <div className="layout-card bento-card col-span-2 row-span-2">
        <h3 className="bento-section-title">สถานที่ตั้งหลัก (Top Locations)</h3>
        <div className="bento-locations-list">
          {sortedLocations.length > 0 ? (
            sortedLocations.map(([locName, count]) => {
              const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={locName} className="location-list-item">
                  <div className="location-info">
                    <span className="loc-icon">📍</span>
                    <span className="loc-name">{locName}</span>
                  </div>
                  <span className="loc-count">{count} รายการ ({percentage.toFixed(0)}%)</span>
                </div>
              );
            })
          ) : (
            <div className="empty-bento-state">ไม่มีข้อมูลสถานที่ตั้ง</div>
          )}
        </div>
      </div>

      {/* 8. Recent Additions */}
      <div className="layout-card bento-card col-span-4">
        <div className="flex-center-between margin-bottom-sm">
          <h3 className="bento-section-title">พัสดุทะเบียนล่าจัดตั้ง (ปีล่าสุด)</h3>
          <span className="bento-link" onClick={onViewDetails}>ดูทั้งหมดในตาราง ➔</span>
        </div>
        <div className="bento-recent-table-wrapper">
          <table className="bento-recent-table">
            <thead>
              <tr>
                <th>รหัสพัสดุ</th>
                <th>ชื่อทรัพย์สิน</th>
                <th>ปีที่ได้มา (พ.ศ.)</th>
                <th>ราคาต่อหน่วย (บาท)</th>
                <th>หน่วยรับผิดชอบ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.length > 0 ? (
                recentAssets.map(asset => {
                  const theme = statusColors[asset.status] || { bg: '#f1f5f9', text: '#475569' };
                  const parts = String(asset.asset_code || '').split('/');
                  const displayYear = parts.length >= 2 ? `25${parts[1]}` : '-';

                  return (
                    <tr key={asset.id}>
                      <td><strong className="recent-id">{asset.asset_code}</strong></td>
                      <td>
                        <div className="recent-name">{asset.name}</div>
                        <div className="recent-brand">
                          {asset.asset_type === 'LAND_BUILDING' 
                            ? (asset.document_of_title || 'พ.ด.1') 
                            : `${asset.manufacturer_brand || ''} ${asset.serial_number || ''}`}
                        </div>
                      </td>
                      <td>{displayYear}</td>
                      <td>{(asset.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{asset.responsible_department || '-'}</td>
                      <td>
                        <span className="status-badge-cell" style={{ backgroundColor: theme.bg, color: theme.text }}>
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">ไม่มีข้อมูลพัสดุ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
