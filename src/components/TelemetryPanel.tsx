import { useEffect, useRef } from 'react';
import { Cpu, MemoryStick, Thermometer, Zap } from 'lucide-react';
import { PERFORMANCE_MODES } from '../data/helioG99Profiles';
import { LiveTelemetry, PerformanceMode } from '../types/booster';
import { audioFx } from '../utils/audioFx';

interface TelemetryPanelProps {
  telemetry: LiveTelemetry;
  mode: PerformanceMode;
  resolutionScale: number;
  isPurgingRam: boolean;
  onPurgeRam: () => void;
}

export function TelemetryPanel({
  telemetry,
  mode,
  resolutionScale,
  isPurgingRam,
  onPurgeRam,
}: TelemetryPanelProps) {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear dark surface
    ctx.clearRect(0, 0, width, height);

    // Subtle horizontal grid lines (30, 60, 90 FPS)
    const gridLevels = [30, 60, 90];
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    gridLevels.forEach((fpsVal) => {
      const y = height - ((fpsVal - 15) / 85) * (height - 16) - 8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(161, 161, 170, 0.55)';
      ctx.fillText(`${fpsVal}`, 6, y - 3);
    });

    // Plot FPS History Curve
    const history = telemetry.fpsHistory;
    if (history.length > 1) {
      const stepX = (width - 34) / (history.length - 1);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(225, 29, 72, 0.28)');
      gradient.addColorStop(1, 'rgba(225, 29, 72, 0.0)');

      ctx.beginPath();
      history.forEach((val, i) => {
        const x = 30 + i * stepX;
        const clamped = Math.max(15, Math.min(98, val));
        const y = height - ((clamped - 15) / 85) * (height - 16) - 8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Fill area
      ctx.lineTo(30 + (history.length - 1) * stepX, height);
      ctx.lineTo(30, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      history.forEach((val, i) => {
        const x = 30 + i * stepX;
        const clamped = Math.max(15, Math.min(98, val));
        const y = height - ((clamped - 15) / 85) * (height - 16) - 8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [telemetry.fpsHistory]);

  const ramPercent = Math.round((telemetry.ramUsedMB / telemetry.ramTotalMB) * 100);
  const thermalLabel =
    telemetry.socTempC < 38
      ? 'حرارة باردة'
      : telemetry.socTempC < 42.5
      ? 'استقرار حراري'
      : 'ضغط حراري عالٍ';

  const bigCores = telemetry.cores.filter((c) => c.cluster === 'A76');
  const littleCores = telemetry.cores.filter((c) => c.cluster === 'A55');

  return (
    <section className="rounded-xl bg-[#111319] border border-white/[0.08] p-5 space-y-5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            مراقبة إحصائيات المعالج والرسوميات
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            MediaTek Helio G99 · Arm Mali-G57 MC2 · دقة العرض الحالية {resolutionScale}%
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-zinc-300">
          <span>
            بينغ: <strong className="text-emerald-400">{telemetry.pingMs}ms</strong>
          </span>
          <span className="text-zinc-600" aria-hidden="true">/</span>
          <span>
            سحب الطاقة: <strong className="text-zinc-100">{(telemetry.batteryDrainMw / 1000).toFixed(2)}W</strong>
          </span>
        </div>
      </div>

      {/* 4 Primary KPI Readouts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>معدل الإطارات</span>
            <Zap className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono font-bold text-2xl text-white tabular-nums">
              {telemetry.fps}
            </span>
            <span className="font-mono text-xs text-zinc-400 tabular-nums">
              / {telemetry.targetFps} FPS
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-emerald-400 tabular-nums">
            زمن الإطار: {telemetry.frameTimeMs} ms
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>معالج الرسوميات Mali-G57</span>
            <Cpu className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono font-bold text-2xl text-white tabular-nums">
              {telemetry.gpuLoadPercent}%
            </span>
            <span className="font-mono text-xs text-zinc-400 tabular-nums">
              {telemetry.gpuFreqMHz} MHz
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            الوضع: {PERFORMANCE_MODES[mode].nameAr}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>حرارة الشريحة SoC</span>
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`font-mono font-bold text-2xl tabular-nums ${
                telemetry.socTempC >= 42.5 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {telemetry.socTempC}°C
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">{thermalLabel}</div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#161922] border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>الذاكرة LPDDR4X</span>
            <MemoryStick className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono font-bold text-xl text-white tabular-nums">
              {ramPercent}%
            </span>
            <button
              type="button"
              onClick={() => {
                audioFx.playRamPurge();
                onPurgeRam();
              }}
              disabled={isPurgingRam}
              className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-200 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              {isPurgingRam ? 'تحرير...' : 'تنظيف الرام'}
            </button>
          </div>
          <div className="mt-1 text-[11px] font-mono text-zinc-400 tabular-nums">
            {telemetry.ramUsedMB} / {telemetry.ramTotalMB} MB
          </div>
        </div>
      </div>

      {/* Live FPS Sparkline Chart + 8-Core Helio G99 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* FPS Chart */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-200">
              منحنى ثبات الإطارات المباشر
            </span>
            <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
              آخر 30 ثانية
            </span>
          </div>
          <div className="relative h-[168px] rounded-lg bg-[#0B0D12] border border-white/[0.06] overflow-hidden">
            <canvas
              ref={chartCanvasRef}
              className="w-full h-full block"
              aria-label="رسم بياني لمعدل الإطارات في الثانية"
            />
          </div>
        </div>

        {/* 8 Cores Architecture Grid */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">
              حمل وتردد أنوية Helio G99 الثمانية
            </span>
            <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
              الإجمالي {telemetry.cpuTotalPercent}%
            </span>
          </div>

          {/* 2 Big Cores (Cortex-A76) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {bigCores.map((core) => (
              <div
                key={core.id}
                className="px-3 py-2 rounded-lg bg-[#161922] border border-rose-500/20"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-semibold text-rose-300">
                    {core.label} · نواة كبرى
                  </span>
                  <span className="font-mono text-zinc-200 tabular-nums">
                    {core.freqMHz} MHz · {core.loadPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0B0D12] overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-[width] duration-300"
                    style={{ width: `${core.loadPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 6 Efficiency Cores (Cortex-A55) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {littleCores.map((core) => (
              <div
                key={core.id}
                className="px-2.5 py-2 rounded-lg bg-[#161922] border border-white/[0.06]"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono text-zinc-300">{core.label}</span>
                  <span className="font-mono text-zinc-400 tabular-nums">
                    {core.freqMHz}MHz
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-[#0B0D12] overflow-hidden">
                  <div
                    className="h-full bg-zinc-400 transition-[width] duration-300"
                    style={{ width: `${core.loadPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
