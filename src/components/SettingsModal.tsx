import React from 'react';
import { SUPPORTED_LANGUAGES, translateKey } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  audioFeedback: boolean;
  onToggleAudioFeedback: () => void;
  hapticFeedback: boolean;
  onToggleHapticFeedback: () => void;
  irProtocol: string;
  onChangeIRProtocol: (proto: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenCopyright: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  isDarkMode,
  onToggleTheme,
  audioFeedback,
  onToggleAudioFeedback,
  hapticFeedback,
  onToggleHapticFeedback,
  irProtocol,
  onChangeIRProtocol,
  onOpenPrivacy,
  onOpenTerms,
  onOpenCopyright
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-lg">
              <i className="fa-solid fa-gear"></i>
            </div>
            <h3 data-i18n="settings.title" className="text-xl font-bold text-white">
              {translateKey(currentLanguage, 'settings.title', 'إعدادات التطبيق')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* 1. LANGUAGE SELECTOR (Top 50 Global Languages) */}
        <div className="space-y-2">
          <label 
            data-i18n="settings.language"
            className="text-xs font-bold text-slate-300 block"
          >
            {translateKey(currentLanguage, 'settings.language', 'لغة الواجهة (Top 50 Languages)')}
          </label>
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 rounded-xl py-3 px-4 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-semibold outline-none cursor-pointer appearance-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100 py-1">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 rtl:left-0 ltr:right-0 rtl:pl-4 ltr:pr-4 flex items-center pointer-events-none text-slate-400">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        {/* 2. AUDIO & HAPTIC FEEDBACK TOGGLES */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span data-i18n="settings.audio_feedback" className="text-xs font-bold text-slate-200 block">
                {translateKey(currentLanguage, 'settings.audio_feedback', 'الصوت التفاعلي')}
              </span>
              <span className="text-[11px] text-slate-400 block">تشغيل صوت الضغطات والنقر الأوتوماتيكي</span>
            </div>
            <button
              onClick={onToggleAudioFeedback}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${audioFeedback ? 'bg-cyan-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${audioFeedback ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <span data-i18n="settings.haptic_vibration" className="text-xs font-bold text-slate-200 block">
                {translateKey(currentLanguage, 'settings.haptic_vibration', 'الاهتزاز اللمسي')}
              </span>
              <span className="text-[11px] text-slate-400 block">تفعيل اهتزاز الهاتف عند النقر على الأزرار</span>
            </div>
            <button
              onClick={onToggleHapticFeedback}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${hapticFeedback ? 'bg-cyan-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${hapticFeedback ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        {/* 5. LEGAL & COPYRIGHT LINKS (Required data-i18n) */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <span data-i18n="settings.links_section" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {translateKey(currentLanguage, 'settings.links_section', 'الروابط القانونية وحقوق الملكية')}
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={onOpenPrivacy}
              data-i18n="settings.privacy"
              className="text-cyan-400 hover:underline py-1"
            >
              {translateKey(currentLanguage, 'settings.privacy', 'سياسة الخصوصية')}
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={onOpenTerms}
              data-i18n="settings.terms"
              className="text-cyan-400 hover:underline py-1"
            >
              {translateKey(currentLanguage, 'settings.terms', 'شروط الاستخدام')}
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={onOpenCopyright}
              data-i18n="settings.copyright"
              className="text-cyan-400 hover:underline py-1"
            >
              {translateKey(currentLanguage, 'settings.copyright', 'حقوق الملكية')}
            </button>
          </div>
        </div>

        {/* Close Modal Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            data-i18n="settings.close"
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            {translateKey(currentLanguage, 'settings.close', 'حفظ وإغلاق الإعدادات')}
          </button>
        </div>
      </div>
    </div>
  );
};
