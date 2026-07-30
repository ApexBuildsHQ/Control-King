import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SOURCE_DIR = path.join(process.cwd(), 'raw_data');
const TEMP_DIR = path.join(process.cwd(), 'temp_sources');
const OUTPUT_DIR = path.join(process.cwd(), 'public/data/remotes');
const BRANDS_FILE = path.join(process.cwd(), 'public/data/brands.json');

// ذاكرة المؤقتة لدمج بيانات IR و Wi-Fi للماركة الواحدة
const remotesMap = new Map();

// 1. خريطة توحيد مسميات الأزرار الشاملة (جميع الأجهزة)
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
  'UP': 'nav_up', 'DPAD_UP': 'nav_up', 'DOWN': 'nav_down', 'DPAD_DOWN': 'nav_down',
  'LEFT': 'nav_left', 'DPAD_LEFT': 'nav_left', 'RIGHT': 'nav_right', 'DPAD_RIGHT': 'nav_right',
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

  // Audio & Media Players
  'PLAY': 'media_play', 'PAUSE': 'media_pause', 'PLAY/PAUSE': 'media_play_pause',
  'STOP': 'media_stop', 'REC': 'record',
  'NEXT': 'next_track', 'PREV': 'prev_track', 'SKIP_FWD': 'next_track', 'SKIP_BWD': 'prev_track',

  // Fans & Purifiers
  'OSCIL': 'oscillation', 'SWING_FAN': 'oscillation', 'ROTATE': 'oscillation',
  'SPEED+': 'speed_up', 'SPEED-': 'speed_down',
  'PURIFY': 'purify_mode', 'ION': 'ionizer', 'HEATER': 'heat_mode',

  // Projectors
  'KEYSTONE+': 'keystone_up', 'KEYSTONE-': 'keystone_down',
  'ZOOM+': 'zoom_in', 'ZOOM-': 'zoom_out',
  'FREEZE': 'freeze_frame', 'BLANK': 'blank_screen',

  // Gaming Consoles
  'CROSS': 'btn_a', 'A': 'btn_a', 'CIRCLE': 'btn_b', 'B': 'btn_b',
  'SQUARE': 'btn_x', 'X': 'btn_x', 'TRIANGLE': 'btn_y', 'Y': 'btn_y',
  'L1': 'btn_l1', 'R1': 'btn_r1', 'L2': 'btn_l2', 'R2': 'btn_r2',
  'START': 'btn_start', 'PS_BTN': 'home', 'XBOX_BTN': 'home',

  // Smart Lighting
  'BRIGHT_UP': 'brightness_up', 'BRIGHT_DOWN': 'brightness_down',
  'COLOR_R': 'color_red', 'COLOR_G': 'color_green', 'COLOR_B': 'color_blue', 'COLOR_W': 'color_white',
  'FLASH': 'effect_flash', 'FADE': 'effect_fade', 'SMOOTH': 'effect_smooth',

  // Cameras
  'SHUTTER': 'shutter_release', 'SHUTTER_DELAY': 'shutter_delay', 'AF_ON': 'focus'
};

// الأقسام الـ 11 المعتمدة حصراً بدلاً من general
const brandsCatalog = {
  tv: [],
  ac: [],
  receiver: [],
  audio: [],
  fan: [],
  projector: [],
  gaming: [],
  lighting: [],
  purifier: [],
  camera: [],
  media_player: []
};

function cleanText(str) {
  return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

function getAllFilesRecursive(dir, extension) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursive(filePath, extension));
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  });
  return results;
}

// 2. تصنيف الأجهزة الدقيق لمنع تسرب البيانات إلى general
function normalizeCategory(rawCat, buttons = []) {
  const cleaned = cleanText(rawCat);

  // 1. التكييفات
  if (/^(ac|acs|air|climate|hvac|air_conditioner|air_conditioners|aircon|cool)$/.test(cleaned) || cleaned.includes('climate') || cleaned.includes('air_cond')) return 'ac';
  
  // 2. البروجيكتور
  if (/^(projector|projectors|beamer)$/.test(cleaned) || cleaned.includes('projector')) return 'projector';
  
  // 3. الرسيفرات
  if (/^(receiver|receivers|sat|sats|satellite|cable|cable_boxes|stb|set_top_box|decoder|box)$/.test(cleaned) || cleaned.includes('sat') || cleaned.includes('cable')) return 'receiver';
  
  // 4. أجهزة منصات الألعاب
  if (/^(gaming|game|games|console|consoles|playstation|xbox|nintendo|ps2|ps3|ps4|ps5)$/.test(cleaned) || cleaned.includes('gaming') || cleaned.includes('playstation') || cleaned.includes('xbox')) return 'gaming';
  
  // 5. الإضاءة الذكية
  if (/^(lighting|light|lights|led|strip|bulb|bulbs|lamp|govee|yeelight)$/.test(cleaned) || cleaned.includes('light') || cleaned.includes('led')) return 'lighting';
  
  // 6. المنقيات والمدافئ
  if (/^(purifier|purifiers|air_purifier|heater|heaters|dyson|humidifier|dehumidifier)$/.test(cleaned) || cleaned.includes('purifi') || cleaned.includes('heater')) return 'purifier';
  
  // 7. الكاميرات
  if (/^(camera|cameras|dslr|shutter|canon|nikon|sony_cam)$/.test(cleaned) || cleaned.includes('camera') || cleaned.includes('shutter')) return 'camera';
  
  // 8. المراوح
  if (/^(fan|fans)$/.test(cleaned) || cleaned.includes('fan')) return 'fan';

  // 9. مشغلات الوسائط (DVD, BluRay, CD, TV Box)
  if (/^(media_player|dvd|bluray|blu_ray|cd|vhs|media|tv_box|apple_tv|roku|firetv)$/.test(cleaned) || cleaned.includes('dvd') || cleaned.includes('bluray')) return 'media_player';

  // 10. التلفزيونات
  if (/^(tv|tvs|television|televisions|smart_tv|display|monitors)$/.test(cleaned) || cleaned.includes('tv')) return 'tv';

  // 11. الأنظمة الصوتية
  if (/^(audio|sound|speaker|speakers|soundbar|amp|amplifier|hifi)$/.test(cleaned) || cleaned.includes('audio') || cleaned.includes('sound')) {
    const hasTvButtons = buttons.some(b => ['ch_up', 'ch_down', 'input', 'home', 'btn_red', 'btn_green', 'btn_yellow', 'btn_blue'].includes(b.id));
    return hasTvButtons ? 'tv' : 'audio';
  }

  // في حالة لم يطابق أي كلمة، التوجيه الذكي بناءً على الأزرار المتاحة
  const buttonIds = buttons.map(b => b.id);
  if (buttonIds.some(id => id.includes('color_') || id.includes('brightness'))) return 'lighting';
  if (buttonIds.some(id => id.includes('temp_') || id.includes('mode_cool'))) return 'ac';
  if (buttonIds.some(id => id.includes('btn_a') || id.includes('btn_x'))) return 'gaming';
  if (buttonIds.some(id => id.includes('shutter'))) return 'camera';
  if (buttonIds.some(id => id.includes('ch_up') || id.includes('ch_down'))) return 'receiver';

  // الخيار التلقائي الآمن بدلاً من general
  return 'media_player';
}

function normalizeButton(rawBtn, defaultProtocol = 'NEC', defaultFreq = 38000) {
  const rawKey = String(rawBtn.key || rawBtn.label || rawBtn.id || '').toUpperCase().trim();
  const standardId = GLOBAL_BUTTON_MAP[rawKey] || cleanText(rawKey);
  const isWifi = rawBtn.type === 'WIFI' || Boolean(rawBtn.endpoint || rawBtn.wifi);

  const btn = {
    id: standardId,
    label: rawBtn.label || rawBtn.key || standardId
  };

  if (isWifi) {
    btn.wifi = {
      endpoint: rawBtn.code || rawBtn.endpoint || (rawBtn.wifi && rawBtn.wifi.endpoint),
      method: (rawBtn.wifi && rawBtn.wifi.method) || 'POST'
    };
  } else {
    btn.ir = {
      code: rawBtn.code || (rawBtn.ir && rawBtn.ir.code),
      protocol: (rawBtn.ir && rawBtn.ir.protocol) || defaultProtocol,
      frequency: (rawBtn.ir && rawBtn.ir.frequency) || defaultFreq
    };
  }

  return btn;
}

function getCategoryIcon(catId) {
  switch (catId) {
    case 'ac': return 'wind';
    case 'audio': return 'speaker';
    case 'fan': return 'fan';
    case 'projector': return 'projector';
    case 'gaming': return 'gamepad';
    case 'lighting': return 'lightbulb';
    case 'purifier': return 'air-vent';
    case 'camera': return 'camera';
    case 'media_player': return 'disc';
    case 'receiver': return 'box';
    case 'tv':
    default: return 'tv';
  }
}

// دالة دمج إشارات الـ IR والـ Wi-Fi للزر الواحد والجهاز الواحد
function registerRemoteData(categoryId, brandId, protocol, frequency, ipEndpoint, newButtons) {
  const key = `${categoryId}_${brandId}`;
  
  if (!remotesMap.has(key)) {
    remotesMap.set(key, {
      categoryId,
      brandId,
      supportedModes: [],
      buttons: []
    });
  }

  const remote = remotesMap.get(key);

  newButtons.forEach(newBtn => {
    if (newBtn.ir && !remote.supportedModes.includes('IR')) remote.supportedModes.push('IR');
    if (newBtn.wifi && !remote.supportedModes.includes('WIFI')) remote.supportedModes.push('WIFI');

    const existingBtn = remote.buttons.find(b => b.id === newBtn.id);
    if (existingBtn) {
      if (newBtn.ir) existingBtn.ir = newBtn.ir;
      if (newBtn.wifi) existingBtn.wifi = newBtn.wifi;
    } else {
      remote.buttons.push(newBtn);
    }
  });
}

function parseLocalRawData() {
  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    return;
  }

  console.log('📂 Processing local raw_data files...');
  const files = getAllFilesRecursive(SOURCE_DIR, '.json');
  files.forEach(filePath => {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const buttons = (parsed.buttons || []).map(b => normalizeButton(b, parsed.protocol, parsed.frequency));
      const categoryId = normalizeCategory(parsed.categoryId || parsed.category || 'media_player', buttons);
      const brandId = cleanText(parsed.brandId || parsed.brand || path.basename(filePath, '.json'));

      if (buttons.length > 0) {
        registerRemoteData(categoryId, brandId, parsed.protocol || 'NEC', parsed.frequency || 38000, parsed.ipEndpoint, buttons);
      }
    } catch (err) {}
  });
}

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

function parseFlipperFiles() {
  const flipperDir = path.join(TEMP_DIR, 'flipper');
  if (!fs.existsSync(flipperDir)) return;

  const categories = fs.readdirSync(flipperDir);
  categories.forEach(category => {
    const categoryPath = path.join(flipperDir, category);
    if (!fs.statSync(categoryPath).isDirectory() || category.startsWith('.')) return;

    const files = getAllFilesRecursive(categoryPath, '.ir');

    files.forEach(filePath => {
      const relativePath = path.relative(categoryPath, filePath);
      const pathParts = relativePath.split(path.sep);
      let rawBrand = pathParts.length > 1 ? pathParts[0] : path.basename(filePath, '.ir');
      const brandId = cleanText(rawBrand.split('_')[0]);

      const content = fs.readFileSync(filePath, 'utf-8');
      const rawButtons = [];
      let currentButton = {};

      content.split('\n').forEach(line => {
        line = line.trim();
        if (line.startsWith('name:')) {
          currentButton.key = line.replace('name:', '').trim();
        } else if (line.startsWith('code:') || line.startsWith('command:') || line.startsWith('data:')) {
          const val = line.split(':').slice(1).join(':').trim();
          currentButton.code = val;
          if (currentButton.key && currentButton.code) {
            rawButtons.push(currentButton);
          }
          currentButton = {};
        }
      });

      const buttons = rawButtons.map(b => normalizeButton(b, 'NEC', 38000));
      const catId = normalizeCategory(category, buttons);

      if (buttons.length > 0) {
        registerRemoteData(catId, brandId, 'NEC', 38000, null, buttons);
      }
    });
  });
}

function parseSmartIRFiles() {
  const smartirDir = path.join(TEMP_DIR, 'smartir/codes');
  if (!fs.existsSync(smartirDir)) return;

  const categories = fs.readdirSync(smartirDir);
  categories.forEach(category => {
    const catPath = path.join(smartirDir, category);
    if (!fs.statSync(catPath).isDirectory()) return;

    const files = getAllFilesRecursive(catPath, '.json');

    files.forEach(filePath => {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const brandId = cleanText(data.manufacturer || path.basename(filePath, '.json'));

        const rawButtons = [];
        if (data.commands) {
          Object.keys(data.commands).forEach(key => {
            rawButtons.push({
              key,
              code: typeof data.commands[key] === 'string' ? data.commands[key] : JSON.stringify(data.commands[key]),
              type: data.supportedModels ? 'WIFI' : 'IR'
            });
          });
        }

        const buttons = rawButtons.map(b => normalizeButton(b, data.protocol || 'RAW', 38000));
        const catId = normalizeCategory(category, buttons);

        if (buttons.length > 0) {
          registerRemoteData(catId, brandId, data.protocol || 'RAW', 38000, null, buttons);
        }
      } catch (e) {}
    });
  });
}

function writeOutputFiles() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  remotesMap.forEach((remoteData, key) => {
    const fileName = `${key}.json`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), JSON.stringify(remoteData, null, 2));

    const { categoryId, brandId } = remoteData;
    if (brandsCatalog[categoryId]) {
      if (!brandsCatalog[categoryId].some(b => b.id === brandId)) {
        brandsCatalog[categoryId].push({
          id: brandId,
          name: brandId.toUpperCase().replace(/_/g, ' '),
          icon: getCategoryIcon(categoryId)
        });
      }
    }
  });

  const brandsDir = path.dirname(BRANDS_FILE);
  if (!fs.existsSync(brandsDir)) fs.mkdirSync(brandsDir, { recursive: true });
  fs.writeFileSync(BRANDS_FILE, JSON.stringify(brandsCatalog, null, 2));
}

function run() {
  console.log('🚀 Starting Unified Remote Data Processing (11 Categories)...');
  parseLocalRawData();
  cloneRepositories();
  parseFlipperFiles();
  parseSmartIRFiles();
  writeOutputFiles();

  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('🎉 Processing Complete! IR and Wi-Fi data perfectly consolidated into 11 strict categories.');
}

run();
