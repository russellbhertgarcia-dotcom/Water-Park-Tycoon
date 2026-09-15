import React from 'react';
import { X, Star, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { sound } from '../services/audio';

interface RatingBreakdownProps {
  parkRating: number;
  cleanlinessScore: number;
  varietyScore: number;
  decorationsScore: number;
  staffScore: number;
  onClose: () => void;
}

export const RatingBreakdownModal: React.FC<RatingBreakdownProps> = ({
  parkRating,
  cleanlinessScore,
  varietyScore,
  decorationsScore,
  staffScore,
  onClose,
}) => {
  const factors = [
    {
      name: 'Cleanliness',
      score: cleanlinessScore,
      icon: '🧹',
      tip: cleanlinessScore < 70 ? 'Clean up litter or hire more Cleaners!' : 'Park grounds are sparkling clean!',
    },
    {
      name: 'Attraction Variety',
      score: varietyScore,
      icon: '🎢',
      tip: varietyScore < 70 ? 'Build different categories (slides, food, shops).' : 'Great diverse mix of rides and amenities!',
    },
    {
      name: 'Decorations & Atmosphere',
      score: decorationsScore,
      icon: '🌴',
      tip: decorationsScore < 60 ? 'Plant palm trees, flowers, and fountains.' : 'Tropical ambiance looks gorgeous!',
    },
    {
      name: 'Staff & Safety',
      score: staffScore,
      icon: '🛟',
      tip: staffScore < 60 ? 'Hire and train lifeguards and mechanics!' : 'Staff team provides top safety and service!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-sky-950 text-white rounded-3xl border-2 border-amber-400/60 shadow-2xl p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            <div>
              <h2 className="text-xl font-black font-['Fredoka'] text-amber-300">
                PARK RATING
              </h2>
              <p className="text-xs text-sky-200">
                Current score: {parkRating.toFixed(1)} / 5.0 Stars
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

        {/* Big Star Display */}
        <div className="bg-sky-900/50 p-3.5 rounded-2xl border border-sky-700/50 flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-center gap-1 text-3xl">
            {[1, 2, 3, 4, 5].map(starNum => (
              <span
                key={starNum}
                className={
                  starNum <= Math.floor(parkRating)
                    ? 'text-amber-400'
                    : starNum - 0.5 <= parkRating
                    ? 'text-amber-300 opacity-80'
                    : 'text-slate-600'
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs font-bold text-sky-200">
            {parkRating >= 4.5
              ? 'World-Class Tropical Resort!'
              : parkRating >= 3.5
              ? 'Popular & Thriving Park!'
              : 'Growing Neighborhood Water Park'}
          </span>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-2.5">
          {factors.map(f => (
            <div key={f.name} className="bg-sky-900/30 p-2.5 rounded-xl border border-sky-800/50 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span>{f.icon}</span>
                  <span className="text-white">{f.name}</span>
                </span>
                <span className="text-amber-300 font-mono">{f.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-sky-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
                  style={{ width: `${f.score}%` }}
                />
              </div>
              <span className="text-[10px] text-sky-300 flex items-center gap-1 mt-0.5">
                {f.score >= 70 ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                )}
                <span>{f.tip}</span>
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-transform"
        >
          GOT IT!
        </button>
      </div>
    </div>
  );
};
