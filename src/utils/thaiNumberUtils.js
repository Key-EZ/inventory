export function toThaiDigits(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const arabicDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.replace(/[0-9]/g, (match) => thaiDigits[arabicDigits.indexOf(match)]);
}

export function formatThaiFullDate(dateStr) {
  if (!dateStr) return '';
  // Handle ISO datetime strings or YYYY-MM-DD
  const cleanDate = String(dateStr).split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return toThaiDigits(dateStr); // fallback if not YYYY-MM-DD

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const thaiDay = toThaiDigits(day);
  const thaiMonthName = thaiMonths[month - 1] || '';
  const thaiYear = toThaiDigits(year + 543);

  return `${thaiDay} ${thaiMonthName} ${thaiYear}`;
}
