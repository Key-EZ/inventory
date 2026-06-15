import { calculateDepreciation } from './depreciation';

const initialAssetsRaw = [
  {
    general_info: {
      asset_name: "เครื่องคอมพิวเตอร์พกพา (Notebook)",
      asset_type: "ครุภัณฑ์คอมพิวเตอร์",
      brand: "Dell",
      model: "Latitude 5440",
      description: "จอแสดงผล 14 นิ้ว, CPU Core i5, RAM 16GB, SSD 512GB สำหรับใช้งานวิเคราะห์ระบบ"
    },
    source_and_value: {
      acquisition_date: "2024-03-15",
      procurement_method: "วิธีเฉพาะเจาะจง",
      cost_price: 32000.00,
      receipt_number: "REC-670315"
    },
    usage: {
      asset_id: "คร.67/2024/001",
      location: "ห้องทำงานเทคโนโลยีสารสนเทศ",
      custodian: "นายสมชาย ใจดี",
      status: "ใช้งาน"
    },
    financial_status: {
      depreciation_rate_percent: 20.00
    }
  },
  {
    general_info: {
      asset_name: "เก้าอี้ทำงานสำนักงานเพื่อสุขภาพ",
      asset_type: "ครุภัณฑ์สำนักงาน",
      brand: "Modernform",
      model: "Ergo-Comfort",
      description: "เก้าอี้สุขภาพ เบาะผ้าปรับระดับได้ พนักพิงตาข่าย มีพยุงหลังส่วนล่าง"
    },
    source_and_value: {
      acquisition_date: "2025-01-10",
      procurement_method: "วิธีเฉพาะเจาะจง",
      cost_price: 6500.00,
      receipt_number: "IV-2025010"
    },
    usage: {
      asset_id: "คร.68/2025/008",
      location: "ห้องธุรการทั่วไป",
      custodian: "นางสาวสมศรี รักงาน",
      status: "ใช้งาน"
    },
    financial_status: {
      depreciation_rate_percent: 10.00
    }
  },
  {
    general_info: {
      asset_name: "เครื่องปรับอากาศ 18000 BTU",
      asset_type: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
      brand: "Daikin",
      model: "FTKM18SV2S",
      description: "เครื่องปรับอากาศติดผนัง ระบบอินเวอร์เตอร์ ประหยัดไฟเบอร์ 5"
    },
    source_and_value: {
      acquisition_date: "2023-06-20",
      procurement_method: "ประกวดราคาอิเล็กทรอนิกส์ (e-bidding)",
      cost_price: 28900.00,
      receipt_number: "TAX-230620"
    },
    usage: {
      asset_id: "คร.66/2023/014",
      location: "ห้องทำงานผู้ว่าราชการ",
      custodian: "นายสมศักดิ์ รักชาติ",
      status: "ใช้งาน"
    },
    financial_status: {
      depreciation_rate_percent: 20.00
    }
  },
  {
    general_info: {
      asset_name: "โต๊ะประชุมไม้ ขนาด 12 ที่นั่ง",
      asset_type: "ครุภัณฑ์สำนักงาน",
      brand: "Concept Furniture",
      model: "MT-240",
      description: "โครงไม้สักแท้หน้าท็อปหุ้มเมลามีนกันรอย ขนาด 2.4 x 1.2 เมตร"
    },
    source_and_value: {
      acquisition_date: "2022-02-18",
      procurement_method: "ประกวดราคาอิเล็กทรอนิกส์ (e-bidding)",
      cost_price: 24500.00,
      receipt_number: "QT-20220218"
    },
    usage: {
      asset_id: "คร.65/2022/003",
      location: "ห้องประชุมใหญ่ ชั้น 3",
      custodian: "นางสาววิภา พัฒนา",
      status: "ชำรุด"
    },
    financial_status: {
      depreciation_rate_percent: 10.00
    }
  },
  {
    general_info: {
      asset_name: "กล้องวงจรปิด CCTV IP Camera",
      asset_type: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
      brand: "Hikvision",
      model: "DS-2CD2043G2",
      description: "กล้องไอพีภายนอก ความละเอียด 4 ล้านพิกเซล เลนส์ 2.8mm รองรับ PoE"
    },
    source_and_value: {
      acquisition_date: "2024-09-05",
      procurement_method: "วิธีเฉพาะเจาะจง",
      cost_price: 3400.00,
      receipt_number: "INV-670905"
    },
    usage: {
      asset_id: "คร.67/2024/045",
      location: "ระเบียงทางเดิน อาคาร 1",
      custodian: "นายอานนท์ เฝ้าระวัง",
      status: "ใช้งาน"
    },
    financial_status: {
      depreciation_rate_percent: 20.00
    }
  },
  {
    general_info: {
      asset_name: "รถยนต์อเนกประสงค์ (SUV)",
      asset_type: "ครุภัณฑ์ยานพาหนะและขนส่ง",
      brand: "Toyota",
      model: "Fortuner 2.4V",
      description: "เครื่องยนต์ดีเซล 2,400 ซีซี เกียร์อัตโนมัติ สำหรับใช้ในงานราชการและตรวจพื้นที่"
    },
    source_and_value: {
      acquisition_date: "2021-08-12",
      procurement_method: "ประกวดราคาอิเล็กทรอนิกส์ (e-bidding)",
      cost_price: 1390000.00,
      receipt_number: "TOY-640812"
    },
    usage: {
      asset_id: "คร.64/2021/001",
      location: "โรงจอดรถยนต์กลาง",
      custodian: "นายประหยัด ขับขี่",
      status: "รอจำหน่าย"
    },
    financial_status: {
      depreciation_rate_percent: 20.00
    }
  },
  {
    general_info: {
      asset_name: "เครื่องพิมพ์มัลติฟังก์ชัน เลเซอร์",
      asset_type: "ครุภัณฑ์คอมพิวเตอร์",
      brand: "HP",
      model: "LaserJet Pro M428fdw",
      description: "พิมพ์ สแกน ถ่ายเอกสาร แฟกซ์ รองรับการเชื่อมต่อไร้สาย Wi-Fi"
    },
    source_and_value: {
      acquisition_date: "2025-03-20",
      procurement_method: "วิธีเฉพาะเจาะจง",
      cost_price: 18500.00,
      receipt_number: "IV-20250320"
    },
    usage: {
      asset_id: "คร.68/2025/012",
      location: "ห้องทำงานเทคโนโลยีสารสนเทศ",
      custodian: "นายสมชาย ใจดี",
      status: "ใช้งาน"
    },
    financial_status: {
      depreciation_rate_percent: 20.00
    }
  },
  {
    general_info: {
      asset_name: "เครื่องตรวจวัดอุณหภูมิสแกนใบหน้า",
      asset_type: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
      brand: "HIP",
      model: "K3 Pro",
      description: "สแกนวัดอุณหภูมิหน้าผากหรือฝ่ามือ พร้อมขาตั้งกล้องอุตสาหกรรม"
    },
    source_and_value: {
      acquisition_date: "2020-05-15",
      procurement_method: "วิธีเฉพาะเจาะจง",
      cost_price: 4800.00,
      receipt_number: "INV-630515"
    },
    usage: {
      asset_id: "คร.63/2020/009",
      location: "หน้าประตูทางเข้าสำนักงาน",
      custodian: "นางสาวสมศรี รักงาน",
      status: "จำหน่ายแล้ว"
    },
    financial_status: {
      depreciation_rate_percent: 20.00
    }
  }
];

// Seed function to calculate initial depreciations
export function getSeedAssets() {
  return initialAssetsRaw.map((asset, index) => {
    const dep = calculateDepreciation(
      asset.source_and_value.acquisition_date,
      asset.source_and_value.cost_price,
      asset.financial_status.depreciation_rate_percent
    );
    return {
      id: `asset-${Date.now()}-${index}`,
      general_info: { ...asset.general_info },
      source_and_value: { ...asset.source_and_value },
      usage: { ...asset.usage },
      financial_status: {
        ...asset.financial_status,
        accumulated_depreciation: dep.accumulated_depreciation,
        book_value: dep.book_value
      }
    };
  });
}

export const defaultDivisions = [
  "กองสาธารณสุขและสิ่งแวดล้อม",
  "สำนักปลัด",
  "กองคลัง"
];

export const defaultDepartments = [
  "ฝ่ายพัฒนาระบบ",
  "ฝ่ายธุรการทั่วไป",
  "ฝ่ายการเงินและบัญชี"
];

export const defaultCustodians = [
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
    division: "สำนักปลัด",
    department: "ฝ่ายธุรการทั่วไป",
    email: "somsri.r@office.go.th"
  },
  {
    id: "cust-3",
    name: "นายสมศักดิ์ รักชาติ",
    position: "ผู้เชี่ยวชาญเฉพาะด้าน",
    division: "สำนักปลัด",
    department: "ฝ่ายธุรการทั่วไป",
    email: "somsak.r@office.go.th"
  },
  {
    id: "cust-4",
    name: "นายอานนท์ เฝ้าระวัง",
    position: "เจ้าหน้าที่รักษาความปลอดภัย",
    division: "สำนักปลัด",
    department: "ฝ่ายธุรการทั่วไป",
    email: "arnon.w@office.go.th"
  },
  {
    id: "cust-5",
    name: "นายประหยัด ขับขี่",
    position: "พนักงานขับรถยนต์",
    division: "สำนักปลัด",
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

export const defaultPositions = [
  "นักวิชาการคอมพิวเตอร์",
  "เจ้าพนักงานธุรการ",
  "นักวิเคราะห์นโยบายและแผน",
  "นักวิชาการเงินและบัญชี",
  "พนักงานขับรถยนต์",
  "นักวิเคราะห์ระบบ",
  "เจ้าหน้าที่รักษาความปลอดภัย",
  "ผู้เชี่ยวชาญเฉพาะด้าน"
];

export const defaultBrands = [
  "Dell",
  "HP",
  "Daikin",
  "Concept Furniture",
  "Hikvision",
  "Toyota",
  "Modernform",
  "HIP"
];

export const defaultLocations = [
  "ห้องธุรการทั่วไป",
  "ห้องทำงานเทคโนโลยีสารสนเทศ",
  "ห้องทำงานผู้ว่าราชการ",
  "ห้องประชุมใหญ่ ชั้น 3",
  "โรงจอดรถยนต์กลาง",
  "ห้องทำงานการคลัง",
  "ระเบียงทางเดิน อาคาร 1",
  "หน้าประตูทางเข้าสำนักงาน"
];
