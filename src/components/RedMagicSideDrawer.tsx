import React, { useRef, useState } from 'react';
import {
  Activity,
  BellOff,
  ChevronRight,
  Crosshair,
  Cpu,
  Eye,
  Flame,
  Gauge,
  MemoryStick,
  MonitorDown,
  Rocket,
  SlidersHorizontal,
  Sun,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { MODE_ORDER, PERFORMANCE_MODES } from '../data/helioG99Profiles';
import {
  CrosshairStyle,
  LiveTelemetry,
  PerformanceMode,
  WeakDeviceTools,
} from '../types/booster';
import { audioFx } from '../utils/audioFx';

interface RedMagicSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  mode: PerformanceMode;
  onSelectMode: (mode: PerformanceMode) => void;
  telemetry: LiveTelemetry;
  tools: WeakDeviceTools;
  onUpdateTools: (patch: Partial<WeakDeviceTools>) => void;
  onPurgeRam: () => void;
  isPurgingRam: boolean;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  isArenaOpen: boolean;
  onToggleArena: () => void;
}

const QUICK_RES_SCALES = [100, 75, 65, 50];
const CROSSHAIR_STYLES: { id: CrosshairStyle; label: string }[] = [
  { id: 'tactical', label: 'تكتيكي' },
  { id: 'dot', label: 'نقطة' },
  { id: 'chevron', label: 'سهم' },
];

export function RedMagicSideDrawer({
  isOpen,
  onClose,
  onOpen,
  mode,
  onSelectMode,
  telemetry,
  tools,
  onUpdateTools,
  onPurgeRam,
  isPurgingRam,
  isAudioMuted,
  onToggleAudioMute,
  isArenaOpen,
  onToggleArena,
}: RedMagicSideDrawerProps) {
  const dragStartXRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Edge pull tab swipe/drag gesture to open from left edge
  const handleEdgePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragStartXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleEdgePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (deltaX > 12) {
      setDragOffset(Math.min(80, deltaX));
    }
  };

  const handleEdgePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    setDragOffset(0);
    if (deltaX > 28 || Math.abs(deltaX) < 8) {
      audioFx.playDrawerSlide(true);
      onOpen();
    }
  };

  // Drawer swipe-to-close gesture
  const drawerDragStartRef = useRef<number | null>(null);
  const handleDrawerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only initiate swipe if touching near the drawer edge strip or header
    drawerDragStartRef.current = e.clientX;
  };
  const handleDrawerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drawerDragStartRef.current === null) return;
    const deltaX = e.clientX - drawerDragStartRef.current;
    drawerDragStartRef.current = null;
    if (deltaX < -65) {
      audioFx.playDrawerSlide(false);
      onClose();
    }
  };

  const cycleCrosshairStyle = () => {
    const idx = CROSSHAIR_STYLES.findIndex((s) => s.id === tools.crosshairStyle);
    const next = CROSSHAIR_STYLES[(idx + 1) % CROSSHAIR_STYLES.length];
    onUpdateTools({ crosshairStyle: next.id, crosshairEnabled: true });
    audioFx.playClick(700);
  };

  const computedW = Math.round((1080 * tools.resolutionScale) / 100);
  const computedH = Math.round((2400 * tools.resolutionScale) / 100);

  return (
    <>
      {/* RedMagic Edge Pull Handle (Visible when drawer is closed) */}
      {!isOpen && (
        <button
          type="button"
          onPointerDown={handleEdgePointerDown}
          onPointerMove={handleEdgePointerMove}
          onPointerUp={handleEdgePointerUp}
          aria-label="سحب لوحة RedMagic الجانبية"
          style={{
            transform: `translate3d(${dragOffset}px, -50%, 0)`,
          }}
          className="fixed left-0 top-1/2 z-50 group flex items-center gap-1.5 pl-2.5 pr-1.5 py-4 rounded-r-xl bg-[#111319]/95 border-y border-r border-rose-500/50 text-zinc-100 shadow-2xl hover:border-rose-400 hover:bg-[#171A23] transition-[transform,background-color,border-color] duration-150 cursor-grab active:cursor-grabbing select-none"
        >
          <span className="w-1 h-9 rounded-full bg-rose-600 group-hover:bg-rose-500 transition-colors" />
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      )}

      {/* Backdrop Scrim */}
      <div
        onClick={() => {
          audioFx.playDrawerSlide(false);
          onClose();
        }}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* RedMagic Game Space Slide-Out Panel (Slides from Left Edge) */}
      <aside
        role="dialog"
        aria-label="لوحة RedMagic السريعة"
        onPointerDown={handleDrawerPointerDown}
        onPointerUp={handleDrawerPointerUp}
        className={`fixed top-0 left-0 bottom-0 z-50 w-[345px] sm:w-[390px] max-w-[92vw] bg-[#0B0D12] border-r border-rose-600/35 shadow-[12px_0_40px_rgba(0,0,0,0.75)] flex flex-col transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Hardware Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.08] bg-[#10131A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-rose-600/15 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-white leading-tight">
                مسرع RedMagic
              </h2>
              <p className="text-[11px] text-zinc-400">
                MediaTek Helio G99 · تحكم جانبي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioFx.playDrawerSlide(false);
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="إغلاق اللوحة الجانبية"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Tactical Controls Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Live Telemetry Strip */}
          <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-[#12151E] border border-white/[0.07]">
            <div className="text-center">
              <div className="text-[11px] text-zinc-400">الإطارات</div>
              <div className="font-mono font-bold text-base text-emerald-400 tabular-nums">
                {telemetry.fps}
              </div>
            </div>
            <div className="text-center border-r border-white/[0.06]">
              <div className="text-[11px] text-zinc-400">المعالج</div>
              <div className="font-mono font-bold text-base text-zinc-100 tabular-nums">
                {telemetry.cpuTotalPercent}%
              </div>
            </div>
            <div className="text-center border-r border-white/[0.06]">
              <div className="text-[11px] text-zinc-400">الرسوميات</div>
              <div className="font-mono font-bold text-base text-zinc-100 tabular-nums">
                {telemetry.gpuLoadPercent}%
              </div>
            </div>
            <div className="text-center border-r border-white/[0.06]">
              <div className="text-[11px] text-zinc-400">الحرارة</div>
              <div
                className={`font-mono font-bold text-base tabular-nums ${
                  telemetry.socTempC >= 43 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {telemetry.socTempC}°
              </div>
            </div>
          </div>

          {/* 4-Mode Helio G99 Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-rose-500" />
                وضع طاقة Helio G99
              </span>
              <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                {PERFORMANCE_MODES[mode].bigCoreMHz} MHz
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MODE_ORDER.map((m) => {
                const def = PERFORMANCE_MODES[m];
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onSelectMode(m);
                      audioFx.playModeSwitch(m === 'high' || m === 'pro');
                    }}
                    className={`min-h-[44px] px-3 py-2 rounded-lg border text-right transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-950/50'
                        : 'bg-[#141720] border-white/[0.07] text-zinc-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="font-display font-bold text-xs whitespace-nowrap">
                      {def.nameAr}
                    </div>
                    <div
                      className={`text-[10px] font-mono tabular-nums mt-0.5 ${
                        active ? 'text-rose-100' : 'text-zinc-500'
                      }`}
                    >
                      {def.fpsCap} FPS · {def.gpuMHz}MHz
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weak Device Quick Resolution Scaler */}
          <div className="p-3 rounded-lg bg-[#12151E] border border-white/[0.07]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <MonitorDown className="w-3.5 h-3.5 text-rose-500" />
                تقليل دقة الشاشة
              </span>
              <span className="font-mono text-[11px] text-zinc-300 tabular-nums">
                {computedW}×{computedH} ({tools.resolutionScale}%)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_RES_SCALES.map((scale) => {
                const selected = tools.resolutionScale === scale;
                return (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => {
                      onUpdateTools({ resolutionScale: scale });
                      audioFx.playClick(580);
                    }}
                    className={`min-h-[38px] rounded-md font-mono text-xs font-semibold tabular-nums border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                        : 'bg-[#181C27] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {scale}%
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              مفيد للأجهزة الضعيفة لرفع الإطارات وتخفيف الحمل على Mali-G57.
            </p>
          </div>

          {/* RedMagic Quick Plugins Grid */}
          <div>
            <div className="text-xs font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
              أدوات المساحة السريعة
            </div>
            <div className="grid grid-cols-2 gap-2">
              <DrawerToggleTile
                icon={<MemoryStick className="w-4 h-4" />}
                label={isPurgingRam ? 'جاري التحرير...' : 'تنظيف الرام'}
                sublabel={
                  telemetry.ramFreedMB > 0
                    ? `تم تحرير ${telemetry.ramFreedMB}MB`
                    : `${telemetry.ramUsedMB}MB مستخدم`
                }
                active={isPurgingRam}
                onClick={() => {
                  audioFx.playRamPurge();
                  onPurgeRam();
                }}
              />

              <DrawerToggleTile
                icon={<Crosshair className="w-4 h-4" />}
                label="مؤشر التصويب"
                sublabel={
                  tools.crosshairEnabled
                    ? `مفعل · ${CROSSHAIR_STYLES.find((s) => s.id === tools.crosshairStyle)?.label}`
                    : 'معطل'
                }
                active={tools.crosshairEnabled}
                onClick={() => {
                  onUpdateTools({ crosshairEnabled: !tools.crosshairEnabled });
                  audioFx.playClick(640);
                }}
                onSecondaryAction={tools.crosshairEnabled ? cycleCrosshairStyle : undefined}
                secondaryLabel="تغيير الشكل"
              />

              <DrawerToggleTile
                icon={<Activity className="w-4 h-4" />}
                label="إحصائيات عائمة"
                sublabel={tools.floatingHudEnabled ? 'ظاهر بالزاوية' : 'مخفي'}
                active={tools.floatingHudEnabled}
                onClick={() => {
                  onUpdateTools({ floatingHudEnabled: !tools.floatingHudEnabled });
                  audioFx.playClick(600);
                }}
              />

              <DrawerToggleTile
                icon={<Zap className="w-4 h-4" />}
                label="تسريع اللمس"
                sublabel={tools.touchBoost240Hz ? 'استجابة 240Hz' : 'عادي 120Hz'}
                active={tools.touchBoost240Hz}
                onClick={() => {
                  onUpdateTools({ touchBoost240Hz: !tools.touchBoost240Hz });
                  audioFx.playClick(660);
                }}
              />

              <DrawerToggleTile
                icon={<Eye className="w-4 h-4" />}
                label="تعطيل الظلال"
                sublabel={tools.disableShadows ? 'أخف للضعيفة' : 'ظلال كاملة'}
                active={tools.disableShadows}
                onClick={() => {
                  onUpdateTools({ disableShadows: !tools.disableShadows });
                  audioFx.playClick(540);
                }}
              />

              <DrawerToggleTile
                icon={<BellOff className="w-4 h-4" />}
                label="منع الإشعارات"
                sublabel={tools.blockNotifications ? 'وضع عدم الإزعاج' : 'مسموح'}
                active={tools.blockNotifications}
                onClick={() => {
                  onUpdateTools({ blockNotifications: !tools.blockNotifications });
                  audioFx.playClick(520);
                }}
              />

              <DrawerToggleTile
                icon={<Sun className="w-4 h-4" />}
                label="قفل السطوع"
                sublabel={tools.brightnessLock ? 'مثبت أثناء اللعب' : 'تلقائي'}
                active={tools.brightnessLock}
                onClick={() => {
                  onUpdateTools({ brightnessLock: !tools.brightnessLock });
                  audioFx.playClick(560);
                }}
              />

              <DrawerToggleTile
                icon={isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                label="أصوات المعزز"
                sublabel={isAudioMuted ? 'مكتوم' : 'مفعلة'}
                active={!isAudioMuted}
                onClick={onToggleAudioMute}
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#10131A] space-y-2">
          <button
            type="button"
            onClick={() => {
              audioFx.playClick(720);
              onToggleArena();
              onClose();
            }}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>{isArenaOpen ? 'العودة إلى لوحة التحكم' : 'تشغيل ميدان الاختبار الحي'}</span>
          </button>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              تردد GPU: <span className="font-mono tabular-nums text-zinc-300">{telemetry.gpuFreqMHz} MHz</span>
            </span>
            <span>اسحب يساراً للإغلاق</span>
          </div>
        </div>
      </aside>
    </>
  );
}

interface DrawerToggleTileProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
}

function DrawerToggleTile({
  icon,
  label,
  sublabel,
  active,
  onClick,
  onSecondaryAction,
  secondaryLabel,
}: DrawerToggleTileProps) {
  return (
    <div
      className={`rounded-lg border transition-colors ${
        active
          ? 'bg-rose-600/15 border-rose-500/45 text-white'
          : 'bg-[#141720] border-white/[0.07] text-zinc-300'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-[54px] px-2.5 py-2 flex items-start gap-2 text-right cursor-pointer"
      >
        <div
          className={`mt-0.5 shrink-0 ${active ? 'text-rose-400' : 'text-zinc-500'}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold truncate">{label}</div>
          <div className="text-[10px] text-zinc-400 truncate mt-0.5">{sublabel}</div>
        </div>
      </button>
      {onSecondaryAction && secondaryLabel && (
        <button
          type="button"
          onClick={onSecondaryAction}
          className="w-full border-t border-white/[0.06] py-1 text-[10px] text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
