import React, { memo, useRef, useCallback, useState } from 'react';
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
  'speed_up', 'speed_down',
  'zoom_in', 'zoom_out'
];

// أيقونات SVG خفيفة ومضمنة لضمان العمل المباشر دون مكتبات خارجية
const Icons = {
  Power: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.77 0" />
    </svg>
  ),
  VolumeUp: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  VolumeDown: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  Mute: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  ArrowUp: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>,
  ArrowDown: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>,
  ArrowRight: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>,
  Home: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  Menu: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Back: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Play: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Stop: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16"/></svg>,
  Fan: () => <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12c2-3 6-3 6 0s-3 6 0 6-3-6-6 0-3-6 0-6 6 3 0 0z"/></svg>,
  Sun: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Snow: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="20" y1="7" x2="4" y2="17"/><line x1="4" y1="7" x2="20" y2="17"/></svg>,
};

export const DynamicRemote: React.FC<DynamicRemoteProps> = memo(({
  config,
  onBack,
  isFavorite = false,
  onToggleFavorite
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // حالة إضاءة لمبة الإرسال LED الـ IR
  const [isTransmitting, setIsTransmitting] = useState(false);
  // حالة درجة الحرارة الافتراضية للتكييف
  const [acTemp, setAcTemp] = useState<number>(24);
  // حالة إظهار أزرار أرقام القنوات (Keypad)
  const [showKeypad, setShowKeypad] = useState<boolean>(false);

  // دالة إرسال الإشارة مع الاهتزاز وإضاءة اللمبة
  const triggerSignal = useCallback(async (btn: RemoteButton) => {
    setIsTransmitting(true);
    setTimeout(() => setIsTransmitting(false), 200);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }

    // تحديث الحرارة محلياً للتكييف
    if (btn.id.includes('temp_up') || btn.id.includes('temp_plus')) setAcTemp(t => Math.min(t + 1, 30));
    if (btn.id.includes('temp_down') || btn.id.includes('temp_minus')) setAcTemp(t => Math.max(t - 1, 16));

    await RemoteDispatcher.sendSignal({
      code: btn.code,
      protocol: config.protocol,
      frequency: config.frequency,
      ipEndpoint: config.ipEndpoint
    });
  }, [config]);

  const stopPress = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startPress = useCallback((btn: RemoteButton) => {
    stopPress();
    triggerSignal(btn);

    const canRepeat = REPEATABLE_BUTTON_IDS.some(id => btn.id.toLowerCase().includes(id)) || 
                      ['tv', 'audio', 'receiver'].includes(config.categoryId.toLowerCase());
    if (!canRepeat || btn.id.toLowerCase() === 'power') return;

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => triggerSignal(btn), 180);
    }, 400);
  }, [triggerSignal, stopPress, config.categoryId]);

  // دالة البحث المتقدم عن أزرار معينة من القائمة
  const findBtn = (keys: string[]): RemoteButton | undefined => {
    return config.buttons.find(b => {
      const id = b.id.toLowerCase();
      const label = b.label.toLowerCase();
      return keys.some(k => id === k || id.includes(k) || label === k);
    });
  };

  // المكون الموحد لزر الريموت التفاعلي
  const renderButton = (
    btn: RemoteButton | undefined, 
    customLabel?: React.ReactNode, 
    extraClasses: string = '', 
    fallbackKey?: string
  ) => {
    if (!btn && !fallbackKey) return <div className="w-full h-12" />;
    
    const targetBtn = btn || { id: fallbackKey || 'dummy', label: fallbackKey || '', code: '' };
    const isPower = targetBtn.id.toLowerCase().includes('power');

    return (
      <button
        key={targetBtn.id}
        onMouseDown={() => startPress(targetBtn)}
        onMouseUp={stopPress}
        onMouseLeave={stopPress}
        onTouchStart={(e) => { e.preventDefault(); startPress(targetBtn); }}
        onTouchEnd={stopPress}
        className={`
          relative flex flex-col items-center justify-center font-bold text-xs sm:text-sm rounded-2xl
          transition-all active:scale-90 shadow-lg touch-none border select-none
          ${isPower 
            ? 'bg-red-600 hover:bg-red-500 border-red-400/30 text-white shadow-red-900/40' 
            : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border-slate-700/60 hover:border-cyan-500/40'
          }
          ${extraClasses}
        `}
      >
        {customLabel || targetBtn.label}
      </button>
    );
  };

  // عجلة الاتجاهات الدائرية (D-Pad)
  const renderDPad = () => {
    const up = findBtn(['nav_up', 'up']);
    const down = findBtn(['nav_down', 'down']);
    const left = findBtn(['nav_left', 'left']);
    const right = findBtn(['nav_right', 'right']);
    const ok = findBtn(['ok', 'select', 'enter']);

    return (
      <div className="relative w-56 h-56 mx-auto my-4 bg-slate-950/80 rounded-full border-2 border-slate-800 shadow-2xl p-2 flex items-center justify-center">
        {/* Up */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-14">
          {renderButton(up, <Icons.ArrowUp />, 'w-full h-full rounded-t-full rounded-b-lg')}
        </div>
        {/* Down */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-14">
          {renderButton(down, <Icons.ArrowDown />, 'w-full h-full rounded-b-full rounded-t-lg')}
        </div>
        {/* Left */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-14 h-16">
          {renderButton(left, <Icons.ArrowLeft />, 'w-full h-full rounded-l-full rounded-r-lg')}
        </div>
        {/* Right */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-16">
          {renderButton(right, <Icons.ArrowRight />, 'w-full h-full rounded-r-full rounded-l-lg')}
        </div>
        {/* Center OK */}
        <div className="w-20 h-20 z-10">
          {renderButton(ok, <span className="font-extrabold text-cyan-400">OK</span>, 'w-full h-full rounded-full bg-cyan-950/50 border-cyan-500/30 text-cyan-300')}
        </div>
      </div>
    );
  };

  // تصنيف وعرض الواجهات البصرية بحسب القسم الـ 11
  const renderCategoryLayout = () => {
    const category = config.categoryId.toLowerCase();

    // 1. واجهة التكييفات (AC Remote Layout)
    if (category === 'ac' || category === 'air_conditioner') {
      const power = findBtn(['power']);
      const tempUp = findBtn(['temp_up', 'temp_plus', 'temp+']);
      const tempDown = findBtn(['temp_down', 'temp_minus', 'temp-']);
      const mode = findBtn(['mode']);
      const fan = findBtn(['fan', 'speed', 'fan_speed']);
      const swing = findBtn(['swing']);
      const eco = findBtn(['eco', 'turbo']);

      return (
        <div className="space-y-6">
          {/* شاشة التكييف LCD */}
          <div className="bg-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-4 text-emerald-400 font-mono shadow-inner flex justify-between items-center">
            <div>
              <span className="text-xs uppercase block text-emerald-600 font-sans">Mode</span>
              <span className="text-sm font-bold flex items-center gap-1"><Icons.Snow /> COOL</span>
            </div>
            <div className="text-center">
              <span className="text-4xl font-extrabold">{acTemp}°C</span>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase block text-emerald-600 font-sans font-bold">Fan Speed</span>
              <span className="text-sm font-bold flex items-center gap-1 justify-end"><Icons.Fan /> AUTO</span>
            </div>
          </div>

          {/* أزرار التحكم بالحرارة والتشغيل */}
          <div className="grid grid-cols-3 gap-3 items-center">
            {renderButton(tempDown, 'TEMP -', 'h-16 text-lg bg-blue-900/40 border-blue-500/30 text-blue-300')}
            {renderButton(power, <Icons.Power />, 'h-20 w-20 mx-auto rounded-full text-xl shadow-red-900/50')}
            {renderButton(tempUp, 'TEMP +', 'h-16 text-lg bg-orange-900/40 border-orange-500/30 text-orange-300')}
          </div>

          {/* أزرار الوضع والسرعات */}
          <div className="grid grid-cols-3 gap-3">
            {renderButton(mode, 'MODE', 'h-14')}
            {renderButton(fan, 'FAN', 'h-14')}
            {renderButton(swing, 'SWING', 'h-14')}
          </div>
          {eco && <div className="w-full">{renderButton(eco, eco.label, 'h-12 w-full bg-emerald-900/30 text-emerald-300')}</div>}
        </div>
      );
    }

    // 2. واجهة التلفزيونات والشاشات (TV / Smart TV)
    if (category === 'tv' || category === 'smart_tv') {
      const power = findBtn(['power']);
      const mute = findBtn(['mute']);
      const source = findBtn(['source', 'input']);
      const home = findBtn(['home']);
      const menu = findBtn(['menu']);
      const back = findBtn(['back', 'return']);
      const volUp = findBtn(['vol_up', 'vol+']);
      const volDown = findBtn(['vol_down', 'vol-']);
      const chUp = findBtn(['ch_up', 'ch+']);
      const chDown = findBtn(['ch_down', 'ch-']);

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 items-center">
            {renderButton(source, 'SOURCE', 'h-12 text-xs')}
            {renderButton(power, <Icons.Power />, 'h-14 bg-red-600 shadow-red-900/50')}
            {renderButton(mute, <Icons.Mute />, 'h-12')}
          </div>

          {/* D-Pad Wheel */}
          {renderDPad()}

          {/* أزرار الملاحة الأساسية */}
          <div className="grid grid-cols-3 gap-3">
            {renderButton(back, <span className="flex items-center gap-1"><Icons.Back /> عودة</span>, 'h-12')}
            {renderButton(home, <Icons.Home />, 'h-12 bg-cyan-900/30 text-cyan-300')}
            {renderButton(menu, <span className="flex items-center gap-1"><Icons.Menu /> القائمة</span>, 'h-12')}
          </div>

          {/* رافع الصوت والقنوات الجانبي */}
          <div className="grid grid-cols-2 gap-6 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            {/* الصوت */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 text-center uppercase tracking-widest">VOL</span>
              {renderButton(volUp, <Icons.VolumeUp />, 'h-14')}
              {renderButton(volDown, <Icons.VolumeDown />, 'h-14')}
            </div>
            {/* القنوات */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 text-center uppercase tracking-widest">CH</span>
              {renderButton(chUp, 'CH +', 'h-14')}
              {renderButton(chDown, 'CH -', 'h-14')}
            </div>
          </div>

          {/* زر تبديل لوحة الأرقام */}
          <button 
            onClick={() => setShowKeypad(!showKeypad)}
            className="w-full py-2 bg-slate-800/60 hover:bg-slate-700 text-xs text-slate-400 rounded-xl border border-slate-700/50"
          >
            {showKeypad ? 'إخفاء لوحة الأرقام ▲' : 'إظهار لوحة الأرقام (0-9) ▼'}
          </button>

          {showKeypad && (
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              {['1','2','3','4','5','6','7','8','9','0'].map(num => {
                const numBtn = findBtn([num]);
                return renderButton(numBtn, num, 'h-12 text-base font-bold', num);
              })}
            </div>
          )}
        </div>
      );
    }

    // 3. واجهة البروجيكتور (Projector)
    if (category === 'projector') {
      const power = findBtn(['power']);
      const keystoneUp = findBtn(['keystone_up', 'keystone+']);
      const keystoneDown = findBtn(['keystone_down', 'keystone-']);
      const zoomIn = findBtn(['zoom_in', 'zoom+']);
      const zoomOut = findBtn(['zoom_out', 'zoom-']);
      const freeze = findBtn(['freeze']);
      const source = findBtn(['source', 'input']);

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {renderButton(source, 'INPUT', 'h-12 w-24')}
            {renderButton(power, <Icons.Power />, 'h-14 w-14 rounded-full')}
            {renderButton(freeze, 'FREEZE', 'h-12 w-24 bg-amber-900/30 text-amber-300')}
          </div>

          {renderDPad()}

          {/* تحكم الأبعاد والتقريب المخصص للبروجيكتور */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="space-y-2">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block text-center">Keystone</span>
              {renderButton(keystoneUp, 'KEYSTONE ▲', 'h-12')}
              {renderButton(keystoneDown, 'KEYSTONE ▼', 'h-12')}
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block text-center">Zoom</span>
              {renderButton(zoomIn, 'ZOOM +', 'h-12')}
              {renderButton(zoomOut, 'ZOOM -', 'h-12')}
            </div>
          </div>
        </div>
      );
    }

    // 4. واجهة المراوح (Fan)
    if (category === 'fan') {
      const power = findBtn(['power', 'off']);
      const speed1 = findBtn(['speed_1', 'low', '1']);
      const speed2 = findBtn(['speed_2', 'med', 'medium', '2']);
      const speed3 = findBtn(['speed_3', 'high', '3']);
      const swing = findBtn(['swing', 'osc']);
      const timer = findBtn(['timer']);

      return (
        <div className="space-y-6">
          <div className="text-center py-4">
            {renderButton(power, <div className="flex items-center gap-2"><Icons.Power /> <span>ON / OFF</span></div>, 'h-16 w-48 mx-auto rounded-full text-base shadow-red-900/50')}
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400 block text-center uppercase tracking-widest">Speed Control</span>
            <div className="grid grid-cols-3 gap-3">
              {renderButton(speed1, '1 (LOW)', 'h-14 bg-slate-800')}
              {renderButton(speed2, '2 (MED)', 'h-14 bg-cyan-950/40 text-cyan-300 border-cyan-500/30')}
              {renderButton(speed3, '3 (HIGH)', 'h-14 bg-cyan-600 text-white font-extrabold')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {renderButton(swing, <span className="flex items-center gap-2"><Icons.Fan /> SWING</span>, 'h-14')}
            {renderButton(timer, 'TIMER 🕒', 'h-14')}
          </div>
        </div>
      );
    }

    // 5. واجهة الرسيفر والستالايت (Receiver / STB / Cable)
    if (category === 'receiver' || category === 'sat' || category === 'stb') {
      const power = findBtn(['power']);
      const epg = findBtn(['epg', 'guide']);
      const info = findBtn(['info']);
      const red = findBtn(['red']);
      const green = findBtn(['green']);
      const yellow = findBtn(['yellow']);
      const blue = findBtn(['blue']);

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {renderButton(epg, 'GUIDE', 'h-12 w-20')}
            {renderButton(power, <Icons.Power />, 'h-14 w-14 rounded-full')}
            {renderButton(info, 'INFO', 'h-12 w-20')}
          </div>

          {renderDPad()}

          {/* الأزرار الملونة للرسيفر */}
          <div className="grid grid-cols-4 gap-2 py-2">
            {renderButton(red, '', 'h-8 bg-red-600 hover:bg-red-500 border-none')}
            {renderButton(green, '', 'h-8 bg-emerald-600 hover:bg-emerald-500 border-none')}
            {renderButton(yellow, '', 'h-8 bg-amber-500 hover:bg-amber-400 border-none')}
            {renderButton(blue, '', 'h-8 bg-blue-600 hover:bg-blue-500 border-none')}
          </div>
        </div>
      );
    }

    // 6. واجهة أجهزة الصوت والساوند بار (Audio / Soundbar / Hi-Fi)
    if (category === 'audio' || category === 'soundbar' || category === 'hifi') {
      const power = findBtn(['power']);
      const volUp = findBtn(['vol_up', 'vol+']);
      const volDown = findBtn(['vol_down', 'vol-']);
      const mute = findBtn(['mute']);
      const play = findBtn(['play']);
      const pause = findBtn(['pause']);
      const input = findBtn(['input', 'source']);

      return (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            {renderButton(input, 'INPUT', 'h-12 w-24')}
            {renderButton(power, <Icons.Power />, 'h-16 w-16 rounded-full')}
            {renderButton(mute, <Icons.Mute />, 'h-12 w-24')}
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
            <span className="text-xs text-slate-400 block text-center uppercase tracking-widest">Playback & Volume</span>
            <div className="grid grid-cols-2 gap-4">
              {renderButton(volDown, <Icons.VolumeDown />, 'h-16')}
              {renderButton(volUp, <Icons.VolumeUp />, 'h-16')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderButton(play, <Icons.Play />, 'h-12 bg-emerald-900/30 text-emerald-300')}
              {renderButton(pause, <Icons.Pause />, 'h-12 bg-amber-900/30 text-amber-300')}
            </div>
          </div>
        </div>
      );
    }

    // 7. واجهة مشغلات الفيديو والـ DVD (DVD / Media Player)
    if (category === 'dvd' || category === 'media') {
      const power = findBtn(['power']);
      const play = findBtn(['play']);
      const pause = findBtn(['pause']);
      const stop = findBtn(['stop']);
      const open = findBtn(['eject', 'open']);

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {renderButton(open, 'EJECT ⏏', 'h-12 w-24')}
            {renderButton(power, <Icons.Power />, 'h-14 w-14 rounded-full')}
          </div>

          {renderDPad()}

          <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            {renderButton(play, <Icons.Play />, 'h-14 bg-emerald-900/30 text-emerald-300')}
            {renderButton(pause, <Icons.Pause />, 'h-14 bg-amber-900/30 text-amber-300')}
            {renderButton(stop, <Icons.Stop />, 'h-14 bg-red-900/30 text-red-300')}
          </div>
        </div>
      );
    }

    // 8. واجهة الإضاءة الذكية (Smart Light)
    if (category === 'light' || category === 'lighting') {
      const powerOn = findBtn(['power_on', 'on']);
      const powerOff = findBtn(['power_off', 'off']);
      const brightUp = findBtn(['bright_up', 'bright+']);
      const brightDown = findBtn(['bright_down', 'bright-']);

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {renderButton(powerOn, 'ON 💡', 'h-16 bg-amber-500 text-slate-950 font-black text-base shadow-amber-500/20')}
            {renderButton(powerOff, 'OFF 🌑', 'h-16 bg-slate-800 text-slate-400 font-bold')}
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs text-amber-400 block text-center uppercase tracking-widest">Brightness</span>
            <div className="grid grid-cols-2 gap-4">
              {renderButton(brightDown, 'DIM 🔉', 'h-14')}
              {renderButton(brightUp, 'BRIGHT 🔊', 'h-14')}
            </div>
          </div>
        </div>
      );
    }

    // 9. واجهة الكاميرا (Camera Remote)
    if (category === 'camera') {
      const shutter = findBtn(['shutter', 'snap', 'power']);
      const timer = findBtn(['timer']);

      return (
        <div className="space-y-6 text-center">
          <div className="py-6">
            {renderButton(shutter, '📷 SNAP / SHUTTER', 'h-24 w-48 mx-auto rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-lg shadow-red-900/50')}
          </div>
          {timer && <div className="w-36 mx-auto">{renderButton(timer, 'TIMER ⏱️', 'h-12')}</div>}
        </div>
      );
    }

    // 10. واجهة المكنسة الذكية (Robot Vacuum)
    if (category === 'vacuum' || category === 'cleaner') {
      const start = findBtn(['start', 'clean', 'power']);
      const home = findBtn(['home', 'dock']);

      return (
        <div className="space-y-6">
          <div className="text-center py-4">
            {renderButton(start, 'CLEAN 🧹', 'h-20 w-48 mx-auto rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-emerald-900/40')}
          </div>
          {renderDPad()}
          <div className="w-48 mx-auto">{renderButton(home, 'RETURN DOCK 🏠', 'h-14 bg-cyan-900/30 text-cyan-300')}</div>
        </div>
      );
    }

    // 11. الواجهة التكيفية الافتراضية للعامة والأقسام الأخرى (Fallback / General Grid)
    return (
      <div className="space-y-4">
        {/* إذا كان يوجد أزرار اتجاهات يتم إنشاء D-Pad تلقائياً */}
        {(findBtn(['up']) || findBtn(['nav_up'])) && renderDPad()}

        {/* عرض باقي الأزرار في شبكة متناسقة */}
        <div className="grid grid-cols-3 gap-3">
          {config.buttons.map((btn) => renderButton(btn))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/95 border border-cyan-500/30 rounded-[2.5rem] p-6 shadow-2xl select-none backdrop-blur-md relative overflow-hidden">
      
      {/* لمبة مستشعر الـ IR العلوي (LED Flash Effect) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
        <div className={`w-3 h-3 rounded-full transition-all duration-150 ${isTransmitting ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]' : 'bg-slate-800'}`} />
      </div>

      {/* شريط العنوان العلوي (Header Bar) */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-4 pt-2">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all active:scale-95 border border-slate-700/50"
        >
          ← عودة
        </button>

        <div className="text-center">
          <h3 className="text-lg font-extrabold text-cyan-400 capitalize tracking-wide">{config.brandId}</h3>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">{config.categoryId}</span>
        </div>

        {onToggleFavorite ? (
          <button
            onClick={() => onToggleFavorite(config)}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              isFavorite ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30' : 'text-slate-500 hover:text-slate-300 bg-slate-800/80 border border-slate-700/50'
            }`}
            title="إضافة للمفضلة"
          >
            ★
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* عرض الواجهة البصرية المخصصة للقسم المحدد */}
      {renderCategoryLayout()}
    </div>
  );
});

DynamicRemote.displayName = 'DynamicRemote';

