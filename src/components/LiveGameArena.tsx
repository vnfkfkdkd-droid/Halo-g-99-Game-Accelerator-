import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { PERFORMANCE_MODES } from '../data/helioG99Profiles';
import { GameProfile, LiveTelemetry, PerformanceMode, WeakDeviceTools } from '../types/booster';
import { audioFx } from '../utils/audioFx';

type ArenaState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

interface LiveGameArenaProps {
  activeGame: GameProfile;
  mode: PerformanceMode;
  tools: WeakDeviceTools;
  telemetry: LiveTelemetry;
  onExitArena: () => void;
  onOpenSideDrawer: () => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  kind: 'drone' | 'charger';
  windup: number;
  hitFlash: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export function LiveGameArena({
  activeGame,
  mode,
  tools,
  telemetry,
  onExitArena,
  onOpenSideDrawer,
}: LiveGameArenaProps) {
  const [gameState, setGameState] = useState<ArenaState>('TITLE_MENU');
  const [hudScore, setHudScore] = useState(0);
  const [hudWave, setHudWave] = useState(1);
  const [hudHp, setHudHp] = useState(100);
  const [measuredCanvasFps, setMeasuredCanvasFps] = useState(60);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs synced to simulation loop without restarting RAF
  const gameStateRef = useRef<ArenaState>(gameState);
  const toolsRef = useRef<WeakDeviceTools>(tools);
  const modeRef = useRef<PerformanceMode>(mode);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    toolsRef.current = tools;
  }, [tools]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Simulation world state ref
  const worldRef = useRef({
    player: { x: 400, y: 260, vx: 0, vy: 0, hp: 100, invuln: 0, fireCooldown: 0, squash: 1 },
    aim: { x: 500, y: 260, active: false },
    keys: new Set<string>(),
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    score: 0,
    wave: 1,
    spawnTimer: 0.8,
    shakeTime: 0,
    shakeMag: 0,
    hitstop: 0,
    elapsed: 0,
    logicalW: 960,
    logicalH: 540,
  });

  const resetWorld = () => {
    const w = worldRef.current;
    w.player = {
      x: w.logicalW / 2,
      y: w.logicalH / 2,
      vx: 0,
      vy: 0,
      hp: 100,
      invuln: 0,
      fireCooldown: 0,
      squash: 1,
    };
    w.bullets = [];
    w.enemies = [];
    w.particles = [];
    w.score = 0;
    w.wave = 1;
    w.spawnTimer = 0.6;
    w.shakeTime = 0;
    w.hitstop = 0;
    w.elapsed = 0;
    setHudScore(0);
    setHudWave(1);
    setHudHp(100);
  };

  const startGame = () => {
    resetWorld();
    audioFx.playModeSwitch(true);
    setGameState('PLAYING');
  };

  // Keyboard & blur handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'Escape') {
        if (gameStateRef.current === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameStateRef.current === 'PAUSED') {
          setGameState('PLAYING');
        }
        return;
      }
      if ((code === 'Space' || code === 'Enter') && gameStateRef.current === 'TITLE_MENU') {
        e.preventDefault();
        startGame();
        return;
      }
      if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
          code
        )
      ) {
        if (gameStateRef.current === 'PLAYING') e.preventDefault();
        worldRef.current.keys.add(code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      worldRef.current.keys.delete(e.code);
    };

    const handleBlur = () => {
      worldRef.current.keys.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Main 60fps Canvas Loop (decoupled from React renders)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let fpsAccumulator = 0;
    let frameCount = 0;
    let hudSyncAccum = 0;

    const spawnBurst = (x: number, y: number, color: string, count: number) => {
      const w = worldRef.current;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 70 + Math.random() * 190;
        w.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.38 + Math.random() * 0.25,
          maxLife: 0.63,
          color,
          size: 2.2 + Math.random() * 2.5,
        });
      }
    };

    const spawnEnemy = () => {
      const w = worldRef.current;
      const edge = Math.floor(Math.random() * 4);
      let ex = 0;
      let ey = 0;
      if (edge === 0) {
        ex = Math.random() * w.logicalW;
        ey = -24;
      } else if (edge === 1) {
        ex = w.logicalW + 24;
        ey = Math.random() * w.logicalH;
      } else if (edge === 2) {
        ex = Math.random() * w.logicalW;
        ey = w.logicalH + 24;
      } else {
        ex = -24;
        ey = Math.random() * w.logicalH;
      }

      const isCharger = Math.random() < Math.min(0.42, 0.14 + w.wave * 0.04);
      const baseHp = isCharger ? 2 + Math.floor(w.wave / 3) : 1 + Math.floor(w.wave / 5);
      w.enemies.push({
        x: ex,
        y: ey,
        vx: 0,
        vy: 0,
        radius: isCharger ? 16 : 12,
        hp: baseHp,
        maxHp: baseHp,
        kind: isCharger ? 'charger' : 'drone',
        windup: isCharger ? 1.4 : 0,
        hitFlash: 0,
      });
    };

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);

      fpsAccumulator += rawDt;
      frameCount += 1;
      if (fpsAccumulator >= 0.5) {
        setMeasuredCanvasFps(Math.round(frameCount / fpsAccumulator));
        fpsAccumulator = 0;
        frameCount = 0;
      }

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const displayW = container.clientWidth;
      const displayH = container.clientHeight;
      if (displayW === 0 || displayH === 0) return;

      // Apply live Resolution Scaler directly to Canvas backing buffer!
      const resScale = toolsRef.current.resolutionScale / 100;
      const targetBackingW = Math.max(240, Math.round(displayW * resScale));
      const targetBackingH = Math.max(160, Math.round(displayH * resScale));

      if (canvas.width !== targetBackingW || canvas.height !== targetBackingH) {
        canvas.width = targetBackingW;
        canvas.height = targetBackingH;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = worldRef.current;
      w.logicalW = displayW;
      w.logicalH = displayH;

      // Transform logical world coords -> scaled backing resolution
      ctx.setTransform(resScale, 0, 0, resScale, 0, 0);

      // Update Simulation when PLAYING
      if (gameStateRef.current === 'PLAYING') {
        if (w.hitstop > 0) {
          w.hitstop = Math.max(0, w.hitstop - dt);
        } else {
          w.elapsed += dt;
          const p = w.player;
          p.invuln = Math.max(0, p.invuln - dt);
          p.fireCooldown = Math.max(0, p.fireCooldown - dt);
          p.squash += (1 - p.squash) * Math.min(1, dt * 12);

          // Movement from held keys
          let moveX = 0;
          let moveY = 0;
          if (w.keys.has('KeyA') || w.keys.has('ArrowLeft')) moveX -= 1;
          if (w.keys.has('KeyD') || w.keys.has('ArrowRight')) moveX += 1;
          if (w.keys.has('KeyW') || w.keys.has('ArrowUp')) moveY -= 1;
          if (w.keys.has('KeyS') || w.keys.has('ArrowDown')) moveY += 1;

          if (moveX !== 0 || moveY !== 0) {
            const len = Math.hypot(moveX, moveY);
            moveX /= len;
            moveY /= len;
          }

          const speedBoost = toolsRef.current.touchBoost240Hz ? 285 : 245;
          p.vx = moveX * speedBoost;
          p.vy = moveY * speedBoost;
          p.x = Math.max(22, Math.min(displayW - 22, p.x + p.vx * dt));
          p.y = Math.max(22, Math.min(displayH - 22, p.y + p.vy * dt));

          // Auto or Space fire toward nearest enemy or pointer aim
          const wantsFire = w.keys.has('Space') || w.aim.active || w.enemies.length > 0;
          const fireInterval = modeRef.current === 'pro' || modeRef.current === 'high' ? 0.14 : 0.18;
          if (wantsFire && p.fireCooldown <= 0) {
            let tx = w.aim.x;
            let ty = w.aim.y;
            if (!w.aim.active && w.enemies.length > 0) {
              // Nearest enemy auto-lock
              let bestDist = Infinity;
              for (const en of w.enemies) {
                const d = (en.x - p.x) ** 2 + (en.y - p.y) ** 2;
                if (d < bestDist) {
                  bestDist = d;
                  tx = en.x;
                  ty = en.y;
                }
              }
            }
            const dx = tx - p.x;
            const dy = ty - p.y;
            const dist = Math.hypot(dx, dy) || 1;
            w.bullets.push({
              x: p.x + (dx / dist) * 16,
              y: p.y + (dy / dist) * 16,
              vx: (dx / dist) * 620,
              vy: (dy / dist) * 620,
              life: 1.5,
            });
            p.fireCooldown = fireInterval;
            p.squash = 1.15;
            audioFx.playShoot();
          }

          // Update bullets
          for (let i = w.bullets.length - 1; i >= 0; i--) {
            const b = w.bullets[i];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.life -= dt;
            if (b.life <= 0 || b.x < -20 || b.x > displayW + 20 || b.y < -20 || b.y > displayH + 20) {
              w.bullets.splice(i, 1);
            }
          }

          // Spawn waves
          w.spawnTimer -= dt;
          if (w.spawnTimer <= 0) {
            spawnEnemy();
            const rate = Math.max(0.28, 1.05 - w.wave * 0.065);
            w.spawnTimer = rate;
          }

          // Update enemies
          for (let i = w.enemies.length - 1; i >= 0; i--) {
            const en = w.enemies[i];
            en.hitFlash = Math.max(0, en.hitFlash - dt);

            const dx = p.x - en.x;
            const dy = p.y - en.y;
            const dist = Math.hypot(dx, dy) || 1;

            if (en.kind === 'charger') {
              en.windup -= dt;
              if (en.windup <= 0 && en.windup > -0.45) {
                // Lunging!
                en.x += (dx / dist) * 265 * dt;
                en.y += (dy / dist) * 265 * dt;
              } else if (en.windup <= -0.45) {
                en.windup = 1.6;
              } else {
                en.x += (dx / dist) * 68 * dt;
                en.y += (dy / dist) * 68 * dt;
              }
            } else {
              const speed = 95 + w.wave * 6;
              en.x += (dx / dist) * speed * dt;
              en.y += (dy / dist) * speed * dt;
            }

            // Bullet collision
            let destroyed = false;
            for (let j = w.bullets.length - 1; j >= 0; j--) {
              const b = w.bullets[j];
              if (Math.hypot(b.x - en.x, b.y - en.y) < en.radius + 5) {
                w.bullets.splice(j, 1);
                en.hp -= 1;
                en.hitFlash = 0.1;
                if (en.hp <= 0) {
                  destroyed = true;
                  w.score += en.kind === 'charger' ? 35 : 15;
                  w.wave = 1 + Math.floor(w.score / 220);
                  w.hitstop = en.kind === 'charger' ? 0.035 : 0;
                  w.shakeTime = 0.12;
                  w.shakeMag = en.kind === 'charger' ? 6 : 3;
                  spawnBurst(en.x, en.y, en.kind === 'charger' ? '#F59E0B' : '#F43F5E', 10);
                  audioFx.playHit(en.kind === 'charger');
                  w.enemies.splice(i, 1);
                  break;
                } else {
                  spawnBurst(b.x, b.y, '#FFFFFF', 3);
                  audioFx.playHit(false);
                }
              }
            }
            if (destroyed) continue;

            // Player collision
            if (p.invuln <= 0 && Math.hypot(p.x - en.x, p.y - en.y) < en.radius + 14) {
              p.hp = Math.max(0, p.hp - 20);
              p.invuln = 0.75;
              w.shakeTime = 0.22;
              w.shakeMag = 8;
              w.hitstop = 0.05;
              spawnBurst(p.x, p.y, '#EF4444', 12);
              audioFx.playHit(true);
              w.enemies.splice(i, 1);
              if (p.hp <= 0) {
                setHudHp(0);
                setHudScore(w.score);
                setGameState('GAME_OVER');
              }
            }
          }

          // Particles
          for (let i = w.particles.length - 1; i >= 0; i--) {
            const pt = w.particles[i];
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.vx *= 0.94;
            pt.vy *= 0.94;
            pt.life -= dt;
            if (pt.life <= 0) w.particles.splice(i, 1);
          }

          w.shakeTime = Math.max(0, w.shakeTime - dt);

          hudSyncAccum += dt;
          if (hudSyncAccum >= 0.12) {
            setHudScore(w.score);
            setHudWave(w.wave);
            setHudHp(p.hp);
            hudSyncAccum = 0;
          }
        }
      }

      // Render Arena Scene
      ctx.save();
      if (w.shakeTime > 0 && gameStateRef.current === 'PLAYING') {
        const sx = (Math.random() - 0.5) * w.shakeMag;
        const sy = (Math.random() - 0.5) * w.shakeMag;
        ctx.translate(sx, sy);
      }

      // Obsidian Tactical Grid Backdrop
      ctx.fillStyle = '#08090D';
      ctx.fillRect(0, 0, displayW, displayH);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let gx = 0; gx < displayW; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, displayH);
        ctx.stroke();
      }
      for (let gy = 0; gy < displayH; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(displayW, gy);
        ctx.stroke();
      }

      const useShadows = !toolsRef.current.disableShadows;

      // Draw Particles
      for (const pt of w.particles) {
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw Bullets
      if (useShadows) {
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = 8;
      }
      ctx.fillStyle = '#FB7185';
      for (const b of w.bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Draw Enemies with telegraph rings
      for (const en of w.enemies) {
        if (en.kind === 'charger' && en.windup > 0 && en.windup < 0.55) {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(en.x, en.y, en.radius + 7, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (useShadows) {
          ctx.shadowColor = en.kind === 'charger' ? '#F59E0B' : '#E11D48';
          ctx.shadowBlur = 10;
        }
        ctx.fillStyle =
          en.hitFlash > 0 ? '#FFFFFF' : en.kind === 'charger' ? '#D97706' : '#E11D48';
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Player Core
      const p = w.player;
      if (p.invuln <= 0 || Math.floor(p.invuln * 16) % 2 === 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.squash, 2 - p.squash);
        if (useShadows) {
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 14;
        }
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    worldRef.current.aim.x = e.clientX - rect.left;
    worldRef.current.aim.y = e.clientY - rect.top;
    worldRef.current.aim.active = true;
  };

  const handlePointerLeave = () => {
    worldRef.current.aim.active = false;
  };

  const renderW = Math.round((960 * tools.resolutionScale) / 100);
  const renderH = Math.round((540 * tools.resolutionScale) / 100);

  return (
    <section className="relative rounded-xl bg-[#0A0C10] border border-white/[0.1] overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[540px]">
      {/* Top Game Shell Bar (Unobtrusive, <=48px) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#10131A] border-b border-white/[0.08] z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitArena}
            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#222736] text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>خروج للوحة المعزز</span>
          </button>
          <div>
            <div className="font-display font-bold text-sm text-white">
              {activeGame.titleAr}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 tabular-nums">
              {PERFORMANCE_MODES[mode].nameAr} · {tools.resolutionScale}% ({renderW}×{renderH}) · {tools.disableShadows ? 'ظلال معطلة' : 'ظلال كاملة'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono tabular-nums text-zinc-300">
            <span>
              المعزز: <strong className="text-emerald-400">{telemetry.fps} FPS</strong>
            </span>
            <span className="text-zinc-600" aria-hidden="true">/</span>
            <span>
              الشاشة: <strong className="text-zinc-100">{measuredCanvasFps} FPS</strong>
            </span>
            <span className="text-zinc-600" aria-hidden="true">/</span>
            <span>
              الحرارة: <strong className="text-rose-400">{telemetry.socTempC}°C</strong>
            </span>
          </div>

          {gameState === 'PLAYING' && (
            <button
              type="button"
              onClick={() => setGameState('PAUSED')}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#222736] text-xs font-medium text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>إيقاف</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSideDrawer}
            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>سحب RedMagic</span>
          </button>
        </div>
      </div>

      {/* Isolated Canvas Playfield */}
      <div ref={containerRef} className="relative flex-1 w-full bg-[#08090D] overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            imageRendering: tools.resolutionScale < 80 ? 'pixelated' : 'auto',
          }}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* Minimal Perimeter HUD while Playing (pointer-events-none, no backdrop-filter) */}
        {gameState === 'PLAYING' && (
          <div className="pointer-events-none absolute top-3 right-3 left-3 flex items-center justify-between text-xs font-mono tabular-nums">
            <div className="flex items-center gap-4 px-3 py-1.5 rounded-md bg-[#0B0D12]/85 border border-white/10 text-zinc-100">
              <span>النقاط: {hudScore}</span>
              <span className="text-zinc-500">·</span>
              <span>الموجة: {hudWave}</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#0B0D12]/85 border border-white/10 text-emerald-400 font-bold">
              HP: {hudHp}/100 · {hudHp > 35 ? 'مستقر' : 'حرج'}
            </div>
          </div>
        )}

        {/* Title Menu Overlay */}
        {gameState === 'TITLE_MENU' && (
          <div className="absolute inset-0 bg-[#08090D]/80 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-mono text-rose-400">
                  Helio G99 Live Benchmark · {tools.resolutionScale}% Resolution
                </p>
                <h2 className="font-display font-extrabold text-3xl text-white">
                  {activeGame.titleAr}
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  اختبر تأثير أوضاع Helio G99 وتقليل دقة الشاشة في الوقت الحقيقي. اسحب لوحة RedMagic من اليسار أثناء اللعب لتغيير الدقة والأداء فوراً.
                </p>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="min-h-[48px] px-8 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-base inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>بدء الاختبار الحي</span>
              </button>

              <p className="text-xs text-zinc-400 font-mono">
                WASD / الأسهم للحركة · الماوس أو المسافة للتصويب · Esc للإيقاف
              </p>
            </div>
          </div>
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-[#08090D]/85 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-6 rounded-xl bg-[#12151E] border border-white/10 max-w-sm w-full space-y-4">
              <h3 className="font-display font-bold text-xl text-white">تم إيقاف الجلسة مؤقتاً</h3>
              <p className="text-xs text-zinc-400">
                يمكنك فتح لوحة RedMagic الجانبية لتعديل الدقة أو تفعيل وضع المحترف ثم المتابعة.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setGameState('PLAYING')}
                  className="w-full min-h-[44px] rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm cursor-pointer"
                >
                  متابعة اللعب
                </button>
                <button
                  type="button"
                  onClick={startGame}
                  className="w-full min-h-[44px] rounded-lg bg-[#1A1E2B] hover:bg-[#242A3B] text-zinc-200 font-semibold text-sm cursor-pointer"
                >
                  إعادة البدء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-[#08090D]/85 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-6 rounded-xl bg-[#12151E] border border-rose-500/30 max-w-sm w-full space-y-4">
              <h3 className="font-display font-bold text-2xl text-white">انتهت جولة الاختبار</h3>
              <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/[0.08] font-mono tabular-nums">
                <div>
                  <div className="text-xs text-zinc-400">النتيجة</div>
                  <div className="text-xl font-bold text-rose-400">{hudScore}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">الموجة</div>
                  <div className="text-xl font-bold text-white">{hudWave}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={startGame}
                className="w-full min-h-[44px] rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>العب مجدداً</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
