import { useState, useMemo } from 'react';

export default function AuditLogPanel({ auditLogs = [], onClearLogs, isSystemAdmin }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ทั้งหมด');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // 1. Filtering logic
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search query filter (matches details, user, or category)
      const matchesSearch = searchQuery
        ? String(log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(log.user || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(log.action || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Category filter
      const matchesAction = selectedAction === 'ทั้งหมด' || log.action === selectedAction;

      // Date range filter
      let matchesDate = true;
      if (log.timestamp) {
        const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          if (logDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate).setHours(23, 59, 59, 999);
          if (logDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [auditLogs, searchQuery, selectedAction, startDate, endDate]);

  // 2. Pagination math
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // 3. Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAction('ทั้งหมด');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // 4. Export CSV with BOM for correct Thai display in Microsoft Excel
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('ไม่มีข้อมูลประวัติสำหรับการส่งออก');
      return;
    }

    const headers = ['วันเวลา', 'ประเภทกิจกรรม', 'รายละเอียดกิจกรรม', 'ผู้ดำเนินการ'];
    const rows = filteredLogs.map(log => {
      const dateStr = log.timestamp 
        ? new Date(log.timestamp).toLocaleString('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }) 
        : '-';
      return [
        dateStr,
        log.action,
        log.details,
        log.user
      ];
    });

    const csvContent = "\uFEFF" + [headers, ...rows]
      .map(row => row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. Print logs
  const handlePrint = () => {
    window.print();
  };

  // 6. Action Badge classes
  const getBadgeClass = (action) => {
    switch (action) {
      case 'ครุภัณฑ์':
        return 'audit-badge-asset';
      case 'งานซ่อม':
        return 'audit-badge-repair';
      case 'ตั้งค่าระบบ':
        return 'audit-badge-settings';
      case 'ระบบ':
        return 'audit-badge-system';
      default:
        return 'audit-badge-default';
    }
  };

  // 7. Calculate Counts for Summary Cards
  const stats = useMemo(() => {
    return auditLogs.reduce((acc, log) => {
      acc.total += 1;
      if (log.action === 'ครุภัณฑ์') acc.asset += 1;
      else if (log.action === 'งานซ่อม') acc.repair += 1;
      else if (log.action === 'ตั้งค่าระบบ') acc.settings += 1;
      else acc.system += 1;
      return acc;
    }, { total: 0, asset: 0, repair: 0, settings: 0, system: 0 });
  }, [auditLogs]);

  return (
    <div className="flex-column-gap print-area">
      {/* 1. Header and Statistics */}
      <div className="flex-center-between print:hidden">
        <div>
          <h2>ประวัติการใช้งานระบบ (Audit Log)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            ติดตามการดำเนินงานของระบบ การเพิ่ม แก้ไข ลบครุภัณฑ์ ใบแจ้งซ่อม และการปรับแต่งค่าระบบพัสดุ
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="button-secondary" onClick={handleExportCSV} title="ดาวน์โหลดเป็นไฟล์ Excel/CSV">
            📥 ส่งออก CSV
          </button>
          <button className="button-secondary" onClick={handlePrint} title="สั่งพิมพ์รายงาน">
            🖨️ พิมพ์ประวัติ
          </button>
          {isSystemAdmin && (
            <button className="btn-cancel" onClick={onClearLogs} title="ล้างประวัติกิจกรรมทั้งหมด">
              🗑️ ล้างประวัติ
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="audit-stats-grid print:hidden">
        <div className="audit-stat-card">
          <div className="audit-stat-title">📝 กิจกรรมทั้งหมด</div>
          <div className="audit-stat-value">{stats.total} รายการ</div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-title" style={{ color: 'var(--status-active-text)' }}>📦 การจัดการครุภัณฑ์</div>
          <div className="audit-stat-value">{stats.asset} รายการ</div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-title" style={{ color: 'var(--status-damaged-text)' }}>🔧 งานซ่อมบำรุง</div>
          <div className="audit-stat-value">{stats.repair} รายการ</div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-title" style={{ color: 'var(--primary-color)' }}>⚙️ ปรับแต่งการตั้งค่า</div>
          <div className="audit-stat-value">{stats.settings} รายการ</div>
        </div>
      </div>

      {/* 2. Filter Form Card */}
      <div className="layout-card print:hidden" style={{ padding: '20px' }}>
        <div className="filter-group-row">
          {/* Search Input */}
          <div className="filter-group-item" style={{ flex: '2' }}>
            <label>ค้นหากิจกรรม</label>
            <input
              type="text"
              placeholder="ค้นหารายละเอียดกิจกรรม, ผู้ดำเนินการ..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="filter-input-element"
            />
          </div>

          {/* Action Filter */}
          <div className="filter-group-item">
            <label>ประเภทกิจกรรม</label>
            <select
              value={selectedAction}
              onChange={(e) => handleFilterChange(setSelectedAction, e.target.value)}
              className="filter-input-element"
            >
              <option value="ทั้งหมด">ทั้งหมดทุกประเภท</option>
              <option value="ครุภัณฑ์">📦 การจัดการครุภัณฑ์</option>
              <option value="งานซ่อม">🔧 งานซ่อมบำรุง</option>
              <option value="ตั้งค่าระบบ">⚙️ การปรับแต่งค่าระบบ</option>
              <option value="ระบบ">💻 กิจกรรมของระบบ</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="filter-group-item">
            <label>ตั้งแต่วันที่</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
              className="filter-input-element"
            />
          </div>

          {/* End Date */}
          <div className="filter-group-item">
            <label>ถึงวันที่</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
              className="filter-input-element"
            />
          </div>

          {/* Clear Button */}
          <div className="filter-group-item" style={{ justifyContent: 'flex-end', display: 'flex' }}>
            <button className="button-secondary" onClick={handleClearFilters} style={{ width: '100%' }}>
              🧹 ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* 3. Table Log Display */}
      <div className="layout-card table-data-card animate-fade-in" style={{ padding: '20px' }}>
        <div className="print-header-title text-center print:block" style={{ display: 'none', marginBottom: '20px' }}>
          <h2>รายงานประวัติการดำเนินงานระบบ (Audit Log)</h2>
          <p>ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }} className="print:hidden">
          <div className="results-indicator">
            พบประวัติกิจกรรมทั้งหมด <strong>{totalItems}</strong> รายการ
            {totalItems !== auditLogs.length && ` (จากทั้งหมด ${auditLogs.length} รายการ)`}
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>วันเวลา</th>
                <th style={{ width: '15%' }}>ประเภท</th>
                <th style={{ width: '50%' }}>รายละเอียดกิจกรรม</th>
                <th style={{ width: '15%' }}>ผู้ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map(log => {
                  const localDateStr = log.timestamp
                    ? new Date(log.timestamp).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : '-';
                  return (
                    <tr key={log.id} className="table-row-hover">
                      <td className="table-cell-id">{localDateStr}</td>
                      <td>
                        <span className={`status-badge ${getBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-main)' }}>
                        {log.details}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        👤 {log.user}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="table-empty-row">
                    🔍 ไม่พบประวัติการดำเนินงานตามตัวกรองที่ระบุ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex-center-between print:hidden" style={{ marginTop: '20px' }}>
            <div className="pagination-info">
              แสดงหน้า <strong>{currentPage}</strong> จาก <strong>{totalPages}</strong> หน้า (แถวละ {itemsPerPage} รายการ)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="button-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ◀ ย้อนกลับ
              </button>
              <button
                className="button-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                ถัดไป ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
