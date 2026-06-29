import { useState, useEffect } from 'react';
import { calculateDepreciation } from '../utils/depreciation';
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
            let docNo;
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

  const [categoryDepreciationYears, setCategoryDepreciationYears] = useState(() => {
    const saved = localStorage.getItem('inventory_category_depreciation_years');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse category depreciation years', e);
      }
    }
    const defaultMapping = {
      'ที่ดินที่มีกรรมสิทธิ์': 0,
      'อาคารสำนักงาน': 20,
      'สิ่งปลูกสร้าง': 20,
      'ครุภัณฑ์สำนักงาน': 10,
      'ครุภัณฑ์คอมพิวเตอร์': 5,
      'ครุภัณฑ์ยานพาหนะและขนส่ง': 5,
      'ครุภัณฑ์ไฟฟ้าและวิทยุ': 5,
      'ครุภัณฑ์โฆษณาและเผยแพร่': 5,
      'ครุภัณฑ์งานบ้านงานครัว': 5,
      'ครุภัณฑ์วิทยาศาสตร์และการแพทย์': 10,
      'ครุภัณฑ์กีฬา': 5,
      'สินทรัพย์ไม่มีตัวตนอื่น': 5
    };
    localStorage.setItem('inventory_category_depreciation_years', JSON.stringify(defaultMapping));
    return defaultMapping;
  });

  const saveCategoryDepreciationYears = (mapping) => {
    setCategoryDepreciationYears(mapping);
    localStorage.setItem('inventory_category_depreciation_years', JSON.stringify(mapping));
  };

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

  // --- Auth States ---
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('inventory_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('inventory_token') || null;
  });
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const isAdmin = !!currentUser;
  const isSystemAdmin = currentUser?.role === 'ADMIN';

  // --- Backend Sync useEffect ---
  useEffect(() => {
    const initData = async () => {
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Fetch Settings
        const settingsRes = await fetch('http://localhost:5000/api/settings', { headers });
        if (!settingsRes.ok) throw new Error('Failed to fetch settings');
        const settings = await settingsRes.json();
        
        setDivisions(settings.divisions);
        setDepartments(settings.departments);
        setCustodians(settings.custodians);
        setPositions(settings.positions);
        setBrands(settings.brands);
        setLocations(settings.locations);
        setLandBuildingCategories(settings.landBuildingCategories);
        setEquipmentCategories(settings.equipmentCategories);
        setCategoryDepreciationYears(settings.categoryDepreciationYears);
        setAgencies(settings.agencies);
        setSellers(settings.sellers);
        setLandingBadgeText(settings.landingBadgeText);

        // Fetch Assets
        const assetsRes = await fetch('http://localhost:5000/api/assets', { headers });
        if (!assetsRes.ok) throw new Error('Failed to fetch assets');
        const fetchedAssets = await assetsRes.json();
        setAssets(fetchedAssets);

        // Fetch Repairs
        const repairsRes = await fetch('http://localhost:5000/api/repairs', { headers });
        if (!repairsRes.ok) throw new Error('Failed to fetch repairs');
        const fetchedRepairs = await repairsRes.json();
        setRepairRequests(fetchedRepairs);

        // Fetch Audit Logs
        const logsRes = await fetch('http://localhost:5000/api/audit-logs', { headers });
        if (!logsRes.ok) throw new Error('Failed to fetch audit logs');
        const fetchedLogs = await logsRes.json();
        setAuditLogs(fetchedLogs);

        setIsBackendOnline(true);
      } catch (err) {
        console.warn('Backend server offline, running in offline LocalStorage fallback mode.', err);
        setIsBackendOnline(false);
      }
    };
    initData();
  }, [token]);

  const saveSettingsBackend = async (updatedFields) => {
    if (isBackendOnline) {
      try {
        const res = await fetch('http://localhost:5000/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedFields)
        });
        if (res.ok) {
          const logsRes = await fetch('http://localhost:5000/api/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
          
          const assetsRes = await fetch('http://localhost:5000/api/assets');
          if (assetsRes.ok) setAssets(await assetsRes.json());
        }
      } catch (err) {
        console.warn('Failed to save settings to backend', err);
      }
    }
  };

  const loginAdmin = async (username, password) => {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      sessionStorage.setItem('inventory_token', data.token);
      sessionStorage.setItem('inventory_user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const loginSSO = async (email) => {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      sessionStorage.setItem('inventory_token', data.token);
      sessionStorage.setItem('inventory_user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      return data;
    } else {
      throw new Error(data.message || 'SSO Login failed');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('inventory_token');
    sessionStorage.removeItem('inventory_user');
    setToken(null);
    setCurrentUser(null);
  };

  const handleLoginSuccess = (newToken, newUser) => {
    sessionStorage.setItem('inventory_token', newToken);
    sessionStorage.setItem('inventory_user', JSON.stringify(newUser));
    setToken(newToken);
    setCurrentUser(newUser);
  };

  // --- Storage Helper ---
  const saveAssetsToStateAndStorage = (newAssetsList) => {
    setAssets(newAssetsList);
    localStorage.setItem('inventory_assets', JSON.stringify(newAssetsList));
  };

  const recalculateAllAssetsDepreciation = (updatedMapping = categoryDepreciationYears, currentAssets = assets) => {
    const updatedAssets = currentAssets.map(asset => {
      const dep = calculateDepreciation(
        asset.asset_code,
        asset.unit_price,
        asset.category,
        updatedMapping
      );
      return {
        ...asset,
        depreciation_rate_percent: dep.depreciation_rate_percent,
        accumulated_depreciation: dep.accumulated_depreciation,
        book_value: dep.book_value
      };
    });
    setAssets(updatedAssets);
    localStorage.setItem('inventory_assets', JSON.stringify(updatedAssets));
  };

  // --- Audit Log Helpers ---
  const addAuditLog = (action, details) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user: currentUser ? currentUser.name : 'ผู้ใช้งานระบบ'
    };
    setAuditLogs(prevLogs => {
      const updated = [newLog, ...prevLogs];
      localStorage.setItem('inventory_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAuditLogs = async () => {
    if (window.confirm('คุณต้องการลบประวัติการใช้งานระบบทั้งหมดใช่หรือไม่? (การดำเนินการนี้ไม่สามารถย้อนกลับได้)')) {
      if (isBackendOnline) {
        try {
          const res = await fetch('http://localhost:5000/api/audit-logs', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const fetchedLogs = await res.json();
            setAuditLogs(fetchedLogs);
            return;
          }
        } catch (err) {
          console.warn('API error, falling back to local clear', err);
        }
      }

      const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action: 'ระบบ',
        details: 'ล้างประวัติการใช้งานระบบ (Audit Log) ทั้งหมด',
        user: currentUser ? currentUser.name : 'ผู้ใช้งานระบบ'
      };
      setAuditLogs([newLog]);
      localStorage.setItem('inventory_audit_logs', JSON.stringify([newLog]));
    }
  };

  // --- Settings CRUD Helpers ---
  const saveDivisions = (list) => {
    setDivisions(list);
    localStorage.setItem('inventory_divisions', JSON.stringify(list));
    saveSettingsBackend({ divisions: list });
  };

  const saveDepartments = (list) => {
    setDepartments(list);
    localStorage.setItem('inventory_departments', JSON.stringify(list));
    saveSettingsBackend({ departments: list });
  };

  const saveCustodians = (list) => {
    setCustodians(list);
    localStorage.setItem('inventory_custodians', JSON.stringify(list));
    saveSettingsBackend({ custodians: list });
  };

  const savePositions = (list) => {
    setPositions(list);
    localStorage.setItem('inventory_positions', JSON.stringify(list));
    saveSettingsBackend({ positions: list });
  };

  const saveBrands = (list) => {
    setBrands(list);
    localStorage.setItem('inventory_brands', JSON.stringify(list));
    saveSettingsBackend({ brands: list });
  };

  const saveLocations = (list) => {
    setLocations(list);
    localStorage.setItem('inventory_locations', JSON.stringify(list));
    saveSettingsBackend({ locations: list });
  };

  const saveLandBuildingCategories = (list) => {
    setLandBuildingCategories(list);
    localStorage.setItem('inventory_land_building_categories', JSON.stringify(list));
    saveSettingsBackend({ landBuildingCategories: list });
  };

  const saveEquipmentCategories = (list) => {
    setEquipmentCategories(list);
    localStorage.setItem('inventory_equipment_categories', JSON.stringify(list));
    saveSettingsBackend({ equipmentCategories: list });
  };

  const saveAgencies = (list) => {
    setAgencies(list);
    localStorage.setItem('inventory_agencies', JSON.stringify(list));
    saveSettingsBackend({ agencies: list });
  };

  const handleSaveLandingBadge = (newText) => {
    setLandingBadgeText(newText);
    localStorage.setItem('inventory_landing_badge', newText);
    saveSettingsBackend({ landingBadgeText: newText });
  };

  // --- CRUD Operations ---
  const handleSubmitForm = async (assetData) => {
    const index = assets.findIndex(a => a.id === assetData.id);

    if (isBackendOnline) {
      try {
        const method = index >= 0 ? 'PUT' : 'POST';
        const url = index >= 0 ? `http://localhost:5000/api/assets/${assetData.id}` : 'http://localhost:5000/api/assets';
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(assetData)
        });
        if (res.ok) {
          const updatedAsset = await res.json();
          setAssets(prev => {
            const list = [...prev];
            if (index >= 0) {
              list[index] = updatedAsset;
            } else {
              list.unshift(updatedAsset);
            }
            return list;
          });

          // Refresh logs
          const logsRes = await fetch('http://localhost:5000/api/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
          return;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage update', err);
      }
    }

    // Fallback
    let updatedAssets;
    if (index >= 0) {
      updatedAssets = [...assets];
      updatedAssets[index] = assetData;
      addAuditLog('ครุภัณฑ์', `แก้ไขข้อมูลครุภัณฑ์: ${assetData.name || 'ไม่ระบุชื่อ'} (${assetData.asset_code || 'ไม่ระบุรหัส'})`);
    } else {
      updatedAssets = [assetData, ...assets];
      addAuditLog('ครุภัณฑ์', `เพิ่มครุภัณฑ์ใหม่: ${assetData.name || 'ไม่ระบุชื่อ'} (${assetData.asset_code || 'ไม่ระบุรหัส'})`);
    }
    saveAssetsToStateAndStorage(updatedAssets);
  };

  const handleDeleteAsset = async (id) => {
    const assetToDelete = assets.find(a => a.id === id);
    const assetName = assetToDelete?.name || 'ครุภัณฑ์นี้';
    const assetCode = assetToDelete?.asset_code || 'ไม่ระบุรหัส';

    if (window.confirm(`คุณต้องการลบข้อมูลครุภัณฑ์ "${assetName}" ใช่หรือไม่?`)) {
      if (isBackendOnline) {
        try {
          const res = await fetch(`http://localhost:5000/api/assets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            setAssets(prev => prev.filter(a => a.id !== id));
            setRepairRequests(prev => prev.filter(req => req.asset_id !== id));

            // Refresh logs
            const logsRes = await fetch('http://localhost:5000/api/audit-logs', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (logsRes.ok) setAuditLogs(await logsRes.json());
            return;
          }
        } catch (err) {
          console.warn('API error, falling back to local storage delete', err);
        }
      }

      const filtered = assets.filter(a => a.id !== id);
      saveAssetsToStateAndStorage(filtered);

      const filteredRequests = repairRequests.filter(req => req.asset_id !== id);
      setRepairRequests(filteredRequests);
      localStorage.setItem('inventory_repair_requests', JSON.stringify(filteredRequests));

      addAuditLog('ครุภัณฑ์', `ลบครุภัณฑ์: ${assetName} (${assetCode})`);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดและดาวน์โหลดข้อมูลครุภัณฑ์ตัวอย่าง 8 รายการกลับมาใช่หรือไม่? (ข้อมูลเดิมของคุณจะถูกแทนที่)')) {
      if (isBackendOnline) {
        try {
          const res = await fetch('http://localhost:5000/api/settings/reset', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            window.location.reload();
            return;
          }
        } catch (err) {
          console.warn('API error, falling back to local storage reset', err);
        }
      }

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

      const defaultMapping = {
        'ที่ดินที่มีกรรมสิทธิ์': 0,
        'อาคารสำนักงาน': 20,
        'สิ่งปลูกสร้าง': 20,
        'ครุภัณฑ์สำนักงาน': 10,
        'ครุภัณฑ์คอมพิวเตอร์': 5,
        'ครุภัณฑ์ยานพาหนะและขนส่ง': 5,
        'ครุภัณฑ์ไฟฟ้าและวิทยุ': 5,
        'ครุภัณฑ์โฆษณาและเผยแพร่': 5,
        'ครุภัณฑ์งานบ้านงานครัว': 5,
        'ครุภัณฑ์วิทยาศาสตร์และการแพทย์': 10,
        'ครุภัณฑ์กีฬา': 5,
        'สินทรัพย์ไม่มีตัวตนอื่น': 5
      };
      saveCategoryDepreciationYears(defaultMapping);

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
  const handleCreateRepairRequest = async (assetId, problemDesc) => {
    if (isBackendOnline) {
      try {
        const res = await fetch('http://localhost:5000/api/repairs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ asset_id: assetId, problem_description: problemDesc })
        });
        if (res.ok) {
          const newRequest = await res.json();
          setRepairRequests(prev => [newRequest, ...prev]);
          setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'ชำรุด' } : a));

          // Refresh logs
          const logsRes = await fetch('http://localhost:5000/api/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
          return;
        }
      } catch (err) {
        console.warn('API error, falling back to local repair creation', err);
      }
    }

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

  const handleStartRepairJob = async (requestId) => {
    if (isBackendOnline) {
      try {
        const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/start`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const updatedReq = await res.json();
          setRepairRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
          setAssets(prev => prev.map(a => a.id === updatedReq.asset_id ? { ...a, status: 'กำลังซ่อม' } : a));

          // Refresh logs
          const logsRes = await fetch('http://localhost:5000/api/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
          return;
        }
      } catch (err) {
        console.warn('API error, falling back to local start job', err);
      }
    }

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

  const handleRejectRepairJob = async (requestId, reason) => {
    if (isBackendOnline) {
      try {
        const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/reject`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });
        if (res.ok) {
          const updatedReq = await res.json();
          setRepairRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
          setAssets(prev => prev.map(a => a.id === updatedReq.asset_id ? { ...a, status: 'ใช้งาน' } : a));

          // Refresh logs
          const logsRes = await fetch('http://localhost:5000/api/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
          return;
        }
      } catch (err) {
        console.warn('API error, falling back to local reject job', err);
      }
    }

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

  const handleCompleteRepairJob = async (requestId, cost, contractor, approvalDate, documentNumber, notes) => {
    if (isBackendOnline) {
      try {
        const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/complete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cost, contractor, approvalDate, documentNumber, notes })
        });
        if (res.ok) {
          const updatedReq = await res.json();
          setRepairRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));

          // Fetch updated assets
          const assetsRes = await fetch('http://localhost:5000/api/assets');
          if (assetsRes.ok) setAssets(await assetsRes.json());

          // Refresh logs
          const logsRes = await fetch('http://localhost:5000/api/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
          return;
        }
      } catch (err) {
        console.warn('API error, falling back to local complete job', err);
      }
    }

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
  const handleAddLandCategory = (cat, years = 20) => {
    saveLandBuildingCategories([...landBuildingCategories, cat]);
    const updatedMapping = { ...categoryDepreciationYears };
    updatedMapping[cat] = parseInt(years) >= 0 ? parseInt(years) : 20;
    saveCategoryDepreciationYears(updatedMapping);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มหมวดหมู่ที่ดิน พ.ด.1: ${cat} (ค่าเสื่อม ${years} ปี)`);
  };

  const handleEditLandCategory = (oldCat, newCat, newYears) => {
    saveLandBuildingCategories(landBuildingCategories.map(c => c === oldCat ? newCat : c));
    
    const updatedMapping = { ...categoryDepreciationYears };
    if (newYears !== undefined) {
      updatedMapping[newCat] = parseInt(newYears) >= 0 ? parseInt(newYears) : 20;
    } else {
      updatedMapping[newCat] = updatedMapping[oldCat] !== undefined ? updatedMapping[oldCat] : 20;
    }
    if (oldCat !== newCat) {
      delete updatedMapping[oldCat];
    }
    saveCategoryDepreciationYears(updatedMapping);

    const updatedAssets = assets.map(a => 
      (a.asset_type === 'LAND_BUILDING' && a.category === oldCat) 
        ? { ...a, category: newCat } 
        : a
    );
    recalculateAllAssetsDepreciation(updatedMapping, updatedAssets);
    
    addAuditLog('ตั้งค่าระบบ', `แก้ไขหมวดหมู่ที่ดิน พ.ด.1: ${oldCat} -> ${newCat} (${updatedMapping[newCat]} ปี)`);
  };

  const handleDeleteLandCategory = (cat) => {
    saveLandBuildingCategories(landBuildingCategories.filter(c => c !== cat));
    const updatedMapping = { ...categoryDepreciationYears };
    delete updatedMapping[cat];
    saveCategoryDepreciationYears(updatedMapping);
    
    recalculateAllAssetsDepreciation(updatedMapping, assets);
    addAuditLog('ตั้งค่าระบบ', `ลบหมวดหมู่ที่ดิน พ.ด.1: ${cat}`);
  };

  // --- Equipment Category CRUD ---
  const handleAddEquipmentCategory = (cat, years = 5) => {
    saveEquipmentCategories([...equipmentCategories, cat]);
    const updatedMapping = { ...categoryDepreciationYears };
    updatedMapping[cat] = parseInt(years) >= 0 ? parseInt(years) : 5;
    saveCategoryDepreciationYears(updatedMapping);
    addAuditLog('ตั้งค่าระบบ', `เพิ่มหมวดหมู่ครุภัณฑ์ พ.ด.2: ${cat} (ค่าเสื่อม ${years} ปี)`);
  };

  const handleEditEquipmentCategory = (oldCat, newCat, newYears) => {
    saveEquipmentCategories(equipmentCategories.map(c => c === oldCat ? newCat : c));
    
    const updatedMapping = { ...categoryDepreciationYears };
    if (newYears !== undefined) {
      updatedMapping[newCat] = parseInt(newYears) >= 0 ? parseInt(newYears) : 5;
    } else {
      updatedMapping[newCat] = updatedMapping[oldCat] !== undefined ? updatedMapping[oldCat] : 5;
    }
    if (oldCat !== newCat) {
      delete updatedMapping[oldCat];
    }
    saveCategoryDepreciationYears(updatedMapping);

    const updatedAssets = assets.map(a => 
      (a.asset_type === 'EQUIPMENT' && a.category === oldCat) 
        ? { ...a, category: newCat } 
        : a
    );
    recalculateAllAssetsDepreciation(updatedMapping, updatedAssets);
    
    addAuditLog('ตั้งค่าระบบ', `แก้ไขหมวดหมู่ครุภัณฑ์ พ.ด.2: ${oldCat} -> ${newCat} (${updatedMapping[newCat]} ปี)`);
  };

  const handleDeleteEquipmentCategory = (cat) => {
    saveEquipmentCategories(equipmentCategories.filter(c => c !== cat));
    const updatedMapping = { ...categoryDepreciationYears };
    delete updatedMapping[cat];
    saveCategoryDepreciationYears(updatedMapping);
    
    recalculateAllAssetsDepreciation(updatedMapping, assets);
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
    saveSettingsBackend({ sellers: list });
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

  const importAssetsData = (parsedAssets, mode = 'merge') => {
    if (!Array.isArray(parsedAssets)) {
      return { success: false, errors: ['ข้อมูลที่นำเข้าไม่ใช่รายการอาร์เรย์ (Invalid format)'] };
    }

    const errors = [];
    const validAssets = [];
    let addedCount = 0;
    let updatedCount = 0;

    parsedAssets.forEach((rawAsset, idx) => {
      const rowNum = idx + 1;
      
      // Required fields: name, asset_type, category, asset_code
      if (!rawAsset.name) {
        errors.push(`แถวที่ ${rowNum}: ไม่มีชื่อพัสดุ`);
        return;
      }
      if (!rawAsset.asset_type || (rawAsset.asset_type !== 'LAND_BUILDING' && rawAsset.asset_type !== 'EQUIPMENT')) {
        errors.push(`แถวที่ ${rowNum}: ประเภททรัพย์สินไม่ถูกต้อง (ต้องเป็น LAND_BUILDING หรือ EQUIPMENT)`);
        return;
      }
      if (!rawAsset.category) {
        errors.push(`แถวที่ ${rowNum}: ไม่มีหมวดหมู่พัสดุ`);
        return;
      }
      if (!rawAsset.asset_code) {
        errors.push(`แถวที่ ${rowNum}: ไม่มีรหัสพัสดุ (asset_code)`);
        return;
      }

      // Unit price validation
      let unitPrice = parseFloat(rawAsset.unit_price) || 0;
      if (unitPrice < 0) {
        unitPrice = 0;
      }

      const asset_code = String(rawAsset.asset_code).trim();
      const name = String(rawAsset.name).trim();
      const category = String(rawAsset.category).trim();
      const asset_type = rawAsset.asset_type;
      
      const newAsset = {
        id: rawAsset.id || `asset-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        asset_type,
        category,
        asset_code,
        name,
        location: rawAsset.location ? String(rawAsset.location).trim() : '',
        acquisition_method: rawAsset.acquisition_method ? String(rawAsset.acquisition_method).trim() : 'ซื้อ',
        delivery_document_no: rawAsset.delivery_document_no ? String(rawAsset.delivery_document_no).trim() : '',
        delivery_document_date: rawAsset.delivery_document_date ? String(rawAsset.delivery_document_date).trim() : '',
        seller_name: rawAsset.seller_name ? String(rawAsset.seller_name).trim() : '',
        unit_price: unitPrice,
        budget_owner: rawAsset.budget_owner ? String(rawAsset.budget_owner).trim() : '',
        responsible_department: rawAsset.responsible_department ? String(rawAsset.responsible_department).trim() : '',
        status: rawAsset.status ? String(rawAsset.status).trim() : 'ใช้งาน',
        maintenances: Array.isArray(rawAsset.maintenances) ? rawAsset.maintenances : [],

        // Ph.D.1 Specific
        document_of_title: rawAsset.document_of_title ? String(rawAsset.document_of_title).trim() : '',
        area_size: rawAsset.area_size ? String(rawAsset.area_size).trim() : '',
        building_style: rawAsset.building_style ? String(rawAsset.building_style).trim() : '',

        // Ph.D.2 Specific
        manufacturer_brand: rawAsset.manufacturer_brand ? String(rawAsset.manufacturer_brand).trim() : '',
        serial_number: rawAsset.serial_number ? String(rawAsset.serial_number).trim() : '',
        engine_number: rawAsset.engine_number ? String(rawAsset.engine_number).trim() : '',
        chassis_number: rawAsset.chassis_number ? String(rawAsset.chassis_number).trim() : '',
        vehicle_registration: rawAsset.vehicle_registration ? String(rawAsset.vehicle_registration).trim() : '',
        color: rawAsset.color ? String(rawAsset.color).trim() : '',
        warranty_start_date: rawAsset.warranty_start_date ? String(rawAsset.warranty_start_date).trim() : '',
        warranty_end_date: rawAsset.warranty_end_date ? String(rawAsset.warranty_end_date).trim() : '',
        warranty_company: rawAsset.warranty_company ? String(rawAsset.warranty_company).trim() : '',

        // Depreciation: raw value or default as-is per request
        depreciation_rate_percent: rawAsset.depreciation_rate_percent !== undefined ? parseFloat(rawAsset.depreciation_rate_percent) || 0 : 0,
        accumulated_depreciation: rawAsset.accumulated_depreciation !== undefined ? parseFloat(rawAsset.accumulated_depreciation) || 0 : 0,
        book_value: rawAsset.book_value !== undefined ? parseFloat(rawAsset.book_value) || 0 : unitPrice
      };

      validAssets.push(newAsset);
    });

    if (validAssets.length === 0) {
      return { success: false, added: 0, updated: 0, errors: errors.length > 0 ? errors : ['ไม่มีข้อมูลที่ถูกต้องเพื่อนำเข้า'] };
    }

    // Dynamic master option lists update
    const newDepts = new Set(departments);
    const newLocs = new Set(locations);
    const newBrands = new Set(brands);
    const newSellers = new Set(sellers);
    const newLandCats = new Set(landBuildingCategories);
    const newEquipCats = new Set(equipmentCategories);
    let listsUpdated = false;

    validAssets.forEach(a => {
      if (a.responsible_department && !newDepts.has(a.responsible_department)) {
        newDepts.add(a.responsible_department);
        listsUpdated = true;
      }
      if (a.location && !newLocs.has(a.location)) {
        newLocs.add(a.location);
        listsUpdated = true;
      }
      if (a.manufacturer_brand && !newBrands.has(a.manufacturer_brand)) {
        newBrands.add(a.manufacturer_brand);
        listsUpdated = true;
      }
      if (a.seller_name && !newSellers.has(a.seller_name)) {
        newSellers.add(a.seller_name);
        listsUpdated = true;
      }
      if (a.category) {
        if (a.asset_type === 'LAND_BUILDING' && !newLandCats.has(a.category)) {
          newLandCats.add(a.category);
          listsUpdated = true;
        } else if (a.asset_type === 'EQUIPMENT' && !newEquipCats.has(a.category)) {
          newEquipCats.add(a.category);
          listsUpdated = true;
        }
      }
    });

    if (listsUpdated) {
      if (newDepts.size > departments.length) saveDepartments(Array.from(newDepts));
      if (newLocs.size > locations.length) saveLocations(Array.from(newLocs));
      if (newBrands.size > brands.length) saveBrands(Array.from(newBrands));
      if (newSellers.size > sellers.length) saveSellers(Array.from(newSellers));
      if (newLandCats.size > landBuildingCategories.length) saveLandBuildingCategories(Array.from(newLandCats));
      if (newEquipCats.size > equipmentCategories.length) saveEquipmentCategories(Array.from(newEquipCats));
    }

    let updatedList;
    if (mode === 'replace') {
      updatedList = validAssets;
      addedCount = validAssets.length;
    } else {
      const currentAssetsMap = new Map(assets.map(a => [a.asset_code, a]));
      validAssets.forEach(newAsset => {
        if (currentAssetsMap.has(newAsset.asset_code)) {
          const existing = currentAssetsMap.get(newAsset.asset_code);
          newAsset.id = existing.id;
          if (newAsset.maintenances.length === 0 && existing.maintenances && existing.maintenances.length > 0) {
            newAsset.maintenances = existing.maintenances;
          }
          currentAssetsMap.set(newAsset.asset_code, newAsset);
          updatedCount++;
        } else {
          currentAssetsMap.set(newAsset.asset_code, newAsset);
          addedCount++;
        }
      });
      updatedList = Array.from(currentAssetsMap.values());
    }

    saveAssetsToStateAndStorage(updatedList);
    addAuditLog('ตั้งค่าระบบ', `นำเข้าข้อมูลครุภัณฑ์สำเร็จ (นำเข้าใหม่: ${addedCount} รายการ, อัปเดตข้อมูลเดิม: ${updatedCount} รายการ)`);

    return {
      success: true,
      added: addedCount,
      updated: updatedCount,
      errors
    };
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
    categoryDepreciationYears,
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
    handleDeleteSeller,
    importAssetsData,
    currentUser,
    isAdmin,
    isSystemAdmin,
    token,
    isBackendOnline,
    loginAdmin,
    loginSSO,
    logout,
    handleLoginSuccess
  };
}
