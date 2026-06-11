import React, { useState, useEffect } from 'react';
import { calculateDepreciation } from '../utils/depreciation';

export default function AssetForm({ asset, onSubmit, onClose }) {
  const isEdit = !!asset;

  // Tab states: 'general', 'source', 'usage', 'financial'
  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [assetName, setAssetName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');

  const [acquisitionDate, setAcquisitionDate] = useState('2026-06-11');
  const [procurementMethod, setProcurementMethod] = useState('วิธีเฉพาะเจาะจง');
  const [costPrice, setCostPrice] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState('');

  const [assetId, setAssetId] = useState('');
  const [location, setLocation] = useState('');
  const [custodian, setCustodian] = useState('');
  const [status, setStatus] = useState('ใช้งาน');

  const [depreciationRate, setDepreciationRate] = useState(20);
  const [accumulatedDepreciation, setAccumulatedDepreciation] = useState(0);
  const [bookValue, setBookValue] = useState(0);

  // Initialize form if editing
  useEffect(() => {
    if (asset) {
      setAssetName(asset.general_info?.asset_name || '');
      setBrand(asset.general_info?.brand || '');
      setModel(asset.general_info?.model || '');
      setDescription(asset.general_info?.description || '');

      setAcquisitionDate(asset.source_and_value?.acquisition_date || '2026-06-11');
      setProcurementMethod(asset.source_and_value?.procurement_method || 'วิธีเฉพาะเจาะจง');
      setCostPrice(asset.source_and_value?.cost_price || 0);
      setReceiptNumber(asset.source_and_value?.receipt_number || '');

      setAssetId(asset.usage?.asset_id || '');
      setLocation(asset.usage?.location || '');
      setCustodian(asset.usage?.custodian || '');
      setStatus(asset.usage?.status || 'ใช้งาน');

      setDepreciationRate(asset.financial_status?.depreciation_rate_percent || 20);
    } else {
      // Clear/Reset for new asset
      setAssetName('');
      setBrand('');
      setModel('');
      setDescription('');
      setAcquisitionDate('2026-06-11');
      setProcurementMethod('วิธีเฉพาะเจาะจง');
      setCostPrice(0);
      setReceiptNumber('');
      setAssetId('');
      setLocation('');
      setCustodian('');
      setStatus('ใช้งาน');
      setDepreciationRate(20);
    }
  }, [asset]);

  // Recalculate depreciation live when price, date, or rate changes
  useEffect(() => {
    const calc = calculateDepreciation(acquisitionDate, costPrice, depreciationRate);
    setAccumulatedDepreciation(calc.accumulatedDepreciation);
    setBookValue(calc.bookValue);
  }, [acquisitionDate, costPrice, depreciationRate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assetName || !assetId) {
      alert('กรุณากรอก ชื่อทรัพย์สิน และ รหัสครุภัณฑ์');
      return;
    }

    const payload = {
      id: asset?.id || `asset-${Date.now()}`,
      general_info: {
        asset_name: assetName,
        brand,
        model,
        description
      },
      source_and_value: {
        acquisition_date: acquisitionDate,
        procurement_method: procurementMethod,
        cost_price: parseFloat(costPrice) || 0,
        receipt_number: receiptNumber
      },
      usage: {
        asset_id: assetId,
        location,
        custodian,
        status
      },
      financial_status: {
        depreciation_rate_percent: parseFloat(depreciationRate) || 0,
        accumulated_depreciation: accumulatedDepreciation,
        book_value: bookValue
      }
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content-card">
        <div className="modal-header-section">
          <h2>{isEdit ? 'แก้ไขข้อมูลครุภัณฑ์' : 'เพิ่มครุภัณฑ์ใหม่'}</h2>
          <button className="close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        {/* Tab Navigation */}
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
            className={`tab-btn ${activeTab === 'source' ? 'active' : ''}`}
            onClick={() => setActiveTab('source')}
          >
            2. ที่มาและมูลค่า
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            3. การใช้งาน/ผู้ดูแล
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            4. สถานะทางการเงิน (ค่าเสื่อม)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="asset-form-body">
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="tab-panel">
              <div className="form-group">
                <label>ชื่อทรัพย์สิน *</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="เช่น เครื่องคอมพิวเตอร์พกพา, เครื่องปรับอากาศ"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>ยี่ห้อ</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="เช่น Dell, HP, Daikin"
                  />
                </div>
                <div className="form-group col">
                  <label>รุ่น</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="เช่น Latitude 5440"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>ลักษณะ/คุณสมบัติ</label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดรายละเอียดเพิ่มเติมของครุภัณฑ์ เช่น ขนาด, สี, สเปกเครื่อง"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Source & Value */}
          {activeTab === 'source' && (
            <div className="tab-panel">
              <div className="form-row">
                <div className="form-group col">
                  <label>วันที่ได้มา *</label>
                  <input
                    type="date"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>เลขที่ใบเสร็จ / ใบสั่งซื้อ</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="เช่น REC-69001"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>วิธีการจัดซื้อ</label>
                  <select
                    value={procurementMethod}
                    onChange={(e) => setProcurementMethod(e.target.value)}
                  >
                    <option value="วิธีเฉพาะเจาะจง">วิธีเฉพาะเจาะจง</option>
                    <option value="ประกวดราคาอิเล็กทรอนิกส์ (e-bidding)">ประกวดราคาอิเล็กทรอนิกส์ (e-bidding)</option>
                    <option value="วิธีคัดเลือก">วิธีคัดเลือก</option>
                    <option value="รับบริจาค / มอบให้">รับบริจาค / มอบให้</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>ราคาทุน (บาท) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Usage & Custodian */}
          {activeTab === 'usage' && (
            <div className="tab-panel">
              <div className="form-row">
                <div className="form-group col">
                  <label>รหัสครุภัณฑ์ *</label>
                  <input
                    type="text"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    placeholder="เช่น 416/69/001"
                    required
                  />
                </div>
                <div className="form-group col">
                  <label>สถานะการใช้งาน</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ใช้งาน">ใช้งาน (Active)</option>
                    <option value="ชำรุด">ชำรุด (Damaged)</option>
                    <option value="รอจำหน่าย">รอจำหน่าย (Pending Disposal)</option>
                    <option value="จำหน่ายแล้ว">จำหน่ายแล้ว (Disposed)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>สถานที่ตั้ง</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น ห้องกายภาพบำบัด ชั้น 2"
                  />
                </div>
                <div className="form-group col">
                  <label>ผู้รับผิดชอบดูแล</label>
                  <input
                    type="text"
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจดี"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Financial Status */}
          {activeTab === 'financial' && (
            <div className="tab-panel">
              <div className="info-alert">
                <strong>💡 ระบบคำนวณอัตโนมัติ:</strong> ค่าเสื่อมสะสมและมูลค่าสุทธิจะคำนวณตามวิธีเส้นตรง (Straight-Line) โดยเปรียบเทียบจากวันที่ได้มากับเวลาปัจจุบัน และรักษามูลค่าขั้นต่ำไว้ที่ 1 บาท
              </div>
              <div className="form-group">
                <label>อัตราค่าเสื่อมราคาต่อปี (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={depreciationRate}
                  onChange={(e) => setDepreciationRate(parseFloat(e.target.value) || 0)}
                />
                <span className="field-hint">ปกติ ครุภัณฑ์สำนักงาน = 20%, อาคาร = 5%, ยานพาหนะ = 20%</span>
              </div>
              <div className="form-row bg-accent-row">
                <div className="form-group col">
                  <label>ราคาทุนเริ่มต้น</label>
                  <div className="read-only-box">{costPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</div>
                </div>
                <div className="form-group col">
                  <label>ค่าเสื่อมราคาสะสม (สะสมถึงวันนี้)</label>
                  <div className="read-only-box highlight-depreciation">
                    -{accumulatedDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                  </div>
                </div>
                <div className="form-group col">
                  <label>มูลค่าสุทธิปัจจุบัน (Book Value)</label>
                  <div className="read-only-box highlight-bookvalue">
                    {bookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions-footer">
            <button className="btn-cancel" type="button" onClick={onClose}>ยกเลิก</button>
            <div className="nav-actions">
              {activeTab !== 'general' && (
                <button
                  className="btn-prev"
                  type="button"
                  onClick={() => {
                    if (activeTab === 'source') setActiveTab('general');
                    if (activeTab === 'usage') setActiveTab('source');
                    if (activeTab === 'financial') setActiveTab('usage');
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
                    if (activeTab === 'general') setActiveTab('source');
                    else if (activeTab === 'source') setActiveTab('usage');
                    else if (activeTab === 'usage') setActiveTab('financial');
                  }}
                >
                  ถัดไป
                </button>
              ) : (
                <button className="btn-save button-primary" type="submit">
                  {isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'ลงทะเบียนครุภัณฑ์'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
