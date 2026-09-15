import React from 'react';
import { Coins, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/audio';

interface OfflineWelcomeModalProps {
  coinsEarned: number;
  minutesAway: number;
  onClaim: () => void;
}

export const OfflineWelcomeModal: React.FC<OfflineWelcomeModalProps> = ({
  coinsEarned,
  minutesAway,
  onClaim,
}) => {
  React.useEffect(() => {
    try {
      sound.playReward();
    } catch {}
    try {
      confetti({ particleCount: 50, spread: 70 });
    } catch {}
  }, []);

  const hours = Math.floor(minutesAway / 60);
  const mins = minutesAway % 60;
  const timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;

  return (
    <div
      onClick={onClaim}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-sky-950 text-white rounded-3xl border-2 border-amber-400 shadow-2xl p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200"
      >
        <span className="text-5xl animate-bounce">🌴</span>

        <div>
          <h2 className="text-2xl font-black font-['Fredoka'] text-amber-300">
            WELCOME BACK!
          </h2>
          <p className="text-xs text-sky-200 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>You were away for {timeText}</span>
          </p>
        </div>

        <div className="w-full bg-sky-900/60 p-4 rounded-2xl border border-sky-700/50 flex flex-col items-center gap-1">
          <span className="text-xs text-sky-300 font-bold uppercase tracking-wider">
            Offline Park Revenue
          </span>
          <div className="flex items-center gap-2 text-2xl font-black text-amber-300 font-mono">
            <Coins className="w-7 h-7 text-amber-400" />
            <span>+{coinsEarned.toLocaleString()} 🪙</span>
          </div>
          <span className="text-[11px] text-sky-300">
            Your attractions continued operating while you were away!
          </span>
        </div>

        <button
          onClick={() => {
            sound.playReward();
            onClaim();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
        >
          COLLECT COINS
        </button>
      </div>
    </div>
  );
};
