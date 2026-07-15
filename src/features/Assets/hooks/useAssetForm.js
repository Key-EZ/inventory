import { useState } from 'react';
import { calculateDepreciation } from '../../../utils/depreciation';

const generateNewAssetId = () => `asset-${Date.now()}`;

const formatAssetCode = (value) => {
  const clean = value.replace(/\D/g, '');
  const truncated = clean.slice(0, 9);
  if (truncated.length > 5) {
    return `${truncated.slice(0, 3)}/${truncated.slice(3, 5)}/${truncated.slice(5)}`;
  } else if (truncated.length > 3) {
    return `${truncated.slice(0, 3)}/${truncated.slice(3)}`;
  }
  return truncated;
};

export default function useAssetForm({
  asset,
  equipmentCategories = [],
  landBuildingCategories = [],
  sellers = [],
  categoryDepreciationYears = {},
  onSubmit
}) {
  const isEdit = !!asset;
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    assetType: asset ? asset.asset_type || 'EQUIPMENT' : 'EQUIPMENT',
    category: asset ? asset.category || '' : (equipmentCategories[0] || ''),
    assetCode: asset ? asset.asset_code || '' : '',
    name: asset ? asset.name || '' : '',
    location: asset ? asset.location || '' : '',
    acquisitionMethod: asset ? asset.acquisition_method || 'ซื้อ' : 'ซื้อ',
    deliveryDocumentNo: asset ? asset.delivery_document_no || '' : '',
    deliveryDocumentDate: asset ? asset.delivery_document_date || '' : '',
    sellerName: asset ? asset.seller_name || '' : (sellers[0] || ''),
    unitPrice: asset ? asset.unit_price || 0 : 0,
    budgetOwner: asset ? asset.budget_owner || '' : '',
    responsibleDepartment: asset ? asset.responsible_department || '' : '',
    status: asset ? asset.status || 'ใช้งาน' : 'ใช้งาน',
    model: asset ? asset.model || '' : '',
    type: asset ? asset.type || '' : '',
    appearance: asset ? asset.appearance || '' : '',
    
    // LAND_BUILDING specific (Ph.D. 1)
    documentOfTitle: asset ? asset.document_of_title || '' : '',
    areaSize: asset ? asset.area_size || '' : '',
    buildingStyle: asset ? asset.building_style || '' : '',

    // EQUIPMENT specific (Ph.D. 2)
    manufacturerBrand: asset ? asset.manufacturer_brand || '' : '',
    serialNumber: asset ? asset.serial_number || '' : '',
    engineNumber: asset ? asset.engine_number || '' : '',
    chassisNumber: asset ? asset.chassis_number || '' : '',
    vehicleRegistration: asset ? asset.vehicle_registration || '' : '',
    color: asset ? asset.color || '' : '',
    warrantyStartDate: asset ? asset.warranty_start_date || '' : '',
    warrantyEndDate: asset ? asset.warranty_end_date || '' : '',
    warrantyCompany: asset ? asset.warranty_company || '' : '',
    photo: asset ? asset.photo || '' : '',
  });

  const maintenances = asset ? asset.maintenances || [] : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'unitPrice') {
      finalValue = parseFloat(value) || 0;
    } else if (name === 'assetCode') {
      finalValue = formatAssetCode(value);
    }
    
    // Clear the validation error when value is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleAssetTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      assetType: newType,
      category: newType === 'LAND_BUILDING' ? (landBuildingCategories[0] || '') : (equipmentCategories[0] || '')
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 100 * 1024; // 100 KB
    if (file.size > maxSize) {
      alert(`ขนาดไฟล์ภาพต้องไม่เกิน 100 KB (ขนาดไฟล์ปัจจุบัน: ${(file.size / 1024).toFixed(1)} KB)`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        photo: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: ''
    }));
  };

  // Dynamic calculations
  const calc = calculateDepreciation(formData.assetCode, formData.unitPrice, formData.category, categoryDepreciationYears);
  const depreciationRate = calc.depreciationRatePercent;
  const accumulatedDepreciation = calc.accumulatedDepreciation;
  const bookValue = calc.bookValue;

  const validate = () => {
    const tempErrors = {};
    if (!formData.name) tempErrors.name = 'กรุณากรอกชื่อพัสดุ';
    if (!formData.assetCode) tempErrors.assetCode = 'กรุณากรอกรหัสพัสดุ';
    if (!formData.category) tempErrors.category = 'กรุณาเลือกหมวดหมู่พัสดุ';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('general'); // Switch back to general where validation errors are visible
      return;
    }

    // Basic regex check for 3-part or 4-part code format (e.g. 026/62/0002 or 026/62/0002/1)
    const codeFormat = /^\d{3}\/\d{2}\/\d{3,4}(\/\d+)?$/;
    if (!codeFormat.test(formData.assetCode)) {
      if (!window.confirm('คำเตือน: รหัสพัสดุไม่ได้อยู่ในรูปแบบแนะนำ (เช่น 001/10/0001 หรือ 026/62/0002/1) คุณต้องการใช้รหัสนี้ต่อหรือไม่?')) {
        return;
      }
    }

    const custodianHistory = asset?.custodian_history || [];
    const payload = {
      id: asset?.id || generateNewAssetId(),
      asset_type: formData.assetType,
      category: formData.category,
      asset_code: formData.assetCode,
      name: formData.name,
      location: formData.location,
      acquisition_method: formData.acquisitionMethod,
      delivery_document_no: formData.deliveryDocumentNo,
      delivery_document_date: formData.deliveryDocumentDate,
      seller_name: formData.sellerName,
      unit_price: parseFloat(formData.unitPrice) || 0,
      budget_owner: formData.budgetOwner,
      responsible_department: formData.responsibleDepartment,
      status: formData.status,
      model: formData.model,
      type: formData.type,
      appearance: formData.appearance,

      // Ph.D. 1 specific fields
      document_of_title: formData.assetType === 'LAND_BUILDING' ? formData.documentOfTitle : '',
      area_size: formData.assetType === 'LAND_BUILDING' ? formData.areaSize : '',
      building_style: formData.assetType === 'LAND_BUILDING' ? formData.buildingStyle : '',

      // Ph.D. 2 specific fields
      manufacturer_brand: formData.assetType === 'EQUIPMENT' ? formData.manufacturerBrand : '',
      serial_number: formData.assetType === 'EQUIPMENT' ? formData.serialNumber : '',
      engine_number: formData.assetType === 'EQUIPMENT' ? formData.engineNumber : '',
      chassis_number: formData.assetType === 'EQUIPMENT' ? formData.chassisNumber : '',
      vehicle_registration: formData.assetType === 'EQUIPMENT' ? formData.vehicleRegistration : '',
      color: formData.assetType === 'EQUIPMENT' ? formData.color : '',
      warranty_start_date: formData.assetType === 'EQUIPMENT' ? formData.warrantyStartDate : '',
      warranty_end_date: formData.assetType === 'EQUIPMENT' ? formData.warrantyEndDate : '',
      warranty_company: formData.assetType === 'EQUIPMENT' ? formData.warrantyCompany : '',

      depreciation_rate_percent: depreciationRate,
      accumulated_depreciation: accumulatedDepreciation,
      book_value: bookValue,
      maintenances: maintenances,
      custodian_history: custodianHistory,
      photo: formData.photo
    };

    onSubmit(payload);
  };

  return {
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
  };
}
