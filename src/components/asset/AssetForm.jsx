import useAssetForm from '../../hooks/useAssetForm';

export default function AssetForm({
  asset,
  brands = [],
  locations = [],
  landBuildingCategories = [],
  equipmentCategories = [],
  categoryDepreciationYears = {},
  departments = [],
  onSubmit,
  onClose,
  sellers = []
}) {
  const {
    isEdit,
    activeTab,
    setActiveTab,
    formData,
    errors,
    depreciationRate,
    accumulatedDepreciation,
    bookValue,
    handleChange,
    handleAssetTypeChange,
    handlePhotoChange,
    handleRemovePhoto,
    handleSubmit
  } = useAssetForm({
    asset,
    equipmentCategories,
    landBuildingCategories,
    sellers,
    categoryDepreciationYears,
    onSubmit,
    onClose
  });

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
            2. รายละเอียดเฉพาะ ({formData.assetType === 'LAND_BUILDING' ? 'พ.ด.1' : 'พ.ด.2'})
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
                    name="assetType"
                    value={formData.assetType}
                    onChange={(e) => handleAssetTypeChange(e.target.value)}
                    required
                  >
                    <option value="EQUIPMENT">ครุภัณฑ์</option>
                    <option value="LAND_BUILDING">ที่ดินและสิ่งก่อสร้าง</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>
                    หมวดหมู่พัสดุ *
                    <span className="tooltip-trigger" data-tooltip="เลือกหมวดหมู่ย่อยของทรัพย์สินเพื่อใช้จัดกลุ่มและแสดงในรายงาน พ.ด.3">?</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? 'input-error' : ''}
                    required
                  >
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {(formData.assetType === 'LAND_BUILDING' ? landBuildingCategories : equipmentCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <span className="error-text">{errors.category}</span>}
                </div>
                <div className="form-group col">
                  <label>
                    รหัสพัสดุ *
                    <span className="tooltip-trigger" data-tooltip="รูปแบบแนะนำ: XXX/YY/ZZZZ (รหัสประเภท/ปี พ.ศ. จัดหา/ลำดับ)">?</span>
                  </label>
                  <input
                    type="text"
                    name="assetCode"
                    value={formData.assetCode}
                    onChange={handleChange}
                    placeholder="000/00/0000"
                    className={errors.assetCode ? 'input-error' : ''}
                    required
                  />
                  {errors.assetCode && <span className="error-text">{errors.assetCode}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-2">
                  <label>ชื่อพัสดุ *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="เช่น รถยนต์เอนกประสงค์, กล้องวงจรปิด"
                    className={errors.name ? 'input-error' : ''}
                    required
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group col">
                  <label>สถานะ</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
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
                    name="acquisitionMethod"
                    value={formData.acquisitionMethod}
                    onChange={handleChange}
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
                  <label>
                    ราคาต่อหน่วย (บาท) *
                    <span className="tooltip-trigger" data-tooltip="ราคาทุนรวมต่อหน่วยสำหรับใช้คำนวณหักค่าเสื่อมราคาประจำปี">?</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>
                    ที่ตั้งพัสดุ
                    <span className="tooltip-trigger" data-tooltip="สถานที่ตั้งของครุภัณฑ์หรือทรัพย์สินสำหรับการตรวจสอบพัสดุประจำปี">?</span>
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={errors.location ? 'input-error' : ''}
                  >
                    <option value="">-- เลือกสถานที่ตั้ง --</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  {errors.location && <span className="error-text">{errors.location}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>ส่วนราชการเจ้าของพัสดุ</label>
                  <select
                    name="responsibleDepartment"
                    value={formData.responsibleDepartment}
                    onChange={handleChange}
                    className={errors.responsibleDepartment ? 'input-error' : ''}
                  >
                    <option value="">-- เลือกส่วนราชการ --</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.responsibleDepartment && <span className="error-text">{errors.responsibleDepartment}</span>}
                </div>
                <div className="form-group col">
                  <label>
                    แหล่งงบประมาณ
                    <span className="tooltip-trigger" data-tooltip="แหล่งที่มาของงบประมาณที่ใช้จัดหา เช่น งบประจำปี งบอุดหนุนเฉพาะกิจ เงินสะสม">?</span>
                  </label>
                  <input
                    type="text"
                    name="budgetOwner"
                    value={formData.budgetOwner}
                    onChange={handleChange}
                    placeholder="เช่น งบประจำปี, เงินสะสม"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>
                    เลขที่ใบส่งของ/สัญญา
                    <span className="tooltip-trigger" data-tooltip="เลขที่ที่ปรากฏในใบส่งของ ใบสั่งซื้อ (PO) หรือสัญญาจัดซื้อจัดจ้าง">?</span>
                  </label>
                  <input
                    type="text"
                    name="deliveryDocumentNo"
                    value={formData.deliveryDocumentNo}
                    onChange={handleChange}
                    placeholder="เช่น เลขที่ใบส่งของ หรือ PO"
                    className={errors.deliveryDocumentNo ? 'input-error' : ''}
                  />
                  {errors.deliveryDocumentNo && <span className="error-text">{errors.deliveryDocumentNo}</span>}
                </div>
                <div className="form-group col">
                  <label>
                    วันเดือนปีในเอกสาร
                    <span className="tooltip-trigger" data-tooltip="วันเดือนปีที่ลงในใบส่งมอบหรือหนังสืออนุมัติ/สัญญาจัดหา">?</span>
                  </label>
                  <input
                    type="date"
                    name="deliveryDocumentDate"
                    value={formData.deliveryDocumentDate}
                    onChange={handleChange}
                    className={errors.deliveryDocumentDate ? 'input-error' : ''}
                  />
                  {errors.deliveryDocumentDate && <span className="error-text">{errors.deliveryDocumentDate}</span>}
                </div>
                <div className="form-group col">
                  <label>
                    ผู้ขาย / คู่สัญญา
                    <span className="tooltip-trigger" data-tooltip="ชื่อบริษัท ห้างหุ้นส่วนจำกัด หรือร้านค้าคู่สัญญาที่จัดหาพัสดุนี้">?</span>
                  </label>
                  <select
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    className={errors.sellerName ? 'input-error' : ''}
                  >
                    <option value="">-- เลือกผู้ขาย --</option>
                    {sellers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.sellerName && <span className="error-text">{errors.sellerName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>รูปถ่ายพัสดุ (ไม่เกิน 100 KB)</label>
                  <div className="photo-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="photo-file-input"
                    />
                    {formData.photo && (
                      <div className="photo-preview-container">
                        <img src={formData.photo} alt="Preview" className="photo-preview-img" />
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={handleRemovePhoto}
                        >
                          ลบรูปภาพ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Specific Fields */}
          {activeTab === 'spec' && (
            <div className="tab-panel">
              {formData.assetType === 'LAND_BUILDING' ? (
                <>
                  <div className="info-alert info-green">
                    <strong>📗 ทะเบียนพัสดุ พ.ด.1 (ที่ดินและสิ่งก่อสร้าง):</strong> กรอกข้อมูลกรรมสิทธิ์เอกสารสิทธิ์ ที่ดิน และลักษณะโครงสร้างสิ่งก่อสร้าง
                  </div>
                  <div className="form-group">
                    <label>ชนิดและเลขที่เอกสารสิทธิ์ (โฉนด/น.ส.3/ส.ค.1)</label>
                    <input
                      type="text"
                      name="documentOfTitle"
                      value={formData.documentOfTitle}
                      onChange={handleChange}
                      placeholder="เช่น โฉนดที่ดินเลขที่ 45879 เล่ม 458"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label>จำนวนเนื้อที่</label>
                      <input
                        type="text"
                        name="areaSize"
                        value={formData.areaSize}
                        onChange={handleChange}
                        placeholder="เช่น 10 ไร่ 2 งาน 50 ตารางวา"
                      />
                    </div>
                    <div className="form-group col">
                      <label>ลักษณะโรงเรือน (ตึก/ไม้/ครึ่งตึกครึ่งไม้, จำนวนชั้น)</label>
                      <input
                        type="text"
                        name="buildingStyle"
                        value={formData.buildingStyle}
                        onChange={handleChange}
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
                        name="manufacturerBrand"
                        value={formData.manufacturerBrand}
                        onChange={handleChange}
                      >
                        <option value="">-- เลือกยี่ห้อ --</option>
                        {brands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col">
                      <label>Serial Number</label>
                      <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        placeholder="เช่น S/N 4589714"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col">
                      <label>หมายเลขเครื่องยนต์ (ยานพาหนะ)</label>
                      <input
                        type="text"
                        name="engineNumber"
                        value={formData.engineNumber}
                        onChange={handleChange}
                        placeholder="เช่น 1GD-124578"
                      />
                    </div>
                    <div className="form-group col">
                      <label>หมายเลขตัวถัง / แคชชี (Chassis Number)</label>
                      <input
                        type="text"
                        name="chassisNumber"
                        value={formData.chassisNumber}
                        onChange={handleChange}
                        placeholder="เช่น MR0GD12487"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col">
                      <label>ทะเบียนรถยนต์ / ตั๋วรูปพรรณสัตว์</label>
                      <input
                        type="text"
                        name="vehicleRegistration"
                        value={formData.vehicleRegistration}
                        onChange={handleChange}
                        placeholder="เช่น กข-1234 นนทบุรี"
                      />
                    </div>
                    <div className="form-group col">
                      <label>สีพัสดุ</label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="เช่น สีดำ, สีบรอนซ์เงิน"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col">
                      <label>วันที่รับประกัน</label>
                      <input
                        type="date"
                        name="warrantyStartDate"
                        value={formData.warrantyStartDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group col">
                      <label>วันที่สิ้นสุดการรับประกัน</label>
                      <input
                        type="date"
                        name="warrantyEndDate"
                        value={formData.warrantyEndDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group col">
                      <label>บริษัทที่รับประกัน</label>
                      <select
                        name="warrantyCompany"
                        value={formData.warrantyCompany}
                        onChange={handleChange}
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
                  <div className="read-only-box font-bold">{formData.assetCode || 'ยังไม่ได้กำหนด'}</div>
                </div>
                <div className="form-group col">
                  <label>อัตราค่าเสื่อมราคาต่อปี</label>
                  <div className="read-only-box">{depreciationRate}% ต่อปี</div>
                </div>
              </div>
              <div className="form-row bg-accent-row">
                <div className="form-group col">
                  <label>ราคาทุนเริ่มต้นต่อหน่วย</label>
                  <div className="read-only-box">฿{formData.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</div>
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
