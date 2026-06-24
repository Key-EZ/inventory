import { useEffect, useRef, useState } from 'react';
import { formatThaiDateString } from '../../utils/dateUtils';

function AutoFitText({ text, maxFontSize = 13.5, minFontSize = 8, className = '', style = {} }) {
    const containerRef = useRef(null);
    const [fontSize, setFontSize] = useState(maxFontSize);

    useEffect(() => {
        setFontSize(maxFontSize);
    }, [text, maxFontSize]);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const containerWidth = entry.contentRect.width;
                if (containerWidth <= 0) continue;

                const measureSpan = document.createElement('span');
                measureSpan.style.visibility = 'hidden';
                measureSpan.style.position = 'absolute';
                measureSpan.style.whiteSpace = 'nowrap';
                measureSpan.style.fontFamily = window.getComputedStyle(container).fontFamily;
                measureSpan.style.fontSize = `${maxFontSize}px`;
                measureSpan.textContent = String(text || '');
                document.body.appendChild(measureSpan);

                const textWidth = measureSpan.getBoundingClientRect().width;
                document.body.removeChild(measureSpan);

                const availableWidth = containerWidth - 2;

                if (textWidth > availableWidth && availableWidth > 0) {
                    const scale = availableWidth / textWidth;
                    const newFontSize = Math.max(minFontSize, Math.floor(maxFontSize * scale * 10) / 10);
                    setFontSize(newFontSize);
                } else {
                    setFontSize(maxFontSize);
                }
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [text, maxFontSize, minFontSize]);

    return (
        <span
            ref={containerRef}
            className={className}
            style={{
                fontSize: `${fontSize}px`,
                whiteSpace: 'nowrap',
                display: 'inline-block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'clip',
                verticalAlign: 'bottom',
                ...style
            }}
        >
            {text}
        </span>
    );
}

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
        const parts = code.split('/');
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
            agency: localStorage.getItem('print_ledger_agency') || "เทศบาลตำบลเสาธงหิน",
            office: localStorage.getItem('print_ledger_office') || asset.responsible_department || "สำนักงาน",
            amphoe: localStorage.getItem('print_ledger_amphoe') || "บางใหญ่",
            province: localStorage.getItem('print_ledger_province') || "นนทบุรี",
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
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0, padding: 0 }}>
                    <tbody>
                        <tr style={{ margin: 0, padding: 0 }}>
                            <td style={{ width: '90%', padding: 0, margin: 0 }}>
                                <div className="print-header-title" style={{ margin: 0, padding: 0 }}>
                                    {asset?.asset_type === 'LAND_BUILDING'
                                        ? 'ทะเบียนที่ดินและสิ่งก่อสร้าง'
                                        : 'ทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์และสัตว์พาหนะ'}
                                </div>
                            </td>
                            <td style={{ width: '10%', padding: 0, margin: 0, textAlign: 'right', verticalAlign: 'middle', fontWeight: 'bold' }}>
                                <div>{asset?.asset_type === 'LAND_BUILDING' ? 'พ.ด. ๑' : 'พ.ด. ๒'}</div>
                            </td>
                        </tr>
                        <tr style={{ margin: 0, padding: 0 }}>
                            <td style={{ width: '95%', padding: 0, margin: 0 }}></td>
                            <td style={{ width: '5%', verticalAlign: 'middle', border: '1px solid black', textAlign: 'center', padding: '2px 0', margin: 0 }}>
                                <div>1</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {/* ข้อมูลหน่วยงาน แถวเดียว นอกตาราง */}
                <div className="print-header-metadata" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px', fontSize: '14px', fontFamily: 'Sarabun, sans-serif', alignItems: 'flex-end' }}>
                    <div style={{ width: '25%', display: 'flex', alignItems: 'flex-end' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>ประเภท</span>
                        <span className="dotted-line" style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                            <AutoFitText text={data.category} />
                        </span>
                    </div>
                    <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', flexGrow: 1.5, minWidth: 0 }}>
                            <span style={{ whiteSpace: 'nowrap' }}>สำนักงาน</span>
                            <span className="dotted-line" style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                <AutoFitText text={data.agency} />
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', flexGrow: 1, minWidth: 0 }}>
                            <span style={{ whiteSpace: 'nowrap' }}>อำเภอ</span>
                            <span className="dotted-line" style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                <AutoFitText text={data.amphoe} />
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', flexGrow: 1, minWidth: 0 }}>
                            <span style={{ whiteSpace: 'nowrap' }}>จังหวัด</span>
                            <span className="dotted-line" style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                <AutoFitText text={data.province} />
                            </span>
                        </div>
                    </div>
                    <div style={{ width: '25%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>เลขรหัสพัสดุ</span>
                        <span className="dotted-line" style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                            <AutoFitText text={data.assetCode} />
                        </span>
                    </div>
                </div>

                <table className="form-table" style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
                    <tbody>

                        <tr className="text-sm">
                            {/* ฝั่งซ้าย: ข้อมูลจำเพาะทางเทคนิค (พ.ด. 2) หรือรายละเอียดเฉพาะที่ดินและสิ่งก่อสร้าง (พ.ด. 1) */}
                            {asset?.asset_type === 'LAND_BUILDING' ? (
                                <td style={{ width: '25%', padding: 0, verticalAlign: 'top' }}>
                                    <table style={{ border: '1px solid black', borderCollapse: 'collapse' }} className="print-nested-spec-table">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>ชื่อพัสดุ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.assetName} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>เอกสารสิทธิ์ (โฉนด/น.ส.3):</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.document_of_title || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>ขนาดเนื้อที่:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.area_size || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>ลักษณะโรงเรือน/สิ่งก่อสร้าง:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.building_style || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>สถานะพัสดุ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.status || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>ลักษณะการได้มา:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.acquisition_method || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>เอกสารอนุมัติ/สัญญา:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.delivery_document_no ? `${asset.delivery_document_no} ลงวันที่ ${asset.delivery_document_date ? formatThaiDateString(asset.delivery_document_date) : '-'} (${asset.seller_name || '-'})` : '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span style={{ visibility: 'hidden' }}>-</span></td>
                                            </tr>
                                            <tr>
                                                <td><span style={{ visibility: 'hidden' }}>-</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            ) : (
                                <td style={{ width: '20%', padding: 0, verticalAlign: 'top' }}>
                                    <table style={{ border: '1px solid black', borderCollapse: 'collapse' }} className="print-nested-spec-table">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>ชื่อพัสดุ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.assetName} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>ใบส่งของ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.delivery_document_no || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>ชื่อ/ยี่ห้อผู้ทำหรือผลิต:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.brand || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>แบบ/ชนิด/ลักษณะ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.model || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>หมายเลขตัวรถ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.carNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>หมายเลขเครื่อง (ถ้ามี):</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.engineNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>หมายเลขกรอบ (ถ้ามี):</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.chassisNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>หมายเลขจดทะเบียน (ถ้ามี):</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.registrationNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>สีของพัสดุ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.color || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>อื่นๆ (ถ้ามีระบุ):</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={asset.other_details || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>เงื่อนไขการประกัน</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>พัสดุรับประกันถึงวันที่:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.warrantyUntil || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>พัสดุประกันไว้ที่บริษัท:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.warrantyCompany || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>วันที่ประกันพัสดุ:</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                            <AutoFitText text={data.warrantyDate || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            )}

                            {/* ฝั่งกลาง: ราคาและการคำนวณค่าเสื่อม */}
                            <td style={{ width: '30%', padding: 0, verticalAlign: 'top' }}>
                                <table style={{ border: '1px solid black', borderCollapse: 'collapse' }} className="print-nested-spec-table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>ซื้อ/จ้าง/ได้มา จาก:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                        <AutoFitText text={asset.seller_name || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>ซื้อ/จ้าง/ได้มา เมื่อวันที่:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                        <AutoFitText text={data.acquiredDate || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', gap: '4px' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>ราคา:</span>
                                                    <span style={{ width: '70px', flexShrink: 0 }}>
                                                        <AutoFitText text={data.price} />
                                                    </span>
                                                    <span style={{ whiteSpace: 'nowrap' }}>บาท</span>
                                                    <span style={{ whiteSpace: 'nowrap', marginLeft: '4px' }}>งบประมาณ:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0 }}>
                                                        <AutoFitText text={data.budgetSource} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'center' }}>ค่าเสื่อมราคา</td>
                                        </tr>
                                        {data.depreciation.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', gap: '4px' }}>
                                                        <span style={{ whiteSpace: 'nowrap' }}>{item.year}:</span>
                                                        <span style={{ width: '35px', textAlign: 'center', flexShrink: 0 }}>
                                                            {item.rate}
                                                        </span>
                                                        <span style={{ whiteSpace: 'nowrap' }}>% คงเหลือราคา</span>
                                                        <span style={{ flexGrow: 1, minWidth: 0 }}>
                                                            <AutoFitText text={item.balance} />
                                                        </span>
                                                        <span style={{ whiteSpace: 'nowrap' }}>บาท</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="center-text" style={{ fontWeight: 'bold', textAlign: 'center' }}>การจำหน่าย</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>วันที่จำหน่าย:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                        <AutoFitText text={data.disposalDate || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>วิธีจำหน่าย:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                        <AutoFitText text={data.disposalMethod || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>เลขที่หนังสืออนุมัติ:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                        <AutoFitText text={data.disposalDocNo || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>ราคาจำหน่าย:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                        <AutoFitText text={data.disposalPrice || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                    <span style={{ whiteSpace: 'nowrap' }}>กำไร/ขาดทุน:</span>
                                                    <span style={{ flexGrow: 1, minWidth: 0, marginLeft: '4px' }}>
                                                        <AutoFitText text={data.profit || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>

                            {/* ฝั่งขวา: ประวัติผู้ใช้งานพัสดุ */}
                            <td className="history-section" style={{ width: asset?.asset_type === 'LAND_BUILDING' ? '45%' : '50%', padding: 0, verticalAlign: 'top' }}>
                                <table style={{ border: '1px solid black', borderCollapse: 'collapse', width: '100%' }} className="print-nested-spec-table">
                                    <tbody>
                                        <tr>
                                            <td style={{ fontWeight: 'bold' }}>
                                                ชื่อผู้ใช้-ดูแล-รับผิดชอบ
                                                <div className="user-responsibility-box"></div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: 0 }}>
                                                <table className="history-table nested-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr className="history-header-bg">
                                                            <th style={{ width: '15%', borderRight: '1px solid black', borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px' }}>พ.ศ.</th>
                                                            <th style={{ width: '35%', borderRight: '1px solid black', borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px' }}>ชื่อส่วนราชการ</th>
                                                            <th style={{ width: '25%', borderRight: '1px solid black', borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px' }}>ชื่อผู้ใช้พัสดุ</th>
                                                            <th style={{ width: '25%', borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px' }}>ชื่อหัวหน้าส่วนราชการ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.history.map((hist, idx) => (
                                                            <tr key={idx} className="history-row">
                                                                <td className="history-cell-center" style={{ borderRight: '1px solid black', borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px', textAlign: 'center' }}>{hist.year}</td>
                                                                <td className="history-cell" style={{ borderRight: '1px solid black', borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px' }}>{hist.department}</td>
                                                                <td className="history-cell" style={{ borderRight: '1px solid black', borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px' }}>{hist.user || '-'}</td>
                                                                <td className="history-cell-head" style={{ borderBottom: '1px solid black', padding: '4.8px 8px', fontSize: '13.5px' }}>
                                                                    {hist.head || '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <div className="photo-placeholder" style={{ margin: 0 }}>
                                                    {asset.photo ? (
                                                        <img src={asset.photo} alt={asset.name} />
                                                    ) : (
                                                        '[ รูปถ่ายพัสดุถ้ามี ]'
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                        {/* แถวที่ 4: การจำหน่าย (ย้ายไปอยู่ในตารางย่อยฝั่งกลางแล้ว) */}

                        {/* แถวที่ 5: ตารางย่อยการหาผลประโยชน์ */}
                        <tr>
                            <td colSpan="2" style={{ padding: '0' }}>
                                <div className="benefit-section-title" style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
                                    การหาผลประโยชน์ในพัสดุ
                                </div>
                                <table className="benefit-table" style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}>พ.ศ.</th>
                                            <th style={{ width: '40%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}>รายการ</th>
                                            <th style={{ width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}>ผลประโยชน์ (บาท)</th>
                                            <th style={{ width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}>พ.ศ.</th>
                                            <th style={{ width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}>รายการ</th>
                                            <th style={{ width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}>ผลประโยชน์ (บาท)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}  ></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '40%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell-last" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                        </tr>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}  ></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '40%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell-last" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                        </tr>

                                        <tr className="benefit-row">
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}  ></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '40%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell-last" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                        </tr>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}  ></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '40%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell" style={{ height: 30, width: '15%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
                                            <td className="benefit-cell-last" style={{ height: 30, width: '10%', border: '1px solid black', borderCollapse: 'collapse', padding: '4.8px 8px', fontSize: '13.5px' }}></td>
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
        </div >
    );
}