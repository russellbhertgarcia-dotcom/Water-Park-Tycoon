import React from 'react';
import { Hammer, ShoppingBag, Gift, ClipboardList, Users, Trophy, Settings } from 'lucide-react';
import { sound } from '../services/audio';

interface BottomNavProps {
  onOpenBuild: () => void;
  onOpenShop: () => void;
  onOpenDaily: () => void;
  onOpenQuests: () => void;
  onOpenStaff: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  hasAvailableDaily: boolean;
  claimableQuestsCount: number;
  claimableAchievementsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenBuild,
  onOpenShop,
  onOpenDaily,
  onOpenQuests,
  onOpenStaff,
  onOpenAchievements,
  onOpenSettings,
  hasAvailableDaily,
  claimableQuestsCount,
  claimableAchievementsCount,
}) => {
  const navItems = [
    {
      id: 'build',
      label: 'BUILD',
      icon: Hammer,
      onClick: onOpenBuild,
      isPrimary: true,
      color: 'from-amber-400 to-orange-500',
      badge: 0,
    },
    {
      id: 'shop',
      label: 'SHOP',
      icon: ShoppingBag,
      onClick: onOpenShop,
      color: 'from-sky-400 to-blue-500',
      badge: 0,
    },
    {
      id: 'daily',
      label: 'DAILY',
      icon: Gift,
      onClick: onOpenDaily,
      color: 'from-pink-500 to-rose-500',
      badge: hasAvailableDaily ? 1 : 0,
    },
    {
      id: 'quests',
      label: 'QUESTS',
      icon: ClipboardList,
      onClick: onOpenQuests,
      color: 'from-emerald-400 to-teal-600',
      badge: claimableQuestsCount,
    },
    {
      id: 'staff',
      label: 'STAFF',
      icon: Users,
      onClick: onOpenStaff,
      color: 'from-indigo-400 to-violet-600',
      badge: 0,
    },
    {
      id: 'trophies',
      label: 'TROPHIES',
      icon: Trophy,
      onClick: onOpenAchievements,
      color: 'from-yellow-400 to-amber-600',
      badge: claimableAchievementsCount,
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: Settings,
      onClick: onOpenSettings,
      color: 'from-slate-600 to-slate-800',
      badge: 0,
    },
  ];

  return (
    <nav className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none z-30 select-none pb-safe">
      <div className="pointer-events-auto bg-sky-950/85 backdrop-blur-xl border border-sky-400/40 rounded-3xl p-1.5 sm:p-2 shadow-2xl flex items-center justify-between gap-1 sm:gap-2 max-w-full overflow-x-auto scrollbar-none">
        {navItems.map(item => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  item.onClick();
                }}
                className="relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-[0_4px_0_#9a3412] active:translate-y-0.5 active:shadow-[0_2px_0_#9a3412] flex items-center gap-1.5 border border-amber-200 uppercase font-['Fredoka'] tracking-wide shrink-0 transition-transform"
              >
                <Icon className="w-5 h-5 fill-white stroke-orange-950" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                item.onClick();
              }}
              className="relative p-2 sm:px-3 sm:py-2 rounded-2xl hover:bg-sky-900/60 active:bg-sky-800/80 text-sky-100 flex flex-col items-center justify-center gap-0.5 min-w-[48px] sm:min-w-[56px] shrink-0 active:scale-95 transition-all"
            >
              <div className="relative">
                <Icon className="w-5 h-5 text-sky-200" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white font-extrabold text-[10px] flex items-center justify-center border border-white animate-bounce shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-300 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
