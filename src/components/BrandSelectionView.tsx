import React, { useState, useMemo } from 'react';
import { GLOBAL_BRANDS } from '../data/brands';
import { translateKey } from '../i18n';
import { AppCategory, Brand } from '../types';

interface BrandSelectionViewProps {
  currentLanguage: string;
  selectedCategory: AppCategory;
  onSelectBrand: (brand: Brand) => void;
  onBackToCategories: () => void;
}

export const BrandSelectionView: React.FC<BrandSelectionViewProps> = ({
  currentLanguage,
  selectedCategory,
  onSelectBrand,
  onBackToCategories
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular'>('all');

  // Filter brands by selected category, search query, and popularity tab
  const filteredBrands = useMemo(() => {
    return GLOBAL_BRANDS.filter((brand) => {
      const matchesCategory = brand.categoryIds.includes(selectedCategory);
      const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (brand.country && brand.country.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPopular = activeFilter === 'popular' ? brand.popular === true : true;

      return matchesCategory && matchesSearch && matchesPopular;
    });
  }, [selectedCategory, searchQuery, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#222]">
        <div>
          <button
            onClick={onBackToCategories}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#00e5ff] hover:underline mb-2 group transition-colors"
          >
            <i className="fa-solid fa-arrow-right rtl:block ltr:hidden group-hover:translate-x-1 transition-transform"></i>
            <i className="fa-solid fa-arrow-left ltr:block rtl:hidden group-hover:-translate-x-1 transition-transform"></i>
            <span data-i18n="header.back_to_categories">
              {translateKey(currentLanguage, 'header.back_to_categories', 'رجوع للأقسام الرئيسية')}
            </span>
          </button>
          
          <h2 
            data-i18n="brands.title"
            className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider"
          >
            {translateKey(currentLanguage, 'brands.title', 'اختر الماركة المصنعة')}
          </h2>
          <p 
            data-i18n="brands.subtitle"
            className="text-[#888] text-xs sm:text-sm mt-1"
          >
            {translateKey(currentLanguage, 'brands.subtitle', 'دعم متكامل لأشهر الماركات العالمية والموديلات المتوافقة')}
          </p>
        </div>

        {/* Popularity Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#0d0d0d] p-1.5 rounded-xl border border-[#222] shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            data-i18n="brands.all_brands"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#00e5ff] text-black font-bold shadow-md'
                : 'text-[#888] hover:text-white'
            }`}
          >
            {translateKey(currentLanguage, 'brands.all_brands', 'جميع الماركات')}
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            data-i18n="brands.popular_brands"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'popular'
                ? 'bg-amber-400 text-black font-bold shadow-md'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <i className="fa-solid fa-fire text-xs mr-1 text-black"></i>
            {translateKey(currentLanguage, 'brands.popular_brands', 'الأكثر شيوًعاً')}
          </button>
        </div>
      </div>

      {/* Live Search Input (Required: data-i18n-placeholder="brands.search_placeholder") */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 right-0 rtl:right-0 ltr:left-auto rtl:pr-4 ltr:pl-4 flex items-center pointer-events-none text-[#888] text-base">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={translateKey(
            currentLanguage,
            'brands.search_placeholder',
            'ابحث عن اسم الماركة (مثل: Samsung, LG, Sharp)...'
          )}
          data-i18n-placeholder="brands.search_placeholder"
          className="w-full bg-[#1a1a1a] text-white placeholder-[#666] rounded-xl py-3 px-12 border border-[#333] focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] text-xs font-medium shadow-lg transition-all outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 left-0 rtl:left-0 ltr:right-auto rtl:pl-4 ltr:pr-4 flex items-center text-[#888] hover:text-white text-sm"
          >
            <i className="fa-solid fa-circle-xmark"></i>
          </button>
        )}
      </div>

      {/* Brands Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => onSelectBrand(brand)}
              className="group relative rounded-2xl bg-[#0d0d0d] hover:bg-[#121212] border border-[#222] hover:border-[#00e5ff]/50 p-5 text-center transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-between gap-3 shadow-md hover:shadow-[#00e5ff]/10"
            >


              {/* Brand Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] group-hover:bg-[#00e5ff]/10 border border-[#333] group-hover:border-[#00e5ff]/40 text-[#00e5ff] flex items-center justify-center text-2xl transition-colors">
                <i className={brand.logoIcon || 'fa-solid fa-tv'}></i>
              </div>

              {/* Brand Info */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-[#00e5ff] transition-colors font-orbitron">
                  {brand.name}
                </h3>
                <p className="text-[11px] text-[#888] font-mono">
                  {brand.modelsCount} {translateKey(currentLanguage, 'brands.models_available', 'موديل')}
                </p>
              </div>

              {/* Select Button */}
              <button 
                data-i18n="brands.select_brand"
                className="w-full mt-1 py-1.5 px-3 rounded-xl bg-[#1a1a1a] group-hover:bg-[#00e5ff] group-hover:text-black text-[#e0e0e0] text-xs font-bold transition-all border border-[#333] group-hover:border-[#00e5ff]"
              >
                {translateKey(currentLanguage, 'brands.select_brand', 'اختر الماركة')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[#0d0d0d] rounded-2xl border border-[#222] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#1a1a1a] text-[#888] flex items-center justify-center text-2xl">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
          <h3 data-i18n="brands.no_results" className="text-lg font-bold text-[#e0e0e0]">
            {translateKey(currentLanguage, 'brands.no_results', 'لم يتم العثور على ماركة تطابق بحثك')}
          </h3>
          <p className="text-xs text-[#888] max-w-md mx-auto">
            جرّب تغيير كلمات البحث أو اختر من قسم الأقسام الرئيسية للبحث عن ماركات متوافقة أخرى.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-[#00e5ff] rounded-xl text-xs font-semibold border border-[#333]"
          >
            إعادة ضبط البحث
          </button>
        </div>
      )}
    </div>
  );
};
