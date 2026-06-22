import { useEffect } from 'react';
import { formatThaiDateString } from '../../utils/dateUtils';

export default function InventoryPrint({ asset, onClose }) {
    useEffect(() => {
        document.body.classList.add('modal-print-open');
        return () => {
            document.body.classList.remove('modal-print-open');
        };
    }, []);

    if (!asset) return null;

    const getYearsDepreciation = (price, ratePercent) => {
        const priceVal = parseFloat(price) || 0;
        const rate = parseFloat(ratePercent) || 10;
        if (rate <= 0) {
            return Array.from({ length: 5 }, (_, i) => ({
                year: `ปีที่ ${i + 1}`,
                rate: "0",
                balance: priceVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }));
        }

        const years = Math.ceil(100 / rate);
        const annualDep = priceVal * (rate / 100);

        return Array.from({ length: Math.max(5, years) }, (_, i) => {
            const yearNum = i + 1;
            let accumDep = annualDep * yearNum;
            if (accumDep > priceVal - 1) {
                accumDep = priceVal - 1;
            }
            const balance = Math.max(1, priceVal - accumDep);
            return {
                year: `ปีที่ ${yearNum}`,
                rate: `${rate}`,
                balance: balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            };
        });
    };



    const getDisplayData = () => {

        const code = asset.asset_code || '';
        const parts = code.split('-');
        let yearBE = '67';
        if (parts.length >= 2) {
            yearBE = parts[1];
        }

        const depRate = (asset.depreciation_rate_percent !== undefined && asset.depreciation_rate_percent !== null)
            ? asset.depreciation_rate_percent
            : 10;
        const depList = getYearsDepreciation(asset.unit_price, depRate);

        let displayAcquiredDate = `พ.ศ. 25${yearBE}`;
        let displayYear = `25${yearBE}`;

        if (asset.delivery_document_date) {
            displayAcquiredDate = formatThaiDateString(asset.delivery_document_date);
            const dateParts = asset.delivery_document_date.split('-');
            if (dateParts.length === 3) {
                const yr = parseInt(dateParts[0]) || 0;
                displayYear = yr < 2400 ? String(yr + 543) : String(yr);
            } else {
                const slashParts = asset.delivery_document_date.split('/');
                if (slashParts.length === 3) {
                    displayYear = slashParts[2];
                }
            }
        }

        // Map custodian history list dynamically
        const historyRows = [];
        if (asset.custodian_history && asset.custodian_history.length > 0) {
            asset.custodian_history.forEach(ch => {
                historyRows.push({
                    year: ch.year || "-",
                    department: ch.budget_owner || "-", // ชื่อส่วนราชการ
                    user: ch.custodian_name || "-", // ชื่อผู้ดูแล
                    head: ch.section_head || "-" // ชื่อหัวหน้าส่วน
                });
            });
        }

        if (historyRows.length === 0) {
            historyRows.push({
                year: displayYear,
                department: asset.responsible_department || "-",
                user: "-",
                head: "-"
            });
        }

        while (historyRows.length < 3) {
            historyRows.push({ year: "", department: "", user: "", head: "" });
        }

        return {
            category: asset.category || (asset.asset_type === 'LAND_BUILDING' ? 'ที่ดินและสิ่งก่อสร้าง' : 'ครุภัณฑ์'),
            agency: "เทศบาลตำบลเสาธงหิน",
            office: asset.responsible_department || "สำนักงาน",
            amphoe: "บางใหญ่",
            province: "นนทบุรี",
            assetCode: asset.asset_code || "-",
            assetName: asset.name || "-",
            acquiredFrom: asset.acquisition_method || "-",
            acquiredDate: displayAcquiredDate,
            budgetSource: asset.budget_owner || "-",
            price: (asset.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            brand: asset.manufacturer_brand || "-",
            model: asset.building_style || "-",
            carNumber: asset.vehicle_registration || "-",
            engineNumber: asset.engine_number || "-",
            chassisNumber: asset.chassis_number || "-",
            registrationNumber: asset.vehicle_registration || "-",
            color: asset.color || "-",
            other: asset.delivery_document_no ? `${asset.delivery_document_no} ลงวันที่ ${asset.delivery_document_date ? formatThaiDateString(asset.delivery_document_date) : '-'} (${asset.seller_name || '-'})` : "-",
            warrantyUntil: asset.warranty_end_date ? formatThaiDateString(asset.warranty_end_date) : "-",
            warrantyCompany: asset.warranty_company || "-",
            warrantyDate: asset.warranty_start_date ? formatThaiDateString(asset.warranty_start_date) : "-",
            depreciation: depList.slice(0, 5),
            history: historyRows.slice(0, 3),
            disposalDate: asset.status === 'จำหน่ายแล้ว' ? 'จำหน่ายแล้ว' : '-',
            disposalMethod: asset.status === 'จำหน่ายแล้ว' ? 'จำหน่าย' : '-',
            disposalDocNo: "-",
            disposalPrice: "-",
            profit: "-",
            benefits: []
        };
    };

    const data = getDisplayData();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="preview-container">
            {/* ปุ่มกดพิมพ์ จะไม่แสดงเวลาสั่งพิมพ์จริง */}
            <div className="no-print-zone">
                <button onClick={handlePrint} className="print-btn">
                    🖨️ สั่งพิมพ์เอกสาร
                </button>
                {onClose && (
                    <button onClick={onClose} className="print-btn print-btn-close">
                        ❌ ปิดหน้าต่าง
                    </button>
                )}
            </div>

            {/* หน้าเอกสารควบคุมสัดส่วน */}
            <div className="a4-landscape-page">
                {/* ส่วนหัวเอกสาร */}
                <div className="print-header-title">
                    {asset?.asset_type === 'LAND_BUILDING'
                        ? 'ทะเบียนที่ดินและสิ่งก่อสร้าง'
                        : 'ทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์และสัตว์พาหนะ'}
                </div>
                <table className="form-table">
                    <tbody>
                        {/* แถวที่ 1: ข้อมูลหน่วยงาน */}
                        <tr>
                            <td colSpan="2" style={{ width: '40%' }}>
                                ประเภท <span className="dotted-line" style={{ width: '72%' }}>{data.category}</span>
                            </td>
                            <td colSpan="2" style={{ width: '40%' }}>
                                ส่วนราชการ: <span className="dotted-line" style={{ width: '70%' }}>{data.agency}</span><br />
                                สำนักงาน: <span className="dotted-line" style={{ width: '73%' }}>{data.office}</span><br />
                                อำเภอ: <span className="dotted-line" style={{ width: '30%' }}>{data.amphoe}</span>
                                <strong>จังหวัด:</strong> <span className="dotted-line" style={{ width: '35%' }}>{data.province}</span>
                            </td>
                            <td style={{ width: '20%' }}>
                                <strong>รหัสพัสดุ</strong> <span className="dotted-line" style={{ width: '90%' }}>{data.assetCode}</span>
                            </td>
                        </tr>

                        {/* แถวที่ 2: ชื่อและแหล่งที่มา */}
                        <tr>
                            <td colSpan="2">
                                <strong>ชื่อพัสดุ:</strong> <span className="dotted-line" style={{ width: '80%' }}>{data.assetName}</span>
                            </td>
                            <td colSpan="2">
                                <strong>ซื้อ/จ้าง/ได้มา จาก:</strong> <span className="dotted-line" style={{ width: '65%' }}>{data.acquiredFrom}</span>
                            </td>
                            <td>
                                <strong>ชื่อผู้ใช้-ดูแล-รับผิดชอบ:</strong>
                                <div className="user-responsibility-box"></div>
                            </td>
                        </tr>

                        {/* แถวที่ 3: รายละเอียดสเปค และ ข้อมูลราคา/ค่าเสื่อม */}
                        <tr className="text-sm">
                            {/* ฝั่งซ้าย: ข้อมูลจำเพาะทางเทคนิค (พ.ด. 2) หรือรายละเอียดเฉพาะที่ดินและสิ่งก่อสร้าง (พ.ด. 1) */}
                            {asset?.asset_type === 'LAND_BUILDING' ? (
                                <td colSpan="2" className="lh-1-6">
                                    เอกสารสิทธิ์ (โฉนด/น.ส.3): <span className="dotted-line" style={{ width: '50%' }}>{asset.document_of_title || '-'}</span><br />
                                    ขนาดเนื้อที่: <span className="dotted-line" style={{ width: '70%' }}>{asset.area_size || '-'}</span><br />
                                    ลักษณะโรงเรือน/สิ่งก่อสร้าง: <span className="dotted-line" style={{ width: '45%' }}>{asset.building_style || '-'}</span><br />
                                    สถานะพัสดุ: <span className="dotted-line" style={{ width: '70%' }}>{asset.status || '-'}</span><br />
                                    ลักษณะการได้มา: <span className="dotted-line" style={{ width: '60%' }}>{asset.acquisition_method || '-'}</span><br />
                                    เอกสารอนุมัติ/สัญญา: <span className="dotted-line" style={{ width: '53%' }}>{asset.delivery_document_no ? `${asset.delivery_document_no} ลงวันที่ ${asset.delivery_document_date ? formatThaiDateString(asset.delivery_document_date) : '-'} (${asset.seller_name || '-'})` : '-'}</span><br />
                                    <span style={{ visibility: 'hidden' }}>-</span><br />
                                    <span style={{ visibility: 'hidden' }}>-</span><br />
                                    <span style={{ visibility: 'hidden' }}>-</span>
                                </td>
                            ) : (
                                <td colSpan="2" className="lh-1-6">
                                    ใบส่งของ: <span className="dotted-line" style={{ width: '75%' }}>{asset.delivery_document_no ? `${asset.delivery_document_no} ลงวันที่ ${asset.delivery_document_date ? formatThaiDateString(asset.delivery_document_date) : '-'} (${asset.seller_name || '-'})` : '-'}</span><br />
                                    ชื่อ/ยี่ห้อผู้ทำหรือผลิต: <span className="dotted-line" style={{ width: '55%' }}>{data.brand}</span><br />
                                    แบบ/ชนิด/ลักษณะ: <span className="dotted-line" style={{ width: '60%' }}>{data.model}</span><br />
                                    หมายเลขตัวรถ: <span className="dotted-line" style={{ width: '70%' }}>{data.carNumber}</span><br />
                                    หมายเลขเครื่อง (ถ้ามี): <span className="dotted-line" style={{ width: '58%' }}>{data.engineNumber}</span><br />
                                    หมายเลขกรอบ (ถ้ามี): <span className="dotted-line" style={{ width: '58%' }}>{data.chassisNumber}</span><br />
                                    หมายเลขจดทะเบียน (ถ้ามี): <span className="dotted-line" style={{ width: '53%' }}>{data.registrationNumber}</span><br />
                                    สีของพัสดุ: <span className="dotted-line" style={{ width: '75%' }}>{data.color}</span><br />
                                    อื่นๆ (ถ้ามีระบุ): <span className="dotted-line" style={{ width: '70%' }}>{data.other}</span>
                                </td>
                            )}

                            {/* ฝั่งกลาง: ราคาและการคำนวณค่าเสื่อม */}
                            <td colSpan="2">
                                ซื้อ/จ้าง/ได้มา เมื่อวันที่: <span className="dotted-line" style={{ width: '45%' }}>{data.acquiredDate}</span><br />
                                ใช้งบประมาณของ: <span className="dotted-line" style={{ width: '60%' }}>{data.budgetSource}</span><br />
                                ราคา: <span className="dotted-line" style={{ width: '80%' }}>{data.price}</span> บาท

                                <div className="depreciation-section">
                                    <strong className="text-center style-block">ค่าเสื่อมราคา</strong>
                                    <table className="depreciation-table">
                                        <tbody>
                                            {data.depreciation.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="depreciation-cell-borderless">{item.year}:</td>
                                                    <td className="depreciation-cell-borderless"><span className="dotted-line" style={{ width: '30px' }}>{item.rate}</span> %</td>
                                                    <td className="depreciation-cell-borderless">คงเหลือราคา <span className="dotted-line" style={{ width: '60px' }}>{item.balance}</span> บาท</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </td>

                            {/* ฝั่งขวา: ประวัติผู้ใช้งานพัสดุ */}
                            <td className="history-section">
                                <table className="history-table nested-table">
                                    <thead>
                                        <tr className="history-header-bg">
                                            <th style={{ width: '20%' }}>พ.ศ.</th>
                                            <th style={{ width: '40%' }}>ชื่อส่วนราชการ</th>
                                            <th style={{ width: '40%' }}>ชื่อผู้ใช้/หัวหน้า</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.history.map((hist, idx) => (
                                            <tr key={idx} className="history-row">
                                                <td className="history-cell-center">{hist.year}</td>
                                                <td className="history-cell">{hist.department}</td>
                                                <td className="history-cell-head">
                                                    {hist.head || hist.user}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="photo-placeholder">
                                    [ รูปถ่ายพัสดุถ้ามี ]
                                </div>
                            </td>
                        </tr>

                        {/* แถวที่ 4: การประกันภัย และ การจำหน่าย */}
                        <tr className="text-sm">
                            <td colSpan="2">
                                <strong>เงื่อนไขการประกัน</strong><br />
                                พัสดุรับประกันถึงวันที่: <span className="dotted-line" style={{ width: '55%' }}>{data.warrantyUntil}</span><br />
                                พัสดุประกันไว้ที่บริษัท: <span className="dotted-line" style={{ width: '53%' }}>{data.warrantyCompany}</span><br />
                                วันที่ประกันพัสดุ: <span className="dotted-line" style={{ width: '60%' }}>{data.warrantyDate}</span>
                            </td>
                            <td colSpan="3">
                                <strong>การจำหน่าย</strong><br />
                                วันที่จำหน่าย: <span className="dotted-line" style={{ width: '25%' }}>{data.disposalDate}</span>
                                วิธีจำหน่าย: <span className="dotted-line" style={{ width: '45%' }}>{data.disposalMethod}</span><br />
                                เลขที่หนังสืออนุมัติ: <span className="dotted-line" style={{ width: '35%' }}>{data.disposalDocNo}</span>
                                ราคาจำหน่าย: <span className="dotted-line" style={{ width: '20%' }}>{data.disposalPrice}</span> บาท<br />
                                กำไร/ขาดทุน: <span className="dotted-line" style={{ width: '40%' }}>{data.profit}</span> บาท
                            </td>
                        </tr>

                        {/* แถวที่ 5: ตารางย่อยการหาผลประโยชน์ */}
                        <tr>
                            <td colSpan="5" style={{ padding: '0' }}>
                                <div className="benefit-section-title">
                                    <strong>การหาผลประโยชน์ในพัสดุ</strong>
                                </div>
                                <table className="benefit-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>พ.ศ.</th>
                                            <th style={{ width: '40%' }}>รายการ</th>
                                            <th style={{ width: '15%' }}>ผลประโยชน์ (บาท)</th>
                                            <th style={{ width: '10%' }}>พ.ศ.</th>
                                            <th style={{ width: '15%' }}>รายการ</th>
                                            <th style={{ width: '10%' }}>ผลประโยชน์ (บาท)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell"></td>
                                            <td className="benefit-cell"></td>
                                            <td className="benefit-cell"></td>
                                            <td className="benefit-cell"></td>
                                            <td className="benefit-cell"></td>
                                            <td className="benefit-cell-last"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* หน้าที่ 2: ประวัติการซ่อมบำรุงรักษา */}
            <div className="a4-landscape-page page-break-before-always">
                {/* ส่วนหัวเอกสาร หน้า 2 */}
                <div className="print-header-title" style={{ marginBottom: '10px' }}>
                    ประวัติการซ่อมบำรุงรักษา (หน้า ๒)
                </div>
                <div className="print-header-subtitle" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '15px', fontWeight: '500' }}>
                    <div>
                        <strong>ประเภทพัสดุ:</strong> <span className="dotted-line" style={{ width: '180px' }}>{data.category}</span>
                    </div>
                    <div>
                        <strong>ชื่อพัสดุ:</strong> <span className="dotted-line" style={{ width: '280px' }}>{data.assetName}</span>
                    </div>
                    <div>
                        <strong>รหัสพัสดุ:</strong> <span className="dotted-line" style={{ width: '160px' }}>{data.assetCode}</span>
                    </div>
                </div>
                <table className="card-maint-table" style={{ border: '1.5px solid #000000', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9f5f1ff' }}>
                            <th style={{ width: '12%', border: '1px solid #000000', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>วัน เดือน ปี</th>
                            <th style={{ width: '22%', border: '1px solid #000000', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>เลขที่หนังสืออนุมัติ</th>
                            <th style={{ width: '40%', border: '1px solid #000000', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>รายการซ่อมแซมหรือเปลี่ยนอะไหล่โดยละเอียด</th>
                            <th style={{ width: '11%', border: '1px solid #000000', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>จำนวนเงิน (บาท)</th>
                            <th style={{ width: '15%', border: '1px solid #000000', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>ผู้รับจ้าง/ช่างซ่อม</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asset.maintenances && asset.maintenances.length > 0 ? (
                            asset.maintenances.map((maint, idx) => (
                                <tr key={maint.id || idx}>
                                    <td style={{ border: '1px solid #000000', padding: '12px 8px', textAlign: 'center', fontSize: '14px' }}>
                                        {maint.approval_date ? formatThaiDateString(maint.approval_date) : '-'}
                                    </td>
                                    <td style={{ border: '1px solid #000000', padding: '12px 8px', fontSize: '14px' }}>
                                        {maint.document_number || '-'}
                                    </td>
                                    <td style={{ border: '1px solid #000000', padding: '12px 8px', fontSize: '14px' }}>
                                        {maint.description || '-'}
                                    </td>
                                    <td style={{ border: '1px solid #000000', padding: '12px 8px', textAlign: 'right', fontSize: '14px' }}>
                                        {(maint.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ border: '1px solid #000000', padding: '12px 8px', fontSize: '14px' }}>
                                        {maint.contractor || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ border: '1px solid #000000', padding: '20px', textAlign: 'center', color: '#020000ff', fontSize: '15px' }}>
                                    ไม่มีประวัติการซ่อมบำรุงรักษาสำหรับพัสดุรายการนี้
                                </td>
                            </tr>
                        )}
                        {/* Fill empty rows to make it look like a standard official ledger form (at least 8 rows total) */}
                        {Array.from({ length: Math.max(0, 8 - (asset.maintenances ? asset.maintenances.length : 0)) }).map((_, idx) => (
                            <tr key={`empty-${idx}`}>
                                <td style={{ border: '1px solid #000000', padding: '18px 8px' }}>&nbsp;</td>
                                <td style={{ border: '1px solid #000000', padding: '18px 8px' }}>&nbsp;</td>
                                <td style={{ border: '1px solid #000000', padding: '18px 8px' }}>&nbsp;</td>
                                <td style={{ border: '1px solid #000000', padding: '18px 8px' }}>&nbsp;</td>
                                <td style={{ border: '1px solid #000000', padding: '18px 8px' }}>&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}