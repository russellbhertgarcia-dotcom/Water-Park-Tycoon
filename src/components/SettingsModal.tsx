import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Music, Sliders, Smartphone, RotateCcw, Download, Upload, Trash2 } from 'lucide-react';
import { GameSettings } from '../types';
import { sound } from '../services/audio';
import { DEFAULT_SETTINGS, SaveManager } from '../services/storage';

interface SettingsModalProps {
  settings: GameSettings;
  parkName: string;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onUpdateParkName: (name: string) => void;
  onResetPark: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  parkName,
  onUpdateSettings,
  onUpdateParkName,
  onResetPark,
  onClose,
}) => {
  const [editedName, setEditedName] = useState(parkName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [exportJson, setExportJson] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSoundVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newSettings = { ...settings, soundVolume: val };
    onUpdateSettings(newSettings);
    sound.setVolumes(newSettings.soundVolume, newSettings.musicVolume, newSettings.isMuted);
  };

  const handleMusicVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newSettings = { ...settings, musicVolume: val };
    onUpdateSettings(newSettings);
    sound.setVolumes(newSettings.soundVolume, newSettings.musicVolume, newSettings.isMuted);
  };

  const handleMuteToggle = () => {
    const newSettings = { ...settings, isMuted: !settings.isMuted };
    onUpdateSettings(newSettings);
    sound.setVolumes(newSettings.soundVolume, newSettings.musicVolume, newSettings.isMuted);
    sound.playClick();
  };

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ ...settings, cameraSensitivity: val });
  };

  const handleExport = () => {
    sound.playClick();
    const saveString = SaveManager.exportSave();
    setExportJson(saveString);
    navigator.clipboard?.writeText(saveString).catch(() => {});
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const restored = SaveManager.importSave(importText.trim());
    if (restored) {
      sound.playReward();
      setImportStatus('Save loaded successfully! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setImportStatus('Invalid save code. Please check and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-sky-950 text-white rounded-3xl border-2 border-sky-400/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-sky-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Fredoka'] tracking-wide">
                GAME SETTINGS
              </h2>
              <p className="text-xs text-sky-300">
                Audio, controls, offline backups & preferences
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

        {/* Settings Body */}
        <div className="overflow-y-auto space-y-4 pr-1 max-h-[60vh]">
          {/* Park Name */}
          <div className="bg-sky-900/40 p-3.5 rounded-2xl border border-sky-800/60 flex flex-col gap-2">
            <label className="text-xs text-sky-300 font-bold uppercase">Park Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editedName}
                maxLength={24}
                onChange={e => setEditedName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-sky-950 border border-sky-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateParkName(editedName);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs uppercase"
              >
                Save
              </button>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-sky-900/40 p-3.5 rounded-2xl border border-sky-800/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-300 font-bold uppercase">Audio Controls</span>
              <button
                onClick={handleMuteToggle}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  settings.isMuted
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-400'
                    : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                }`}
              >
                {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{settings.isMuted ? 'Muted' : 'Audio On'}</span>
              </button>
            </div>

            {/* Sound FX Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-sky-200">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" /> Sound Effects
                </span>
                <span>{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={handleSoundVolChange}
                className="accent-amber-400 w-full"
              />
            </div>

            {/* Music Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-sky-200">
                <span className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-sky-400" /> Tropical Background Music
                </span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={handleMusicVolChange}
                className="accent-amber-400 w-full"
              />
            </div>
          </div>

          {/* Gameplay & Visual Preferences */}
          <div className="bg-sky-900/40 p-3.5 rounded-2xl border border-sky-800/60 flex flex-col gap-3">
            <span className="text-xs text-sky-300 font-bold uppercase">Preferences</span>

            {/* Camera Sensitivity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-sky-200">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" /> Camera Sensitivity
                </span>
                <span>{settings.cameraSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.cameraSensitivity}
                onChange={handleSensitivityChange}
                className="accent-sky-400 w-full"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-sky-200">Show Visitor Names</span>
              <input
                type="checkbox"
                checked={settings.showVisitorNames}
                onChange={e =>
                  onUpdateSettings({ ...settings, showVisitorNames: e.target.checked })
                }
                className="w-4 h-4 accent-amber-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-200">Show Floating Coin Numbers</span>
              <input
                type="checkbox"
                checked={settings.showFloatingCoins}
                onChange={e =>
                  onUpdateSettings({ ...settings, showFloatingCoins: e.target.checked })
                }
                className="w-4 h-4 accent-amber-400"
              />
            </div>
          </div>

          {/* Backup & Save Migration */}
          <div className="bg-sky-900/40 p-3.5 rounded-2xl border border-sky-800/60 flex flex-col gap-2.5">
            <span className="text-xs text-sky-300 font-bold uppercase">Offline Data Backup</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="py-2 px-3 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Save</span>
              </button>

              <button
                onClick={() => setExportJson(null)}
                className="py-2 px-3 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Save</span>
              </button>
            </div>

            {exportJson && (
              <div className="bg-sky-950 p-2 rounded-xl text-[10px] text-sky-300 break-all border border-sky-800">
                <span className="font-bold text-amber-300 block mb-1">Save Copied to Clipboard!</span>
                <textarea
                  readOnly
                  value={exportJson}
                  className="w-full h-16 bg-transparent text-slate-300 resize-none font-mono focus:outline-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 mt-1">
              <textarea
                placeholder="Paste save code here to restore..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full h-14 p-2 rounded-xl bg-sky-950 border border-sky-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400 resize-none"
              />
              <button
                onClick={handleImport}
                className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase"
              >
                Load From Code
              </button>
              {importStatus && (
                <span className="text-[11px] text-amber-300 font-semibold">{importStatus}</span>
              )}
            </div>
          </div>

          {/* Reset Settings / Reset Park */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings(DEFAULT_SETTINGS);
                sound.setVolumes(DEFAULT_SETTINGS.soundVolume, DEFAULT_SETTINGS.musicVolume, DEFAULT_SETTINGS.isMuted);
              }}
              className="w-full py-2.5 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET SETTINGS TO DEFAULT</span>
            </button>

            {showResetConfirm ? (
              <div className="bg-rose-950/90 p-3.5 rounded-2xl border border-rose-500/70 flex flex-col gap-2">
                <span className="text-xs text-rose-200 font-bold">
                  ⚠️ This will erase all buildings, coins, and progress! Are you sure?
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onResetPark();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase"
                  >
                    Yes, Erase & Restart
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowResetConfirm(true);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>START NEW PARK (RESET SAVE)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
