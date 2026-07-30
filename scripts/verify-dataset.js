import fs from 'fs';
import path from 'path';

const REMOTES_DIR = path.join(process.cwd(), 'public/data/remotes');
const BRANDS_FILE = path.join(process.cwd(), 'public/data/brands.json');

const VALID_CATEGORIES = [
  'tv', 'ac', 'receiver', 'audio', 'fan', 
  'projector', 'gaming', 'lighting', 'purifier', 'camera', 'media_player'
];

let totalErrors = 0;
let totalWarnings = 0;

console.log('🔍 Starting AI-like Dataset Verification and Quality Control...\n');

// 1. التحقق من وجود ملف الماركات الرئيسي
if (!fs.existsSync(BRANDS_FILE)) {
  console.error('❌ CRITICAL ERROR: brands.json file is missing!');
  process.exit(1);
}

const brandsData = JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf-8'));

// 2. الفحص الأول: التأكد من عدم وجود قسم general نهائياً
if (brandsData.general) {
  console.error('❌ ERROR: "general" category still exists in brands.json!');
  totalErrors++;
} else {
  console.log('✅ PASS: No "general" category found in catalog.');
}

// 3. الفحص الثاني: فحص صحة شفرات الـ IR و Wi-Fi لكل جهاز
const remoteFiles = fs.readdirSync(REMOTES_DIR).filter(f => f.endsWith('.json'));

remoteFiles.forEach(file => {
  const filePath = path.join(REMOTES_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // أ. التحقق من القسم
  if (!VALID_CATEGORIES.includes(data.categoryId)) {
    console.error(`❌ [${file}] Invalid Category: "${data.categoryId}". Not in allowed list!`);
    totalErrors++;
  }

  // ب. التحقق من الأزرار والشفرات
  if (!Array.isArray(data.buttons) || data.buttons.length === 0) {
    console.warn(`⚠️ [${file}] Warning: Remote has no buttons configured.`);
    totalWarnings++;
  } else {
    const seenButtonIds = new Set();

    data.buttons.forEach((btn, index) => {
      // التأكد من عدم تكرار الزر
      if (seenButtonIds.has(btn.id)) {
        console.warn(`⚠️ [${file}] Duplicate button ID "${btn.id}" detected at index ${index}.`);
        totalWarnings++;
      }
      seenButtonIds.add(btn.id);

      // فحص صحة شفرات IR
      if (btn.ir) {
        if (!btn.ir.code || String(btn.ir.code).trim() === '') {
          console.error(`❌ [${file}] Button "${btn.id}" has invalid or empty IR code!`);
          totalErrors++;
        }
      }

      // فحص صحة شفرات Wi-Fi
      if (btn.wifi) {
        if (!btn.wifi.endpoint) {
          console.error(`❌ [${file}] Button "${btn.id}" has missing Wi-Fi endpoint!`);
          totalErrors++;
        }
      }

      // التأكد من أن الزر يملك إشارة واحدة على الأقل
      if (!btn.ir && !btn.wifi) {
        console.error(`❌ [${file}] Button "${btn.id}" has neither IR nor Wi-Fi configuration!`);
        totalErrors++;
      }
    });
  }
});

console.log('\n----------------------------------------');
console.log(`📊 Verification Summary:`);
console.log(`- Files Audited: ${remoteFiles.length}`);
console.log(`- Critical Errors: ${totalErrors}`);
console.log(`- Warnings: ${totalWarnings}`);
console.log('----------------------------------------\n');

if (totalErrors > 0) {
  console.error('❌ Verification FAILED. Please fix the errors before committing.');
  process.exit(1);
} else {
  console.log('🎉 Verification PASSED! Dataset is clean, consistent, and ready for production.');
}

