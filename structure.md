# Project Structure - Inventory & Asset Management System

This document outlines the directory layout, key components, custom state hooks, and utility modules of the React + Vite codebase.

---

## Directory Tree

```
inventory/
├── public/                     # Static public assets (Vite)
├── src/                        # Main React application source
│   ├── assets/                 # Icons, images, and brand svg files
│   ├── components/             # React presentation & layout components
│   │   ├── asset/              # Asset list table, forms, and custodian log panels
│   │   ├── repair/             # Repair requests, job lists, and actions
│   │   ├── report/             # Official local government พ.ด. 1, 2, and 3 reports
│   │   ├── template/           # A4 print-ready memo and register templates
│   │   ├── AuditLogPanel.jsx   # Action auditing dashboard
│   │   ├── BaseLayout.jsx      # Overall sidebar + header frame
│   │   ├── BentoDashboard.jsx  # Metrics and statistics dashboard layout
│   │   ├── CenteredLanding.jsx # Landing panel with instant search bar
│   │   └── SettingsPanel.jsx   # Options management, print settings, and backup/restore
│   ├── hooks/                  # Custom state hooks orchestrating application flows
│   │   ├── useAppLayout.js     # Manages active tabs, modal states, and dark mode toggling
│   │   ├── useAssetForm.js     # Manages new/editing asset form validation and schema packaging
│   │   ├── useAssetTable.js    # Manages sorting, filters, search, and table pagination
│   │   └── useInventory.js     # Handles database CRUD, options lists, file import/export, and audit logs
│   ├── utils/                  # Helper utilities and calculation engines
│   │   ├── csvParser.js        # CSV string parser mapping Thai and English headers
│   │   ├── dateUtils.js        # Thai year/date translation and formatting utilities
│   │   ├── depreciation.js     # Straight-line depreciation calculation logic
│   │   └── mockData.js         # Default database seeds for testing
│   ├── App.css                 # Local stylesheet overrides
│   ├── App.jsx                 # Entry Component and modal container manager
│   ├── index.css               # Global theme variables
│   ├── main.jsx                # React app renderer entrypoint
│   └── style.css               # Main visual styling guidelines, dark mode, and layout rules
├── Ai.md                       # AI assistant behavioral guidelines
├── DATA_MODEL.md               # Database schemas, field constraints, and calculations documentation
├── eslint.config.js            # Linter rules config
├── index.html                  # Core HTML mount page
├── package.json                # Project dependencies and building scripts
├── README.md                   # Setup and usage guide
└── vite.config.js              # Vite bundler configuration
```

---

## Detailed Component Specifications

### 1. View & Layout Components (`src/components/`)

- **[BaseLayout.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/BaseLayout.jsx)**: Establishes the workspace canvas, wrapping the main layout in a responsive sidebar navigation and action header.
- **[BentoDashboard.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/BentoDashboard.jsx)**: Provides aggregated metrics (e.g., total asset value, damaged count, division distributions) arranged in an animated grid.
- **[CenteredLanding.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/CenteredLanding.jsx)**: Serves as the initial screen with a Google-like search bar allowing instant code/name queries.
- **[SettingsPanel.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/SettingsPanel.jsx)**: Orchestrates configuration sections (custodians database, departments list, positions, locations, brand options, print headers, and the JSON/CSV Backup and Import dashboard).
- **[AuditLogPanel.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/AuditLogPanel.jsx)**: Lists actions performed in the system (adds, updates, deletions) with log exporting.

#### Asset Register Module (`src/components/asset/`)
- **[AssetTable.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/asset/AssetTable.jsx)**: Renders the primary tabular display, providing search filtering, status tagging, sort controls, and row action radial menus.
- **[AssetForm.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/asset/AssetForm.jsx)**: A detailed form handling inputs for both **พ.ด.1** (Land and buildings) and **พ.ด.2** (Equipment and vehicles) registers.
- **[CustodianHistoryModal.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/asset/CustodianHistoryModal.jsx)**: Handles custody transfers and logs history events.

#### Repair Module (`src/components/repair/`)
- **[GetRepair.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/repair/GetRepair.jsx)**: Modal for issuing repair tickets, documenting repair costs, and contractor assignments.
- **[RepairJobs.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/repair/RepairJobs.jsx)**: Tracks pending, in-progress, and resolved repair tickets.

#### Report & Printing Templates (`src/components/report/` & `src/components/template/`)
- **[ReportPanel.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/report/ReportPanel.jsx)**: Compiles registers into printable official A4 landscape records for พ.ด.1, พ.ด.2, and พ.ด.3 summaries.
- **[InventoryPrint.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/template/InventoryPrint.jsx)**: Generates print layout for individual asset sheets.
- **[MemoPrintLayoutVertical.jsx](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/components/template/MemoPrintLayoutVertical.jsx)**: Official vertical memo format for repair approval requests.

---

### 2. State Hooks (`src/hooks/`)

- **[useInventory.js](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/hooks/useInventory.js)**: Holds the core local storage state, CRUD mutations, audit log tracking, dynamic master option lists additions, and JSON/CSV importing.
- **[useAssetForm.js](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/hooks/useAssetForm.js)**: Packages raw form values, validating inputs against mandatory parameters before calling save handlers.
- **[useAssetTable.js](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/hooks/useAssetTable.js)**: Runs page calculations, filters assets list matching search query tokens, sorts matching rows, and divides results into pages.
- **[useAppLayout.js](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/hooks/useAppLayout.js)**: Handles routing, navigation drawers, overlay switches, and theme state.

---

### 3. Computation & Formatting Utilities (`src/utils/`)

- **[csvParser.js](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/utils/csvParser.js)**: Maps CSV text rows to standard database keys, supporting Thai column header aliases from Microsoft Excel spreadsheets.
- **[depreciation.js](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/utils/depreciation.js)**: Calculates annual straight-line depreciation rates, accumulated figures, and net book value down to a 1.00 Baht minimum salvage limit.
- **[dateUtils.js](file:///c:/Users/hsc2s/OneDrive/Apps/inventory/src/utils/dateUtils.js)**: Translates Date strings to Thai Buddhist Era dates and formats timestamps.
