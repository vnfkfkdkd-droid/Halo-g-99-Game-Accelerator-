import { useEffect, useState } from 'react';
import { PanelLeftOpen, Play } from 'lucide-react';
import { CrosshairOverlay } from './components/CrosshairOverlay';
import { FloatingTelemetryHud } from './components/FloatingTelemetryHud';
import { GameLibraryGrid } from './components/GameLibraryGrid';
import { LiveGameArena } from './components/LiveGameArena';
import { ModeAndProPanel } from './components/ModeAndProPanel';
import { RedMagicSideDrawer } from './components/RedMagicSideDrawer';
import { TelemetryPanel } from './components/TelemetryPanel';
import { WeakDeviceToolsPanel } from './components/WeakDeviceToolsPanel';
import {
  DEFAULT_PRO_CONFIG,
  DEFAULT_WEAK_DEVICE_TOOLS,
  HELIO_G99_SPECS,
  INITIAL_GAMES,
  PERFORMANCE_MODES,
} from './data/helioG99Profiles';
import { useHelioTelemetry } from './hooks/useHelioTelemetry';
import {
  ActiveTab,
  GameProfile,
  PerformanceMode,
  ProTuningConfig,
  WeakDeviceTools,
} from './types/booster';
import { audioFx } from './utils/audioFx';

const STORAGE_KEY = 'helioboost_g99_state_v1';
const GAMES_STORAGE_KEY = 'helioboost_g99_games_v1';

interface SavedState {
  mode: PerformanceMode;
  proConfig: ProTuningConfig;
  tools: WeakDeviceTools;
}

function loadSavedGames(): GameProfile[] {
  try {
    const raw = localStorage.getItem(GAMES_STORAGE_KEY);
    if (!raw) return INITIAL_GAMES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_GAMES;
  } catch {
    return INITIAL_GAMES;
  }
}

function loadSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        mode: 'boost',
        proConfig: DEFAULT_PRO_CONFIG,
        tools: DEFAULT_WEAK_DEVICE_TOOLS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    return {
      mode: parsed.mode || 'boost',
      proConfig: { ...DEFAULT_PRO_CONFIG, ...(parsed.proConfig || {}) },
      tools: { ...DEFAULT_WEAK_DEVICE_TOOLS, ...(parsed.tools || {}) },
    };
  } catch {
    return {
      mode: 'boost',
      proConfig: DEFAULT_PRO_CONFIG,
      tools: DEFAULT_WEAK_DEVICE_TOOLS,
    };
  }
}

export default function App() {
  const initial = loadSavedState();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mode, setMode] = useState<PerformanceMode>(initial.mode);
  const [proConfig, setProConfig] = useState<ProTuningConfig>(initial.proConfig);
  const [tools, setTools] = useState<WeakDeviceTools>(initial.tools);
  const [games, setGames] = useState<GameProfile[]>(loadSavedGames);
  const [activeGame, setActiveGame] = useState<GameProfile>(() => loadSavedGames()[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [chipImageFailed, setChipImageFailed] = useState(false);

  const isArenaActive = activeTab === 'arena';

  const { telemetry, isPurgingRam, triggerRamPurge } = useHelioTelemetry(
    mode,
    proConfig,
    tools,
    isArenaActive
  );

  // Persist booster configuration locally
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, proConfig, tools })
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [mode, proConfig, tools]);

  // Persist user's game library locally
  useEffect(() => {
    try {
      localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
    } catch {
      // Ignore storage quota issues
    }
  }, [games]);

  const handleUpdateProConfig = (patch: Partial<ProTuningConfig>) => {
    setProConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleUpdateTools = (patch: Partial<WeakDeviceTools>) => {
    setTools((prev) => ({ ...prev, ...patch }));
  };

  const handleUpdateGame = (id: string, patch: Partial<GameProfile>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const handleAddGame = (game: GameProfile) => {
    setGames((prev) => [game, ...prev]);
  };

  const handleRemoveGame = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const handleLaunchGame = (game: GameProfile) => {
    setActiveGame(game);
    setMode(game.recommendedMode);
    setTools((prev) => ({ ...prev, resolutionScale: game.recommendedScale }));
    setActiveTab('arena');
  };

  const handleToggleAudioMute = () => {
    const nextMuted = !isAudioMuted;
    audioFx.muted = nextMuted;
    setIsAudioMuted(nextMuted);
    if (!nextMuted) audioFx.playClick(640);
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'لوحة المعزز' },
    { id: 'weak-tools', label: 'أدوات الضعيفة' },
    { id: 'library', label: 'مكتبة الألعاب' },
    { id: 'arena', label: 'ميدان الاختبار' },
  ];

  const activeModeInfo = PERFORMANCE_MODES[mode];

  return (
    <div className="min-h-screen bg-[#090A0D] text-zinc-100 flex flex-col">
      {/* Brightness Lock Visual Dimmer (subtle real feedback when toggled) */}
      {tools.brightnessLock && (
        <div
          className="fixed inset-0 pointer-events-none z-20 ring-1 ring-inset ring-amber-400/20"
          aria-hidden="true"
        />
      )}

      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#090A0D]/92 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="font-display font-extrabold text-xl tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            HelioBoost <span className="text-rose-500">G99</span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="التنقل الرئيسي">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    audioFx.playClick(580);
                    setActiveTab(item.id);
                  }}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute right-0 left-0 bottom-0 h-0.5 bg-rose-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                audioFx.playDrawerSlide(true);
                setIsDrawerOpen(true);
              }}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span>لوحة RedMagic</span>
            </button>
          </div>
        </div>

        {/* Mobile Compact Nav Row */}
        <div className="md:hidden border-t border-white/[0.06] px-3 py-1.5 flex items-center justify-between gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  audioFx.playClick(580);
                  setActiveTab(item.id);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'bg-rose-600/20 text-rose-300' : 'text-zinc-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isArenaActive ? (
          <LiveGameArena
            activeGame={activeGame}
            mode={mode}
            tools={tools}
            telemetry={telemetry}
            onExitArena={() => setActiveTab('dashboard')}
            onOpenSideDrawer={() => {
              audioFx.playDrawerSlide(true);
              setIsDrawerOpen(true);
            }}
          />
        ) : (
          <>
            {/* Hardware Spotlight & Quick Control Strip (Shown on Main Dashboard) */}
            {activeTab === 'dashboard' && (
              <section className="rounded-xl bg-[#111319] border border-white/[0.08] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-zinc-400">
                      {HELIO_G99_SPECS.chipName} · {HELIO_G99_SPECS.processNode} · {HELIO_G99_SPECS.engine}
                    </div>
                    <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-snug">
                      تحكم احترافي بأداء معالج هيلو G99 مع واجهة سحب جانبية
                    </h1>
                    <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                      بدّل فوراً بين الوضع العادي، وضع البوست، الأداء العالي، ووضع المحترف، وقلل دقة الشاشة للأجهزة الضعيفة مع مراقبة التردد والحرارة والإطارات مباشرة.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        audioFx.playModeSwitch(true);
                        setActiveTab('arena');
                      }}
                      className="min-h-[44px] px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>تشغيل ميدان الاختبار الحي</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioFx.playDrawerSlide(true);
                        setIsDrawerOpen(true);
                      }}
                      className="min-h-[44px] px-4 py-2.5 rounded-lg bg-[#181B24] hover:bg-[#202432] border border-white/10 text-zinc-100 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <PanelLeftOpen className="w-4 h-4 text-rose-400" />
                      <span>اسحب واجهة RedMagic</span>
                    </button>
                  </div>

                  {/* Clean Tabular Spec Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.07] text-xs font-mono tabular-nums">
                    <div>
                      <div className="text-zinc-500 font-sans">الوضع النشط</div>
                      <div className="text-rose-400 font-bold mt-0.5 font-sans">
                        {activeModeInfo.nameAr}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 font-sans">الإطارات الآن</div>
                      <div className="text-emerald-400 font-bold mt-0.5">
                        {telemetry.fps} FPS
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 font-sans">دقة الشاشة</div>
                      <div className="text-zinc-100 font-bold mt-0.5">
                        {tools.resolutionScale}%
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 font-sans">حرارة المعالج</div>
                      <div className="text-zinc-100 font-bold mt-0.5">
                        {telemetry.socTempC}°C
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Chipset Visual */}
                <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-[#0B0D12]">
                  {!chipImageFailed ? (
                    <img
                      src={HELIO_G99_SPECS.heroChipImage}
                      alt="شريحة معالج MediaTek Helio G99"
                      referrerPolicy="no-referrer"
                      onError={() => setChipImageFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-950/30 to-[#0B0D12] flex items-center justify-center p-6 text-zinc-400 text-sm">
                      MediaTek Helio G99 · 6nm Architecture
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#111319]/80" />
                </div>
              </section>
            )}

            {/* Dashboard View renders full unified controls */}
            {activeTab === 'dashboard' && (
              <>
                <ModeAndProPanel
                  mode={mode}
                  onSelectMode={setMode}
                  proConfig={proConfig}
                  onUpdateProConfig={handleUpdateProConfig}
                />

                <TelemetryPanel
                  telemetry={telemetry}
                  mode={mode}
                  resolutionScale={tools.resolutionScale}
                  isPurgingRam={isPurgingRam}
                  onPurgeRam={triggerRamPurge}
                />

                <WeakDeviceToolsPanel
                  tools={tools}
                  onUpdateTools={handleUpdateTools}
                  onLaunchArenaTest={() => setActiveTab('arena')}
                />

                <GameLibraryGrid
                  games={games}
                  onUpdateGame={handleUpdateGame}
                  onAddGame={handleAddGame}
                  onRemoveGame={handleRemoveGame}
                  onLaunchGame={handleLaunchGame}
                />
              </>
            )}

            {activeTab === 'weak-tools' && (
              <>
                <WeakDeviceToolsPanel
                  tools={tools}
                  onUpdateTools={handleUpdateTools}
                  onLaunchArenaTest={() => setActiveTab('arena')}
                />
                <TelemetryPanel
                  telemetry={telemetry}
                  mode={mode}
                  resolutionScale={tools.resolutionScale}
                  isPurgingRam={isPurgingRam}
                  onPurgeRam={triggerRamPurge}
                />
              </>
            )}

            {activeTab === 'library' && (
              <GameLibraryGrid
                games={games}
                onUpdateGame={handleUpdateGame}
                onAddGame={handleAddGame}
                onRemoveGame={handleRemoveGame}
                onLaunchGame={handleLaunchGame}
              />
            )}
          </>
        )}
      </main>

      {/* Subtle Footer */}
      {!isArenaActive && (
        <footer className="border-t border-white/[0.06] py-4 px-6 text-center text-xs text-zinc-500">
          HelioBoost G99 · مسرع ألعاب مخصص لمعالج MediaTek Helio G99 · اسحب المقبض الجانبي في أي وقت لفتح لوحة RedMagic
        </footer>
      )}

      {/* Persistent Tactical Overlays */}
      <CrosshairOverlay
        enabled={tools.crosshairEnabled}
        style={tools.crosshairStyle}
      />

      <FloatingTelemetryHud
        visible={tools.floatingHudEnabled}
        telemetry={telemetry}
        mode={mode}
        resolutionScale={tools.resolutionScale}
        onOpenDrawer={() => {
          audioFx.playDrawerSlide(true);
          setIsDrawerOpen(true);
        }}
      />

      {/* Signature RedMagic Slide-Out Side Booster Drawer */}
      <RedMagicSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpen={() => setIsDrawerOpen(true)}
        mode={mode}
        onSelectMode={setMode}
        telemetry={telemetry}
        tools={tools}
        onUpdateTools={handleUpdateTools}
        onPurgeRam={triggerRamPurge}
        isPurgingRam={isPurgingRam}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={handleToggleAudioMute}
        isArenaOpen={isArenaActive}
        onToggleArena={() =>
          setActiveTab((prev) => (prev === 'arena' ? 'dashboard' : 'arena'))
        }
      />
    </div>
  );
}
