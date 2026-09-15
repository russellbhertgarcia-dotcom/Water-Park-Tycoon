import React from 'react';
import { X, ClipboardList, CheckCircle2, Coins, Sparkles } from 'lucide-react';
import { Quest } from '../types';
import { sound } from '../services/audio';

interface QuestsModalProps {
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ quests, onClaimQuest, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sky-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Fredoka'] tracking-wide">
                PARK QUESTS
              </h2>
              <p className="text-xs text-sky-300">
                Complete park management milestones for coins and XP!
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

        {/* Quests List */}
        <div className="overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
          {quests.map(quest => {
            const isCompleted = quest.currentCount >= quest.targetCount;
            const progressPercent = Math.min(100, Math.floor((quest.currentCount / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  quest.isClaimed
                    ? 'bg-sky-950/40 border-sky-900 opacity-60'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-sky-900/40 border-sky-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-white font-['Fredoka']">
                      {quest.title}
                    </h3>
                    <p className="text-xs text-sky-200">{quest.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      +{quest.rewardCoins}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-sky-400/20 text-sky-300 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{quest.rewardXp} XP
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-bold text-sky-300">
                      <span>Progress</span>
                      <span>
                        {quest.currentCount} / {quest.targetCount}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-sky-950 overflow-hidden border border-sky-800/60">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                            : 'bg-gradient-to-r from-sky-400 to-blue-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Claim Button or Status */}
                  {quest.isClaimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-sky-900 text-sky-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Claimed</span>
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => {
                        sound.playReward();
                        onClaimQuest(quest.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-transform animate-pulse"
                    >
                      CLAIM
                    </button>
                  ) : (
                    <span className="text-xs text-sky-400/80 font-semibold px-2">
                      In Progress
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
