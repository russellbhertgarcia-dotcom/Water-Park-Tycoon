import React, { useEffect } from 'react';
import { Sparkles, Trophy, Coins, LockOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATALOG } from '../data/catalog';
import { sound } from '../services/audio';

interface LevelUpModalProps {
  newLevel: number;
  rewardCoins: number;
  rewardGems: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  newLevel,
  rewardCoins,
  rewardGems,
  onClose,
}) => {
  const newlyUnlocked = CATALOG.filter(item => item.requiredLevel === newLevel);

  useEffect(() => {
    try {
      sound.playLevelUp();
    } catch {}

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-sky-950 text-white rounded-3xl border-2 border-amber-400 shadow-2xl p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200"
      >
        {/* Glorious Level Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 text-amber-950 font-black text-4xl flex items-center justify-center shadow-2xl border-2 border-yellow-200 font-['Fredoka'] animate-bounce">
            {newLevel}
          </div>
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <div>
          <h2 className="text-2xl font-black font-['Fredoka'] text-amber-300 uppercase tracking-wide">
            LEVEL UP!
          </h2>
          <p className="text-xs text-sky-200 mt-0.5">
            Your water park empire is expanding to new heights!
          </p>
        </div>

        {/* Level Up Rewards */}
        <div className="w-full bg-sky-900/50 p-3 rounded-2xl border border-sky-700/50 flex items-center justify-around text-sm font-black">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>+{rewardCoins.toLocaleString()} 🪙</span>
          </div>
          <div className="flex items-center gap-1.5 text-fuchsia-300">
            <Sparkles className="w-5 h-5 text-fuchsia-400 fill-fuchsia-400" />
            <span>+{rewardGems} 💎</span>
          </div>
        </div>

        {/* Newly Unlocked Attractions */}
        {newlyUnlocked.length > 0 && (
          <div className="w-full bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/40 text-left">
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-2">
              <LockOpen className="w-3.5 h-3.5" />
              <span>NEW ATTRACTIONS UNLOCKED:</span>
            </div>
            <div className="space-y-1">
              {newlyUnlocked.map(item => (
                <div key={item.id} className="text-xs text-white font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
        >
          CLAIM & CONTINUE
        </button>
      </div>
    </div>
  );
};
