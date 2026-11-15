# HelioBoost G99 — مسرّع ألعاب هيلو G99 (Web + Android APK)

تطبيق مسرّع ألعاب احترافي مخصص لمعالج **MediaTek Helio G99** مع أوضاع الأداء (الوضع العادي، وضع البوست، الأداء العالي، وضع المحترف)، وأدوات تقليل الدقة للأجهزة الضعيفة، ومكتبة ألعاب قابلة للإضافة، ولوحة تحكم جانبية قابلة للسحب بأسلوب **RedMagic Game Booster**.

---

## طريقة استخراج ملف APK تلقائياً عبر GitHub

تم تجهيز المشروع بالكامل باستخدام **Capacitor Android** مع ملف **GitHub Actions** جاهز في المسار:
`.github/workflows/build-apk.yml`

### الخطوات:
1. أنشئ مستودعاً جديداً (Repository) على **GitHub** وارفع إليه جميع ملفات المشروع.
2. انتقل إلى تبويب **Actions** داخل المستودع على GitHub.
3. سيبدأ سير العمل **`Build Android APK`** تلقائياً عند كل عملية رفع (`push`) أو يمكنك تشغيله يدوياً عبر زر **Run workflow**.
4. بعد انتهاء البناء (حوالي دقيقتين):
   - يمكنك تحميل ملف **`HelioBoost-G99-debug.apk`** مباشرة من قسم **Artifacts** في صفحة التشغيل.
   - كما يتم نشر نسخة قابلة للتحميل المباشر في قسم **Releases** بالمستودع.

---

## البناء المحلي على جهازك (اختياري)

إذا كان لديك **Node.js 20+** و **Android Studio / JDK 21** على حاسوبك:

```bash
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

ستجد ملف الـ APK الناتج في:
`android/app/build/outputs/apk/debug/app-debug.apk`
