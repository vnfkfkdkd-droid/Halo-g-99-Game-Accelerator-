import { GameProfile, ModeDefinition, PerformanceMode, ProTuningConfig, WeakDeviceTools } from '../types/booster';

export const HELIO_G99_SPECS = {
  chipName: 'MediaTek Helio G99 (MT6789)',
  processNode: '6nm TSMC FinFET',
  cpuArchitecture: '2× Cortex-A76 @ 2.2GHz + 6× Cortex-A55 @ 2.0GHz',
  gpuModel: 'Arm Mali-G57 MC2',
  memorySpec: 'LPDDR4X-2133 · 8192 MB',
  displayBase: { width: 1080, height: 2400 },
  engine: 'HyperEngine 2.0 Lite',
  heroChipImage: '/src/assets/images/helio_chipset_hero_1794754095547.jpg',
};

export const PERFORMANCE_MODES: Record<PerformanceMode, ModeDefinition> = {
  normal: {
    id: 'normal',
    nameAr: 'الوضع العادي',
    shortNameAr: 'عادي',
    subtitleAr: 'توازن البطارية والحرارة',
    descriptionAr: 'يضبط تردد أنوية A76 عند 1.65GHz لتقليل الحرارة والحفاظ على شحن البطارية في الألعاب الخفيفة.',
    bigCoreMHz: 1650,
    littleCoreMHz: 1400,
    gpuMHz: 650,
    fpsCap: 60,
    powerProfileAr: 'استهلاك منخفض',
    thermalStatusAr: 'حرارة باردة',
  },
  boost: {
    id: 'boost',
    nameAr: 'وضع البوست',
    shortNameAr: 'بوست',
    subtitleAr: 'تسريع HyperEngine التلقائي',
    descriptionAr: 'يرفع استجابة المعالج عند المشاهد الثقيلة مع تحرير الذاكرة العشوائية وتقليل تأخير الشبكة.',
    bigCoreMHz: 2000,
    littleCoreMHz: 1800,
    gpuMHz: 850,
    fpsCap: 60,
    powerProfileAr: 'استهلاك متوازن',
    thermalStatusAr: 'حرارة مستقرة',
  },
  high: {
    id: 'high',
    nameAr: 'الأداء العالي',
    shortNameAr: 'أداء عالي',
    subtitleAr: 'فتح التردد الكامل 2.2GHz',
    descriptionAr: 'يشغل أنوية Cortex-A76 بكامل سرعتها 2.2GHz ومعالج رسوميات Mali-G57 عند 950MHz لأعلى ثبات إطارات.',
    bigCoreMHz: 2200,
    littleCoreMHz: 2000,
    gpuMHz: 950,
    fpsCap: 90,
    powerProfileAr: 'أداء مكثف',
    thermalStatusAr: 'حرارة مرتفعة نسبياً',
  },
  pro: {
    id: 'pro',
    nameAr: 'وضع المحترف',
    shortNameAr: 'محترف',
    subtitleAr: 'تحكم يدوي كامل بأسلوب RedMagic',
    descriptionAr: 'يفتح جميع إعدادات التردد اليدوية لـ Helio G99 مع تثبيت زمن الإطار ومنع التباطؤ الحراري ومؤشر التصويب.',
    bigCoreMHz: 2200,
    littleCoreMHz: 2000,
    gpuMHz: 980,
    fpsCap: 90,
    powerProfileAr: 'طاقة قصوى ثابتة',
    thermalStatusAr: 'أولوية التبريد النشط',
  },
};

export const MODE_ORDER: PerformanceMode[] = ['normal', 'boost', 'high', 'pro'];

export const RESOLUTION_PRESETS = [
  { scale: 100, labelAr: 'أصلي FHD+', dims: '1080 × 2400', noteAr: 'جودة كاملة' },
  { scale: 85, labelAr: 'متوازن 918p', dims: '918 × 2040', noteAr: 'توفير +18% رسوميات' },
  { scale: 75, labelAr: 'سلس HD+', dims: '810 × 1800', noteAr: 'ممتاز لهيلو G99' },
  { scale: 65, labelAr: 'أجهزة ضعيفة', dims: '702 × 1560', noteAr: 'ثبات عالي للإطارات' },
  { scale: 50, labelAr: 'أقصى سرعة qHD', dims: '540 × 1200', noteAr: 'أخف حمل ممكن' },
];

export const DEFAULT_PRO_CONFIG: ProTuningConfig = {
  bigCoreMaxMHz: 2200,
  littleCoreMaxMHz: 2000,
  gpuFreqMHz: 980,
  fpsTarget: 90,
  thermalCeiling: 46,
  hyperEngineNetGuard: true,
  framePacingLock: true,
};

export const DEFAULT_WEAK_DEVICE_TOOLS: WeakDeviceTools = {
  resolutionScale: 75,
  disableShadows: false,
  lowTextureMode: false,
  antiAliasingOff: true,
  backgroundAppLimit: true,
  touchBoost240Hz: true,
  blockNotifications: true,
  brightnessLock: false,
  crosshairEnabled: false,
  crosshairStyle: 'tactical',
  floatingHudEnabled: false,
};

export const INITIAL_GAMES: GameProfile[] = [
  {
    id: 'arena-benchmark',
    titleAr: 'ميدان الاختبار الحي',
    genreAr: 'اختبار إطارات ودقة تفاعلي',
    coverImage: '/src/assets/images/helio_chipset_hero_1794754095547.jpg',
    recommendedMode: 'pro',
    recommendedScale: 75,
    lastPlayedMinutes: 45,
    avgFps: 88,
    isLiveArena: true,
  },
  {
    id: 'dustfall-br',
    titleAr: 'باتل رويال الصحراء',
    genreAr: 'تصويب تكتيكي',
    coverImage: '/src/assets/images/game_cover_battle_royale_1794754095008.jpg',
    recommendedMode: 'high',
    recommendedScale: 75,
    lastPlayedMinutes: 185,
    avgFps: 60,
  },
  {
    id: 'aetheria-rpg',
    titleAr: 'عالم أثيريا المفتوح',
    genreAr: 'مغامرات RPG ثقيلة',
    coverImage: '/src/assets/images/game_cover_rpg_fantasy_1794754096090.jpg',
    recommendedMode: 'boost',
    recommendedScale: 65,
    lastPlayedMinutes: 92,
    avgFps: 54,
  },
  {
    id: 'crimson-vanguard',
    titleAr: 'ساحة الطليعة القرمزية',
    genreAr: 'MOBA تنافسية 5 ضد 5',
    coverImage: '/src/assets/images/game_cover_moba_arena_1794754096336.jpg',
    recommendedMode: 'pro',
    recommendedScale: 85,
    lastPlayedMinutes: 310,
    avgFps: 86,
  },
];
