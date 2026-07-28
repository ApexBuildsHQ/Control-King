import React from 'react';
import { translateKey } from '../i18n';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'copyright' | null;
  onClose: () => void;
  currentLanguage: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, currentLanguage }) => {
  if (!type) return null;

  const getModalContent = () => {
    switch (type) {
      case 'privacy':
        return {
          titleKey: 'legal.privacy_title',
          defaultTitle: 'سياسة الخصوصية - Control King',
          contentKey: 'legal.privacy_content',
          defaultContent: 'نحن في Control King نحترم خصوصيتك بالكامل. يعمل هذا التطبيق بنسبة 100% محلياً داخل متصفحك دون الحاجة لأي سيرفرات خارجية أو تتبع لبياناتك الشخصية. جميع إعداداتك وريموتاتك المفضلة تُحفظ بشكل آمن في التخزين المحلي (LocalStorage) لجهازك فقط.'
        };
      case 'terms':
        return {
          titleKey: 'legal.terms_title',
          defaultTitle: 'شروط الاستخدام - Control King',
          contentKey: 'legal.terms_content',
          defaultContent: 'باستخدامك لتطبيق Control King، فإنك توافق على استخدامه كوسيلة تحكم بالأجهزة المنزلية الذكية المتوافقة عبر تقنيات الأشعة تحت الحمراء أو الشبكة المحلية. التطبيق مجاني بالكامل ومتاح للاستخدام الشخصي غير التجاري.'
        };
      case 'copyright':
        return {
          titleKey: 'legal.copyright_title',
          defaultTitle: 'حقوق الملكية الفكرية',
          contentKey: 'legal.copyright_content',
          defaultContent: 'جميع العلامات التجارية والأسماء المذكورة (مثل Samsung, LG, Sharp, Carrier, TCL, Philips...) هي ملك لأصحابها وتُستخدم هنا فقط لغرض توضيح التوافق والربط الأوتوماتيكي. جميع الحقوق محفوظة © Control King 2026.'
        };
    }
  };

  const info = getModalContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 data-i18n={info.titleKey} className="text-xl font-bold text-white">
            {translateKey(currentLanguage, info.titleKey, info.defaultTitle)}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
          <p 
            data-i18n={info.contentKey}
            className="text-slate-300 text-sm leading-relaxed"
          >
            {translateKey(currentLanguage, info.contentKey, info.defaultContent)}
          </p>
        </div>

        <button
          onClick={onClose}
          data-i18n="legal.close"
          className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
        >
          {translateKey(currentLanguage, 'legal.close', 'حسناً، فهمت')}
        </button>
      </div>
    </div>
  );
};
