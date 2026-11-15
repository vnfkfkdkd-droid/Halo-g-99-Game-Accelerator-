import React, { useRef, useState } from 'react';
import { Gamepad2, ImagePlus, Play, Plus, Trash2, X } from 'lucide-react';
import { MODE_ORDER, PERFORMANCE_MODES, RESOLUTION_PRESETS } from '../data/helioG99Profiles';
import { GameProfile, PerformanceMode } from '../types/booster';
import { audioFx } from '../utils/audioFx';

interface GameLibraryGridProps {
  games: GameProfile[];
  onUpdateGame: (id: string, patch: Partial<GameProfile>) => void;
  onAddGame: (game: GameProfile) => void;
  onRemoveGame: (id: string) => void;
  onLaunchGame: (game: GameProfile) => void;
}

const COVER_TEMPLATES = [
  {
    id: 'br',
    label: 'تصويب تكتيكي',
    src: '/src/assets/images/game_cover_battle_royale_1794754095008.jpg',
  },
  {
    id: 'rpg',
    label: 'عالم مفتوح RPG',
    src: '/src/assets/images/game_cover_rpg_fantasy_1794754096090.jpg',
  },
  {
    id: 'moba',
    label: 'ساحة قتال MOBA',
    src: '/src/assets/images/game_cover_moba_arena_1794754096336.jpg',
  },
  {
    id: 'chip',
    label: 'أداء Helio G99',
    src: '/src/assets/images/helio_chipset_hero_1794754095547.jpg',
  },
];

const GENRE_OPTIONS = [
  'تصويب وباتل رويال',
  'أكشن ومغامرات RPG',
  'MOBA تنافسية 5 ضد 5',
  'سباق سيارات',
  'رياضة وكرة قدم',
  'ألعاب خفيفة / أخرى',
];

function downscaleImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('صيغة الصورة غير مدعومة'));
      img.onload = () => {
        const maxW = 640;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function GameLibraryGrid({
  games,
  onUpdateGame,
  onAddGame,
  onRemoveGame,
  onLaunchGame,
}: GameLibraryGridProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Game Form State
  const [titleAr, setTitleAr] = useState('');
  const [genreAr, setGenreAr] = useState(GENRE_OPTIONS[0]);
  const [selectedCover, setSelectedCover] = useState(COVER_TEMPLATES[0].src);
  const [uploadedCover, setUploadedCover] = useState<string | null>(null);
  const [recommendedMode, setRecommendedMode] = useState<PerformanceMode>('high');
  const [recommendedScale, setRecommendedScale] = useState<number>(75);
  const [targetFps, setTargetFps] = useState<number>(60);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await downscaleImageFile(file);
      setUploadedCover(dataUrl);
      setSelectedCover(dataUrl);
      setFormError(null);
      audioFx.playClick(660);
    } catch {
      setFormError('تعذر تحميل الصورة المختارة، جرب صورة أخرى بصيغة JPG أو PNG.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = titleAr.trim();
    if (!trimmed) {
      setFormError('اكتب اسم اللعبة أولاً.');
      return;
    }

    const newGame: GameProfile = {
      id: `custom-${Date.now()}`,
      titleAr: trimmed,
      genreAr,
      coverImage: selectedCover,
      recommendedMode,
      recommendedScale,
      lastPlayedMinutes: 0,
      avgFps: targetFps,
      isCustom: true,
    };

    onAddGame(newGame);
    audioFx.playModeSwitch(true);
    setTitleAr('');
    setUploadedCover(null);
    setSelectedCover(COVER_TEMPLATES[0].src);
    setFormError(null);
    setIsAddOpen(false);
  };

  return (
    <section className="rounded-xl bg-[#111319] border border-white/[0.08] p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            مكتبة الألعاب وتخصيص Helio G99 لكل لعبة
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            أضف ألعابك الخاصة واضبط وضع الأداء ودقة الشاشة المناسبة لكل لعبة ثم شغّلها مع لوحة RedMagic الجانبية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400 tabular-nums">
            {games.length} ألعاب
          </span>
          <button
            type="button"
            onClick={() => {
              audioFx.playClick(640);
              setIsAddOpen((prev) => !prev);
            }}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            {isAddOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddOpen ? 'إغلاق النموذج' : 'إضافة لعبة من عندي'}</span>
          </button>
        </div>
      </div>

      {/* Add Custom Game Form Panel */}
      {isAddOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-xl bg-[#161922] border border-rose-500/35 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              إضافة لعبة مخصصة إلى المسرّع
            </h3>
            <span className="text-[11px] text-zinc-400">
              يتم حفظ الألعاب المضافة تلقائياً
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Game Title */}
            <div>
              <label htmlFor="custom-game-title" className="block text-xs text-zinc-300 mb-1.5">
                اسم اللعبة
              </label>
              <input
                id="custom-game-title"
                type="text"
                value={titleAr}
                onChange={(e) => {
                  setTitleAr(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="مثال: PUBG Mobile أو Free Fire"
                maxLength={48}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#0D0F15] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Game Genre */}
            <div>
              <label htmlFor="custom-game-genre" className="block text-xs text-zinc-300 mb-1.5">
                نوع اللعبة
              </label>
              <select
                id="custom-game-genre"
                value={genreAr}
                onChange={(e) => setGenreAr(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#0D0F15] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Target FPS */}
            <div>
              <label className="block text-xs text-zinc-300 mb-1.5">
                معدل الإطارات المستهدف (FPS)
              </label>
              <div className="grid grid-cols-4 gap-1.5 font-mono tabular-nums">
                {[30, 45, 60, 90].map((fps) => (
                  <button
                    key={fps}
                    type="button"
                    onClick={() => {
                      setTargetFps(fps);
                      audioFx.playClick(580);
                    }}
                    className={`min-h-[42px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      targetFps === fps
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-[#0D0F15] border-white/10 text-zinc-300 hover:border-white/25'
                    }`}
                  >
                    {fps}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode & Resolution Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-zinc-300 mb-1.5">
                وضع معالج Helio G99 عند التشغيل
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {MODE_ORDER.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setRecommendedMode(m);
                      audioFx.playClick(600);
                    }}
                    className={`min-h-[40px] rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      recommendedMode === m
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-[#0D0F15] border-white/10 text-zinc-300 hover:border-white/25'
                    }`}
                  >
                    {PERFORMANCE_MODES[m].shortNameAr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs text-zinc-300 mb-1.5">
                دقة الشاشة المفضلة لهذه اللعبة
              </span>
              <div className="grid grid-cols-5 gap-1.5 font-mono tabular-nums">
                {RESOLUTION_PRESETS.map((p) => (
                  <button
                    key={p.scale}
                    type="button"
                    onClick={() => {
                      setRecommendedScale(p.scale);
                      audioFx.playClick(550);
                    }}
                    className={`min-h-[40px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      recommendedScale === p.scale
                        ? 'bg-rose-600/25 border-rose-500 text-rose-200'
                        : 'bg-[#0D0F15] border-white/10 text-zinc-300 hover:border-white/25'
                    }`}
                  >
                    {p.scale}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cover Image Selection or Device Upload */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs text-zinc-300">
                اختر غلاف اللعبة أو ارفع صورة من جهازك
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#0D0F15] hover:bg-[#1E2332] border border-white/15 text-xs text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5 text-rose-400" />
                <span>رفع صورة من جهازي</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {COVER_TEMPLATES.map((tpl) => {
                const active = selectedCover === tpl.src;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedCover(tpl.src);
                      audioFx.playClick(560);
                    }}
                    className={`relative rounded-lg overflow-hidden border text-right transition-all cursor-pointer ${
                      active ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={tpl.src}
                      alt={tpl.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-16 object-cover"
                    />
                    <div className="px-2 py-1 bg-[#0B0D12] text-[11px] text-zinc-200 truncate">
                      {tpl.label}
                    </div>
                  </button>
                );
              })}

              {uploadedCover && (
                <button
                  type="button"
                  onClick={() => setSelectedCover(uploadedCover)}
                  className={`relative rounded-lg overflow-hidden border text-right transition-all cursor-pointer ${
                    selectedCover === uploadedCover
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-white/10 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={uploadedCover}
                    alt="صورة مرفوعة"
                    className="w-full h-16 object-cover"
                  />
                  <div className="px-2 py-1 bg-[#0B0D12] text-[11px] text-rose-300 truncate">
                    صورتك المرفوعة
                  </div>
                </button>
              )}
            </div>
          </div>

          {formError && (
            <p className="text-xs text-rose-400 font-medium">{formError}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#0D0F15] hover:bg-[#1C202E] text-xs font-medium text-zinc-300 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>حفظ وإضافة للمكتبة</span>
            </button>
          </div>
        </form>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {games.map((game) => {
          const imgFailed = failedImages[game.id];
          return (
            <article
              key={game.id}
              className="rounded-xl bg-[#161922] border border-white/[0.07] overflow-hidden flex flex-col"
            >
              {/* Artwork Header */}
              <div className="relative aspect-[4/3] bg-[#0B0D12] overflow-hidden">
                {!imgFailed ? (
                  <img
                    src={game.coverImage}
                    alt={game.titleAr}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages((prev) => ({ ...prev, [game.id]: true }))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#191D29] to-[#0B0D12] text-zinc-500 gap-2">
                    <Gamepad2 className="w-8 h-8 text-rose-500/70" />
                    <span className="text-xs">{game.titleAr}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-black/30 to-transparent" />

                {game.isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      audioFx.playClick(420);
                      onRemoveGame(game.id);
                    }}
                    title="حذف اللعبة المضافة"
                    aria-label={`حذف ${game.titleAr}`}
                    className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-[#0B0D12]/80 hover:bg-rose-600 text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="absolute bottom-2.5 right-3 left-3 flex items-end justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-white leading-tight">
                      {game.titleAr}
                    </h3>
                    <div className="text-[11px] text-zinc-300 mt-0.5">
                      {game.genreAr} · <span className="font-mono tabular-nums">{game.avgFps} FPS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-Game Booster Controls */}
              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      وضع المعالج المخصص
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {MODE_ORDER.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            onUpdateGame(game.id, { recommendedMode: m });
                            audioFx.playClick(600);
                          }}
                          className={`py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            game.recommendedMode === m
                              ? 'bg-rose-600 text-white'
                              : 'bg-[#0E1016] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {PERFORMANCE_MODES[m].shortNameAr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      دقة الشاشة لهذه اللعبة
                    </label>
                    <div className="grid grid-cols-4 gap-1 font-mono tabular-nums">
                      {[100, 75, 65, 50].map((sc) => (
                        <button
                          key={sc}
                          type="button"
                          onClick={() => {
                            onUpdateGame(game.id, { recommendedScale: sc });
                            audioFx.playClick(550);
                          }}
                          className={`py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
                            game.recommendedScale === sc
                              ? 'bg-rose-600/25 border border-rose-500 text-rose-200'
                              : 'bg-[#0E1016] border border-transparent text-zinc-400 hover:text-white'
                          }`}
                        >
                          {sc}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    audioFx.playModeSwitch(true);
                    onLaunchGame(game);
                  }}
                  className="w-full min-h-[42px] mt-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{game.isLiveArena ? 'تشغيل ميدان الاختبار الحي' : 'تشغيل اللعبة مع المعزز'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
