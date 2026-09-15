import { ParkState, GameSettings, StaffMember } from '../types';
import { INITIAL_QUESTS } from '../data/quests';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY = 'water_park_tycoon_save_v1';
const BACKUP_KEY = 'water_park_tycoon_save_backup_v1';

export const INITIAL_STAFF: Record<string, StaffMember> = {
  lifeguard: {
    id: 'lifeguard',
    name: 'Lifeguard',
    roleTitle: 'Pool Safety & Cheer',
    icon: 'LifeBuoy',
    count: 0,
    level: 1,
    baseCost: 350,
    effectDescription: 'Keeps swimmers safe, boosting pool visitor capacity and happiness by +15%.',
  },
  cleaner: {
    id: 'cleaner',
    name: 'Park Cleaner',
    roleTitle: 'Sanitation & Sweeping',
    icon: 'Sparkles',
    count: 0,
    level: 1,
    baseCost: 250,
    effectDescription: 'Automatically sweeps paths and disposes of dropped trash bottles and food wrappers.',
  },
  mechanic: {
    id: 'mechanic',
    name: 'Ride Mechanic',
    roleTitle: 'Slide & Pump Engineer',
    icon: 'Wrench',
    count: 0,
    level: 1,
    baseCost: 500,
    effectDescription: 'Maintains water pumps and slide hydraulics, boosting attraction ride speeds & income by +20%.',
  },
  cashier: {
    id: 'cashier',
    name: 'Food & Drink Cashier',
    roleTitle: 'Quick Service Clerk',
    icon: 'BadgeDollarSign',
    count: 0,
    level: 1,
    baseCost: 300,
    effectDescription: 'Speeds up food, drink and shop checkout times by +30%, increasing sales revenue.',
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  soundVolume: 0.8,
  isMuted: false,
  graphicsQuality: 'high',
  cameraSensitivity: 1.0,
  showVisitorNames: true,
  showFloatingCoins: true,
  cameraShake: true,
};

export const INITIAL_SAVE: ParkState = {
  parkName: 'Paradise Lagoon',
  coins: 500,
  gems: 5,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  parkRating: 1.0,
  buildings: [
    // Pre-seed with a starter path, a starter small pool, and an ice cream shack
    {
      uid: 'init_entrance_path_1',
      defId: 'path_stone',
      x: 7,
      y: 0,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_entrance_path_2',
      defId: 'path_stone',
      x: 8,
      y: 0,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_main_path_1',
      defId: 'path_stone',
      x: 7,
      y: 1,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_main_path_2',
      defId: 'path_stone',
      x: 8,
      y: 1,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_main_path_3',
      defId: 'path_stone',
      x: 7,
      y: 2,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_main_path_4',
      defId: 'path_stone',
      x: 8,
      y: 2,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_main_path_5',
      defId: 'path_stone',
      x: 7,
      y: 3,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_main_path_6',
      defId: 'path_stone',
      x: 8,
      y: 3,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_small_pool',
      defId: 'pool_small',
      x: 3,
      y: 2,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_palm_1',
      defId: 'decor_palm_tree',
      x: 2,
      y: 1,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
    {
      uid: 'init_trash_1',
      defId: 'decor_trash_bin',
      x: 6,
      y: 2,
      rotation: 0,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    },
  ],
  unlockedExpansions: 0,
  staff: INITIAL_STAFF,
  quests: INITIAL_QUESTS,
  achievements: INITIAL_ACHIEVEMENTS,
  dailyStreak: 0,
  lastDailyClaimDate: '',
  activeBoosts: [],
  totalVisitorsServed: 0,
  totalCoinsEarned: 0,
  totalTrashCleaned: 0,
  settings: DEFAULT_SETTINGS,
  lastSaveTimestamp: Date.now(),
};

export class SaveManager {
  public static saveGame(state: ParkState): boolean {
    try {
      const data = JSON.stringify({
        ...state,
        lastSaveTimestamp: Date.now(),
      });
      localStorage.setItem(STORAGE_KEY, data);
      // Periodic backup
      if (Math.random() < 0.2) {
        localStorage.setItem(BACKUP_KEY, data);
      }
      return true;
    } catch (e) {
      console.error('Failed to save game locally:', e);
      return false;
    }
  }

  public static loadGame(): ParkState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ParkState;
        if (parsed && typeof parsed.coins === 'number' && Array.isArray(parsed.buildings)) {
          // Merge with any new quests or achievements that might have been added
          const existingQuestIds = new Set(parsed.quests?.map(q => q.id) || []);
          const mergedQuests = [
            ...(parsed.quests || []),
            ...INITIAL_QUESTS.filter(q => !existingQuestIds.has(q.id)),
          ];

          const existingAchIds = new Set(parsed.achievements?.map(a => a.id) || []);
          const mergedAch = [
            ...(parsed.achievements || []),
            ...INITIAL_ACHIEVEMENTS.filter(a => !existingAchIds.has(a.id)),
          ];

          return {
            ...INITIAL_SAVE,
            ...parsed,
            nextLevelXp: parsed.nextLevelXp || Math.floor(100 * Math.pow(parsed.level || 1, 1.4)),
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
            staff: { ...INITIAL_STAFF, ...(parsed.staff || {}) },
            quests: mergedQuests,
            achievements: mergedAch,
          };
        }
      } catch (err) {
        console.warn('Corrupted primary save file, attempting backup recovery...', err);
        const backupRaw = localStorage.getItem(BACKUP_KEY);
        if (backupRaw) {
          try {
            const backupParsed = JSON.parse(backupRaw) as ParkState;
            if (backupParsed && typeof backupParsed.coins === 'number') {
              return { ...INITIAL_SAVE, ...backupParsed };
            }
          } catch {
            console.error('Backup save also corrupted.');
          }
        }
      }
    }
    // Return brand new state if no save exists or both corrupted
    return JSON.parse(JSON.stringify(INITIAL_SAVE));
  }

  public static calculateOfflineEarnings(state: ParkState): { coinsEarned: number; minutesAway: number } {
    if (!state.lastSaveTimestamp) return { coinsEarned: 0, minutesAway: 0 };
    const diffMs = Date.now() - state.lastSaveTimestamp;
    const minutesAway = Math.floor(diffMs / (1000 * 60));
    if (minutesAway < 1) return { coinsEarned: 0, minutesAway: 0 };
    const cappedMinutes = Math.min(480, minutesAway);
    const coinsPerMin = Math.max(5, state.buildings.length * 4);
    const coinsEarned = Math.floor(coinsPerMin * cappedMinutes);
    return { coinsEarned, minutesAway };
  }

  public static loadSave(): ParkState {
    return SaveManager.loadGame();
  }

  public static resetSave(): ParkState {
    return SaveManager.resetGame();
  }

  public static resetGame(): ParkState {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    return JSON.parse(JSON.stringify(INITIAL_SAVE));
  }

  public static exportSave(): string {
    const data = localStorage.getItem(STORAGE_KEY);
    return data || JSON.stringify(INITIAL_SAVE);
  }

  public static importSave(jsonString: string): ParkState | null {
    try {
      const parsed = JSON.parse(jsonString) as ParkState;
      if (parsed && typeof parsed.coins === 'number' && Array.isArray(parsed.buildings)) {
        SaveManager.saveGame(parsed);
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }
}
