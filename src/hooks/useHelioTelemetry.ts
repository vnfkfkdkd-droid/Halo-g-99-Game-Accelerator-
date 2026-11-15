import { useCallback, useEffect, useRef, useState } from 'react';
import { PERFORMANCE_MODES } from '../data/helioG99Profiles';
import {
  CpuCoreState,
  LiveTelemetry,
  PerformanceMode,
  ProTuningConfig,
  WeakDeviceTools,
} from '../types/booster';

const INITIAL_HISTORY = Array.from({ length: 48 }, () => 60);

function buildInitialCores(): CpuCoreState[] {
  return [
    { id: 0, cluster: 'A76', label: 'A76-0', freqMHz: 1650, maxMHz: 2200, loadPercent: 42 },
    { id: 1, cluster: 'A76', label: 'A76-1', freqMHz: 1650, maxMHz: 2200, loadPercent: 39 },
    { id: 2, cluster: 'A55', label: 'A55-0', freqMHz: 1400, maxMHz: 2000, loadPercent: 34 },
    { id: 3, cluster: 'A55', label: 'A55-1', freqMHz: 1400, maxMHz: 2000, loadPercent: 31 },
    { id: 4, cluster: 'A55', label: 'A55-2', freqMHz: 1400, maxMHz: 2000, loadPercent: 28 },
    { id: 5, cluster: 'A55', label: 'A55-3', freqMHz: 1400, maxMHz: 2000, loadPercent: 26 },
    { id: 6, cluster: 'A55', label: 'A55-4', freqMHz: 1400, maxMHz: 2000, loadPercent: 25 },
    { id: 7, cluster: 'A55', label: 'A55-5', freqMHz: 1400, maxMHz: 2000, loadPercent: 24 },
  ];
}

export function useHelioTelemetry(
  mode: PerformanceMode,
  proConfig: ProTuningConfig,
  tools: WeakDeviceTools,
  isGameActive: boolean
) {
  const [telemetry, setTelemetry] = useState<LiveTelemetry>({
    fps: 60,
    targetFps: 60,
    frameTimeMs: 16.6,
    cpuTotalPercent: 38,
    gpuFreqMHz: 650,
    gpuLoadPercent: 46,
    ramUsedMB: 4620,
    ramTotalMB: 8192,
    ramFreedMB: 0,
    socTempC: 36.4,
    batteryDrainMw: 2450,
    pingMs: 28,
    cores: buildInitialCores(),
    fpsHistory: INITIAL_HISTORY,
    frameTimeHistory: INITIAL_HISTORY.map(() => 16.6),
  });

  const [isPurgingRam, setIsPurgingRam] = useState(false);
  const purgeCooldownRef = useRef<number>(0);

  const triggerRamPurge = useCallback(() => {
    setIsPurgingRam(true);
    window.setTimeout(() => {
      setTelemetry((prev) => {
        const freed = Math.round(380 + Math.random() * 440);
        const nextUsed = Math.max(2450, prev.ramUsedMB - freed);
        purgeCooldownRef.current = Date.now();
        return {
          ...prev,
          ramUsedMB: nextUsed,
          ramFreedMB: prev.ramUsedMB - nextUsed,
        };
      });
      setIsPurgingRam(false);
    }, 320);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTelemetry((prev) => {
        const preset = PERFORMANCE_MODES[mode];
        const isManualPro = mode === 'pro';

        const bigCap = isManualPro ? proConfig.bigCoreMaxMHz : preset.bigCoreMHz;
        const littleCap = isManualPro ? proConfig.littleCoreMaxMHz : preset.littleCoreMHz;
        const gpuCap = isManualPro ? proConfig.gpuFreqMHz : preset.gpuMHz;
        const targetFps = isManualPro ? proConfig.fpsTarget : preset.fpsCap;

        // Calculate workload pressure from resolution scale & weak device flags
        const resFactor = Math.pow(tools.resolutionScale / 100, 1.35);
        const shadowPenalty = tools.disableShadows ? 0 : 0.14;
        const texturePenalty = tools.lowTextureMode ? 0 : 0.1;
        const aaPenalty = tools.antiAliasingOff ? 0 : 0.09;
        const workloadMultiplier =
          (isGameActive ? 1.0 : 0.52) * (0.68 * resFactor + shadowPenalty + texturePenalty + aaPenalty);

        // Effective capability of Helio G99 in current mode
        const cpuPowerRatio = bigCap / 2200;
        const gpuPowerRatio = gpuCap / 980;
        const combinedCapacity = 0.45 * cpuPowerRatio + 0.55 * gpuPowerRatio;

        // Compute realistic FPS based on capacity vs workload
        const rawCapableFps = (targetFps * combinedCapacity) / Math.max(0.45, workloadMultiplier * 0.92);
        const jitter = (Math.random() - 0.5) * (mode === 'pro' && proConfig.framePacingLock ? 1.4 : 3.2);
        const computedFps = Math.max(
          24,
          Math.min(targetFps, Math.round(Math.min(targetFps, rawCapableFps) + jitter))
        );
        const frameTimeMs = Number((1000 / Math.max(1, computedFps)).toFixed(1));

        // Core utilization & clocks
        const cores: CpuCoreState[] = prev.cores.map((core, idx) => {
          const isBig = core.cluster === 'A76';
          const cap = isBig ? bigCap : littleCap;
          const baseLoad = isBig
            ? (mode === 'normal' ? 44 : mode === 'boost' ? 62 : 76) * (isGameActive ? 1.12 : 0.7)
            : (mode === 'normal' ? 32 : 48) * (isGameActive ? 1.05 : 0.72);
          const loadPercent = Math.max(
            12,
            Math.min(99, Math.round(baseLoad + (Math.random() - 0.5) * 14 - idx * 1.1))
          );
          const activeRatio = 0.55 + (loadPercent / 100) * 0.45;
          const freqMHz = Math.min(
            cap,
            Math.max(800, Math.round((cap * activeRatio) / 50) * 50)
          );
          return {
            ...core,
            maxMHz: cap,
            freqMHz,
            loadPercent,
          };
        });

        const cpuTotalPercent = Math.round(
          cores.reduce((acc, c) => acc + c.loadPercent, 0) / cores.length
        );

        const gpuLoadPercent = Math.max(
          18,
          Math.min(
            99,
            Math.round(
              (isGameActive ? 84 : 34) *
                (0.55 * resFactor + shadowPenalty + aaPenalty + 0.15) *
                (950 / Math.max(500, gpuCap)) +
                (Math.random() - 0.5) * 6
            )
          )
        );
        const gpuFreqMHz = Math.min(
          gpuCap,
          Math.max(420, Math.round((gpuCap * (0.65 + (gpuLoadPercent / 100) * 0.35)) / 10) * 10)
        );

        // Thermal simulation converging smoothly
        const thermalTargetBase =
          mode === 'normal' ? 35.8 : mode === 'boost' ? 38.6 : mode === 'high' ? 41.8 : 43.1;
        const tempTarget =
          thermalTargetBase +
          (isGameActive ? 2.4 : 0) +
          (tools.resolutionScale > 85 ? 1.3 : -0.8) -
          (tools.disableShadows ? 0.6 : 0);
        const ceiling = mode === 'pro' ? proConfig.thermalCeiling : 45;
        const clampedTarget = Math.min(ceiling - 0.5, tempTarget);
        const socTempC = Number(
          (prev.socTempC + (clampedTarget - prev.socTempC) * 0.18 + (Math.random() - 0.5) * 0.2).toFixed(1)
        );

        // RAM slight drift unless recently purged
        const baseRamTarget = tools.backgroundAppLimit ? 3780 : 4950;
        const nextRam = Math.round(prev.ramUsedMB + (baseRamTarget - prev.ramUsedMB) * 0.08 + (Math.random() - 0.5) * 18);

        // Battery draw in mW
        const batteryDrainMw = Math.round(
          (mode === 'normal' ? 2100 : mode === 'boost' ? 3100 : mode === 'high' ? 3950 : 4250) *
            (isGameActive ? 1.15 : 0.75) *
            (0.8 + 0.2 * resFactor) +
            (Math.random() - 0.5) * 90
        );

        const pingBase = (mode === 'boost' || mode === 'pro') && proConfig.hyperEngineNetGuard ? 19 : 34;
        const pingMs = Math.max(12, Math.round(pingBase + (Math.random() - 0.5) * 6));

        return {
          fps: computedFps,
          targetFps,
          frameTimeMs,
          cpuTotalPercent,
          gpuFreqMHz,
          gpuLoadPercent,
          ramUsedMB: Math.max(2400, Math.min(7600, nextRam)),
          ramTotalMB: 8192,
          ramFreedMB: prev.ramFreedMB,
          socTempC,
          batteryDrainMw,
          pingMs,
          cores,
          fpsHistory: [...prev.fpsHistory.slice(1), computedFps],
          frameTimeHistory: [...prev.frameTimeHistory.slice(1), frameTimeMs],
        };
      });
    }, 650);

    return () => window.clearInterval(interval);
  }, [mode, proConfig, tools, isGameActive]);

  return { telemetry, isPurgingRam, triggerRamPurge };
}
