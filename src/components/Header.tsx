import React from 'react';
import { translateKey } from '../i18n';
import { AppCategory } from '../types';

interface HeaderProps {
  currentLanguage: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  currentView: 'categories' | 'brands' | 'remote';
  selectedCategory: AppCategory | null;
  selectedBrandName?: string;
  onNavigateHome: () => void;
  onNavigateToBrands?: () => void;
  favoritesCount: number;
  onOpenFavoritesModal: () => void;
  onToggleSignalLog: () => void;
  showSignalLog: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  isDarkMode,
  onToggleTheme,
  onOpenSettings,
  currentView,
  selectedCategory,
  selectedBrandName,
  onNavigateHome,
  onNavigateToBrands,
  favoritesCount,
  onOpenFavoritesModal,
  onToggleSignalLog,
  showSignalLog
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0d0d] backdrop-blur-md border-b border-[#222] px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateHome}
            className="group flex items-center gap-2.5 focus:outline-none transition-transform active:scale-95"
            title={translateKey(currentLanguage, 'app.title', 'Control King - Universal Remote')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#333] text-[#00e5ff] shadow-md group-hover:border-[#00e5ff] transition-all">
              <span className="text-2xl neon-text">👑</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e5ff]"></span>
              </span>
            </div>
            <div className="text-right flex flex-col items-start justify-center">
              <span className="text-base sm:text-lg font-bold tracking-wider text-white font-orbitron uppercase neon-text whitespace-nowrap leading-tight" data-i18n="header.title">
                Control King
              </span>
            </div>
          </button>

          {/* Breadcrumb Navigation Trail */}
          {currentView !== 'categories' && (
            <div className="hidden md:flex items-center gap-2 mr-4 text-xs text-[#888] border-r border-[#222] pr-4">
              <button
                onClick={onNavigateHome}
                data-i18n="header.back_to_categories"
                className="hover:text-[#00e5ff] transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-house text-[11px]"></i>
                {translateKey(currentLanguage, 'header.back_to_categories', 'الأقسام الرئيسية')}
              </button>
              
              {selectedCategory && (
                <>
                  <i className="fa-solid fa-chevron-left text-[9px] text-[#555] rtl:rotate-0 ltr:rotate-180"></i>
                  {currentView === 'remote' && onNavigateToBrands ? (
                    <button
                      onClick={onNavigateToBrands}
                      data-i18n="header.back_to_brands"
                      className="hover:text-[#00e5ff] transition-colors"
                    >
                      {translateKey(currentLanguage, `categories.${selectedCategory}`, selectedCategory)}
                    </button>
                  ) : (
                    <span className="text-[#00e5ff] font-semibold">
                      {translateKey(currentLanguage, `categories.${selectedCategory}`, selectedCategory)}
                    </span>
                  )}
                </>
              )}

              {currentView === 'remote' && selectedBrandName && (
                <>
                  <i className="fa-solid fa-chevron-left text-[9px] text-[#555] rtl:rotate-0 ltr:rotate-180"></i>
                  <span className="text-amber-300 font-bold px-2 py-0.5 bg-[#1a1a1a] rounded-md border border-[#333]">
                    {selectedBrandName}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Favorites Button */}
          <button
            type="button"
            onClick={onOpenFavoritesModal}
            className="relative w-10 h-10 rounded-xl text-xs font-semibold bg-[#1a1a1a] hover:bg-[#222] text-amber-300 border border-[#333] hover:border-amber-400/50 transition-all flex items-center justify-center active:scale-95 shrink-0"
            title={translateKey(currentLanguage, 'header.favorites', 'المفضلة')}
          >
            <i className="fa-solid fa-star text-amber-400 text-sm"></i>
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] bg-amber-500 text-slate-950 font-black rounded-full font-orbitron leading-none border border-slate-950">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl text-xs font-semibold bg-[#1a1a1a] hover:bg-[#222] text-[#e0e0e0] border border-[#333] hover:border-[#00e5ff] transition-all flex items-center justify-center active:scale-95 shrink-0"
            title={translateKey(currentLanguage, 'header.theme', 'تبديل المظهر')}
          >
            {isDarkMode ? (
              <span className="text-amber-400 text-base leading-none">🌙</span>
            ) : (
              <span className="text-[#00e5ff] text-base leading-none">☀️</span>
            )}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#222] text-[#e0e0e0] border border-[#333] hover:border-[#00e5ff] transition-all active:scale-95 flex items-center justify-center text-base shrink-0"
            title={translateKey(currentLanguage, 'header.settings', 'الإعدادات')}
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
};
