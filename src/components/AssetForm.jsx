/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { calculateDepreciation } from '../utils/depreciation';
import { defaultDepartments } from '../utils/mockData';

export default function AssetForm({ asset, brands = [], locations = [], onSubmit, onClose }) {
  const isEdit = !!asset;

  // Tabs: 'general', 'spec', 'financial', 'maintenances'
  const [activeTab, setActiveTab] = useState('general');

  // Form states (Flat fields)
  const [assetType, setAssetType] = useState('EQUIPMENT'); // 'LAND_BUILDING', 'EQUIPMENT'
  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [acquisitionMethod, setAcquisitionMethod] = useState('ซื้อ');
  const [approvalDocument, setApprovalDocument] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [budgetOwner, setBudgetOwner] = useState('');
  const [responsibleDepartment, setResponsibleDepartment] = useState('');

  // พ.ด. 1 fields
  const [documentOfTitle, setDocumentOfTitle] = useState('');
  const [areaSize, setAreaSize] = useState('');
  const [buildingStyle, setBuildingStyle] = useState('');

  // พ.ด. 2 fields
  const [manufacturerBrand, setManufacturerBrand] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [color, setColor] = useState('');
  const [warrantyDetail, setWarrantyDetail] = useState('');

  // Status & calculated depreciation
  const [status, setStatus] = useState('ใช้งาน');
  const [depreciationRate, setDepreciationRate] = useState(10);
  const [accumulatedDepreciation, setAccumulatedDepreciation] = useState(0);
  const [bookValue, setBookValue] = useState(0);

  // Maintenances CRUD states
  const [maintenances, setMaintenances] = useState([]);
  
  // New maintenance entry fields
  const [maintApprovalNoDate, setMaintApprovalNoDate] = useState('');
  const [maintDescription, setMaintDescription] = useState('');
  const [maintCost, setMaintCost] = useState(0);
  const [maintContractor, setMaintContractor] = useState('');
  const [editingMaintId, setEditingMaintId] = useState(null);

  // Initialize form
  useEffect(() => {
    if (asset) {
      setAssetType(asset.asset_type || 'EQUIPMENT');
      setAssetCode(asset.asset_code || '');
      setName(asset.name || '');
      setLocation(asset.location || '');
      setAcquisitionMethod(asset.acquisition_method || 'ซื้อ');
      setApprovalDocument(asset.approval_document || '');
      setUnitPrice(asset.unit_price || 0);
      setBudgetOwner(asset.budget_owner || '');
      setResponsibleDepartment(asset.responsible_department || '');

      setDocumentOfTitle(asset.document_of_title || '');
      setAreaSize(asset.area_size || '');
      setBuildingStyle(asset.building_style || '');

      setManufacturerBrand(asset.manufacturer_brand || '');
      setSerialNumber(asset.serial_number || '');
      setEngineNumber(asset.engine_number || '');
      setChassisNumber(asset.chassis_number || '');
      setVehicleRegistration(asset.vehicle_registration || '');
      setColor(asset.color || '');
      setWarrantyDetail(asset.warranty_detail || '');

      setStatus(asset.status || 'ใช้งาน');
      setMaintenances(asset.maintenances || []);
    } else {
      // Clear/Reset for new asset
      setAssetType('EQUIPMENT');
      setAssetCode('');
      setName('');
      setLocation('');
      setAcquisitionMethod('ซื้อ');
      setApprovalDocument('');
      setUnitPrice(0);
      setBudgetOwner('');
      setResponsibleDepartment('');
      setDocumentOfTitle('');
      setAreaSize('');
      setBuildingStyle('');
      setManufacturerBrand('');
      setSerialNumber('');
      setEngineNumber('');
      setChassisNumber('');
      setVehicleRegistration('');
      setColor('');
      setWarrantyDetail('');
      setStatus('ใช้งาน');
      setMaintenances([]);
    }
  }, [asset]);

  // Recalculate depreciation live when price or code changes
  useEffect(() => {
    const calc = calculateDepreciation(assetCode, unitPrice);
    setDepreciationRate(calc.depreciationRatePercent);
    setAccumulatedDepreciation(calc.accumulatedDepreciation);
    setBookValue(calc.bookValue);
  }, [assetCode, unitPrice]);

  // --- Maintenance Log Operations ---
  const handleAddOrEditMaintenance = () => {
    if (!maintApprovalNoDate || !maintDescription || maintCost <= 0) {
      alert('กรุณากรอก เลขที่อนุมัติ, รายการซ่อมแซม และจำนวนเงินค่าซ่อมที่ถูกต้อง');
      return;
    }

    if (editingMaintId) {
      // Edit
      setMaintenances(maintenances.map(m => m.id === editingMaintId ? {
        id: editingMaintId,
        approval_no_date: maintApprovalNoDate,
        description: maintDescription,
        cost: parseFloat(maintCost) || 0,
        contractor: maintContractor
      } : m));
      setEditingMaintId(null);
    } else {
      // Add new
      const newMaint = {
        id: `maint-${Date.now()}`,
        approval_no_date: maintApprovalNoDate,
        description: maintDescription,
        cost: parseFloat(maintCost) || 0,
        contractor: maintContractor
      };
      setMaintenances([...maintenances, newMaint]);
    }

    // Reset entry inputs
    setMaintApprovalNoDate('');
    setMaintDescription('');
    setMaintCost(0);
    setMaintContractor('');
  };

  const handleEditMaintClick = (maint) => {
    setEditingMaintId(maint.id);
    setMaintApprovalNoDate(maint.approval_no_date);
    setMaintDescription(maint.description);
    setMaintCost(maint.cost);
    setMaintContractor(maint.contractor || '');
  };

  const handleDeleteMaintClick = (id) => {
    if (window.confirm('คุณต้องการลบรายการประวัติการซ่อมบำรุงนี้ใช่หรือไม่?')) {
      setMaintenances(maintenances.filter(m => m.id !== id));
      if (editingMaintId === id) {
        setEditingMaintId(null);
        setMaintApprovalNoDate('');
        setMaintDescription('');
        setMaintCost(0);
        setMaintContractor('');
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !assetCode) {
      alert('กรุณากรอก ชื่อพัสดุ และ รหัสพัสดุ');
      return;
    }

    // Basic regex check for 3-part code format
    const codeFormat = /^\d{3}-\d{2}-\d{4}$/;
    if (!codeFormat.test(assetCode)) {
      if (!window.confirm('คำเตือน: รหัสพัสดุไม่ได้อยู่ในรูปแบบแนะนำ (เช่น 001-10-0001) คุณต้องการใช้รหัสนี้ต่อหรือไม่?')) {
        return;
      }
    }

    const payload = {
      id: asset?.id || `asset-${Date.now()}`,
      asset_type: assetType,
      asset_code: assetCode,
      name,
      location,
      acquisition_method: acquisitionMethod,
      approval_document: approvalDocument,
      unit_price: parseFloat(unitPrice) || 0,
      budget_owner: budgetOwner,
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
      warranty_detail: assetType === 'EQUIPMENT' ? warrantyDetail : '',

      // Calculated stats
      depreciation_rate_percent: depreciationRate,
      accumulated_depreciation: accumulatedDepreciation,
      book_value: bookValue,

      // Maintenances sub-table list
      maintenances: maintenances
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

        {/* Form Tab Navigator */}
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
          <button
            type="button"
            className={`tab-btn ${activeTab === 'maintenances' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenances')}
          >
            4. ประวัติซ่อมบำรุง ({maintenances.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="asset-form-body">
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="tab-panel">
              <div className="form-row">
                <div className="form-group col">
                  <label>ประเภททะเบียนทะเบียนหลัก *</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    required
                  >
                    <option value="EQUIPMENT">ทะเบียนครุภัณฑ์ ปศุสัตว์ สัตว์พาหนะ (พ.ด.2)</option>
                    <option value="LAND_BUILDING">ทะเบียนที่ดินและสิ่งก่อสร้าง (พ.ด.1)</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>รหัสพัสดุ (แนะนำ: 3กลุ่ม 9หลัก เช่น 001-10-0001) *</label>
                  <input
                    type="text"
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="รหัสตามบัญชี พ.ด.5 หรือ พ.ด.6"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-2">
                  <label>ชื่อพัสดุ/ทรัพย์สิน *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น โครงการก่อสร้างถนนคอนกรีต, รถยนต์เอนกประสงค์, กล้องวงจรปิด"
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>สถานะ</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ใช้งาน">ใช้งาน</option>
                    <option value="ชำรุด">ชำรุด</option>
                    <option value="รอจำหน่าย">รอจำหน่าย</option>
                    <option value="จำหน่ายแล้ว">จำหน่ายแล้ว</option>
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
                  <label>ที่ตั้งพัสดุ / แหล่งเก็บใบส่งของ *</label>
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
                  <label>ส่วนราชการที่รับดูแลรับผิดชอบ *</label>
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
                  <label>เจ้าของงบประมาณ</label>
                  <input
                    type="text"
                    value={budgetOwner}
                    onChange={(e) => setBudgetOwner(e.target.value)}
                    placeholder="เช่น งบประมาณประจำปี, เทศบาลจังหวัด"
                  />
                </div>
                <div className="form-group col">
                  <label>เลขที่/วันเดือนปี หนังสืออนุมัติ *</label>
                  <input
                    type="text"
                    value={approvalDocument}
                    onChange={(e) => setApprovalDocument(e.target.value)}
                    placeholder="เช่น PO-67123 ลงวันที่ 10 ธ.ค. 2567"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Specific Fields */}
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

                  <div className="form-group">
                    <label>ข้อมูลรับประกัน (วันสิ้นสุดการรับประกัน / บริษัทผู้ดูแล)</label>
                    <input
                      type="text"
                      value={warrantyDetail}
                      onChange={(e) => setWarrantyDetail(e.target.value)}
                      placeholder="เช่น หมดประกันวันที่ 12 มี.ค. 2570 โดย บมจ. เดลล์"
                    />
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

          {/* TAB 4: Maintenance history Log */}
          {activeTab === 'maintenances' && (
            <div className="tab-panel">
              <div className="info-alert">
                <strong>🛠️ ประวัติการซ่อมแซมและบำรุงรักษา (แบบ พ.ด.1/2 หน้า 2):</strong> บันทึกประวัติการบำรุงรักษา อะไหล่ หรือการซ่อมแซมปรับปรุงของทรัพย์สินชิ้นนี้
              </div>

              {/* Add/Edit Sub-Form */}
              <div className="maint-entry-box">
                <h4>{editingMaintId ? '✏️ แก้ไขรายการซ่อมแซม' : '➕ เพิ่มประวัติการซ่อมบำรุง'}</h4>
                <div className="maint-form-grid">
                  <div className="form-group">
                    <label>เลขที่/วันเดือนปีอนุมัติซ่อม *</label>
                    <input
                      type="text"
                      value={maintApprovalNoDate}
                      onChange={(e) => setMaintApprovalNoDate(e.target.value)}
                      placeholder="เช่น อนุมัติเลขที่ 45/67 ลงวันที่ 5 พ.ค. 67"
                    />
                  </div>
                  <div className="form-group">
                    <label>รายการซ่อมแซม/เปลี่ยนอะไหล่ *</label>
                    <input
                      type="text"
                      value={maintDescription}
                      onChange={(e) => setMaintDescription(e.target.value)}
                      placeholder="เช่น ซ่อมคอมบิวเตอร์ เปลี่ยนหน้าจอแสดงผล"
                    />
                  </div>
                  <div className="form-group">
                    <label>จำนวนเงินค่าซ่อม (บาท) *</label>
                    <input
                      type="number"
                      min="0"
                      value={maintCost}
                      onChange={(e) => setMaintCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>บริษัท/ชื่อผู้รับจ้าง</label>
                    <input
                      type="text"
                      value={maintContractor}
                      onChange={(e) => setMaintContractor(e.target.value)}
                      placeholder="เช่น บริษัท อาร์ตไอที จำกัด"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="button-primary maint-add-btn"
                  onClick={handleAddOrEditMaintenance}
                >
                  {editingMaintId ? 'บันทึกการแก้ไข' : 'บันทึกรายการเพิ่ม'}
                </button>
                {editingMaintId && (
                  <button
                    type="button"
                    className="button-secondary maint-cancel-btn"
                    onClick={() => {
                      setEditingMaintId(null);
                      setMaintApprovalNoDate('');
                      setMaintDescription('');
                      setMaintCost(0);
                      setMaintContractor('');
                    }}
                  >
                    ยกเลิกแก้ไข
                  </button>
                )}
              </div>

              {/* Maintenance List Table */}
              <div className="maint-table-container">
                <table className="maint-log-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>ครั้งที่</th>
                      <th style={{ width: '25%' }}>หนังสืออนุมัติ</th>
                      <th style={{ width: '30%' }}>รายการซ่อมแซม</th>
                      <th style={{ width: '15%' }} className="text-right">จำนวนเงิน (บาท)</th>
                      <th style={{ width: '17%' }}>ผู้รับจ้าง</th>
                      <th style={{ width: '10%' }} className="text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenances.length > 0 ? (
                      maintenances.map((maint, idx) => (
                        <tr key={maint.id}>
                          <td className="text-center">{idx + 1}</td>
                          <td>{maint.approval_no_date}</td>
                          <td>{maint.description}</td>
                          <td className="text-right">{(maint.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>{maint.contractor || '-'}</td>
                          <td className="text-center">
                            <div className="maint-row-actions">
                              <span
                                className="action-maint-edit"
                                onClick={() => handleEditMaintClick(maint)}
                                title="แก้ไขรายการ"
                              >
                                ✏️
                              </span>
                              <span
                                className="action-maint-delete"
                                onClick={() => handleDeleteMaintClick(maint.id)}
                                title="ลบรายการ"
                              >
                                🗑️
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-8 font-italic">ยังไม่มีรายการประวัติการซ่อมบำรุงทรัพย์สินนี้</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                    if (activeTab === 'maintenances') setActiveTab('financial');
                  }}
                >
                  ย้อนกลับ
                </button>
              )}
              {activeTab !== 'maintenances' ? (
                <button
                  className="btn-next-tab button-primary"
                  type="button"
                  onClick={() => {
                    if (activeTab === 'general') setActiveTab('spec');
                    else if (activeTab === 'spec') setActiveTab('financial');
                    else if (activeTab === 'financial') setActiveTab('maintenances');
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
