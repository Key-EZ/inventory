import { useState, useEffect } from 'react';

export default function useAppLayout() {
  const [activeLayout, setActiveLayout] = useState(() => {
    const saved = localStorage.getItem('inventory_layout');
    return (saved && saved !== 'reports') ? saved : 'centered';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('inventory_theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [printingAsset, setPrintingAsset] = useState(null);
  const [printingRepairRequest, setPrintingRepairRequest] = useState(null);
  const [searchQueryFromLanding, setSearchQueryFromLanding] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAssetForRepair, setSelectedAssetForRepair] = useState(null);
  const [isRepairFormOpen, setIsRepairFormOpen] = useState(false);
  const [repairActiveTab, setRepairActiveTab] = useState('new_request');

  const [fontScale, setFontScale] = useState(() => {
    return localStorage.getItem('inventory_font_scale') || 'normal';
  });

  // Sync theme to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('inventory_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('inventory_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync typography font scaling to root styles
  useEffect(() => {
    let size = '15px';
    if (fontScale === 'small') size = '13.5px';
    if (fontScale === 'large') size = '17px';
    document.documentElement.style.setProperty('--base-font-size', size);
    localStorage.setItem('inventory_font_scale', fontScale);
  }, [fontScale]);

  const adjustFontScale = (scale) => {
    setFontScale(scale);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const changeLayout = (layout) => {
    setActiveLayout(layout);
    localStorage.setItem('inventory_layout', layout);
    setIsMobileMenuOpen(false);
  };

  const openAddForm = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const openEditForm = (asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const openRepairForm = (asset, initialTab = 'new_request') => {
    setSelectedAssetForRepair(asset);
    setRepairActiveTab(initialTab);
    setIsRepairFormOpen(true);
  };

  const closeRepairForm = () => {
    setSelectedAssetForRepair(null);
    setRepairActiveTab('new_request');
    setIsRepairFormOpen(false);
  };

  const openPrintAsset = (asset) => {
    setPrintingAsset(asset);
  };

  const closePrintAsset = () => {
    setPrintingAsset(null);
  };

  const navigateFromLanding = (layout, searchVal = '') => {
    setSearchQueryFromLanding(searchVal || '');
    changeLayout(layout);
  };

  return {
    activeLayout,
    isDarkMode,
    isFormOpen,
    editingAsset,
    printingAsset,
    printingRepairRequest,
    setPrintingRepairRequest,
    searchQueryFromLanding,
    isMobileMenuOpen,
    selectedAssetForRepair,
    isRepairFormOpen,
    repairActiveTab,
    setIsMobileMenuOpen,
    toggleTheme,
    changeLayout,
    openAddForm,
    openEditForm,
    closeForm,
    openRepairForm,
    closeRepairForm,
    openPrintAsset,
    closePrintAsset,
    navigateFromLanding,
    fontScale,
    adjustFontScale
  };
}
