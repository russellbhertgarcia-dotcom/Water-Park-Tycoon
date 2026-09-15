import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ParkState,
  PlacedBuilding,
  Visitor,
  BuildingDef,
  GameSettings,
  ActiveBoost,
} from './types';
import { SaveManager, DEFAULT_SETTINGS } from './services/storage';
import { CATALOG, CATALOG_MAP } from './data/catalog';
import { INITIAL_QUESTS } from './data/quests';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';
import { sound } from './services/audio';
import { useParkSimulation } from './hooks/useParkSimulation';

import { MainMenu } from './components/MainMenu';
import { ParkCanvas } from './components/ParkCanvas';
import { HUD } from './components/HUD';
import { BottomNav } from './components/BottomNav';
import { BuildMenu } from './components/BuildMenu';
import { PlacementControls } from './components/PlacementControls';
import { BuildingDrawer } from './components/BuildingDrawer';
import { VisitorDrawer } from './components/VisitorDrawer';
import { DailyRewardModal } from './components/DailyRewardModal';
import { CoinShopModal } from './components/CoinShopModal';
import { QuestsModal } from './components/QuestsModal';
import { StaffModal } from './components/StaffModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ExpansionsModal } from './components/ExpansionsModal';
import { SettingsModal } from './components/SettingsModal';
import { CreditsModal } from './components/CreditsModal';
import { LevelUpModal } from './components/LevelUpModal';
import { RatingBreakdownModal } from './components/RatingBreakdownModal';
import { OfflineWelcomeModal } from './components/OfflineWelcomeModal';

export default function App() {
  // Load saved state or default
  const [parkState, setParkState] = useState<ParkState>(() => SaveManager.loadSave());

  // Active view: 'menu' or 'park'
  const [activeView, setActiveView] = useState<'menu' | 'park'>('menu');

  // Modals visibility
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showExpansionsModal, setShowExpansionsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Inspection drawers
  const [selectedBuilding, setSelectedBuilding] = useState<PlacedBuilding | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  // Placement mode
  const [placementDef, setPlacementDef] = useState<BuildingDef | null>(null);
  const [placementRotation, setPlacementRotation] = useState<0 | 90 | 180 | 270>(0);
  const [placementPos, setPlacementPos] = useState<{ x: number; y: number }>({ x: 5, y: 5 });

  // Level Up Announcement
  const [levelUpInfo, setLevelUpInfo] = useState<{
    newLevel: number;
    rewardCoins: number;
    rewardGems: number;
  } | null>(null);

  // Offline Welcome Modal
  const [offlineWelcome, setOfflineWelcome] = useState<{
    coins: number;
    minutes: number;
  } | null>(null);

  // Initialize offline earnings check on boot
  useEffect(() => {
    const offlineEarnings = SaveManager.calculateOfflineEarnings(parkState);
    if (offlineEarnings && offlineEarnings.coinsEarned > 50 && offlineEarnings.minutesAway >= 1) {
      setOfflineWelcome({
        coins: offlineEarnings.coinsEarned,
        minutes: offlineEarnings.minutesAway,
      });
    }
  }, []);

  // Initialize audio volume settings
  useEffect(() => {
    const s = parkState.settings || DEFAULT_SETTINGS;
    sound.setVolumes(s.soundVolume, s.musicVolume, s.isMuted);
  }, [parkState.settings]);

  // Periodic Auto-save every 4 seconds
  useEffect(() => {
    const saveTimer = setInterval(() => {
      SaveManager.saveGame(parkState);
    }, 4000);
    return () => clearInterval(saveTimer);
  }, [parkState]);

  // Park simulation hook (handles visitor AI, cleanliness, passive income, and XP)
  const {
    visitors,
    trashList,
    cleanlinessScore,
    varietyScore,
    staffScore,
    parkRating,
    cleanTrash,
    addXp,
  } = useParkSimulation(parkState, setParkState, (newLevel, rewardCoins, rewardGems) => {
    setLevelUpInfo({ newLevel, rewardCoins, rewardGems });
  });

  // Calculate grid dimension based on unlocked expansions
  const gridDim = useMemo(() => {
    return 16 + (parkState.unlockedExpansions || 0) * 6;
  }, [parkState.unlockedExpansions]);

  // Check if placement at current position is valid
  const isPlacementValid = useMemo(() => {
    if (!placementDef) return false;
    const w = placementRotation === 90 || placementRotation === 270 ? placementDef.height : placementDef.width;
    const h = placementRotation === 90 || placementRotation === 270 ? placementDef.width : placementDef.height;

    // Check bounds
    if (placementPos.x < 0 || placementPos.y < 0) return false;
    if (placementPos.x + w > gridDim || placementPos.y + h > gridDim) return false;

    // Entrance path reservation [0, 0] to [0, 2]
    for (let gx = placementPos.x; gx < placementPos.x + w; gx++) {
      for (let gy = placementPos.y; gy < placementPos.y + h; gy++) {
        if (gx === 0 && (gy === 0 || gy === 1 || gy === 2)) return false;
      }
    }

    // Check collisions with existing buildings
    for (const b of parkState.buildings) {
      const bDef = CATALOG_MAP.get(b.defId);
      if (!bDef) continue;
      const bw = b.rotation === 90 || b.rotation === 270 ? bDef.height : bDef.width;
      const bh = b.rotation === 90 || b.rotation === 270 ? bDef.width : bDef.height;

      // AABB overlap test
      const noOverlap =
        placementPos.x + w <= b.x ||
        placementPos.x >= b.x + bw ||
        placementPos.y + h <= b.y ||
        placementPos.y >= b.y + bh;

      if (!noOverlap) return false;
    }

    return true;
  }, [placementDef, placementRotation, placementPos, gridDim, parkState.buildings]);

  // Rotate placement handler
  const handleRotatePlacement = useCallback(() => {
    setPlacementRotation(prev => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
  }, []);

  // Listen for keyboard 'R' rotate event
  useEffect(() => {
    const onRotateReq = () => handleRotatePlacement();
    window.addEventListener('wtp_rotate_placement', onRotateReq);
    return () => window.removeEventListener('wtp_rotate_placement', onRotateReq);
  }, [handleRotatePlacement]);

  // Confirm placement of new building
  const handleConfirmPlacement = useCallback((x: number, y: number) => {
    if (!placementDef) return;
    if (parkState.coins < placementDef.cost) return;

    const newBuilding: PlacedBuilding = {
      uid: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      defId: placementDef.id,
      x,
      y,
      rotation: placementRotation,
      level: 1,
      totalEarned: 0,
      placedAt: Date.now(),
    };

    setParkState(prev => {
      const updatedBuildings = [...prev.buildings, newBuilding];
      const updatedCoins = prev.coins - placementDef.cost;
      const updatedQuests = prev.quests.map(q => {
        if (q.targetType === 'build_category' && q.targetCategory === placementDef.category) {
          return { ...q, currentCount: q.currentCount + 1 };
        }
        if (q.targetType === 'build_count') {
          return { ...q, currentCount: q.currentCount + 1 };
        }
        return q;
      });

      const updatedAchievements = prev.achievements.map(a => {
        if (a.targetType === 'build_count') {
          return { ...a, currentCount: a.currentCount + 1 };
        }
        return a;
      });

      return {
        ...prev,
        buildings: updatedBuildings,
        coins: updatedCoins,
        quests: updatedQuests,
        achievements: updatedAchievements,
      };
    });

    addXp(30);
    setPlacementDef(null);
  }, [placementDef, placementRotation, parkState.coins, addXp]);

  // Cancel placement
  const handleCancelPlacement = useCallback(() => {
    setPlacementDef(null);
  }, []);

  // Upgrade building
  const handleUpgradeBuilding = useCallback((buildingUid: string) => {
    setParkState(prev => {
      const targetB = prev.buildings.find(b => b.uid === buildingUid);
      if (!targetB) return prev;
      const def = CATALOG_MAP.get(targetB.defId);
      if (!def) return prev;

      const upgradeCost = Math.floor(def.cost * targetB.level * 1.4);
      if (prev.coins < upgradeCost) return prev;

      const updatedBuildings = prev.buildings.map(b => {
        if (b.uid === buildingUid) {
          return { ...b, level: b.level + 1 };
        }
        return b;
      });

      const updatedQuests = prev.quests.map(q => {
        if (q.targetType === 'upgrade_count') {
          return { ...q, currentCount: q.currentCount + 1 };
        }
        return q;
      });

      return {
        ...prev,
        coins: prev.coins - upgradeCost,
        buildings: updatedBuildings,
        quests: updatedQuests,
      };
    });

    // Update inspected building
    setSelectedBuilding(prev => (prev ? { ...prev, level: prev.level + 1 } : null));
    addXp(50);
  }, [addXp]);

  // Move building
  const handleMoveBuilding = useCallback((b: PlacedBuilding) => {
    const def = CATALOG_MAP.get(b.defId);
    if (!def) return;
    // Remove existing and enter placement mode
    setParkState(prev => ({
      ...prev,
      buildings: prev.buildings.filter(item => item.uid !== b.uid),
    }));
    setSelectedBuilding(null);
    setPlacementDef(def);
    setPlacementRotation(b.rotation);
  }, []);

  // Demolish building
  const handleDemolishBuilding = useCallback((buildingUid: string) => {
    setParkState(prev => {
      const targetB = prev.buildings.find(b => b.uid === buildingUid);
      if (!targetB) return prev;
      const def = CATALOG_MAP.get(targetB.defId);
      const refund = def ? Math.floor(def.cost * 0.5 * targetB.level) : 0;

      return {
        ...prev,
        coins: prev.coins + refund,
        buildings: prev.buildings.filter(b => b.uid !== buildingUid),
      };
    });
    setSelectedBuilding(null);
  }, []);

  // Claim Daily Reward
  const handleClaimDailyReward = useCallback((day: number, coins: number, specialBonus?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setParkState(prev => {
      const newStreak = prev.dailyRewards.streak + 1;
      let updatedBuildings = [...prev.buildings];

      // If unlocked day 7 golden monument
      if (specialBonus === 'special_golden_fountain') {
        const monumentDef = CATALOG_MAP.get('special_golden_fountain');
        if (monumentDef && !prev.buildings.some(b => b.defId === 'special_golden_fountain')) {
          updatedBuildings.push({
            uid: `b-golden-${Date.now()}`,
            defId: 'special_golden_fountain',
            x: 8,
            y: 8,
            rotation: 0,
            level: 1,
            totalEarned: 0,
            placedAt: Date.now(),
          });
        }
      }

      return {
        ...prev,
        coins: prev.coins + coins,
        buildings: updatedBuildings,
        dailyStreak: newStreak,
        lastDailyClaimDate: todayStr,
      };
    });
    addXp(100);
  }, [addXp]);

  // Buy Shop Booster
  const handleBuyShopItem = useCallback((item: {
    id: string;
    cost: number;
    name: string;
    type: string;
    durationMinutes?: number;
    multiplier?: number;
  }) => {
    setParkState(prev => {
      if (prev.coins < item.cost) return prev;

      let newCoins = prev.coins - item.cost;
      let newGems = prev.gems;
      let newBuildings = [...prev.buildings];
      let newBoosts = [...prev.activeBoosts];

      if (item.id === 'boost_starter') {
        newCoins += 1000;
        newGems += 5;
      } else if (item.id === 'special_decoration_golden') {
        newBuildings.push({
          uid: `b-golden-shop-${Date.now()}`,
          defId: 'special_golden_fountain',
          x: 10,
          y: 10,
          rotation: 0,
          level: 1,
          totalEarned: 0,
          placedAt: Date.now(),
        });
      } else if (item.durationMinutes) {
        newBoosts.push({
          id: `${item.id}-${Date.now()}`,
          name: item.name,
          multiplier: item.multiplier || 2,
          expiresAt: Date.now() + item.durationMinutes * 60 * 1000,
        });
      }

      return {
        ...prev,
        coins: newCoins,
        gems: newGems,
        buildings: newBuildings,
        activeBoosts: newBoosts,
      };
    });
  }, []);

  // Claim Quest
  const handleClaimQuest = useCallback((questId: string) => {
    setParkState(prev => {
      const q = prev.quests.find(item => item.id === questId);
      if (!q || q.isClaimed || q.currentCount < q.targetCount) return prev;

      const updatedQuests = prev.quests.map(item =>
        item.id === questId ? { ...item, isClaimed: true } : item
      );

      return {
        ...prev,
        coins: prev.coins + q.rewardCoins,
        quests: updatedQuests,
      };
    });
    addXp(50);
  }, [addXp]);

  // Claim Achievement
  const handleClaimAchievement = useCallback((achievementId: string) => {
    setParkState(prev => {
      const a = prev.achievements.find(item => item.id === achievementId);
      if (!a || a.isClaimed || a.currentCount < a.targetCount) return prev;

      const updatedAchievements = prev.achievements.map(item =>
        item.id === achievementId ? { ...item, isClaimed: true } : item
      );

      return {
        ...prev,
        coins: prev.coins + a.rewardCoins,
        gems: prev.gems + a.rewardGems,
        achievements: updatedAchievements,
      };
    });
  }, []);

  // Hire Staff
  const handleHireStaff = useCallback((staffId: string) => {
    setParkState(prev => {
      const staffMember = prev.staff[staffId];
      if (!staffMember) return prev;
      const hireCost = staffMember.baseCost * (staffMember.count + 1);
      if (prev.coins < hireCost) return prev;

      return {
        ...prev,
        coins: prev.coins - hireCost,
        staff: {
          ...prev.staff,
          [staffId]: {
            ...staffMember,
            count: staffMember.count + 1,
          },
        },
      };
    });
    addXp(40);
  }, [addXp]);

  // Upgrade / Train Staff
  const handleUpgradeStaff = useCallback((staffId: string) => {
    setParkState(prev => {
      const staffMember = prev.staff[staffId];
      if (!staffMember || staffMember.count === 0) return prev;
      const trainCost = staffMember.baseCost * staffMember.level * 1.5;
      if (prev.coins < trainCost) return prev;

      return {
        ...prev,
        coins: prev.coins - trainCost,
        staff: {
          ...prev.staff,
          [staffId]: {
            ...staffMember,
            level: staffMember.level + 1,
          },
        },
      };
    });
    addXp(60);
  }, [addXp]);

  // Buy Land Expansion
  const handleBuyExpansion = useCallback((tier: { level: number; cost: number }) => {
    setParkState(prev => {
      if (prev.coins < tier.cost) return prev;
      return {
        ...prev,
        coins: prev.coins - tier.cost,
        unlockedExpansions: tier.level,
      };
    });
    addXp(200);
  }, [addXp]);

  // Reset entire park save
  const handleResetPark = useCallback(() => {
    SaveManager.resetSave();
    const fresh = SaveManager.loadSave();
    setParkState(fresh);
    setActiveView('menu');
  }, []);

  // Claim offline welcome earnings
  const handleClaimOfflineWelcome = useCallback(() => {
    if (!offlineWelcome) return;
    setParkState(prev => ({
      ...prev,
      coins: prev.coins + offlineWelcome.coins,
      totalCoinsEarned: prev.totalCoinsEarned + offlineWelcome.coins,
    }));
    setOfflineWelcome(null);
  }, [offlineWelcome]);

  // Check badges for notifications
  const todayStr = new Date().toISOString().split('T')[0];
  const hasAvailableDaily = parkState.lastDailyClaimDate !== todayStr;
  const claimableQuestsCount = parkState.quests.filter(
    q => !q.isClaimed && q.currentCount >= q.targetCount
  ).length;
  const claimableAchievementsCount = parkState.achievements.filter(
    a => !a.isClaimed && a.currentCount >= a.targetCount
  ).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-950 font-sans select-none">
      {/* 1. MAIN MENU VIEW */}
      {activeView === 'menu' && (
        <MainMenu
          onPlay={() => {
            sound.initAudio();
            sound.startBackgroundMusic();
            setActiveView('park');
          }}
          onOpenDaily={() => setShowDailyModal(true)}
          onOpenShop={() => setShowShopModal(true)}
          onOpenAchievements={() => setShowAchievementsModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenCredits={() => setShowCreditsModal(true)}
          hasAvailableDaily={hasAvailableDaily}
          parkRating={parkState.parkRating}
          parkName={parkState.parkName}
        />
      )}

      {/* 2. IN-GAME PARK VIEW */}
      {activeView === 'park' && (
        <div className="relative w-full h-full">
          {/* 2.5D Isometric HTML5 Park Canvas */}
          <ParkCanvas
            parkState={parkState}
            visitors={visitors}
            trashList={trashList}
            placementDef={placementDef}
            placementRotation={placementRotation}
            onSelectBuilding={b => {
              setSelectedVisitor(null);
              setSelectedBuilding(b);
            }}
            onSelectVisitor={v => {
              setSelectedBuilding(null);
              setSelectedVisitor(v);
            }}
            onCleanTrash={cleanTrash}
            onConfirmPlacement={handleConfirmPlacement}
            onCancelPlacement={handleCancelPlacement}
            isPlacementValid={isPlacementValid}
            onPlacementPosChange={(x, y) => setPlacementPos({ x, y })}
          />

          {/* Top HUD */}
          <HUD
            parkName={parkState.parkName}
            level={parkState.level}
            xp={parkState.xp}
            nextLevelXp={parkState.nextLevelXp || Math.floor(100 * Math.pow(parkState.level, 1.4))}
            coins={parkState.coins}
            gems={parkState.gems}
            parkRating={parkState.parkRating}
            activeBoosts={parkState.activeBoosts}
            onOpenMenu={() => setActiveView('menu')}
            onOpenRatingInfo={() => setShowRatingModal(true)}
            onOpenExpansions={() => setShowExpansionsModal(true)}
          />

          {/* Placement Overlay Controls */}
          {placementDef ? (
            <PlacementControls
              buildingDef={placementDef}
              isValid={isPlacementValid}
              onRotate={handleRotatePlacement}
              onConfirm={() => handleConfirmPlacement(placementPos.x, placementPos.y)}
              onCancel={handleCancelPlacement}
            />
          ) : (
            /* Bottom Action Navigation */
            <BottomNav
              onOpenBuild={() => setShowBuildMenu(true)}
              onOpenShop={() => setShowShopModal(true)}
              onOpenDaily={() => setShowDailyModal(true)}
              onOpenQuests={() => setShowQuestsModal(true)}
              onOpenStaff={() => setShowStaffModal(true)}
              onOpenAchievements={() => setShowAchievementsModal(true)}
              onOpenSettings={() => setShowSettingsModal(true)}
              hasAvailableDaily={hasAvailableDaily}
              claimableQuestsCount={claimableQuestsCount}
              claimableAchievementsCount={claimableAchievementsCount}
            />
          )}
        </div>
      )}

      {/* OVERLAY MODALS */}

      {/* Build Menu */}
      {showBuildMenu && (
        <BuildMenu
          playerLevel={parkState.level}
          playerCoins={parkState.coins}
          onSelectBuildingToBuild={def => {
            setShowBuildMenu(false);
            setPlacementDef(def);
            setPlacementRotation(0);
          }}
          onClose={() => setShowBuildMenu(false)}
        />
      )}

      {/* Building Details & Upgrade Drawer */}
      {selectedBuilding && (
        <BuildingDrawer
          building={selectedBuilding}
          playerCoins={parkState.coins}
          onUpgrade={handleUpgradeBuilding}
          onMove={handleMoveBuilding}
          onDemolish={handleDemolishBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}

      {/* Visitor Details Drawer */}
      {selectedVisitor && (
        <VisitorDrawer
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}

      {/* Daily Reward Modal */}
      {showDailyModal && (
        <DailyRewardModal
          currentStreak={parkState.dailyStreak}
          lastClaimDate={parkState.lastDailyClaimDate}
          onClaimReward={handleClaimDailyReward}
          onClose={() => setShowDailyModal(false)}
          onEnterPark={activeView === 'menu' ? () => {
            sound.initAudio();
            sound.startBackgroundMusic();
            setActiveView('park');
            setShowDailyModal(false);
          } : undefined}
        />
      )}

      {/* Coin Shop Modal */}
      {showShopModal && (
        <CoinShopModal
          playerCoins={parkState.coins}
          onBuyItem={handleBuyShopItem}
          onClose={() => setShowShopModal(false)}
        />
      )}

      {/* Quests Modal */}
      {showQuestsModal && (
        <QuestsModal
          quests={parkState.quests}
          onClaimQuest={handleClaimQuest}
          onClose={() => setShowQuestsModal(false)}
        />
      )}

      {/* Staff Management Modal */}
      {showStaffModal && (
        <StaffModal
          staff={parkState.staff}
          playerCoins={parkState.coins}
          onHireStaff={handleHireStaff}
          onUpgradeStaff={handleUpgradeStaff}
          onClose={() => setShowStaffModal(false)}
        />
      )}

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          achievements={parkState.achievements}
          onClaimAchievement={handleClaimAchievement}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}

      {/* Land Expansions Modal */}
      {showExpansionsModal && (
        <ExpansionsModal
          unlockedExpansions={parkState.unlockedExpansions || 0}
          playerCoins={parkState.coins}
          onBuyExpansion={handleBuyExpansion}
          onClose={() => setShowExpansionsModal(false)}
        />
      )}

      {/* Rating Breakdown Modal */}
      {showRatingModal && (
        <RatingBreakdownModal
          parkRating={parkState.parkRating}
          cleanlinessScore={cleanlinessScore}
          varietyScore={varietyScore}
          decorationsScore={Math.min(100, parkState.buildings.filter(b => CATALOG_MAP.get(b.defId)?.category === 'decorations').length * 20)}
          staffScore={staffScore}
          onClose={() => setShowRatingModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={parkState.settings || DEFAULT_SETTINGS}
          parkName={parkState.parkName}
          onUpdateSettings={newSettings =>
            setParkState(prev => ({ ...prev, settings: newSettings }))
          }
          onUpdateParkName={name =>
            setParkState(prev => ({ ...prev, parkName: name }))
          }
          onResetPark={handleResetPark}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Credits Modal */}
      {showCreditsModal && (
        <CreditsModal onClose={() => setShowCreditsModal(false)} />
      )}

      {/* Level Up Fanfare Modal */}
      {levelUpInfo && !showDailyModal && (
        <LevelUpModal
          newLevel={levelUpInfo.newLevel}
          rewardCoins={levelUpInfo.rewardCoins}
          rewardGems={levelUpInfo.rewardGems}
          onClose={() => setLevelUpInfo(null)}
        />
      )}

      {/* Offline Welcome Back Earnings Modal */}
      {offlineWelcome && (
        <OfflineWelcomeModal
          coinsEarned={offlineWelcome.coins}
          minutesAway={offlineWelcome.minutes}
          onClaim={handleClaimOfflineWelcome}
        />
      )}
    </div>
  );
}
