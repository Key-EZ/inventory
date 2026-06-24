import { useState } from 'react';
import {
  getSeedAssets,
  defaultDivisions,
  defaultDepartments,
  defaultCustodians,
  defaultPositions,
  defaultBrands,
  defaultLocations,
  defaultLandBuildingCategories,
  defaultEquipmentCategories,
  defaultAgencies,
  defaultSellers
} from '../utils/mockData';

const SEED_DATE_1 = '2026-06-17T08:30:00.000Z';
const SEED_DATE_2 = '2026-06-16T14:15:00.000Z';

export default function useInventory() {
  // --- States ---
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('inventory_assets');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        let migrated = false;
        parsed = parsed.map(asset => {
          let tempAsset = { ...asset };
          let assetUpdated = false;

          if (tempAsset.asset_code && tempAsset.asset_code.includes('-')) {
            migrated = true;
            assetUpdated = true;
            tempAsset.asset_code = tempAsset.asset_code.replace(/-/g, '/');
          }

          if (tempAsset.approval_document !== undefined && tempAsset.delivery_document_no === undefined) {
            migrated = true;
            assetUpdated = true;
            let docNo = '';
            let docDate = '';
            const docStr = tempAsset.approval_document || '';
            const noMatch = docStr.match(/เลขที่\s*(.*?)\s*ลงวันที่/);
            if (noMatch) {
              docNo = noMatch[1];
            } else {
              const fallbackNoMatch = docStr.match(/เลขที่\s*(.*)/);
              if (fallbackNoMatch) {
                docNo = fallbackNoMatch[1];
              } else {
                docNo = docStr;
              }
            }
            const dateMatch = docStr.match(/ลงวันที่\s*(.+)$/);
            if (dateMatch) {
              const dateText = dateMatch[1].trim();
              const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
              const dateParts = dateText.split(/\s+/);
              if (dateParts.length === 3) {
                const day = parseInt(dateParts[0]);
                const monthIndex = thaiMonths.indexOf(dateParts[1]);
                const yearBE = parseInt(dateParts[2]);
                if (!isNaN(day) && monthIndex !== -1 && !isNaN(yearBE)) {
                  const yearCE = yearBE - 543;
                  const monthStr = String(monthIndex + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  docDate = `${yearCE}-${monthStr}-${dayStr}`;
                }
              }
            }
            let sName = 'บจก. เอสเอสพี คอมพิวเตอร์';
            if (tempAsset.asset_type === 'LAND_BUILDING') {
              sName = 'สำนักงานที่ดินจังหวัดนนทบุรี';
            } else if (tempAsset.category === 'ครุภัณฑ์ยานพาหนะและขนส่ง') {
              sName = 'บจก. ยานยนต์รุ่งเรือง';
            } else if (tempAsset.category === 'ครุภัณฑ์สำนักงาน') {
              sName = 'บจก. ดีลักซ์ ซิสเต็มส์';
            } else if (tempAsset.maintenances && tempAsset.maintenances.length > 0) {
              const m = tempAsset.maintenances[0];
              if (m.contractor && m.contractor.includes('นนทบุรี')) {
                sName = 'หจก. นนทบุรีการค้า';
              }
            }
            delete tempAsset.approval_document;
            tempAsset.delivery_document_no = docNo;
            tempAsset.delivery_document_date = docDate;
            tempAsset.seller_name = sName;
          }

          if (tempAsset.warranty_detail !== undefined && tempAsset.warranty_start_date === undefined) {
            migrated = true;
            assetUpdated = true;
            let startDate = tempAsset.delivery_date || tempAsset.delivery_document_date || '';
            let endDate = '';
            let company = tempAsset.seller_name || '';
            const warrantyStr = tempAsset.warranty_detail || '';
            
            const dateMatch = warrantyStr.match(/สิ้นสุด\s*([^\s]+\s+[^\s]+\s+[^\s]+)\s*โดย/);
            if (dateMatch) {
              const dateText = dateMatch[1].trim();
              const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
              const dateParts = dateText.split(/\s+/);
              if (dateParts.length === 3) {
                const day = parseInt(dateParts[0]);
                const monthIndex = thaiMonths.indexOf(dateParts[1]);
                const yearBE = parseInt(dateParts[2]);
                if (!isNaN(day) && monthIndex !== -1 && !isNaN(yearBE)) {
                  const yearCE = yearBE - 543;
                  const monthStr = String(monthIndex + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  endDate = `${yearCE}-${monthStr}-${dayStr}`;
                }
              }
            } else if (warrantyStr.includes("รับประกัน 1 ปี") && startDate) {
              const dateParts = startDate.split('-');
              if (dateParts.length === 3) {
                const y = parseInt(dateParts[0]) + 1;
                endDate = `${y}-${dateParts[1]}-${dateParts[2]}`;
              }
            }
            delete tempAsset.warranty_detail;
            tempAsset.warranty_start_date = startDate;
            tempAsset.warranty_end_date = endDate;
            tempAsset.warranty_company = company;
          }

          return assetUpdated ? tempAsset : asset;
        });
        if (migrated) {
          localStorage.setItem('inventory_assets', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing saved assets, seeding instead', e);
      }
    }
    const seed = getSeedAssets();
    localStorage.setItem('inventory_assets', JSON.stringify(seed));
    return seed;
  });

  const [divisions, setDivisions] = useState(() => {
    const saved = localStorage.getItem('inventory_divisions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse divisions', e);
      }
    }
    localStorage.setItem('inventory_divisions', JSON.stringify(defaultDivisions));
    return defaultDivisions;
  });

  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem('inventory_departments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse departments', e);
      }
    }
    localStorage.setItem('inventory_departments', JSON.stringify(defaultDepartments));
    return defaultDepartments;
  });

  const [custodians, setCustodians] = useState(() => {
    const saved = localStorage.getItem('inventory_custodians');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse custodians', e);
      }
    }
    localStorage.setItem('inventory_custodians', JSON.stringify(defaultCustodians));
    return defaultCustodians;
  });

  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('inventory_positions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse positions', e);
      }
    }
    localStorage.setItem('inventory_positions', JSON.stringify(defaultPositions));
    return defaultPositions;
  });

  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('inventory_brands');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse brands', e);
      }
    }
    localStorage.setItem('inventory_brands', JSON.stringify(defaultBrands));
    return defaultBrands;
  });

  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('inventory_locations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse locations', e);
      }
    }
    localStorage.setItem('inventory_locations', JSON.stringify(defaultLocations));
    return defaultLocations;
  });

  const [sellers, setSellers] = useState(() => {
    const saved = localStorage.getItem('inventory_sellers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse sellers', e);
      }
    }
    localStorage.setItem('inventory_sellers', JSON.stringify(defaultSellers));
    return defaultSellers;
  });

  const [landingBadgeText, setLandingBadgeText] = useState(() => {
    return localStorage.getItem('inventory_landing_badge') || 'ระบบดิจิทัลบริหารทรัพย์สิน';
  });

  const [landBuildingCategories, setLandBuildingCategories] = useState(() => {
    const saved = localStorage.getItem('inventory_land_building_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse land categories', e);
      }
    }
    localStorage.setItem('inventory_land_building_categories', JSON.stringify(defaultLandBuildingCategories));
    return defaultLandBuildingCategories;
  });

  const [equipmentCategories, setEquipmentCategories] = useState(() => {
    const saved = localStorage.getItem('inventory_equipment_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse equipment categories', e);
      }
    }
    localStorage.setItem('inventory_equipment_categories', JSON.stringify(defaultEquipmentCategories));
    return defaultEquipmentCategories;
  });

  const [agencies, setAgencies] = useState(() => {
    const saved = localStorage.getItem('inventory_agencies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse agencies', e);
      }
    }
    localStorage.setItem('inventory_agencies', JSON.stringify(defaultAgencies));
    return defaultAgencies;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('inventory_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse audit logs', e);
      }
    }
    return [];
  });

  const [repairRequests, setRepairRequests] = useState(() => {
    const saved = localStorage.getItem('inventory_repair_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse repair requests', e);
      }
    }

    const savedAssets = localStorage.getItem('inventory_assets');
    let loadedAssets = [];
    if (savedAssets) {
      try {
        loadedAssets = JSON.parse(savedAssets);
      } catch (err) {
        console.warn('Failed to parse saved assets for repair seeding', err);
      }
    }
    if (loadedAssets.length === 0) {
      loadedAssets = getSeedAssets();
    }
    const dellAsset = loadedAssets.find(a => a.asset_code === '412/67/0001');
    const toyotaAsset = loadedAssets.find(a => a.asset_code === '312/64/0001');
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
    localStorage.setItem('inventory_repair_requests', JSON.stringify(seedReqs));
    return seedReqs;
  });

  // --- Storage Helper ---
  const saveAssetsToStateAndStorage = (newAssetsList) => {
    setAssets(newAssetsList);
    localStorage.setItem('inventory_assets', JSON.stringify(newAssetsList));
  };

  // --- Audit Log Helpers ---
  const addAuditLog = (action, details) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user: 'ผู้ใช้งานระบบ'
    };
    setAuditLogs(prevLogs => {
      const updated = [newLog, ...prevLogs];
      localStorage.setItem('inventory_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAuditLogs = () => {
    if (window.confirm('คุณต้องการลบประวัติการใช้งานระบบทั้งหมดใช่หรือไม่? (การดำเนินการนี้ไม่สามารถย้อนกลับได้)')) {
      const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action: 'ระบบ',
        details: 'ล้างประวัติการใช้งานระบบ (Audit Log) ทั้งหมด',
        user: 'ผู้ใช้งานระบบ'
      };
      setAuditLogs([newLog]);
      localStorage.setItem('inventory_audit_logs', JSON.stringify([newLog]));
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

  const handleSaveLandingBadge = (newText) => {
    setLandingBadgeText(newText);
    localStorage.setItem('inventory_landing_badge', newText);
  };

  // --- CRUD Operations ---
  const handleSubmitForm = (assetData) => {
    const index = assets.findIndex(a => a.id === assetData.id);
    let updatedAssets;

    if (index >= 0) {
      // Edit
      updatedAssets = [...assets];
      updatedAssets[index] = assetData;
      addAuditLog('ครุภัณฑ์', `แก้ไขข้อมูลครุภัณฑ์: ${assetData.name || 'ไม่ระบุชื่อ'} (${assetData.asset_code || 'ไม่ระบุรหัส'})`);
    } else {
      // Add new
      updatedAssets = [assetData, ...assets];
      addAuditLog('ครุภัณฑ์', `เพิ่มครุภัณฑ์ใหม่: ${assetData.name || 'ไม่ระบุชื่อ'} (${assetData.asset_code || 'ไม่ระบุรหัส'})`);
    }

    saveAssetsToStateAndStorage(updatedAssets);
  };

  const handleDeleteAsset = (id) => {
    const assetToDelete = assets.find(a => a.id === id);
    const assetName = assetToDelete?.name || 'ครุภัณฑ์นี้';
    const assetCode = assetToDelete?.asset_code || 'ไม่ระบุรหัส';

    if (window.confirm(`คุณต้องการลบข้อมูลครุภัณฑ์ "${assetName}" ใช่หรือไม่?`)) {
      const filtered = assets.filter(a => a.id !== id);
      saveAssetsToStateAndStorage(filtered);

      // Filter out and remove all repair requests associated with the deleted asset
      const filteredRequests = repairRequests.filter(req => req.asset_id !== id);
      setRepairRequests(filteredRequests);
      localStorage.setItem('inventory_repair_requests', JSON.stringify(filteredRequests));

      addAuditLog('ครุภัณฑ์', `ลบครุภัณฑ์: ${assetName} (${assetCode})`);
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

      const dellAsset = seed.find(a => a.asset_code === '412/67/0001');
      const toyotaAsset = seed.find(a => a.asset_code === '312/64/0001');
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
      addAuditLog('ระบบ', 'รีเซ็ตระบบด้วยข้อมูลครุภัณฑ์ตัวอย่าง');

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

    const assetIndex = assets.findIndex(a => a.id === assetId);
    let assetCode = 'ไม่ระบุรหัส';
    if (assetIndex >= 0) {
      const updatedAssets = [...assets];
      assetCode = updatedAssets[assetIndex].asset_code || 'ไม่ระบุรหัส';
      updatedAssets[assetIndex] = {
        ...updatedAssets[assetIndex],
        status: 'ชำรุด'
      };
      saveAssetsToStateAndStorage(updatedAssets);
    }
    addAuditLog('งานซ่อม', `แจ้งซ่อมอุปกรณ์สำหรับครุภัณฑ์รหัส: ${assetCode} (ปัญหา: ${problemDesc})`);
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

    if (targetAssetId) {
      const assetIndex = assets.findIndex(a => a.id === targetAssetId);
      if (assetIndex >= 0) {
        const updatedAssets = [...assets];
        const assetCode = updatedAssets[assetIndex].asset_code || 'ไม่ระบุรหัส';
        updatedAssets[assetIndex] = {
          ...updatedAssets[assetIndex],
          status: 'กำลังซ่อม'
        };
        saveAssetsToStateAndStorage(updatedAssets);
        addAuditLog('งานซ่อม', `เริ่มดำเนินการซ่อมแซมครุภัณฑ์รหัส: ${assetCode}`);
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

    const reqObj = repairRequests.find(r => r.id === requestId);
    if (reqObj) {
      const asset = assets.find(a => a.id === reqObj.asset_id);
      const assetCode = asset?.asset_code || 'ไม่ระบุรหัส';
      addAuditLog('งานซ่อม', `ปฏิเสธการแจ้งซ่อมของครุภัณฑ์รหัส: ${assetCode} (เหตุผล: ${reason})`);
    }
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
          status: 'ใช้งาน',
          maintenances: [...currentMaintenances, newMaintenanceLog]
        };

        saveAssetsToStateAndStorage(updatedAssets);
        addAuditLog('งานซ่อม', `ซ่อมแซมเสร็จสิ้นสำหรับครุภัณฑ์รหัส: ${asset.asset_code} (ค่าใช้จ่าย: ${cost} บาท, ผู้รับจ้าง: ${contractor})`);
      }
    }
  };

  // --- Custodian CRUD ---
  const handleAddCustodian = (cust) => {
    saveCustodians([cust, ...custodians]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มผู้ดูแลใหม่: ${cust.name || 'ไม่ระบุชื่อ'} (${cust.position || 'ไม่ระบุตำแหน่ง'})`);
  };

  const handleEditCustodian = (cust) => {
    const index = custodians.findIndex(c => c.id === cust.id);
    if (index >= 0) {
      const updated = [...custodians];
      updated[index] = cust;
      saveCustodians(updated);
      addAuditLog('ตั้งค่าระบบ', `แก้ไขข้อมูลผู้ดูแล: ${cust.name || 'ไม่ระบุชื่อ'} (${cust.position || 'ไม่ระบุตำแหน่ง'})`);
    }
  };

  const handleDeleteCustodian = (id) => {
    const cust = custodians.find(c => c.id === id);
    saveCustodians(custodians.filter(c => c.id !== id));
    addAuditLog('ตั้งค่าระบบ', `ลบผู้ดูแล: ${cust?.name || 'ไม่ระบุชื่อ'} (รหัส: ${id})`);
  };

  // --- Division CRUD ---
  const handleAddDivision = (div) => {
    saveDivisions([...divisions, div]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มฝ่ายงานใหม่: ${div}`);
  };

  const handleEditDivision = (oldDiv, newDiv) => {
    saveDivisions(divisions.map(d => d === oldDiv ? newDiv : d));
    saveCustodians(custodians.map(c => c.division === oldDiv ? { ...c, division: newDiv } : c));
    addAuditLog('ตั้งค่าระบบ', `แก้ไขฝ่ายงานจาก "${oldDiv}" เป็น "${newDiv}"`);
  };

  const handleDeleteDivision = (div) => {
    saveDivisions(divisions.filter(d => d !== div));
    addAuditLog('ตั้งค่าระบบ', `ลบฝ่ายงาน: ${div}`);
  };

  // --- Department CRUD ---
  const handleAddDepartment = (dept) => {
    saveDepartments([...departments, dept]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มงานย่อยใหม่: ${dept}`);
  };

  const handleEditDepartment = (oldDept, newDept) => {
    saveDepartments(departments.map(d => d === oldDept ? newDept : d));
    saveCustodians(custodians.map(c => c.department === oldDept ? { ...c, department: newDept } : c));
    addAuditLog('ตั้งค่าระบบ', `แก้ไขงานย่อยจาก "${oldDept}" เป็น "${newDept}"`);
  };

  const handleDeleteDepartment = (dept) => {
    saveDepartments(departments.filter(d => d !== dept));
    addAuditLog('ตั้งค่าระบบ', `ลบงานย่อย: ${dept}`);
  };

  // --- Position CRUD ---
  const handleAddPosition = (pos) => {
    savePositions([...positions, pos]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มตำแหน่งใหม่: ${pos}`);
  };

  const handleEditPosition = (oldPos, newPos) => {
    savePositions(positions.map(p => p === oldPos ? newPos : p));
    saveCustodians(custodians.map(c => c.position === oldPos ? { ...c, position: newPos } : c));
    addAuditLog('ตั้งค่าระบบ', `แก้ไขตำแหน่งจาก "${oldPos}" เป็น "${newPos}"`);
  };

  const handleDeletePosition = (pos) => {
    savePositions(positions.filter(p => p !== pos));
    addAuditLog('ตั้งค่าระบบ', `ลบตำแหน่ง: ${pos}`);
  };

  // --- Brand CRUD ---
  const handleAddBrand = (brnd) => {
    saveBrands([...brands, brnd]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มยี่ห้อใหม่: ${brnd}`);
  };

  const handleEditBrand = (oldBrnd, newBrnd) => {
    saveBrands(brands.map(b => b === oldBrnd ? newBrnd : b));
    saveAssetsToStateAndStorage(assets.map(a => a.manufacturer_brand === oldBrnd ? {
      ...a,
      manufacturer_brand: newBrnd
    } : a));
    addAuditLog('ตั้งค่าระบบ', `แก้ไขยี่ห้อจาก "${oldBrnd}" เป็น "${newBrnd}"`);
  };

  const handleDeleteBrand = (brnd) => {
    saveBrands(brands.filter(b => b !== brnd));
    addAuditLog('ตั้งค่าระบบ', `ลบยี่ห้อ: ${brnd}`);
  };

  // --- Location CRUD ---
  const handleAddLocation = (loc) => {
    saveLocations([...locations, loc]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มสถานที่ตั้งใหม่: ${loc}`);
  };

  const handleEditLocation = (oldLoc, newLoc) => {
    saveLocations(locations.map(l => l === oldLoc ? newLoc : l));
    saveAssetsToStateAndStorage(assets.map(a => a.location === oldLoc ? {
      ...a,
      location: newLoc
    } : a));
    addAuditLog('ตั้งค่าระบบ', `แก้ไขสถานที่ตั้งจาก "${oldLoc}" เป็น "${newLoc}"`);
  };

  const handleDeleteLocation = (loc) => {
    saveLocations(locations.filter(l => l !== loc));
    addAuditLog('ตั้งค่าระบบ', `ลบสถานที่ตั้ง: ${loc}`);
  };

  // --- Land Category CRUD ---
  const handleAddLandCategory = (cat) => {
    saveLandBuildingCategories([...landBuildingCategories, cat]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มหมวดหมู่ที่ดิน พ.ด.1: ${cat}`);
  };

  const handleEditLandCategory = (oldCat, newCat) => {
    saveLandBuildingCategories(landBuildingCategories.map(c => c === oldCat ? newCat : c));
    saveAssetsToStateAndStorage(assets.map(a => 
      (a.asset_type === 'LAND_BUILDING' && a.category === oldCat) 
        ? { ...a, category: newCat } 
        : a
    ));
    addAuditLog('ตั้งค่าระบบ', `แก้ไขหมวดหมู่ที่ดิน พ.ด.1 จาก "${oldCat}" เป็น "${newCat}"`);
  };

  const handleDeleteLandCategory = (cat) => {
    saveLandBuildingCategories(landBuildingCategories.filter(c => c !== cat));
    addAuditLog('ตั้งค่าระบบ', `ลบหมวดหมู่ที่ดิน พ.ด.1: ${cat}`);
  };

  // --- Equipment Category CRUD ---
  const handleAddEquipmentCategory = (cat) => {
    saveEquipmentCategories([...equipmentCategories, cat]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มหมวดหมู่ครุภัณฑ์ พ.ด.2: ${cat}`);
  };

  const handleEditEquipmentCategory = (oldCat, newCat) => {
    saveEquipmentCategories(equipmentCategories.map(c => c === oldCat ? newCat : c));
    saveAssetsToStateAndStorage(assets.map(a => 
      (a.asset_type === 'EQUIPMENT' && a.category === oldCat) 
        ? { ...a, category: newCat } 
        : a
    ));
    addAuditLog('ตั้งค่าระบบ', `แก้ไขหมวดหมู่ครุภัณฑ์ พ.ด.2 จาก "${oldCat}" เป็น "${newCat}"`);
  };

  const handleDeleteEquipmentCategory = (cat) => {
    saveEquipmentCategories(equipmentCategories.filter(c => c !== cat));
    addAuditLog('ตั้งค่าระบบ', `ลบหมวดหมู่ครุภัณฑ์ พ.ด.2: ${cat}`);
  };

  // --- Agency CRUD ---
  const handleAddAgency = (agency) => {
    saveAgencies([...agencies, agency]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มหน่วยงานเจ้าของงบประมาณ: ${agency}`);
  };

  const handleEditAgency = (oldAgency, newAgency) => {
    saveAgencies(agencies.map(a => a === oldAgency ? newAgency : a));
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
    addAuditLog('ตั้งค่าระบบ', `แก้ไขหน่วยงานเจ้าของงบประมาณจาก "${oldAgency}" เป็น "${newAgency}"`);
  };

  const handleDeleteAgency = (agency) => {
    saveAgencies(agencies.filter(a => a !== agency));
    addAuditLog('ตั้งค่าระบบ', `ลบหน่วยงานเจ้าของงบประมาณ: ${agency}`);
  };

  // --- Seller CRUD ---
  const saveSellers = (list) => {
    setSellers(list);
    localStorage.setItem('inventory_sellers', JSON.stringify(list));
  };

  const handleAddSeller = (seller) => {
    saveSellers([...sellers, seller]);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มรายชื่อผู้ขายใหม่: ${seller}`);
  };

  const handleEditSeller = (oldSeller, newSeller) => {
    saveSellers(sellers.map(s => s === oldSeller ? newSeller : s));
    const updatedAssets = assets.map(a => a.seller_name === oldSeller ? { ...a, seller_name: newSeller } : a);
    saveAssetsToStateAndStorage(updatedAssets);
    addAuditLog('ตั้งค่าระบบ', `แก้ไขรายชื่อผู้ขายจาก "${oldSeller}" เป็น "${newSeller}"`);
  };

  const handleDeleteSeller = (seller) => {
    saveSellers(sellers.filter(s => s !== seller));
    addAuditLog('ตั้งค่าระบบ', `ลบรายชื่อผู้ขาย: ${seller}`);
  };

  return {
    assets,
    divisions,
    departments,
    custodians,
    positions,
    brands,
    locations,
    landingBadgeText,
    landBuildingCategories,
    equipmentCategories,
    agencies,
    auditLogs,
    repairRequests,
    addAuditLog,
    handleClearAuditLogs,
    handleSaveLandingBadge,
    handleSubmitForm,
    handleDeleteAsset,
    handleResetDemoData,
    handleCreateRepairRequest,
    handleStartRepairJob,
    handleRejectRepairJob,
    handleCompleteRepairJob,
    handleAddCustodian,
    handleEditCustodian,
    handleDeleteCustodian,
    handleAddDivision,
    handleEditDivision,
    handleDeleteDivision,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    handleAddPosition,
    handleEditPosition,
    handleDeletePosition,
    handleAddBrand,
    handleEditBrand,
    handleDeleteBrand,
    handleAddLocation,
    handleEditLocation,
    handleDeleteLocation,
    handleAddLandCategory,
    handleEditLandCategory,
    handleDeleteLandCategory,
    handleAddEquipmentCategory,
    handleEditEquipmentCategory,
    handleDeleteEquipmentCategory,
    handleAddAgency,
    handleEditAgency,
    handleDeleteAgency,
    sellers,
    handleAddSeller,
    handleEditSeller,
    handleDeleteSeller
  };
}
