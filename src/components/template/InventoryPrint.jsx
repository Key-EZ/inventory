import { useEffect, useRef, useState } from 'react';
import { formatThaiDateString } from '../../utils/dateUtils';
import './InventoryPrint.css';

function AutoFitText({ text, maxFontSize = 13.5, minFontSize = 8, className = '', style = {} }) {
    const containerRef = useRef(null);
    const [fontSize, setFontSize] = useState(maxFontSize);

    // Sync font size changes in render phase when text or maxFontSize dependencies change
    const [prevProps, setPrevProps] = useState({ text, maxFontSize });
    if (text !== prevProps.text || maxFontSize !== prevProps.maxFontSize) {
        setPrevProps({ text, maxFontSize });
        setFontSize(maxFontSize);
    }

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
                rate: "0.00",
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
                rate: rate.toFixed(2),
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
                <table className="print-header-tbl">
                    <tbody>
                        <tr>
                            <td className="print-header-title-cell">
                                <div className="print-header-title">
                                    {asset?.asset_type === 'LAND_BUILDING'
                                        ? 'ทะเบียนที่ดินและสิ่งก่อสร้าง'
                                        : 'ทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์และสัตว์พาหนะ'}
                                </div>
                            </td>
                            <td className="print-header-tag-cell">
                                <div>{asset?.asset_type === 'LAND_BUILDING' ? 'พ.ด. ๑' : 'พ.ด. ๒'}</div>
                            </td>
                        </tr>
                        <tr>
                            <td className="print-header-empty-cell"></td>
                            <td className="print-header-page-num-cell">
                                <div>1</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {/* ข้อมูลหน่วยงาน แถวเดียว นอกตาราง */}
                <div className="print-header-metadata print-meta-row">
                    <div className="print-meta-col-25-left">
                        <span className="print-meta-field-label">ประเภท</span>
                        <span className="print-meta-field-value dotted-line">
                            <AutoFitText text={data.category} />
                        </span>
                    </div>
                    <div className="print-meta-col-50-center">
                        <div className="print-meta-cell-grow-1-5">
                            <span className="print-meta-field-label">สำนักงาน</span>
                            {/* <span className="print-meta-field-value dotted-line">
                                <AutoFitText text={data.agency} />
                            </span>*/}
                            <span className="print-meta-field-value dotted-line">
                                {data.agency}
                            </span>
                        </div>
                        <div className="print-meta-cell-grow-1">
                            <span className="print-meta-field-label">อำเภอ</span>
                            {/*<span className="print-meta-field-value dotted-line">
                                <AutoFitText text={data.amphoe} />
                            </span>*/}
                            <span className="print-meta-field-value dotted-line">
                                {data.amphoe}
                            </span>
                        </div>
                        <div className="print-meta-cell-grow-1">
                            <span className="print-meta-field-label">จังหวัด</span>
                            {/*<span className="print-meta-field-value dotted-line">
                                <AutoFitText text={data.province} />
                            </span>*/}
                            <span className="print-meta-field-value dotted-line">
                                {data.province}
                            </span>
                        </div>
                    </div>
                    <div className="print-meta-col-25-right">
                        <span className="print-meta-field-label">เลขรหัสพัสดุ</span>
                        {/*<span className="print-meta-field-value dotted-line">
                            <AutoFitText text={data.assetCode} />
                        </span>*/}
                        <span className="print-meta-field-value dotted-line">
                            {data.assetCode}
                        </span>
                    </div>
                </div>

                <table className="form-table form-table-bordered">
                    <tbody>

                        <tr className="text-sm">
                            {/* ฝั่งซ้าย: ข้อมูลจำเพาะทางเทคนิค (พ.ด. 2) หรือรายละเอียดเฉพาะที่ดินและสิ่งก่อสร้าง (พ.ด. 1) */}
                            {asset?.asset_type === 'LAND_BUILDING' ? (
                                <td className="print-col-left-building">
                                    <table className="print-nested-spec-table print-nested-spec-table-normal">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">ชื่อพัสดุ:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.assetName} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">เอกสารสิทธิ์ (โฉนด/น.ส.3):</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.document_of_title || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">ขนาดเนื้อที่:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.area_size || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">ลักษณะโรงเรือน/สิ่งก่อสร้าง:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.building_style || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">สถานะพัสดุ:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.status || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">ลักษณะการได้มา:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.acquisition_method || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">เอกสารอนุมัติ/สัญญา:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.delivery_document_no ? `${asset.delivery_document_no} ลงวันที่ ${asset.delivery_document_date ? formatThaiDateString(asset.delivery_document_date) : '-'} (${asset.seller_name || '-'})` : '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span className="print-invisible">-</span></td>
                                            </tr>
                                            <tr>
                                                <td><span className="print-invisible">-</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            ) : (
                                <td className="print-col-left-general">
                                    <table className="print-nested-spec-table print-nested-spec-table-normal">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">ชื่อพัสดุ:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.assetName} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">ใบส่งของ:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.delivery_document_no || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">ชื่อ/ยี่ห้อผู้ทำหรือผลิต:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.brand || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">แบบ/ชนิด/ลักษณะ:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.model || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">หมายเลขตัวรถ:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.carNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">หมายเลขเครื่อง (ถ้ามี):</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.engineNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">หมายเลขกรอบ (ถ้ามี):</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.chassisNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">หมายเลขจดทะเบียน (ถ้ามี):</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.registrationNumber || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">สีของพัสดุ:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.color || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">อื่นๆ (ถ้ามีระบุ):</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={asset.other_details || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="print-section-title-cell">เงื่อนไขการประกัน</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">พัสดุรับประกันถึงวันที่:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.warrantyUntil || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">พัสดุประกันไว้ที่บริษัท:</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={data.warrantyCompany || '-'} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="print-field-row-wrap">
                                                        <span className="print-meta-field-label">วันที่ประกันพัสดุ:</span>
                                                        <span className="print-meta-field-value">
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
                            <td className="print-col-middle">
                                <table className="print-nested-spec-table print-nested-spec-table-normal">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap">
                                                    <span className="print-meta-field-label">ซื้อ/จ้าง/ได้มา จาก:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={asset.seller_name || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap">
                                                    <span className="print-meta-field-label">ซื้อ/จ้าง/ได้มา เมื่อวันที่:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={data.acquiredDate || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap-gap">
                                                    <span className="print-meta-field-label">ราคา:</span>
                                                    <span className="print-cell-price-span">
                                                        <AutoFitText text={data.price} />
                                                    </span>
                                                    <span className="print-meta-field-label">บาท</span>
                                                    <span className="print-meta-field-label print-ml-4">งบประมาณ:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={data.budgetSource} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="print-section-title-cell">ค่าเสื่อมราคา</td>
                                        </tr>
                                        {data.depreciation.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="print-field-row-wrap-gap">
                                                        <span className="print-meta-field-label">{item.year}:</span>
                                                        <span className="print-cell-rate-span">
                                                            {item.rate}
                                                        </span>
                                                        <span className="print-meta-field-label">% คงเหลือราคา</span>
                                                        <span className="print-meta-field-value">
                                                            <AutoFitText text={item.balance} />
                                                        </span>
                                                        <span className="print-meta-field-label">บาท</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="print-section-title-cell">การจำหน่าย</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap">
                                                    <span className="print-meta-field-label">วันที่จำหน่าย:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={data.disposalDate || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap">
                                                    <span className="print-meta-field-label">วิธีจำหน่าย:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={data.disposalMethod || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap">
                                                    <span className="print-meta-field-label">เลขที่หนังสืออนุมัติ:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={data.disposalDocNo || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap">
                                                    <span className="print-meta-field-label">ราคาจำหน่าย:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={data.disposalPrice || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="print-field-row-wrap">
                                                    <span className="print-meta-field-label">กำไร/ขาดทุน:</span>
                                                    <span className="print-meta-field-value">
                                                        <AutoFitText text={data.profit || '-'} />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>

                            {/* ฝั่งขวา: ประวัติผู้ใช้งานพัสดุ */}
                            <td className={`history-section ${asset?.asset_type === 'LAND_BUILDING' ? 'print-col-right-building' : 'print-col-right-general'}`}>
                                <table className="print-nested-spec-table print-nested-spec-table-stretch">
                                    <tbody>
                                        <tr className="print-row-min-height">
                                            <td className="print-bold">
                                                ชื่อผู้ใช้-ดูแล-รับผิดชอบ
                                                <div className="user-responsibility-box"></div>
                                            </td>
                                        </tr>
                                        <tr className="print-row-min-height">
                                            <td className="print-p-0">
                                                <table className="history-table nested-table print-history-table">
                                                    <thead>
                                                        <tr className="history-header-bg">
                                                            <th className="print-history-th-first-three print-history-w-15">พ.ศ.</th>
                                                            <th className="print-history-th-first-three print-history-w-35">
                                                                <AutoFitText text="ชื่อส่วนราชการ" />
                                                            </th>
                                                            <th className="print-history-th-first-three print-history-w-25">
                                                                <AutoFitText text="ชื่อผู้ใช้พัสดุ" />
                                                            </th>
                                                            <th className="print-history-th-last print-history-w-25">
                                                                <AutoFitText text="ชื่อหัวหน้าส่วนราชการ" />
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.history.map((hist, idx) => (
                                                            <tr key={idx} className="history-row">
                                                                <td className="history-cell-center print-history-td-first-three print-text-center">{hist.year}</td>
                                                                <td className="history-cell print-history-td-first-three">
                                                                    <AutoFitText text={hist.department} />
                                                                </td>
                                                                <td className="history-cell print-history-td-first-three">
                                                                    <AutoFitText text={hist.user || '-'} />
                                                                </td>
                                                                <td className="history-cell-head print-history-td-last">
                                                                    <AutoFitText text={hist.head || '-'} />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>

                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                        {/* แถวที่ 4: การจำหน่าย (ย้ายไปอยู่ในตารางย่อยฝั่งกลางแล้ว) */}

                        {/* แถวที่ 5: ตารางย่อยการหาผลประโยชน์ */}
                        <tr>
                            <td colSpan="2" className="print-benefit-section-td">
                                <div className="benefit-section-title print-benefit-title">
                                    การหาผลประโยชน์ในพัสดุ
                                </div>
                                <table className="benefit-table print-benefit-tbl">
                                    <thead>
                                        <tr>
                                            <th className="print-benefit-cell print-w-10">พ.ศ.</th>
                                            <th className="print-benefit-cell print-w-40">รายการ</th>
                                            <th className="print-benefit-cell print-w-15">ผลประโยชน์ (บาท)</th>
                                            <th className="print-benefit-cell print-w-10">พ.ศ.</th>
                                            <th className="print-benefit-cell print-w-15">รายการ</th>
                                            <th className="print-benefit-cell print-w-10">ผลประโยชน์ (บาท)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-40" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell-last print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                        </tr>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-40" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell-last print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                        </tr>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-40" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell-last print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                        </tr>
                                        <tr className="benefit-row">
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-40" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell print-w-15" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                            <td className="benefit-cell-last print-w-10" style={{ height: '20px', border: '1px solid black', borderCollapse: 'collapse' }}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td className="print-photo-container-cell">
                                <div className="photo-placeholder print-photo-placeholder-wrap print-photo-absolute">
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
            </div>
            {/* หน้าที่ 2: ประวัติการซ่อมบำรุงรักษา */}
            <div className="a4-landscape-page page-break-before-always">
                {/* ส่วนหัวเอกสาร หน้า 2 */}
                <div className="print-header-title print-maint-header-title">
                    บันทึกการซ่อม/ปรับปรุงแก้ไขพัสดุ
                </div>
                <div className="print-maint-header-subtitle">
                    <div>
                        <strong>ประเภทพัสดุ:</strong> <span className="dotted-line print-maint-tag-width-180">{data.category}</span>
                    </div>
                    <div>
                        <strong>ชื่อพัสดุ:</strong> <span className="dotted-line print-maint-tag-width-280">{data.assetName}</span>
                    </div>
                    <div>
                        <strong>รหัสพัสดุ:</strong> <span className="dotted-line print-maint-tag-width-160">{data.assetCode}</span>
                    </div>
                </div>
                <table className="card-maint-table print-maint-main-table">
                    <thead>
                        <tr className="print-maint-row-header">
                            <th className="print-maint-th-common print-maint-th-index">
                                <AutoFitText text="ครั้งที่" />
                            </th>
                            <th className="print-maint-th-common print-maint-th-doc">
                                <AutoFitText text="เลขที่หนังสืออนุมัติ" />
                            </th>
                            <th className="print-maint-th-common print-maint-th-date">
                                <AutoFitText text="ลงวันที่" />
                            </th>
                            <th className="print-maint-th-common print-maint-th-desc">
                                <AutoFitText text="รายการซ่อม/ปรับปรุงแก้ไข" />
                            </th>
                            <th className="print-maint-th-common print-maint-th-cost">
                                <AutoFitText text="จำนวนเงิน" />
                            </th>
                            <th className="print-maint-th-common print-maint-th-contractor">
                                <AutoFitText text="ผู้ซ่อม/ปรับปรุง" />
                            </th>
                            <th className="print-maint-th-common print-maint-th-remarks">
                                <AutoFitText text="หมายเหตุ" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {asset.maintenances && asset.maintenances.length > 0 ? (
                            asset.maintenances.map((maint, idx) => (
                                <tr key={maint.id || idx}>
                                    <td className="print-maint-cell-center">
                                        {idx + 1}
                                    </td>
                                    <td className="print-maint-cell-center">
                                        <AutoFitText text={maint.document_number ? formatThaiDateString(maint.document_number) : '-'} />
                                    </td>
                                    <td className="print-maint-cell-common">
                                        <AutoFitText text={maint.approval_date ? formatThaiDateString(maint.approval_date) : '-'} />
                                    </td>
                                    <td className="print-maint-cell-common">
                                        <AutoFitText text={maint.description || '-'} />
                                    </td>
                                    <td className="print-maint-cell-right">
                                        <AutoFitText text={(maint.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
                                    </td>
                                    <td className="print-maint-cell-common">
                                        <AutoFitText text={maint.contractor || '-'} />
                                    </td>
                                    <td className="print-maint-cell-common">
                                        <AutoFitText text={maint.remark || maint.notes || '-'} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="print-maint-cell-empty-state">
                                    ไม่มีประวัติการซ่อมบำรุงรักษาสำหรับพัสดุรายการนี้
                                </td>
                            </tr>
                        )}
                        {/* Fill empty rows to make it look like a standard official ledger form (at least 8 rows total) */}
                        {Array.from({ length: Math.max(0, 8 - (asset.maintenances ? asset.maintenances.length : 0)) }).map((_, idx) => (
                            <tr key={`empty-${idx}`}>
                                <td className="print-maint-cell-empty-filler">&nbsp;</td>
                                <td className="print-maint-cell-empty-filler">&nbsp;</td>
                                <td className="print-maint-cell-empty-filler">&nbsp;</td>
                                <td className="print-maint-cell-empty-filler">&nbsp;</td>
                                <td className="print-maint-cell-empty-filler">&nbsp;</td>
                                <td className="print-maint-cell-empty-filler">&nbsp;</td>
                                <td className="print-maint-cell-empty-filler">&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}