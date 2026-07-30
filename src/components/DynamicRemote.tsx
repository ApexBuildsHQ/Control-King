import React, { memo, useRef, useCallback } from 'react';
import { RemoteConfig, RemoteButton } from '../types/remote';
import { RemoteDispatcher } from '../services/remoteDispatcher';

interface DynamicRemoteProps {
  config: RemoteConfig;
  onBack: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (config: RemoteConfig) => void;
}

// قائمة الأزرار التي تقبل التكرار عند الضغط المطول
const REPEATABLE_BUTTON_IDS = [
  'vol_up', 'vol_down', 
  'ch_up', 'ch_down', 
  'temp_up', 'temp_down', 
  'nav_up', 'nav_down', 'nav_left', 'nav_right',
  'speed_up', 'speed_down'
];

export const DynamicRemote: React.FC<DynamicRemoteProps> = memo(({
  config,
  onBack,
  isFavorite = false,
  onToggleFavorite
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // دالة إرسال الإشارة مع الاهتزاز
  const triggerSignal = useCallback(async (btn: RemoteButton) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30); // اهتزاز خفيف مع كل ضغطة
    }

    await RemoteDispatcher.sendSignal({
      code: btn.code,
      protocol: config.protocol,
      frequency: config.frequency,
      ipEndpoint: config.ipEndpoint
    });
  }, [config]);

  // إيقاف التكرار عند رفع الإصبع أو خروج المؤشر
  const stopPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // بدء الضغط (مطول أو نُقرة واحدة)
  const startPress = useCallback((btn: RemoteButton) => {
    stopPress(); // إنهاء أي مؤقت سابق لضمان الأمان

    // 1. تنفيذ الأمر فوراً للمرة الأولى
    triggerSignal(btn);

    // الأزرار مثل التشغيل (Power) أو كتم الصوت لا تتكرر بالضغط المطول
    const canRepeat = REPEATABLE_BUTTON_IDS.includes(btn.id) || config.categoryId === 'tv' || config.categoryId === 'audio';
    if (!canRepeat || btn.id === 'power') return;

    // 2. الانتظار 400ms قبل بدء التكرار للتأكد أنها ضغطة مطولة وليست نقرة خاطفة
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        triggerSignal(btn);
      }, 180); // إرسال الأمر كل 180 مللي ثانية
    }, 400);
  }, [triggerSignal, stopPress, config.categoryId]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl select-none">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-all active:scale-95"
        >
          ← عودة
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-cyan-400 capitalize">{config.brandId}</h3>
          <span className="text-xs text-slate-400 uppercase tracking-wider">{config.categoryId}</span>
        </div>

        {onToggleFavorite ? (
          <button
            onClick={() => onToggleFavorite(config)}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300 bg-slate-800'
            }`}
            title="إضافة للمفضلة"
          >
            ★
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Dynamic Button Grid */}
      <div className="grid grid-cols-3 gap-3">
        {config.buttons.map((btn) => {
          const isPower = btn.id === 'power';

          return (
            <button
              key={btn.id}
              // أحداث الماوس للشاشات
              onMouseDown={() => startPress(btn)}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              // أحداث اللمس للهواتف والتابلت
              onTouchStart={(e) => {
                e.preventDefault(); // منع أحداث الماوس المزدوجة على اللمس
                startPress(btn);
              }}
              onTouchEnd={stopPress}
              className={`
                h-16 rounded-2xl font-bold text-sm flex flex-col items-center justify-center 
                transition-all active:scale-95 shadow-md touch-none
                ${isPower 
                  ? 'col-span-3 bg-red-600 hover:bg-red-500 text-white shadow-red-900/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/50'
                }
              `}
            >
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

DynamicRemote.displayName = 'DynamicRemote';

