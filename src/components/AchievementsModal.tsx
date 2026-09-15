import React from 'react';
import { X, Trophy, CheckCircle2, Coins, Sparkles } from 'lucide-react';
import { Achievement } from '../types';
import { sound } from '../services/audio';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClaimAchievement: (achievementId: string) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClaimAchievement,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sky-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Fredoka'] tracking-wide">
                ACHIEVEMENTS
              </h2>
              <p className="text-xs text-sky-300">
                Unlock milestones to earn coins and prestigious gems!
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

        {/* Achievements List */}
        <div className="overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
          {achievements.map(ach => {
            const isCompleted = ach.currentCount >= ach.targetCount;
            const progressPercent = Math.min(100, Math.floor((ach.currentCount / ach.targetCount) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  ach.isClaimed
                    ? 'bg-sky-950/40 border-sky-900 opacity-60'
                    : isCompleted
                    ? 'bg-amber-950/40 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                    : 'bg-sky-900/40 border-sky-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-white font-['Fredoka']">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-sky-200">{ach.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      +{ach.rewardCoins}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-fuchsia-400/20 text-fuchsia-300 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{ach.rewardGems} 💎
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Claim Button */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-bold text-sky-300">
                      <span>Progress</span>
                      <span>
                        {ach.currentCount.toLocaleString()} / {ach.targetCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-sky-950 overflow-hidden border border-sky-800/60">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                            : 'bg-gradient-to-r from-sky-400 to-blue-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {ach.isClaimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-sky-900 text-sky-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Claimed</span>
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => {
                        sound.playReward();
                        onClaimAchievement(ach.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-transform animate-pulse"
                    >
                      CLAIM
                    </button>
                  ) : (
                    <span className="text-xs text-sky-400/80 font-semibold px-2">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
