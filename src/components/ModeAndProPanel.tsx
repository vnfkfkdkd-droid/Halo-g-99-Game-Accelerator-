import { Flame, Gauge, Lock, ShieldCheck, Sliders, Zap } from 'lucide-react';
import { MODE_ORDER, PERFORMANCE_MODES } from '../data/helioG99Profiles';
import { PerformanceMode, ProTuningConfig } from '../types/booster';
import { audioFx } from '../utils/audioFx';

interface ModeAndProPanelProps {
  mode: PerformanceMode;
  onSelectMode: (mode: PerformanceMode) => void;
  proConfig: ProTuningConfig;
  onUpdateProConfig: (patch: Partial<ProTuningConfig>) => void;
}

export function ModeAndProPanel({
  mode,
  onSelectMode,
  proConfig,
  onUpdateProConfig,
}: ModeAndProPanelProps) {
  const activeMode = PERFORMANCE_MODES[mode];
  const isPro = mode === 'pro';

  const modeIcons: Record<PerformanceMode, React.ReactNode> = {
    normal: <ShieldCheck className="w-4 h-4" />,
    boost: <Zap className="w-4 h-4" />,
    high: <Flame className="w-4 h-4" />,
    pro: <Sliders className="w-4 h-4" />,
  };

  return (
    <section className="rounded-xl bg-[#111319] border border-white/[0.08] p-5 space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            أوضاع أداء معالج Helio G99 والتحكم الاحترافي
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            اختر بين الوضع العادي، وضع البوست، الأداء العالي، أو وضع المحترف لضبط الترددات يدوياً.
          </p>
        </div>
        <span className="text-xs font-mono text-rose-400 tabular-nums">
          {activeMode.powerProfileAr} · {activeMode.thermalStatusAr}
        </span>
      </div>

      {/* 4 Performance Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MODE_ORDER.map((m) => {
          const def = PERFORMANCE_MODES[m];
          const selected = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                onSelectMode(m);
                audioFx.playModeSwitch(m === 'high' || m === 'pro');
              }}
              className={`p-4 rounded-xl border text-right flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                selected
                  ? 'bg-rose-600/15 border-rose-500 text-white'
                  : 'bg-[#161922] border-white/[0.07] text-zinc-300 hover:border-white/20 hover:bg-[#191D28]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-display font-bold text-base ${
                      selected ? 'text-white' : 'text-zinc-100'
                    }`}
                  >
                    {def.nameAr}
                  </span>
                  <span className={selected ? 'text-rose-400' : 'text-zinc-500'}>
                    {modeIcons[m]}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mt-1">{def.subtitleAr}</div>
                <p className="text-xs text-zinc-400/90 leading-relaxed mt-2.5">
                  {def.descriptionAr}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono tabular-nums">
                <span className={selected ? 'text-rose-300' : 'text-zinc-400'}>
                  A76: {def.bigCoreMHz}MHz
                </span>
                <span className="text-zinc-500">·</span>
                <span className={selected ? 'text-rose-300' : 'text-zinc-400'}>
                  GPU: {def.gpuMHz}MHz
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-emerald-400">{def.fpsCap} FPS</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pro Mode Manual Tuning Section */}
      <div className="pt-4 border-t border-white/[0.07]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-rose-500" />
            <h3 className="font-display font-bold text-sm text-white">
              إعدادات وضع المحترف اليدوية (Pro Tuning)
            </h3>
          </div>
          {!isPro && (
            <button
              type="button"
              onClick={() => {
                onSelectMode('pro');
                audioFx.playModeSwitch(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تفعيل وضع المحترف للتخصيص</span>
            </button>
          )}
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-5 transition-opacity ${
            isPro ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}
        >
          {/* Cortex-A76 Big Core Clock */}
          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">تردد أنوية Cortex-A76</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">
                {proConfig.bigCoreMaxMHz} MHz
              </span>
            </div>
            <input
              type="range"
              min={1400}
              max={2200}
              step={50}
              value={proConfig.bigCoreMaxMHz}
              onChange={(e) => onUpdateProConfig({ bigCoreMaxMHz: Number(e.target.value) })}
              className="w-full hardware-slider"
              aria-label="تردد أنوية Cortex-A76"
            />
            <div className="flex justify-between text-[11px] font-mono text-zinc-500 tabular-nums">
              <span>1400 MHz</span>
              <span>2200 MHz (أقصى حد)</span>
            </div>
          </div>

          {/* Cortex-A55 Little Core Clock */}
          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">تردد أنوية Cortex-A55</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">
                {proConfig.littleCoreMaxMHz} MHz
              </span>
            </div>
            <input
              type="range"
              min={1200}
              max={2000}
              step={50}
              value={proConfig.littleCoreMaxMHz}
              onChange={(e) => onUpdateProConfig({ littleCoreMaxMHz: Number(e.target.value) })}
              className="w-full hardware-slider"
              aria-label="تردد أنوية Cortex-A55"
            />
            <div className="flex justify-between text-[11px] font-mono text-zinc-500 tabular-nums">
              <span>1200 MHz</span>
              <span>2000 MHz (أقصى حد)</span>
            </div>
          </div>

          {/* Mali-G57 MC2 GPU Frequency */}
          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">تردد معالج Mali-G57 MC2</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">
                {proConfig.gpuFreqMHz} MHz
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={980}
              step={20}
              value={proConfig.gpuFreqMHz}
              onChange={(e) => onUpdateProConfig({ gpuFreqMHz: Number(e.target.value) })}
              className="w-full hardware-slider"
              aria-label="تردد معالج الرسوميات Mali-G57"
            />
            <div className="flex justify-between text-[11px] font-mono text-zinc-500 tabular-nums">
              <span>500 MHz</span>
              <span>980 MHz (أقصى حد)</span>
            </div>
          </div>
        </div>

        {/* Pro FPS Target, Thermal Ceiling & Toggles */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 transition-opacity ${
            isPro ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}
        >
          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-300">هدف الإطارات</span>
            <div className="flex items-center gap-1">
              {([30, 45, 60, 90] as const).map((fps) => (
                <button
                  key={fps}
                  type="button"
                  onClick={() => {
                    onUpdateProConfig({ fpsTarget: fps });
                    audioFx.playClick(620);
                  }}
                  className={`px-2.5 py-1 rounded font-mono text-xs tabular-nums cursor-pointer transition-colors ${
                    proConfig.fpsTarget === fps
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#0B0D12] text-zinc-400 hover:text-white'
                  }`}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-300">سقف الحرارة</span>
            <div className="flex items-center gap-1">
              {([40, 43, 46, 48] as const).map((temp) => (
                <button
                  key={temp}
                  type="button"
                  onClick={() => {
                    onUpdateProConfig({ thermalCeiling: temp });
                    audioFx.playClick(580);
                  }}
                  className={`px-2 py-1 rounded font-mono text-xs tabular-nums cursor-pointer transition-colors ${
                    proConfig.thermalCeiling === temp
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#0B0D12] text-zinc-400 hover:text-white'
                  }`}
                >
                  {temp}°
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onUpdateProConfig({ framePacingLock: !proConfig.framePacingLock });
                audioFx.playClick(640);
              }}
              className={`flex-1 py-1.5 px-2.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                proConfig.framePacingLock
                  ? 'bg-rose-600/20 border-rose-500/50 text-rose-200'
                  : 'bg-[#0B0D12] border-white/[0.06] text-zinc-400'
              }`}
            >
              تثبيت زمن الإطار
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateProConfig({ hyperEngineNetGuard: !proConfig.hyperEngineNetGuard });
                audioFx.playClick(640);
              }}
              className={`flex-1 py-1.5 px-2.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                proConfig.hyperEngineNetGuard
                  ? 'bg-rose-600/20 border-rose-500/50 text-rose-200'
                  : 'bg-[#0B0D12] border-white/[0.06] text-zinc-400'
              }`}
            >
              حماية بينغ الشبكة
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
