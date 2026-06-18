/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useState, useEffect } from 'react';
import BaseLayout from './components/BaseLayout';
import AssetForm from './components/asset/AssetForm';
import AssetTable from './components/asset/AssetTable';
import BentoDashboard from './components/BentoDashboard';
import CenteredLanding from './components/CenteredLanding';
import SettingsPanel from './components/SettingsPanel';
import ReportPanel from './components/report/ReportPanel';
import InventoryPrint from './components/report/InventoryPrint';
import GetRepair from './components/repair/GetRepair';
import RepairJobs from './components/repair/RepairJobs';
import { getSeedAssets, defaultDivisions, defaultDepartments, defaultCustodians, defaultPositions, defaultBrands, defaultLocations, defaultLandBuildingCategories, defaultEquipmentCategories, defaultAgencies } from './utils/mockData';

const SEED_DATE_1 = '2026-06-17T08:30:00.000Z';
const SEED_DATE_2 = '2026-06-16T14:15:00.000Z';

export default function App() {
  // --- States ---
  const [assets, setAssets] = useState([]);
  const [activeLayout, setActiveLayout] = useState('centered'); // 'sidebar', 'bento', 'centered'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [printingAsset, setPrintingAsset] = useState(null);
  const [searchQueryFromLanding, setSearchQueryFromLanding] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- Settings States ---
  const [custodians, setCustodians] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [landingBadgeText, setLandingBadgeText] = useState('ระบบดิจิทัลบริหารทรัพย์สิน');
  const [landBuildingCategories, setLandBuildingCategories] = useState([]);
  const [equipmentCategories, setEquipmentCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [repairRequests, setRepairRequests] = useState([]);
  const [selectedAssetForRepair, setSelectedAssetForRepair] = useState(null);
  const [isRepairFormOpen, setIsRepairFormOpen] = useState(false);

  // --- Initial Load ---
  useEffect(() => {
    // 1. Load assets
    const savedAssets = localStorage.getItem('inventory_assets');
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        console.error('Error parsing saved assets, seeding instead', e);
        const seed = getSeedAssets();
        setAssets(seed);
        localStorage.setItem('inventory_assets', JSON.stringify(seed));
      }
    } else {
      const seed = getSeedAssets();
      setAssets(seed);
      localStorage.setItem('inventory_assets', JSON.stringify(seed));
    }

    // 2. Load layout preference
    const savedLayout = localStorage.getItem('inventory_layout');
    if (savedLayout) {
      setActiveLayout(savedLayout);
    }

    // 3. Load theme preference
    const savedTheme = localStorage.getItem('inventory_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // 4. Load divisions
    const savedDivs = localStorage.getItem('inventory_divisions');
    if (savedDivs) {
      try {
        setDivisions(JSON.parse(savedDivs));
      } catch (e) {
        setDivisions(defaultDivisions);
      }
    } else {
      setDivisions(defaultDivisions);
      localStorage.setItem('inventory_divisions', JSON.stringify(defaultDivisions));
    }

    // 5. Load departments
    const savedDepts = localStorage.getItem('inventory_departments');
    if (savedDepts) {
      try {
        setDepartments(JSON.parse(savedDepts));
      } catch (e) {
        setDepartments(defaultDepartments);
      }
    } else {
      setDepartments(defaultDepartments);
      localStorage.setItem('inventory_departments', JSON.stringify(defaultDepartments));
    }

    // 6. Load custodians
    const savedCusts = localStorage.getItem('inventory_custodians');
    if (savedCusts) {
      try {
        setCustodians(JSON.parse(savedCusts));
      } catch (e) {
        setCustodians(defaultCustodians);
      }
    } else {
      setCustodians(defaultCustodians);
      localStorage.setItem('inventory_custodians', JSON.stringify(defaultCustodians));
    }

    // 7. Load positions
    const savedPositions = localStorage.getItem('inventory_positions');
    if (savedPositions) {
      try {
        setPositions(JSON.parse(savedPositions));
      } catch (e) {
        setPositions(defaultPositions);
      }
    } else {
      setPositions(defaultPositions);
      localStorage.setItem('inventory_positions', JSON.stringify(defaultPositions));
    }

    // 8. Load brands
    const savedBrands = localStorage.getItem('inventory_brands');
    if (savedBrands) {
      try {
        setBrands(JSON.parse(savedBrands));
      } catch (e) {
        setBrands(defaultBrands);
      }
    } else {
      setBrands(defaultBrands);
      localStorage.setItem('inventory_brands', JSON.stringify(defaultBrands));
    }

    // 9. Load locations
    const savedLocations = localStorage.getItem('inventory_locations');
    if (savedLocations) {
      try {
        setLocations(JSON.parse(savedLocations));
      } catch (e) {
        setLocations(defaultLocations);
      }
    } else {
      setLocations(defaultLocations);
      localStorage.setItem('inventory_locations', JSON.stringify(defaultLocations));
    }

    // 10. Load landing badge
    const savedBadge = localStorage.getItem('inventory_landing_badge');
    if (savedBadge) {
      setLandingBadgeText(savedBadge);
    }

    // 11. Load land/building categories
    const savedLandCats = localStorage.getItem('inventory_land_building_categories');
    if (savedLandCats) {
      try {
        setLandBuildingCategories(JSON.parse(savedLandCats));
      } catch (e) {
        setLandBuildingCategories(defaultLandBuildingCategories);
      }
    } else {
      setLandBuildingCategories(defaultLandBuildingCategories);
      localStorage.setItem('inventory_land_building_categories', JSON.stringify(defaultLandBuildingCategories));
    }

    // 12. Load equipment categories
    const savedEquipCats = localStorage.getItem('inventory_equipment_categories');
    if (savedEquipCats) {
      try {
        setEquipmentCategories(JSON.parse(savedEquipCats));
      } catch (e) {
        setEquipmentCategories(defaultEquipmentCategories);
      }
    } else {
      setEquipmentCategories(defaultEquipmentCategories);
      localStorage.setItem('inventory_equipment_categories', JSON.stringify(defaultEquipmentCategories));
    }

    // 13. Load government agencies
    const savedAgencies = localStorage.getItem('inventory_agencies');
    if (savedAgencies) {
      try {
        setAgencies(JSON.parse(savedAgencies));
      } catch (e) {
        setAgencies(defaultAgencies);
      }
    } else {
      setAgencies(defaultAgencies);
      localStorage.setItem('inventory_agencies', JSON.stringify(defaultAgencies));
    }

    // 14. Load repair requests
    const savedRequests = localStorage.getItem('inventory_repair_requests');
    if (savedRequests) {
      try {
        setRepairRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Error parsing saved repair requests', e);
        setRepairRequests([]);
      }
    } else {
      // Seed initial requests based on the loaded assets
      const savedAssets = localStorage.getItem('inventory_assets');
      let loadedAssets = [];
      if (savedAssets) {
        try {
          loadedAssets = JSON.parse(savedAssets);
        } catch (err) {
          console.warn('Failed to parse saved assets on load', err);
        }
      }
      if (loadedAssets.length === 0) {
        loadedAssets = getSeedAssets();
      }
      const dellAsset = loadedAssets.find(a => a.asset_code === '412-67-0001');
      const toyotaAsset = loadedAssets.find(a => a.asset_code === '312-64-0001');
      let seedReqs = [];
      if (dellAsset && toyotaAsset) {
        seedReqs = [
          {
            id: 'repair-seed-1',
            asset_id: dellAsset.id,
            request_date: SEED_DATE_1,
            problem_description: 'แป้นพิมพ์กดยาก ปุ่ม Spacebar และ Enter ไม่ค่อยตอบสนอง',
            status: 'PENDING',
            rejection_reason: '',
            repair_cost: 0,
            contractor: '',
            approval_date: '',
            document_number: '',
            officer_notes: ''
          },
          {
            id: 'repair-seed-2',
            asset_id: toyotaAsset.id,
            request_date: SEED_DATE_2,
            problem_description: 'ระบบเบรกมีเสียงดังผิดปกติเวลาเบรกกระทันหัน คาดว่าผ้าเบรกหมด',
            status: 'IN_PROGRESS',
            rejection_reason: '',
            repair_cost: 0,
            contractor: '',
            approval_date: '',
            document_number: '',
            officer_notes: ''
          }
        ];
      }
      setRepairRequests(seedReqs);
      localStorage.setItem('inventory_repair_requests', JSON.stringify(seedReqs));
    }
  }, []);

  // --- Helpers ---
  const saveAssetsToStateAndStorage = (newAssetsList) => {
    setAssets(newAssetsList);
    localStorage.setItem('inventory_assets', JSON.stringify(newAssetsList));
  };

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('inventory_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('inventory_theme', 'light');
    }
  };

  const handleChangeLayout = (layout) => {
    setActiveLayout(layout);
    localStorage.setItem('inventory_layout', layout);
    setIsMobileMenuOpen(false);
  };

  const handleSaveLandingBadge = (newText) => {
    setLandingBadgeText(newText);
    localStorage.setItem('inventory_landing_badge', newText);
  };

  // --- CRUD Operations ---
  const handleOpenAddForm = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (assetData) => {
    const index = assets.findIndex(a => a.id === assetData.id);
    let updatedAssets;

    if (index >= 0) {
      // Edit
      updatedAssets = [...assets];
      updatedAssets[index] = assetData;
    } else {
      // Add new
      updatedAssets = [assetData, ...assets];
    }

    saveAssetsToStateAndStorage(updatedAssets);
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id) => {
    const assetToDelete = assets.find(a => a.id === id);
    const assetName = assetToDelete?.general_info?.asset_name || 'ครุภัณฑ์นี้';

    if (window.confirm(`คุณต้องการลบข้อมูลครุภัณฑ์ "${assetName}" ใช่หรือไม่?`)) {
      const filtered = assets.filter(a => a.id !== id);
      saveAssetsToStateAndStorage(filtered);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดและดาวน์โหลดข้อมูลครุภัณฑ์ตัวอย่าง 8 รายการกลับมาใช่หรือไม่? (ข้อมูลเดิมของคุณจะถูกแทนที่)')) {
      const seed = getSeedAssets();
      saveAssetsToStateAndStorage(seed);
      saveDivisions(defaultDivisions);
      saveDepartments(defaultDepartments);
      saveCustodians(defaultCustodians);
      savePositions(defaultPositions);
      saveBrands(defaultBrands);
      saveLocations(defaultLocations);
      saveLandBuildingCategories(defaultLandBuildingCategories);
      saveEquipmentCategories(defaultEquipmentCategories);
      saveAgencies(defaultAgencies);

      // Reset repair requests as well
      const dellAsset = seed.find(a => a.asset_code === '412-67-0001');
      const toyotaAsset = seed.find(a => a.asset_code === '312-64-0001');
      let seedReqs = [];
      if (dellAsset && toyotaAsset) {
        seedReqs = [
          {
            id: 'repair-seed-1',
            asset_id: dellAsset.id,
            request_date: SEED_DATE_1,
            problem_description: 'แป้นพิมพ์กดยาก ปุ่ม Spacebar และ Enter ไม่ค่อยตอบสนอง',
            status: 'PENDING',
            rejection_reason: '',
            repair_cost: 0,
            contractor: '',
            approval_date: '',
            document_number: '',
            officer_notes: ''
          },
          {
            id: 'repair-seed-2',
            asset_id: toyotaAsset.id,
            request_date: SEED_DATE_2,
            problem_description: 'ระบบเบรกมีเสียงดังผิดปกติเวลาเบรกกระทันหัน คาดว่าผ้าเบรกหมด',
            status: 'IN_PROGRESS',
            rejection_reason: '',
            repair_cost: 0,
            contractor: '',
            approval_date: '',
            document_number: '',
            officer_notes: ''
          }
        ];
      }
      setRepairRequests(seedReqs);
      localStorage.setItem('inventory_repair_requests', JSON.stringify(seedReqs));

      alert('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว');
    }
  };

  // --- Repair Operations ---
  const handleCreateRepairRequest = (assetId, problemDesc) => {
    const newRequest = {
      id: `repair-${Date.now()}`,
      asset_id: assetId,
      request_date: new Date().toISOString(),
      problem_description: problemDesc,
      status: 'PENDING',
      rejection_reason: '',
      repair_cost: 0,
      contractor: '',
      approval_date: '',
      document_number: '',
      officer_notes: ''
    };
    const updated = [newRequest, ...repairRequests];
    setRepairRequests(updated);
    localStorage.setItem('inventory_repair_requests', JSON.stringify(updated));

    // Automatically sync asset status to 'ชำรุด'
    const assetIndex = assets.findIndex(a => a.id === assetId);
    if (assetIndex >= 0) {
      const updatedAssets = [...assets];
      updatedAssets[assetIndex] = {
        ...updatedAssets[assetIndex],
        status: 'ชำรุด'
      };
      saveAssetsToStateAndStorage(updatedAssets);
    }
  };

  const handleStartRepairJob = (requestId) => {
    let targetAssetId = null;
    const updated = repairRequests.map(req => {
      if (req.id === requestId) {
        targetAssetId = req.asset_id;
        return { ...req, status: 'IN_PROGRESS' };
      }
      return req;
    });
    setRepairRequests(updated);
    localStorage.setItem('inventory_repair_requests', JSON.stringify(updated));

    // Automatically sync asset status to 'กำลังซ่อม'
    if (targetAssetId) {
      const assetIndex = assets.findIndex(a => a.id === targetAssetId);
      if (assetIndex >= 0) {
        const updatedAssets = [...assets];
        updatedAssets[assetIndex] = {
          ...updatedAssets[assetIndex],
          status: 'กำลังซ่อม'
        };
        saveAssetsToStateAndStorage(updatedAssets);
      }
    }
  };

  const handleRejectRepairJob = (requestId, reason) => {
    const updated = repairRequests.map(req => {
      if (req.id === requestId) {
        return { ...req, status: 'REJECTED', rejection_reason: reason };
      }
      return req;
    });
    setRepairRequests(updated);
    localStorage.setItem('inventory_repair_requests', JSON.stringify(updated));
  };

  const handleCompleteRepairJob = (requestId, cost, contractor, approvalDate, documentNumber, notes) => {
    let targetRequest = null;
    const updatedRequests = repairRequests.map(req => {
      if (req.id === requestId) {
        targetRequest = {
          ...req,
          status: 'COMPLETED',
          repair_cost: cost,
          contractor: contractor,
          approval_date: approvalDate,
          document_number: documentNumber,
          officer_notes: notes,
          completion_date: new Date().toISOString()
        };
        return targetRequest;
      }
      return req;
    });

    setRepairRequests(updatedRequests);
    localStorage.setItem('inventory_repair_requests', JSON.stringify(updatedRequests));

    if (targetRequest) {
      const assetIndex = assets.findIndex(a => a.id === targetRequest.asset_id);
      if (assetIndex >= 0) {
        const updatedAssets = [...assets];
        const asset = updatedAssets[assetIndex];
        
        const newMaintenanceLog = {
          id: `maint-${Date.now()}`,
          approval_date: approvalDate,
          document_number: documentNumber,
          description: targetRequest.problem_description + (notes ? ` (${notes})` : ''),
          cost: cost,
          contractor: contractor
        };

        const currentMaintenances = asset.maintenances || [];
        updatedAssets[assetIndex] = {
          ...asset,
          status: 'ใช้งาน', // Reset status to active upon completion
          maintenances: [...currentMaintenances, newMaintenanceLog]
        };

        saveAssetsToStateAndStorage(updatedAssets);
      }
    }
  };

  // --- Settings CRUD Helpers ---
  const saveDivisions = (list) => {
    setDivisions(list);
    localStorage.setItem('inventory_divisions', JSON.stringify(list));
  };

  const saveDepartments = (list) => {
    setDepartments(list);
    localStorage.setItem('inventory_departments', JSON.stringify(list));
  };

  const saveCustodians = (list) => {
    setCustodians(list);
    localStorage.setItem('inventory_custodians', JSON.stringify(list));
  };

  const savePositions = (list) => {
    setPositions(list);
    localStorage.setItem('inventory_positions', JSON.stringify(list));
  };

  const saveBrands = (list) => {
    setBrands(list);
    localStorage.setItem('inventory_brands', JSON.stringify(list));
  };

  const saveLocations = (list) => {
    setLocations(list);
    localStorage.setItem('inventory_locations', JSON.stringify(list));
  };

  const saveLandBuildingCategories = (list) => {
    setLandBuildingCategories(list);
    localStorage.setItem('inventory_land_building_categories', JSON.stringify(list));
  };

  const saveEquipmentCategories = (list) => {
    setEquipmentCategories(list);
    localStorage.setItem('inventory_equipment_categories', JSON.stringify(list));
  };

  const saveAgencies = (list) => {
    setAgencies(list);
    localStorage.setItem('inventory_agencies', JSON.stringify(list));
  };

  const handleAddCustodian = (cust) => {
    saveCustodians([cust, ...custodians]);
  };

  const handleEditCustodian = (cust) => {
    const index = custodians.findIndex(c => c.id === cust.id);
    if (index >= 0) {
      const updated = [...custodians];
      updated[index] = cust;
      saveCustodians(updated);
    }
  };

  const handleDeleteCustodian = (id) => {
    saveCustodians(custodians.filter(c => c.id !== id));
  };

  const handleAddDivision = (div) => {
    saveDivisions([...divisions, div]);
  };

  const handleEditDivision = (oldDiv, newDiv) => {
    saveDivisions(divisions.map(d => d === oldDiv ? newDiv : d));
    // Sync custodians
    saveCustodians(custodians.map(c => c.division === oldDiv ? { ...c, division: newDiv } : c));
  };

  const handleDeleteDivision = (div) => {
    saveDivisions(divisions.filter(d => d !== div));
  };

  const handleAddDepartment = (dept) => {
    saveDepartments([...departments, dept]);
  };

  const handleEditDepartment = (oldDept, newDept) => {
    saveDepartments(departments.map(d => d === oldDept ? newDept : d));
    // Sync custodians
    saveCustodians(custodians.map(c => c.department === oldDept ? { ...c, department: newDept } : c));
  };

  const handleDeleteDepartment = (dept) => {
    saveDepartments(departments.filter(d => d !== dept));
  };

  const handleAddPosition = (pos) => {
    savePositions([...positions, pos]);
  };

  const handleEditPosition = (oldPos, newPos) => {
    savePositions(positions.map(p => p === oldPos ? newPos : p));
    // Sync custodians
    saveCustodians(custodians.map(c => c.position === oldPos ? { ...c, position: newPos } : c));
  };

  const handleDeletePosition = (pos) => {
    savePositions(positions.filter(p => p !== pos));
  };

  const handleAddBrand = (brnd) => {
    saveBrands([...brands, brnd]);
  };

  const handleEditBrand = (oldBrnd, newBrnd) => {
    saveBrands(brands.map(b => b === oldBrnd ? newBrnd : b));
    // Sync assets
    saveAssetsToStateAndStorage(assets.map(a => a.general_info?.brand === oldBrnd ? {
      ...a,
      general_info: { ...a.general_info, brand: newBrnd }
    } : a));
  };

  const handleDeleteBrand = (brnd) => {
    saveBrands(brands.filter(b => b !== brnd));
  };

  const handleAddLocation = (loc) => {
    saveLocations([...locations, loc]);
  };

  const handleEditLocation = (oldLoc, newLoc) => {
    saveLocations(locations.map(l => l === oldLoc ? newLoc : l));
    // Sync assets
    saveAssetsToStateAndStorage(assets.map(a => a.usage?.location === oldLoc ? {
      ...a,
      usage: { ...a.usage, location: newLoc }
    } : a));
  };

  const handleDeleteLocation = (loc) => {
    saveLocations(locations.filter(l => l !== loc));
  };

  const handleAddLandCategory = (cat) => {
    saveLandBuildingCategories([...landBuildingCategories, cat]);
  };

  const handleEditLandCategory = (oldCat, newCat) => {
    saveLandBuildingCategories(landBuildingCategories.map(c => c === oldCat ? newCat : c));
    // Sync assets
    saveAssetsToStateAndStorage(assets.map(a => 
      (a.asset_type === 'LAND_BUILDING' && a.category === oldCat) 
        ? { ...a, category: newCat } 
        : a
    ));
  };

  const handleDeleteLandCategory = (cat) => {
    saveLandBuildingCategories(landBuildingCategories.filter(c => c !== cat));
  };

  const handleAddEquipmentCategory = (cat) => {
    saveEquipmentCategories([...equipmentCategories, cat]);
  };

  const handleEditEquipmentCategory = (oldCat, newCat) => {
    saveEquipmentCategories(equipmentCategories.map(c => c === oldCat ? newCat : c));
    // Sync assets
    saveAssetsToStateAndStorage(assets.map(a => 
      (a.asset_type === 'EQUIPMENT' && a.category === oldCat) 
        ? { ...a, category: newCat } 
        : a
    ));
  };

  const handleDeleteEquipmentCategory = (cat) => {
    saveEquipmentCategories(equipmentCategories.filter(c => c !== cat));
  };

  const handleAddAgency = (agency) => {
    saveAgencies([...agencies, agency]);
  };

  const handleEditAgency = (oldAgency, newAgency) => {
    saveAgencies(agencies.map(a => a === oldAgency ? newAgency : a));
    // Sync assets' custodian history entries and flat budget_owner
    saveAssetsToStateAndStorage(assets.map(a => {
      let changed = false;
      let updatedHistory = a.custodian_history;
      if (a.custodian_history && a.custodian_history.length > 0) {
        updatedHistory = a.custodian_history.map(ch => {
          if (ch.budget_owner === oldAgency) {
            changed = true;
            return { ...ch, budget_owner: newAgency };
          }
          return ch;
        });
      }
      let finalBudgetOwner = a.budget_owner;
      if (a.budget_owner === oldAgency) {
        changed = true;
        finalBudgetOwner = newAgency;
      }
      return changed ? { ...a, budget_owner: finalBudgetOwner, custodian_history: updatedHistory } : a;
    }));
  };

  const handleDeleteAgency = (agency) => {
    saveAgencies(agencies.filter(a => a !== agency));
  };

  // Navigation helper from Centered Landing
  const handleNavigateFromLanding = (layout, searchVal = '') => {
    if (searchVal) {
      setSearchQueryFromLanding(searchVal);
    } else {
      setSearchQueryFromLanding('');
    }
    handleChangeLayout(layout);
  };

  // --- Sub-components / Props ---

  // 1. Sidebar Content
  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span>📦</span>
          <div>
            <strong>ทะเบียนครุภัณฑ์</strong>
            <div className="app-brand-subtitle">Asset Management</div>
          </div>
        </div>
      </div>

      <ul className="sidebar-menu">
        <li
          className={`sidebar-menu-item ${activeLayout === 'sidebar' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('sidebar')}
        >
          📋 ทะเบียนครุภัณฑ์
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('bento')}
        >
          📊 Dashboard
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('centered')}
        >
          🔍 ค้นหา
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'reports' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('reports')}
        >
          📈 รายงาน พ.ด.1-3
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('repair_jobs')}
        >
          🛠️ งานซ่อมอุปกรณ์
        </li>
        <li
          className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
          onClick={() => handleChangeLayout('settings')}
        >
          ⚙️ ตั้งค่าระบบ
        </li>

        <div className="sidebar-menu-divider"></div>

        <li className="sidebar-menu-item" onClick={handleOpenAddForm}>
          ➕ ลงทะเบียนครุภัณฑ์ใหม่
        </li>
        <li className="sidebar-menu-item" onClick={handleResetDemoData}>
          🔄 รีเซ็ตข้อมูลตัวอย่าง
        </li>
      </ul>

      <div className="sidebar-footer">
        <div>v1.0.0 (React JS)</div>
        <div>ระบบจัดการทรัพย์สิน</div>
      </div>
    </>
  );

  // 2. Header Content
  const layoutTitles = {
    'sidebar': 'ทะเบียนครุภัณฑ์',
    'bento': 'Dashboard',
    'reports': 'รายงานสรุป พ.ด.1-3',
    'centered': 'ค้นหา',
    'settings': 'ตั้งค่าระบบครุภัณฑ์',
    'repair_jobs': 'งานซ่อมอุปกรณ์'
  };

  const headerContent = (
    <>
      <div className="header-title">
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
          title="เปิดเมนู"
        >
          ☰
        </button>
        <span>🏢</span>
        <span>{layoutTitles[activeLayout]}</span>
      </div>

      <div className="header-actions">
        {/* Layout Selector */}
        <div className="layout-toggle-group">
          <button
            className={`layout-toggle-btn ${activeLayout === 'sidebar' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('sidebar')}
            title="Sidebar Table View"
          >
            ทะเบียนครุภัณฑ์
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'bento' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('bento')}
            title="Bento Analytics Dashboard"
          >
            Dashboard
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'reports' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('reports')}
            title="พ.ด. 1, พ.ด. 2, และ พ.ด. 3"
          >
            รายงาน
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('repair_jobs')}
            title="งานซ่อมอุปกรณ์"
          >
            งานซ่อม
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'centered' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('centered')}
            title="Centered Search Page"
          >
            ค้นหา
          </button>
          <button
            className={`layout-toggle-btn ${activeLayout === 'settings' ? 'active' : ''}`}
            onClick={() => handleChangeLayout('settings')}
            title="Settings Panel"
          >
            ตั้งค่า
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={handleToggleTheme}
          title={isDarkMode ? 'เปิดโหมดกลางวัน (Light Mode)' : 'เปิดโหมดกลางคืน (Dark Mode)'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <BaseLayout
        sidebar={sidebarContent}
        header={headerContent}
        activeLayout={activeLayout}
        config={{
          borderRadius: '12px',
          themeColor: '#4f46e5',
          elementGap: '16px'
        }}
      >
        {/* Render Layout Contents */}
        {activeLayout === 'sidebar' && (
          <div className="flex-column-gap">
            <div className="flex-center-between">
              <div>
                <h2>ทะเบียนครุภัณฑ์ทั้งหมด</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>บันทึกรายละเอียด รายการ ราคา วันที่ได้มา และค่าเสื่อมสะสม</p>
              </div>
              <button className="button-primary" onClick={handleOpenAddForm}>
                ➕ ลงทะเบียนครุภัณฑ์ใหม่
              </button>
            </div>
             <AssetTable
              assets={assets}
              onEditAsset={handleOpenEditForm}
              onDeleteAsset={handleDeleteAsset}
              onRepairAsset={(item) => {
                setSelectedAssetForRepair(item);
                setIsRepairFormOpen(true);
              }}
              onPrintAsset={(item) => setPrintingAsset(item)}
              initialSearchQuery={searchQueryFromLanding}
            />
          </div>
        )}

        {activeLayout === 'bento' && (
          <BentoDashboard
            assets={assets}
            onAddClick={handleOpenAddForm}
            onResetDemo={handleResetDemoData}
            onViewDetails={() => handleChangeLayout('sidebar')}
          />
        )}

        {activeLayout === 'centered' && (
          <CenteredLanding
            assets={assets}
            onNavigate={handleNavigateFromLanding}
            onAddClick={handleOpenAddForm}
            onEditAsset={handleOpenEditForm}
            landingBadgeText={landingBadgeText}
          />
        )}

        {activeLayout === 'reports' && (
          <ReportPanel
            assets={assets}
            custodians={custodians}
            locations={locations}
          />
        )}

        {activeLayout === 'settings' && (
          <SettingsPanel
            assets={assets}
            custodians={custodians}
            divisions={divisions}
            departments={departments}
            positions={positions}
            brands={brands}
            locations={locations}
            landingBadgeText={landingBadgeText}
            onSaveLandingBadge={handleSaveLandingBadge}
            landBuildingCategories={landBuildingCategories}
            equipmentCategories={equipmentCategories}
            onAddLandCategory={handleAddLandCategory}
            onEditLandCategory={handleEditLandCategory}
            onDeleteLandCategory={handleDeleteLandCategory}
            onAddEquipmentCategory={handleAddEquipmentCategory}
            onEditEquipmentCategory={handleEditEquipmentCategory}
            onDeleteEquipmentCategory={handleDeleteEquipmentCategory}
            onAddCustodian={handleAddCustodian}
            onEditCustodian={handleEditCustodian}
            onDeleteCustodian={handleDeleteCustodian}
            onAddDivision={handleAddDivision}
            onEditDivision={handleEditDivision}
            onDeleteDivision={handleDeleteDivision}
            onAddDepartment={handleAddDepartment}
            onEditDepartment={handleEditDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            onAddPosition={handleAddPosition}
            onEditPosition={handleEditPosition}
            onDeletePosition={handleDeletePosition}
            onAddBrand={handleAddBrand}
            onEditBrand={handleEditBrand}
            onDeleteBrand={handleDeleteBrand}
            onAddLocation={handleAddLocation}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
            agencies={agencies}
            onAddAgency={handleAddAgency}
            onEditAgency={handleEditAgency}
            onDeleteAgency={handleDeleteAgency}
          />
        )}

        {activeLayout === 'repair_jobs' && (
          <RepairJobs
            assets={assets}
            repairRequests={repairRequests}
            onStartRepairJob={handleStartRepairJob}
            onRejectRepairJob={handleRejectRepairJob}
            onCompleteRepairJob={handleCompleteRepairJob}
          />
        )}
      </BaseLayout>

      {/* Slide-over Drawer / Modal Form */}
      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          custodians={custodians}
          brands={brands}
          locations={locations}
          landBuildingCategories={landBuildingCategories}
          equipmentCategories={equipmentCategories}
          agencies={agencies}
          positions={positions}
          onSubmit={handleSubmitForm}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {isRepairFormOpen && (
        <GetRepair
          assets={assets}
          repairRequests={repairRequests}
          onCreateRepairRequest={handleCreateRepairRequest}
          preselectedAsset={selectedAssetForRepair}
          onClearPreselectedAsset={() => setSelectedAssetForRepair(null)}
          onClose={() => setIsRepairFormOpen(false)}
        />
      )}

      {printingAsset && (
        <InventoryPrint
          asset={printingAsset}
          onClose={() => setPrintingAsset(null)}
        />
      )}

      {/* Mobile Drawer Navigation Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className={`mobile-sidebar-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-drawer-header">
              <div className="sidebar-brand">
                <span>📦</span>
                <strong>เมนูระบบครุภัณฑ์</strong>
              </div>
              <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
            </div>

            <ul className="sidebar-menu">
              <li
                className={`sidebar-menu-item ${activeLayout === 'sidebar' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('sidebar')}
              >
                📋 ทะเบียนครุภัณฑ์
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'bento' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('bento')}
              >
                📊 Dashboard
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'centered' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('centered')}
              >
                🔍 ค้นหา
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'reports' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('reports')}
              >
                📈 รายงาน พ.ด.1-3
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'repair_jobs' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('repair_jobs')}
              >
                🛠️ งานซ่อมอุปกรณ์
              </li>
              <li
                className={`sidebar-menu-item ${activeLayout === 'settings' ? 'active' : ''}`}
                onClick={() => handleChangeLayout('settings')}
              >
                ⚙️ ตั้งค่าระบบ
              </li>

              <div className="sidebar-menu-divider"></div>

              <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); handleOpenAddForm(); }}>
                ➕ ลงทะเบียนครุภัณฑ์ใหม่
              </li>
              <li className="sidebar-menu-item" onClick={() => { setIsMobileMenuOpen(false); handleResetDemoData(); }}>
                🔄 รีเซ็ตข้อมูลตัวอย่าง
              </li>
            </ul>

            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
              <div>v1.0.0 (React JS)</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
