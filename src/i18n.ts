import { TOP_50_LANGUAGES } from './data/languages';
import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = TOP_50_LANGUAGES;

export type TranslationsDict = Record<string, any>;

let currentLangCode = 'ar';
let activeTranslations: TranslationsDict = {};
let fallbackTranslations: TranslationsDict = {};

// Embedded fallback translations for instant startup without network wait
const embeddedTranslations: Record<string, TranslationsDict> = {
  ar: {
    app: {
      title: "كنترول كينج - الريموت الشامل",
      tagline: "التحكم الذكي الفائق بجميع أجهزتك من مكان واحد"
    },
    header: {
      title: "Control King",
      settings: "الإعدادات",
      theme: "تبديل المظهر",
      favorites: "المفضلة",
      signal_log: "سجل الإشارة",
      back_to_categories: "الأقسام الرئيسية",
      back_to_brands: "اختيار الماركة"
    },
    categories: {
      title: "اختر نوع الجهاز للتحكم",
      subtitle: "ريموت تحكم لاسلكي موحد لجميع أجهزتك المنزلية والذكية",
      tv: "الشاشات والرسيفرات",
      tv_desc: "شاشات Smart TV، أجهزة الريسيفر، والبروجكتور",
      ac: "التكييفات والتبريد",
      ac_desc: "أجهزة التكييف السبلت، الصحراوي، والمركزية",
      smart_appliances: "الثلاجات والأجهزة الذكية",
      smart_appliances_desc: "الثلاجات الذكية، الغسالات، والميكروويف",
      lighting_fans: "الإضاءة والمراوح",
      lighting_fans_desc: "اللمبات الذكية RGB، نجف LED، والمراوح",
      quick_power: "تشغيل سريع"
    },
    brands: {
      title: "اختر الماركة المصنعة",
      subtitle: "دعم شامل لأكثر من 500+ موديل عالمي ومحلي",
      all_brands: "جميع الماركات",
      popular_brands: "الأكثر شيوعاً",
      search_placeholder: "ابحث عن اسم الماركة (مثل: Samsung, LG, Sharp)...",
      connect_btn: "اتصل واقترن الآن",
      connecting: "جاري الاتصال بالجهاز...",
      not_found: "لم يتم العثور على ماركة تطابق بحثك",
      no_results: "لم يتم العثور على نتائج",
      models_available: "موديل متوافق",
      select_brand: "اختر الماركة"
    },
    remote: {
      title: "ريموت التحكم الذكي",
      power: "تشغيل / إيقاف",
      volume: "مستوى الصوت",
      vol_up: "رفع الصوت (+)",
      vol_down: "خفض الصوت (-)",
      ch_up: "القناة التالية (CH+)",
      ch_down: "القناة السابقة (CH-)",
      mute: "كتم الصوت",
      source: "مصدر الإدخال (Source)",
      menu: "القائمة",
      home: "الرئيسية",
      back: "رجوع",
      ok: "موافق",
      temp: "درجة الحرارة",
      temp_up: "زيادة الحرارة (+)",
      temp_down: "تقليل الحرارة (-)",
      mode: "الوضع (Mode)",
      fan_speed: "سرعة المروحة",
      swing: "توجيه الهواء (Swing)",
      turbo: "التبريد السريع (Turbo)",
      brightness: "درجة السطوع",
      color_temp: "حرارة اللون",
      freezer: "درجة الفريزر",
      fridge: "درجة الثلاجة",
      eco_mode: "الوضع الاقتصادي (Eco)",
      signal_sent: "تم إرسال الإشارة",
      signal_transmitting: "جاري إرسال إشارة IR / Wi-Fi...",
      add_to_fav: "حفظ كـ ريموت مفضل",
      in_fav: "موجود بالمفضلة",
      signal_log_title: "مراقب إشارات الأشعة تحت الحمراء (IR Monitor)",
      test_signal: "اختبار الشفرة",
      custom_buttons: "أزرار مخصصة (Custom Macros)",
      add_custom_btn: "إضافة زر جديد",
      shortcuts: "التطبيقات السريعة"
    },
    settings: {
      title: "إعدادات التطبيق والتفضيلات",
      language: "لغة الواجهة (Top 50 Languages)",
      language_select: "اختر اللغة",
      theme: "النمط البصري (Theme)",
      dark_cyberpunk: "داكن سايبربانك (Modern Dark Cyberpunk)",
      light: "فاتح ناصع (Clean Light)",
      audio_feedback: "الصوت التفاعلي والأزرار (Audio Feedback)",
      haptic_vibration: "الاهتزاز عند الضغط (Haptic Vibration)",
      ir_protocol: "بروتوكول الإشارة الافتراضي (IR Protocol)",
      links_section: "الروابط القانونية وحقوق الملكية",
      privacy: "سياسة الخصوصية (Privacy Policy)",
      terms: "شروط الاستخدام (Terms of Service)",
      copyright: "حقوق الملكية الفكرية (Copyrights)",
      close: "إغلاق الإعدادات"
    },
    legal: {
      privacy_title: "سياسة الخصوصية - Control King",
      privacy_content: "نحن في Control King نحترم خصوصيتك بالكامل. يعمل هذا التطبيق بنسبة 100% محلياً داخل متصفحك دون الحاجة لأي سيرفرات خارجية أو تتبع لبياناتك الشخصية. جميع إعداداتك وريموتاتك المفضلة تُحفظ بشكل آمن في التخزين المحلي (LocalStorage) لجهازك فقط.",
      terms_title: "شروط الاستخدام - Control King",
      terms_content: "باستخدامك لتطبيق Control King، فإنك توافق على استخدامه كوسيلة تحكم بالأجهزة المنزلية الذكية المتوافقة عبر تقنيات الأشعة تحت الحمراء أو الشبكة المحلية. التطبيق مجاني بالكامل ومتاح للاستخدام الشخصي غير التجاري.",
      copyright_title: "جميع الحقوق محفوظة © 2026",
      copyright_content: "جميع العلامات التجارية والأسماء المذكورة (مثل Samsung, LG, Sharp, Carrier, TCL, Philips...) هي ملك لأصحابها وتُستخدم هنا فقط لغرض توضيح التوافق والربط الأوتوماتيكي. جميع الحقوق محفوظة © Control King 2026.",
      close: "حسناً، فهمت"
    },
    macro: {
      modal_title: "إضافة زر تحكم مخصص",
      label_name: "اسم الزر / الوظيفة",
      hex_code: "كود الأشعة تحت الحمراء (Hex Code)",
      save: "حفظ الزر",
      cancel: "إلغاء"
    }
  },
  en: {
    app: {
      title: "Control King - Universal Remote",
      tagline: "Ultimate Smart Universal Control Center for All Your Devices"
    },
    header: {
      title: "Control King",
      settings: "Settings",
      theme: "Toggle Theme",
      favorites: "Favorites",
      signal_log: "Signal Log",
      back_to_categories: "Main Categories",
      back_to_brands: "Select Brand"
    },
    categories: {
      title: "Select Device Category",
      subtitle: "Unified wireless remote for all your home & smart devices",
      tv: "TVs & Displays",
      tv_desc: "Smart TVs, Satellite Receivers, and Projectors",
      ac: "Air Conditioners & Cooling",
      ac_desc: "Split ACs, Portable Coolers, and Central HVAC",
      smart_appliances: "Refrigerators & Smart Home",
      smart_appliances_desc: "Smart Fridges, Washers, and Microwaves",
      lighting_fans: "Lighting & Ceiling Fans",
      lighting_fans_desc: "RGB Smart Bulbs, LED Chandeliers, and Fans",
      quick_power: "Quick Power"
    },
    brands: {
      title: "Select Manufacturer Brand",
      subtitle: "Full compatibility with 500+ global & regional brands",
      all_brands: "All Brands",
      popular_brands: "Popular Brands",
      search_placeholder: "Search brand name (e.g. Samsung, LG, Sharp)...",
      connect_btn: "Connect & Pair Now",
      connecting: "Connecting device...",
      not_found: "No brands matching your search filter",
      no_results: "No matching brands found",
      models_available: "Compatible Models",
      select_brand: "Select Brand"
    },
    remote: {
      title: "Smart Interactive Remote",
      power: "Power ON / OFF",
      volume: "Volume",
      vol_up: "Volume Up (+)",
      vol_down: "Volume Down (-)",
      ch_up: "Channel Next (CH+)",
      ch_down: "Channel Prev (CH-)",
      mute: "Mute Audio",
      source: "Input Source",
      menu: "Menu",
      home: "Home",
      back: "Back",
      ok: "OK / Select",
      temp: "Temperature",
      temp_up: "Temp Up (+)",
      temp_down: "Temp Down (-)",
      mode: "Operating Mode",
      fan_speed: "Fan Speed",
      swing: "Louver Swing",
      turbo: "Turbo Cooling",
      brightness: "Brightness Level",
      color_temp: "Color Temperature",
      freezer: "Freezer Temp",
      fridge: "Fridge Temp",
      eco_mode: "Eco Power Mode",
      signal_sent: "Signal Sent",
      signal_transmitting: "Transmitting IR / Wi-Fi Signal...",
      add_to_fav: "Save to Favorite Remotes",
      in_fav: "In Favorites",
      signal_log_title: "Infrared Signal Monitor (IR Log)",
      test_signal: "Test Signal Code",
      custom_buttons: "Custom Macro Buttons",
      add_custom_btn: "Add Custom Button",
      shortcuts: "Quick App Launchers"
    },
    settings: {
      title: "Application & Remote Preferences",
      language: "Interface Language (Top 50 Languages)",
      language_select: "Select Language",
      theme: "Visual Theme",
      dark_cyberpunk: "Modern Dark Cyberpunk",
      light: "Clean Light Mode",
      audio_feedback: "Tactile Audio Click Feedback",
      haptic_vibration: "Haptic Vibration Feedback",
      ir_protocol: "Default IR Protocol Frequency",
      links_section: "Legal & Intellectual Property",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      copyright: "Copyright Notice",
      close: "Close Settings"
    },
    legal: {
      privacy_title: "Privacy Policy - Control King",
      privacy_content: "Control King runs 100% locally in your browser with zero external server dependencies or background tracking. Your customized remotes, favorites, and settings stay completely safe on your local device.",
      terms_title: "Terms of Service - Control King",
      terms_content: "By accessing Control King, you agree to use it for personal control of compatible home appliances via Infrared or Local Wi-Fi protocols. The application is completely free and private.",
      copyright_title: "All Rights Reserved © 2026",
      copyright_content: "All brand names and logos (such as Samsung, LG, Sharp, Carrier, TCL, etc.) belong to their respective trademark holders and are referenced purely for compatibility and identification. © Control King 2026.",
      close: "Understood"
    },
    macro: {
      modal_title: "Add Custom Remote Button",
      label_name: "Button Function / Name",
      hex_code: "Infrared Hex Code",
      save: "Save Button",
      cancel: "Cancel"
    }
  }
};

/**
 * Main translation lookup function t(key: string): string
 * Searches active translations dictionary, falling back to English
 */
export function t(key: string, defaultText?: string): string {
  const resolved = getValueByPath(activeTranslations, key) || getValueByPath(fallbackTranslations, key);
  if (resolved && typeof resolved === 'string') {
    return resolved;
  }
  return defaultText || key;
}

/**
 * Compatibility wrapper for existing component calls
 */
export function translateKey(_lang: string, key: string, defaultText?: string): string {
  return t(key, defaultText);
}

function getValueByPath(obj: Record<string, any>, keyPath: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  if (obj[keyPath] !== undefined && typeof obj[keyPath] === 'string') {
    return obj[keyPath];
  }

  const parts = keyPath.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Gets currently active language code
 */
export function getCurrentLanguage(): string {
  return currentLangCode;
}

/**
 * Detects initial user language from localStorage or navigator
 */
export function getInitialLanguage(): string {
  if (typeof window === 'undefined') return 'ar';
  
  const saved = localStorage.getItem('i18n_language') || localStorage.getItem('app_language');
  if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
    return saved;
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
  }

  return 'ar';
}

/**
 * Iterates through DOM elements with data-i18n and data-i18n-placeholder and translates them
 */
export function updateDOMTranslations(): void {
  if (typeof document === 'undefined') return;

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode);
  const dir = langConfig?.dir || (['ar', 'fa', 'ur', 'he'].includes(currentLangCode) ? 'rtl' : 'ltr');

  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', currentLangCode);

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const translated = t(key);
      if (translated && translated !== key) {
        el.textContent = translated;
      }
    }
  });

  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      const translated = t(key);
      if (translated && translated !== key) {
        (el as HTMLInputElement).placeholder = translated;
      }
    }
  });
}

/**
 * Dynamic language switcher that fetches locales/${langCode}.json
 */
export async function setLanguage(langCode: string): Promise<void> {
  currentLangCode = langCode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('i18n_language', langCode);
    localStorage.setItem('app_language', langCode);
  }

  if (Object.keys(fallbackTranslations).length === 0) {
    fallbackTranslations = embeddedTranslations['en'] || {};
  }

  if (embeddedTranslations[langCode]) {
    activeTranslations = embeddedTranslations[langCode];
    updateDOMTranslations();
    notifySubscribers();
    return;
  }

  try {
    const response = await fetch(`/locales/${langCode}.json`);
    if (response.ok) {
      const data = await response.json();
      activeTranslations = data;
    } else {
      console.warn(`Failed to fetch translations for ${langCode}. Falling back to 'en'.`);
      activeTranslations = fallbackTranslations;
    }
  } catch (err) {
    console.warn(`Error loading translations for ${langCode}:`, err);
    activeTranslations = fallbackTranslations;
  }

  updateDOMTranslations();
  notifySubscribers();
}

type LangChangeCallback = (lang: string) => void;
const subscribers: Set<LangChangeCallback> = new Set();

export function subscribeLanguageChange(callback: LangChangeCallback): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function notifySubscribers(): void {
  subscribers.forEach((cb) => cb(currentLangCode));
}

// Automatically initialize language state on module load
if (typeof window !== 'undefined') {
  const initial = getInitialLanguage();
  setLanguage(initial);
}
