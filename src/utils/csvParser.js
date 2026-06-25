/**
 * Utility for parsing CSV files and mapping headers to asset schema properties.
 */

const HEADER_MAPPING = {
  // English mappings
  'id': 'id',
  'asset_type': 'asset_type',
  'category': 'category',
  'asset_code': 'asset_code',
  'name': 'name',
  'location': 'location',
  'acquisition_method': 'acquisition_method',
  'delivery_document_no': 'delivery_document_no',
  'delivery_document_date': 'delivery_document_date',
  'seller_name': 'seller_name',
  'unit_price': 'unit_price',
  'budget_owner': 'budget_owner',
  'responsible_department': 'responsible_department',
  'status': 'status',
  'document_of_title': 'document_of_title',
  'area_size': 'area_size',
  'building_style': 'building_style',
  'manufacturer_brand': 'manufacturer_brand',
  'serial_number': 'serial_number',
  'engine_number': 'engine_number',
  'chassis_number': 'chassis_number',
  'vehicle_registration': 'vehicle_registration',
  'color': 'color',
  'warranty_start_date': 'warranty_start_date',
  'warranty_end_date': 'warranty_end_date',
  'warranty_company': 'warranty_company',
  'depreciation_rate_percent': 'depreciation_rate_percent',
  'accumulated_depreciation': 'accumulated_depreciation',
  'book_value': 'book_value',

  // Thai mappings
  'รหัสพัสดุ': 'asset_code',
  'รหัสครุภัณฑ์': 'asset_code',
  'รหัสทรัพย์สิน': 'asset_code',
  'ชื่อพัสดุ': 'name',
  'ชื่อครุภัณฑ์': 'name',
  'ชื่อทรัพย์สิน': 'name',
  'ประเภท': 'asset_type',
  'ประเภททะเบียน': 'asset_type',
  'หมวดหมู่': 'category',
  'หมวดหมู่ย่อย': 'category',
  'ราคาทุนต่อหน่วย': 'unit_price',
  'ราคา': 'unit_price',
  'ราคาต่อหน่วย': 'unit_price',
  'สถานที่ตั้ง': 'location',
  'วิธีการได้มา': 'acquisition_method',
  'เลขที่เอกสารส่งมอบ': 'delivery_document_no',
  'เลขที่เอกสาร': 'delivery_document_no',
  'เลขที่สัญญา': 'delivery_document_no',
  'วันที่เอกสารส่งมอบ': 'delivery_document_date',
  'วันที่เอกสาร': 'delivery_document_date',
  'วันที่สัญญา': 'delivery_document_date',
  'ผู้ขาย': 'seller_name',
  'ผู้ขาย/คู่สัญญา': 'seller_name',
  'คู่สัญญา': 'seller_name',
  'แหล่งงบประมาณ': 'budget_owner',
  'งบประมาณ': 'budget_owner',
  'หน่วยงานรับผิดชอบ': 'responsible_department',
  'ส่วนราชการรับผิดชอบ': 'responsible_department',
  'ส่วนราชการ': 'responsible_department',
  'สถานะ': 'status',
  'เอกสารสิทธิ์': 'document_of_title',
  'โฉนด': 'document_of_title',
  'ขนาดเนื้อที่': 'area_size',
  'เนื้อที่': 'area_size',
  'ลักษณะอาคาร': 'building_style',
  'ลักษณะโครงสร้าง': 'building_style',
  'ยี่ห้อ': 'manufacturer_brand',
  'เครื่องหมายการค้า': 'manufacturer_brand',
  'หมายเลขซีเรียล': 'serial_number',
  'ซีเรียล': 'serial_number',
  'หมายเลขเครื่อง': 'engine_number',
  'หมายเลขตัวถัง': 'chassis_number',
  'เลขทะเบียน': 'vehicle_registration',
  'ทะเบียน': 'vehicle_registration',
  'สี': 'color',
  'วันเริ่มรับประกัน': 'warranty_start_date',
  'วันสิ้นสุดรับประกัน': 'warranty_end_date',
  'บริษัทรับประกัน': 'warranty_company',
  'อัตราค่าเสื่อม': 'depreciation_rate_percent',
  'ค่าเสื่อมสะสม': 'accumulated_depreciation',
  'มูลค่าคงเหลือ': 'book_value',
  'มูลค่าสุทธิ': 'book_value'
};

/**
 * Parses raw CSV text into a 2D array of rows, complying with RFC 4180.
 * Handles double quotes, commas, and newlines correctly.
 * 
 * @param {string} text - Raw CSV text
 * @returns {Array<Array<string>>} List of rows, where each row is a list of cell strings
 */
export function parseCSV(text) {
  const lines = [];
  let row = [""];
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // Skip the second quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  
  return lines;
}

/**
 * Maps raw CSV rows (header + data) to structured asset objects using English/Thai dictionary.
 * 
 * @param {string} csvText - Raw CSV text
 * @returns {Array<Object>} Array of asset objects
 */
export function csvToAssets(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  // Parse header
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const dataRows = rows.slice(1);

  // Map header indices to asset schema keys
  const headerKeys = headers.map(header => {
    // Exact match or fallback mapping
    if (HEADER_MAPPING[header]) {
      return HEADER_MAPPING[header];
    }
    // Check key case-insensitively and trim spaces
    for (const [key, val] of Object.entries(HEADER_MAPPING)) {
      if (key.toLowerCase() === header) {
        return val;
      }
    }
    return null; // unmapped column
  });

  return dataRows
    .filter(row => row.some(cell => cell.trim() !== '')) // skip empty rows
    .map(row => {
      const asset = {};
      row.forEach((cell, idx) => {
        const key = headerKeys[idx];
        if (key) {
          asset[key] = cell.trim();
        }
      });
      return asset;
    });
}
