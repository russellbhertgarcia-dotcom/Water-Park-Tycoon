import React from 'react';
import { RotateCw, Check, X, AlertCircle } from 'lucide-react';
import { BuildingDef } from '../types';
import { sound } from '../services/audio';

interface PlacementControlsProps {
  buildingDef: BuildingDef;
  isValid: boolean;
  onRotate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PlacementControls: React.FC<PlacementControlsProps> = ({
  buildingDef,
  isValid,
  onRotate,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-3 px-4 pointer-events-none select-none">
      {/* Placement Status Banner */}
      <div
        className={`pointer-events-auto px-4 py-2 rounded-2xl backdrop-blur-md border shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold transition-all ${
          isValid
            ? 'bg-emerald-950/85 border-emerald-400 text-emerald-200'
            : 'bg-red-950/85 border-red-400 text-red-200'
        }`}
      >
        {isValid ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Tap green tiles or press ✓ to place {buildingDef.name}</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>Invalid placement area (blocked or out of bounds)</span>
          </>
        )}
      </div>

      {/* Control Buttons */}
      <div className="pointer-events-auto flex items-center gap-3 bg-sky-950/90 backdrop-blur-xl p-2 rounded-3xl border-2 border-sky-400/50 shadow-2xl">
        {/* Rotate Button */}
        <button
          onClick={() => {
            sound.playClick();
            onRotate();
          }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black shadow-lg flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform border border-sky-300"
          title="Rotate (R)"
        >
          <RotateCw className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Rotate</span>
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => {
            sound.playClick();
            onCancel();
          }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white font-black shadow-lg flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform border border-red-300"
          title="Cancel (Esc)"
        >
          <X className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Cancel</span>
        </button>

        {/* Confirm Placement Button */}
        <button
          disabled={!isValid}
          onClick={() => {
            if (isValid) {
              sound.playBuild();
              onConfirm();
            }
          }}
          className={`px-6 h-14 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all border ${
            isValid
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white border-emerald-300 active:scale-95'
              : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
          title="Confirm Place (Click/Tap)"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>Place ({buildingDef.cost} 🪙)</span>
        </button>
      </div>

      <div className="text-[11px] text-white/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
        Desktop: [R] Rotate • [Left Click] Place • [Right Click/Esc] Cancel
      </div>
    </div>
  );
};
