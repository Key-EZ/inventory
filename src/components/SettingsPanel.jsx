import { useState } from 'react';
import { csvToAssets } from '../utils/csvParser';

export default function SettingsPanel({
  assets,
  custodians,
  divisions,
  departments,
  positions = [],
  brands = [],
  locations = [],
  landingBadgeText,
  onSaveLandingBadge,
  landBuildingCategories = [],
  equipmentCategories = [],
  categoryDepreciationYears = {},
  onAddLandCategory,
  onEditLandCategory,
  onDeleteLandCategory,
  onAddEquipmentCategory,
  onEditEquipmentCategory,
  onDeleteEquipmentCategory,
  onAddCustodian,
  onEditCustodian,
  onDeleteCustodian,
  onAddDivision,
  onEditDivision,
  onDeleteDivision,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onAddPosition,
  onEditPosition,
  onDeletePosition,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  agencies = [],
  onAddAgency,
  onEditAgency,
  onDeleteAgency,
  sellers = [],
  onAddSeller,
  onEditSeller,
  onDeleteSeller,
  onImportAssets
}) {
  const [activeTab, setActiveTab] = useState('custodians'); // 'custodians', 'org', 'options'
  const [landingBadgeInput, setLandingBadgeInput] = useState(landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');
  const [newLandCatInput, setNewLandCatInput] = useState('');
  const [newLandCatYearsInput, setNewLandCatYearsInput] = useState('20');
  const [newEquipCatInput, setNewEquipCatInput] = useState('');
  const [newEquipCatYearsInput, setNewEquipCatYearsInput] = useState('5');
  const [newAgencyInput, setNewAgencyInput] = useState('');

  // Adjust input state when badge text prop changes during render
  const [prevLandingBadgeText, setPrevLandingBadgeText] = useState(landingBadgeText);
  if (landingBadgeText !== prevLandingBadgeText) {
    setPrevLandingBadgeText(landingBadgeText);
    setLandingBadgeInput(landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');
  }

  // Custodian Form Modal states
  const [isCustFormOpen, setIsCustFormOpen] = useState(false);
  const [editingCust, setEditingCust] = useState(null);

  const [custodianForm, setCustodianForm] = useState({
    name: '',
    position: '',
    division: '',
    department: '',
    email: ''
  });

  const handleCustodianFormChange = (e) => {
    const { name, value } = e.target;
    setCustodianForm(prev => ({ ...prev, [name]: value }));
  };

  // Inline inputs for divisions/departments/positions/brands/locations
  const [newDivisionInput, setNewDivisionInput] = useState('');
  const [newDepartmentInput, setNewDepartmentInput] = useState('');
  const [newPositionInput, setNewPositionInput] = useState('');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [newLocationInput, setNewLocationInput] = useState('');
  const [newSellerInput, setNewSellerInput] = useState('');

  // Import / Export State
  const [importMode, setImportMode] = useState('merge');
  const [previewData, setPreviewData] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(assets, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `inventory_assets_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    const isJson = file.name.endsWith('.json');
    const isCsv = file.name.endsWith('.csv');

    if (!isJson && !isCsv) {
      alert('กรุณาเลือกไฟล์ .json หรือ .csv เท่านั้น');
      return;
    }

    reader.onload = (e) => {
      const text = e.target.result;
      try {
        let assetsList = [];
        if (isJson) {
          assetsList = JSON.parse(text);
          if (!Array.isArray(assetsList)) {
            throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง (ต้องเป็นรายการอาร์เรย์ของทรัพย์สิน)');
          }
        } else if (isCsv) {
          assetsList = csvToAssets(text);
        }

        // Validate preview
        const rowErrors = [];
        const validatedList = assetsList.map((item, idx) => {
          const rowNum = idx + 1;
          const errors = [];
          if (!item.name) errors.push('ไม่มีชื่อพัสดุ');
          if (!item.asset_code) errors.push('ไม่มีรหัสพัสดุ');
          if (!item.category) errors.push('ไม่มีหมวดหมู่');
          if (!item.asset_type || (item.asset_type !== 'LAND_BUILDING' && item.asset_type !== 'EQUIPMENT')) {
            errors.push('ประเภทไม่ถูกต้อง (ต้องเป็น LAND_BUILDING หรือ EQUIPMENT)');
          }
          if (errors.length > 0) {
            rowErrors.push(`แถวที่ ${rowNum}: ${errors.join(', ')}`);
          }
          return {
            ...item,
            _rowNum: rowNum,
            _errors: errors
          };
        });

        setPreviewData(validatedList);
        setParseErrors(rowErrors);
        setImportResult(null);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = async () => {
    const validItems = previewData.filter(item => item._errors.length === 0);
    if (validItems.length === 0) {
      alert('ไม่มีข้อมูลที่ถูกต้องในการนำเข้า');
      return;
    }

    if (importMode === 'replace') {
      if (!window.confirm('คำเตือน: คุณเลือกการนำเข้าแบบเขียนทับทั้งหมด (Replace) ข้อมูลทรัพย์สินเดิมของคุณจะถูกลบและแทนที่ด้วยข้อมูลใหม่ ยืนยันการดำเนินการหรือไม่?')) {
        return;
      }
    }

    const cleanItems = validItems.map(item => {
      const copy = { ...item };
      delete copy._rowNum;
      delete copy._errors;
      return copy;
    });
    
    try {
      const result = await onImportAssets(cleanItems, importMode);
      setImportResult(result);
      setPreviewData([]);
      setParseErrors([]);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + err.message);
    }
  };

  const handleCancelImport = () => {
    setPreviewData([]);
    setParseErrors([]);
    setImportResult(null);
  };

  const [printConfig, setPrintConfig] = useState(() => ({
    agency: localStorage.getItem('print_rr_agency') || 'เทศบาลตำบลเสาธงหิน',
    docNo: localStorage.getItem('print_rr_docNo') || 'ทบ. ๕๑๐๐๘/',
    subject: localStorage.getItem('print_rr_subject') || 'ขออนุมัติซ่อมแซมครุภัณฑ์',
    requesterName: localStorage.getItem('print_rr_requesterName') || 'นายสมชาย ใจดี',
    requesterPosition: localStorage.getItem('print_rr_requesterPosition') || 'เจ้าหน้าที่พัสดุ',
    budgetAuditorName: localStorage.getItem('print_rr_budgetAuditorName') || 'นางสาวจงดี มีทรัพย์',
    budgetAuditorPosition: localStorage.getItem('print_rr_budgetAuditorPosition') || 'เจ้าหน้าที่การเงินและบัญชี',
    comm1Name: localStorage.getItem('print_rr_comm1Name') || 'นายสมบูรณ์ ดีพร้อม',
    comm1Position: localStorage.getItem('print_rr_comm1Position') || 'นายช่างโยธา',
    comm2Name: localStorage.getItem('print_rr_comm2Name') || 'นายรักชาติ ยิ่งชีพ',
    comm2Position: localStorage.getItem('print_rr_comm2Position') || 'เจ้าพนักงานธุรการ',
    comm3Name: localStorage.getItem('print_rr_comm3Name') || 'นายวิทยา เก่งกาจ',
    comm3Position: localStorage.getItem('print_rr_comm3Position') || 'เจ้าพนักงานพัสดุ',
    directorName: localStorage.getItem('print_rr_directorName') || 'นายวิเชียร ยอดแก้ว',
    directorPosition: localStorage.getItem('print_rr_directorPosition') || 'ผู้อำนวยการกองช่าง',
    clerkName: localStorage.getItem('print_rr_clerkName') || 'นายอดิศร วงศ์เจริญ',
    clerkPosition: localStorage.getItem('print_rr_clerkPosition') || 'ปลัดเทศบาลตำบลเสาธงหิน',
    mayorName: localStorage.getItem('print_rr_mayorName') || 'นายเกรียงไกร ไตรธรรม',
    mayorPosition: localStorage.getItem('print_rr_mayorPosition') || 'นายกเทศมนตรีตำบลเสาธงหิน',
    ledgerAgency: localStorage.getItem('print_ledger_agency') || 'เทศบาลตำบลเสาธงหิน',
    ledgerOffice: localStorage.getItem('print_ledger_office') || '',
    ledgerAmphoe: localStorage.getItem('print_ledger_amphoe') || 'บางใหญ่',
    ledgerProvince: localStorage.getItem('print_ledger_province') || 'นนทบุรี'
  }));

  const handlePrintConfigChange = (e) => {
    const { name, value } = e.target;
    setPrintConfig(prev => ({ ...prev, [name]: value }));
  };

  // --- Custodian Modal Controls ---
  const handleOpenAddCust = () => {
    setEditingCust(null);
    setCustodianForm({
      name: '',
      position: positions[0] || '',
      division: divisions[0] || '',
      department: departments[0] || '',
      email: ''
    });
    setIsCustFormOpen(true);
  };

  const handleOpenEditCust = (cust) => {
    setEditingCust(cust);
    setCustodianForm({
      name: cust.name || '',
      position: cust.position || positions[0] || '',
      division: cust.division || divisions[0] || '',
      department: cust.department || departments[0] || '',
      email: cust.email || ''
    });
    setIsCustFormOpen(true);
  };

  const handleCloseCustForm = () => {
    setIsCustFormOpen(false);
    setEditingCust(null);
  };

  const handleSaveRepairPrintSettings = (e) => {
    e.preventDefault();
    Object.entries(printConfig).forEach(([key, value]) => {
      if (['ledgerAgency', 'ledgerOffice', 'ledgerAmphoe', 'ledgerProvince'].includes(key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        localStorage.setItem(`print_${snakeKey}`, value);
      } else {
        localStorage.setItem(`print_rr_${key}`, value);
      }
    });
    alert('บันทึกการตั้งค่าข้อมูลการพิมพ์เรียบร้อยแล้ว');
  };

  const handleSubmitCust = (e) => {
    e.preventDefault();
    if (!custodianForm.name) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    const payload = {
      id: editingCust?.id || `cust-${Date.now()}`,
      ...custodianForm
    };

    if (editingCust) {
      onEditCustodian(payload);
    } else {
      onAddCustodian(payload);
    }
    handleCloseCustForm();
  };

  // --- Division & Department Handlers ---
  const handleAddDiv = (e) => {
    e.preventDefault();
    const val = newDivisionInput.trim();
    if (!val) return;
    if (divisions.includes(val)) {
      alert('มีชื่อกองนี้อยู่แล้วในระบบ');
      return;
    }
    onAddDivision(val);
    setNewDivisionInput('');
  };

  const handleAddDept = (e) => {
    e.preventDefault();
    const val = newDepartmentInput.trim();
    if (!val) return;
    if (departments.includes(val)) {
      alert('มีชื่อฝ่าย/แผนกนี้อยู่แล้วในระบบ');
      return;
    }
    onAddDepartment(val);
    setNewDepartmentInput('');
  };

  const handleEditDivPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อกอง/กองทุน:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (divisions.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อกองนี้อยู่แล้วในระบบ');
      return;
    }
    onEditDivision(oldVal, trimmed);
  };

  const handleEditDeptPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อฝ่าย/แผนก:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (departments.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อฝ่าย/แผนกนี้อยู่แล้วในระบบ');
      return;
    }
    onEditDepartment(oldVal, trimmed);
  };

  // Safe checks for deletion (if in use)
  const handleDeleteCustCheck = (cust) => {
    const inUse = assets.some(asset => asset.usage?.custodian === cust.name);
    if (inUse) {
      alert(`ไม่สามารถลบผู้รับผิดชอบ "${cust.name}" ได้ เนื่องจากมีครุภัณฑ์ลงทะเบียนไว้ในชื่อบุคคลนี้`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบผู้รับผิดชอบ "${cust.name}" ใช่หรือไม่?`)) {
      onDeleteCustodian(cust.id);
    }
  };

  const handleDeleteDivCheck = (divName) => {
    const inUse = custodians.some(cust => cust.division === divName);
    if (inUse) {
      alert(`ไม่สามารถลบกอง "${divName}" ได้ เนื่องจากมีบุคลากรในสังกัดกองนี้อยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบกอง "${divName}" ใช่หรือไม่?`)) {
      onDeleteDivision(divName);
    }
  };

  const handleDeleteDeptCheck = (deptName) => {
    const inUse = custodians.some(cust => cust.department === deptName);
    if (inUse) {
      alert(`ไม่สามารถลบฝ่าย/แผนก "${deptName}" ได้ เนื่องจากมีบุคลากรในสังกัดฝ่าย/แผนกนี้อยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบฝ่าย/แผนก "${deptName}" ใช่หรือไม่?`)) {
      onDeleteDepartment(deptName);
    }
  };

  // --- Dynamic Option CRUD Handlers ---
  const handleAddPos = (e) => {
    e.preventDefault();
    const val = newPositionInput.trim();
    if (!val) return;
    if (positions.includes(val)) {
      alert('มีชื่อตำแหน่งนี้อยู่แล้วในระบบ');
      return;
    }
    onAddPosition(val);
    setNewPositionInput('');
  };

  const handleAddBrnd = (e) => {
    e.preventDefault();
    const val = newBrandInput.trim();
    if (!val) return;
    if (brands.includes(val)) {
      alert('มีชื่อยี่ห้อนี้อยู่แล้วในระบบ');
      return;
    }
    onAddBrand(val);
    setNewBrandInput('');
  };

  const handleAddLoc = (e) => {
    e.preventDefault();
    const val = newLocationInput.trim();
    if (!val) return;
    if (locations.includes(val)) {
      alert('มีชื่อสถานที่ตั้งนี้อยู่แล้วในระบบ');
      return;
    }
    onAddLocation(val);
    setNewLocationInput('');
  };

  const handleEditPosPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อตำแหน่ง:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (positions.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อตำแหน่งนี้อยู่แล้วในระบบ');
      return;
    }
    onEditPosition(oldVal, trimmed);
  };

  const handleEditBrndPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อยี่ห้อ:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (brands.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อยี่ห้อนี้อยู่แล้วในระบบ');
      return;
    }
    onEditBrand(oldVal, trimmed);
  };

  const handleEditLocPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อสถานที่ตั้ง:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (locations.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อสถานที่ตั้งนี้อยู่แล้วในระบบ');
      return;
    }
    onEditLocation(oldVal, trimmed);
  };

  const handleDeletePositionCheck = (pos) => {
    const inUse = custodians.some(c => c.position === pos);
    if (inUse) {
      alert(`ไม่สามารถลบตำแหน่ง "${pos}" ได้ เนื่องจากมีบุคลากรใช้งานตำแหน่งนี้อยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบตำแหน่ง "${pos}" ใช่หรือไม่?`)) {
      onDeletePosition(pos);
    }
  };

  const handleDeleteBrandCheck = (brnd) => {
    const inUse = assets.some(a => a.general_info?.brand === brnd);
    if (inUse) {
      alert(`ไม่สามารถลบยี่ห้อ "${brnd}" ได้ เนื่องจากมีครุภัณฑ์ลงทะเบียนไว้ภายใต้ชื่อยี่ห้อนี้`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบยี่ห้อ "${brnd}" ใช่หรือไม่?`)) {
      onDeleteBrand(brnd);
    }
  };

  const handleDeleteLocCheck = (loc) => {
    const inUse = assets.some(a => a.location === loc);
    if (inUse) {
      alert(`ไม่สามารถลบสถานที่ตั้ง "${loc}" ได้ เนื่องจากมีครุภัณฑ์จัดตั้งอยู่ในสถานที่นี้`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบสถานที่ตั้ง "${loc}" ใช่หรือไม่?`)) {
      onDeleteLocation(loc);
    }
  };

  const handleAddSel = (e) => {
    e.preventDefault();
    const val = newSellerInput.trim();
    if (!val) return;
    if (sellers.includes(val)) {
      alert('มีชื่อผู้ขายนี้อยู่แล้วในระบบ');
      return;
    }
    onAddSeller(val);
    setNewSellerInput('');
  };

  const handleEditSelPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อผู้ขาย:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (sellers.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อผู้ขายนี้อยู่แล้วในระบบ');
      return;
    }
    onEditSeller(oldVal, trimmed);
  };

  const handleDeleteSelCheck = (seller) => {
    const inUse = assets.some(a => a.seller_name === seller);
    if (inUse) {
      alert(`ไม่สามารถลบผู้ขาย "${seller}" ได้ เนื่องจากมีครุภัณฑ์ลงทะเบียนจัดหาจากผู้ขายรายนี้`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบผู้ขาย "${seller}" ใช่หรือไม่?`)) {
      onDeleteSeller(seller);
    }
  };

  const handleAddAgency = (e) => {
    e.preventDefault();
    const val = newAgencyInput.trim();
    if (!val) return;
    if (agencies.includes(val)) {
      alert('มีชื่อส่วนราชการนี้อยู่แล้วในระบบ');
      return;
    }
    onAddAgency(val);
    setNewAgencyInput('');
  };

  const handleEditAgencyPrompt = (oldVal) => {
    const newVal = prompt('แก้ไขชื่อส่วนราชการ:', oldVal);
    if (newVal === null) return;
    const trimmed = newVal.trim();
    if (!trimmed) return;
    if (agencies.includes(trimmed) && trimmed !== oldVal) {
      alert('มีชื่อส่วนราชการนี้อยู่แล้วในระบบ');
      return;
    }
    onEditAgency(oldVal, trimmed);
  };

  const handleDeleteAgencyCheck = (agency) => {
    const inUse = assets.some(a =>
      a.budget_owner === agency ||
      (a.custodian_history && a.custodian_history.some(ch => ch.budget_owner === agency))
    );
    if (inUse) {
      alert(`ไม่สามารถลบชื่อส่วนราชการ "${agency}" ได้ เนื่องจากมีประวัติการดูแลหรือข้อมูลพัสดุใช้งานอยู่`);
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบชื่อส่วนราชการ "${agency}" ใช่หรือไม่?`)) {
      onDeleteAgency(agency);
    }
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="flex-center-between">
        <div>
          <h2>ตั้งค่าระบบครุภัณฑ์</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>จัดการข้อมูลผู้รับผิดชอบและหน่วยงาน กอง/ฝ่าย/แผนก ที่ใช้งานภายในระบบ</p>
        </div>
        {activeTab === 'custodians' && (
          <button className="button-primary" onClick={handleOpenAddCust}>
            ➕ เพิ่มผู้รับผิดชอบดูแล
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="form-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'custodians' ? 'active' : ''}`}
          onClick={() => setActiveTab('custodians')}
        >
          👤 ผู้รับผิดชอบดูแล ({custodians.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'org' ? 'active' : ''}`}
          onClick={() => setActiveTab('org')}
        >
          🏢 จัดการหน่วยงาน (กอง / ฝ่าย)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'options' ? 'active' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          ⚙️ จัดการตัวเลือก (ตำแหน่ง/ยี่ห้อ/สถานที่/ผู้ขาย)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'landing' ? 'active' : ''}`}
          onClick={() => setActiveTab('landing')}
        >
          🏷️ ป้ายชื่อหน้าแรก
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 หมวดหมู่ทรัพย์สิน
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'repair_print' ? 'active' : ''}`}
          onClick={() => setActiveTab('repair_print')}
        >
          🔧 ตั้งค่าการพิมพ์
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'data_management' ? 'active' : ''}`}
          onClick={() => setActiveTab('data_management')}
        >
          📂 นำเข้า/ส่งออกข้อมูล
        </button>
      </div>

      {/* Tab 1: Custodians list */}
      {activeTab === 'custodians' && (
        <div className="layout-card table-data-card animate-fade-in">
          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ตำแหน่ง</th>
                  <th>กอง (Division)</th>
                  <th>ฝ่าย/แผนก (Department)</th>
                  <th>e-mail (SSO Link)</th>
                  <th className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {custodians.length > 0 ? (
                  custodians.map(cust => (
                    <tr key={cust.id} className="table-row-hover">
                      <td>
                        <span className="cust-row-name">{cust.name}</span>
                      </td>
                      <td>{cust.position || '-'}</td>
                      <td>{cust.division || '-'}</td>
                      <td>{cust.department || '-'}</td>
                      <td><code style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>{cust.email || '-'}</code></td>
                      <td className="text-center">
                        <div className="table-actions">
                          <button className="btn-table-edit" onClick={() => handleOpenEditCust(cust)}>
                            ✏️ แก้ไข
                          </button>
                          <button className="btn-table-delete" onClick={() => handleDeleteCustCheck(cust)}>
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-empty-row">
                      ไม่มีข้อมูลผู้รับผิดชอบดูแล (กรุณากดปุ่มเพิ่มด้านขวาบน)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Division & Department Management */}
      {activeTab === 'org' && (
        <div className="settings-split-grid animate-fade-in">
          {/* Bureau/Division Column */}
          <div className="layout-card">
            <h3>🏢 รายการกอง / สำนัก</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ใช้เลือกเป็นสังกัดหลักของผู้ดูแลครุภัณฑ์
            </p>

            <form onSubmit={handleAddDiv} className="settings-inline-add-form">
              <input
                type="text"
                value={newDivisionInput}
                onChange={(e) => setNewDivisionInput(e.target.value)}
                placeholder="เช่น กองช่าง, สำนักปลัด"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {divisions.length > 0 ? (
                divisions.map(divName => (
                  <div key={divName} className="settings-list-row">
                    <span className="settings-item-name">{divName}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditDivPrompt(divName)}>
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteDivCheck(divName)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลกอง</div>
              )}
            </div>
          </div>

          {/* Section/Department Column */}
          <div className="layout-card">
            <h3>📂 รายการฝ่าย / แผนก</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ใช้เลือกเป็นฝ่ายปฏิบัติการย่อยของผู้ดูแลครุภัณฑ์
            </p>

            <form onSubmit={handleAddDept} className="settings-inline-add-form">
              <input
                type="text"
                value={newDepartmentInput}
                onChange={(e) => setNewDepartmentInput(e.target.value)}
                placeholder="เช่น ฝ่ายพัฒนาระบบ, ฝ่ายธุรการ"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {departments.length > 0 ? (
                departments.map(deptName => (
                  <div key={deptName} className="settings-list-row">
                    <span className="settings-item-name">{deptName}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditDeptPrompt(deptName)}>
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteDeptCheck(deptName)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลฝ่าย/แผนก</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Dropdown Options Management */}
      {activeTab === 'options' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--element-gap)' }}>
          {/* Position Column */}
          <div className="layout-card">
            <h3>👤 รายการตำแหน่ง</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกตำแหน่งในข้อมูลผู้ดูแลครุภัณฑ์
            </p>

            <form onSubmit={handleAddPos} className="settings-inline-add-form">
              <input
                type="text"
                value={newPositionInput}
                onChange={(e) => setNewPositionInput(e.target.value)}
                placeholder="เช่น ผู้อำนวยการกอง, นักวิชาการ"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {positions.length > 0 ? (
                positions.map(pos => (
                  <div key={pos} className="settings-list-row">
                    <span className="settings-item-name">{pos}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditPosPrompt(pos)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeletePositionCheck(pos)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลตำแหน่ง</div>
              )}
            </div>
          </div>

          {/* Brand Column */}
          <div className="layout-card">
            <h3>🏷️ รายการยี่ห้อ</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกยี่ห้อในข้อมูลครุภัณฑ์
            </p>

            <form onSubmit={handleAddBrnd} className="settings-inline-add-form">
              <input
                type="text"
                value={newBrandInput}
                onChange={(e) => setNewBrandInput(e.target.value)}
                placeholder="เช่น Apple, Lenovo, Sony"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {brands.length > 0 ? (
                brands.map(brnd => (
                  <div key={brnd} className="settings-list-row">
                    <span className="settings-item-name">{brnd}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditBrndPrompt(brnd)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteBrandCheck(brnd)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลยี่ห้อ</div>
              )}
            </div>
          </div>

          {/* Location Column */}
          <div className="layout-card">
            <h3>📍 รายการสถานที่ตั้ง</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกสถานที่จัดวางในระบบครุภัณฑ์
            </p>

            <form onSubmit={handleAddLoc} className="settings-inline-add-form">
              <input
                type="text"
                value={newLocationInput}
                onChange={(e) => setNewLocationInput(e.target.value)}
                placeholder="เช่น ห้องประชุม 2, อาคารพัสดุ"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {locations.length > 0 ? (
                locations.map(loc => (
                  <div key={loc} className="settings-list-row">
                    <span className="settings-item-name">{loc}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditLocPrompt(loc)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteLocCheck(loc)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลสถานที่ตั้ง</div>
              )}
            </div>
          </div>

          {/* Government Agency Column */}
          <div className="layout-card">
            <h3>🏛️ รายการส่วนราชการ</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกส่วนราชการในการกำหนดผู้ใช้-ดูแล
            </p>

            <form onSubmit={handleAddAgency} className="settings-inline-add-form">
              <input
                type="text"
                value={newAgencyInput}
                onChange={(e) => setNewAgencyInput(e.target.value)}
                placeholder="เช่น กองช่าง, กองการศึกษา"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {agencies.length > 0 ? (
                agencies.map(agency => (
                  <div key={agency} className="settings-list-row">
                    <span className="settings-item-name">{agency}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditAgencyPrompt(agency)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteAgencyCheck(agency)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลส่วนราชการ</div>
              )}
            </div>
          </div>

          {/* Seller Column */}
          <div className="layout-card">
            <h3>🤝 รายการผู้ขาย / คู่สัญญา</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              ตัวเลือกผู้ขายในการลงทะเบียนจัดหาพัสดุ
            </p>

            <form onSubmit={handleAddSel} className="settings-inline-add-form">
              <input
                type="text"
                value={newSellerInput}
                onChange={(e) => setNewSellerInput(e.target.value)}
                placeholder="เช่น บจก. เอสเอสพี, หจก. นนทบุรี"
                className="filter-input-element"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {sellers.length > 0 ? (
                sellers.map(seller => (
                  <div key={seller} className="settings-list-row">
                    <span className="settings-item-name">{seller}</span>
                    <div className="settings-item-actions">
                      <button className="btn-mini-action" onClick={() => handleEditSelPrompt(seller)} type="button">
                        ✏️
                      </button>
                      <button className="btn-mini-action btn-mini-delete" onClick={() => handleDeleteSelCheck(seller)} type="button">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลผู้ขาย</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Landing Badge Configuration */}
      {activeTab === 'landing' && (
        <div className="layout-card animate-fade-in" style={{ maxWidth: '600px' }}>
          <h3>🏷️ ตั้งค่าข้อความ</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            แก้ไขข้อความป้ายชื่อ (Badge) ที่แสดงอยู่ด้านบนสุดของหน้าแรก (Landing Page)
          </p>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ข้อความป้ายชื่อ *</label>
            <input
              type="text"
              value={landingBadgeInput}
              onChange={(e) => setLandingBadgeInput(e.target.value)}
              placeholder="เช่น ระบบดิจิทัลบริหารทรัพย์สิน"
              className="filter-input-element"
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <button
            onClick={() => {
              if (!landingBadgeInput.trim()) {
                alert('กรุณากรอกข้อความป้ายชื่อ');
                return;
              }
              onSaveLandingBadge(landingBadgeInput.trim());
              alert('บันทึกการตั้งค่าป้ายชื่อเรียบร้อยแล้ว');
            }}
            className="button-primary"
            style={{ padding: '10px 20px' }}
          >
            💾 บันทึกการตั้งค่า
          </button>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="settings-split-grid animate-fade-in">
          {/* Land Building Categories */}
          <div className="layout-card">
            <h3>📗 หมวดหมู่ พ.ด.1 (ที่ดิน/โรงเรือน)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              จัดการตัวเลือกหมวดหมู่ย่อยสำหรับที่ดินและสิ่งก่อสร้าง
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = newLandCatInput.trim();
                if (!val) return;
                if (landBuildingCategories.includes(val)) {
                  alert('มีหมวดหมู่นี้อยู่แล้วในระบบ');
                  return;
                }
                const yearsNum = parseInt(newLandCatYearsInput) || 0;
                onAddLandCategory(val, yearsNum);
                setNewLandCatInput('');
                setNewLandCatYearsInput('20');
              }}
              className="settings-inline-add-form"
              style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                value={newLandCatInput}
                onChange={(e) => setNewLandCatInput(e.target.value)}
                placeholder="ชื่อหมวดหมู่ เช่น อาคารโรงยิม"
                className="filter-input-element"
                style={{ flex: 2, minWidth: '200px' }}
              />
              <input
                type="number"
                value={newLandCatYearsInput}
                onChange={(e) => setNewLandCatYearsInput(e.target.value)}
                placeholder="อายุการใช้งาน (ปี)"
                className="filter-input-element"
                style={{ flex: 1, minWidth: '120px' }}
                min="0"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {landBuildingCategories.length > 0 ? (
                landBuildingCategories.map(cat => {
                  const years = categoryDepreciationYears && categoryDepreciationYears[cat] !== undefined ? categoryDepreciationYears[cat] : 20;
                  const rate = years > 0 ? (100 / years).toFixed(1) : 0;
                  return (
                    <div key={cat} className="settings-list-row">
                      <div className="settings-item-info" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="settings-item-name" style={{ fontWeight: 'bold' }}>{cat}</span>
                        <span className="settings-item-subtext" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          อายุการใช้งาน: {years} ปี (อัตราค่าเสื่อม {rate}% / ปี)
                        </span>
                      </div>
                      <div className="settings-item-actions">
                        <button
                          className="btn-mini-action"
                          onClick={() => {
                            const newVal = prompt('แก้ไขชื่อหมวดหมู่ พ.ด.1:', cat);
                            if (newVal === null) return;
                            const trimmed = newVal.trim();
                            if (!trimmed) return;
                            if (landBuildingCategories.includes(trimmed) && trimmed !== cat) {
                              alert('มีชื่อหมวดหมู่นี้อยู่แล้วในระบบ');
                              return;
                            }
                            
                            const newYearsStr = prompt(`แก้ไขอายุการใช้งาน (ปี) ของหมวดหมู่ "${trimmed}":`, years);
                            if (newYearsStr === null) return;
                            const newYears = parseInt(newYearsStr);
                            if (isNaN(newYears) || newYears < 0) {
                              alert('กรุณากรอกอายุการใช้งานเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
                              return;
                            }
                            
                            onEditLandCategory(cat, trimmed, newYears);
                          }}
                          type="button"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-mini-action btn-mini-delete"
                          onClick={() => {
                            const inUse = assets.some(a => a.category === cat && a.asset_type === 'LAND_BUILDING');
                            if (inUse) {
                              alert(`ไม่สามารถลบหมวดหมู่ "${cat}" ได้ เนื่องจากมีทรัพย์สินใช้งานอยู่`);
                              return;
                            }
                            if (window.confirm(`คุณแน่ใจว่าต้องการลบหมวดหมู่ "${cat}" ใช่หรือไม่?`)) {
                              onDeleteLandCategory(cat);
                            }
                          }}
                          type="button"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลหมวดหมู่</div>
              )}
            </div>
          </div>

          {/* Equipment Categories */}
          <div className="layout-card">
            <h3>📒 หมวดหมู่ พ.ด.2 (ครุภัณฑ์)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              จัดการตัวเลือกหมวดหมู่ย่อยสำหรับครุภัณฑ์และยานพาหนะ
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = newEquipCatInput.trim();
                if (!val) return;
                if (equipmentCategories.includes(val)) {
                  alert('มีหมวดหมู่นี้อยู่แล้วในระบบ');
                  return;
                }
                const yearsNum = parseInt(newEquipCatYearsInput) || 5;
                onAddEquipmentCategory(val, yearsNum);
                setNewEquipCatInput('');
                setNewEquipCatYearsInput('5');
              }}
              className="settings-inline-add-form"
              style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                value={newEquipCatInput}
                onChange={(e) => setNewEquipCatInput(e.target.value)}
                placeholder="ชื่อหมวดหมู่ เช่น ครุภัณฑ์งานสนาม"
                className="filter-input-element"
                style={{ flex: 2, minWidth: '200px' }}
              />
              <input
                type="number"
                value={newEquipCatYearsInput}
                onChange={(e) => setNewEquipCatYearsInput(e.target.value)}
                placeholder="อายุการใช้งาน (ปี)"
                className="filter-input-element"
                style={{ flex: 1, minWidth: '120px' }}
                min="0"
              />
              <button type="submit" className="button-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                เพิ่ม
              </button>
            </form>

            <div className="settings-inline-list">
              {equipmentCategories.length > 0 ? (
                equipmentCategories.map(cat => {
                  const years = categoryDepreciationYears && categoryDepreciationYears[cat] !== undefined ? categoryDepreciationYears[cat] : 5;
                  const rate = years > 0 ? (100 / years).toFixed(1) : 0;
                  return (
                    <div key={cat} className="settings-list-row">
                      <div className="settings-item-info" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="settings-item-name" style={{ fontWeight: 'bold' }}>{cat}</span>
                        <span className="settings-item-subtext" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          อายุการใช้งาน: {years} ปี (อัตราค่าเสื่อม {rate}% / ปี)
                        </span>
                      </div>
                      <div className="settings-item-actions">
                        <button
                          className="btn-mini-action"
                          onClick={() => {
                            const newVal = prompt('EDIT EQUIPMENT CATEGORY พ.ด.2:', cat);
                            if (newVal === null) return;
                            const trimmed = newVal.trim();
                            if (!trimmed) return;
                            if (equipmentCategories.includes(trimmed) && trimmed !== cat) {
                              alert('มีชื่อหมวดหมู่นี้อยู่แล้วในระบบ');
                              return;
                            }
                            
                            const newYearsStr = prompt(`แก้ไขอายุการใช้งาน (ปี) ของหมวดหมู่ "${trimmed}":`, years);
                            if (newYearsStr === null) return;
                            const newYears = parseInt(newYearsStr);
                            if (isNaN(newYears) || newYears < 0) {
                              alert('กรุณากรอกอายุการใช้งานเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
                              return;
                            }
                            
                            onEditEquipmentCategory(cat, trimmed, newYears);
                          }}
                          type="button"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-mini-action btn-mini-delete"
                          onClick={() => {
                            const inUse = assets.some(a => a.category === cat && a.asset_type === 'EQUIPMENT');
                            if (inUse) {
                              alert(`ไม่สามารถลบหมวดหมู่ "${cat}" ได้ เนื่องจากมีครุภัณฑ์ใช้งานอยู่`);
                              return;
                            }
                            if (window.confirm(`คุณแน่ใจว่าต้องการลบหมวดหมู่ "${cat}" ใช่หรือไม่?`)) {
                              onDeleteEquipmentCategory(cat);
                            }
                          }}
                          type="button"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="table-empty-row">ไม่มีข้อมูลหมวดหมู่</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'repair_print' && (
        <form onSubmit={handleSaveRepairPrintSettings} className="layout-card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>🔧 การตั้งค่าข้อมูลและการพิมพ์เอกสาร</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Group 0: Ledger print configuration */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>📋 ข้อมูลทะเบียนคุมพัสดุ (พ.ด.1/พ.ด.2)</h4>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>ส่วนราชการหลัก</label>
                <input type="text" name="ledgerAgency" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerAgency} onChange={handlePrintConfigChange} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>หน่วยงาน/สำนักงาน (เว้นว่างเพื่ออิงตามแผนกผู้ดูแล)</label>
                <input type="text" name="ledgerOffice" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerOffice} onChange={handlePrintConfigChange} placeholder="เช่น กองช่าง" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>อำเภอ</label>
                  <input type="text" name="ledgerAmphoe" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerAmphoe} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>จังหวัด</label>
                  <input type="text" name="ledgerProvince" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.ledgerProvince} onChange={handlePrintConfigChange} />
                </div>
              </div>
            </div>

            {/* Group 1: General document meta */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>📝 ข้อมูลเอกสารทั่วไป</h4>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>ชื่อส่วนราชการ</label>
                <input type="text" name="agency" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.agency} onChange={handlePrintConfigChange} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>เลขที่หนังสือเริ่มต้น</label>
                <input type="text" name="docNo" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.docNo} onChange={handlePrintConfigChange} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>เรื่อง</label>
                <input type="text" name="subject" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.subject} onChange={handlePrintConfigChange} />
              </div>
            </div>

            {/* Group 2: Requester & Budget Auditor */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>🧑‍💼 ผู้เสนอเรื่อง & ตรวจงบประมาณ</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>ชื่อผู้เสนอ/แจ้งซ่อม</label>
                  <input type="text" name="requesterName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.requesterName} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="requesterPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.requesterPosition} onChange={handlePrintConfigChange} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div className="form-group">
                  <label>ชื่อผู้ตรวจงบประมาณ</label>
                  <input type="text" name="budgetAuditorName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.budgetAuditorName} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="budgetAuditorPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.budgetAuditorPosition} onChange={handlePrintConfigChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Group 3: Inspection Committee */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>📋 คณะกรรมการตรวจสภาพครุภัณฑ์ (3 ท่าน)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 1 (ประธานกรรมการ)</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" name="comm1Name" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm1Name} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="comm1Position" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm1Position} onChange={handlePrintConfigChange} />
                </div>
              </div>
              
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 2 (กรรมการ)</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" name="comm2Name" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm2Name} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="comm2Position" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm2Position} onChange={handlePrintConfigChange} />
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คนที่ 3 (กรรมการ)</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" name="comm3Name" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm3Name} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="comm3Position" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.comm3Position} onChange={handlePrintConfigChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Group 4: Executives Signatories */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>🏢 รายชื่อคณะผู้บริหารระดับสูง</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ผู้อำนวยการกอง</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" name="directorName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.directorName} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="directorPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.directorPosition} onChange={handlePrintConfigChange} />
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ปลัดเทศบาล</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" name="clerkName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.clerkName} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="clerkPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.clerkPosition} onChange={handlePrintConfigChange} />
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>นายกเทศมนตรี</strong>
                <div className="form-group" style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <label>ชื่อ-นามสกุล</label>
                  <input type="text" name="mayorName" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.mayorName} onChange={handlePrintConfigChange} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง</label>
                  <input type="text" name="mayorPosition" className="filter-input-element" style={{ width: '100%', padding: '8px' }} value={printConfig.mayorPosition} onChange={handlePrintConfigChange} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="submit" className="button-primary" style={{ padding: '10px 24px' }}>
              💾 บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      )}

      {activeTab === 'data_management' && (
        <div className="layout-card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
            📂 จัดการและสำรองข้อมูลครุภัณฑ์
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Export Card */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '12px', fontSize: '1.1rem' }}>
                  📥 ส่งออกข้อมูล (Backup)
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  ส่งออกข้อมูลทะเบียนครุภัณฑ์และสิ่งก่อสร้างทั้งหมดในระบบเป็นไฟล์ JSON (.json) เพื่อใช้เป็นข้อมูลสำรอง หรือนำไปย้ายเข้าสู่ระบบในเครื่องคอมพิวเตอร์อื่น
                </p>
              </div>
              <button 
                type="button" 
                onClick={handleExportJSON}
                className="button-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                💾 ส่งออกข้อมูลพัสดุทั้งหมด (JSON)
              </button>
            </div>

            {/* Import Config Card */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>
                ⚙️ การตั้งค่าสำหรับการนำเข้า
              </h4>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>รูปแบบการนำเข้าข้อมูล (Import Mode)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="merge" 
                      checked={importMode === 'merge'} 
                      onChange={() => setImportMode('merge')} 
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong>นำเข้าแบบอัปเดตและเพิ่มใหม่ (Merge)</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                        หากตรวจพบรหัสพัสดุ (asset_code) ตรงกัน ระบบจะอัปเดตข้อมูลพัสดุแถวนั้นด้วยข้อมูลใหม่ หากยังไม่มีจะทำการเพิ่มรายการใหม่เข้าไป
                      </div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '4px' }}>
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="replace" 
                      checked={importMode === 'replace'} 
                      onChange={() => setImportMode('replace')} 
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ color: 'var(--status-damaged-text)' }}>นำเข้าแบบเขียนทับทั้งหมด (Replace)</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                        ล้างฐานข้อมูลครุภัณฑ์เดิมทั้งหมดในเครื่อง และใช้รายการพัสดุจากไฟล์ที่อัปโหลดเข้าแทนที่ (แนะนำให้ส่งออกข้อมูลเก็บไว้ก่อนทำการสำรองด้วยวิธีนี้)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Import Dropzone / File Picker */}
          {!previewData.length && !importResult && (
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('import-file-input').click()}
              style={{
                border: dragActive ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
                backgroundColor: dragActive ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '20px'
              }}
            >
              <input 
                id="import-file-input"
                type="file" 
                accept=".json,.csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📂</div>
              <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '6px' }}>
                ลากและวางไฟล์สำรอง (.json) หรือ ไฟล์ตาราง (.csv) ที่นี่
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '12px' }}>
                รองรับไฟล์ข้อมูลรูปแบบ JSON หรือไฟล์ CSV ที่มีส่วนหัวตามที่กำหนดในระบบ
              </span>
              <button type="button" className="button-secondary" style={{ pointerEvents: 'none' }}>
                เลือกไฟล์จากเครื่องคอมพิวเตอร์
              </button>
            </div>
          )}

          {/* Import Result Feedback */}
          {importResult && (
            <div style={{ 
              backgroundColor: importResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: importResult.success ? '1px solid var(--status-active-text)' : '1px solid var(--status-damaged-text)',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: importResult.success ? 'var(--status-active-text)' : 'var(--status-damaged-text)'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>
                {importResult.success ? '✅ นำเข้าข้อมูลสำเร็จเรียบร้อย!' : '❌ การนำเข้าข้อมูลล้มเหลว'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                {importResult.success && `ระบบได้ดำเนินการประมวลผลข้อมูลในไฟล์แล้ว โดยมีรายละเอียดดังนี้: เพิ่มข้อมูลครุภัณฑ์ใหม่ ${importResult.added} รายการ, อัปเดตข้อมูลพัสดุเดิม ${importResult.updated} รายการ`}
                {!importResult.success && importResult.errors && importResult.errors.join(', ')}
              </p>
              {importResult.errors && importResult.errors.length > 0 && (
                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px' }}>
                  <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>คำเตือน / ข้อผิดพลาดบางรายการ ({importResult.errors.length}):</strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button 
                type="button" 
                className="button-secondary" 
                onClick={() => setImportResult(null)} 
                style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.8rem' }}
              >
                ตกลง
              </button>
            </div>
          )}

          {/* Validation Errors Panel */}
          {parseErrors.length > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--status-pending-text)',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: 'var(--status-pending-text)'
            }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem' }}>
                ⚠️ พบข้อผิดพลาดหรือข้อมูลที่ไม่สมบูรณ์ ({parseErrors.length} แถว)
              </h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem' }}>
                แถวเหล่านี้มีคุณสมบัติที่จำเป็นไม่ถูกต้องหรือไม่ครบถ้วน (เช่น ไม่มีรหัสพัสดุ ไม่มีชื่อ หรือไม่มีหมวดหมู่) และจะไม่ถูกนำเข้าระบบ
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.75rem', maxHeight: '120px', overflowY: 'auto' }}>
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="animate-fade-in" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>
                  👀 พรีวิวข้อมูลก่อนนำเข้า ({previewData.filter(item => item._errors.length === 0).length} / {previewData.length} รายการที่สมบูรณ์)
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-cancel" onClick={handleCancelImport} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    ยกเลิก
                  </button>
                  <button 
                    type="button" 
                    className="button-primary" 
                    onClick={handleConfirmImport} 
                    disabled={previewData.filter(item => item._errors.length === 0).length === 0}
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  >
                    🚀 ยืนยันนำเข้าข้อมูล
                  </button>
                </div>
              </div>

              <div className="settings-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>แถว</th>
                      <th style={{ width: '15%' }}>รหัสพัสดุ</th>
                      <th style={{ width: '30%' }}>รายการพัสดุ / ชื่อ</th>
                      <th style={{ width: '15%' }}>ประเภท/หมวดหมู่</th>
                      <th style={{ width: '15%' }}>หน่วยงานดูแล/สถานที่</th>
                      <th style={{ width: '17%' }}>ตรวจสอบความถูกต้อง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => {
                      const hasError = item._errors.length > 0;
                      return (
                        <tr key={index} style={{ backgroundColor: hasError ? 'rgba(239, 68, 68, 0.05)' : 'inherit' }}>
                          <td>{item._rowNum}</td>
                          <td style={{ fontWeight: '600' }}>{item.asset_code || '-'}</td>
                          <td>
                            <div>{item.name || <em style={{ color: 'red' }}>(ไม่มีชื่อ)</em>}</div>
                            {item.manufacturer_brand && (
                              <small style={{ color: 'var(--text-muted)' }}>ยี่ห้อ: {item.manufacturer_brand}</small>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginRight: '4px' }}>
                              {item.asset_type === 'LAND_BUILDING' ? 'ที่ดิน/อาคาร' : 'ครุภัณฑ์'}
                            </span>
                            <small>{item.category || '-'}</small>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem' }}>{item.responsible_department || '-'}</div>
                            <small style={{ color: 'var(--text-muted)' }}>📍 {item.location || '-'}</small>
                          </td>
                          <td>
                            {hasError ? (
                              <span style={{ color: 'var(--status-damaged-text)', fontWeight: '600', fontSize: '0.75rem' }}>
                                ❌ ไม่สมบูรณ์: {item._errors.join(', ')}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--status-active-text)', fontWeight: '600', fontSize: '0.75rem' }}>
                                 สมบูรณ์พร้อมนำเข้า
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custodian Add/Edit Modal */}
      {isCustFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header-section">
              <h2>{editingCust ? 'แก้ไขข้อมูลผู้รับผิดชอบดูแล' : 'เพิ่มผู้รับผิดชอบดูแล'}</h2>
              <button className="close-btn" onClick={handleCloseCustForm}>&times;</button>
            </div>

            <form onSubmit={handleSubmitCust} className="asset-form-body">
              <div className="form-group">
                <label>ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  name="name"
                  value={custodianForm.name}
                  onChange={handleCustodianFormChange}
                  placeholder="เช่น นายสมเกียรติ ใจซื่อ"
                  required
                />
              </div>

              <div className="form-group">
                <label>ตำแหน่ง *</label>
                {positions.length > 0 ? (
                  <select
                    name="position"
                    value={custodianForm.position}
                    onChange={handleCustodianFormChange}
                    required
                  >
                    <option value="">-- เลือกตำแหน่ง --</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                ) : (
                  <div className="read-only-box" style={{ color: 'var(--status-pending-text)' }}>
                    ⚠️ กรุณาไปเพิ่มตำแหน่งในหน้าการตั้งค่าก่อน
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>กอง / สำนัก *</label>
                  {divisions.length > 0 ? (
                    <select
                      name="division"
                      value={custodianForm.division}
                      onChange={handleCustodianFormChange}
                      required
                    >
                      {divisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="read-only-box" style={{ color: 'var(--status-pending-text)' }}>
                      ⚠️ กรุณาไปเพิ่มกองในเมนูการตั้งค่าก่อน
                    </div>
                  )}
                </div>

                <div className="form-group col">
                  <label>ฝ่าย / แผนก *</label>
                  {departments.length > 0 ? (
                    <select
                      name="department"
                      value={custodianForm.department}
                      onChange={handleCustodianFormChange}
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="read-only-box" style={{ color: 'var(--status-pending-text)' }}>
                      ⚠️ กรุณาไปเพิ่มฝ่ายในเมนูการตั้งค่าก่อน
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>e-mail (สำหรับเชื่อมโยงการ Login SSO ในอนาคต)</label>
                <input
                  type="email"
                  name="email"
                  value={custodianForm.email}
                  onChange={handleCustodianFormChange}
                  placeholder="เช่น somkiat.j@office.go.th"
                />
                <span className="field-hint">ระบบจะใช้ email ในการยืนยันสิทธิ์ Admin/Staff/User ผ่าน SSO</span>
              </div>

              <div className="form-actions-footer">
                <button className="btn-cancel" type="button" onClick={handleCloseCustForm}>ยกเลิก</button>
                <button
                  className="button-primary"
                  type="submit"
                  disabled={divisions.length === 0 || departments.length === 0}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
