import React from 'react';
import { X, Waves, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../services/audio';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-6 flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200">
        <div className="flex justify-end">
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

        <div className="flex flex-col items-center gap-2 -mt-4">
          <span className="text-4xl">🌊</span>
          <h2 className="text-2xl font-black font-['Fredoka'] text-amber-300">
            WATER PARK TYCOON
          </h2>
          <span className="px-3 py-0.5 rounded-full bg-sky-900/80 border border-sky-600/50 text-[11px] font-bold text-sky-200">
            Version 1.0.0 • Pure Offline Single-Player
          </span>
        </div>

        <div className="bg-sky-900/40 p-4 rounded-2xl border border-sky-800/60 text-xs text-sky-200 space-y-2 text-left">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Offline Single-Player Game</span>
          </div>
          <p className="text-[11px] text-sky-300 leading-relaxed">
            No accounts, no logins, no paywalls, and no network requests required. All game logic, simulation, audio synthesis, and procedural rendering run directly on your device.
          </p>

          <div className="pt-2 border-t border-sky-800/60 flex items-center gap-2 text-pink-300 font-bold">
            <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
            <span>Built with Modern Web Technologies</span>
          </div>
          <p className="text-[11px] text-sky-300 leading-relaxed">
            Powered by HTML5 2.5D Isometric Canvas Engine, procedural Web Audio API synthesizer, and responsive touch controls.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-transform"
        >
          BACK TO PARK
        </button>
      </div>
    </div>
  );
};
