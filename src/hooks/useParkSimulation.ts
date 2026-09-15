import React, { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import {
  ParkState,
  Visitor,
  TrashItem,
  BuildingDef,
  PlacedBuilding,
  ActiveBoost,
} from '../types';
import { CATALOG_MAP } from '../data/catalog';
import { sound } from '../services/audio';

const VISITOR_FIRST_NAMES = [
  'Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Ava', 'Mason', 'Sophia',
  'Lucas', 'Isabella', 'Oliver', 'Mia', 'Aiden', 'Charlotte', 'Elijah', 'Amelia',
  'James', 'Harper', 'Benjamin', 'Evelyn', 'Mateo', 'Luna', 'Daniel', 'Chloe',
  'Henry', 'Ella', 'Leo', 'Penelope', 'Gabriel', 'Layla', 'Julian', 'Nora'
];

const VISITOR_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
];

const SWIMSUIT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#84cc16'
];

const THOUGHTS = [
  'The giant water slide looks epic!',
  'I need to grab an ice cream cone right now.',
  'This wave pool feels like real ocean surf!',
  'Such a beautiful and sunny day at the water park!',
  'The lazy river is so relaxing.',
  'The water is crystal clear and super refreshing!',
  'I am definitely coming back here every weekend.',
  'Look at that mega splash!',
  'My feet are tired, let me rest on a lounger.',
  'Woohoo! Best summer vacation ever!'
];

export function useParkSimulation(
  parkState: ParkState,
  setParkState: Dispatch<SetStateAction<ParkState>>,
  onLevelUp: (newLevel: number, rewardCoins: number, rewardGems: number) => void
) {
  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    // Initial friendly visitors
    return [
      {
        id: 'v-init-1',
        name: 'Lucas Miller',
        type: 'NORMAL',
        x: 3,
        y: 4,
        targetX: 6,
        targetY: 6,
        speed: 1,
        activityTimer: 0,
        pathIndex: 0,
        path: [],
        state: 'walking',
        swimsuitColor: '#06b6d4',
        hasFloatie: true,
        fun: 85,
        hunger: 80,
        energy: 90,
        satisfaction: 95,
        coinsSpent: 25,
        thought: 'The water is crystal clear and refreshing!',
      },
      {
        id: 'v-init-2',
        name: 'Sophia Martinez',
        type: 'ADVENTURER',
        x: 5,
        y: 5,
        targetX: 8,
        targetY: 8,
        speed: 1.1,
        activityTimer: 0,
        pathIndex: 0,
        path: [],
        state: 'walking',
        swimsuitColor: '#f43f5e',
        hasFloatie: false,
        fun: 90,
        hunger: 65,
        energy: 85,
        satisfaction: 90,
        coinsSpent: 40,
        thought: 'The giant water slide looks epic!',
      }
    ];
  });

  const [trashList, setTrashList] = useState<TrashItem[]>([]);

  // Calculate scores
  const cleanlinessScore = Math.max(20, Math.min(100, Math.floor(100 - trashList.length * 8)));

  const uniqueCategories = new Set(
    parkState.buildings.map(b => CATALOG_MAP.get(b.defId)?.category).filter(Boolean)
  );
  const varietyScore = Math.min(100, Math.floor((uniqueCategories.size / 6) * 100));

  const totalStaffCount = Object.values(parkState.staff).reduce((sum, s) => sum + s.count, 0);
  const staffScore = Math.min(100, totalStaffCount * 25);

  const parkRating = Math.max(
    1.0,
    Math.min(5.0, Number(((cleanlinessScore * 0.35 + varietyScore * 0.4 + staffScore * 0.25) / 20).toFixed(1)))
  );

  // Sync park rating into state if changed
  useEffect(() => {
    if (parkState.parkRating !== parkRating) {
      setParkState(prev => ({ ...prev, parkRating }));
    }
  }, [parkRating, parkState.parkRating, setParkState]);

  // Handle XP gain and level up check
  const addXp = useCallback((amount: number) => {
    setParkState(prev => {
      let currentXp = prev.xp + amount;
      let currentLevel = prev.level;
      let nextLevelXp = prev.nextLevelXp || Math.floor(100 * Math.pow(currentLevel, 1.4));

      if (currentXp >= nextLevelXp) {
        currentXp -= nextLevelXp;
        currentLevel += 1;
        nextLevelXp = Math.floor(100 * Math.pow(currentLevel, 1.4));
        const rewardCoins = currentLevel * 250;
        const rewardGems = 2;

        setTimeout(() => {
          onLevelUp(currentLevel, rewardCoins, rewardGems);
        }, 120);

        return {
          ...prev,
          level: currentLevel,
          xp: currentXp,
          nextLevelXp,
          coins: prev.coins + rewardCoins,
          gems: prev.gems + rewardGems,
        };
      }

      return {
        ...prev,
        xp: currentXp,
        nextLevelXp,
      };
    });
  }, [onLevelUp, setParkState]);

  // Main simulation tick (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      setParkState(prev => {
        // 1. Clean expired boosts
        const activeBoosts = prev.activeBoosts.filter(b => b.expiresAt > now);

        // Multipliers
        let incomeMultiplier = 1;
        if (activeBoosts.some(b => b.id.includes('double'))) incomeMultiplier *= 2;
        if (activeBoosts.some(b => b.id.includes('mega'))) incomeMultiplier *= 3;

        // Cashier bonus
        const cashier = prev.staff['cashier'];
        if (cashier && cashier.count > 0) {
          incomeMultiplier += cashier.count * cashier.level * 0.1;
        }

        // 2. Attraction passive income
        let tickIncome = 0;
        const updatedBuildings = prev.buildings.map(b => {
          const def = CATALOG_MAP.get(b.defId);
          if (!def || def.baseIncome <= 0) return b;
          const earn = Math.floor(
            (def.baseIncome * (1 + (b.level - 1) * 0.6) * incomeMultiplier) / 4
          );
          tickIncome += earn;
          return {
            ...b,
            totalEarned: b.totalEarned + earn,
          };
        });

        // Golden Poseidon Monument special bonus (+50 coins/sec)
        const hasGoldenMonument = prev.buildings.some(b => b.defId === 'special_golden_fountain');
        if (hasGoldenMonument) {
          tickIncome += Math.floor(50 * incomeMultiplier);
        }

        const newCoins = prev.coins + tickIncome;
        const newTotalEarned = prev.totalCoinsEarned + tickIncome;

        return {
          ...prev,
          coins: newCoins,
          totalCoinsEarned: newTotalEarned,
          activeBoosts,
          buildings: updatedBuildings,
        };
      });

      // 3. Cleaner Staff Automation
      const cleanerStaff = parkState.staff['cleaner'];
      if (cleanerStaff && cleanerStaff.count > 0 && Math.random() < 0.35 + cleanerStaff.level * 0.1) {
        setTrashList(prev => {
          if (prev.length === 0) return prev;
          // Cleaner sweeps first trash
          return prev.slice(1);
        });
      }

      // 4. Visitors AI Update
      setVisitors(prevVisitors => {
        const gridDim = 16 + (parkState.unlockedExpansions || 0) * 6;
        const targetVisitorCount = Math.min(
          45,
          Math.max(4, 3 + Math.floor(parkState.buildings.length * 2.2) + Math.floor(parkRating * 2))
        );

        let updated = prevVisitors.map(v => {
          let { x, y, targetX, targetY, state, fun, hunger, satisfaction, coinsSpent } = v;

          // Move visitor towards target
          const dx = targetX - x;
          const dy = targetY - y;
          const dist = Math.hypot(dx, dy);

          if (dist > 0.15) {
            x += (dx / dist) * 0.12;
            y += (dy / dist) * 0.12;
          } else {
            // Reached current target!
            if (state === 'entering' || state === 'walking') {
              if (parkState.buildings.length > 0 && Math.random() < 0.7) {
                // Pick random building to visit
                const randB = parkState.buildings[Math.floor(Math.random() * parkState.buildings.length)];
                targetX = randB.x + 0.5;
                targetY = randB.y + 0.5;
                state = 'heading_to_attraction';
              } else {
                // Wander to random valid tile
                targetX = Math.max(1, Math.min(gridDim - 2, Math.floor(Math.random() * (gridDim - 2)) + 1));
                targetY = Math.max(1, Math.min(gridDim - 2, Math.floor(Math.random() * (gridDim - 2)) + 1));
                state = 'walking';
              }
            } else if (state === 'heading_to_attraction') {
              state = 'riding';
              fun = Math.min(100, fun + 20);
              const spend = v.type === 'VIP' ? 30 : 15;
              coinsSpent += spend;

              // Occasional splash sound
              if (Math.random() < 0.2) {
                sound.playSplash();
              }

              // Drop trash occasionally
              if (Math.random() < 0.15) {
                setTrashList(tPrev => {
                  if (tPrev.length > 25) return tPrev;
                  return [
                    ...tPrev,
                    {
                      id: `trash-${Date.now()}-${Math.random()}`,
                      x: Math.floor(x),
                      y: Math.floor(y),
                    },
                  ];
                });
              }

              // After brief riding, head to next target
              setTimeout(() => {
                targetX = Math.floor(Math.random() * (gridDim - 2)) + 1;
                targetY = Math.floor(Math.random() * (gridDim - 2)) + 1;
              }, 1200);
            } else if (state === 'riding') {
              state = 'walking';
              targetX = Math.floor(Math.random() * (gridDim - 2)) + 1;
              targetY = Math.floor(Math.random() * (gridDim - 2)) + 1;
            }
          }

          return {
            ...v,
            x,
            y,
            targetX,
            targetY,
            state,
            fun,
            hunger,
            satisfaction,
            coinsSpent,
          };
        });

        // Spawn new visitor if under target count
        if (updated.length < targetVisitorCount && Math.random() < 0.4) {
          const isVip = Math.random() < (parkState.activeBoosts.some(b => b.id.includes('lucky')) ? 0.4 : 0.12);
          const fName = VISITOR_FIRST_NAMES[Math.floor(Math.random() * VISITOR_FIRST_NAMES.length)];
          const lName = VISITOR_LAST_NAMES[Math.floor(Math.random() * VISITOR_LAST_NAMES.length)];
          const type = isVip ? 'VIP' : Math.random() < 0.25 ? 'ADVENTURER' : Math.random() < 0.25 ? 'CHILD' : 'NORMAL';

          const newVisitor: Visitor = {
            id: `v-${Date.now()}-${Math.random()}`,
            name: `${fName} ${lName}`,
            type,
            x: 0.5,
            y: 1.5,
            targetX: Math.floor(Math.random() * (gridDim - 3)) + 2,
            targetY: Math.floor(Math.random() * (gridDim - 3)) + 2,
            speed: 1,
            activityTimer: 0,
            pathIndex: 0,
            path: [],
            state: 'entering',
            swimsuitColor: SWIMSUIT_COLORS[Math.floor(Math.random() * SWIMSUIT_COLORS.length)],
            hasFloatie: type === 'CHILD' || Math.random() < 0.4,
            fun: Math.floor(Math.random() * 20) + 75,
            hunger: Math.floor(Math.random() * 30) + 60,
            energy: Math.floor(Math.random() * 25) + 75,
            satisfaction: 90,
            coinsSpent: 0,
            thought: THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)],
          };

          updated.push(newVisitor);

          // Update total visitors served metric
          setParkState(prev => ({
            ...prev,
            totalVisitorsServed: prev.totalVisitorsServed + 1,
          }));
          addXp(5);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [parkState.buildings, parkState.unlockedExpansions, parkState.staff, parkRating, setParkState, addXp]);

  const cleanTrash = useCallback((trashId: string) => {
    setTrashList(prev => prev.filter(t => t.id !== trashId));
    setParkState(prev => ({
      ...prev,
      totalTrashCleaned: prev.totalTrashCleaned + 1,
      coins: prev.coins + 5, // Reward for cleaning trash
    }));
    addXp(2);
  }, [addXp, setParkState]);

  return {
    visitors,
    trashList,
    cleanlinessScore,
    varietyScore,
    staffScore,
    parkRating,
    cleanTrash,
    addXp,
  };
}
