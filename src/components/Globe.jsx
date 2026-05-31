import React, { useEffect, useRef, useState } from 'react';
import { THREAT_LOCATIONS } from '../data/threatLocations';

// 1. Stylized 2D Vector Continent Boundary Polygons (Fully Scalable & Offline-Compatible)
const CONTINENTS = [
  {
    name: 'NORTH AMERICA',
    points: [
      { lat: 70, lon: -160 }, { lat: 75, lon: -120 }, { lat: 80, lon: -80 }, { lat: 75, lon: -50 },
      { lat: 60, lon: -55 }, { lat: 50, lon: -50 }, { lat: 25, lon: -75 }, { lat: 10, lon: -80 },
      { lat: 15, lon: -95 }, { lat: 20, lon: -105 }, { lat: 30, lon: -115 }, { lat: 48, lon: -125 },
      { lat: 60, lon: -140 }, { lat: 65, lon: -165 }
    ]
  },
  {
    name: 'SOUTH AMERICA',
    points: [
      { lat: 12, lon: -72 }, { lat: 10, lon: -60 }, { lat: -5, lon: -35 }, { lat: -20, lon: -40 },
      { lat: -35, lon: -50 }, { lat: -55, lon: -68 }, { lat: -52, lon: -74 }, { lat: -38, lon: -73 },
      { lat: -20, lon: -70 }, { lat: -5, lon: -80 }, { lat: 5, lon: -80 }
    ]
  },
  {
    name: 'EURASIA',
    points: [
      { lat: 70, lon: -10 }, { lat: 73, lon: 30 }, { lat: 76, lon: 60 }, { lat: 73, lon: 100 },
      { lat: 70, lon: 140 }, { lat: 68, lon: 170 }, { lat: 58, lon: 175 }, { lat: 40, lon: 145 },
      { lat: 35, lon: 140 }, { lat: 22, lon: 115 }, { lat: 10, lon: 105 }, { lat: 5, lon: 95 },
      { lat: 10, lon: 80 }, { lat: 20, lon: 70 }, { lat: 12, lon: 45 }, { lat: 30, lon: 33 },
      { lat: 36, lon: -5 }, { lat: 55, lon: -10 }
    ]
  },
  {
    name: 'AFRICA',
    points: [
      { lat: 36, lon: -6 }, { lat: 32, lon: 12 }, { lat: 31, lon: 32 }, { lat: 12, lon: 43 },
      { lat: -5, lon: 39 }, { lat: -25, lon: 33 }, { lat: -34, lon: 18 }, { lat: -20, lon: 12 },
      { lat: 5, lon: 8 }, { lat: 10, lon: -14 }, { lat: 18, lon: -16 }
    ]
  },
  {
    name: 'AUSTRALIA',
    points: [
      { lat: -12, lon: 130 }, { lat: -10, lon: 142 }, { lat: -25, lon: 153 }, { lat: -38, lon: 147 },
      { lat: -35, lon: 117 }, { lat: -22, lon: 113 }
    ]
  },
  {
    name: 'GREENLAND',
    points: [
      { lat: 78, lon: -70 }, { lat: 83, lon: -40 }, { lat: 80, lon: -10 }, { lat: 70, lon: -20 },
      { lat: 60, lon: -44 }, { lat: 68, lon: -55 }
    ]
  }
];

// 2. Tactical Headquarters Command Sectors (Hover highlights entire military command sectors!)
const SECTORS = [
  { id: 'nyc', name: 'NORTH AMERICAN COMMAND', latRange: [10, 85], lonRange: [-170, -45], color: 'rgba(0, 240, 255, 0.05)', strokeColor: 'rgba(0, 240, 255, 0.15)' },
  { id: 'kyiv', name: 'EAST-BLOCK COMMAND', latRange: [40, 80], lonRange: [15, 60], color: 'rgba(255, 170, 0, 0.05)', strokeColor: 'rgba(255, 170, 0, 0.15)' },
  { id: 'baghdad', name: 'MIDDLE EAST OUTPOST', latRange: [15, 45], lonRange: [30, 60], color: 'rgba(255, 0, 85, 0.05)', strokeColor: 'rgba(255, 0, 85, 0.15)' },
  { id: 'tokyo', name: 'APAC HEADQUARTERS', latRange: [5, 60], lonRange: [90, 160], color: 'rgba(57, 255, 20, 0.05)', strokeColor: 'rgba(57, 255, 20, 0.15)' },
  { id: 'cairo', name: 'AFRICA-NORTH RELAY', latRange: [5, 40], lonRange: [-20, 35], color: 'rgba(255, 170, 0, 0.05)', strokeColor: 'rgba(255, 170, 0, 0.15)' },
  { id: 'amazon', name: 'LATAM COVERT SECTOR', latRange: [-60, 15], lonRange: [-90, -30], color: 'rgba(0, 240, 255, 0.05)', strokeColor: 'rgba(0, 240, 255, 0.15)' }
];

// 3. Undersea Fiber Cables & Subsea Breaches
const SUBSEA_CABLES = [
  { name: 'TAT-14 (ATLANTIC BREACHED)', points: [{ lat: 38.9, lon: -77.0 }, { lat: 50.4, lon: 15.0 }] },
  { name: 'SEA-ME-WE 5 (MEDITERRANEAN CORE)', points: [{ lat: 50.4, lon: 15.0 }, { lat: 30.0, lon: 31.2 }, { lat: 33.3, lon: 44.3 }] },
  { name: 'APG (APAC GATEWAY)', points: [{ lat: 33.3, lon: 44.3 }, { lat: 30.0, lon: 31.2 }, { lat: 35.7, lon: 139.6 }] },
  { name: 'AMAZON SEGMENT-1', points: [{ lat: 38.9, lon: -77.0 }, { lat: -3.4, lon: -62.2 }] }
];

// 4. Moving Carrier Groups (Fleets)
const FLEETS = [
  { id: 'ford', name: 'CVN-78 FORD GROUP', startLat: 32, startLon: -58, endLat: 46, endLon: -28, speed: 0.022, color: '#00f0ff' },
  { id: 'reagan', name: 'CVN-76 REAGAN GROUP', startLat: 12, startLon: 122, endLat: 28, endLon: 144, speed: 0.026, color: '#39ff14' }
];

// 5. Hidden ICBM Launcher Silos
const SILOS = [
  { name: 'SILO-DELTA (NORTH DAKOTA)', lat: 48.5, lon: -101.3, status: 'STANDBY', color: '#39ff14' },
  { name: 'SILO-SIBERIA (TAIGA SECTOR)', lat: 61.5, lon: 96.2, status: 'LAUNCH_READY', color: '#00f0ff' },
  { name: 'SILO-GOBI (APAC DESERT)', lat: 42.5, lon: 105.1, status: 'CALIBRATING', color: '#ffaa00' }
];

// 6. Natural Disasters & Space Weather Anomalies
const TACTICAL_ANOMALIES = [
  { name: '[GEOTHERMAL SEISMIC: 6.8 SR]', lat: 35.6, lon: 139.6, type: 'SEISMIC', color: '#ff0055' },
  { name: '[SOLAR FLARE EM RADIATION SECTOR]', lat: 64, lon: -102, type: 'SOLAR', radius: 40, color: 'rgba(255, 170, 0, 0.07)' }
];

export default function Globe({ activeNode, onSelectNode, defconLevel }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Track states inside animation loops to avoid react render lag
  const activeNodeRef = useRef(activeNode);
  const defconLevelRef = useRef(defconLevel);
  const [zoomLevelState, setZoomLevelState] = useState(100);
  const [activeSectorHUD, setActiveSectorHUD] = useState('ALL SECTORS MONITORING');

  useEffect(() => {
    activeNodeRef.current = activeNode;
  }, [activeNode]);

  useEffect(() => {
    defconLevelRef.current = defconLevel;
  }, [defconLevel]);

  const resetViewportRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    // Viewport transform states
    let zoom = 1.0;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let hoveredSector = null;

    resetViewportRef.current = () => {
      zoom = 1.0;
      offsetX = 0;
      offsetY = 0;
      setZoomLevelState(100);
    };

    // Handle resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
        }
      }
    });
    resizeObserver.observe(container);

    let scanLineY = 0;
    let scanLineDirection = 1;
    let pulseTime = 0;

    // Scale Lat/Lon to Canvas coordinate grid
    const mapCoords = (lat, lon, width, height) => {
      const xMargin = width * 0.16;
      const drawableWidth = width - xMargin * 2;
      const x = xMargin + ((lon + 180) / 360) * drawableWidth;

      const yMargin = height * 0.18;
      const drawableHeight = height - yMargin * 2;
      const y = yMargin + ((90 - lat) / 180) * drawableHeight;

      return { x, y };
    };

    // Scale Screen Coordinates to Geographical Lat/Lon
    const mapXYToLatLon = (x, y, width, height) => {
      const xMargin = width * 0.16;
      const drawableWidth = width - xMargin * 2;
      const lon = ((x - xMargin) / drawableWidth) * 360 - 180;

      const yMargin = height * 0.18;
      const drawableHeight = height - yMargin * 2;
      const lat = 90 - ((y - yMargin) / drawableHeight) * 180;

      return { lat, lon };
    };

    function render2DGrid() {
      const w = canvas.width;
      const h = canvas.height;
      if (!ctx || w === 0 || h === 0) {
        animId = requestAnimationFrame(render2DGrid);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const currentActiveNode = activeNodeRef.current;
      const { x: meridianX, y: equatorY } = mapCoords(0, 0, w, h);

      // Save untransformed screen-space state
      ctx.save();

      // Apply Zoom & Pan Matrix
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoom, zoom);

      // --- 1. Draw Dotted Background Grid ---
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 1;
      const spacing = 30;
      
      const startX = -offsetX / zoom;
      const endX = (w - offsetX) / zoom;
      const startY = -offsetY / zoom;
      const endY = (h - offsetY) / zoom;

      ctx.beginPath();
      ctx.setLineDash([1, 4]);
      for (let x = Math.floor(startX / spacing) * spacing; x < endX; x += spacing) {
        ctx.moveTo(x, startY); ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / spacing) * spacing; y < endY; y += spacing) {
        ctx.moveTo(startX, y); ctx.lineTo(endX, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // --- 2. Draw 2D Vector Geographical Landmasses (Holographic Continent Polygons) ---
      CONTINENTS.forEach(cont => {
        ctx.beginPath();
        cont.points.forEach((p, idx) => {
          const { x, y } = mapCoords(p.lat, p.lon, w, h);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();

        // High-tech blueprint translucent fill
        ctx.fillStyle = 'rgba(0, 240, 255, 0.02)';
        ctx.fill();

        // Neon border stroke
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
        ctx.lineWidth = 1 / zoom;
        ctx.stroke();
      });

      // --- 3. Draw Tactical Command Sectors Grid Box (Highlights on hover/click) ---
      SECTORS.forEach(sec => {
        const { x: x1, y: y1 } = mapCoords(sec.latRange[1], sec.lonRange[0], w, h);
        const { x: x2, y: y2 } = mapCoords(sec.latRange[0], sec.lonRange[1], w, h);

        const isHovered = hoveredSector && hoveredSector.id === sec.id;
        const isCurrentActive = activeNodeRef.current && activeNodeRef.current.id === sec.id;

        // Draw sector boundary box
        ctx.strokeStyle = isCurrentActive ? 'rgba(255, 0, 85, 0.3)' : isHovered ? sec.strokeColor : 'rgba(0, 240, 255, 0.04)';
        ctx.fillStyle = isCurrentActive ? 'rgba(255, 0, 85, 0.03)' : isHovered ? sec.color : 'rgba(0, 0, 0, 0)';
        ctx.lineWidth = isCurrentActive ? 1.5 / zoom : 1 / zoom;
        
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.fill();
        ctx.stroke();

        // Sector ID tags
        ctx.fillStyle = isCurrentActive ? '#ff0055' : isHovered ? 'rgba(0, 240, 255, 0.8)' : 'rgba(0, 240, 255, 0.18)';
        ctx.font = `bold ${8 / zoom}px "Share Tech Mono"`;
        ctx.textAlign = 'left';
        ctx.fillText(sec.name, x1 + 6 / zoom, y1 + 12 / zoom);
      });

      // --- 4. Draw Undersea Fiber Cable Streams (Tracker 1) ---
      SUBSEA_CABLES.forEach(cable => {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        cable.points.forEach((p, idx) => {
          const { x, y } = mapCoords(p.lat, p.lon, w, h);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw glowing splitters (flashing breach indicators at terminals)
        cable.points.forEach(p => {
          const { x, y } = mapCoords(p.lat, p.lon, w, h);
          const isBreached = p.lat === 30.0 && p.lon === 31.2; // Cairo splitter flagged breached
          
          ctx.fillStyle = isBreached ? '#ffaa00' : 'rgba(0, 240, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(x, y, 2.5 / zoom, 0, Math.PI * 2);
          ctx.fill();

          if (isBreached && (Math.floor(pulseTime * 2) % 2 === 0)) {
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 1 / zoom;
            ctx.strokeRect(x - 5 / zoom, y - 5 / zoom, 10 / zoom, 10 / zoom);
          }
        });
      });

      // --- 5. Draw Naval Fleet Aircraft Carriers Moving in Real-Time (Tracker 1) ---
      pulseTime += 0.05;
      FLEETS.forEach(fleet => {
        const progress = (pulseTime * fleet.speed) % 1;
        const currentLat = fleet.startLat + (fleet.endLat - fleet.startLat) * progress;
        const currentLon = fleet.startLon + (fleet.endLon - fleet.startLon) * progress;

        const { x, y } = mapCoords(currentLat, currentLon, w, h);

        // Fleet triangle carrier marker
        ctx.fillStyle = fleet.color;
        ctx.beginPath();
        ctx.moveTo(x, y - 4 / zoom);
        ctx.lineTo(x - 3 / zoom, y + 3 / zoom);
        ctx.lineTo(x + 3 / zoom, y + 3 / zoom);
        ctx.closePath();
        ctx.fill();

        // Label details
        ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
        ctx.font = `${6.5 / zoom}px "Share Tech Mono"`;
        ctx.textAlign = 'center';
        ctx.fillText(fleet.name, x, y + 10 / zoom);
      });

      // --- 6. Draw ICBM Nuclear Silos & Balistic Trajectory Warning (Tracker 2) ---
      SILOS.forEach(silo => {
        const { x, y } = mapCoords(silo.lat, silo.lon, w, h);

        // Silo marker box
        ctx.fillStyle = silo.color;
        ctx.fillRect(x - 2 / zoom, y - 2 / zoom, 4 / zoom, 4 / zoom);
        ctx.strokeStyle = silo.color;
        ctx.strokeRect(x - 4 / zoom, y - 4 / zoom, 8 / zoom, 8 / zoom);

        // Silo label
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.font = `${6.5 / zoom}px "Share Tech Mono"`;
        ctx.textAlign = 'left';
        ctx.fillText(silo.name, x + 6 / zoom, y + 2 / zoom);
      });

      // Simulate Ballistic Trajectory if DEFCON is 1
      if (defconLevelRef.current === 1) {
        // Source Silo (Siberia) and target node (Baghdad Outpost)
        const src = mapCoords(61.5, 96.2, w, h);
        const dest = mapCoords(33.3128, 44.3615, w, h);

        // Interpolated ballistic flight line
        const launchProgress = (pulseTime * 0.25) % 1;
        const currentBallisticX = src.x + (dest.x - src.x) * launchProgress;
        const currentBallisticY = src.y + (dest.y - src.y) * launchProgress - Math.sin(launchProgress * Math.PI) * (120 / zoom); // parabolic arc trajectory

        // Draw dotted missile path
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([3 / zoom, 3 / zoom]);
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo((src.x + dest.x) / 2, Math.min(src.y, dest.y) - 120 / zoom, dest.x, dest.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated missile missile warning cursor
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(currentBallisticX, currentBallisticY, 4 / zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `bold ${8 / zoom}px "Share Tech Mono"`;
        ctx.fillText('☢ ICBM IN FLIGHT - IMPACT MINUTE LOCK', currentBallisticX + 6 / zoom, currentBallisticY - 2 / zoom);
      }

      // --- 7. Draw Environmental Seismic Anomalies & Solar Radiation Storms (Tracker 3) ---
      TACTICAL_ANOMALIES.forEach(anom => {
        const { x, y } = mapCoords(anom.lat, anom.lon, w, h);

        if (anom.type === 'SEISMIC') {
          // Pulse seismic fault lines (red pulsing crosshair)
          const sz = (8 + (pulseTime % 1.5) * 8) / zoom;
          ctx.strokeStyle = 'rgba(255, 0, 85, 0.6)';
          ctx.lineWidth = 1 / zoom;
          ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz);

          ctx.fillStyle = anom.color;
          ctx.fillRect(x - 2.5 / zoom, y - 2.5 / zoom, 5 / zoom, 5 / zoom);
          
          ctx.font = `${6.5 / zoom}px "Share Tech Mono"`;
          ctx.fillText(anom.name, x - 25 / zoom, y - 10 / zoom);
        } else if (anom.type === 'SOLAR') {
          // Solar radiation concentric pulsing rings
          const rad = (30 + Math.sin(pulseTime * 2) * 10) / zoom;
          ctx.strokeStyle = 'rgba(255, 170, 0, 0.15)';
          ctx.lineWidth = 1 / zoom;
          ctx.setLineDash([2 / zoom, 4 / zoom]);
          ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = anom.color;
          ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = 'rgba(255, 170, 0, 0.8)';
          ctx.font = `${6.5 / zoom}px "Share Tech Mono"`;
          ctx.fillText(anom.name, x - 40 / zoom, y - 5 / zoom);
        }
      });

      // --- 8. Draw Equator & Prime Meridian Axis ---
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1.2 / zoom;
      ctx.beginPath(); ctx.moveTo(-w * 2, equatorY); ctx.lineTo(w * 3, equatorY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(meridianX, -h * 2); ctx.lineTo(meridianX, h * 3); ctx.stroke();

      // --- 9. Draw Threat Coordinate Node Crosshairs ---
      THREAT_LOCATIONS.forEach(loc => {
        const { x, y } = mapCoords(loc.lat, loc.lon, w, h);
        const isThisActive = currentActiveNode && currentActiveNode.id === loc.id;

        const baseSize = 8;
        const squareSize = baseSize + (pulseTime % 1.2) * 6;
        const opacity = Math.max(0, 0.7 - (squareSize - baseSize) / 7.2);
        
        ctx.strokeStyle = `rgba(${isThisActive ? '255,0,85' : '0,240,255'}, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);

        ctx.fillStyle = loc.color;
        ctx.fillRect(x - 2.5, y - 2.5, 5, 5);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 1, y - 1, 2, 2);

        // Crosshairs ticks
        ctx.strokeStyle = loc.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 6, y); ctx.lineTo(x - 3, y);
        ctx.moveTo(x + 3, y); ctx.lineTo(x + 6, y);
        ctx.moveTo(x, y - 6); ctx.lineTo(x, y - 3);
        ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 6);
        ctx.stroke();

        ctx.fillStyle = isThisActive ? '#ff0055' : 'rgba(226, 232, 240, 0.8)';
        ctx.font = isThisActive ? 'bold 9px "Share Tech Mono"' : '9px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(loc.name.split(' // ')[0], x, y - 10);
      });

      // --- 10. Draw Selected Target Lock Brackets ---
      if (currentActiveNode) {
        const { x, y } = mapCoords(currentActiveNode.lat, currentActiveNode.lon, w, h);

        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1.5;
        const bSize = 13 + Math.sin(pulseTime * 5) * 2;

        // Top Left
        ctx.beginPath();
        ctx.moveTo(x - bSize, y - bSize + 4); ctx.lineTo(x - bSize, y - bSize); ctx.lineTo(x - bSize + 4, y - bSize); ctx.stroke();
        // Top Right
        ctx.beginPath();
        ctx.moveTo(x + bSize, y - bSize + 4); ctx.lineTo(x + bSize, y - bSize); ctx.lineTo(x + bSize - 4, y - bSize); ctx.stroke();
        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(x - bSize, y + bSize - 4); ctx.lineTo(x - bSize, y + bSize); ctx.lineTo(x - bSize + 4, y + bSize); ctx.stroke();
        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(x + bSize, y + bSize - 4); ctx.lineTo(x + bSize, y + bSize); ctx.lineTo(x + bSize - 4, y + bSize); ctx.stroke();

        // Coordinate Projections
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, equatorY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(meridianX, y); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 8.5px "Share Tech Mono"';
        ctx.textAlign = 'left';
        ctx.fillText(`LOCKED // LAT: ${currentActiveNode.lat.toFixed(4)}°`, x + bSize + 4, y - 4);
        ctx.fillText(`LON: ${currentActiveNode.lon.toFixed(4)}°`, x + bSize + 4, y + 6);
      }

      // Restore transform state to draw floating, static screen-space HUD components
      ctx.restore();

      // --- 11. Screen-Space Horizontal Scanner Sweep Bar ---
      scanLineY += 1.2 * scanLineDirection;
      if (scanLineY > h - 15 || scanLineY < 15) {
        scanLineDirection *= -1;
      }

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, scanLineY);
      ctx.lineTo(w - 20, scanLineY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 240, 255, 0.015)';
      ctx.fillRect(20, scanLineDirection > 0 ? scanLineY - 18 : scanLineY, w - 40, 18);

      animId = requestAnimationFrame(render2DGrid);
    }

    // --- MOUSE ZOOM AND PAN MATRIX EVENT BINDINGS ---

    function handleWheel(event) {
      event.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const zoomIntensity = 0.08;
      const prevZoom = zoom;

      if (event.deltaY < 0) {
        zoom = Math.min(zoom * (1 + zoomIntensity), 6.0);
      } else {
        zoom = Math.max(zoom * (1 - zoomIntensity), 0.5);
      }

      // Zoom towards mouse cursor coordinates
      offsetX = mouseX - (mouseX - offsetX) * (zoom / prevZoom);
      offsetY = mouseY - (mouseY - offsetY) * (zoom / prevZoom);

      setZoomLevelState(Math.round(zoom * 100));
    }

    function handleMouseDown(event) {
      isDragging = true;
      dragStartX = event.clientX - offsetX;
      dragStartY = event.clientY - offsetY;
      container.style.cursor = 'grabbing';
    }

    function handleMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const w = canvas.width;
      const h = canvas.height;

      if (isDragging) {
        offsetX = event.clientX - dragStartX;
        offsetY = event.clientY - dragStartY;
        return;
      }

      // Convert mouse client coordinates to transformed grid coordinate system
      const tx = (clickX - offsetX) / zoom;
      const ty = (clickY - offsetY) / zoom;

      // 1. Identify which command sector is hovered based on Lat/Lon calculations
      const geo = mapXYToLatLon(tx, ty, w, h);
      let foundSector = null;
      for (let sec of SECTORS) {
        if (geo.lat >= sec.latRange[0] && geo.lat <= sec.latRange[1] &&
            geo.lon >= sec.lonRange[0] && geo.lon <= sec.lonRange[1]) {
          foundSector = sec;
          break;
        }
      }

      if (foundSector !== hoveredSector) {
        hoveredSector = foundSector;
        setActiveSectorHUD(foundSector ? foundSector.name : 'ALL SECTORS MONITORING');
      }

      // 2. Adjust cursor style if hovering over a threat node marker
      let overNode = false;
      for (let loc of THREAT_LOCATIONS) {
        const { x, y } = mapCoords(loc.lat, loc.lon, w, h);
        const dist = Math.hypot(tx - x, ty - y);
        if (dist < 15) {
          overNode = true;
          break;
        }
      }

      if (overNode) {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'grab';
      }
    }

    function handleMouseUpOrLeave() {
      isDragging = false;
      container.style.cursor = 'grab';
    }

    // Handle clicks inside transformed coordinate grid
    function handleCanvasClick(event) {
      if (isDragging && (Math.abs(event.clientX - dragStartX) > 2 || Math.abs(event.clientY - dragStartY) > 2)) {
        return; // drag event, not click
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const w = canvas.width;
      const h = canvas.height;

      const tx = (clickX - offsetX) / zoom;
      const ty = (clickY - offsetY) / zoom;

      // First check click distance to threat coordinate nodes
      let clickedNode = null;
      for (let loc of THREAT_LOCATIONS) {
        const { x, y } = mapCoords(loc.lat, loc.lon, w, h);
        const dist = Math.hypot(tx - x, ty - y);
        if (dist < 18) {
          clickedNode = loc;
          break;
        }
      }

      if (clickedNode) {
        const clickSound = document.getElementById('snd-click');
        if (clickSound) {
          clickSound.currentTime = 0;
          clickSound.play().catch(() => {});
        }
        onSelectNode(clickedNode);
        return;
      }

      // Alternatively, click inside a Sector boundary box to focus/select its node
      const geo = mapXYToLatLon(tx, ty, w, h);
      let clickedSector = null;
      for (let sec of SECTORS) {
        if (geo.lat >= sec.latRange[0] && geo.lat <= sec.latRange[1] &&
            geo.lon >= sec.lonRange[0] && geo.lon <= sec.lonRange[1]) {
          clickedSector = sec;
          break;
        }
      }

      if (clickedSector) {
        const matchNode = THREAT_LOCATIONS.find(loc => loc.id === clickedSector.id);
        if (matchNode) {
          const clickSound = document.getElementById('snd-click');
          if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
          }
          onSelectNode(matchNode);
        }
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUpOrLeave);
    canvas.addEventListener('mouseleave', handleMouseUpOrLeave);
    canvas.addEventListener('click', handleCanvasClick);

    render2DGrid();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUpOrLeave);
      canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [onSelectNode]);

  return (
    <div ref={containerRef} className="flex-grow w-full min-h-0 relative select-none">
      
      {/* 2D Grid Canvas Plotter */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>

      {/* Floating HUD: Command Sector Tracker */}
      <div className="absolute top-3 left-3 pointer-events-none z-20 font-mono text-[10px] text-slate-400 space-y-0.5 bg-black/60 p-2.5 rounded border border-slate-800">
        <p className="text-glow-cyan text-cyber-cyan font-bold tracking-wider">// RADAR Command Sector active</p>
        <p>SECTOR LOCATION: <span className="text-cyber-green">{activeSectorHUD}</span></p>
        <p>DISASTER SENSORS: <span className="text-cyber-cyan">2 ACTIVE</span></p>
        <p>TACTICAL UPLINK: <span className="text-cyber-cyan">COORDINATE GRID</span></p>
      </div>

      {/* Floating Advanced HUD: Zoom & Reset Controls */}
      <div className="absolute bottom-20 right-4 z-30 font-mono text-[10px] bg-black/75 border border-slate-800 p-2 rounded flex flex-col space-y-1.5 pointer-events-auto">
        <div className="flex justify-between items-center space-x-4">
          <span className="text-slate-500">GRID VIEW SCALE:</span>
          <span className="text-cyber-cyan font-bold">{zoomLevelState}%</span>
        </div>
        
        <button
          onClick={() => {
            const clickSound = document.getElementById('snd-click');
            if (clickSound) {
              clickSound.currentTime = 0;
              clickSound.play().catch(() => {});
            }
            if (resetViewportRef.current) resetViewportRef.current();
          }}
          className="px-2 py-1 bg-cyber-cyan/15 border border-cyber-cyan/35 text-cyber-cyan font-display font-bold text-[9px] tracking-wider rounded hover:bg-cyber-cyan/35 transition-all text-center"
        >
          RESET RADAR VIEWPORT
        </button>
      </div>

      {/* Legend & Instructions HUD */}
      <div className="absolute bottom-20 left-4 z-30 pointer-events-none font-mono text-[8.5px] text-slate-500 bg-black/60 p-2 rounded border border-slate-900 flex flex-col space-y-1">
        <div className="text-slate-400 font-bold">// TACTICAL RADAR LEGEND:</div>
        <div className="flex items-center space-x-1.5">
          <span className="inline-block w-2.5 h-2 bg-cyber-cyan rounded-sm"></span>
          <span>SUBSEA FIBER LINK</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-cyber-cyan">▲</span>
          <span>MARITIME FLEET CARRIER</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-cyber-green">☢</span>
          <span>ICBM NUCL-SILO MONITOR</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-cyber-red">⬡</span>
          <span>SEISMIC FAULT ALARM</span>
        </div>
        <div className="text-[8px] text-slate-600 pt-1 border-t border-slate-900 mt-1">
          SCROLL MOUSE WHEEL TO ZOOM // DRAG GRID TO PAN // HOVER TO TRK SECTOR
        </div>
      </div>

    </div>
  );
}
