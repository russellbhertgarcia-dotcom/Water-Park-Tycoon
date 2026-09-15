import React, { useState } from 'react';
import { X, ArrowUpCircle, Trash2, Move, Coins, TrendingUp, Users, Star } from 'lucide-react';
import { PlacedBuilding } from '../types';
import { CATALOG_MAP } from '../data/catalog';
import { sound } from '../services/audio';

interface BuildingDrawerProps {
  building: PlacedBuilding;
  playerCoins: number;
  onUpgrade: (buildingUid: string) => void;
  onMove: (building: PlacedBuilding) => void;
  onDemolish: (buildingUid: string) => void;
  onClose: () => void;
}

export const BuildingDrawer: React.FC<BuildingDrawerProps> = ({
  building,
  playerCoins,
  onUpgrade,
  onMove,
  onDemolish,
  onClose,
}) => {
  const [showDemolishConfirm, setShowDemolishConfirm] = useState(false);
  const def = CATALOG_MAP.get(building.defId);
  if (!def) return null;

  // Upgrade calculations
  const currentIncome = Math.floor(def.baseIncome * (1 + (building.level - 1) * 0.6));
  const nextIncome = Math.floor(def.baseIncome * (1 + building.level * 0.6));
  const upgradeCost = Math.floor(def.cost * building.level * 1.4);
  const refundAmount = Math.floor(def.cost * 0.5 * building.level);

  const canAffordUpgrade = playerCoins >= upgradeCost;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-sky-950 text-white rounded-t-3xl sm:rounded-3xl border-2 border-sky-400/60 shadow-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
              style={{ backgroundColor: def.themeColor }}
            >
              {def.category === 'pools' ? '🏊' :
               def.category === 'slides' ? '🎢' :
               def.category === 'food' ? '🍔' :
               def.category === 'drinks' ? '🥤' :
               def.category === 'shops' ? '🛍️' :
               def.category === 'decorations' ? '🌴' :
               def.category === 'facilities' ? '🛟' : '⭐'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-['Fredoka']">{def.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-xs">
                  LVL {building.level}
                </span>
              </div>
              <p className="text-xs text-sky-300 capitalize">{def.category}</p>
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

        {/* Stats Card */}
        <div className="bg-sky-900/50 rounded-2xl p-3.5 border border-sky-700/50 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-sky-950/60 p-2.5 rounded-xl border border-sky-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-sky-300 block">Income</span>
                <span className="font-bold text-white">+{currentIncome} 🪙/visitor</span>
              </div>
            </div>

            <div className="bg-sky-950/60 p-2.5 rounded-xl border border-sky-800 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-sky-300 block">Total Earned</span>
                <span className="font-bold text-amber-300 font-mono">
                  {building.totalEarned.toLocaleString()} 🪙
                </span>
              </div>
            </div>

            {def.capacity > 0 && (
              <div className="bg-sky-950/60 p-2.5 rounded-xl border border-sky-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-[10px] text-sky-300 block">Capacity</span>
                  <span className="font-bold text-white">{def.capacity + (building.level - 1) * 2}</span>
                </div>
              </div>
            )}

            {def.popularity > 0 && (
              <div className="bg-sky-950/60 p-2.5 rounded-xl border border-sky-800 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div>
                  <span className="text-[10px] text-sky-300 block">Popularity</span>
                  <span className="font-bold text-white">{def.popularity}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Section */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-3.5 border border-amber-400/40 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-200">
              Upgrade to Level {building.level + 1}
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold">
              Income: +{currentIncome} ➜ +{nextIncome} 🪙
            </span>
          </div>

          <button
            disabled={!canAffordUpgrade}
            onClick={() => {
              if (canAffordUpgrade) {
                sound.playUpgrade();
                onUpgrade(building.uid);
              }
            }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all ${
              canAffordUpgrade
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white active:scale-95'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>{upgradeCost.toLocaleString()} 🪙</span>
          </button>
        </div>

        {/* Action Buttons: Move & Demolish */}
        {showDemolishConfirm ? (
          <div className="bg-rose-950/80 p-3 rounded-2xl border border-rose-500/60 flex items-center justify-between gap-2">
            <span className="text-xs text-rose-200 font-semibold">
              Demolish and refund {refundAmount} 🪙?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDemolishConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onDemolish(building.uid);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black"
              >
                Confirm Sell
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onMove(building);
              }}
              className="flex-1 py-2.5 rounded-xl bg-sky-800/80 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Move className="w-4 h-4" />
              <span>Relocate</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowDemolishConfirm(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Demolish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
