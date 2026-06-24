import { useState, useMemo } from 'react';

export default function useAssetTable({ assets, initialSearchQuery = '' }) {
  const [search, setSearch] = useState(initialSearchQuery);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [filterCategory, setFilterCategory] = useState('ทั้งหมด');
  const [sortBy, setSortBy] = useState('code-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Extract unique categories for filtering
  const categories = useMemo(() => {
    const catSet = new Set(assets.map(item => item.category).filter(Boolean));
    return ['ทั้งหมด', ...Array.from(catSet)];
  }, [assets]);

  // Process data (Filter, Search, Sort)
  const processedAssets = useMemo(() => {
    let result = [...assets];

    // 1. Text Search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(item =>
        (item.asset_code || '').toLowerCase().includes(q) ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.responsible_department || '').toLowerCase().includes(q) ||
        (item.manufacturer_brand || '').toLowerCase().includes(q) ||
        (item.chassis_number || '').toLowerCase().includes(q) ||
        (item.vehicle_registration || '').toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (filterStatus !== 'ทั้งหมด') {
      result = result.filter(item => item.status === filterStatus);
    }

    // 3. Category Filter
    if (filterCategory !== 'ทั้งหมด') {
      result = result.filter(item => item.category === filterCategory);
    }

    // 5. Sorting
    result.sort((a, b) => {
      const getYear = (code) => {
        const parts = String(code || '').split('/');
        if (parts.length >= 2) return parseInt(parts[1]) || 0;
        return 0;
      };

      switch (sortBy) {
        case 'code-asc':
          return (a.asset_code || '').localeCompare(b.asset_code || '');
        case 'year-desc':
          return getYear(b.asset_code) - getYear(a.asset_code);
        case 'year-asc':
          return getYear(a.asset_code) - getYear(b.asset_code);
        case 'cost-desc':
          return (b.unit_price || 0) - (a.unit_price || 0);
        case 'cost-asc':
          return (a.unit_price || 0) - (b.unit_price || 0);
        case 'bookvalue-desc':
          return (b.book_value || 0) - (a.book_value || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [assets, search, filterStatus, filterCategory, sortBy]);

  // Clean event handlers that reset pagination to prevent dual render passes
  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setFilterCategory(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterStatus('ทั้งหมด');
    setFilterCategory('ทั้งหมด');
    setSortBy('code-asc');
    setCurrentPage(1);
  };

  const itemsPerPage = 8;
  const totalItems = processedAssets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedAssets.slice(startIndex, startIndex + itemsPerPage);
  }, [processedAssets, currentPage]);

  const toggleMenu = (id) => {
    setOpenMenuId(prev => prev === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  return {
    search,
    filterStatus,
    filterCategory,
    sortBy,
    currentPage,
    openMenuId,
    categories,
    totalItems,
    totalPages,
    paginatedAssets,
    handleSearchChange,
    handleStatusChange,
    handleCategoryChange,
    handleSortChange,
    handleClearFilters,
    setCurrentPage,
    toggleMenu,
    closeMenu
  };
}
