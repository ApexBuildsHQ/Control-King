import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SOURCE_DIR = path.join(process.cwd(), 'raw_data');
const TEMP_DIR = path.join(process.cwd(), 'temp_sources');
const OUTPUT_DIR = path.join(process.cwd(), 'public/data/remotes');
const BRANDS_FILE = path.join(process.cwd(), 'public/data/brands.json');

// 1. خريطة توحيد مسميات الأقسام (الأجهزة) إلى أسماء قصيرة
function normalizeCategory(rawCat) {
  const cleaned = cleanText(rawCat);

  // AC / التكييفات
  if (/^(ac|acs|air|climate|hvac|air_conditioner|air_conditioners|aircon|cool)$/.test(cleaned) || cleaned.includes('climate') || cleaned.includes('air_cond')) {
    return 'ac';
  }
  // TV / الشاشات
  if (/^(tv|tvs|television|televisions|smart_tv|display|monitors)$/.test(cleaned) || cleaned.includes('tv')) {
    return 'tv';
  }
  // Receiver / أجهزة الاستقبال والستلايت
  if (/^(receiver|receivers|sat|sats|satellite|cable|cable_boxes|stb|set_top_box|decoder|box)$/.test(cleaned) || cleaned.includes('sat') || cleaned.includes('cable')) {
    return 'receiver';
  }
  // Audio / الصوتيات والمسرح المنزلي
  if (/^(audio|sound|speaker|speakers|soundbar|media_player|media|amp|amplifier|dvd|bluray|hifi)$/.test(cleaned) || cleaned.includes('audio') || cleaned.includes('sound') || cleaned.includes('media')) {
    return 'audio';
  }
  // Fan / الموح والمُنقيات
  if (/^(fan|fans|purifier|air_purifier)$/.test(cleaned) || cleaned.includes('fan')) {
    return 'fan';
  }
  // Projector / العارض الضوئي
  if (/^(projector|projectors|beamer)$/.test(cleaned) || cleaned.includes('projector')) {
    return 'projector';
  }

  return 'general';
}

// 2. خريطة توحيد مسميات الأزرار الموحدة والشاملة لكافة الأجهزة
const GLOBAL_BUTTON_MAP = {
  // TV & Receivers
  'PWR': 'power', 'POWER': 'power', 'POWER_OFF': 'power', 'ON/OFF': 'power', 'STANDBY': 'power',
  'VOL+': 'vol_up', 'VOL_UP': 'vol_up', 'VOLUME_UP': 'vol_up', 'PLUS': 'vol_up',
  'VOL-': 'vol_down', 'VOL_DOWN': 'vol_down', 'VOLUME_DOWN': 'vol_down', 'MINUS': 'vol_down',
  'MUTE': 'mute', 'SILENT': 'mute', 'MUTING': 'mute',
  'CH+': 'ch_up', 'CH_UP': 'ch_up', 'CHANNEL_UP': 'ch_up', 'PAGE_UP': 'ch_up',
  'CH-': 'ch_down', 'CH_DOWN': 'ch_down', 'CHANNEL_DOWN': 'ch_down', 'PAGE_DOWN': 'ch_down',
  'MENU': 'menu', 'SETUP': 'menu', 'SETTINGS': 'menu',
  'HOME': 'home', 'SMART': 'home', 'HUB': 'home',
  'BACK': 'back', 'RETURN': 'back', 'EXIT': 'exit', 'CANCEL': 'exit',
  'OK': 'ok', 'ENTER': 'ok', 'SELECT': 'ok',
  'UP': 'nav_up', 'DPAD_UP': 'nav_up',
  'DOWN': 'nav_down', 'DPAD_DOWN': 'nav_down',
  'LEFT': 'nav_left', 'DPAD_LEFT': 'nav_left',
  'RIGHT': 'nav_right', 'DPAD_RIGHT': 'nav_right',
  'SOURCE': 'input', 'INPUT': 'input', 'AV': 'input', 'HDMI': 'input',
  'RED': 'btn_red', 'GREEN': 'btn_green', 'YELLOW': 'btn_yellow', 'BLUE': 'btn_blue',

  // Air Conditioners (AC)
  'TEMP+': 'temp_up', 'TEMP_UP': 'temp_up', 'WARMER': 'temp_up',
  'TEMP-': 'temp_down', 'TEMP_DOWN': 'temp_down', 'COOLER': 'temp_down',
  'MODE': 'ac_mode', 'OPERATION_MODE': 'ac_mode',
  'COOL': 'mode_cool', 'HEAT': 'mode_heat', 'FAN_ONLY': 'mode_fan', 'DRY': 'mode_dry', 'AUTO_MODE': 'mode_auto',
  'FAN_SPEED': 'fan_speed', 'FAN': 'fan_speed', 'SPEED': 'fan_speed',
  'SWING': 'swing_v', 'V_SWING': 'swing_v', 'SWING_H': 'swing_h', 'L_R_SWING': 'swing_h',
  'TURBO': 'turbo', 'JET': 'turbo', 'POWERFUL': 'turbo', 'SUPER': 'turbo',
  'ECO': 'eco', 'SLEEP': 'sleep', 'SAVER': 'eco',
  'TIMER': 'timer', 'TIMER_ON': 'timer_on', 'TIMER_OFF': 'timer_off',

  // Audio & DVD
  'PLAY': 'media_play', 'PAUSE': 'media_pause', 'PLAY/PAUSE': 'media_play_pause',
  'STOP': 'media_stop', 'REC': 'record',
  'NEXT': 'next_track', 'PREV': 'prev_track', 'SKIP_FWD': 'next_track', 'SKIP_BWD': 'prev_track',
  'BASS': 'audio_bass', 'TREBLE': 'audio_treble', 'EQ': 'audio_eq', 'SURROUND': 'audio_surround',

  // Fans & Purifiers
  'OSCIL': 'oscillation', 'SWING_FAN': 'oscillation', 'ROTATE': 'oscillation',
  'SPEED+': 'speed_up', 'SPEED-': 'speed_down',
  'LIGHT': 'light_toggle', 'LAMP': 'light_toggle',

  // Projectors
  'KEYSTONE+': 'keystone_up', 'KEYSTONE-': 'keystone_down',
  'ZOOM+': 'zoom_in', 'ZOOM-': 'zoom_out',
  'FREEZE': 'freeze_frame', 'BLANK': 'blank_screen'
};

const brandsCatalog = {
  tv: [],
  ac: [],
  receiver: [],
  audio: [],
  fan: [],
  projector: [],
  general: []
};

function cleanText(str) {
  return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

function normalizeButton(rawBtn) {
  const rawKey = String(rawBtn.key || rawBtn.label || rawBtn.id || '').toUpperCase().trim();
  const standardId = GLOBAL_BUTTON_MAP[rawKey] || cleanText(rawKey);

  return {
    id: standardId,
    label: rawBtn.label || rawBtn.key || standardId,
    code: rawBtn.code,
    type: rawBtn.type || 'IR'
  };
}

function getCategoryIcon(catId) {
  switch (catId) {
    case 'ac': return 'wind';
    case 'audio': return 'speaker';
    case 'fan': return 'fan';
    case 'projector': return 'projector';
    case 'tv':
    case 'receiver':
    default: return 'tv';
  }
}

// 1. معالجة الملفات المحلية داخل raw_data
function parseLocalRawData() {
  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    return;
  }

  console.log('📂 Processing local raw_data files...');
  const files = fs.readdirSync(SOURCE_DIR);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      try {
        const rawContent = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf-8');
        const parsed = JSON.parse(rawContent);

        const categoryId = normalizeCategory(parsed.categoryId || parsed.category || 'general');
        const brandId = cleanText(parsed.brandId || parsed.brand || 'generic');
        const buttons = (parsed.buttons || []).map(normalizeButton);

        if (buttons.length > 0) {
          saveRemoteConfig(categoryId, brandId, parsed.protocol || 'NEC', parsed.frequency || 38000, parsed.ipEndpoint || null, buttons);
        }
      } catch (err) {
        console.error(`❌ Error parsing local file ${file}:`, err);
      }
    }
  });
}

// 2. تنزيل استنساخ المستودعات المفتوحة العملاقة (Flipper-IRDB & SmartIR)
function cloneRepositories() {
  console.log('🔄 Downloading open-source remote databases...');
  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  try {
    execSync(`git clone --depth 1 https://github.com/Lucaslhm/Flipper-IRDB.git ${path.join(TEMP_DIR, 'flipper')}`, { stdio: 'ignore' });
    execSync(`git clone --depth 1 https://github.com/smartHomeHub/SmartIR.git ${path.join(TEMP_DIR, 'smartir')}`, { stdio: 'ignore' });
    console.log('✅ Open-source repositories downloaded successfully.');
  } catch (err) {
    console.error('⚠️ Warning during repository download:', err.message);
  }
}

// 3. قراءة وتحليل ملفات Flipper IRDB (.ir)
function parseFlipperFiles() {
  const flipperDir = path.join(TEMP_DIR, 'flipper');
  if (!fs.existsSync(flipperDir)) return;

  const categories = fs.readdirSync(flipperDir);
  categories.forEach(category => {
    const categoryPath = path.join(flipperDir, category);
    if (!fs.statSync(categoryPath).isDirectory() || category.startsWith('.')) return;

    const catId = normalizeCategory(category);
    const files = fs.readdirSync(categoryPath);

    files.forEach(file => {
      if (!file.endsWith('.ir')) return;
      const brandId = cleanText(file.replace('.ir', ''));
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const buttons = [];
      let currentButton = {};

      content.split('\n').forEach(line => {
        line = line.trim();
        if (line.startsWith('name:')) {
          currentButton.key = line.replace('name:', '').trim();
        } else if (line.startsWith('code:')) {
          currentButton.code = line.replace('code:', '').trim();
          buttons.push(normalizeButton(currentButton));
          currentButton = {};
        }
      });

      if (buttons.length > 0) {
        saveRemoteConfig(catId, brandId, 'NEC', 38000, null, buttons);
      }
    });
  });
}

// 4. قراءة وتحليل ملفات SmartIR (.json)
function parseSmartIRFiles() {
  const smartirDir = path.join(TEMP_DIR, 'smartir/codes');
  if (!fs.existsSync(smartirDir)) return;

  const categories = fs.readdirSync(smartirDir);
  categories.forEach(category => {
    const catPath = path.join(smartirDir, category);
    if (!fs.statSync(catPath).isDirectory()) return;

    const catId = normalizeCategory(category);
    const files = fs.readdirSync(catPath);

    files.forEach(file => {
      if (!file.endsWith('.json')) return;
      try {
        const data = JSON.parse(fs.readFileSync(path.join(catPath, file), 'utf-8'));
        const brandId = cleanText(data.manufacturer || file.replace('.json', ''));

        const buttons = [];
        if (data.commands) {
          Object.keys(data.commands).forEach(key => {
            buttons.push(normalizeButton({
              key,
              code: typeof data.commands[key] === 'string' ? data.commands[key] : JSON.stringify(data.commands[key]),
              type: data.supportedModels ? 'WIFI' : 'IR'
            }));
          });
        }

        if (buttons.length > 0) {
          saveRemoteConfig(catId, brandId, data.protocol || 'RAW', 38000, null, buttons);
        }
      } catch (e) {}
    });
  });
}

// 5. حفظ وحفظ بيانات الريموت وإنشاء الفهرس الديناميكي
function saveRemoteConfig(categoryId, brandId, protocol, frequency, ipEndpoint, buttons) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const fileName = `${categoryId}_${brandId}.json`;
  const remoteData = { categoryId, brandId, protocol, frequency, ipEndpoint, buttons };

  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), JSON.stringify(remoteData, null, 2));

  if (!brandsCatalog[categoryId]) brandsCatalog[categoryId] = [];
  if (!brandsCatalog[categoryId].some(b => b.id === brandId)) {
    brandsCatalog[categoryId].push({
      id: brandId,
      name: brandId.toUpperCase().replace(/_/g, ' '),
      icon: getCategoryIcon(categoryId)
    });
  }
}

// 6. تشغيل النظام الشامل
function run() {
  console.log('🚀 Starting Unified Remote Data Processing...');
  parseLocalRawData();
  cloneRepositories();
  parseFlipperFiles();
  parseSmartIRFiles();

  // إنشاء وتنظيم brands.json تلقائياً
  const brandsDir = path.dirname(BRANDS_FILE);
  if (!fs.existsSync(brandsDir)) fs.mkdirSync(brandsDir, { recursive: true });
  fs.writeFileSync(BRANDS_FILE, JSON.stringify(brandsCatalog, null, 2));

  // تنظيف المجلدات المؤقتة
  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('🎉 Processing Complete! brands.json and remotes datasets are fully consolidated.');
}

run();
