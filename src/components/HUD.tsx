import React, { useState, useEffect } from 'react';
import { Home, Sparkles, Star, Zap } from 'lucide-react';
import { ActiveBoost } from '../types';
import { sound } from '../services/audio';

interface HUDProps {
  parkName: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  coins: number;
  gems: number;
  parkRating: number;
  activeBoosts: ActiveBoost[];
  onOpenMenu: () => void;
  onOpenRatingInfo: () => void;
  onOpenExpansions: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  parkName,
  level,
  xp,
  nextLevelXp,
  coins,
  gems,
  parkRating,
  activeBoosts,
  onOpenMenu,
  onOpenRatingInfo,
  onOpenExpansions,
}) => {
  // Smooth animated coin rolling
  const [displayedCoins, setDisplayedCoins] = useState(coins);

  useEffect(() => {
    let animFrame: number;
    const step = () => {
      setDisplayedCoins(prev => {
        const diff = coins - prev;
        if (Math.abs(diff) < 1) return coins;
        return Math.floor(prev + diff * 0.18);
      });
      if (displayedCoins !== coins) {
        animFrame = requestAnimationFrame(step);
      }
    };
    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [coins, displayedCoins]);

  const xpPercent = Math.min(100, Math.max(0, Math.floor((xp / nextLevelXp) * 100)));

  return (
    <header className="absolute top-0 left-0 right-0 p-3 md:p-4 flex items-start justify-between pointer-events-none z-30 select-none">
      {/* Top Left: Park Name, Level, XP Bar, Stars */}
      <div className="flex flex-col gap-1.5 pointer-events-auto max-w-[55%] sm:max-w-none">
        <div className="flex items-center gap-2">
          {/* Main Menu Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenMenu();
            }}
            className="w-10 h-10 rounded-2xl bg-sky-950/80 backdrop-blur-md border border-sky-400/40 text-sky-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            title="Main Menu"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Park Profile Card */}
          <div className="bg-sky-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-sky-400/30 text-white shadow-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-extrabold text-sm flex items-center justify-center shadow-inner font-['Fredoka']">
              {level}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-sky-100 truncate max-w-[110px] sm:max-w-[160px]">
                  {parkName}
                </span>
                {/* Rating Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenRatingInfo();
                  }}
                  className="px-1.5 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-extrabold text-xs flex items-center gap-0.5 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{parkRating.toFixed(1)}</span>
                </button>
              </div>

              {/* XP Bar */}
              <div className="w-28 sm:w-36 h-2 rounded-full bg-sky-900/80 overflow-hidden mt-1 border border-sky-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Boosts Indicator */}
        {activeBoosts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {activeBoosts.map(boost => {
              const remainingSec = Math.max(0, Math.floor((boost.expiresAt - Date.now()) / 1000));
              const mins = Math.floor(remainingSec / 60);
              const secs = remainingSec % 60;
              return (
                <div
                  key={boost.id}
                  className="px-2 py-0.5 rounded-lg bg-orange-500/90 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1 shadow-md border border-orange-300/40 animate-pulse"
                >
                  <Zap className="w-3 h-3 fill-yellow-200 text-yellow-200" />
                  <span>{boost.name}</span>
                  <span className="text-yellow-200">
                    ({mins}:{secs < 10 ? '0' : ''}{secs})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Right: Coins & Gems */}
      <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
        {/* Coins Counter */}
        <div className="bg-sky-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-400/40 text-white shadow-xl flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xs shadow-[0_2px_4px_rgba(0,0,0,0.3)] font-black text-amber-950">
            🪙
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] text-amber-200 font-semibold tracking-wider uppercase">Coins</span>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-tight">
              {displayedCoins.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Gems Counter */}
        <div className="bg-sky-950/85 backdrop-blur-md px-3 py-1 rounded-2xl border border-purple-400/40 text-white shadow-xl flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-fuchsia-400 fill-fuchsia-400" />
          <span className="text-xs sm:text-sm font-black text-fuchsia-300 font-mono">
            {gems.toLocaleString()}
          </span>
        </div>

        {/* Quick Land Expansion Shortcut */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenExpansions();
          }}
          className="px-2.5 py-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-[11px] font-bold shadow-md border border-teal-300/40 active:scale-95 transition-transform flex items-center gap-1"
        >
          <span>🗺️ Expand</span>
        </button>
      </div>
    </header>
  );
};
