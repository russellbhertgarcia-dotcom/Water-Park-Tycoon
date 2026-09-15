import React, { useState, useEffect } from 'react';
import { X, Gift, Check, Lock, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/audio';

interface DailyRewardModalProps {
  currentStreak: number;
  lastClaimDate: string;
  onClaimReward: (day: number, coins: number, specialBonus?: string) => void;
  onClose: () => void;
  onEnterPark?: () => void;
}

const REWARDS = [
  { day: 1, coins: 100, label: '100 Coins', icon: '🪙' },
  { day: 2, coins: 250, label: '250 Coins', icon: '🪙' },
  { day: 3, coins: 500, label: '500 Coins', icon: '🪙' },
  { day: 4, coins: 750, label: '750 Coins', icon: '🪙' },
  { day: 5, coins: 1500, label: '1,500 Coins', icon: '💰' },
  { day: 6, coins: 3000, label: '3,000 Coins', icon: '💎' },
  {
    day: 7,
    coins: 10000,
    label: '10,000 Coins + Golden Fountain',
    specialItem: 'special_golden_fountain',
    icon: '👑',
  },
];

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  currentStreak,
  lastClaimDate,
  onClaimReward,
  onClose,
  onEnterPark,
}) => {
  const [claimedReward, setClaimedReward] = useState<{
    day: number;
    coins: number;
    specialItem?: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = lastClaimDate === todayStr || claimedReward !== null;

  // Active day in cycle (1 to 7)
  const activeDay = (currentStreak % 7) + 1;

  // Listen for Escape key to close modal safely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleClaim = (dayItem: (typeof REWARDS)[0]) => {
    if (isClaimedToday) return;

    // 1. Play joyful celebratory sound
    try {
      sound.playDailyRewardFanfare();
    } catch {
      // Audio fallback
    }

    // 2. Burst confetti
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#facc15', '#f43f5e', '#34d399', '#a855f7'],
      });
    } catch {
      // Confetti fallback
    }

    // 3. Mark state & invoke parent handler
    setClaimedReward({
      day: dayItem.day,
      coins: dayItem.coins,
      specialItem: dayItem.specialItem,
    });
    onClaimReward(dayItem.day, dayItem.coins, dayItem.specialItem);
  };

  return (
    <>
      {/* Main Daily Rewards Modal Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black font-['Fredoka'] tracking-wide">
                  DAILY REWARDS
                </h2>
                <p className="text-xs text-sky-300">
                  Log in every local day to claim free coins & prizes!
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

          {/* Streak Status */}
          <div className="bg-sky-900/40 p-3 rounded-2xl border border-sky-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">🔥</span>
              <div>
                <span className="text-sky-300 block">Current Streak</span>
                <span className="font-black text-amber-300 text-sm">
                  {claimedReward ? currentStreak : currentStreak} Days
                </span>
              </div>
            </div>

            {isClaimedToday ? (
              <div className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Claimed Today!</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-xl bg-pink-500/30 border border-pink-400/60 text-pink-200 text-xs font-bold animate-pulse flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Reward Ready!</span>
              </div>
            )}
          </div>

          {/* 7 Daily Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {REWARDS.map(item => {
              const isJustClaimed = claimedReward?.day === item.day;
              const isPastClaimed =
                isJustClaimed ||
                (isClaimedToday && item.day <= activeDay) ||
                (!isClaimedToday && item.day < activeDay);
              const isCurrentAvailable = !isClaimedToday && item.day === activeDay;
              const isDay7 = item.day === 7;

              return (
                <div
                  key={item.day}
                  className={`relative rounded-2xl p-3 border transition-all flex flex-col items-center justify-between gap-2 text-center ${
                    isJustClaimed
                      ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] scale-[1.02]'
                      : isDay7
                      ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/30 border-amber-400/70'
                      : isCurrentAvailable
                      ? 'bg-gradient-to-b from-pink-500/25 to-rose-500/25 border-pink-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.02]'
                      : isPastClaimed
                      ? 'bg-sky-950/40 border-sky-800/40 opacity-75'
                      : 'bg-slate-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black text-sky-200 uppercase font-['Fredoka']">
                      DAY {item.day}
                    </span>
                    {isPastClaimed ? (
                      <span className="text-emerald-400 text-xs font-bold">✅</span>
                    ) : isCurrentAvailable ? (
                      <span className="text-yellow-300 text-xs animate-bounce">🎁</span>
                    ) : (
                      <Lock className="w-3 h-3 text-slate-500" />
                    )}
                  </div>

                  <span className="text-3xl my-1">{item.icon}</span>

                  <div className="flex flex-col items-center">
                    <span className="font-extrabold text-xs text-white">
                      +{item.coins.toLocaleString()} 🪙
                    </span>
                    {item.specialItem && (
                      <span className="text-[10px] text-amber-300 font-bold mt-0.5 flex items-center gap-0.5">
                        <Trophy className="w-3 h-3" /> Special Fountain
                      </span>
                    )}
                  </div>

                  {/* Card Button */}
                  {isCurrentAvailable ? (
                    <button
                      onClick={() => handleClaim(item)}
                      className="w-full mt-1 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-transform"
                    >
                      CLAIM
                    </button>
                  ) : (
                    <span
                      className={`text-[10px] font-bold mt-1 ${
                        isPastClaimed ? 'text-emerald-400' : 'text-sky-400/70'
                      }`}
                    >
                      {isPastClaimed ? 'CLAIMED' : 'LOCKED'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Celebratory bottom banner if just claimed or claimed today */}
          {claimedReward ? (
            <div className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <div className="text-emerald-300 font-black text-sm font-['Fredoka'] flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>+{claimedReward.coins.toLocaleString()} COINS ADDED!</span>
                </div>
                <div className="text-xs text-sky-200">
                  {claimedReward.specialItem
                    ? '⭐ Unlocked Golden Poseidon Fountain!'
                    : 'Come back tomorrow to keep your daily streak alive!'}
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-transform shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isClaimedToday ? (
            <div className="w-full bg-sky-900/30 border border-sky-800/50 rounded-2xl p-3 flex items-center justify-between">
              <span className="text-xs text-sky-300 font-medium">
                Next reward unlocks tomorrow!
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs uppercase active:scale-95 transition-transform"
              >
                CLOSE
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Top-Level Celebratory Toast Overlay (Sibling to modal, so it is never trapped) */}
      {claimedReward && (
        <div
          onClick={() => {
            sound.playClick();
            setClaimedReward(null);
            onClose();
          }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-150 select-none"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-sky-950 p-6 rounded-3xl border-2 border-amber-400 text-center flex flex-col items-center gap-3.5 shadow-2xl max-w-xs w-full"
          >
            <span className="text-5xl animate-bounce">🎉</span>
            <div>
              <h3 className="text-xl font-black font-['Fredoka'] text-amber-300 uppercase">
                DAILY REWARD CLAIMED!
              </h3>
              <p className="text-xs text-sky-200 mt-0.5">
                Day {claimedReward.day} bonus collected
              </p>
            </div>

            <div className="py-2 px-5 rounded-2xl bg-sky-900/60 border border-amber-400/40">
              <span className="text-2xl font-black text-amber-300 font-mono">
                +{claimedReward.coins.toLocaleString()} 🪙
              </span>
            </div>

            {claimedReward.specialItem && (
              <div className="text-xs text-yellow-300 font-bold bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/40">
                ⭐ Golden Poseidon Fountain Unlocked!
              </div>
            )}

            {onEnterPark ? (
              <div className="w-full flex flex-col gap-2 mt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setClaimedReward(null);
                    onEnterPark();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <span>ENTER WATER PARK</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setClaimedReward(null);
                    onClose();
                  }}
                  className="w-full py-2 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-bold text-xs uppercase"
                >
                  BACK TO MENU
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setClaimedReward(null);
                  onClose();
                }}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span>AWESOME! CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
