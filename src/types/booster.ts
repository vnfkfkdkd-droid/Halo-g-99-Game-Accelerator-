export type PerformanceMode = 'normal' | 'boost' | 'high' | 'pro';

export type ActiveTab = 'dashboard' | 'weak-tools' | 'library' | 'arena';

export type CrosshairStyle = 'tactical' | 'dot' | 'chevron';

export interface ProTuningConfig {
  bigCoreMaxMHz: number; // Cortex-A76: 1400 - 2200 MHz
  littleCoreMaxMHz: number; // Cortex-A55: 1200 - 2000 MHz
  gpuFreqMHz: number; // Mali-G57 MC2: 500 - 980 MHz
  fpsTarget: 30 | 45 | 60 | 90;
  thermalCeiling: 40 | 43 | 46 | 48; // °C
  hyperEngineNetGuard: boolean;
  framePacingLock: boolean;
}

export interface WeakDeviceTools {
  resolutionScale: number; // 50 to 100 (%)
  disableShadows: boolean;
  lowTextureMode: boolean;
  antiAliasingOff: boolean;
  backgroundAppLimit: boolean;
  touchBoost240Hz: boolean;
  blockNotifications: boolean;
  brightnessLock: boolean;
  crosshairEnabled: boolean;
  crosshairStyle: CrosshairStyle;
  floatingHudEnabled: boolean;
}

export interface CpuCoreState {
  id: number;
  cluster: 'A76' | 'A55';
  label: string;
  freqMHz: number;
  maxMHz: number;
  loadPercent: number;
}

export interface LiveTelemetry {
  fps: number;
  targetFps: number;
  frameTimeMs: number;
  cpuTotalPercent: number;
  gpuFreqMHz: number;
  gpuLoadPercent: number;
  ramUsedMB: number;
  ramTotalMB: number;
  ramFreedMB: number;
  socTempC: number;
  batteryDrainMw: number;
  pingMs: number;
  cores: CpuCoreState[];
  fpsHistory: number[];
  frameTimeHistory: number[];
}

export interface ModeDefinition {
  id: PerformanceMode;
  nameAr: string;
  shortNameAr: string;
  subtitleAr: string;
  descriptionAr: string;
  bigCoreMHz: number;
  littleCoreMHz: number;
  gpuMHz: number;
  fpsCap: 60 | 90;
  powerProfileAr: string;
  thermalStatusAr: string;
}

export interface GameProfile {
  id: string;
  titleAr: string;
  genreAr: string;
  coverImage: string;
  recommendedMode: PerformanceMode;
  recommendedScale: number;
  lastPlayedMinutes: number;
  avgFps: number;
  isLiveArena?: boolean;
  isCustom?: boolean;
}
