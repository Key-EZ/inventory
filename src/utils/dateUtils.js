/**
 * Formats a date string (normally ISO format YYYY-MM-DD) into Thai Buddhist calendar format.
 * E.g., "2023-10-15" -> "15 ต.ค. 2566"
 * 
 * @param {string} dateStr - Date string to format
 * @returns {string} Formatted Thai date string
 */
export const formatThaiDateString = (dateStr) => {
  if (!dateStr) return '';
  
  // Check if it's already a Thai date string (contains Thai characters like 'ม.ค.', 'พ.ค.')
  if (/[ก-์]/.test(dateStr)) {
    return dateStr;
  }
  
  // YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0]) || 0;
    const monthIdx = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]) || 0;
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const monthName = thaiMonths[monthIdx] || '';
    const yearBE = year < 2400 ? year + 543 : year;
    return `${day} ${monthName} ${yearBE}`;
  }
  
  // Fallback to DD/MM/YYYY
  const slashParts = dateStr.split('/');
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0]) || 0;
    const monthIdx = parseInt(slashParts[1]) - 1;
    const year = parseInt(slashParts[2]) || 0;
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const monthName = thaiMonths[monthIdx] || '';
    const yearBE = year < 2400 ? year + 543 : year;
    return `${day} ${monthName} ${yearBE}`;
  }
  
  return dateStr;
};
