import { useState, useEffect } from 'react';

const API_BASE_URL = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:5000/api`
  : 'http://localhost:5000/api';


export default function useInventory() {
  // --- States ---
  const [assets, setAssets] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [custodians, setCustodians] = useState([]);
  const [positions, setPositions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [landingBadgeText, setLandingBadgeText] = useState('ระบบดิจิทัลบริหารทรัพย์สิน');
  const [landBuildingCategories, setLandBuildingCategories] = useState([]);
  const [equipmentCategories, setEquipmentCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [categoryDepreciationYears, setCategoryDepreciationYears] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [repairRequests, setRepairRequests] = useState([]);

  // --- Auth States ---
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('inventory_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('inventory_token') || null;
  });
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [ssoError, setSsoError] = useState(null);
  const isAdmin = !!currentUser;
  const isSystemAdmin = currentUser?.role === 'ADMIN';

  const handleLoginSuccess = (user, token) => {
    sessionStorage.setItem('inventory_user', JSON.stringify(user));
    sessionStorage.setItem('inventory_token', token);
    setCurrentUser(user);
    setToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem('inventory_user');
    sessionStorage.removeItem('inventory_token');
    setCurrentUser(null);
    setToken(null);
  };

  // --- Check URL for SSO parameters ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token');
    const ssoUserJson = params.get('sso_user');
    const ssoErr = params.get('sso_error');

    if (ssoToken && ssoUserJson) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(ssoUserJson));
        handleLoginSuccess(decodedUser, ssoToken);
        setSsoError(null);
        
        // Clean URL query parameters
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } catch (err) {
        console.error('Failed to parse SSO user parameter:', err);
        setSsoError('ข้อมูลผู้ใช้งาน SSO รูปแบบไม่ถูกต้อง');
      }
    } else if (ssoErr) {
      setSsoError(decodeURIComponent(ssoErr));
      
      // Clean URL query parameters
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // --- Backend Sync useEffect ---
  useEffect(() => {
    const initData = async () => {
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Fetch Settings
        const settingsRes = await fetch(API_BASE_URL + '/settings', { headers });
        if (!settingsRes.ok) throw new Error('Failed to fetch settings');
        const settings = await settingsRes.json();
        
        setDivisions(settings.divisions || []);
        setDepartments(settings.departments || []);
        setCustodians(settings.custodians || []);
        setPositions(settings.positions || []);
        setBrands(settings.brands || []);
        setLocations(settings.locations || []);
        setLandBuildingCategories(settings.landBuildingCategories || []);
        setEquipmentCategories(settings.equipmentCategories || []);
        setCategoryDepreciationYears(settings.categoryDepreciationYears || {});
        setAgencies(settings.agencies || []);
        setSellers(settings.sellers || []);
        setLandingBadgeText(settings.landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');

        // Fetch Assets
        const assetsRes = await fetch(API_BASE_URL + '/assets', { headers });
        if (!assetsRes.ok) throw new Error('Failed to fetch assets');
        const fetchedAssets = await assetsRes.json();
        setAssets(fetchedAssets);

        // Fetch Repairs
        const repairsRes = await fetch(API_BASE_URL + '/repairs', { headers });
        if (!repairsRes.ok) throw new Error('Failed to fetch repairs');
        const fetchedRepairs = await repairsRes.json();
        setRepairRequests(fetchedRepairs);

        // Fetch Audit Logs (requires authentication)
        if (token) {
          const logsRes = await fetch(API_BASE_URL + '/audit-logs', { headers });
          if (logsRes.ok) {
            const fetchedLogs = await logsRes.json();
            setAuditLogs(fetchedLogs);
          }
        }

        setIsBackendOnline(true);
      } catch (err) {
        console.error('Failed to connect to backend server:', err);
        setIsBackendOnline(false);
      }
    };
    initData();
  }, [token]);

  const saveSettingsBackend = async (updatedFields) => {
    try {
      const res = await fetch(API_BASE_URL + '/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        if (updatedFields.categoryDepreciationYears) {
          const assetsRes = await fetch(API_BASE_URL + '/assets', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (assetsRes.ok) {
            setAssets(await assetsRes.json());
          }
        }
      } else {
        const errorText = await res.text();
        console.error('Failed to save settings:', errorText);
      }
    } catch (err) {
      console.error('Network error during settings sync:', err);
    }
  };

  const addAuditLog = () => {
    // Audit logs are now written on the backend.
  };

  const handleClearAuditLogs = async () => {
    if (window.confirm('คุณต้องการลบประวัติการใช้งานระบบทั้งหมดใช่หรือไม่? (การกระทำนี้ไม่สามารถย้อนกลับได้)')) {
      try {
        const res = await fetch(API_BASE_URL + '/audit-logs', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          // Re-fetch logs
          const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
        }
      } catch (err) {
        console.error('Error clearing audit logs:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    }
  };

  const handleSaveLandingBadge = async (newText) => {
    setLandingBadgeText(newText);
    await saveSettingsBackend({ landingBadgeText: newText });
  };

  // --- CRUD Operations ---
  const handleSubmitForm = async (assetData) => {
    const index = assets.findIndex(a => a.id === assetData.id);
    try {
      const method = index >= 0 ? 'PUT' : 'POST';
      const url = index >= 0 ? `${API_BASE_URL}/assets/${assetData.id}` : API_BASE_URL + '/assets';
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
        const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) setAuditLogs(await logsRes.json());
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }
    } catch (err) {
      console.error('API error:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const handleDeleteAsset = async (id) => {
    const assetToDelete = assets.find(a => a.id === id);
    const assetName = assetToDelete?.name || 'ครุภัณฑ์นี้';

    if (window.confirm(`คุณต้องการลบข้อมูลครุภัณฑ์ "${assetName}" ใช่หรือไม่?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/assets/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setAssets(prev => prev.filter(a => a.id !== id));
          setRepairRequests(prev => prev.filter(req => req.asset_id !== id));

          // Refresh logs
          const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (logsRes.ok) setAuditLogs(await logsRes.json());
        } else {
          const errorData = await res.json();
          alert(errorData.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
        }
      } catch (err) {
        console.error('API error:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    }
  };


  const handleCreateRepairRequest = async (assetId, problemDescription) => {
    try {
      const res = await fetch(API_BASE_URL + '/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset_id: assetId,
          request_date: new Date().toISOString(),
          problem_description: problemDescription
        })
      });

      if (res.ok) {
        const newRequest = await res.json();
        setRepairRequests(prev => [newRequest, ...prev]);

        // Refresh logs
        const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) setAuditLogs(await logsRes.json());

        // Update asset status locally to under repair
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'กำลังซ่อม' } : a));
        return true;
      }
    } catch (err) {
      console.error('Error creating repair request:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
    return false;
  };

  const handleStartRepairJob = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/repairs/${requestId}/start`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setRepairRequests(prev => prev.map(r => r.id === requestId ? updated : r));

        // Refresh logs
        const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) setAuditLogs(await logsRes.json());
      }
    } catch (err) {
      console.error('Error starting repair job:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const handleRejectRepairJob = async (requestId, reason) => {
    try {
      const res = await fetch(`${API_BASE_URL}/repairs/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        const updated = await res.json();
        setRepairRequests(prev => prev.map(r => r.id === requestId ? updated : r));

        const request = repairRequests.find(r => r.id === requestId);
        if (request) {
          // Revert asset status back to ใช้งาน or ชำรุด
          setAssets(prev => prev.map(a => a.id === request.asset_id ? { ...a, status: 'ชำรุด' } : a));
        }

        // Refresh logs
        const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) setAuditLogs(await logsRes.json());
      }
    } catch (err) {
      console.error('Error rejecting repair job:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const handleCompleteRepairJob = async (requestId, cost, contractor, approvalDate, documentNumber, notes) => {
    try {
      const res = await fetch(`${API_BASE_URL}/repairs/${requestId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cost, contractor, approvalDate, documentNumber, notes })
      });
      if (res.ok) {
        const updatedRequest = await res.json();
        setRepairRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));

        // Re-fetch assets to get updated maintenance logs
        const assetsRes = await fetch(API_BASE_URL + '/assets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (assetsRes.ok) {
          const freshAssets = await assetsRes.json();
          // Make sure asset status goes back to 'ใช้งาน'
          setAssets(freshAssets.map(a => a.id === updatedRequest.asset_id ? { ...a, status: 'ใช้งาน' } : a));
        }

        // Refresh logs
        const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) setAuditLogs(await logsRes.json());
      }
    } catch (err) {
      console.error('Error completing repair job:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  // --- Custodian CRUD ---
  const handleAddCustodian = (cust) => {
    const list = [cust, ...custodians];
    setCustodians(list);
    saveSettingsBackend({ custodians: list });
  };

  const handleEditCustodian = (cust) => {
    const index = custodians.findIndex(c => c.id === cust.id);
    if (index >= 0) {
      const list = [...custodians];
      list[index] = cust;
      setCustodians(list);
      saveSettingsBackend({ custodians: list });
    }
  };

  const handleDeleteCustodian = (id) => {
    const list = custodians.filter(c => c.id !== id);
    setCustodians(list);
    saveSettingsBackend({ custodians: list });
  };

  // --- Division CRUD ---
  const handleAddDivision = (div) => {
    const list = [...divisions, div];
    setDivisions(list);
    saveSettingsBackend({ divisions: list });
  };

  const handleEditDivision = (oldDiv, newDiv) => {
    const list = divisions.map(d => d === oldDiv ? newDiv : d);
    setDivisions(list);
    const updatedCustodians = custodians.map(c => c.division === oldDiv ? { ...c, division: newDiv } : c);
    setCustodians(updatedCustodians);
    saveSettingsBackend({ divisions: list, custodians: updatedCustodians });
  };

  const handleDeleteDivision = (div) => {
    const list = divisions.filter(d => d !== div);
    setDivisions(list);
    saveSettingsBackend({ divisions: list });
  };

  // --- Department CRUD ---
  const handleAddDepartment = (dept) => {
    const list = [...departments, dept];
    setDepartments(list);
    saveSettingsBackend({ departments: list });
  };

  const handleEditDepartment = (oldDept, newDept) => {
    const list = departments.map(d => d === oldDept ? newDept : d);
    setDepartments(list);
    const updatedCustodians = custodians.map(c => c.department === oldDept ? { ...c, department: newDept } : c);
    setCustodians(updatedCustodians);
    saveSettingsBackend({ departments: list, custodians: updatedCustodians });
  };

  const handleDeleteDepartment = (dept) => {
    const list = departments.filter(d => d !== dept);
    setDepartments(list);
    saveSettingsBackend({ departments: list });
  };

  // --- Position CRUD ---
  const handleAddPosition = (pos) => {
    const list = [...positions, pos];
    setPositions(list);
    saveSettingsBackend({ positions: list });
  };

  const handleEditPosition = (oldPos, newPos) => {
    const list = positions.map(p => p === oldPos ? newPos : p);
    setPositions(list);
    const updatedCustodians = custodians.map(c => c.position === oldPos ? { ...c, position: newPos } : c);
    setCustodians(updatedCustodians);
    saveSettingsBackend({ positions: list, custodians: updatedCustodians });
  };

  const handleDeletePosition = (pos) => {
    const list = positions.filter(p => p !== pos);
    setPositions(list);
    saveSettingsBackend({ positions: list });
  };

  // --- Brand CRUD ---
  const handleAddBrand = (brnd) => {
    const list = [...brands, brnd];
    setBrands(list);
    saveSettingsBackend({ brands: list });
  };

  const handleEditBrand = (oldBrnd, newBrnd) => {
    const list = brands.map(b => b === oldBrnd ? newBrnd : b);
    setBrands(list);
    saveSettingsBackend({ brands: list });
  };

  const handleDeleteBrand = (brnd) => {
    const list = brands.filter(b => b !== brnd);
    setBrands(list);
    saveSettingsBackend({ brands: list });
  };

  // --- Location CRUD ---
  const handleAddLocation = (loc) => {
    const list = [...locations, loc];
    setLocations(list);
    saveSettingsBackend({ locations: list });
  };

  const handleEditLocation = (oldLoc, newLoc) => {
    const list = locations.map(l => l === oldLoc ? newLoc : l);
    setLocations(list);
    saveSettingsBackend({ locations: list });
  };

  const handleDeleteLocation = (loc) => {
    const list = locations.filter(l => l !== loc);
    setLocations(list);
    saveSettingsBackend({ locations: list });
  };

  // --- Category CRUD ---
  const handleAddLandCategory = (cat, years) => {
    const list = [...landBuildingCategories, cat];
    setLandBuildingCategories(list);
    const updatedYears = { ...categoryDepreciationYears, [cat]: years !== undefined ? years : 20 };
    setCategoryDepreciationYears(updatedYears);
    saveSettingsBackend({ 
      landBuildingCategories: list,
      categoryDepreciationYears: updatedYears
    });
  };

  const handleEditLandCategory = (oldCat, newCat, years) => {
    const list = landBuildingCategories.map(c => c === oldCat ? newCat : c);
    setLandBuildingCategories(list);
    const updatedYears = { ...categoryDepreciationYears };
    if (oldCat !== newCat) {
      delete updatedYears[oldCat];
    }
    updatedYears[newCat] = years !== undefined ? years : 20;
    setCategoryDepreciationYears(updatedYears);
    saveSettingsBackend({ 
      landBuildingCategories: list,
      categoryDepreciationYears: updatedYears
    });
  };

  const handleDeleteLandCategory = (cat) => {
    const list = landBuildingCategories.filter(c => c !== cat);
    setLandBuildingCategories(list);
    const updatedYears = { ...categoryDepreciationYears };
    delete updatedYears[cat];
    setCategoryDepreciationYears(updatedYears);
    saveSettingsBackend({ 
      landBuildingCategories: list,
      categoryDepreciationYears: updatedYears
    });
  };

  const handleAddEquipmentCategory = (cat, years) => {
    const list = [...equipmentCategories, cat];
    setEquipmentCategories(list);
    const updatedYears = { ...categoryDepreciationYears, [cat]: years !== undefined ? years : 5 };
    setCategoryDepreciationYears(updatedYears);
    saveSettingsBackend({ 
      equipmentCategories: list,
      categoryDepreciationYears: updatedYears
    });
  };

  const handleEditEquipmentCategory = (oldCat, newCat, years) => {
    const list = equipmentCategories.map(c => c === oldCat ? newCat : c);
    setEquipmentCategories(list);
    const updatedYears = { ...categoryDepreciationYears };
    if (oldCat !== newCat) {
      delete updatedYears[oldCat];
    }
    updatedYears[newCat] = years !== undefined ? years : 5;
    setCategoryDepreciationYears(updatedYears);
    saveSettingsBackend({ 
      equipmentCategories: list,
      categoryDepreciationYears: updatedYears
    });
  };

  const handleDeleteEquipmentCategory = (cat) => {
    const list = equipmentCategories.filter(c => c !== cat);
    setEquipmentCategories(list);
    const updatedYears = { ...categoryDepreciationYears };
    delete updatedYears[cat];
    setCategoryDepreciationYears(updatedYears);
    saveSettingsBackend({ 
      equipmentCategories: list,
      categoryDepreciationYears: updatedYears
    });
  };

  // --- Agency CRUD ---
  const handleAddAgency = (agency) => {
    const list = [...agencies, agency];
    setAgencies(list);
    saveSettingsBackend({ agencies: list });
  };

  const handleEditAgency = (oldAgency, newAgency) => {
    const list = agencies.map(a => a === oldAgency ? newAgency : a);
    setAgencies(list);
    saveSettingsBackend({ agencies: list });
  };

  const handleDeleteAgency = (agency) => {
    const list = agencies.filter(a => a !== agency);
    setAgencies(list);
    saveSettingsBackend({ agencies: list });
  };

  // --- Seller CRUD ---
  const handleAddSeller = (seller) => {
    const list = [...sellers, seller];
    setSellers(list);
    saveSettingsBackend({ sellers: list });
  };

  const handleEditSeller = (oldSeller, newSeller) => {
    const list = sellers.map(s => s === oldSeller ? newSeller : s);
    setSellers(list);
    saveSettingsBackend({ sellers: list });
  };

  const handleDeleteSeller = (seller) => {
    const list = sellers.filter(s => s !== seller);
    setSellers(list);
    saveSettingsBackend({ sellers: list });
  };

  // --- Settings Customizer Helpers ---
  const saveCategoryDepreciationYears = (mapping) => {
    setCategoryDepreciationYears(mapping);
    saveSettingsBackend({ categoryDepreciationYears: mapping });
  };

  // --- Import API Operations ---
  const importAssetsData = async (validAssets, mode) => {
    // Sync option fields dynamically if they contain new values
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
      const updatedFields = {};
      if (newDepts.size > departments.length) {
        const list = Array.from(newDepts);
        setDepartments(list);
        updatedFields.departments = list;
      }
      if (newLocs.size > locations.length) {
        const list = Array.from(newLocs);
        setLocations(list);
        updatedFields.locations = list;
      }
      if (newBrands.size > brands.length) {
        const list = Array.from(newBrands);
        setBrands(list);
        updatedFields.brands = list;
      }
      if (newSellers.size > sellers.length) {
        const list = Array.from(newSellers);
        setSellers(list);
        updatedFields.sellers = list;
      }
      if (newLandCats.size > landBuildingCategories.length) {
        const list = Array.from(newLandCats);
        setLandBuildingCategories(list);
        updatedFields.landBuildingCategories = list;
      }
      if (newEquipCats.size > equipmentCategories.length) {
        const list = Array.from(newEquipCats);
        setEquipmentCategories(list);
        updatedFields.equipmentCategories = list;
      }
      if (Object.keys(updatedFields).length > 0) {
        await saveSettingsBackend(updatedFields);
      }
    }

    try {
      const res = await fetch(API_BASE_URL + '/assets/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assets: validAssets, mode })
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets);
        
        // Refresh audit logs
        const logsRes = await fetch(API_BASE_URL + '/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) setAuditLogs(await logsRes.json());
        
        return {
          success: true,
          added: data.added,
          updated: data.updated,
          errors: []
        };
      } else {
        const errorMsg = await res.text();
        return { success: false, added: 0, updated: 0, errors: [`ระบบเซิร์ฟเวอร์นำเข้าล้มเหลว: ${errorMsg}`] };
      }
    } catch (err) {
      return { success: false, added: 0, updated: 0, errors: [`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์: ${err.message}`] };
    }
  };

  // --- Auth Session CRUD ---
  const loginAdmin = async (username, password) => {
    try {
      const res = await fetch(API_BASE_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        handleLoginSuccess(data.user, data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'ไม่สามารถเชื่อมต่อกับระบบเซิร์ฟเวอร์ได้' };
    }
  };

  const loginSSO = async (email) => {
    try {
      const res = await fetch(API_BASE_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        handleLoginSuccess(data.user, data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('SSO Login error:', err);
      return { success: false, message: 'ไม่สามารถเชื่อมต่อกับระบบเซิร์ฟเวอร์ได้' };
    }
  };

  // (logout and handleLoginSuccess moved to top of useInventory hook)

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
    ssoError,
    setSsoError,
    loginAdmin,
    loginSSO,
    logout,
    handleLoginSuccess,
    saveCategoryDepreciationYears
  };
}
