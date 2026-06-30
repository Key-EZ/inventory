import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateDepreciation } from './depreciation.js';
import mysql from 'mysql2/promise';

let pool = null;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultDivisions = [
  "กองสาธารณสุขและสิ่งแวดล้อม",
  "สำนักปลัดเทศบาล",
  "กองคลัง",
  "กองช่าง"
];

const defaultDepartments = [
  "ฝ่ายพัฒนาระบบ",
  "ฝ่ายธุรการทั่วไป",
  "ฝ่ายการเงินและบัญชี",
  "งานแผนและวิเคราะห์"
];

const defaultCustodians = [
  {
    id: "cust-1",
    name: "นายสมชาย ใจดี",
    position: "นักวิเคราะห์ระบบ",
    division: "กองสาธารณสุขและสิ่งแวดล้อม",
    department: "ฝ่ายพัฒนาระบบ",
    email: "somchai.j@office.go.th"
  },
  {
    id: "cust-2",
    name: "นางสาวสมศรี รักงาน",
    position: "เจ้าพนักงานธุรการ",
    division: "สำนักปลัดเทศบาล",
    department: "ฝ่ายธุรการทั่วไป",
    email: "somsri.r@office.go.th"
  },
  {
    id: "cust-3",
    name: "นายสมศักดิ์ รักชาติ",
    position: "ผู้เชี่ยวชาญเฉพาะด้าน",
    division: "สำนักปลัดเทศบาล",
    department: "ฝ่ายธุรการทั่วไป",
    email: "somsak.r@office.go.th"
  },
  {
    id: "cust-4",
    name: "นายอานนท์ เฝ้าระวัง",
    position: "เจ้าหน้าที่รักษาความปลอดภัย",
    division: "สำนักปลัดเทศบาล",
    department: "ฝ่ายธุรการทั่วไป",
    email: "arnon.w@office.go.th"
  },
  {
    id: "cust-5",
    name: "นายประหยัด ขับขี่",
    position: "พนักงานขับรถยนต์",
    division: "สำนักปลัดเทศบาล",
    department: "ฝ่ายธุรการทั่วไป",
    email: "prayad.k@office.go.th"
  },
  {
    id: "cust-6",
    name: "นางสาววิภา พัฒนา",
    position: "นักวิชาการเงินและบัญชี",
    division: "กองคลัง",
    department: "ฝ่ายการเงินและบัญชี",
    email: "wipa.p@office.go.th"
  }
];

const defaultPositions = [
  "นักวิชาการคอมพิวเตอร์",
  "เจ้าพนักงานธุรการ",
  "นักวิเคราะห์นโยบายและแผน",
  "นักวิชาการเงินและบัญชี",
  "พนักงานขับรถยนต์",
  "นักวิเคราะห์ระบบ",
  "เจ้าหน้าที่รักษาความปลอดภัย",
  "ผู้เชี่ยวชาญเฉพาะด้าน"
];

const defaultBrands = [
  "Dell",
  "HP",
  "Daikin",
  "Concept Furniture",
  "Hikvision",
  "Toyota",
  "Modernform",
  "HIP"
];

const defaultLocations = [
  "ห้องธุรการทั่วไป",
  "ห้องทำงานเทคโนโลยีสารสนเทศ",
  "ห้องทำงานผู้ว่าราชการ",
  "ห้องประชุมใหญ่ ชั้น 3",
  "โรงจอดรถยนต์กลาง",
  "ห้องทำงานการคลัง",
  "ระเบียงทางเดิน อาคาร 1",
  "หน้าประตูทางเข้าสำนักงาน",
  "ถนนรัตนาธิเบศร์ ตำบลบางกระสอ อำเภอเมืองนนทบุรี",
  "ลานกิจกรรมกลาง เทศบาลนครนนทบุรี"
];

const defaultLandBuildingCategories = [
  'ที่ดินที่มีกรรมสิทธิ์',
  'อาคารสำนักงาน',
  'สิ่งปลูกสร้าง'
];

const defaultEquipmentCategories = [
  'ครุภัณฑ์สำนักงาน',
  'ครุภัณฑ์คอมพิวเตอร์',
  'ครุภัณฑ์ยานพาหนะและขนส่ง',
  'ครุภัณฑ์ไฟฟ้าและวิทยุ',
  'ครุภัณฑ์โฆษณาและเผยแพร่',
  'ครุภัณฑ์งานบ้านงานครัว',
  'ครุภัณฑ์วิทยาศาสตร์และการแพทย์',
  'ครุภัณฑ์กีฬา',
  'สินทรัพย์ไม่มีตัวตนอื่น'
];

const defaultCategoryDepreciationYears = {
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

const defaultAgencies = [
  "เทศบาลนครนนทบุรี",
  "งบพัฒนาท้องถิ่น",
  "งบดำเนินงานสำนักปลัด",
  "งบดำเนินงานปกติ",
  "สำนักปลัดเทศบาล",
  "กองคลัง",
  "กองช่าง",
  "กองสาธารณสุขและสิ่งแวดล้อม",
  "กองการศึกษา",
  "กองช่างสุขาภิบาล"
];

const defaultSellers = [
  "บจก. เอสเอสพี คอมพิวเตอร์",
  "บจก. ดีลักซ์ ซิสเต็มส์",
  "หจก. นนทบุรีการค้า",
  "บจก. ยานยนต์รุ่งเรือง",
  "บจก. นนท์ไอที โซลูชั่น",
  "สำนักงานที่ดินจังหวัดนนทบุรี"
];

const initialAssetsRaw = [
  {
    asset_type: "LAND_BUILDING",
    category: "ที่ดินที่มีกรรมสิทธิ์",
    asset_code: "101/64/0001",
    name: "ที่ดินที่ทำการสำนักงานเทศบาลนครนนทบุรี",
    location: "ถนนรัตนาธิเบศร์ ตำบลบางกระสอ อำเภอเมืองนนทบุรี",
    acquisition_method: "รับโอน",
    delivery_document_no: "นบ 0023/154",
    delivery_document_date: "2021-03-12",
    seller_name: "สำนักงานที่ดินจังหวัดนนทบุรี",
    unit_price: 15000000.00,
    budget_owner: "เทศบาลนครนนทบุรี",
    responsible_department: "สำนักปลัดเทศบาล",
    document_of_title: "โฉนดที่ดิน เลขที่ 12456",
    area_size: "5 ไร่ 2 งาน 40 ตารางวา",
    building_style: "ที่ดินเปล่าไม่มีอาคาร",
    maintenances: []
  },
  {
    asset_type: "LAND_BUILDING",
    category: "อาคารสำนักงาน",
    asset_code: "102/65/0002",
    name: "อาคารหอประชุมอเนกประสงค์ 3 ชั้น",
    location: "ลานกิจกรรมกลาง เทศบาลนครนนทบุรี",
    acquisition_method: "จ้าง",
    delivery_document_no: "15/2565",
    delivery_document_date: "2022-02-10",
    seller_name: "หจก. นนทบุรีการค้า",
    unit_price: 8400000.00,
    budget_owner: "งบพัฒนาท้องถิ่น",
    responsible_department: "กองช่าง",
    document_of_title: "- (สร้างบนที่ราชพัสดุ)",
    area_size: "พื้นที่ใช้สอย 1,200 ตารางเมตร",
    building_style: "อาคารคอนกรีตเสริมเหล็ก (ตึก) 3 ชั้น",
    maintenances: [
      {
        id: "maint-101",
        approval_date: "2024-05-12",
        document_number: "อนุมัติเลขที่ 145/2567",
        description: "ปรับปรุงระบบกันซึมดาดฟ้าและทาสีภายนอกอาคารใหม่",
        cost: 250000.00,
        contractor: "หจก. นนทบุรีการช่าง"
      }
    ]
  },
  {
    asset_type: "EQUIPMENT",
    category: "ครุภัณฑ์คอมพิวเตอร์",
    asset_code: "412/67/0001",
    name: "เครื่องคอมพิวเตอร์พกพา (Notebook)",
    location: "ห้องทำงานเทคโนโลยีสารสนเทศ",
    acquisition_method: "ซื้อ",
    delivery_document_no: "PO-670315",
    delivery_document_date: "2024-03-15",
    seller_name: "บจก. เอสเอสพี คอมพิวเตอร์",
    unit_price: 32000.00,
    budget_owner: "งบดำเนินงานสำนักปลัด",
    responsible_department: "ฝ่ายพัฒนาระบบ",
    manufacturer_brand: "Dell",
    serial_number: "CN-0V0G25-72487-34F-0012",
    engine_number: "",
    chassis_number: "",
    vehicle_registration: "",
    color: "สีเทา Space Gray",
    warranty_start_date: "2024-03-15",
    warranty_end_date: "2027-03-15",
    warranty_company: "บจก. เอสเอสพี คอมพิวเตอร์",
    maintenances: [
      {
        id: "maint-201",
        approval_date: "2025-01-10",
        document_number: "อนุมัติเลขที่ ไอที 12/2568",
        description: "เปลี่ยนคีย์บอร์ดที่ชำรุดและอัพเกรด RAM เป็น 32GB",
        cost: 4800.00,
        contractor: "ร้านคอมพิวเตอร์เซอร์วิส นนทบุรี"
      }
    ]
  },
  {
    asset_type: "EQUIPMENT",
    category: "ครุภัณฑ์สำนักงาน",
    asset_code: "311/68/0008",
    name: "เก้าอี้ทำงานสำนักงานเพื่อสุขภาพ",
    location: "ห้องธุรการทั่วไป",
    acquisition_method: "ซื้อ",
    delivery_document_no: "นบ 0023/108",
    delivery_document_date: "2025-01-10",
    seller_name: "บจก. ดีลักซ์ ซิสเต็มส์",
    unit_price: 6500.00,
    budget_owner: "งบดำเนินงานปกติ",
    responsible_department: "ฝ่ายธุรการทั่วไป",
    manufacturer_brand: "Modernform",
    serial_number: "MF-ERGO-2025010",
    engine_number: "",
    chassis_number: "",
    vehicle_registration: "",
    color: "สีดำพนักตาข่าย",
    warranty_start_date: "2025-01-10",
    warranty_end_date: "2028-01-10",
    warranty_company: "บจก. ดีลักซ์ ซิสเต็มส์",
    maintenances: []
  },
  {
    asset_type: "EQUIPMENT",
    category: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
    asset_code: "313/66/0014",
    name: "เครื่องปรับอากาศ 18000 BTU Inverter",
    location: "ห้องทำงานผู้ว่าราชการ",
    acquisition_method: "ซื้อ",
    delivery_document_no: "e-bidding 45/2566",
    delivery_document_date: "2023-06-20",
    seller_name: "บจก. ดีลักซ์ ซิสเต็มส์",
    unit_price: 28900.00,
    budget_owner: "งบลงทุนครุภัณฑ์",
    responsible_department: "ฝ่ายธุรการทั่วไป",
    manufacturer_brand: "Daikin",
    serial_number: "DK-FTKM18-55410",
    engine_number: "",
    chassis_number: "",
    vehicle_registration: "",
    color: "สีขาว",
    warranty_start_date: "2023-06-20",
    warranty_end_date: "2028-06-20",
    warranty_company: "บจก. ดีลักซ์ ซิสเต็มส์",
    maintenances: [
      {
        id: "maint-202",
        approval_date: "2024-06-15",
        document_number: "ล้างและเติมน้ำยาประจำปี",
        description: "บริการล้างแอร์ เติมน้ำยารั่วซึม และซ่อมบอร์ดมอเตอร์คอยล์เย็น",
        cost: 2500.00,
        contractor: "ร้านแอร์เจริญยนต์นนทบุรี"
      }
    ]
  },
  {
    asset_type: "EQUIPMENT",
    category: "ครุภัณฑ์สำนักงาน",
    asset_code: "311/65/0003",
    name: "โต๊ะประชุมไม้ ขนาด 12 ที่นั่ง",
    location: "ห้องประชุมใหญ่ ชั้น 3",
    acquisition_method: "จ้าง",
    delivery_document_no: "QT-20220218",
    delivery_document_date: "2022-02-18",
    seller_name: "หจก. นนทบุรีการค้า",
    unit_price: 24500.00,
    budget_owner: "งบครุภัณฑ์สำนักงาน",
    responsible_department: "ฝ่ายการเงินและบัญชี",
    manufacturer_brand: "Concept Furniture",
    serial_number: "CF-MT240-2022",
    engine_number: "",
    chassis_number: "",
    vehicle_registration: "",
    color: "สีลายไม้สักทอง",
    warranty_start_date: "2022-02-18",
    warranty_end_date: "2023-02-18",
    warranty_company: "หจก. นนทบุรีการค้า",
    maintenances: []
  },
  {
    asset_type: "EQUIPMENT",
    category: "ครุภัณฑ์ยานพาหนะและขนส่ง",
    asset_code: "312/64/0001",
    name: "รถยนต์อเนกประสงค์ (SUV) 2,400 ซีซี",
    location: "โรงจอดรถยนต์กลาง",
    acquisition_method: "ซื้อ",
    delivery_document_no: "e-bidding 12/2564",
    delivery_document_date: "2021-08-12",
    seller_name: "บจก. ยานยนต์รุ่งเรือง",
    unit_price: 1390000.00,
    budget_owner: "งบลงทุนจัดหายานพาหนะ",
    responsible_department: "ฝ่ายธุรการทั่วไป",
    manufacturer_brand: "Toyota",
    serial_number: "TOY-SUV-FT-6408",
    engine_number: "2GD-FTV-124586",
    chassis_number: "MR053K41208945",
    vehicle_registration: "กข-5642 นนทบุรี",
    color: "สีบรอนซ์เงิน",
    warranty_start_date: "2021-08-12",
    warranty_end_date: "2024-08-12",
    warranty_company: "บจก. ยานยนต์รุ่งเรือง",
    maintenances: [
      {
        id: "maint-301",
        approval_date: "2023-10-15",
        document_number: "อนุมัติซ่อมเลขที่ 45/2566",
        description: "เปลี่ยนยางรถยนต์ 4 เส้น และเช็คระยะรอบ 80,000 กม.",
        cost: 28000.00,
        contractor: "ศูนย์บริการโตโยต้านนทบุรี"
      },
      {
        id: "maint-302",
        approval_date: "2024-03-20",
        document_number: "ใบเสร็จเลขที่ 5894",
        description: "เปลี่ยนแบตเตอรี่รถยนต์และซ่อมเปลี่ยนไดชาร์จ",
        cost: 7500.00,
        contractor: "ร้านบี-ควิก สาขารัตนาธิเบศร์"
      }
    ]
  },
  {
    asset_type: "EQUIPMENT",
    category: "ครุภัณฑ์คอมพิวเตอร์",
    asset_code: "412/68/0012",
    name: "เครื่องพิมพ์มัลติฟังก์ชัน เลเซอร์",
    location: "ห้องทำงานเทคโนโลยีสารสนเทศ",
    acquisition_method: "ซื้อ",
    delivery_document_no: "IV-20250320",
    delivery_document_date: "2025-03-20",
    seller_name: "บจก. เอสเอสพี คอมพิวเตอร์",
    unit_price: 18500.00,
    budget_owner: "งบดำเนินงานสอยเขียน",
    responsible_department: "ฝ่ายพัฒนาระบบ",
    manufacturer_brand: "HP",
    serial_number: "HP-LJP-M428-99885",
    engine_number: "",
    chassis_number: "",
    vehicle_registration: "",
    color: "สีขาว-เทา",
    warranty_start_date: "2025-03-20",
    warranty_end_date: "2027-03-20",
    warranty_company: "บจก. เอสเอสพี คอมพิวเตอร์",
    maintenances: []
  }
];

const SEED_DATE_1 = '2026-06-17T08:30:00.000Z';
const SEED_DATE_2 = '2026-06-16T14:15:00.000Z';

export const getDefaultData = () => {
  const assets = initialAssetsRaw.map((asset, index) => {
    const dep = calculateDepreciation(
      asset.asset_code,
      asset.unit_price,
      asset.category,
      defaultCategoryDepreciationYears
    );
    const statusVal = index === 5 ? 'ชำรุด' : index === 6 ? 'รอจำหน่าย' : 'ใช้งาน';

    return {
      id: `asset-${Date.now()}-${index}`,
      asset_type: asset.asset_type,
      category: asset.category,
      asset_code: asset.asset_code,
      name: asset.name,
      location: asset.location,
      acquisition_method: asset.acquisition_method,
      delivery_document_no: asset.delivery_document_no || '',
      delivery_document_date: asset.delivery_document_date || '',
      seller_name: asset.seller_name || '',
      unit_price: asset.unit_price,
      budget_owner: asset.budget_owner,
      responsible_department: asset.responsible_department,
      status: statusVal,

      // Ph.D.1 Specific
      document_of_title: asset.document_of_title || '',
      area_size: asset.area_size || '',
      building_style: asset.building_style || '',

      // Ph.D.2 Specific
      manufacturer_brand: asset.manufacturer_brand || '',
      serial_number: asset.serial_number || '',
      engine_number: asset.engine_number || '',
      chassis_number: asset.chassis_number || '',
      vehicle_registration: asset.vehicle_registration || '',
      color: asset.color || '',
      warranty_start_date: asset.warranty_start_date || '',
      warranty_end_date: asset.warranty_end_date || '',
      warranty_company: asset.warranty_company || '',

      // Depreciations
      depreciation_rate_percent: dep.depreciationRatePercent,
      accumulated_depreciation: dep.accumulatedDepreciation,
      book_value: dep.bookValue,

      // Maintenances
      maintenances: asset.maintenances || []
    };
  });

  const dellAsset = assets.find(a => a.asset_code === '412/67/0001');
  const toyotaAsset = assets.find(a => a.asset_code === '312/64/0001');
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

  return {
    assets,
    divisions: defaultDivisions,
    departments: defaultDepartments,
    custodians: defaultCustodians,
    positions: defaultPositions,
    brands: defaultBrands,
    locations: defaultLocations,
    landBuildingCategories: defaultLandBuildingCategories,
    equipmentCategories: defaultEquipmentCategories,
    categoryDepreciationYears: defaultCategoryDepreciationYears,
    agencies: defaultAgencies,
    sellers: defaultSellers,
    auditLogs: [
      {
        id: `log-${Date.now()}-seed`,
        timestamp: new Date().toISOString(),
        action: 'ระบบ',
        details: 'เริ่มต้นระบบและโหลดข้อมูลตัวอย่าง',
        user: 'ระบบ'
      }
    ],
    repairRequests: seedReqs,
    landingBadgeText: 'ระบบดิจิทัลบริหารทรัพย์สิน',
    // Default admin settings
    adminUser: {
      username: 'admin',
      password: 'admin1234'
    }
  };
};

export const initMysql = async () => {
  const host = process.env.DB_HOST || '192.168.1.12';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '40753';
  const port = parseInt(process.env.DB_PORT || '3306');
  const database = process.env.DB_NAME || 'inventory';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);
  
  // 1. Connect without database to ensure database exists
  const connection = await mysql.createConnection({ host, user, password, port });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();

  // 2. Create connection pool with database
  pool = mysql.createPool({
    host,
    user,
    password,
    port,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // 3. Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kv_store (
      \`key\` VARCHAR(100) PRIMARY KEY,
      \`value\` LONGTEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('MySQL initialization completed successfully.');

  // 4. Seed initial data if kv_store is empty
  const [rows] = await pool.query('SELECT `value` FROM kv_store WHERE `key` = "app_data"');
  if (rows.length === 0) {
    console.log('Seeding initial mock data to MySQL...');
    const defaultData = getDefaultData();
    await writeDb(defaultData);
  }
};

export const readDb = async () => {
  if (!pool) {
    throw new Error('MySQL connection pool is not initialized. Call initMysql() first.');
  }
  try {
    const [rows] = await pool.query('SELECT `value` FROM kv_store WHERE `key` = "app_data"');
    if (rows.length === 0) {
      const defaultData = getDefaultData();
      await writeDb(defaultData);
      return defaultData;
    }
    return JSON.parse(rows[0].value);
  } catch (error) {
    console.error('Failed to read database from MySQL, returning default data', error);
    return getDefaultData();
  }
};

export const writeDb = async (data) => {
  if (!pool) {
    throw new Error('MySQL connection pool is not initialized. Call initMysql() first.');
  }
  try {
    const jsonStr = JSON.stringify(data);
    await pool.query(
      'INSERT INTO kv_store (`key`, `value`) VALUES ("app_data", ?) ON DUPLICATE KEY UPDATE `value` = ?',
      [jsonStr, jsonStr]
    );
    return true;
  } catch (error) {
    console.error('Failed to write database to MySQL', error);
    return false;
  }
};
