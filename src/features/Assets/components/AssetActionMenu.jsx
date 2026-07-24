import React from 'react';

export default function AssetActionMenu({
  item,
  isMenuOpen,
  actionMenuType,
  toggleMenu,
  closeMenu,
  onEditAsset,
  onDeleteAsset,
  onRepairAsset,
  onPrintAsset,
  onManageCustodian,
  radialStyle = {}
}) {
  return (
    <div className="table-actions" style={{ overflow: 'visible' }}>
      {actionMenuType === 'dropdown' ? (
        <div className="floating-action-menu-container">
          <button
            className="btn-action-trigger"
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu(item.id);
            }}
          >
            ⚙️
          </button>
          {isMenuOpen && (
            <>
              <div
                className="floating-menu-overlay"
                onClick={(e) => {
                  e.stopPropagation();
                  closeMenu();
                }}
              />
              <div className="floating-action-menu">
                <button
                  className="floating-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAsset(item);
                    closeMenu();
                  }}
                >
                  ✏️ แก้ไข
                </button>
                <button
                  className="floating-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRepairAsset(item);
                    closeMenu();
                  }}
                >
                  🔧 แจ้งซ่อม
                </button>
                <button
                  className="floating-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageCustodian(item);
                    closeMenu();
                  }}
                >
                  👤 ผู้รับผิดชอบ
                </button>
                <button
                  className="floating-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintAsset(item);
                    closeMenu();
                  }}
                >
                  🖨️ พิมพ์
                </button>
                <button
                  className="floating-menu-item delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAsset(item.id);
                    closeMenu();
                  }}
                >
                  🗑️ ลบ
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={`radial-menu-container ${isMenuOpen ? 'active' : ''}`} style={radialStyle}>
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
            {/* บน: แก้ไข */}
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

            {/* ขวา: ลบ */}
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
      )}
    </div>
  );
}
