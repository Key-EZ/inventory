export default function InventoryPrint({ asset, onClose }) {
    // Fallback data if no asset is passed
    const defaultData = {
        category: "ค.สำนักงาน",
        agency: "เทศบาลตำบลเสาธงหิน",
        office: "สำนักงาน",
        amphoe: "บางใหญ่",
        province: "นนทบุรี",
        assetCode: "๔๐๐/๖๓/๐ 654",
        assetName: "โต๊ะอเนกประสงค์",
        acquiredFrom: "ร้าน เอสซี",
        acquiredDate: "๒๗ พ.ศ. ๖๓",
        budgetSource: "ทต.เสาธงหิน",
        price: "๕,๕๓๓.๓๓",
        brand: "พานาโซนิค",
        model: "-",
        carNumber: "-",
        engineNumber: "-",
        chassisNumber: "-",
        registrationNumber: "-",
        color: "ดำ",
        other: "-",
        warrantyUntil: "-",
        warrantyCompany: "-",
        warrantyDate: "-",
        depreciation: [
            { year: "ปีที่ ๑", rate: "", balance: "" },
            { year: "ปีที่ ๒", rate: "", balance: "" },
            { year: "ปีที่ ๓", rate: "", balance: "" },
            { year: "ปีที่ ๔", rate: "", balance: "" },
            { year: "ปีที่ ๕", rate: "", balance: "" },
        ],
        history: [
            { year: "๒๕๖๔", department: "กองสาธารณสุขฯ", user: "-", head: "นางพรรณี ปัทมนิรันตร์กุล\n(พยาบาลวิชาชีพชำนาญการ)" },
            { year: "๒๕๖๕", department: "กองสาธารณสุขฯ", user: "-", head: "นางพรรณี ปัทมนิรันตร์กุล\n(พยาบาลวิชาชีพชำนาญการ)" },
            { year: "", department: "", user: "", head: "" },
        ],
        disposalDate: "-",
        disposalMethod: "-",
        disposalDocNo: "-",
        disposalPrice: "-",
        profit: "-",
        benefits: []
    };

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
        if (!asset) return defaultData;

        const code = asset.asset_code || '';
        const parts = code.split('-');
        let yearBE = '67';
        if (parts.length >= 2) {
            yearBE = parts[1];
        }

        const depList = getYearsDepreciation(asset.unit_price, asset.depreciation_rate_percent || 10);

        return {
            category: asset.category || "ครุภัณฑ์",
            agency: "เทศบาลตำบลเสาธงหิน",
            office: asset.responsible_department || "สำนักงาน",
            amphoe: "บางใหญ่",
            province: "นนทบุรี",
            assetCode: asset.asset_code || "-",
            assetName: asset.name || "-",
            acquiredFrom: asset.acquisition_method || "-",
            acquiredDate: `พ.ศ. 25${yearBE}`,
            budgetSource: asset.budget_owner || "-",
            price: (asset.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            brand: asset.manufacturer_brand || "-",
            model: asset.building_style || "-",
            carNumber: asset.vehicle_registration || "-",
            engineNumber: asset.engine_number || "-",
            chassisNumber: asset.chassis_number || "-",
            registrationNumber: asset.vehicle_registration || "-",
            color: asset.color || "-",
            other: asset.approval_document || "-",
            warrantyUntil: asset.warranty_detail || "-",
            warrantyCompany: asset.warranty_detail || "-",
            warrantyDate: "-",
            depreciation: depList.slice(0, 5),
            history: [
                { year: `25${yearBE}`, department: asset.responsible_department || "-", user: "-", head: "-" },
                { year: "", department: "", user: "", head: "" },
                { year: "", department: "", user: "", head: "" },
            ],
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
            <div className="no-print-zone" style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handlePrint} className="print-btn">
                    🖨️ สั่งพิมพ์เอกสาร (A4 แนวนอน)
                </button>
                {onClose && (
                    <button onClick={onClose} className="print-btn" style={{ backgroundColor: '#6c757d' }}>
                        ❌ ปิดหน้าต่าง
                    </button>
                )}
            </div>

            {/* หน้าเอกสารควบคุมสัดส่วน */}
            <div className="a4-landscape-page">
                <style>{`
          @style {
            font-family: 'Sarabun', 'TH Sarabun PSK', sans-serif;
            box-sizing: border-box;
          }
          .preview-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #525659;
            padding: 20px;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow-y: auto;
            box-sizing: border-box;
          }
          .no-print-zone {
            margin-bottom: 20px;
          }
          .print-btn {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }
          .print-btn:hover {
            background-color: #0056b3;
          }

          /* ตั้งค่าหน้ากระดาษ A4 แนวนอนสำหรับ Preview */
          .a4-landscape-page {
            background: white;
            width: 297mm;
            height: 210mm;
            padding: 10mm 15mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            box-sizing: border-box;
            position: relative;
            font-size: 14px;
            line-height: 1.4;
            color: #000;
          }

          /* โครงสร้างตารางหลัก */
          .form-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .form-table td {
            border: 1px solid #000;
            vertical-align: top;
            padding: 5px;
            position: relative;
          }

          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          
          .header-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
          }
          
          .dotted-line {
            border-bottom: 1px dotted #000;
            padding-left: 5px;
            display: inline-block;
          }

          /* CSS สำหรับการพิมพ์ */
          @media print {
            body, .preview-container {
              background: none;
              padding: 0;
              margin: 0;
              position: static;
              height: auto;
              width: auto;
              overflow: visible;
            }
            .no-print-zone {
              display: none;
            }
            .a4-landscape-page {
              width: 297mm;
              height: 210mm;
              box-shadow: none;
              padding: 10mm 15mm;
              page-break-after: always;
            }
            @page {
              size: A4 landscape;
              margin: 0;
            }
          }
        `}</style>

                {/* ส่วนหัวเอกสาร */}
                <div className="header-title">ทะเบียนพัสดุครุภัณฑ์ ปศุสัตว์และสัตว์พาหนะ </div>

                <table className="form-table">
                    <tbody>
                        {/* แถวที่ 1: ข้อมูลหน่วยงาน */}
                        <tr>
                            <td colSpan="2" style={{ width: '40%' }}>
                                <strong>ประเภท</strong> <span className="dotted-line" style={{ width: '80%' }}>{data.category}</span>
                            </td>
                            <td colSpan="2" style={{ width: '40%' }}>
                                <strong>ส่วนราชการ:</strong> <span className="dotted-line" style={{ width: '70%' }}>{data.agency}</span><br />
                                <strong>สำนักงาน:</strong> <span className="dotted-line" style={{ width: '73%' }}>{data.office}</span><br />
                                <strong>อำเภอ:</strong> <span className="dotted-line" style={{ width: '30%' }}>{data.amphoe}</span>
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
                                <div style={{ minHeight: '35px', fontSize: '12px' }}></div>
                            </td>
                        </tr>

                        {/* แถวที่ 3: รายละเอียดสเปค และ ข้อมูลราคา/ค่าเสื่อม */}
                        <tr>
                            {/* ฝั่งซ้าย: ข้อมูลจำเพาะทางเทคนิค */}
                            <td colSpan="2" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                                ใบส่งของ: <span className="dotted-line" style={{ width: '75%' }}></span><br />
                                ชื่อ/ยี่ห้อผู้ทำหรือผลิต: <span className="dotted-line" style={{ width: '55%' }}>{data.brand}</span><br />
                                แบบ/ชนิด/ลักษณะ: <span className="dotted-line" style={{ width: '60%' }}>{data.model}</span><br />
                                หมายเลขตัวรถ: <span className="dotted-line" style={{ width: '70%' }}>{data.carNumber}</span><br />
                                หมายเลขเครื่อง (ถ้ามี): <span className="dotted-line" style={{ width: '58%' }}>{data.engineNumber}</span><br />
                                หมายเลขกรอบ (ถ้ามี): <span className="dotted-line" style={{ width: '58%' }}>{data.chassisNumber}</span><br />
                                หมายเลขจดทะเบียน (ถ้ามี): <span className="dotted-line" style={{ width: '53%' }}>{data.registrationNumber}</span><br />
                                สีของพัสดุ: <span className="dotted-line" style={{ width: '75%' }}>{data.color}</span><br />
                                อื่นๆ (ถ้ามีระบุ): <span className="dotted-line" style={{ width: '70%' }}>{data.other}</span>
                            </td>

                            {/* ฝั่งกลาง: ราคาและการคำนวณค่าเสื่อม */}
                            <td colSpan="2" style={{ fontSize: '12px' }}>
                                ซื้อ/จ้าง/ได้มา เมื่อวันที่: <span className="dotted-line" style={{ width: '45%' }}>{data.acquiredDate}</span><br />
                                ใช้งบประมาณของ: <span className="dotted-line" style={{ width: '60%' }}>{data.budgetSource}</span><br />
                                ราคา: <span className="dotted-line" style={{ width: '80%' }}>{data.price}</span> บาท

                                <div style={{ marginTop: '5px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                                    <strong className="text-center style-block">ค่าเสื่อมราคา</strong>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '3px' }}>
                                        <tbody>
                                            {data.depreciation.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ border: 'none', padding: '1px' }}>{item.year}:</td>
                                                    <td style={{ border: 'none', padding: '1px' }}><span className="dotted-line" style={{ width: '30px' }}>{item.rate}</span> %</td>
                                                    <td style={{ border: 'none', padding: '1px' }}>คงเหลือราคา <span className="dotted-line" style={{ width: '60px' }}>{item.balance}</span> บาท</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </td>

                            {/* ฝั่งขวา: ประวัติผู้ใช้งานพัสดุ */}
                            <td style={{ fontSize: '11px', padding: '2px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                                    <thead>
                                        <tr style={{ background: '#f2f2f2' }}>
                                            <th style={{ border: '1px solid #000', padding: '2px' }}>พ.ศ.</th>
                                            <th style={{ border: '1px solid #000', padding: '2px' }}>ชื่อส่วนราชการ</th>
                                            <th style={{ border: '1px solid #000', padding: '2px' }}>ชื่อผู้ใช้/หัวหน้า</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.history.map((hist, idx) => (
                                            <tr key={idx} style={{ height: '40px' }}>
                                                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{hist.year}</td>
                                                <td style={{ border: '1px solid #000' }}>{hist.department}</td>
                                                <td style={{ border: '1px solid #000', fontSize: '9px', whiteSpace: 'pre-line' }}>
                                                    {hist.head || hist.user}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ border: '1px dashed #999', marginTop: '5px', height: '50px', textAlign: 'center', paddingTop: '15px', color: '#666' }}>
                                    [ รูปถ่ายพัสดุถ้ามี ]
                                </div>
                            </td>
                        </tr>

                        {/* แถวที่ 4: การประกันภัย และ การจำหน่าย */}
                        <tr>
                            <td colSpan="2" style={{ fontSize: '12px' }}>
                                <strong>เงื่อนไขการประกัน</strong><br />
                                พัสดุรับประกันถึงวันที่: <span className="dotted-line" style={{ width: '55%' }}>{data.warrantyUntil}</span><br />
                                พัสดุประกันไว้ที่บริษัท: <span className="dotted-line" style={{ width: '53%' }}>{data.warrantyCompany}</span><br />
                                วันที่ประกันพัสดุ: <span className="dotted-line" style={{ width: '60%' }}>{data.warrantyDate}</span>
                            </td>
                            <td colSpan="3" style={{ fontSize: '12px' }}>
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
                                <div style={{ padding: '3px', background: '#f9f9f9', fontSize: '12px', borderBottom: '1px solid #000' }}>
                                    <strong>การหาผลประโยชน์ในพัสดุ</strong>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ borderRight: '1px solid #000', padding: '2px', width: '10%' }}>พ.ศ.</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '2px', width: '40%' }}>รายการ</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '2px', width: '15%' }}>ผลประโยชน์ (บาท)</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '2px', width: '10%' }}>พ.ศ.</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '2px', width: '15%' }}>รายการ</th>
                                            <th style={{ padding: '2px', width: '10%' }}>ผลประโยชน์ (บาท)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ height: '25px' }}>
                                            <td style={{ borderTop: '1px solid #000', borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderTop: '1px solid #000', borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderTop: '1px solid #000', borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderTop: '1px solid #000', borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderTop: '1px solid #000', borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderTop: '1px solid #000' }}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}