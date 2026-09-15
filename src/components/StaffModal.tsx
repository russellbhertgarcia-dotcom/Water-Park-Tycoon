import React from 'react';
import { X, Users, ArrowUpCircle, UserPlus, Coins } from 'lucide-react';
import { StaffMember } from '../types';
import { sound } from '../services/audio';

interface StaffModalProps {
  staff: Record<string, StaffMember>;
  playerCoins: number;
  onHireStaff: (staffId: string) => void;
  onUpgradeStaff: (staffId: string) => void;
  onClose: () => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  staff,
  playerCoins,
  onHireStaff,
  onUpgradeStaff,
  onClose,
}) => {
  const staffList: StaffMember[] = Object.values(staff);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sky-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Fredoka'] tracking-wide">
                STAFF MANAGEMENT
              </h2>
              <p className="text-xs text-sky-300">
                Hire and train workers to automate and upgrade your park
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

        {/* Staff Members List */}
        <div className="overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
          {staffList.map(member => {
            const hireCost = member.baseCost * (member.count + 1);
            const trainCost = member.baseCost * member.level * 1.5;
            const canAffordHire = playerCoins >= hireCost;
            const canAffordTrain = playerCoins >= trainCost;

            return (
              <div
                key={member.id}
                className="bg-sky-900/40 p-3.5 rounded-2xl border border-sky-800/60 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-950 flex items-center justify-center text-2xl border border-sky-700/50 shrink-0">
                      {member.id === 'lifeguard' ? '🛟' :
                       member.id === 'cleaner' ? '🧹' :
                       member.id === 'mechanic' ? '🔧' : '🍔'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-white font-['Fredoka']">
                          {member.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-900/80 border border-indigo-400/40 text-indigo-200 text-[10px] font-black">
                          Count: {member.count}
                        </span>
                        {member.count > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black">
                            Level {member.level}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-sky-300 block">{member.roleTitle}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-sky-200 bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/40">
                  {member.effectDescription}
                </p>

                {/* Hire & Upgrade Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={!canAffordHire}
                    onClick={() => {
                      if (canAffordHire) {
                        sound.playPurchase();
                        onHireStaff(member.id);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md transition-all ${
                      canAffordHire
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Hire ({hireCost} 🪙)</span>
                  </button>

                  <button
                    disabled={member.count === 0 || !canAffordTrain}
                    onClick={() => {
                      if (member.count > 0 && canAffordTrain) {
                        sound.playUpgrade();
                        onUpgradeStaff(member.id);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md transition-all ${
                      member.count === 0
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : canAffordTrain
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Train ({trainCost} 🪙)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
