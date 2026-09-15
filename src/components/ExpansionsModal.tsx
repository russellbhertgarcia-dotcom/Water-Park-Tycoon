import React from 'react';
import { X, Maximize, Check, Coins, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/audio';

interface ExpansionTier {
  level: number;
  name: string;
  gridDim: number;
  cost: number;
  description: string;
}

const EXPANSIONS: ExpansionTier[] = [
  {
    level: 1,
    name: 'EXPANSION 1: SUNNY REEF',
    gridDim: 22,
    cost: 1000,
    description: 'Expands your park island to 22x22 tiles (+84% more building space!).',
  },
  {
    level: 2,
    name: 'EXPANSION 2: CORAL BAY',
    gridDim: 28,
    cost: 5000,
    description: 'Expands your park island to 28x28 tiles. Plenty of room for mega drop slides!',
  },
  {
    level: 3,
    name: 'EXPANSION 3: TROPICAL ATOLL',
    gridDim: 34,
    cost: 25000,
    description: 'Expands your park island to 34x34 tiles. Perfect for sprawling lazy rivers!',
  },
  {
    level: 4,
    name: 'EXPANSION 4: TYCOON PARADISE',
    gridDim: 40,
    cost: 100000,
    description: 'The ultimate 40x40 mega-resort expansion! Become the world greatest water park!',
  },
];

interface ExpansionsModalProps {
  unlockedExpansions: number;
  playerCoins: number;
  onBuyExpansion: (tier: ExpansionTier) => void;
  onClose: () => void;
}

export const ExpansionsModal: React.FC<ExpansionsModalProps> = ({
  unlockedExpansions,
  playerCoins,
  onBuyExpansion,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sky-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Maximize className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Fredoka'] tracking-wide">
                PARK EXPANSIONS
              </h2>
              <p className="text-xs text-sky-300">
                Unlock additional tropical land plots to grow your empire!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-sky-900/80 hover:bg-sky-800 text-sky-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Size Info */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-sky-900/50 border border-sky-700/50 text-xs">
          <span className="text-sky-200 font-semibold">Current Park Dimensions:</span>
          <span className="text-emerald-300 font-black text-sm">
            {16 + unlockedExpansions * 6} x {16 + unlockedExpansions * 6} Tiles
          </span>
        </div>

        {/* Expansion Tiers */}
        <div className="overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
          {EXPANSIONS.map(tier => {
            const isUnlocked = unlockedExpansions >= tier.level;
            const isCurrentNext = unlockedExpansions === tier.level - 1;
            const canAfford = playerCoins >= tier.cost;

            return (
              <div
                key={tier.level}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  isUnlocked
                    ? 'bg-emerald-950/30 border-emerald-500/40 opacity-70'
                    : isCurrentNext
                    ? 'bg-sky-900/50 border-sky-400 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-white font-['Fredoka']">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-sky-200 mt-0.5">{tier.description}</p>
                  </div>

                  <div className="shrink-0">
                    {isUnlocked ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Owned</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-black flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{tier.cost.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Buy Button */}
                {!isUnlocked && (
                  <button
                    disabled={!isCurrentNext || !canAfford}
                    onClick={() => {
                      if (isCurrentNext && canAfford) {
                        sound.playReward();
                        confetti({ particleCount: 50, spread: 60 });
                        onBuyExpansion(tier);
                      }
                    }}
                    className={`w-full mt-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all ${
                      !isCurrentNext
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : canAfford
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white active:scale-95'
                        : 'bg-red-950/60 border border-red-500/40 text-red-300 cursor-not-allowed'
                    }`}
                  >
                    {!isCurrentNext ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock Previous Land First</span>
                      </>
                    ) : !canAfford ? (
                      <span>Need {tier.cost.toLocaleString()} Coins</span>
                    ) : (
                      <>
                        <Maximize className="w-4 h-4" />
                        <span>PURCHASE EXPANSION ({tier.cost.toLocaleString()} 🪙)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
