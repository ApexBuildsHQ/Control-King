import React from 'react';
import { translateKey } from '../i18n';
import { AppCategory, FavoriteRemote } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteRemote[];
  onSelectFavorite: (fav: FavoriteRemote) => void;
  onRemoveFavorite: (id: string) => void;
  currentLanguage: string;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
  currentLanguage
}) => {
  if (!isOpen) return null;

  const getCategoryLabel = (cat: AppCategory) => {
    return translateKey(currentLanguage, `categories.${cat}`, cat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-star text-amber-400 text-lg"></i>
            <h3 data-i18n="header.favorites" className="text-xl font-bold text-white">
              {translateKey(currentLanguage, 'header.favorites', 'الريموتات المفضلة')}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {favorites.length > 0 ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {favorites.map((fav, index) => (
              <div
                key={`${fav.id}_${index}`}
                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer"
                onClick={() => {
                  onSelectFavorite(fav);
                  onClose();
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base font-orbitron">{fav.brandName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {getCategoryLabel(fav.categoryId)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{fav.modelName}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-cyan-400 group-hover:underline">فتح الريموت</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(fav.id);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <i className="fa-solid fa-star text-3xl text-slate-700"></i>
            <p className="text-xs">لا يوجد ريموتات في قائمة المفضلة حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
};
