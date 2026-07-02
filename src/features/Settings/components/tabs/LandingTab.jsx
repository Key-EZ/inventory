import { useState, useEffect } from 'react';

export default function LandingTab({ landingBadgeText, onSaveLandingBadge }) {
  const [landingBadgeInput, setLandingBadgeInput] = useState(landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');

  useEffect(() => {
    setLandingBadgeInput(landingBadgeText || 'ระบบดิจิทัลบริหารทรัพย์สิน');
  }, [landingBadgeText]);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveLandingBadge(landingBadgeInput);
    alert('บันทึกข้อความป้ายชื่อหน้าแรกสำเร็จ');
  };

  return (
    <div className="layout-card animate-fade-in" style={{ maxWidth: '600px' }}>
      <h3>🏷️ ตั้งค่าป้ายข้อความหน้าแรก</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
        ข้อความขนาดใหญ่ที่จะแสดงบนส่วน Centered Landing (แถบค้นหาด่วน)
      </p>

      <form onSubmit={handleSave} className="settings-inline-add-form">
        <input
          type="text"
          value={landingBadgeInput}
          onChange={(e) => setLandingBadgeInput(e.target.value)}
          placeholder="เช่น ระบบดิจิทัลบริหารทรัพย์สิน"
          className="filter-input-element"
          style={{ width: '100%' }}
        />
        <button type="submit" className="button-primary" style={{ padding: '8px 20px', whiteSpace: 'nowrap' }}>
          บันทึก
        </button>
      </form>
    </div>
  );
}
