export default function CustodiansTab({ custodians = [], onEdit, onDelete }) {
  return (
    <div className="layout-card table-data-card animate-fade-in">
      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>ตำแหน่ง</th>
              <th>กอง (Division)</th>
              <th>ฝ่าย/แผนก (Department)</th>
              <th>e-mail (SSO Link)</th>
              <th className="text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {custodians.length > 0 ? (
              custodians.map(cust => (
                <tr key={cust.id} className="table-row-hover">
                  <td>
                    <span className="cust-row-name">{cust.name}</span>
                  </td>
                  <td>{cust.position || '-'}</td>
                  <td>{cust.division || '-'}</td>
                  <td>{cust.department || '-'}</td>
                  <td><code style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>{cust.email || '-'}</code></td>
                  <td className="text-center">
                    <div className="table-actions">
                      <button className="btn-table-edit" onClick={() => onEdit(cust)}>
                        ✏️ แก้ไข
                      </button>
                      <button className="btn-table-delete" onClick={() => onDelete(cust)}>
                        🗑️ ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="table-empty-row">
                  ไม่มีข้อมูลผู้รับผิดชอบดูแล (กรุณากดปุ่มเพิ่มด้านขวาบน)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
