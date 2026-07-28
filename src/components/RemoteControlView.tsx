import React, { useState } from 'react';
import { translateKey } from '../i18n';
import { AppCategory, Brand, CustomButton, IRSignalLog, RemoteState } from '../types';
import { playClickSound, triggerHapticVibration } from '../utils/audio';

interface RemoteControlViewProps {
  currentLanguage: string;
  selectedCategory: AppCategory;
  selectedBrand: Brand;
  remoteState: RemoteState;
  onUpdateRemoteState: (updater: (prev: RemoteState) => RemoteState) => void;
  onBackToBrands: () => void;
  onEmitSignal: (command: string, hexCode: string) => void;
  audioFeedback: boolean;
  hapticFeedback: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  customButtons: CustomButton[];
  onOpenAddCustomButton: () => void;
  onRemoveCustomButton: (id: string) => void;
  recentSignals: IRSignalLog[];
}

export const RemoteControlView: React.FC<RemoteControlViewProps> = ({
  currentLanguage,
  selectedCategory,
  selectedBrand,
  remoteState,
  onUpdateRemoteState,
  onBackToBrands,
  onEmitSignal,
  audioFeedback,
  hapticFeedback,
  isFavorite,
  onToggleFavorite,
  customButtons,
  onOpenAddCustomButton,
  onRemoveCustomButton,
  recentSignals
}) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lastTransmittedHex, setLastTransmittedHex] = useState<string>('0x20DF10EF');
  const [inputChannelNumber, setInputChannelNumber] = useState<string>('');

  // Handle Button Click Action
  const handleButtonClick = (
    command: string, 
    hexCode: string, 
    action?: () => void, 
    soundType: 'click' | 'power' | 'beep' | 'toggle' = 'click'
  ) => {
    playClickSound(audioFeedback, soundType);
    triggerHapticVibration(hapticFeedback, 25);

    // Trigger visual transmitter flash
    setIsTransmitting(true);
    setLastTransmittedHex(hexCode);
    setTimeout(() => setIsTransmitting(false), 350);

    // Emit signal to parent log
    onEmitSignal(command, hexCode);

    // Run state update if provided
    if (action) {
      action();
    }
  };

  // Numpad channel handler
  const handleNumpadPress = (num: string) => {
    const newChan = inputChannelNumber + num;
    setInputChannelNumber(newChan);
    handleButtonClick(`Key ${num}`, `0x20DF000${num}`, undefined, 'beep');

    if (newChan.length >= 2) {
      const parsed = parseInt(newChan, 10);
      onUpdateRemoteState((prev) => ({ ...prev, channel: parsed }));
      setTimeout(() => setInputChannelNumber(''), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Remote View Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBackToBrands}
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group transition-colors"
        >
          <i className="fa-solid fa-arrow-right rtl:block ltr:hidden group-hover:translate-x-1 transition-transform"></i>
          <i className="fa-solid fa-arrow-left ltr:block rtl:hidden group-hover:-translate-x-1 transition-transform"></i>
          <span data-i18n="header.back_to_brands">
            {translateKey(currentLanguage, 'header.back_to_brands', 'اختيار الماركة')}
          </span>
        </button>

        {/* Selected Brand & Category Tag */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold font-orbitron flex items-center gap-2">
            <i className={`${selectedBrand.logoIcon || 'fa-solid fa-tv'} text-cyan-400`}></i>
            {selectedBrand.name}
            {selectedBrand.popular && (
              <i className="fa-solid fa-star text-amber-400 text-xs" title="Popular Brand"></i>
            )}
          </span>
          <button
            onClick={onToggleFavorite}
            data-i18n={isFavorite ? 'remote.in_fav' : 'remote.add_to_fav'}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400'
            }`}
          >
            <i className={`fa-solid fa-star ${isFavorite ? 'text-amber-400' : ''}`}></i>
            <span className="hidden sm:inline">
              {isFavorite 
                ? translateKey(currentLanguage, 'remote.in_fav', 'المفضلة') 
                : translateKey(currentLanguage, 'remote.add_to_fav', 'حفظ للمفضلة')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Remote Body (Sleek Cyberpunk Hardware Frame) */}
      <div className="relative max-w-sm sm:max-w-md mx-auto rounded-3xl bg-[#0d0d0d] border border-[#222] p-6 sm:p-8 shadow-2xl space-y-6 cyber-border">
        
        {/* Infrared Transmitter Bulb & Status LED Bar */}
        <div className="flex flex-col items-center justify-center space-y-2 pt-1">
          <div className="relative flex items-center justify-center">
            {/* Glowing IR LED Bulb */}
            <div 
              className={`w-6 h-6 rounded-full border transition-all duration-300 flex items-center justify-center ${
                isTransmitting 
                  ? 'bg-[#00e5ff] border-[#00e5ff] shadow-[0_0_25px_#00e5ff] scale-125 animate-ir-pulse' 
                  : remoteState.power 
                    ? 'bg-[#00e5ff]/20 border-[#00e5ff]/80 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                    : 'bg-[#ff0055]/20 border-[#ff0055]/80 text-[#ff0055]'
              }`}
            >
              <i className={`fa-solid fa-wifi text-[10px] ${isTransmitting ? 'text-black' : ''}`}></i>
            </div>
            {isTransmitting && (
              <span className="absolute -top-1 w-12 h-12 rounded-full border border-[#00e5ff] animate-ping opacity-75"></span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-[#888]">
            <span>IR PROTOCOL: <strong className="text-[#00e5ff] font-bold">{selectedBrand.irProtocols?.[0] || 'NEC 38kHz'}</strong></span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{lastTransmittedHex}</span>
          </div>
        </div>

        {/* Dynamic Display Panel for Category State */}
        <div className="rounded-2xl bg-[#1a1a1a] border border-[#333] p-4 shadow-inner text-center space-y-2 font-orbitron">
          <div className="flex items-center justify-between text-[11px] text-[#888] border-b border-[#333] pb-2">
            <span className="text-[#888] uppercase tracking-wider">{selectedBrand.name}</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${remoteState.power ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40' : 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40'}`}>
              {remoteState.power ? 'POWER: ON' : 'POWER: OFF'}
            </span>
          </div>

          {/* TV Display State */}
          {selectedCategory === 'tv' && (
            <div className="py-2 space-y-1">
              <div className="text-2xl font-bold neon-text tracking-wider">
                CH {remoteState.channel < 10 ? `0${remoteState.channel}` : remoteState.channel}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-[#e0e0e0] font-sans">
                <span>VOL: <strong className="text-amber-400 font-orbitron">{remoteState.muted ? 'MUTED' : remoteState.volume}</strong></span>
                <span>•</span>
                <span>SRC: <strong className="text-[#00e5ff] font-orbitron uppercase">{remoteState.inputSource}</strong></span>
              </div>
            </div>
          )}

          {/* AC Display State */}
          {selectedCategory === 'ac' && (
            <div className="py-2 space-y-1">
              <div className="text-3xl font-light neon-text tracking-wider flex items-center justify-center gap-1">
                <span>{remoteState.temperature}</span>
                <span className="text-lg">°C</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-[#e0e0e0] font-sans uppercase">
                <span>MODE: <strong className="text-[#00e5ff] font-orbitron">{remoteState.mode}</strong></span>
                <span>•</span>
                <span>FAN: <strong className="text-amber-400 font-orbitron">{remoteState.fanSpeed}</strong></span>
              </div>
            </div>
          )}

          {/* Fridge Display State */}
          {selectedCategory === 'smart_appliances' && (
            <div className="py-2 grid grid-cols-2 gap-2 text-center divide-x divide-[#333] rtl:divide-x-reverse">
              <div>
                <span className="text-[10px] text-[#888] block font-sans" data-i18n="remote.freezer">
                  {translateKey(currentLanguage, 'remote.freezer', 'الفريزر')}
                </span>
                <span className="text-xl font-bold text-[#00e5ff]">{remoteState.freezerTemp}°C</span>
              </div>
              <div>
                <span className="text-[10px] text-[#888] block font-sans" data-i18n="remote.fridge">
                  {translateKey(currentLanguage, 'remote.fridge', 'الثلاجة')}
                </span>
                <span className="text-xl font-bold text-amber-400">{remoteState.fridgeTemp}°C</span>
              </div>
            </div>
          )}

          {/* Lighting & Fan Display State */}
          {selectedCategory === 'lighting_fans' && (
            <div className="py-2 space-y-1">
              <div className="text-2xl font-bold text-amber-300 flex items-center justify-center gap-2">
                <i className="fa-solid fa-lightbulb"></i>
                <span>{remoteState.brightness}%</span>
              </div>
              <div className="text-xs text-[#888] font-sans">
                <span>TEMP: <strong className="text-[#00e5ff] font-orbitron">{remoteState.colorTemp}K</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Remote Controls Power & Mute */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Main Power OFF Button */}
          <button
            onClick={() => handleButtonClick(
              'Power Off', 
              '0x10AF0000', 
              () => onUpdateRemoteState((p) => ({ ...p, power: false })), 
              'power'
            )}
            style={{ background: '#ff0055', border: 'none', width: '100%', borderRadius: '12px' }}
            className="py-3 text-white font-bold text-xs uppercase cursor-pointer hover:opacity-90 transition-opacity active:scale-95"
            title={translateKey(currentLanguage, 'remote.power', 'إيقاف')}
          >
            OFF
          </button>

          {/* Main Power ON Button */}
          <button
            onClick={() => handleButtonClick(
              'Power On', 
              '0x10AF00FF', 
              () => onUpdateRemoteState((p) => ({ ...p, power: true })), 
              'power'
            )}
            style={{ background: '#00e5ff', color: '#000', border: 'none', width: '100%', borderRadius: '12px' }}
            className="py-3 font-bold text-xs uppercase cursor-pointer hover:opacity-90 transition-opacity active:scale-95"
            title={translateKey(currentLanguage, 'remote.power', 'تشغيل')}
          >
            ON
          </button>
        </div>

        {/* CATEGORY SPECIFIC INTERACTIVE CONTROLS */}

        {/* 1. TV & SCREENS REMOTE CONTROL */}
        {selectedCategory === 'tv' && (
          <div className="space-y-6">
            {/* D-PAD DIRECTIONAL NAVIGATION */}
            <div className="relative w-48 h-48 mx-auto rounded-full bg-[#111] border border-[#333] shadow-inner flex items-center justify-center p-2">
              {/* UP */}
              <button
                onClick={() => handleButtonClick('D-Pad UP', '0x20DF02FD')}
                className="absolute top-2 w-12 h-10 rounded-t-xl bg-[#1a1a1a] hover:bg-[#00e5ff] hover:text-black text-white flex items-center justify-center text-base transition-colors active:scale-95 border border-[#333]"
              >
                <i className="fa-solid fa-chevron-up"></i>
              </button>

              {/* DOWN */}
              <button
                onClick={() => handleButtonClick('D-Pad DOWN', '0x20DF827D')}
                className="absolute bottom-2 w-12 h-10 rounded-b-xl bg-[#1a1a1a] hover:bg-[#00e5ff] hover:text-black text-white flex items-center justify-center text-base transition-colors active:scale-95 border border-[#333]"
              >
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              {/* LEFT */}
              <button
                onClick={() => handleButtonClick('D-Pad LEFT', '0x20E0A25D')}
                className="absolute left-2 h-12 w-10 rounded-l-xl bg-[#1a1a1a] hover:bg-[#00e5ff] hover:text-black text-white flex items-center justify-center text-base transition-colors active:scale-95 border border-[#333]"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              {/* RIGHT */}
              <button
                onClick={() => handleButtonClick('D-Pad RIGHT', '0x20DF609F')}
                className="absolute right-2 h-12 w-10 rounded-r-xl bg-[#1a1a1a] hover:bg-[#00e5ff] hover:text-black text-white flex items-center justify-center text-base transition-colors active:scale-95 border border-[#333]"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>

              {/* CENTER OK BUTTON */}
              <button
                onClick={() => handleButtonClick('Select OK', '0x20DF22DD')}
                data-i18n="remote.ok"
                className="w-16 h-16 rounded-full bg-[#00e5ff] hover:opacity-90 text-black font-black text-sm shadow-md flex items-center justify-center transition-transform active:scale-90 font-orbitron cursor-pointer"
              >
                OK
              </button>
            </div>

            {/* VOL & CH ROCKERS */}
            <div className="grid grid-cols-2 gap-6 bg-[#1a1a1a] p-4 rounded-2xl border border-[#333]">
              {/* VOLUME ROCKER */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-[#888] uppercase">VOL</span>
                <div className="flex flex-col rounded-2xl bg-[#0d0d0d] border border-[#333] overflow-hidden w-14">
                  <button
                    onClick={() => handleButtonClick(
                      'Volume Up', 
                      '0x20DF40BF', 
                      () => onUpdateRemoteState((p) => ({ ...p, volume: Math.min(100, p.volume + 1), muted: false }))
                    )}
                    data-i18n="remote.vol_up"
                    className="p-3 hover:bg-[#00e5ff] hover:text-black text-white transition-colors active:scale-95 flex items-center justify-center"
                    title={translateKey(currentLanguage, 'remote.vol_up', 'رفع الصوت')}
                  >
                    <i className="fa-solid fa-plus text-sm"></i>
                  </button>
                  <div className="h-px bg-[#333]"></div>
                  <button
                    onClick={() => handleButtonClick(
                      'Volume Down', 
                      '0x20DFC03F', 
                      () => onUpdateRemoteState((p) => ({ ...p, volume: Math.max(0, p.volume - 1), muted: false }))
                    )}
                    data-i18n="remote.vol_down"
                    className="p-3 hover:bg-[#00e5ff] hover:text-black text-white transition-colors active:scale-95 flex items-center justify-center"
                    title={translateKey(currentLanguage, 'remote.vol_down', 'خفض الصوت')}
                  >
                    <i className="fa-solid fa-minus text-sm"></i>
                  </button>
                </div>
              </div>

              {/* CHANNEL ROCKER */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-[#888] uppercase">CH</span>
                <div className="flex flex-col rounded-2xl bg-[#0d0d0d] border border-[#333] overflow-hidden w-14">
                  <button
                    onClick={() => handleButtonClick(
                      'Channel Up', 
                      '0x20DF00FF', 
                      () => onUpdateRemoteState((p) => ({ ...p, channel: p.channel + 1 }))
                    )}
                    data-i18n="remote.ch_up"
                    className="p-3 hover:bg-amber-400 hover:text-black text-white transition-colors active:scale-95 flex items-center justify-center"
                    title={translateKey(currentLanguage, 'remote.ch_up', 'القناة التالية')}
                  >
                    <i className="fa-solid fa-chevron-up text-sm"></i>
                  </button>
                  <div className="h-px bg-[#333]"></div>
                  <button
                    onClick={() => handleButtonClick(
                      'Channel Down', 
                      '0x20DF807F', 
                      () => onUpdateRemoteState((p) => ({ ...p, channel: Math.max(1, p.channel - 1) }))
                    )}
                    data-i18n="remote.ch_down"
                    className="p-3 hover:bg-amber-400 hover:text-black text-white transition-colors active:scale-95 flex items-center justify-center"
                    title={translateKey(currentLanguage, 'remote.ch_down', 'القناة السابقة')}
                  >
                    <i className="fa-solid fa-chevron-down text-sm"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* NUMPAD GRID (0-9) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#888] text-center uppercase tracking-wider">NUMPAD</div>
              <div className="grid grid-cols-3 gap-2.5">
                {['1','2','3','4','5','6','7','8','9','0'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleNumpadPress(n)}
                    className="btn-remote font-orbitron"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* QUICK APP SHORTCUTS */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center" data-i18n="remote.shortcuts">
                {translateKey(currentLanguage, 'remote.shortcuts', 'التطبيقات السريعة')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleButtonClick('Launch Netflix', '0x20DF708F')}
                  className="py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all"
                >
                  NETFLIX
                </button>
                <button
                  onClick={() => handleButtonClick('Launch YouTube', '0x20DFB04F')}
                  className="py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all"
                >
                  YOUTUBE
                </button>
                <button
                  onClick={() => handleButtonClick('Launch Prime', '0x20DFD02F')}
                  className="py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all"
                >
                  PRIME
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. AIR CONDITIONER REMOTE CONTROL */}
        {selectedCategory === 'ac' && (
          <div className="space-y-6">
            {/* TEMPERATURE ADJUSTMENT ROCKER */}
            <div className="flex items-center justify-center gap-6 bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
              <button
                onClick={() => handleButtonClick(
                  'Temp Down', 
                  '0x10AF30CF', 
                  () => onUpdateRemoteState((p) => ({ ...p, temperature: Math.max(16, p.temperature - 1) }))
                )}
                data-i18n="remote.temp_down"
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-slate-700 flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                title={translateKey(currentLanguage, 'remote.temp_down', 'تقليل الحرارة')}
              >
                <i className="fa-solid fa-minus"></i>
              </button>

              <div className="text-center font-orbitron">
                <span className="text-4xl font-black text-amber-400">{remoteState.temperature}°</span>
                <span className="text-xs text-slate-400 block font-sans">Target Temp</span>
              </div>

              <button
                onClick={() => handleButtonClick(
                  'Temp Up', 
                  '0x10AF20DF', 
                  () => onUpdateRemoteState((p) => ({ ...p, temperature: Math.min(30, p.temperature + 1) }))
                )}
                data-i18n="remote.temp_up"
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-rose-500 hover:text-slate-950 text-rose-400 border border-slate-700 flex items-center justify-center text-xl font-bold transition-all active:scale-95"
                title={translateKey(currentLanguage, 'remote.temp_up', 'زيادة الحرارة')}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            {/* AC MODE SELECTOR */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center" data-i18n="remote.mode">
                {translateKey(currentLanguage, 'remote.mode', 'وضع التكييف')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['cool', 'heat', 'auto', 'dry', 'fan'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleButtonClick(
                      `AC Mode ${m}`, 
                      `0x10AF0${m.charCodeAt(0)}`, 
                      () => onUpdateRemoteState((p) => ({ ...p, mode: m })),
                      'toggle'
                    )}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                      remoteState.mode === m
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* FAN SPEED & SWING */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleButtonClick(
                  'Fan Speed Cycle', 
                  '0x10AF609F', 
                  () => onUpdateRemoteState((p) => {
                    const speeds = ['low', 'med', 'high', 'auto'] as const;
                    const next = speeds[(speeds.indexOf(p.fanSpeed) + 1) % speeds.length];
                    return { ...p, fanSpeed: next };
                  })
                )}
                data-i18n="remote.fan_speed"
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700/80 text-xs font-bold flex items-center justify-between transition-all"
              >
                <span data-i18n="remote.fan_speed">{translateKey(currentLanguage, 'remote.fan_speed', 'المروحة')}</span>
                <span className="font-orbitron uppercase text-emerald-400">{remoteState.fanSpeed}</span>
              </button>

              <button
                onClick={() => handleButtonClick(
                  'Toggle Swing', 
                  '0x10AF708F', 
                  () => onUpdateRemoteState((p) => ({ ...p, swing: !p.swing })),
                  'toggle'
                )}
                data-i18n="remote.swing"
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  remoteState.swing
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span data-i18n="remote.swing">{translateKey(currentLanguage, 'remote.swing', 'التوجيه')}</span>
                <span>{remoteState.swing ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. REFRIGERATORS & SMART APPLIANCES */}
        {selectedCategory === 'smart_appliances' && (
          <div className="space-y-6">
            <div className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              {/* FREEZER TEMP */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-300" data-i18n="remote.freezer">
                  {translateKey(currentLanguage, 'remote.freezer', 'حرارة الفريزر')}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleButtonClick(
                      'Freezer Temp Down', 
                      '0x30BF10EF', 
                      () => onUpdateRemoteState((p) => ({ ...p, freezerTemp: Math.max(-24, p.freezerTemp - 1) }))
                    )}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 font-bold"
                  >
                    -
                  </button>
                  <span className="font-orbitron text-cyan-300 text-base font-bold">{remoteState.freezerTemp}°C</span>
                  <button
                    onClick={() => handleButtonClick(
                      'Freezer Temp Up', 
                      '0x30BF20DF', 
                      () => onUpdateRemoteState((p) => ({ ...p, freezerTemp: Math.min(-14, p.freezerTemp + 1) }))
                    )}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* FRIDGE TEMP */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300" data-i18n="remote.fridge">
                  {translateKey(currentLanguage, 'remote.fridge', 'حرارة الثلاجة')}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleButtonClick(
                      'Fridge Temp Down', 
                      '0x30BF30CF', 
                      () => onUpdateRemoteState((p) => ({ ...p, fridgeTemp: Math.max(1, p.fridgeTemp - 1) }))
                    )}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 font-bold"
                  >
                    -
                  </button>
                  <span className="font-orbitron text-emerald-300 text-base font-bold">{remoteState.fridgeTemp}°C</span>
                  <button
                    onClick={() => handleButtonClick(
                      'Fridge Temp Up', 
                      '0x30BF40BF', 
                      () => onUpdateRemoteState((p) => ({ ...p, fridgeTemp: Math.min(8, p.fridgeTemp + 1) }))
                    )}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ECO MODE TOGGLE */}
            <button
              onClick={() => handleButtonClick(
                'Eco Mode Toggle', 
                '0x30BF50AF', 
                () => onUpdateRemoteState((p) => ({ ...p, ecoMode: !p.ecoMode })),
                'toggle'
              )}
              data-i18n="remote.eco_mode"
              className={`w-full py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                remoteState.ecoMode 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black' 
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <i className="fa-solid fa-leaf"></i>
              <span data-i18n="remote.eco_mode">
                {translateKey(currentLanguage, 'remote.eco_mode', 'الوضع الاقتصادي (Eco Mode)')}
              </span>
            </button>
          </div>
        )}

        {/* 4. LIGHTING & FANS CONTROLS */}
        {selectedCategory === 'lighting_fans' && (
          <div className="space-y-6">
            {/* BRIGHTNESS SLIDER */}
            <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span data-i18n="remote.brightness">
                  {translateKey(currentLanguage, 'remote.brightness', 'السطوع')}
                </span>
                <span className="font-orbitron text-amber-400">{remoteState.brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={remoteState.brightness}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdateRemoteState((p) => ({ ...p, brightness: val }));
                  handleButtonClick('Set Brightness', `0x40CF${val.toString(16)}`);
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* COLOR TEMPERATURE */}
            <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span data-i18n="remote.color_temp">
                  {translateKey(currentLanguage, 'remote.color_temp', 'حرارة اللون')}
                </span>
                <span className="font-orbitron text-cyan-300">{remoteState.colorTemp}K</span>
              </div>
              <input
                type="range"
                min="2700"
                max="6500"
                step="100"
                value={remoteState.colorTemp}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdateRemoteState((p) => ({ ...p, colorTemp: val }));
                  handleButtonClick('Set Color Temp', `0x40CF${(val / 100).toString(16)}`);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
