import React from 'react';
import { translateKey } from '../i18n';
import { AppCategory } from '../types';

interface CategoriesViewProps {
  currentLanguage: string;
  onSelectCategory: (category: AppCategory) => void;
  onQuickPower: (category: AppCategory, e: React.MouseEvent) => void;
  activePowers: Record<AppCategory, boolean>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  currentLanguage,
  onSelectCategory,
  onQuickPower,
  activePowers
}) => {
  const categoriesList: Array<{
    id: AppCategory;
    i18nKey: string;
    i18nDescKey: string;
    icon: string;
    image: string;
    emoji: string;
    accentColor: 'cyan' | 'emerald' | 'amber' | 'rose';
    badge: string;
    stats: string;
  }> = [
    {
      id: 'tv',
      i18nKey: 'categories.tv',
      i18nDescKey: 'categories.tv_desc',
      icon: 'fa-solid fa-tv',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'><rect x='4' y='8' width='56' height='36' rx='4' fill='%230f172a' stroke='%2300e5ff' stroke-width='2.5'/><rect x='8' y='12' width='48' height='28' rx='2' fill='url(%23tvG)'/><polygon points='26,20 42,26 26,32' fill='%23ffffff' opacity='0.9'/><path d='M22 52h20M32 44v8' stroke='%2300e5ff' stroke-width='3' stroke-linecap='round'/><defs><linearGradient id='tvG' x1='0' y1='0' x2='48' y2='28'><stop offset='0%25' stop-color='%230284c7'/><stop offset='100%25' stop-color='%2300e5ff'/></linearGradient></defs></svg>",
      emoji: '📺',
      accentColor: 'cyan',
      badge: 'Smart TV / IR / Receiver',
      stats: '150+ Brands'
    },
    {
      id: 'ac',
      i18nKey: 'categories.ac',
      i18nDescKey: 'categories.ac_desc',
      icon: 'fa-solid fa-snowflake',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'><rect x='6' y='14' width='52' height='24' rx='4' fill='%23064e3b' stroke='%2310b981' stroke-width='2.5'/><line x1='12' y1='28' x2='52' y2='28' stroke='%23047857' stroke-width='2'/><circle cx='50' cy='21' r='2' fill='%2334d399'/><path d='M16 44c4 4 8 4 12 0s8-4 12 0 8 4 12 0' stroke='%2310b981' stroke-width='2.5' stroke-linecap='round'/><path d='M16 52c4 4 8 4 12 0s8-4 12 0 8 4 12 0' stroke='%2334d399' stroke-width='2' stroke-linecap='round' opacity='0.7'/></svg>",
      emoji: '❄️',
      accentColor: 'emerald',
      badge: 'Split / Central / Portable',
      stats: '110+ Brands'
    },
    {
      id: 'smart_appliances',
      i18nKey: 'categories.smart_appliances',
      i18nDescKey: 'categories.smart_appliances_desc',
      icon: 'fa-solid fa-square-full',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'><rect x='14' y='6' width='36' height='52' rx='5' fill='%23451a03' stroke='%23f59e0b' stroke-width='2.5'/><line x1='14' y1='28' x2='50' y2='28' stroke='%23f59e0b' stroke-width='2'/><rect x='20' y='14' width='2' height='8' rx='1' fill='%23fbbf24'/><rect x='20' y='34' width='2' height='12' rx='1' fill='%23fbbf24'/><rect x='32' y='12' width='12' height='12' rx='2' fill='%23f59e0b' opacity='0.8'/></svg>",
      emoji: '🧊',
      accentColor: 'amber',
      badge: 'Refrigerators & Home',
      stats: '85+ Brands'
    },
    {
      id: 'lighting_fans',
      i18nKey: 'categories.lighting_fans',
      i18nDescKey: 'categories.lighting_fans_desc',
      icon: 'fa-solid fa-lightbulb',
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'><path d='M22 26c0-6.627 5.373-12 12-12s12 5.373 12 12c0 4.2-2.16 7.89-5.43 10L38.5 44h-9l-2.07-6C24.16 33.89 22 30.2 22 26z' fill='%234c0519' stroke='%23f43f5e' stroke-width='2.5'/><path d='M29.5 44h5v4h-5zM30 48h4v3h-4z' fill='%23f43f5e'/><path d='M32 10V4M18 16l-5-5M46 16l5-5M12 28H6M58 28h-6' stroke='%23fb7185' stroke-width='2.5' stroke-linecap='round'/></svg>",
      emoji: '💡',
      accentColor: 'rose',
      badge: 'RGB Bulbs / Ceiling Fans',
      stats: '95+ Brands'
    }
  ];

  const getAccentStyles = (accent: 'cyan' | 'emerald' | 'amber' | 'rose', isActive: boolean) => {
    switch (accent) {
      case 'cyan':
        return {
          cardBg: 'from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/30 hover:border-cyan-400',
          glow: 'hover:shadow-cyan-500/20',
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          powerBtn: isActive ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-cyan-400'
        };
      case 'emerald':
        return {
          cardBg: 'from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/30 hover:border-emerald-400',
          glow: 'hover:shadow-emerald-500/20',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          powerBtn: isActive ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-emerald-400'
        };
      case 'amber':
        return {
          cardBg: 'from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/30 hover:border-amber-400',
          glow: 'hover:shadow-amber-500/20',
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          powerBtn: isActive ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-amber-400'
        };
      case 'rose':
        return {
          cardBg: 'from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/30 hover:border-rose-400',
          glow: 'hover:shadow-rose-500/20',
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          powerBtn: isActive ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-rose-400'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Title & Cyber Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 
          data-i18n="categories.title"
          className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"
        >
          {translateKey(currentLanguage, 'categories.title', 'اختر نوع الجهاز للتحكم')}
        </h1>
        <p 
          data-i18n="categories.subtitle"
          className="text-slate-400 text-sm sm:text-base leading-relaxed"
        >
          {translateKey(currentLanguage, 'categories.subtitle', 'واجهة ريموت تحكم لاسلكية موحدة متوافقة مع جميع الأجهزة والماركات العالمية')}
        </p>
      </div>

      {/* Grid of 4 Required Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoriesList.map((cat) => {
          const isPoweredOn = activePowers[cat.id];
          const accentStyles = getAccentStyles(cat.accentColor, isPoweredOn);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`category-card ${isPoweredOn ? 'active-glow' : ''} group relative transition-all cursor-pointer`}
            >
              {/* Top Bar: Icon & Power toggle */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between w-full">
                  {/* Category Icon */}
                  <span className={`w-12 h-12 rounded-xl border flex items-center justify-center p-2 shrink-0 ${accentStyles.iconBg}`}>
                    <img 
                      src={cat.image} 
                      alt={cat.id} 
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  </span>

                  {/* Quick Power Button */}
                  <button
                    type="button"
                    onClick={(e) => onQuickPower(cat.id, e)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shrink-0 active:scale-95 ${accentStyles.powerBtn}`}
                    title={translateKey(currentLanguage, 'categories.quick_power', 'تشغيل سريع')}
                  >
                    <i className="fa-solid fa-power-off text-base"></i>
                  </button>
                </div>

                {/* Category Header */}
                <div className="space-y-2 text-start rtl:text-right ltr:text-left">
                  <div className="flex items-center gap-2 justify-start">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#111] text-[#888] border border-[#222]">
                      {cat.stats}
                    </span>
                    {isPoweredOn && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 
                    data-i18n={cat.i18nKey}
                    className="text-lg font-bold text-white uppercase tracking-wider group-hover:text-[#00e5ff] transition-colors"
                  >
                    {translateKey(currentLanguage, cat.i18nKey, cat.i18nKey)}
                  </h3>

                  <p 
                    data-i18n={cat.i18nDescKey}
                    className="text-xs text-[#888] line-clamp-2 leading-relaxed"
                  >
                    {translateKey(currentLanguage, cat.i18nDescKey, cat.i18nDescKey)}
                  </p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="w-full pt-4 mt-2 border-t border-[#222] flex items-center justify-between text-xs font-semibold text-[#888] group-hover:text-[#00e5ff]">
                <span>{translateKey(currentLanguage, 'categories.select_brand', 'اختر الماركة والريموت')}</span>
                <i className="fa-solid fa-arrow-left text-sm rtl:block ltr:hidden group-hover:-translate-x-1 transition-transform"></i>
                <i className="fa-solid fa-arrow-right text-sm ltr:block rtl:hidden group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
