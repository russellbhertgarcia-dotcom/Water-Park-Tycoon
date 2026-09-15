import React, { useState } from 'react';
import { X, Lock, Coins, TrendingUp, Users, Info } from 'lucide-react';
import { Category, BuildingDef } from '../types';
import { CATALOG, CATEGORY_INFO } from '../data/catalog';
import { sound } from '../services/audio';

interface BuildMenuProps {
  playerLevel: number;
  playerCoins: number;
  onSelectBuildingToBuild: (def: BuildingDef) => void;
  onClose: () => void;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  playerLevel,
  playerCoins,
  onSelectBuildingToBuild,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('pools');

  const categories: Category[] = [
    'pools',
    'slides',
    'food',
    'drinks',
    'shops',
    'decorations',
    'facilities',
    'paths',
    'special',
  ];

  const filteredItems = CATALOG.filter(item => item.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-sky-950 text-white rounded-t-3xl sm:rounded-3xl border-2 border-sky-400/50 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-sky-800 flex items-center justify-between bg-sky-900/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏗️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Fredoka'] tracking-wide">
                BUILD ATTRACTIONS
              </h2>
              <p className="text-xs text-sky-300">
                Select an attraction to place in your water park
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-sky-800/80 hover:bg-sky-700 text-sky-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 p-2.5 overflow-x-auto bg-sky-900/30 border-b border-sky-800/80 scrollbar-none">
          {categories.map(cat => {
            const info = CATEGORY_INFO[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                    : 'bg-sky-900/60 hover:bg-sky-800 text-sky-200'
                }`}
              >
                <span>{info.name}</span>
              </button>
            );
          })}
        </div>

        {/* Item List Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh]">
          {filteredItems.map(item => {
            const isLevelLocked = playerLevel < item.requiredLevel;
            const isAffordable = playerCoins >= item.cost;

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl p-3 border transition-all flex flex-col justify-between gap-2.5 ${
                  isLevelLocked
                    ? 'bg-slate-900/80 border-slate-700 opacity-60'
                    : 'bg-sky-900/50 hover:bg-sky-900/80 border-sky-600/40 shadow-lg'
                }`}
              >
                {/* Top: Name & Size */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0"
                      style={{ backgroundColor: item.themeColor }}
                    >
                      {item.category === 'pools' ? '🏊' :
                       item.category === 'slides' ? '🎢' :
                       item.category === 'food' ? '🍔' :
                       item.category === 'drinks' ? '🥤' :
                       item.category === 'shops' ? '🛍️' :
                       item.category === 'decorations' ? '🌴' :
                       item.category === 'facilities' ? '🛟' :
                       item.category === 'paths' ? '🛣️' : '⭐'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-sky-300">
                        Size: {item.width}x{item.height} tiles
                      </span>
                    </div>
                  </div>

                  {isLevelLocked ? (
                    <div className="px-2 py-0.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>LVL {item.requiredLevel}</span>
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-xs font-black flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-sky-200 line-clamp-2">
                  {item.description}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-[11px] text-sky-300 bg-sky-950/50 p-2 rounded-xl border border-sky-800/40">
                  {item.baseIncome > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+{item.baseIncome} 🪙</span>
                    </div>
                  )}
                  {item.capacity > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>Cap: {item.capacity}</span>
                    </div>
                  )}
                  {item.popularity > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">★</span>
                      <span>Pop: {item.popularity}%</span>
                    </div>
                  )}
                </div>

                {/* Build Button */}
                <button
                  disabled={isLevelLocked || !isAffordable}
                  onClick={() => {
                    sound.playClick();
                    onSelectBuildingToBuild(item);
                  }}
                  className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    isLevelLocked
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : !isAffordable
                      ? 'bg-red-900/60 text-red-300 border border-red-700/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white active:scale-[0.98]'
                  }`}
                >
                  {isLevelLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlocks at Level {item.requiredLevel}</span>
                    </>
                  ) : !isAffordable ? (
                    <>
                      <span>Need {item.cost.toLocaleString()} Coins</span>
                    </>
                  ) : (
                    <>
                      <span>BUILD ({item.cost.toLocaleString()} 🪙)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
