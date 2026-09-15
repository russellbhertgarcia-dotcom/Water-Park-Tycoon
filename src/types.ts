export type Category = 
  | 'pools'
  | 'slides'
  | 'food'
  | 'drinks'
  | 'shops'
  | 'decorations'
  | 'facilities'
  | 'paths'
  | 'special';

export interface BuildingDef {
  id: string;
  name: string;
  category: Category;
  width: number; // in grid cells
  height: number; // in grid cells
  cost: number;
  requiredLevel: number;
  baseIncome: number; // Coins per visitor or passive
  capacity: number;
  popularity: number; // 1-100
  description: string;
  themeColor: string;
  accentColor: string;
  iconName: string;
}

export interface PlacedBuilding {
  uid: string;
  defId: string;
  x: number; // grid coordinates
  y: number;
  rotation: 0 | 90 | 180 | 270;
  level: number;
  totalEarned: number;
  placedAt: number;
}

export type VisitorType = 'NORMAL' | 'FAMILY' | 'CHILD' | 'VIP' | 'ADVENTURER';

export type VisitorState = 
  | 'entering'
  | 'walking'
  | 'heading_to_attraction'
  | 'in_queue'
  | 'riding'
  | 'eating'
  | 'resting'
  | 'leaving';

export interface Visitor {
  id: string;
  name: string;
  type: VisitorType;
  x: number; // world continuous coords
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  state: VisitorState;
  targetBuildingUid?: string;
  activityTimer: number;
  swimsuitColor: string;
  floatieColor?: string;
  hasFloatie: boolean;
  // Needs (0-100)
  fun: number;
  hunger: number;
  energy: number;
  satisfaction: number;
  // Stats
  coinsSpent: number;
  thought: string;
  pathIndex: number;
  path: { x: number; y: number }[];
}

export interface TrashItem {
  id: string;
  x: number;
  y: number;
}

export interface StaffMember {
  id: 'lifeguard' | 'cleaner' | 'mechanic' | 'cashier';
  name: string;
  roleTitle: string;
  icon: string;
  count: number;
  level: number;
  baseCost: number;
  effectDescription: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardXp: number;
  isClaimed: boolean;
  type: 'build' | 'serve' | 'earn' | 'upgrade' | 'rating' | 'hire' | 'clean';
  targetCategory?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  currentCount: number;
  targetCount: number;
  rewardCoins: number;
  rewardGems: number;
  isClaimed: boolean;
}

export interface DailyRewardDay {
  day: number;
  coins: number;
  gems?: number;
  specialItem?: string;
}

export interface ActiveBoost {
  id: string;
  name: string;
  multiplier: number;
  expiresAt: number;
}

export interface GameSettings {
  musicVolume: number;
  soundVolume: number;
  isMuted: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
  cameraSensitivity: number;
  showVisitorNames: boolean;
  showFloatingCoins: boolean;
  cameraShake: boolean;
}

export interface ParkState {
  parkName: string;
  coins: number;
  gems: number;
  level: number;
  xp: number;
  nextLevelXp?: number;
  parkRating: number;
  buildings: PlacedBuilding[];
  unlockedExpansions: number; // 0 = 16x16, 1 = 22x22, 2 = 28x28, 3 = 34x34, 4 = 40x40
  staff: Record<string, StaffMember>;
  quests: Quest[];
  achievements: Achievement[];
  dailyStreak: number;
  lastDailyClaimDate: string; // YYYY-MM-DD
  activeBoosts: ActiveBoost[];
  totalVisitorsServed: number;
  totalCoinsEarned: number;
  totalTrashCleaned: number;
  settings: GameSettings;
  lastSaveTimestamp: number;
}
