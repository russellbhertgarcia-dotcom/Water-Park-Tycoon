import React, { useState } from 'react';
import { X, ShoppingBag, Zap, Users, Sparkles, Trophy, Coins, Check } from 'lucide-react';
import { sound } from '../services/audio';

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
  type: 'boost' | 'special';
  durationMinutes?: number;
  multiplier?: number;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'boost_starter',
    name: 'STARTER BOOST',
    cost: 500,
    description: 'Instant booster pack granting +1,000 bonus coins and +5 shiny gems!',
    icon: '⚡',
    type: 'boost',
  },
  {
    id: 'boost_double_income',
    name: 'DOUBLE INCOME BOOST',
    cost: 2500,
    description: 'Doubles all income earned from attractions, food, and shops for 5 minutes!',
    icon: '🪙',
    type: 'boost',
    durationMinutes: 5,
    multiplier: 2,
  },
  {
    id: 'boost_visitor_surge',
    name: 'VISITOR BOOST',
    cost: 5000,
    description: 'Supercharges entrance advertising! Spawns +50% more visitors for 5 minutes.',
    icon: '👥',
    type: 'boost',
    durationMinutes: 5,
    multiplier: 1.5,
  },
  {
    id: 'boost_lucky_park',
    name: 'LUCKY PARK BOOST',
    cost: 10000,
    description: 'Attracts affluent VIP visitors who spend double and leave generous tips for 5 minutes.',
    icon: '✨',
    type: 'boost',
    durationMinutes: 5,
    multiplier: 2.5,
  },
  {
    id: 'boost_mega_income',
    name: 'MEGA INCOME BOOST',
    cost: 25000,
    description: 'Massive 3X multiplier on all park revenue for 10 minutes of pure tycoon frenzy!',
    icon: '🚀',
    type: 'boost',
    durationMinutes: 10,
    multiplier: 3,
  },
  {
    id: 'special_decoration_golden',
    name: 'SPECIAL DECORATION',
    cost: 50000,
    description: 'Unlocks the prestigious Golden Poseidon Fountain monument (+1000 passive income).',
    icon: '👑',
    type: 'special',
  },
];

interface CoinShopModalProps {
  playerCoins: number;
  onBuyItem: (item: ShopItem) => void;
  onClose: () => void;
}

export const CoinShopModal: React.FC<CoinShopModalProps> = ({
  playerCoins,
  onBuyItem,
  onClose,
}) => {
  const [selectedItemToConfirm, setSelectedItemToConfirm] = useState<ShopItem | null>(null);

  const handleConfirmPurchase = () => {
    if (!selectedItemToConfirm) return;
    if (playerCoins >= selectedItemToConfirm.cost) {
      sound.playPurchase();
      onBuyItem(selectedItemToConfirm);
      setSelectedItemToConfirm(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sky-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Fredoka'] tracking-wide">
                COIN SHOP
              </h2>
              <p className="text-xs text-sky-300">
                Purchase boosts & special upgrades with in-game coins (100% free)
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

        {/* Current Balance Banner */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-sky-900/50 border border-sky-700/50 text-xs">
          <span className="text-sky-200 font-semibold">Your Current Balance:</span>
          <span className="text-amber-300 font-black text-sm font-mono flex items-center gap-1">
            🪙 {playerCoins.toLocaleString()} Coins
          </span>
        </div>

        {/* Shop Items List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
          {SHOP_ITEMS.map(item => {
            const canAfford = playerCoins >= item.cost;

            return (
              <div
                key={item.id}
                className="bg-sky-900/40 hover:bg-sky-900/70 p-3.5 rounded-2xl border border-sky-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-950 flex items-center justify-center text-2xl border border-sky-700/50 shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-sm text-white font-['Fredoka']">
                      {item.name}
                    </h3>
                    <p className="text-xs text-sky-200 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => {
                    sound.playClick();
                    setSelectedItemToConfirm(item);
                  }}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-md ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-4 h-4 text-amber-300" />
                  <span>{item.cost.toLocaleString()} 🪙</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Confirmation Modal */}
        {selectedItemToConfirm && (
          <div
            onClick={() => setSelectedItemToConfirm(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 animate-in zoom-in-95"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-sky-950 p-6 rounded-3xl border-2 border-amber-400 text-center flex flex-col items-center gap-3.5 shadow-2xl max-w-xs w-full"
            >
              <span className="text-4xl">{selectedItemToConfirm.icon}</span>
              <h3 className="text-lg font-black font-['Fredoka'] text-amber-300">
                PURCHASE?
              </h3>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-sky-300 uppercase tracking-wider">Item</span>
                <span className="font-black text-sm text-white">{selectedItemToConfirm.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-sky-300 uppercase tracking-wider">Cost</span>
                <span className="font-black text-xl text-amber-300 font-mono">
                  {selectedItemToConfirm.cost.toLocaleString()} 🪙
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedItemToConfirm(null);
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-transform"
                >
                  BUY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
