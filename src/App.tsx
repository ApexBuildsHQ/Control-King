/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoriesView } from './components/CategoriesView';
import { BrandSelectionView } from './components/BrandSelectionView';
import { RemoteControlView } from './components/RemoteControlView';
import { SettingsModal } from './components/SettingsModal';
import { LegalModal } from './components/LegalModals';
import { CustomMacroModal } from './components/CustomMacroModal';
import { FavoritesModal } from './components/FavoritesModal';
import { setLanguage, subscribeLanguageChange, getInitialLanguage, t } from './i18n';
import { TOP_50_LANGUAGES } from './data/languages';
import { GLOBAL_BRANDS } from './data/brands';
import { AppCategory, Brand, CustomButton, FavoriteRemote, IRSignalLog, RemoteState } from './types';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'categories' | 'brands' | 'remote'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // App Settings & Preferences
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return getInitialLanguage();
  });

  useEffect(() => {
    const unsubscribe = subscribeLanguageChange((lang) => {
      setCurrentLanguage(lang);
    });
    return () => unsubscribe();
  }, []);

  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code);
    setLanguage(code);
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('control_king_theme') !== 'light';
  });
  const [audioFeedback, setAudioFeedback] = useState<boolean>(() => {
    return localStorage.getItem('control_king_audio') !== 'false';
  });
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(() => {
    return localStorage.getItem('control_king_haptic') !== 'false';
  });
  const [irProtocol, setIrProtocol] = useState<string>(() => {
    return localStorage.getItem('control_king_protocol') || 'NEC 38kHz';
  });

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'copyright' | null>(null);
  const [isCustomMacroOpen, setIsCustomMacroOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [showSignalLog, setShowSignalLog] = useState(false);

  // Category Quick Powers
  const [activePowers, setActivePowers] = useState<Record<AppCategory, boolean>>({
    tv: true,
    ac: true,
    smart_appliances: true,
    lighting_fans: true
  });

  // Interactive Remote Control State
  const [remoteState, setRemoteState] = useState<RemoteState>(() => ({
    power: true,
    volume: 24,
    channel: 1,
    temperature: 22,
    mode: 'cool',
    fanSpeed: 'med',
    swing: true,
    muted: false,
    brightness: 80,
    colorTemp: 4000,
    rgbColor: '#06b6d4',
    inputSource: t('remote.hdmi1', 'HDMI 1'),
    freezerTemp: -18,
    fridgeTemp: 4,
    ecoMode: false
  }));

  // Saved Favorites List
  const [favorites, setFavorites] = useState<FavoriteRemote[]>(() => {
    try {
      const saved = localStorage.getItem('control_king_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom Remote Buttons
  const [customButtons, setCustomButtons] = useState<CustomButton[]>(() => {
    try {
      const saved = localStorage.getItem('control_king_macros');
      return saved ? JSON.parse(saved) : [
        { id: '1', label: t('macro.movieMode', 'Movie Mode / IMAX'), hexCode: '0x20DF9900' },
        { id: '2', label: t('macro.turboCool', 'Turbo Cool 18°C'), hexCode: '0x10AF1818' }
      ];
    } catch {
      return [];
    }
  });

  // Recent IR Signals Log
  const [recentSignals, setRecentSignals] = useState<IRSignalLog[]>([]);

  // Update HTML document dir and lang attributes when language changes
  useEffect(() => {
    localStorage.setItem('control_king_lang', currentLanguage);
    const langObj = TOP_50_LANGUAGES.find((l) => l.code === currentLanguage);
    const dir = langObj?.dir || 'ltr';

    document.documentElement.dir = dir;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Update HTML document class when theme changes
  useEffect(() => {
    localStorage.setItem('control_king_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('control_king_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Save custom macro buttons
  useEffect(() => {
    localStorage.setItem('control_king_macros', JSON.stringify(customButtons));
  }, [customButtons]);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('control_king_audio', String(audioFeedback));
    localStorage.setItem('control_king_haptic', String(hapticFeedback));
    localStorage.setItem('control_king_protocol', irProtocol);
  }, [audioFeedback, hapticFeedback, irProtocol]);

  // Emit Signal Handler
  const handleEmitSignal = (command: string, hexCode: string) => {
    const newLog: IRSignalLog = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      command,
      hexCode,
      protocol: irProtocol,
      frequency: t('remote.frequency', '38.0 kHz')
    };
    setRecentSignals((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // Quick Power Toggle Handler
  const handleQuickPower = (category: AppCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePowers((prev) => {
      const nextState = !prev[category];
      const command = t('remote.quickPowerCommand', 'Quick Power') + ` ${category.toUpperCase()}`;
      handleEmitSignal(command, nextState ? '0x10AF00FF' : '0x10AF0000');
      return { ...prev, [category]: nextState };
    });
  };

  // Navigation handlers
  const handleSelectCategory = (category: AppCategory) => {
    setSelectedCategory(category);
    setCurrentView('brands');
  };

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setCurrentView('remote');
  };

  const handleNavigateHome = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedBrand(null);
  };

  const handleNavigateToBrands = () => {
    if (selectedCategory) {
      setCurrentView('brands');
      setSelectedBrand(null);
    } else {
      handleNavigateHome();
    }
  };

  // Favorite Remotes Handlers
  const isCurrentFavorite = () => {
    if (!selectedBrand || !selectedCategory) return false;
    return favorites.some((f) => f.brandId === selectedBrand.id && f.categoryId === selectedCategory);
  };

  const handleToggleFavorite = () => {
    if (!selectedBrand || !selectedCategory) return;
    if (isCurrentFavorite()) {
      setFavorites((prev) => prev.filter((f) => !(f.brandId === selectedBrand.id && f.categoryId === selectedCategory)));
    } else {
      const newFav: FavoriteRemote = {
        id: `${selectedBrand.id}_${selectedCategory}`,
        brandId: selectedBrand.id,
        brandName: selectedBrand.name,
        categoryId: selectedCategory,
        modelName: t('favorites.universalRemoteModel', 'Universal Remote V.2026'),
        addedAt: new Date().toLocaleDateString()
      };
      setFavorites((prev) => [newFav, ...prev]);
    }
  };

  const handleSelectFavorite = (fav: FavoriteRemote) => {
    const brandObj = GLOBAL_BRANDS.find((b) => b.id === fav.brandId) || {
      id: fav.brandId,
      name: fav.brandName,
      categoryIds: [fav.categoryId]
    };
    setSelectedCategory(fav.categoryId);
    setSelectedBrand(brandObj);
    setCurrentView('remote');
  };

  const handleSaveCustomButton = (label: string, hexCode: string) => {
    const newBtn: CustomButton = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      label,
      hexCode
    };
    setCustomButtons((prev) => [...prev, newBtn]);
  };

  const handleRemoveCustomButton = (id: string) => {
    setCustomButtons((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#050505] text-[#e0e0e0] transition-colors duration-300">
      {/* Top Cyber Navigation Bar */}
      <Header
        currentLanguage={currentLanguage}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentView={currentView}
        selectedCategory={selectedCategory}
        selectedBrandName={selectedBrand?.name}
        onNavigateHome={handleNavigateHome}
        onNavigateToBrands={handleNavigateToBrands}
        favoritesCount={favorites.length}
        onOpenFavoritesModal={() => setIsFavoritesOpen(true)}
        onToggleSignalLog={() => setShowSignalLog((prev) => !prev)}
        showSignalLog={showSignalLog}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'categories' && (
          <CategoriesView
            currentLanguage={currentLanguage}
            onSelectCategory={handleSelectCategory}
            onQuickPower={handleQuickPower}
            activePowers={activePowers}
          />
        )}

        {currentView === 'brands' && selectedCategory && (
          <BrandSelectionView
            currentLanguage={currentLanguage}
            selectedCategory={selectedCategory}
            onSelectBrand={handleSelectBrand}
            onBackToCategories={handleNavigateHome}
          />
        )}

        {currentView === 'remote' && selectedCategory && selectedBrand && (
          <RemoteControlView
            currentLanguage={currentLanguage}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            remoteState={remoteState}
            onUpdateRemoteState={setRemoteState}
            onBackToBrands={handleNavigateToBrands}
            onEmitSignal={handleEmitSignal}
            audioFeedback={audioFeedback}
            hapticFeedback={hapticFeedback}
            isFavorite={isCurrentFavorite()}
            onToggleFavorite={handleToggleFavorite}
            customButtons={customButtons}
            onOpenAddCustomButton={() => setIsCustomMacroOpen(true)}
            onRemoveCustomButton={handleRemoveCustomButton}
            recentSignals={recentSignals}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] bg-[#0d0d0d] py-6 text-center text-xs text-neutral-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold neon-text">{t('app.titleShort', 'CONTROL KING')}</span>
            <span>•</span>
            <span data-i18n="legal.copyright_title"></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLegalModalType('privacy')}
              data-i18n="settings.privacy"
              className="hover:text-[#00e5ff] transition-colors"
            >
            </button>
            <button 
              onClick={() => setLegalModalType('terms')}
              data-i18n="settings.terms"
              className="hover:text-[#00e5ff] transition-colors"
            >
            </button>
            <button 
              onClick={() => setLegalModalType('copyright')}
              data-i18n="settings.copyright"
              className="hover:text-[#00e5ff] transition-colors"
            >
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        audioFeedback={audioFeedback}
        onToggleAudioFeedback={() => setAudioFeedback((prev) => !prev)}
        hapticFeedback={hapticFeedback}
        onToggleHapticFeedback={() => setHapticFeedback((prev) => !prev)}
        irProtocol={irProtocol}
        onChangeIRProtocol={setIrProtocol}
        onOpenPrivacy={() => { setIsSettingsOpen(false); setLegalModalType('privacy'); }}
        onOpenTerms={() => { setIsSettingsOpen(false); setLegalModalType('terms'); }}
        onOpenCopyright={() => { setIsSettingsOpen(false); setLegalModalType('copyright'); }}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        currentLanguage={currentLanguage}
      />

      <CustomMacroModal
        isOpen={isCustomMacroOpen}
        onClose={() => setIsCustomMacroOpen(false)}
        onSave={handleSaveCustomButton}
        currentLanguage={currentLanguage}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectFavorite={handleSelectFavorite}
        onRemoveFavorite={(id) => setFavorites((prev) => prev.filter((f) => f.id !== id))}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
