import { useState, useEffect } from 'react';

export default function useAppLayout() {
  const [activeLayout, setActiveLayout] = useState(() => {
    return localStorage.getItem('inventory_layout') || 'centered';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('inventory_theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [printingAsset, setPrintingAsset] = useState(null);
  const [searchQueryFromLanding, setSearchQueryFromLanding] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAssetForRepair, setSelectedAssetForRepair] = useState(null);
  const [isRepairFormOpen, setIsRepairFormOpen] = useState(false);

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

  const openRepairForm = (asset) => {
    setSelectedAssetForRepair(asset);
    setIsRepairFormOpen(true);
  };

  const closeRepairForm = () => {
    setSelectedAssetForRepair(null);
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
    searchQueryFromLanding,
    isMobileMenuOpen,
    selectedAssetForRepair,
    isRepairFormOpen,
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
  };
}
