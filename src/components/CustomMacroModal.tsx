import React, { useState } from 'react';
import { translateKey } from '../i18n';

interface CustomMacroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, hexCode: string) => void;
  currentLanguage: string;
}

export const CustomMacroModal: React.FC<CustomMacroModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentLanguage
}) => {
  const [label, setLabel] = useState('');
  const [hexCode, setHexCode] = useState('0x20DF9090');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave(label.trim(), hexCode.trim());
    setLabel('');
    setHexCode('0x20DF9090');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 data-i18n="macro.modal_title" className="text-lg font-bold text-white">
            {translateKey(currentLanguage, 'macro.modal_title', 'إضافة زر تحكم مخصص')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label data-i18n="macro.label_name" className="text-xs font-bold text-slate-300 block">
              {translateKey(currentLanguage, 'macro.label_name', 'اسم الزر / الوظيفة')}
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="مثال: وضع السينما / 4K Ultra"
              className="w-full bg-slate-950 text-slate-100 rounded-xl py-2.5 px-3 border border-slate-700 text-sm focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label data-i18n="macro.hex_code" className="text-xs font-bold text-slate-300 block">
              {translateKey(currentLanguage, 'macro.hex_code', 'كود الشفرة (IR Hex Code)')}
            </label>
            <input
              type="text"
              required
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value)}
              placeholder="0x20DF9090"
              className="w-full bg-slate-950 text-cyan-300 font-mono rounded-xl py-2.5 px-3 border border-slate-700 text-sm focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              data-i18n="macro.cancel"
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              {translateKey(currentLanguage, 'macro.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              data-i18n="macro.save"
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
            >
              {translateKey(currentLanguage, 'macro.save', 'حفظ الزر')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
