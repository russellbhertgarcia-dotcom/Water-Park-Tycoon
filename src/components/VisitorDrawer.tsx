import React from 'react';
import { X, Smile, Utensils, Zap, Heart, Coins } from 'lucide-react';
import { Visitor } from '../types';
import { sound } from '../services/audio';

interface VisitorDrawerProps {
  visitor: Visitor;
  onClose: () => void;
}

export const VisitorDrawer: React.FC<VisitorDrawerProps> = ({ visitor, onClose }) => {
  const getBadgeStyle = () => {
    switch (visitor.type) {
      case 'VIP':
        return 'bg-amber-400 text-amber-950 border-amber-300';
      case 'ADVENTURER':
        return 'bg-orange-500 text-white border-orange-400';
      case 'CHILD':
        return 'bg-cyan-400 text-cyan-950 border-cyan-300';
      case 'FAMILY':
        return 'bg-emerald-500 text-white border-emerald-400';
      default:
        return 'bg-sky-500 text-white border-sky-400';
    }
  };

  const getStateDescription = () => {
    switch (visitor.state) {
      case 'entering':
        return 'Just entered the park with excitement!';
      case 'heading_to_attraction':
        return 'Walking towards a favorite attraction.';
      case 'in_queue':
        return 'Waiting eagerly in line.';
      case 'riding':
        return 'Splashing around and having a blast!';
      case 'eating':
        return 'Enjoying delicious food and refreshments.';
      case 'resting':
        return 'Laying back on a beach lounger catching sun.';
      case 'leaving':
        return 'Heading home after a fantastic day!';
      default:
        return 'Exploring the park walkways.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-sky-950 text-white rounded-t-3xl sm:rounded-3xl border-2 border-sky-400/60 shadow-2xl p-5 flex flex-col gap-3.5 animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20"
              style={{ backgroundColor: visitor.swimsuitColor }}
            >
              {visitor.type === 'VIP' ? '👑' : visitor.hasFloatie ? '🛟' : '🏊'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{visitor.name}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getBadgeStyle()}`}>
                {visitor.type}
              </span>
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

        {/* Thought Bubble */}
        <div className="bg-sky-900/60 p-3 rounded-2xl border border-sky-700/50 flex items-start gap-2">
          <span className="text-xl">💭</span>
          <div>
            <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider block">Current Thought</span>
            <p className="text-xs text-sky-100 italic">"{visitor.thought}"</p>
          </div>
        </div>

        {/* Activity Status */}
        <div className="bg-sky-950/70 p-2.5 rounded-xl border border-sky-800/60 text-xs text-sky-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>{getStateDescription()}</span>
        </div>

        {/* Needs & Satisfaction Bars */}
        <div className="flex flex-col gap-2 bg-sky-900/40 p-3 rounded-2xl border border-sky-800/40 text-xs">
          {/* Fun */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 w-20 text-sky-200">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span>Fun</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-sky-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all"
                style={{ width: `${Math.round(visitor.fun)}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono font-bold text-[11px]">
              {Math.round(visitor.fun)}%
            </span>
          </div>

          {/* Hunger */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 w-20 text-sky-200">
              <Utensils className="w-3.5 h-3.5 text-orange-400" />
              <span>Fullness</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-sky-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all"
                style={{ width: `${Math.round(visitor.hunger)}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono font-bold text-[11px]">
              {Math.round(visitor.hunger)}%
            </span>
          </div>

          {/* Energy */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 w-20 text-sky-200">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Energy</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-sky-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all"
                style={{ width: `${Math.round(visitor.energy)}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono font-bold text-[11px]">
              {Math.round(visitor.energy)}%
            </span>
          </div>

          {/* Overall Satisfaction */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-sky-800/60">
            <div className="flex items-center gap-1.5 w-20 text-sky-200">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="font-bold">Happy</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-sky-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all"
                style={{ width: `${Math.round(visitor.satisfaction)}%` }}
              />
            </div>
            <span className="w-8 text-right font-mono font-bold text-[11px] text-rose-300">
              {Math.round(visitor.satisfaction)}%
            </span>
          </div>
        </div>

        {/* Total Coins Spent */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-400/20 text-amber-200 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Coins Spent In Park:</span>
          </div>
          <span className="font-mono text-amber-300 text-sm">+{visitor.coinsSpent} 🪙</span>
        </div>
      </div>
    </div>
  );
};
