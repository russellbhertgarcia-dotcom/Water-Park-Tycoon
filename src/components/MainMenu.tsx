import React, { useEffect, useRef } from 'react';
import { Play, Gift, ShoppingBag, Trophy, Settings, Info, Waves, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';

interface MainMenuProps {
  onPlay: () => void;
  onOpenDaily: () => void;
  onOpenShop: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  hasAvailableDaily: boolean;
  parkRating: number;
  parkName: string;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onOpenDaily,
  onOpenShop,
  onOpenAchievements,
  onOpenSettings,
  onOpenCredits,
  hasAvailableDaily,
  parkRating,
  parkName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background animated tropical water park canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Floating particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 8 + 4,
      speed: Math.random() * 1.5 + 0.8,
      wobble: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      time += 0.02;
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = window.innerHeight;

      // Sky and tropical ocean gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.4, '#0ea5e9');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#0369a1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rotating Sun Rays from top-right
      ctx.save();
      ctx.translate(w * 0.85, h * 0.15);
      ctx.rotate(time * 0.1);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(w, h), (i * Math.PI) / 6, ((i + 0.5) * Math.PI) / 6);
        ctx.closePath();
        ctx.fill();
      }
      // Glowing Sun
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Giant animated undulating water waves at bottom
      for (let waveIndex = 0; waveIndex < 4; waveIndex++) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        const waveBase = h * 0.65 + waveIndex * 40;
        for (let x = 0; x <= w; x += 15) {
          const y = waveBase + Math.sin(x * 0.008 + time * 2 + waveIndex) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, waveBase - 20, 0, h);
        if (waveIndex === 0) {
          waveGrad.addColorStop(0, 'rgba(125, 211, 252, 0.4)');
          waveGrad.addColorStop(1, 'rgba(14, 165, 233, 0.7)');
        } else if (waveIndex === 1) {
          waveGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
          waveGrad.addColorStop(1, 'rgba(2, 132, 199, 0.8)');
        } else {
          waveGrad.addColorStop(0, 'rgba(14, 165, 233, 0.6)');
          waveGrad.addColorStop(1, 'rgba(3, 105, 161, 0.95)');
        }
        ctx.fillStyle = waveGrad;
        ctx.fill();
      }

      // Animated Water Slide Tube Silhouette looping across background
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-50, h * 0.35);
      ctx.bezierCurveTo(w * 0.25, h * 0.2, w * 0.35, h * 0.7, w * 0.6, h * 0.45);
      ctx.bezierCurveTo(w * 0.75, h * 0.3, w * 0.85, h * 0.65, w + 50, h * 0.5);
      ctx.stroke();

      // Slide inner water flow
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Floating water bubbles and sparkles
      particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.03;
        const wobbleX = p.x + Math.sin(p.wobble) * 15;
        if (p.y < -20) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(wobbleX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bubble gleam
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(wobbleX - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.28, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden select-none">
      {/* Dynamic Animated Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Banner & Park Status */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-2">
        <div className="bg-sky-950/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-300/30 flex items-center gap-2 shadow-lg">
          <Waves className="w-5 h-5 text-sky-300 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs text-sky-200 uppercase font-semibold tracking-wider">Your Oasis</span>
            <span className="text-sm font-bold text-white truncate max-w-[140px]">{parkName}</span>
          </div>
        </div>

        <div className="bg-sky-950/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-300/30 flex items-center gap-2 shadow-lg">
          <span className="text-amber-400 font-extrabold text-sm">⭐ {parkRating.toFixed(1)}</span>
          <span className="text-xs text-amber-200 font-medium">Rating</span>
        </div>
      </div>

      {/* Game Title Logo */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        <div className="relative inline-flex items-center justify-center mb-2">
          <span className="text-5xl md:text-7xl animate-bounce drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
            🌊
          </span>
          <span className="absolute -top-3 -right-3 text-2xl animate-spin" style={{ animationDuration: '6s' }}>
            ✨
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] tracking-wide font-['Fredoka'] uppercase">
          Water Park
        </h1>
        <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_4px_8px_rgba(2,132,199,0.8)] tracking-wider font-['Fredoka'] uppercase -mt-1">
          Tycoon
        </h2>

        <div className="mt-3 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-inner flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-xs md:text-sm font-bold text-white tracking-wide uppercase">
            Offline 3D Single-Player
          </span>
        </div>
      </div>

      {/* Main Menu Action Buttons */}
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-3 pb-4">
        {/* Play Button */}
        <button
          onClick={() => {
            sound.playClick();
            onPlay();
          }}
          className="group relative w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 text-white font-black text-2xl md:text-3xl shadow-[0_8px_0_#0f766e,0_15px_20px_rgba(0,0,0,0.35)] active:translate-y-1 active:shadow-[0_4px_0_#0f766e] transition-all flex items-center justify-center gap-3 border-2 border-green-200"
        >
          <Play className="w-8 h-8 fill-white group-hover:scale-110 transition-transform" />
          <span className="tracking-wider drop-shadow font-['Fredoka']">PLAY</span>
        </button>

        {/* Secondary Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Daily Reward Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenDaily();
            }}
            className="relative py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm md:text-base shadow-[0_4px_0_#c2410c] active:translate-y-0.5 active:shadow-[0_2px_0_#c2410c] transition-all flex items-center justify-center gap-2 border border-amber-200"
          >
            <Gift className="w-5 h-5 text-yellow-100" />
            <span>DAILY REWARD</span>
            {hasAvailableDaily && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping" />
            )}
            {hasAvailableDaily && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* Coin Shop Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-bold text-sm md:text-base shadow-[0_4px_0_#0369a1] active:translate-y-0.5 active:shadow-[0_2px_0_#0369a1] transition-all flex items-center justify-center gap-2 border border-sky-200"
          >
            <ShoppingBag className="w-5 h-5 text-sky-100" />
            <span>COIN SHOP</span>
          </button>

          {/* Achievements Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm md:text-base shadow-[0_4px_0_#4338ca] active:translate-y-0.5 active:shadow-[0_2px_0_#4338ca] transition-all flex items-center justify-center gap-2 border border-purple-200"
          >
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span>TROPHIES</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-800 text-white font-bold text-sm md:text-base shadow-[0_4px_0_#1e293b] active:translate-y-0.5 active:shadow-[0_2px_0_#1e293b] transition-all flex items-center justify-center gap-2 border border-slate-400"
          >
            <Settings className="w-5 h-5 text-slate-200" />
            <span>SETTINGS</span>
          </button>
        </div>

        {/* Credits Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenCredits();
          }}
          className="w-full py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-white/25"
        >
          <Info className="w-4 h-4" />
          <span>GAME INFO & CREDITS</span>
        </button>
      </div>
    </div>
  );
};
