import { BellOff, Cpu, EyeOff, Layers, MonitorDown, Sparkles, Zap } from 'lucide-react';
import { RESOLUTION_PRESETS } from '../data/helioG99Profiles';
import { WeakDeviceTools } from '../types/booster';
import { audioFx } from '../utils/audioFx';

interface WeakDeviceToolsPanelProps {
  tools: WeakDeviceTools;
  onUpdateTools: (patch: Partial<WeakDeviceTools>) => void;
  onLaunchArenaTest: () => void;
}

export function WeakDeviceToolsPanel({
  tools,
  onUpdateTools,
  onLaunchArenaTest,
}: WeakDeviceToolsPanelProps) {
  const scaledW = Math.round((1080 * tools.resolutionScale) / 100);
  const scaledH = Math.round((2400 * tools.resolutionScale) / 100);
  const pixelReductionPercent = Math.round((1 - Math.pow(tools.resolutionScale / 100, 2)) * 100);
  const estimatedFpsGain = Math.round((100 - tools.resolutionScale) * 0.48 + (tools.disableShadows ? 6 : 0) + (tools.antiAliasingOff ? 4 : 0));

  const applyWeakDevicePreset = () => {
    audioFx.playModeSwitch(true);
    onUpdateTools({
      resolutionScale: 65,
      disableShadows: true,
      lowTextureMode: true,
      antiAliasingOff: true,
      backgroundAppLimit: true,
      touchBoost240Hz: true,
    });
  };

  return (
    <section className="rounded-xl bg-[#111319] border border-white/[0.08] p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            أدوات الأجهزة الضعيفة وتقليل دقة الشاشة
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            خفف ضغط المعالج الرسومي عبر تصغير دقة الرندر الداخلية وتعطيل المؤثرات الثقيلة لرفع معدل الإطارات.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyWeakDevicePreset}
            className="min-h-[40px] px-3.5 py-2 rounded-lg bg-[#1A1D28] hover:bg-[#222636] border border-white/10 text-xs font-semibold text-zinc-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            تطبيق إعداد الأجهزة الضعيفة تلقائياً
          </button>
          <button
            type="button"
            onClick={() => {
              audioFx.playClick(700);
              onLaunchArenaTest();
            }}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            اختبر الدقة الآن
          </button>
        </div>
      </div>

      {/* Resolution Scaler Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#161922] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorDown className="w-4 h-4 text-rose-500" />
              <span className="font-display font-bold text-sm text-white">
                مقياس دقة العرض الداخلية (Resolution Scaler)
              </span>
            </div>
            <span className="font-mono font-bold text-base text-rose-400 tabular-nums">
              {tools.resolutionScale}%
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={tools.resolutionScale}
            onChange={(e) => onUpdateTools({ resolutionScale: Number(e.target.value) })}
            className="w-full hardware-slider"
            aria-label="نسبة دقة الشاشة"
          />

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {RESOLUTION_PRESETS.map((preset) => {
              const selected = tools.resolutionScale === preset.scale;
              return (
                <button
                  key={preset.scale}
                  type="button"
                  onClick={() => {
                    onUpdateTools({ resolutionScale: preset.scale });
                    audioFx.playClick(560);
                  }}
                  className={`p-2 rounded-lg border text-right transition-colors cursor-pointer ${
                    selected
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-[#0E1016] border-white/[0.06] text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-mono font-bold text-xs tabular-nums">
                    {preset.scale}%
                  </div>
                  <div className="text-[11px] font-medium mt-0.5 truncate">
                    {preset.labelAr}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Computed Resolution Savings */}
        <div className="lg:col-span-5 grid grid-cols-3 lg:grid-cols-1 gap-3">
          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-xs text-zinc-400">أبعاد الرندر الفعلية</span>
            <span className="font-mono font-bold text-lg text-white tabular-nums mt-1">
              {scaledW} × {scaledH}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-xs text-zinc-400">توفير معالج الرسوميات</span>
            <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums mt-1">
              -{pixelReductionPercent}% بيكسل
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06] flex flex-col justify-between">
            <span className="text-xs text-zinc-400">الزيادة التقديرية للإطارات</span>
            <span className="font-mono font-bold text-lg text-rose-400 tabular-nums mt-1">
              +{estimatedFpsGain} FPS
            </span>
          </div>
        </div>
      </div>

      {/* Graphics & System Optimization Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <ToolSwitchCard
          icon={<EyeOff className="w-4 h-4" />}
          title="تعطيل الظلال الديناميكية"
          description="يزيل حسابات الظلال الثقيلة في اللعب الجماعي لتثبيت الإطارات."
          active={tools.disableShadows}
          onToggle={() => {
            onUpdateTools({ disableShadows: !tools.disableShadows });
            audioFx.playClick(580);
          }}
        />

        <ToolSwitchCard
          icon={<Layers className="w-4 h-4" />}
          title="ضغط الخامات وتقليل التفاصيل"
          description="يقلل استهلاك ذاكرة الفيديو في الأجهزة ذات الرام المحدود."
          active={tools.lowTextureMode}
          onToggle={() => {
            onUpdateTools({ lowTextureMode: !tools.lowTextureMode });
            audioFx.playClick(580);
          }}
        />

        <ToolSwitchCard
          icon={<Sparkles className="w-4 h-4" />}
          title="إلغاء تنعيم الحواف (MSAA Off)"
          description="يوفر حتى 14% من قدرة Mali-G57 في المشاهد السريعة."
          active={tools.antiAliasingOff}
          onToggle={() => {
            onUpdateTools({ antiAliasingOff: !tools.antiAliasingOff });
            audioFx.playClick(580);
          }}
        />

        <ToolSwitchCard
          icon={<Cpu className="w-4 h-4" />}
          title="تجميد تطبيقات الخلفية"
          description="يمنع استهلاك الذاكرة والمعالج أثناء جلسة اللعب."
          active={tools.backgroundAppLimit}
          onToggle={() => {
            onUpdateTools({ backgroundAppLimit: !tools.backgroundAppLimit });
            audioFx.playClick(580);
          }}
        />

        <ToolSwitchCard
          icon={<Zap className="w-4 h-4" />}
          title="تسريع استجابة اللمس 240Hz"
          description="تقليل زمن استجابة الشاشة عند التصويب والحركة السريعة."
          active={tools.touchBoost240Hz}
          onToggle={() => {
            onUpdateTools({ touchBoost240Hz: !tools.touchBoost240Hz });
            audioFx.playClick(640);
          }}
        />

        <ToolSwitchCard
          icon={<BellOff className="w-4 h-4" />}
          title="منع الإشعارات والمكالمات"
          description="حجب النوافذ المنبثقة أثناء اللعب لتجنب هبوط الإطارات المفاجئ."
          active={tools.blockNotifications}
          onToggle={() => {
            onUpdateTools({ blockNotifications: !tools.blockNotifications });
            audioFx.playClick(560);
          }}
        />
      </div>
    </section>
  );
}

interface ToolSwitchCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

function ToolSwitchCard({
  icon,
  title,
  description,
  active,
  onToggle,
}: ToolSwitchCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={active}
      className={`p-3.5 rounded-xl border text-right flex items-start justify-between gap-3 transition-colors cursor-pointer ${
        active
          ? 'bg-rose-600/12 border-rose-500/45 text-white'
          : 'bg-[#161922] border-white/[0.06] text-zinc-300 hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className={`mt-0.5 shrink-0 ${active ? 'text-rose-400' : 'text-zinc-500'}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold text-zinc-100">{title}</div>
          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Tactile Toggle Track */}
      <span
        className={`shrink-0 mt-0.5 w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
          active ? 'bg-rose-600 justify-start' : 'bg-zinc-700 justify-end'
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </span>
    </button>
  );
}
