import useAssetForm from '../hooks/useAssetForm';

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
      <form onSubmit={handleSubmit} className="modal-content-card-wide">
        <div className="modal-header-section">
          <h2>{isEdit ? 'แก้ไขข้อมูลพัสดุ พ.ด.1/2' : 'ลงทะเบียนจัดหาพัสดุใหม่'}</h2>
          <button className="close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        <div className="form-split-body">
          {/* LEFT COLUMN: Identification & Specifications */}
          <div className="form-body-left">
            <div className="form-row">
              <div className="form-group col">
                <label>ประเภททะเบียนหลัก *</label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={(e) => handleAssetTypeChange(e.target.value)}
                  required
                >
                  <option value="EQUIPMENT">ครุภัณฑ์ (พ.ด.2)</option>
                  <option value="LAND_BUILDING">ที่ดินและสิ่งก่อสร้าง (พ.ด.1)</option>
                </select>
              </div>
              <div className="form-group col">
                <label>หมวดหมู่พัสดุ *</label>
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
            </div>

            <div className="form-row">
              <div className="form-group col">
                <label>รหัสพัสดุ *</label>
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
              <div className="form-group col">
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
            </div>

            {/* แบบ, ชนิด, ลักษณะ */}
            <div className="form-row">
              <div className="form-group col">
                <label>แบบ (Model)</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="เช่น Inspiron 15, Camry 2.4G"
                />
              </div>
              <div className="form-group col">
                <label>ชนิด (Type)</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="เช่น Laser, SUV, โต๊ะทำงาน"
                />
              </div>
              <div className="form-group col">
                <label>ลักษณะ (Appearance)</label>
                <input
                  type="text"
                  name="appearance"
                  value={formData.appearance}
                  onChange={handleChange}
                  placeholder="เช่น สีดำลายไม้, ตึกคอนกรีต"
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            {formData.assetType === 'LAND_BUILDING' ? (
              <>
                <div className="form-group">
                  <label>ชนิดและเลขที่เอกสารสิทธิ์ (โฉนด/น.ส.3/ส.ค.1)</label>
                  <input
                    type="text"
                    name="documentOfTitle"
                    value={formData.documentOfTitle}
                    onChange={handleChange}
                    placeholder="เช่น โฉนดที่ดินเลขที่ 12456"
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
                    <label>ลักษณะโรงเรือน (ตึก/ไม้/จำนวนชั้น)</label>
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
                    <label>หมายเลขตัวถัง / แคชชี</label>
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
              </>
            )}
          </div>

          {/* RIGHT COLUMN: Location, Finance, Procurement & Photo */}
          <div className="form-body-right">
            <div className="form-row">
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
                <label>ที่ตั้งพัสดุ</label>
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
                <label>ส่วนราชการดูแลพัสดุ</label>
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
                <label>แหล่งงบประมาณ</label>
                <select
                  name="budgetOwner"
                  value={formData.budgetOwner}
                  onChange={handleChange}
                >
                  <option value="">-- เลือกส่วนราชการ --</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col">
                <label>ลักษณะการได้กรรมสิทธิ์ *</label>
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
              <div className="form-group col">
                <label>ผู้ขาย / คู่สัญญา</label>
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
                <label>เลขที่ใบส่งของ/สัญญา</label>
                <input
                  type="text"
                  name="deliveryDocumentNo"
                  value={formData.deliveryDocumentNo}
                  onChange={handleChange}
                  placeholder="เช่น PO-670315"
                />
              </div>
              <div className="form-group col">
                <label>วันเดือนปีในเอกสาร</label>
                <input
                  type="date"
                  name="deliveryDocumentDate"
                  value={formData.deliveryDocumentDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col">
                <label>ราคาทุนเริ่มต้นต่อหน่วย (บาท) *</label>
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
            </div>

            {/* Warranty Details for EQUIPMENT */}
            {formData.assetType === 'EQUIPMENT' && (
              <div className="form-row">
                <div className="form-group col">
                  <label>วันเริ่มรับประกัน</label>
                  <input
                    type="date"
                    name="warrantyStartDate"
                    value={formData.warrantyStartDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group col">
                  <label>วันสิ้นสุดรับประกัน</label>
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
                    <option value="">-- เลือกบริษัท --</option>
                    {sellers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Photo Upload and Preview */}
            <div className="form-group">
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

            {/* Compact Depreciation Summary Box */}
            <div className="depreciation-summary-box">
              <div className="depreciation-summary-title">💡 การประเมินราคาและค่าเสื่อมราคาสะสม</div>
              <div className="depreciation-summary-grid">
                <div className="depreciation-summary-item">
                  <span className="depreciation-summary-label">อัตราค่าเสื่อม</span>
                  <span className="depreciation-summary-value">{depreciationRate}% / ปี</span>
                </div>
                <div className="depreciation-summary-item">
                  <span className="depreciation-summary-label">ค่าเสื่อมสะสม</span>
                  <span className="depreciation-summary-value highlight-depreciation">
                    -฿{accumulatedDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="depreciation-summary-item">
                  <span className="depreciation-summary-label">มูลค่าคงเหลือสุทธิ</span>
                  <span className="depreciation-summary-value highlight-bookvalue">
                    ฿{bookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="form-actions-footer-wide">
          <button className="btn-cancel" type="button" onClick={onClose}>ยกเลิก</button>
          <button className="btn-save button-primary" type="submit">
            {isEdit ? 'บันทึกการเปลี่ยนแปลงทั้งหมด' : 'ลงทะเบียนจัดหาพัสดุสำเร็จ'}
          </button>
        </div>
      </form>
    </div>
  );
}
