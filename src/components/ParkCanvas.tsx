import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ParkState,
  PlacedBuilding,
  Visitor,
  TrashItem,
  BuildingDef,
  VisitorState,
} from '../types';
import { CATALOG_MAP } from '../data/catalog';
import { sound } from '../services/audio';

interface ParkCanvasProps {
  parkState: ParkState;
  visitors: Visitor[];
  trashList: TrashItem[];
  placementDef: BuildingDef | null;
  placementRotation: 0 | 90 | 180 | 270;
  onSelectBuilding: (building: PlacedBuilding) => void;
  onSelectVisitor: (visitor: Visitor) => void;
  onCleanTrash: (trashId: string) => void;
  onConfirmPlacement: (x: number, y: number) => void;
  onCancelPlacement: () => void;
  isPlacementValid: boolean;
  onPlacementPosChange?: (x: number, y: number) => void;
}

export const ParkCanvas: React.FC<ParkCanvasProps> = ({
  parkState,
  visitors,
  trashList,
  placementDef,
  placementRotation,
  onSelectBuilding,
  onSelectVisitor,
  onCleanTrash,
  onConfirmPlacement,
  onCancelPlacement,
  isPlacementValid,
  onPlacementPosChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Camera state
  const cameraRef = useRef<{
    x: number;
    y: number;
    zoom: number;
    isDragging: boolean;
    lastMouseX: number;
    lastMouseY: number;
    touchDist: number;
  }>({
    x: 0,
    y: 0,
    zoom: 1.0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    touchDist: 0,
  });

  // Current hovered/preview grid position
  const [hoverGrid, setHoverGrid] = useState<{ x: number; y: number } | null>(null);

  // Grid sizing based on unlocked expansions
  // Expansions: 0=16x16, 1=22x22, 2=28x28, 3=34x34, 4=40x40
  const getGridSize = useCallback(() => {
    const exp = parkState.unlockedExpansions || 0;
    return 16 + exp * 6;
  }, [parkState.unlockedExpansions]);

  const gridSize = getGridSize();
  const TILE_W = 64;
  const TILE_H = 32;

  // Coordinate transforms: Grid to Screen
  const gridToScreen = useCallback((gx: number, gy: number, camX: number, camY: number, zoom: number) => {
    const sx = (gx - gy) * (TILE_W / 2) * zoom + camX;
    const sy = (gx + gy) * (TILE_H / 2) * zoom + camY;
    return { x: sx, y: sy };
  }, []);

  // Screen to Grid
  const screenToGrid = useCallback((sx: number, sy: number, camX: number, camY: number, zoom: number) => {
    const adjustedX = (sx - camX) / zoom;
    const adjustedY = (sy - camY) / zoom;
    const gx = (adjustedX / (TILE_W / 2) + adjustedY / (TILE_H / 2)) / 2;
    const gy = (adjustedY / (TILE_H / 2) - adjustedX / (TILE_W / 2)) / 2;
    return { x: Math.floor(gx), y: Math.floor(gy) };
  }, []);

  // Center camera on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    cameraRef.current.x = width / 2;
    cameraRef.current.y = height / 4;
  }, []);

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const width = canvas.width = canvas.clientWidth * window.devicePixelRatio;
      const height = canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.resetTransform();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const displayW = canvas.clientWidth;
      const displayH = canvas.clientHeight;
      const cam = cameraRef.current;

      // 1. Background sky/ocean gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, displayH);
      bgGrad.addColorStop(0, '#bae6fd');
      bgGrad.addColorStop(0.5, '#7dd3fc');
      bgGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, displayW, displayH);

      // Tropical ocean waves surrounding island
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 5; i++) {
        const waveY = (time * 15 + i * 80) % displayH;
        ctx.beginPath();
        ctx.ellipse(displayW / 2, waveY, displayW * 0.8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Island Base and Ground Grid
      // Draw island sand fringe
      ctx.save();
      const origin = gridToScreen(gridSize / 2, gridSize / 2, cam.x, cam.y, cam.zoom);
      const islandRadiusX = (gridSize + 2) * (TILE_W / 2) * cam.zoom;
      const islandRadiusY = (gridSize + 2) * (TILE_H / 2) * cam.zoom;

      // Sand bank
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(origin.x, origin.y + 12 * cam.zoom, islandRadiusX + 24 * cam.zoom, islandRadiusY + 18 * cam.zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep sand base edge
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(origin.x, origin.y + 20 * cam.zoom, islandRadiusX + 20 * cam.zoom, islandRadiusY + 12 * cam.zoom, 0, 0, Math.PI);
      ctx.fill();

      // Draw Grid Tiles
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const pt = gridToScreen(x, y, cam.x, cam.y, cam.zoom);
          
          // Check if tile has building or path
          const isCheckered = (x + y) % 2 === 0;

          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x + (TILE_W / 2) * cam.zoom, pt.y + (TILE_H / 2) * cam.zoom);
          ctx.lineTo(pt.x, pt.y + TILE_H * cam.zoom);
          ctx.lineTo(pt.x - (TILE_W / 2) * cam.zoom, pt.y + (TILE_H / 2) * cam.zoom);
          ctx.closePath();

          // Lush tropical grass lawn
          ctx.fillStyle = isCheckered ? '#4ade80' : '#22c55e';
          ctx.fill();

          // Subtle grid lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Entrance Gate at top (x=7,8 y=0)
      const gatePt = gridToScreen(gridSize / 2 - 0.5, 0, cam.x, cam.y, cam.zoom);
      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${Math.max(12, 16 * cam.zoom)}px 'Fredoka', cursive, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🌊 PARK ENTRANCE 🌊', gatePt.x, gatePt.y - 30 * cam.zoom);

      // Entrance archway
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(gatePt.x - 40 * cam.zoom, gatePt.y - 25 * cam.zoom, 80 * cam.zoom, 10 * cam.zoom);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(gatePt.x - 36 * cam.zoom, gatePt.y - 23 * cam.zoom, 72 * cam.zoom, 6 * cam.zoom);

      // 3. Render Objects (Depth Sorted: x + y)
      // Collect renderables: buildings, paths, visitors, trash
      type Renderable = 
        | { type: 'building'; obj: PlacedBuilding; sortKey: number }
        | { type: 'visitor'; obj: Visitor; sortKey: number }
        | { type: 'trash'; obj: TrashItem; sortKey: number };

      const renderables: Renderable[] = [];

      // Separate paths from other buildings so paths always render under visitors and attractions
      const paths: PlacedBuilding[] = [];
      parkState.buildings.forEach(b => {
        const def = CATALOG_MAP.get(b.defId);
        if (def?.category === 'paths') {
          paths.push(b);
        } else {
          // calculate sort key based on bottom-right corner of building footprint
          const w = (b.rotation === 90 || b.rotation === 270) ? (def?.height || 1) : (def?.width || 1);
          const h = (b.rotation === 90 || b.rotation === 270) ? (def?.width || 1) : (def?.height || 1);
          renderables.push({
            type: 'building',
            obj: b,
            sortKey: b.x + b.y + (w + h) / 2,
          });
        }
      });

      // Render paths first
      paths.forEach(p => {
        const pt = gridToScreen(p.x, p.y, cam.x, cam.y, cam.zoom);
        const def = CATALOG_MAP.get(p.defId);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + (TILE_W / 2) * cam.zoom, pt.y + (TILE_H / 2) * cam.zoom);
        ctx.lineTo(pt.x, pt.y + TILE_H * cam.zoom);
        ctx.lineTo(pt.x - (TILE_W / 2) * cam.zoom, pt.y + (TILE_H / 2) * cam.zoom);
        ctx.closePath();

        if (p.defId === 'path_boardwalk') {
          ctx.fillStyle = '#b45309';
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (p.defId === 'path_ocean_tile') {
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Stone
          ctx.fillStyle = '#94a3b8';
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Add trash
      trashList.forEach(t => {
        renderables.push({
          type: 'trash',
          obj: t,
          sortKey: t.x + t.y,
        });
      });

      // Add visitors
      visitors.forEach(v => {
        renderables.push({
          type: 'visitor',
          obj: v,
          sortKey: v.x + v.y,
        });
      });

      // Sort by isometric depth
      renderables.sort((a, b) => a.sortKey - b.sortKey);

      // Render sorted items
      renderables.forEach(item => {
        if (item.type === 'trash') {
          const t = item.obj;
          const pt = gridToScreen(t.x + 0.5, t.y + 0.5, cam.x, cam.y, cam.zoom);
          // Draw small soda can / candy wrapper
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4 * cam.zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(pt.x + 2 * cam.zoom, pt.y - 2 * cam.zoom, 2.5 * cam.zoom, 0, Math.PI * 2);
          ctx.fill();

          // Green stink fly / icon
          ctx.fillStyle = '#15803d';
          ctx.font = `${Math.max(8, 10 * cam.zoom)}px sans-serif`;
          ctx.fillText('🗑️', pt.x, pt.y - 6 * cam.zoom);
        } else if (item.type === 'visitor') {
          const v = item.obj;
          const pt = gridToScreen(v.x, v.y, cam.x, cam.y, cam.zoom);
          drawVisitor(ctx, v, pt.x, pt.y, cam.zoom, time, parkState.settings?.showVisitorNames ?? true);
        } else if (item.type === 'building') {
          const b = item.obj;
          const def = CATALOG_MAP.get(b.defId);
          if (def) {
            drawBuilding(ctx, b, def, cam, time);
          }
        }
      });

      // 4. Placement Preview (Ghost overlay)
      if (placementDef && hoverGrid) {
        const w = (placementRotation === 90 || placementRotation === 270) ? placementDef.height : placementDef.width;
        const h = (placementRotation === 90 || placementRotation === 270) ? placementDef.width : placementDef.height;

        // Draw preview footprint highlight
        for (let ix = 0; ix < w; ix++) {
          for (let iy = 0; iy < h; iy++) {
            const gx = hoverGrid.x + ix;
            const gy = hoverGrid.y + iy;
            const pt = gridToScreen(gx, gy, cam.x, cam.y, cam.zoom);

            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x + (TILE_W / 2) * cam.zoom, pt.y + (TILE_H / 2) * cam.zoom);
            ctx.lineTo(pt.x, pt.y + TILE_H * cam.zoom);
            ctx.lineTo(pt.x - (TILE_W / 2) * cam.zoom, pt.y + (TILE_H / 2) * cam.zoom);
            ctx.closePath();

            ctx.fillStyle = isPlacementValid ? 'rgba(74, 222, 128, 0.5)' : 'rgba(239, 68, 68, 0.55)';
            ctx.fill();
            ctx.strokeStyle = isPlacementValid ? '#16a34a' : '#b91c1c';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Draw ghost building model
        const ghostBuilding: PlacedBuilding = {
          uid: 'preview_ghost',
          defId: placementDef.id,
          x: hoverGrid.x,
          y: hoverGrid.y,
          rotation: placementRotation,
          level: 1,
          totalEarned: 0,
          placedAt: 0,
        };
        ctx.globalAlpha = 0.7;
        drawBuilding(ctx, ghostBuilding, placementDef, cam, time);
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    parkState,
    visitors,
    trashList,
    placementDef,
    placementRotation,
    hoverGrid,
    isPlacementValid,
    gridSize,
    gridToScreen,
  ]);

  // Helper: Draw Building on Canvas
  const drawBuilding = (
    ctx: CanvasRenderingContext2D,
    b: PlacedBuilding,
    def: BuildingDef,
    cam: { x: number; y: number; zoom: number },
    time: number
  ) => {
    const w = (b.rotation === 90 || b.rotation === 270) ? def.height : def.width;
    const h = (b.rotation === 90 || b.rotation === 270) ? def.width : def.height;

    // Top anchor corner
    const pTop = gridToScreen(b.x, b.y, cam.x, cam.y, cam.zoom);
    const pRight = gridToScreen(b.x + w, b.y, cam.x, cam.y, cam.zoom);
    const pBottom = gridToScreen(b.x + w, b.y + h, cam.x, cam.y, cam.zoom);
    const pLeft = gridToScreen(b.x, b.y + h, cam.x, cam.y, cam.zoom);
    const center = gridToScreen(b.x + w / 2, b.y + h / 2, cam.x, cam.y, cam.zoom);

    const zoom = cam.zoom;

    ctx.save();

    // 1. POOLS
    if (def.category === 'pools') {
      // Draw Pool Basin / Coping Stone Border
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.lineTo(pLeft.x, pLeft.y);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc'; // White pool border
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3 * zoom;
      ctx.stroke();

      // Deep water pool
      const inset = 6 * zoom;
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y + inset);
      ctx.lineTo(pRight.x - inset, pRight.y);
      ctx.lineTo(pBottom.x, pBottom.y - inset);
      ctx.lineTo(pLeft.x + inset, pLeft.y);
      ctx.closePath();

      // Shimmering Pool Gradient
      const waterGrad = ctx.createLinearGradient(pTop.x, pTop.y, pBottom.x, pBottom.y);
      waterGrad.addColorStop(0, def.themeColor || '#0ea5e9');
      waterGrad.addColorStop(1, def.accentColor || '#38bdf8');
      ctx.fillStyle = waterGrad;
      ctx.fill();

      // Animated caustic ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5 * zoom;
      for (let i = 0; i < 3; i++) {
        const offset = Math.sin(time * 2 + i * 1.5) * (8 * zoom);
        ctx.beginPath();
        ctx.ellipse(center.x + offset, center.y + (i - 1) * 8 * zoom, (w * 10) * zoom, (h * 4) * zoom, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // If Volcano Pool
      if (def.id === 'pool_volcano') {
        // Red glowing rock in center
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(center.x, center.y - 10 * zoom, 16 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(center.x, center.y - 12 * zoom, 10 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        // Smoke/lava particles
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(center.x + Math.sin(time * 4) * 4, center.y - 24 * zoom - (time * 10) % 20, 5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pool Ladder
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2 * zoom;
      ctx.strokeRect(pLeft.x + 8 * zoom, pLeft.y - 12 * zoom, 6 * zoom, 12 * zoom);
    } 
    // 2. WATER SLIDES
    else if (def.category === 'slides') {
      // Base splash pool
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.lineTo(pLeft.x, pLeft.y);
      ctx.closePath();
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      // Tall Launch Tower
      const towerH = (def.id === 'slide_mega_drop' || def.id === 'slide_volcano') ? 70 * zoom : 45 * zoom;
      const towerBaseX = pTop.x;
      const towerBaseY = pTop.y;

      // Steel Scaffold Stilts
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(towerBaseX - 12 * zoom, towerBaseY);
      ctx.lineTo(towerBaseX - 10 * zoom, towerBaseY - towerH);
      ctx.lineTo(towerBaseX + 10 * zoom, towerBaseY - towerH);
      ctx.lineTo(towerBaseX + 12 * zoom, towerBaseY);
      // Cross brace
      ctx.moveTo(towerBaseX - 12 * zoom, towerBaseY);
      ctx.lineTo(towerBaseX + 10 * zoom, towerBaseY - towerH);
      ctx.stroke();

      // Launch Platform Roof
      ctx.fillStyle = def.themeColor;
      ctx.beginPath();
      ctx.moveTo(towerBaseX - 16 * zoom, towerBaseY - towerH);
      ctx.lineTo(towerBaseX, towerBaseY - towerH - 12 * zoom);
      ctx.lineTo(towerBaseX + 16 * zoom, towerBaseY - towerH);
      ctx.closePath();
      ctx.fill();

      // Curved Slide Tube Chute
      ctx.strokeStyle = def.themeColor;
      ctx.lineWidth = 8 * zoom;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(towerBaseX, towerBaseY - towerH + 4 * zoom);
      if (def.id === 'slide_giant' || def.id === 'slide_tube') {
        // Spiral curve
        ctx.bezierCurveTo(
          towerBaseX + 30 * zoom, towerBaseY - towerH * 0.6,
          towerBaseX - 30 * zoom, towerBaseY - towerH * 0.2,
          center.x, center.y
        );
      } else {
        // Drop slope
        ctx.quadraticCurveTo(towerBaseX + 10 * zoom, towerBaseY - towerH * 0.3, center.x, center.y);
      }
      ctx.stroke();

      // Slide inner water flow highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2.5 * zoom;
      ctx.stroke();

      // Animated Water Splash at bottom chute
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const splashSize = (Math.sin(time * 6) + 1) * 3 * zoom + 3 * zoom;
      ctx.beginPath();
      ctx.arc(center.x, center.y, splashSize, 0, Math.PI * 2);
      ctx.fill();
    }
    // 3. FOOD & DRINK KIOSKS & SHOPS
    else if (def.category === 'food' || def.category === 'drinks' || def.category === 'shops') {
      const bldgH = 28 * zoom;

      // Building 3D walls
      ctx.fillStyle = '#f8fafc';
      // Left wall
      ctx.beginPath();
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.lineTo(pBottom.x, pBottom.y - bldgH);
      ctx.lineTo(pLeft.x, pLeft.y - bldgH);
      ctx.closePath();
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      // Right wall
      ctx.beginPath();
      ctx.moveTo(pBottom.x, pBottom.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pRight.x, pRight.y - bldgH);
      ctx.lineTo(pBottom.x, pBottom.y - bldgH);
      ctx.closePath();
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();

      // Striped Awning Roof
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y - bldgH);
      ctx.lineTo(pRight.x + 4 * zoom, pRight.y - bldgH);
      ctx.lineTo(pBottom.x, pBottom.y - bldgH + 8 * zoom);
      ctx.lineTo(pLeft.x - 4 * zoom, pLeft.y - bldgH);
      ctx.closePath();
      ctx.fillStyle = def.themeColor;
      ctx.fill();

      // Awning stripes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(center.x - 8 * zoom, center.y - bldgH - 6 * zoom);
      ctx.lineTo(center.x - 8 * zoom, center.y - bldgH + 4 * zoom);
      ctx.moveTo(center.x + 8 * zoom, center.y - bldgH - 6 * zoom);
      ctx.lineTo(center.x + 8 * zoom, center.y - bldgH + 4 * zoom);
      ctx.stroke();

      // Service counter & icon sign
      ctx.fillStyle = '#0f172a';
      ctx.font = `${Math.max(10, 14 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      const iconChar = def.category === 'food' ? '🍔' : def.category === 'drinks' ? '🥤' : '🛍️';
      ctx.fillText(iconChar, center.x, center.y - bldgH - 8 * zoom);
    }
    // 4. DECORATIONS
    else if (def.category === 'decorations') {
      if (def.id === 'decor_palm_tree') {
        // Swaying Palm Tree
        const sway = Math.sin(time * 1.5) * (3 * zoom);
        // Trunk
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4 * zoom;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.quadraticCurveTo(center.x + 6 * zoom, center.y - 18 * zoom, center.x + sway, center.y - 36 * zoom);
        ctx.stroke();

        // Lush Green Fronds
        const topX = center.x + sway;
        const topY = center.y - 36 * zoom;
        ctx.fillStyle = '#16a34a';
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3 + time * 0.2;
          ctx.beginPath();
          ctx.ellipse(
            topX + Math.cos(angle) * 14 * zoom,
            topY + Math.sin(angle) * 8 * zoom,
            12 * zoom,
            5 * zoom,
            angle,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        // Coconuts
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(topX, topY + 2 * zoom, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      } else if (def.id === 'decor_fountain') {
        // Dancing Fountain Basin
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, 16 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();

        // Water Jets shooting up
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2 * zoom;
        const jetH = (Math.sin(time * 4) * 6 + 20) * zoom;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x, center.y - jetH);
        ctx.moveTo(center.x - 6 * zoom, center.y);
        ctx.quadraticCurveTo(center.x - 8 * zoom, center.y - jetH * 0.7, center.x - 12 * zoom, center.y);
        ctx.moveTo(center.x + 6 * zoom, center.y);
        ctx.quadraticCurveTo(center.x + 8 * zoom, center.y - jetH * 0.7, center.x + 12 * zoom, center.y);
        ctx.stroke();
      } else if (def.id === 'decor_umbrella_chairs') {
        // Beach Loungers
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(center.x - 10 * zoom, center.y - 4 * zoom, 8 * zoom, 5 * zoom);
        ctx.fillRect(center.x + 2 * zoom, center.y - 4 * zoom, 8 * zoom, 5 * zoom);

        // Sun Umbrella
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x, center.y - 24 * zoom);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(center.x, center.y - 24 * zoom, 12 * zoom, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
      } else if (def.id === 'decor_trash_bin') {
        // Trash bin container
        ctx.fillStyle = '#334155';
        ctx.fillRect(center.x - 4 * zoom, center.y - 12 * zoom, 8 * zoom, 12 * zoom);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(center.x - 5 * zoom, center.y - 14 * zoom, 10 * zoom, 3 * zoom);
      } else {
        // Generic decoration
        ctx.fillStyle = def.themeColor;
        ctx.beginPath();
        ctx.arc(center.x, center.y - 8 * zoom, 8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // 5. FACILITIES & SPECIAL
    else {
      const bldgH = 26 * zoom;
      ctx.fillStyle = def.themeColor;
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y - bldgH);
      ctx.lineTo(pRight.x, pRight.y - bldgH);
      ctx.lineTo(pBottom.x, pBottom.y - bldgH);
      ctx.lineTo(pLeft.x, pLeft.y - bldgH);
      ctx.closePath();
      ctx.fill();

      // Walls
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.lineTo(pBottom.x, pBottom.y - bldgH);
      ctx.lineTo(pLeft.x, pLeft.y - bldgH);
      ctx.closePath();
      ctx.fill();

      // Label / icon
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(9, 12 * zoom)}px 'Fredoka', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(def.name.split(' ')[0], center.x, center.y - bldgH - 6 * zoom);
    }

    // Attraction Level Badge (if level > 1)
    if (b.level > 1) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(center.x, center.y - 30 * zoom, 8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(8, 10 * zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`L${b.level}`, center.x, center.y - 30 * zoom);
    }

    ctx.restore();
  };

  // Helper: Draw Animated Visitor
  const drawVisitor = (
    ctx: CanvasRenderingContext2D,
    v: Visitor,
    sx: number,
    sy: number,
    zoom: number,
    time: number,
    showNames: boolean
  ) => {
    ctx.save();
    const isWalking = v.state === 'walking' || v.state === 'heading_to_attraction' || v.state === 'leaving';
    const isSwimming = v.state === 'riding';
    const bob = isWalking ? Math.sin(time * 12 + v.x * 3) * (2 * zoom) : 0;

    const posY = sy - 8 * zoom + bob;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 5 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isSwimming) {
      // Swimming in water ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 2 * zoom, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Head with goggles
      ctx.fillStyle = '#fbcfe8'; // Skin tone
      ctx.beginPath();
      ctx.arc(sx, posY, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Goggles
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(sx - 3 * zoom, posY - 1 * zoom, 6 * zoom, 2 * zoom);
    } else {
      // Floatie Ring around waist if they have one!
      if (v.hasFloatie && v.floatieColor) {
        ctx.fillStyle = v.floatieColor;
        ctx.beginPath();
        ctx.ellipse(sx, posY + 4 * zoom, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 * zoom;
        ctx.stroke();
      }

      // Body / Swimsuit
      ctx.fillStyle = v.swimsuitColor;
      ctx.beginPath();
      ctx.ellipse(sx, posY + 3 * zoom, 3.5 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#fed7aa'; // Natural friendly skin tone
      ctx.beginPath();
      ctx.arc(sx, posY - 4 * zoom, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Hair or Sunglasses if VIP
      if (v.type === 'VIP') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(sx - 3 * zoom, posY - 5 * zoom, 6 * zoom, 2 * zoom);
        // Golden crown indicator
        ctx.fillStyle = '#eab308';
        ctx.font = `${Math.max(8, 10 * zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('👑', sx, posY - 10 * zoom);
      }
    }

    // Emotion bubble if hungry, tired, or unhappy
    if (v.hunger < 25) {
      ctx.font = `${Math.max(8, 11 * zoom)}px sans-serif`;
      ctx.fillText('🍔', sx + 6 * zoom, posY - 8 * zoom);
    } else if (v.energy < 25) {
      ctx.font = `${Math.max(8, 11 * zoom)}px sans-serif`;
      ctx.fillText('😴', sx + 6 * zoom, posY - 8 * zoom);
    } else if (v.fun > 80) {
      ctx.font = `${Math.max(8, 11 * zoom)}px sans-serif`;
      ctx.fillText('😄', sx + 6 * zoom, posY - 8 * zoom);
    }

    // Name label
    if (showNames && zoom > 0.8) {
      ctx.fillStyle = '#0f172a';
      ctx.font = `600 ${Math.max(8, 9 * zoom)}px 'Quicksand', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(v.name.split(' ')[0], sx, posY - 10 * zoom);
    }

    ctx.restore();
  };

  // Pointer event handlers for drag, zoom, tap
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.lastMouseX = e.clientX;
    cameraRef.current.lastMouseY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    if (cam.isDragging) {
      const dx = e.clientX - cam.lastMouseX;
      const dy = e.clientY - cam.lastMouseY;
      const sens = parkState.settings?.cameraSensitivity ?? 1.0;
      cam.x += dx * sens;
      cam.y += dy * sens;
      cam.lastMouseX = e.clientX;
      cam.lastMouseY = e.clientY;
    }

    // Calculate hover tile
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const grid = screenToGrid(mouseX, mouseY, cam.x, cam.y, cam.zoom);
      if (grid.x >= 0 && grid.x < gridSize && grid.y >= 0 && grid.y < gridSize) {
        setHoverGrid(grid);
        onPlacementPosChange?.(grid.x, grid.y);
      } else {
        setHoverGrid(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    const wasDragging = Math.abs(e.clientX - cam.lastMouseX) > 4 || Math.abs(e.clientY - cam.lastMouseY) > 4;
    cam.isDragging = false;

    // If it was a clean tap (not drag)
    if (!wasDragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const grid = screenToGrid(mouseX, mouseY, cam.x, cam.y, cam.zoom);

      // If in placement mode, place building!
      if (placementDef && isPlacementValid && hoverGrid) {
        onConfirmPlacement(hoverGrid.x, hoverGrid.y);
        return;
      }

      // Check if tapped trash
      const tappedTrash = trashList.find(t => t.x === grid.x && t.y === grid.y);
      if (tappedTrash) {
        onCleanTrash(tappedTrash.id);
        sound.playSplash();
        return;
      }

      // Check if tapped a visitor
      const tappedVisitor = visitors.find(v => Math.floor(v.x) === grid.x && Math.floor(v.y) === grid.y);
      if (tappedVisitor) {
        onSelectVisitor(tappedVisitor);
        sound.playClick();
        return;
      }

      // Check if tapped a building
      const tappedBuilding = parkState.buildings.find(b => {
        const def = CATALOG_MAP.get(b.defId);
        if (!def) return false;
        const w = (b.rotation === 90 || b.rotation === 270) ? def.height : def.width;
        const h = (b.rotation === 90 || b.rotation === 270) ? def.width : def.height;
        return grid.x >= b.x && grid.x < b.x + w && grid.y >= b.y && grid.y < b.y + h;
      });

      if (tappedBuilding) {
        onSelectBuilding(tappedBuilding);
        sound.playClick();
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    cam.zoom = Math.max(0.4, Math.min(2.2, cam.zoom * zoomDelta));
  };

  // Keyboard shortcut listener (R = rotate, Escape = cancel placement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        // Trigger rotate in parent through custom event or placement rotation prop
        window.dispatchEvent(new CustomEvent('wtp_rotate_placement'));
      } else if (e.key === 'Escape') {
        onCancelPlacement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancelPlacement]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Zoom Controls for Mobile & Quick Camera */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-2 z-20">
        <button
          onClick={() => {
            cameraRef.current.zoom = Math.min(2.2, cameraRef.current.zoom * 1.25);
            sound.playClick();
          }}
          className="w-11 h-11 rounded-full bg-white/95 text-slate-800 shadow-lg border border-sky-200 flex items-center justify-center font-bold text-xl active:scale-95 transition-transform"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => {
            cameraRef.current.zoom = Math.max(0.4, cameraRef.current.zoom * 0.8);
            sound.playClick();
          }}
          className="w-11 h-11 rounded-full bg-white/95 text-slate-800 shadow-lg border border-sky-200 flex items-center justify-center font-bold text-xl active:scale-95 transition-transform"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              cameraRef.current.x = canvas.clientWidth / 2;
              cameraRef.current.y = canvas.clientHeight / 4;
              cameraRef.current.zoom = 1.0;
            }
            sound.playClick();
          }}
          className="w-11 h-11 rounded-full bg-sky-500 text-white shadow-lg border border-sky-300 flex items-center justify-center font-bold text-sm active:scale-95 transition-transform"
          title="Reset Camera"
        >
          🎯
        </button>
      </div>
    </div>
  );
};
