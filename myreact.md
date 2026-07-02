# My React Development Best Practices

เอกสารสรุปแนวทางการเขียนและจัดการโปรเจกต์ React ให้มีประสิทธิภาพ สะอาด ปลอดภัย และบำรุงรักษาง่าย (Clean, Efficient, and Maintainable React Code)

---

## 1. Principles of Component Writing (แนวทางการเขียน Component)

### 📌 Single Responsibility Principle (SRP)
* **หลักการ:** หนึ่ง Component ควรทำหน้าที่เพียงอย่างเดียวเท่านั้น
* **แนวทางปฏิบัติ:** หากเริ่มรู้สึกว่าไฟล์เริ่มยาวเกินไป (เช่น เกิน 200–300 บรรทัด) ให้พิจารณาแยก (Refactor) ออกเป็น Component ย่อยๆ ทันที

### 📌 Focus on Functional Components + Hooks
* **หลักการ:** เลิกใช้ Class Components และหันมาใช้ Functional Components ควบคู่กับ React Hooks ทั้งหมด
* **ข้อดี:** ช่วยให้โค้ดสั้น กระชับ อ่านง่าย และเอื้อต่อการเขียน Unit Test มากขึ้น

### 📌 Separate Logic from UI (Custom Hooks)
* **หลักการ:** แยกส่วนคำนวณหรือจัดการข้อมูล (Logic) ออกจากส่วนแสดงผล (UI)
* **แนวทางปฏิบัติ:** หาก Component มีการคำนวณที่ซับซ้อน หรือมีการดึงข้อมูลจาก API (Data Fetching) ให้ย้ายโค้ดส่วนนั้นไปไว้ใน **Custom Hook** เพื่อให้โค้ดหน้า UI อ่านง่ายและเป็นระเบียบ
* **ตัวอย่าง:**
    * ❌ *ไม่แนะนำ:* เขียน `useEffect` เพื่อดึงข้อมูลตรงๆ ในหน้า UI Component
    * 💡 *แนะนำ:* แยกไปใช้ `const { data, isLoading } = useGetProducts()` แทน

---

## 2. Efficient State Management (การบริหารจัดการ State อย่างมีประสิทธิภาพ)

### 🔹 Keep State Local
* หากข้อมูลนั้นถูกใช้งานเฉพาะภายใน Component เดียว หรือส่งต่อไปยัง Component ลูกเพียงชั้นเดียว (1 Child Level) ให้ใช้เพียง `useState` ระดับท้องถิ่นก็พอ ไม่มีความจำเป็นต้องส่งขึ้นไปที่ Global State

### 🔹 Choose the appropriate Global State
เลือกเครื่องมือจัดการข้อมูลส่วนกลางให้เหมาะสมกับขนาดของแอปพลิเคชัน:
* **แอปพลิเคชันขนาดเล็ก - กลาง:** เลือกใช้ **React Context API** ร่วมกับ `useReducer`
* **แอปพลิเคชันขนาดใหญ่ / ซับซ้อน:** เลือกใช้คลังเก็บข้อมูลภายนอก (External Repository) เช่น:
    * **Zustand:** มีน้ำหนักเบามาก (Lightweight) และใช้งานง่าย ไม่ซับซ้อน
    * **Redux Toolkit:** เหมาะสำหรับระบบที่ต้องการความแม่นยำสูง (High Precision) และโครงสร้างที่ชัดเจน

### 🔹 Separate Server State
* **แนวทางปฏิบัติ:** สำหรับข้อมูลที่ดึงมาจาก API แนะนำให้ใช้ **TanStack Query (React Query)** แทนการเก็บข้อมูลเหล่านั้นไว้ใน Redux หรือ Zustand โดยตรง
* **ข้อดี:** มีระบบ Caching ในตัว, รองรับ Auto-refetching (ดึงข้อมูลใหม่ให้อัตโนมัติ) และช่วยจัดการสถานะ Loading / Error ให้โดยอัตโนมัติ

---

## 3. Performance Optimization (การปรับแต่งประสิทธิภาพ)

### ⚡ Avoid Unnecessary Re-rendering
หลีกเลี่ยงการประมวลผลซ้ำที่ไม่จำเป็นเมื่อ Component มีการอัปเดต:
* ใช้ **`useMemo`** สำหรับการคำนวณที่ซับซ้อนและกินทรัพยากรสูง เพื่อไม่ให้ต้องคำนวณใหม่ทุกรอบที่ Re-render
* ใช้ **`useCallback`** เพื่อล็อกฟังก์ชัน (Lock Function Reference) ไม่ให้สร้างขึ้นใหม่ทุกครั้งที่ Component ประมวลผล ช่วยป้องกันไม่ให้ Component ลูกต้อง Re-render ตามไปด้วยโดยไม่จำเป็น

### ⚡ Implement Code Splitting (Lazy Loading)
* **แนวทางปฏิบัติ:** ใช้ **`React.lazy()`** และ **`Suspense`** ในการดาวน์โหลดหน้าเว็บตามเส้นทาง (Route) ที่ผู้ใช้เข้าถึงจริง
* **ข้อดี:** ช่วยลดขนาดไฟล์ Bundle เริ่มต้น (Initial Bundle Size) ส่งผลให้เว็บไซต์เปิดใช้งานครั้งแรกได้เร็วขึ้นอย่างเห็นได้ชัด

---

## 4. Security & Code Quality (ความปลอดภัยและคุณภาพของโค้ด)

### 🔒 Use TypeScript
* เป็นมาตรฐานอุตสาหกรรมในปัจจุบัน (Industry Standard) ช่วยลดข้อผิดพลาดจากการส่งข้อมูลผิดประเภท (Data Type) และมีระบบ Auto-complete ช่วยประหยัดเวลาและเพิ่มความเร็วในการเขียนโค้ดได้อย่างมาก

### 🔒 Setting up Linter and Formatter
* ติดตั้งและเปิดใช้งาน **ESLint** (พร้อม React Plugins) และ **Prettier** เพื่อบังคับให้ทีมพัฒนาเขียนโค้ดในรูปแบบเดียวกัน (Consistent Style) และช่วยตรวจจับจุดบกพร่อง (Bugs) ได้ทันทีในขณะที่กำลังพิมพ์โค้ด

### 🔒 Managing Environment Variables
* ข้อมูลที่เป็นความลับ เช่น API Keys หรือ Credentials ต่างๆ **ต้องถูกเก็บไว้ในไฟล์ `.env` เสมอ** และห้าม Commit ไฟล์นี้ขึ้นไปยัง GitHub หรือ Public Repository โดยเด็ดขาด (ควรเพิ่มชื่อไฟล์ไว้ใน `.gitignore`)

---

## 5. Testability Code (การเขียนโค้ดเพื่อให้ทดสอบง่าย)

### 🧪 Write Pure Functions
* เขียนฟังก์ชันในส่วนของ Logic ให้เป็น **Pure Function** (ฟังก์ชันที่รับ Input แบบเดิม แล้วจะส่ง Output หน้าตาเดิมกลับมาเสมอ โดยไม่มี Side Effect) เพื่อให้สามารถเขียน Unit Test ได้ง่ายที่สุด

### 🧪 User-centric Testing Tools
* เลือกใช้เครื่องมืออย่าง **Vitest** หรือ **Jest** ควบคู่กับ **React Testing Library** ในการทดสอบพฤติกรรมของ UI จากมุมมองของผู้ใช้งานจริง (User-centric Perspective)
