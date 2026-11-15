import { PERFORMANCE_MODES } from '../data/helioG99Profiles';
import { LiveTelemetry, PerformanceMode } from '../types/booster';

interface FloatingTelemetryHudProps {
  visible: boolean;
  telemetry: LiveTelemetry;
  mode: PerformanceMode;
  resolutionScale: number;
  onOpenDrawer: () => void;
}

export function FloatingTelemetryHud({
  visible,
  telemetry,
  mode,
  resolutionScale,
  onOpenDrawer,
}: FloatingTelemetryHudProps) {
  if (!visible) return null;

  const modeInfo = PERFORMANCE_MODES[mode];

  return (
    <button
      type="button"
      onClick={onOpenDrawer}
      title="اضغط لفتح لوحة RedMagic الجانبية"
      className="fixed top-16 left-4 z-40 flex items-center gap-3 px-3.5 py-2 rounded-lg bg-[#0C0E13]/92 border border-white/15 shadow-xl text-xs font-mono tabular-nums hover:border-rose-500/60 transition-colors cursor-pointer"
    >
      <span className="font-sans font-semibold text-rose-400 whitespace-nowrap">
        {modeInfo.shortNameAr}
      </span>
      <span className="text-zinc-600" aria-hidden="true">|</span>
      <span className="text-emerald-400 font-bold">{telemetry.fps} FPS</span>
      <span className="text-zinc-300">CPU {telemetry.cpuTotalPercent}%</span>
      <span className="text-zinc-300">GPU {telemetry.gpuLoadPercent}%</span>
      <span className={telemetry.socTempC >= 43 ? 'text-amber-400' : 'text-zinc-300'}>
        {telemetry.socTempC}°C
      </span>
      <span className="text-zinc-400">{resolutionScale}%</span>
    </button>
  );
}
