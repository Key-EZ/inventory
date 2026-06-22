import { useState } from 'react';
import { calculateDepreciation } from '../../utils/depreciation';
import { defaultDepartments } from '../../utils/mockData';



const generateNewAssetId = () => `asset-${Date.now()}`;

const formatAssetCode = (value) => {
  const clean = value.replace(/\D/g, '');
  const truncated = clean.slice(0, 9);
  if (truncated.length > 5) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 5)}-${truncated.slice(5)}`;
  } else if (truncated.length > 3) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  }
  return truncated;
};

export default function AssetForm({
  asset,
  custodians = [],
  brands = [],
  locations = [],
  landBuildingCategories = [],
  equipmentCategories = [],
  agencies = [],
  positions = [],
  onSubmit,
  onClose,
  sellers = []
}) {
  const isEdit = !!asset;

  // Tabs: 'general', 'custodian_history', 'spec', 'financial'
  const [activeTab, setActiveTab] = useState('general');

  // Form states (Flat fields)
  const [assetType, setAssetType] = useState(asset ? asset.asset_type || 'EQUIPMENT' : 'EQUIPMENT'); // 'LAND_BUILDING', 'EQUIPMENT'
  const [category, setCategory] = useState(asset ? asset.category || '' : (equipmentCategories[0] || ''));
  const [assetCode, setAssetCode] = useState(asset ? asset.asset_code || '' : '');
  const [name, setName] = useState(asset ? asset.name || '' : '');
  const [location, setLocation] = useState(asset ? asset.location || '' : '');
  const [acquisitionMethod, setAcquisitionMethod] = useState(asset ? asset.acquisition_method || 'ซื้อ' : 'ซื้อ');
  const [deliveryDocumentNo, setDeliveryDocumentNo] = useState(asset ? asset.delivery_document_no || '' : '');
  const [deliveryDocumentDate, setDeliveryDocumentDate] = useState(asset ? asset.delivery_document_date || '' : '');
  const [sellerName, setSellerName] = useState(asset ? asset.seller_name || '' : (sellers[0] || ''));
  const [unitPrice, setUnitPrice] = useState(asset ? asset.unit_price || 0 : 0);
  const budgetOwner = asset ? asset.budget_owner || '' : '';
  const [responsibleDepartment, setResponsibleDepartment] = useState(asset ? asset.responsible_department || '' : '');

  // พ.ด. 1 fields
  const [documentOfTitle, setDocumentOfTitle] = useState(asset ? asset.document_of_title || '' : '');
  const [areaSize, setAreaSize] = useState(asset ? asset.area_size || '' : '');
  const [buildingStyle, setBuildingStyle] = useState(asset ? asset.building_style || '' : '');

  // พ.ด. 2 fields
  const [manufacturerBrand, setManufacturerBrand] = useState(asset ? asset.manufacturer_brand || '' : '');
  const [serialNumber, setSerialNumber] = useState(asset ? asset.serial_number || '' : '');
  const [engineNumber, setEngineNumber] = useState(asset ? asset.engine_number || '' : '');
  const [chassisNumber, setChassisNumber] = useState(asset ? asset.chassis_number || '' : '');
  const [vehicleRegistration, setVehicleRegistration] = useState(asset ? asset.vehicle_registration || '' : '');
  const [color, setColor] = useState(asset ? asset.color || '' : '');
  const [warrantyStartDate, setWarrantyStartDate] = useState(asset ? asset.warranty_start_date || '' : '');
  const [warrantyEndDate, setWarrantyEndDate] = useState(asset ? asset.warranty_end_date || '' : '');
  const [warrantyCompany, setWarrantyCompany] = useState(asset ? asset.warranty_company || '' : '');

  // Status
  const [status, setStatus] = useState(asset ? asset.status || 'ใช้งาน' : 'ใช้งาน');

  const maintenances = asset ? asset.maintenances || [] : [];

  // Calculate depreciation dynamically during render
  const calc = calculateDepreciation(assetCode, unitPrice);
  const depreciationRate = calc.depreciationRatePercent;
  const accumulatedDepreciation = calc.accumulatedDepreciation;
  const bookValue = calc.bookValue;

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !assetCode || !category) {
      alert('กรุณากรอก ชื่อพัสดุ รหัสพัสดุ และเลือกหมวดหมู่พัสดุ');
      return;
    }

    // Basic regex check for 3-part code format
    const codeFormat = /^\d{3}-\d{2}-\d{4}$/;
    if (!codeFormat.test(assetCode)) {
      if (!window.confirm('คำเตือน: รหัสพัสดุไม่ได้อยู่ในรูปแบบแนะนำ (เช่น 001-10-0001) คุณต้องการใช้รหัสนี้ต่อหรือไม่?')) {
        return;
      }
    }

    // Preserve custodian history
    const custodianHistory = asset?.custodian_history || [];

    // Determine overall budget_owner from the latest custodian history entry, if any
    let finalBudgetOwner = asset?.budget_owner || '';
    if (custodianHistory.length > 0) {
      const sorted = [...custodianHistory].sort((a, b) => {
        const yA = parseInt(a.year) || 0;
        const yB = parseInt(b.year) || 0;
        return yB - yA;
      });
      finalBudgetOwner = sorted[0]?.budget_owner || '';
    }

    const payload = {
      id: asset?.id || generateNewAssetId(),
      asset_type: assetType,
      category,
      asset_code: assetCode,
      name,
      location,
      acquisition_method: acquisitionMethod,
      delivery_document_no: deliveryDocumentNo,
      delivery_document_date: deliveryDocumentDate,
      seller_name: sellerName,
      unit_price: parseFloat(unitPrice) || 0,
      budget_owner: finalBudgetOwner,
      responsible_department: responsibleDepartment,
      status,

      // Ph.D. 1 specific fields
      document_of_title: assetType === 'LAND_BUILDING' ? documentOfTitle : '',
      area_size: assetType === 'LAND_BUILDING' ? areaSize : '',
      building_style: assetType === 'LAND_BUILDING' ? buildingStyle : '',

      // Ph.D. 2 specific fields
      manufacturer_brand: assetType === 'EQUIPMENT' ? manufacturerBrand : '',
      serial_number: assetType === 'EQUIPMENT' ? serialNumber : '',
      engine_number: assetType === 'EQUIPMENT' ? engineNumber : '',
      chassis_number: assetType === 'EQUIPMENT' ? chassisNumber : '',
      vehicle_registration: assetType === 'EQUIPMENT' ? vehicleRegistration : '',
      color: assetType === 'EQUIPMENT' ? color : '',
      warranty_start_date: assetType === 'EQUIPMENT' ? warrantyStartDate : '',
      warranty_end_date: assetType === 'EQUIPMENT' ? warrantyEndDate : '',
      warranty_company: assetType === 'EQUIPMENT' ? warrantyCompany : '',

      // Calculated stats
      depreciation_rate_percent: depreciationRate,
      accumulated_depreciation: accumulatedDepreciation,
      book_value: bookValue,

      // Maintenances sub-table list
      maintenances: maintenances,

      // Custodian history list
      custodian_history: custodianHistory
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content-card">
        <div className="modal-header-section">
          <h2>{isEdit ? 'แก้ไขข้อมูลพัสดุ พ.ด.1/2' : 'ลงทะเบียนจัดหาพัสดุใหม่'}</h2>
          <button className="close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        <div className="form-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            1. ข้อมูลทั่วไป
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'spec' ? 'active' : ''}`}
            onClick={() => setActiveTab('spec')}
          >
            2. รายละเอียดเฉพาะ ({assetType === 'LAND_BUILDING' ? 'พ.ด.1' : 'พ.ด.2'})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            3. ค่าเสื่อมราคา
          </button>
        </div>

        <form onSubmit={handleSubmit} className="asset-form-body">
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="tab-panel">
              <div className="form-row">
                <div className="form-group col">
                  <label>ประเภททะเบียนหลัก *</label>
                  <select
                    value={assetType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setAssetType(newType);
                      setCategory(newType === 'LAND_BUILDING' ? (landBuildingCategories[0] || '') : (equipmentCategories[0] || ''));
                    }}
                    required
                  >
                    <option value="EQUIPMENT">ครุภัณฑ์</option>
                    <option value="LAND_BUILDING">ที่ดินและสิ่งก่อสร้าง</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>หมวดหมู่พัสดุ *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {(assetType === 'LAND_BUILDING' ? landBuildingCategories : equipmentCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group col">
                  <label>รหัสพัสดุ *</label>
                  <input
                    type="text"
                    value={assetCode}
                    onChange={(e) => setAssetCode(formatAssetCode(e.target.value))}
                    placeholder="000-00-0000"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-2">
                  <label>ชื่อพัสดุ *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น รถยนต์เอนกประสงค์, กล้องวงจรปิด"
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>สถานะ</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ใช้งาน">ใช้งาน</option>
                    <option value="ชำรุด">ชำรุด</option>
                    <option value="กำลังซ่อม">กำลังซ่อม</option>
                    <option value="รอจำหน่าย">รอจำหน่าย</option>
                    <option value="จำหน่ายแล้ว">จำหน่ายแล้ว</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>ลักษณะที่ได้กรรมสิทธิ์ *</label>
                  <select
                    value={acquisitionMethod}
                    onChange={(e) => setAcquisitionMethod(e.target.value)}
                    required
                  >
                    <option value="ซื้อ">ซื้อ</option>
                    <option value="จ้าง">จ้าง</option>
                    <option value="รับโอน">รับโอน</option>
                    <option value="บริจาค">บริจาค</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>ราคาต่อหน่วย (บาท) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>ที่ตั้งพัสดุ *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกสถานที่ตั้ง --</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group col">
                  <label>ส่วนราชการเจ้าของพัสดุ *</label>
                  <select
                    value={responsibleDepartment}
                    onChange={(e) => setResponsibleDepartment(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกส่วนราชการ --</option>
                    {defaultDepartments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>เลขที่ใบส่งของ/สัญญา *</label>
                  <input
                    type="text"
                    value={deliveryDocumentNo}
                    onChange={(e) => setDeliveryDocumentNo(e.target.value)}
                    placeholder="เช่น เลขที่ใบส่งของ หรือ PO"
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>วันเดือนปีในเอกสาร *</label>
                  <input
                    type="date"
                    value={deliveryDocumentDate}
                    onChange={(e) => setDeliveryDocumentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>ผู้ขาย / คู่สัญญา *</label>
                  <select
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกผู้ขาย --</option>
                    {sellers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}



          {/* TAB 3: Specific Fields */}
          {activeTab === 'spec' && (
            <div className="tab-panel">
              {assetType === 'LAND_BUILDING' ? (
                <>
                  <div className="info-alert info-green">
                    <strong>📗 ทะเบียนพัสดุ พ.ด.1 (ที่ดินและสิ่งก่อสร้าง):</strong> กรอกข้อมูลกรรมสิทธิ์เอกสารสิทธิ์ ที่ดิน และลักษณะโครงสร้างสิ่งก่อสร้าง
                  </div>
                  <div className="form-group">
                    <label>ชนิดและเลขที่เอกสารสิทธิ์ (โฉนด/น.ส.3/ส.ค.1)</label>
                    <input
                      type="text"
                      value={documentOfTitle}
                      onChange={(e) => setDocumentOfTitle(e.target.value)}
                      placeholder="เช่น โฉนดที่ดินเลขที่ 45879 เล่ม 458"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label>จำนวนเนื้อที่</label>
                      <input
                        type="text"
                        value={areaSize}
                        onChange={(e) => setAreaSize(e.target.value)}
                        placeholder="เช่น 10 ไร่ 2 งาน 50 ตารางวา"
                      />
                    </div>
                    <div className="form-group col">
                      <label>ลักษณะโรงเรือน (ตึก/ไม้/ครึ่งตึกครึ่งไม้, จำนวนชั้น)</label>
                      <input
                        type="text"
                        value={buildingStyle}
                        onChange={(e) => setBuildingStyle(e.target.value)}
                        placeholder="เช่น ตึกคอนกรีต 2 ชั้น"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-alert info-yellow">
                    <strong>📒 ทะเบียนพัสดุ พ.ด.2 (ครุภัณฑ์ ยานพาหนะ ปศุสัตว์):</strong> กรอกข้อมูลเลขประจำเครื่อง ยี่ห้อ และรายละเอียดการรับประกัน
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label>ชื่อผู้ผลิต/ตราสินค้า (ยี่ห้อ)</label>
                      <select
                        value={manufacturerBrand}
                        onChange={(e) => setManufacturerBrand(e.target.value)}
                      >
                        <option value="">-- เลือกยี่ห้อ --</option>
                        {brands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col">
                      <label>หมายเลขประจำพัสดุจากโรงงาน (Serial Number)</label>
                      <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="เช่น S/N 4589714"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col">
                      <label>หมายเลขเครื่องยนต์ (ยานพาหนะ)</label>
                      <input
                        type="text"
                        value={engineNumber}
                        onChange={(e) => setEngineNumber(e.target.value)}
                        placeholder="เช่น 1GD-124578"
                      />
                    </div>
                    <div className="form-group col">
                      <label>หมายเลขตัวถัง / แคชชี (Chassis Number)</label>
                      <input
                        type="text"
                        value={chassisNumber}
                        onChange={(e) => setChassisNumber(e.target.value)}
                        placeholder="เช่น MR0GD12487"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col">
                      <label>ทะเบียนรถยนต์ / ตั๋วรูปพรรณสัตว์</label>
                      <input
                        type="text"
                        value={vehicleRegistration}
                        onChange={(e) => setVehicleRegistration(e.target.value)}
                        placeholder="เช่น กข-1234 นนทบุรี"
                      />
                    </div>
                    <div className="form-group col">
                      <label>สีพัสดุ</label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="เช่น สีดำ, สีบรอนซ์เงิน"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col">
                      <label>วันที่รับประกัน</label>
                      <input
                        type="date"
                        value={warrantyStartDate}
                        onChange={(e) => setWarrantyStartDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group col">
                      <label>วันที่สิ้นสุดการรับประกัน</label>
                      <input
                        type="date"
                        value={warrantyEndDate}
                        onChange={(e) => setWarrantyEndDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group col">
                      <label>บริษัทที่รับประกัน</label>
                      <select
                        value={warrantyCompany}
                        onChange={(e) => setWarrantyCompany(e.target.value)}
                      >
                        <option value="">-- เลือกบริษัทรับประกัน --</option>
                        {sellers.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: Calculated Financial status */}
          {activeTab === 'financial' && (
            <div className="tab-panel">
              <div className="info-alert">
                <strong>💡 การประเมินราคาและค่าเสื่อมราคาประจำปี:</strong> ค่าเสื่อมสะสมจะคิดคำนวณอัตโนมัติตามหลักบัญชีท้องถิ่น โดยถอดปี พ.ศ. ได้มาจากกลุ่มที่ 2 ของรหัสพัสดุ (เช่น 001-<strong>67</strong>-0001 = ได้มาระหว่างปี พ.ศ. 2567)
              </div>
              <div className="form-row bg-accent-row">
                <div className="form-group col">
                  <label>รหัสพัสดุหลัก</label>
                  <div className="read-only-box font-bold">{assetCode || 'ยังไม่ได้กำหนด'}</div>
                </div>
                <div className="form-group col">
                  <label>อัตราค่าเสื่อมราคาต่อปี</label>
                  <div className="read-only-box">{depreciationRate}% ต่อปี</div>
                </div>
              </div>
              <div className="form-row bg-accent-row">
                <div className="form-group col">
                  <label>ราคาทุนเริ่มต้นต่อหน่วย</label>
                  <div className="read-only-box">฿{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</div>
                </div>
                <div className="form-group col">
                  <label>ค่าเสื่อมราคาสะสม</label>
                  <div className="read-only-box highlight-depreciation">
                    -฿{accumulatedDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                  </div>
                </div>
                <div className="form-group col">
                  <label>มูลค่าคงเหลือสุทธิ (Book Value)</label>
                  <div className="read-only-box highlight-bookvalue">
                    ฿{bookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="form-actions-footer">
            <button className="btn-cancel" type="button" onClick={onClose}>ยกเลิก</button>
            <div className="nav-actions">
              {activeTab !== 'general' && (
                <button
                  className="btn-prev"
                  type="button"
                  onClick={() => {
                    if (activeTab === 'spec') setActiveTab('general');
                    if (activeTab === 'financial') setActiveTab('spec');
                  }}
                >
                  ย้อนกลับ
                </button>
              )}
              {activeTab !== 'financial' ? (
                <button
                  className="btn-next-tab button-primary"
                  type="button"
                  onClick={() => {
                    if (activeTab === 'general') setActiveTab('spec');
                    else if (activeTab === 'spec') setActiveTab('financial');
                  }}
                >
                  ถัดไป
                </button>
              ) : (
                <button className="btn-save button-primary" type="submit">
                  {isEdit ? 'บันทึกการเปลี่ยนแปลงทั้งหมด' : 'ลงทะเบียนจัดหาพัสดุสำเร็จ'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
