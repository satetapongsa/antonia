import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Bell, Orbit, Terminal, Cpu, Volume2, VolumeX, 
  RefreshCw, ShieldAlert, KeyRound, Maximize2, Minimize2, 
  X, XCircle, Target 
} from 'lucide-react';
import Globe from './components/Globe';
import { THREAT_LOCATIONS } from './data/threatLocations';

export default function App() {
  const [activeNode, setActiveNode] = useState(null); // start in ambient scanning mode
  const [defconLevel, setDefconLevel] = useState(4); // default normal/vigilant
  const [soundActive, setSoundActive] = useState(false);
  const [cctvZoomed, setCctvZoomed] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [threatEvents, setThreatEvents] = useState([
    { time: '15:20:10', type: 'COVERT PING', source: 'SAT-KH11', msg: 'Frequency burst detected in Sector 4B', status: 'WARN' },
    { time: '15:20:34', type: 'SYS DIAG', source: 'MAIN-NET', msg: 'Quantum firewall breach attempt blocked', status: 'SECURE' },
    { time: '15:21:05', type: 'COVERT SCAN', source: 'SAT-ONYX', msg: 'Thermal signature identified at coordinates', status: 'ALERT' }
  ]);
  const [radarSweeping, setRadarSweeping] = useState(false);
  const [interceptionModal, setInterceptionModal] = useState(false);
  const [interceptionProgress, setInterceptionProgress] = useState(0);
  const [interceptionLog, setInterceptionLog] = useState('');

  const cctvCanvasRef = useRef(null);
  const decryptionInterval = useRef(null);
  const ecgCanvasRef = useRef(null);

  // Audio References
  const clickSnd = useRef(null);
  const ambientSnd = useRef(null);
  const alertSnd = useRef(null);
  const radarSnd = useRef(null);

  // Initialize Sound references on mount
  useEffect(() => {
    clickSnd.current = document.getElementById('snd-click');
    ambientSnd.current = document.getElementById('snd-ambient');
    alertSnd.current = document.getElementById('snd-alert');
    radarSnd.current = document.getElementById('snd-radar');

    // Start background simulation tickers for random warning logs
    const alertInterval = setInterval(() => {
      const eventTypes = ['SIG INTERCEPT', 'TELEMETRY BURST', 'COVERT PING', 'GRID DIAGNOSTIC'];
      const sources = ['SAT-KH11', 'SAT-ONYX', 'SAT-LACROSSE', 'CYBER-FIREWALL'];
      const messages = [
        'Decryption buffer overflow detected',
        'Target transponder pulse signature synchronized',
        'Unauthorized satellite uplink established',
        'Packet routing abnormality flagged in central hub'
      ];
      const statuses = ['WARN', 'ALERT', 'INFO'];

      const randomEvent = {
        time: new Date().toLocaleTimeString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        msg: messages[Math.floor(Math.random() * messages.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };

      setThreatEvents(prev => [randomEvent, ...prev.slice(0, 15)]);

      if (soundActive && defconLevel <= 2) {
        triggerBeep();
      }
    }, 4500);

    return () => {
      clearInterval(alertInterval);
      if (decryptionInterval.current) clearInterval(decryptionInterval.current);
    };
  }, [soundActive, defconLevel]);

  // Ambient sound loops controllers
  useEffect(() => {
    if (!ambientSnd.current || !alertSnd.current || !radarSnd.current) return;

    if (soundActive) {
      ambientSnd.current.volume = 0.45;
      ambientSnd.current.play().catch(() => {});

      radarSnd.current.volume = 0.25;
      radarSnd.current.play().catch(() => {});

      if (defconLevel <= 2) {
        alertSnd.current.volume = 0.35;
        alertSnd.current.play().catch(() => {});
      } else {
        alertSnd.current.pause();
      }
    } else {
      ambientSnd.current.pause();
      alertSnd.current.pause();
      radarSnd.current.pause();
    }
  }, [soundActive, defconLevel]);

  // Handle Decryption Simulators
  useEffect(() => {
    if (decryptionInterval.current) clearInterval(decryptionInterval.current);

    const decryptedMessages = {
      nyc: '[SECURE] CYBERCOM GATEWAY ACTIVE. DEFENSE SHIELDS ROTATING. SATELLITE LINKS NORMAL. ZERO PENETRATION LOGS FOUND IN PREVIOUS 24 HOURS.',
      kyiv: '[ALERT] CRITICAL VOLTAGE LOSS DETECTED AT MAIN TRANSFORMER STATION. FREQUENCY CORRELATION MAP DETECTED COVERT NETWORK SCRAPER AT INCOMING BUS.',
      baghdad: '[CRITICAL] SECURE TRANSCEIVER EMITTING BURSTS IN WESTERN CANYON BLOCK. SIGINT REVEALS VOICE CODE: "STEEL RAIN READY." INITIATE AIRSCAN IMMEDIATELY.',
      tokyo: '[SECURE] QUANTUM COMPILER STEADY. CRYPTOGRAPHY PROTOCOL HYDRA VERIFIED. MAIN QUANTUM STORAGE TEMPERATURE AT 0.15 KELVIN.',
      cairo: '[WARNING] OUTGOING FIBER LINK ENCOUNTERING CORRUPTION PACKETS. DETECTED SPLITTER SIGNATURE AT MEDITERRANEAN UNDERSEA TERMINAL DELTA.',
      amazon: '[STANDBY] COVERT FLIGHT PROFILE RECORDED IN LATITUDE REGION. NO RADAR EMISSIONS REGISTERED. AIRFRAME SIGNATURE MATCHES TACTICAL COMBAT TRANSPORT.'
    };

    const targetMsg = activeNode 
      ? (decryptedMessages[activeNode.id] || decryptedMessages.nyc) 
      : 'GLOBAL SENSOR MATRIX SWEEPING... WAITING FOR ENCRYPTED FREQUENCY LOCK-ON... SYSTEM STANDBY STATUS OK.';
    
    let charIndex = 0;
    setDecryptionProgress(activeNode ? 0 : 100);

    decryptionInterval.current = setInterval(() => {
      charIndex += 1;
      const progress = Math.min((charIndex / targetMsg.length) * 100, 100);
      setDecryptionProgress(progress);

      let scrambled = targetMsg.substring(0, charIndex);
      if (charIndex < targetMsg.length) {
        const scramblePool = '01ABCDEF@#$%&*/?+=-X[]{}';
        for (let i = 0; i < 5; i++) {
          scrambled += scramblePool[Math.floor(Math.random() * scramblePool.length)];
        }
      }

      setDecryptedText(scrambled);

      if (charIndex >= targetMsg.length) {
        clearInterval(decryptionInterval.current);
      }
    }, 18);

  }, [activeNode]);

  // Canvas CCTV Live Video effect loop
  useEffect(() => {
    const canvas = cctvCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;

    let targetBoxX = canvas.width / 2;
    let targetBoxY = canvas.height / 2;
    let boxDirectionX = 0.5;
    let boxDirectionY = 0.3;
    let sweepY = 0;

    function drawCCTV() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!activeNode) {
        // Draw Clean Dotted Grid & Scanner when no coordinate selected
        ctx.fillStyle = '#020614';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple dotted background
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        ctx.lineWidth = 1;
        const spacing = 15;
        for (let x = 0; x < canvas.width; x += spacing) {
          ctx.beginPath(); ctx.setLineDash([1, 4]); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += spacing) {
          ctx.beginPath(); ctx.setLineDash([1, 4]); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        ctx.setLineDash([]);

        // Flat target crosshair bracket in the center
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx - 20, cy - 20, 40, 40);
        
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy); ctx.lineTo(cx - 5, cy);
        ctx.moveTo(cx + 5, cy); ctx.lineTo(cx + 30, cy);
        ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy - 5);
        ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy + 30);
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.font = '10px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('GLOBAL SENSOR OVERVIEW', cx, cy - 30);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.fillText('GRID MONITOR: STANDBY', cx, cy + 32);
        
        sweepY += 1.0;
        if (sweepY > canvas.height) sweepY = 0;
        
        // Dotted scanning bar
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(10, sweepY); ctx.lineTo(canvas.width - 10, sweepY);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.fillRect(10, sweepY - 8, canvas.width - 20, 8);
        
        animId = requestAnimationFrame(drawCCTV);
        return;
      }

      const isSignalLost = activeNode.id === 'baghdad';

      if (isSignalLost) {
        ctx.fillStyle = '#0a0d1b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 0, 85, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '14px "Share Tech Mono"';
        ctx.fillStyle = '#ff0055';
        ctx.textAlign = 'center';
        ctx.fillText('NO SATELLITE LINK // SIGNAL LOST', canvas.width / 2, canvas.height / 2);
        
        for (let i = 0; i < 20; i++) {
          const w = Math.random() * 50;
          const h = Math.random() * 10;
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
          ctx.fillRect(x, y, w, h);
        }
      } else {
        const isDegraded = activeNode.id === 'kyiv' || activeNode.id === 'cairo';
        const isThermal = activeNode.id === 'amazon';
        
        ctx.fillStyle = isThermal ? '#080101' : '#030d0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = isThermal ? 'rgba(255, 100, 0, 0.05)' : 'rgba(57, 255, 20, 0.06)';
        ctx.lineWidth = 1;
        const gridSpacing = 16;
        for (let x = 0; x < canvas.width; x += gridSpacing) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSpacing) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        ctx.strokeStyle = isThermal ? 'rgba(255, 100, 0, 0.18)' : 'rgba(57, 255, 20, 0.22)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width * 0.3, canvas.height - 50);
        ctx.lineTo(canvas.width * 0.7, canvas.height - 35);
        ctx.lineTo(canvas.width, canvas.height - 60);
        ctx.stroke();

        targetBoxX += boxDirectionX * 1.5;
        targetBoxY += boxDirectionY * 1.5;

        if (targetBoxX < 50 || targetBoxX > canvas.width - 50) boxDirectionX *= -1;
        if (targetBoxY < 40 || targetBoxY > canvas.height - 40) boxDirectionY *= -1;

        ctx.strokeStyle = isThermal ? '#ffaa00' : '#39ff14';
        ctx.lineWidth = 2;
        ctx.strokeRect(targetBoxX - 25, targetBoxY - 25, 50, 50);

        ctx.beginPath();
        ctx.moveTo(targetBoxX - 8, targetBoxY); ctx.lineTo(targetBoxX + 8, targetBoxY);
        ctx.moveTo(targetBoxX, targetBoxY - 8); ctx.lineTo(targetBoxX, targetBoxY + 8);
        ctx.stroke();

        ctx.fillStyle = isThermal ? '#ffaa00' : '#39ff14';
        ctx.font = '10px "Share Tech Mono"';
        ctx.textAlign = 'left';
        ctx.fillText(`TRK TARGET ID: [${activeNode.id.toUpperCase()}_04]`, targetBoxX + 30, targetBoxY - 15);
        ctx.fillText(`SIG: INTERCEPTED`, targetBoxX + 30, targetBoxY - 3);
        ctx.fillText(`SPD: 4.8 NM/S`, targetBoxX + 30, targetBoxY + 9);

        ctx.strokeStyle = isThermal ? 'rgba(255, 170, 0, 0.1)' : 'rgba(57, 255, 20, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(targetBoxX - 25, targetBoxY - 25);
        ctx.moveTo(canvas.width, 0); ctx.lineTo(targetBoxX + 25, targetBoxY - 25);
        ctx.stroke();

        ctx.fillStyle = isThermal ? '#ffaa00' : '#39ff14';
        ctx.fillText(`CAM // [SAT_${activeNode.id.toUpperCase()}_DOWNLINK]`, 15, 25);
        ctx.fillText(`COORDS: ${activeNode.lat.toFixed(4)} N / ${activeNode.lon.toFixed(4)} E`, 15, 38);
        
        ctx.textAlign = 'right';
        ctx.fillText(isDegraded ? 'FEED: DEGRADED (84%)' : 'FEED: STABLE (99%)', canvas.width - 15, 25);
        ctx.fillText('FPS: 30 // HD VIDEO', canvas.width - 15, 38);

        sweepY += 0.8;
        if (sweepY > canvas.height) sweepY = 0;
        ctx.fillStyle = isThermal ? 'rgba(255, 170, 0, 0.05)' : 'rgba(57, 255, 20, 0.06)';
        ctx.fillRect(0, sweepY - 10, canvas.width, 2);
      }

      animId = requestAnimationFrame(drawCCTV);
    }

    drawCCTV();

    return () => cancelAnimationFrame(animId);
  }, [activeNode]);

  const getOperativeData = (node) => {
    if (!node) {
      return { name: 'STANDBY OVERVIEW', id: 'HQ-CMD', bpm: 0, temp: '00.0', ammo: '0%', status: 'MONITORING', color: 'text-cyber-cyan' };
    }
    const bpmModifier = defconLevel === 1 ? 142 : defconLevel === 2 ? 115 : 76;
    const tempModifier = defconLevel === 1 ? '38.2' : defconLevel === 2 ? '37.4' : '36.8';
    
    switch (node.id) {
      case 'nyc':
        return { name: 'AGENT A-12 VANCE', id: 'US-CYBERCOM', bpm: bpmModifier, temp: tempModifier, ammo: '94%', status: 'STEALTH', color: 'text-cyber-cyan' };
      case 'kyiv':
        return { name: 'OPERATIVE K-04 PETROV', id: 'EAST-BLOCK', bpm: bpmModifier + 12, temp: (parseFloat(tempModifier) + 0.3).toFixed(1), ammo: '68%', status: 'ENGAGED', color: 'text-cyber-amber' };
      case 'baghdad':
        return { name: 'STRIKER B-09 GIBRAN', id: 'ME-OUTPOST', bpm: bpmModifier + 28, temp: (parseFloat(tempModifier) + 0.8).toFixed(1), ammo: '15%', status: 'EXFIL REQUIRED', color: 'text-cyber-red animate-pulse' };
      case 'tokyo':
        return { name: 'SCIENTIST T-08 TANAKA', id: 'APAC-HQ', bpm: bpmModifier - 5, temp: (parseFloat(tempModifier) - 0.2).toFixed(1), ammo: '100%', status: 'SECURE', color: 'text-cyber-green' };
      case 'cairo':
        return { name: 'OPERATIVE C-03 NASSER', id: 'AFRICA-NORTH', bpm: bpmModifier + 5, temp: (parseFloat(tempModifier) + 0.1).toFixed(1), ammo: '40%', status: 'RECON', color: 'text-cyber-amber' };
      case 'amazon':
        return { name: 'AGENT A-05 SILVA', id: 'LATAM-COVERT', bpm: bpmModifier - 2, temp: tempModifier, ammo: '85%', status: 'STANDBY', color: 'text-cyber-cyan' };
      default:
        return { name: 'STANDBY OVERVIEW', id: 'HQ-CMD', bpm: 0, temp: '00.0', ammo: '0%', status: 'MONITORING', color: 'text-cyber-cyan' };
    }
  };

  // Heartbeat wave effect
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 42;

    const opData = getOperativeData(activeNode);
    const bpm = opData.bpm;
    
    let speed = bpm > 0 ? (bpm / 60) * 1.5 : 0.5;
    let color = defconLevel === 1 ? '#ff0055' : activeNode ? activeNode.color : '#00f0ff';

    let t = 0;

    function drawECG() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dark grid background
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 12) {
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
      }
      for (let j = 0; j < canvas.height; j += 12) {
        ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
      }
      ctx.stroke();

      // If flatline / no node selected
      if (bpm === 0) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.font = '8px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('NO OPERATIVE SIGNAL // LINK STANDBY', canvas.width / 2, canvas.height / 2 + 3);
        
        animId = requestAnimationFrame(drawECG);
        return;
      }

      t += speed;
      if (t > canvas.width) t = 0;

      const yCenter = canvas.height / 2;

      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      
      const cycleWidth = 100 / (bpm / 60);

      for (let i = 0; i < canvas.width; i++) {
        let py = yCenter;
        const posInCycle = (i - t * 3.5) % cycleWidth;

        if (posInCycle > 0 && posInCycle < 24) {
          const p = posInCycle;
          if (p < 4) {
            // P-wave
            py = yCenter - Math.sin((p / 4) * Math.PI) * 3;
          } else if (p >= 4 && p < 7) {
            py = yCenter;
          } else if (p >= 7 && p < 9) {
            // Q-wave
            py = yCenter + 3;
          } else if (p >= 9 && p < 12) {
            // R-wave
            py = yCenter - 14;
          } else if (p >= 12 && p < 15) {
            // S-wave
            py = yCenter + 5;
          } else if (p >= 15 && p < 18) {
            py = yCenter;
          } else if (p >= 18 && p < 23) {
            // T-wave
            py = yCenter - 4;
          }
        }

        if (i === 0) ctx.moveTo(i, py);
        else ctx.lineTo(i, py);
      }
      ctx.stroke();

      animId = requestAnimationFrame(drawECG);
    }

    drawECG();

    return () => cancelAnimationFrame(animId);
  }, [activeNode, defconLevel]);

  const triggerClick = () => {
    if (soundActive && clickSnd.current) {
      clickSnd.current.currentTime = 0;
      clickSnd.current.play().catch(() => {});
    }
  };

  const triggerBeep = () => {
    if (clickSnd.current) {
      clickSnd.current.currentTime = 0;
      clickSnd.current.play().catch(() => {});
    }
  };

  const handleRadarScan = () => {
    triggerClick();
    if (radarSweeping) return;
    setRadarSweeping(true);
    
    setTimeout(() => {
      setRadarSweeping(false);
      const newThreat = {
        time: new Date().toLocaleTimeString(),
        type: 'TACTICAL SWEEP',
        source: 'GLOBAL RADAR',
        msg: `Swept ${activeNode ? activeNode.name : 'ALL MONITOR SECTORS'} - System fully synchronized.`,
        status: 'SECURE'
      };
      setThreatEvents(prev => [newThreat, ...prev]);
    }, 4000);
  };

  const launchInterception = () => {
    triggerClick();
    setInterceptionModal(true);
    setInterceptionProgress(0);
    setInterceptionLog('ESTABLISHING SECURE PROTOCOLS...');

    setTimeout(() => setInterceptionLog('ACQUIRING ORBITAL TELEMETRY FROM ACTIVE SAT-DEVICES...'), 800);
    setTimeout(() => setInterceptionLog('CALCULATING BALISTIC ENVELOPE FOR TARGET CORRELATION...'), 1500);
    setTimeout(() => setInterceptionLog('LAUNCHING ORBITAL SATELLITE KINETIC STRIKE INTERCEPTOR...'), 2200);

    const intInterval = setInterval(() => {
      setInterceptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(intInterval);
          setInterceptionLog('INTERCEPTOR DELIVERED. SATELLITE IMPACT RANGES REROUTED. TARGET NEUTRALIZED.');
          return 100;
        }
        return prev + 5;
      });
    }, 180);
  };

  return (
    <div className={`h-full w-full flex flex-col p-4 relative z-10 transition-colors duration-500 overflow-hidden hex-pattern ${defconLevel === 1 ? 'border-[3px] border-red-600 animate-pulse' : ''}`}>
      
      {/* Top Banner Header Panel */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-cyber-border mb-4">
        <div className="flex items-center space-x-3 mb-2 md:mb-0">
          <div className="h-9 w-9 bg-cyber-cyan border border-cyber-cyan shadow-neon-cyan flex items-center justify-center font-display font-black text-black text-lg skew-x-3">
            C
          </div>
          <div>
            <h1 className="text-xl font-display font-black tracking-widest text-glow-cyan text-cyber-cyan">
              CRUCIX // COMMAND OPERATIVE
            </h1>
            <p className="text-xs font-mono tracking-widest text-slate-400 flex items-center space-x-1">
              <span className="inline-block h-2 w-2 bg-cyber-green rounded-full shadow-neon-green animate-ping mr-1"></span>
              <span>SECURITY CLEARANCE: OPERATIONAL SUPERVISOR (LEVEL 5)</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => { setSoundActive(!soundActive); triggerClick(); }}
            className={`px-3 py-1.5 border rounded flex items-center space-x-2 font-mono text-xs transition-all ${soundActive ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-neon-cyan' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}
          >
            {soundActive ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span>CONSOLE AUDIO: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span>CONSOLE AUDIO: MUTED</span>
              </>
            )}
          </button>

          <div className="flex items-center border border-slate-700 bg-slate-900/60 rounded px-2 py-1 space-x-2">
            <span className="font-display font-bold text-xs text-slate-400 tracking-wider">DEFCON:</span>
            {[5, 4, 3, 2, 1].map((level) => {
              const bgColors = {
                5: 'hover:bg-cyber-green/30 border-cyber-green text-cyber-green',
                4: 'hover:bg-cyber-cyan/30 border-cyber-cyan text-cyber-cyan',
                3: 'hover:bg-cyber-amber/30 border-cyber-amber text-cyber-amber',
                2: 'hover:bg-orange-500/30 border-orange-500 text-orange-500',
                1: 'hover:bg-cyber-red/30 border-cyber-red text-cyber-red animate-pulse'
              };

              const activeBg = {
                5: 'bg-cyber-green text-black font-black border-cyber-green shadow-neon-green',
                4: 'bg-cyber-cyan text-black font-black border-cyber-cyan shadow-neon-cyan',
                3: 'bg-cyber-amber text-black font-black border-cyber-amber shadow-neon-amber',
                2: 'bg-orange-500 text-black font-black border-orange-500 shadow-neon-amber',
                1: 'bg-cyber-red text-black font-black border-cyber-red shadow-neon-red'
              };

              return (
                <button
                  key={level}
                  onClick={() => { setDefconLevel(level); triggerClick(); }}
                  className={`w-6 h-6 rounded flex items-center justify-center font-display text-xs border transition-all ${defconLevel === level ? activeBg[level] : 'border-transparent text-slate-500 ' + bgColors[level]}`}
                >
                  {level}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block border border-slate-800 bg-[#070b19] px-3 py-1 text-center rounded font-mono text-xs text-slate-400 tracking-widest">
            UTC SYSTEM: {new Date().toUTCString().slice(17, 25)} // ACER-SURV
          </div>
        </div>
      </header>

      {/* Main Grid body container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: CCTV & Threat Stream */}
        <section className="lg:col-span-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
          <div className="cyber-panel p-3 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <Video className="h-4 w-4" />
                <span>CCTV SURVEILLANCE FEED</span>
              </h2>
              <div className="flex space-x-1">
                <button 
                  onClick={() => { setCctvZoomed(!cctvZoomed); triggerClick(); }}
                  className="p-1 border border-slate-700 rounded text-slate-400 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
                >
                  {cctvZoomed ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="relative border border-slate-800 bg-black rounded overflow-hidden flex-1 min-h-[200px]">
              <canvas ref={cctvCanvasRef} className="w-full h-full block"></canvas>
              <div className="pointer-events-none absolute inset-0 cctv-static"></div>
              {activeNode && activeNode.id !== 'baghdad' && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-red-500 font-bold">
                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping"></span>
                  <span>REC</span>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="bg-[#050917] p-2 border border-slate-800 rounded">
                <span className="text-slate-500 block">GRID TARGET</span>
                <span className="text-cyber-cyan font-bold block truncate">{activeNode ? activeNode.name : 'SCANNING SENSORS...'}</span>
              </div>
              <div className="bg-[#050917] p-2 border border-slate-800 rounded">
                <span className="text-slate-500 block">THREAT METRIC</span>
                <span className={`font-bold block ${!activeNode ? 'text-cyber-cyan' : activeNode.level === 'CRITICAL' ? 'text-cyber-red' : activeNode.level === 'HIGH' ? 'text-cyber-amber' : 'text-cyber-green'}`}>
                  {activeNode ? activeNode.level : 'MONITORING'}
                </span>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-3 flex flex-col flex-1 min-h-[300px]">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <Bell className="h-4 w-4" />
                <span>TACTICAL THREAT NOTIFICATIONS</span>
              </h2>
              <span className="font-mono text-[9px] bg-red-950/75 border border-red-700/50 px-2 py-0.5 rounded text-cyber-red font-bold">
                {threatEvents.length} SCANS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {threatEvents.map((evt, idx) => {
                const badgeColor = {
                  WARN: 'bg-cyber-amber/10 border-cyber-amber/30 text-cyber-amber',
                  ALERT: 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red',
                  INFO: 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan',
                  SECURE: 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green'
                };

                return (
                  <div key={idx} className="bg-[#050816]/75 border border-slate-800/80 p-2 rounded text-[11px] font-mono hover:border-slate-700 transition-all flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`px-1.5 py-0.5 border text-[9px] rounded font-bold ${badgeColor[evt.status] || badgeColor.INFO}`}>
                        {evt.type}
                      </span>
                      <span className="text-slate-500 text-[10px]">{evt.time}</span>
                    </div>
                    <p className="text-slate-300 font-semibold">{evt.msg}</p>
                    <span className="text-[10px] text-slate-500 block">// SRC: {evt.source}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MIDDLE COLUMN: Active 3D Globe Viewer */}
        <section className="lg:col-span-2 flex flex-col space-y-4 min-h-0 relative">
          <div className="cyber-panel flex-1 flex flex-col relative overflow-hidden surveillance-grid">
            
            <div className="absolute top-3 left-3 pointer-events-none z-20 font-mono text-[11px] text-slate-400 space-y-1 bg-black/60 p-2.5 rounded border border-slate-800">
              <p className="text-glow-cyan text-cyber-cyan font-bold tracking-wider">// ORBITAL 3D PLANET ENGINE ACTIVE</p>
              <p>POLAR AZIMUTH: <span className="text-cyber-green">14.82°</span></p>
              <p>GRID DUPLEX RATE: <span className="text-cyber-cyan">4.92 GB/S</span></p>
              <p>SENSORS IN ORBIT: <span className="text-cyber-cyan">3 ACTIVE</span></p>
              <p>PLANET DRIFT: <span className="text-cyber-cyan">0.04 RAD/S</span></p>
            </div>

            <div className="absolute top-3 right-3 z-20 flex flex-col space-y-2">
              <div className="pointer-events-none font-mono text-[11px] text-right text-slate-400 bg-black/60 p-2.5 rounded border border-slate-800">
                <p className="text-glow-amber text-cyber-amber font-bold tracking-wider">// TARGET HOTSPOT INTERCEPT</p>
                <p>LAT: <span className="text-cyber-cyan">{activeNode ? `${activeNode.lat.toFixed(4)}° N` : 'SEARCHING...'}</span></p>
                <p>LON: <span className="text-cyber-cyan">{activeNode ? `${activeNode.lon.toFixed(4)}° E` : 'SEARCHING...'}</span></p>
                <p>PING QUALITY: <span className="text-cyber-green">{activeNode ? 'LOCKED' : 'SCANNING'}</span></p>
              </div>

              <div className="flex flex-col space-y-2 items-end">
                <button
                  onClick={handleRadarScan}
                  disabled={radarSweeping}
                  className={`px-4 py-2 border rounded font-display font-bold text-xs tracking-wider transition-all flex items-center space-x-2 ${radarSweeping ? 'bg-cyber-amber/25 border-cyber-amber text-cyber-amber animate-pulse' : 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/35 shadow-neon-cyan'}`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${radarSweeping ? 'animate-spin' : ''}`} />
                  <span>{radarSweeping ? 'SENSING...' : 'RUN TACTICAL SCAN'}</span>
                </button>

                <button
                  onClick={launchInterception}
                  className="px-4 py-2 border border-cyber-red bg-cyber-red/15 text-cyber-red font-display font-bold text-xs tracking-wider rounded hover:bg-cyber-red/35 shadow-neon-red transition-all flex items-center space-x-2"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>LAUNCH KINETIC SHIELD</span>
                </button>
              </div>
            </div>



            {/* Mount our awesome Globe component directly */}
            <Globe activeNode={activeNode} onSelectNode={setActiveNode} defconLevel={defconLevel} />

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 bg-slate-950/90 p-3 grid grid-cols-2 md:grid-cols-4 gap-4 z-20">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">SURVEILLANCE NODE</span>
                <span className="text-sm font-display font-black text-glow-cyan text-cyber-cyan truncate block">
                  {activeNode ? activeNode.name : 'GLOBAL SYSTEM SWEEPING'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">DEC-KEY STATUS</span>
                <span className="text-sm font-mono font-bold text-cyber-green flex items-center">
                  <KeyRound className="h-3.5 w-3.5 mr-1 text-cyber-green shadow-neon-green" />
                  <span>{activeNode ? 'VERIFIED (128-BIT)' : 'GRID SYSTEM STANDBY'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">CCTV LINK STATUS</span>
                <span className={`text-sm font-mono font-bold truncate block ${!activeNode ? 'text-cyber-cyan' : activeNode.cctv === 'ACTIVE' || activeNode.cctv === 'SECURE' ? 'text-cyber-green' : activeNode.cctv === 'NO SIGNAL' ? 'text-cyber-red' : 'text-cyber-amber'}`}>
                  {activeNode ? activeNode.cctv : 'GRID STANDBY'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">ORBIT SIGNAL TRACK</span>
                <span className="text-sm font-mono text-slate-300 truncate block">
                  {activeNode ? 'DOWNLINK: KH-11 [LOCKED]' : 'SCANNERS OPERATIONAL'}
                </span>
              </div>

              {activeNode && (
                <div className="col-span-2 md:col-span-4 flex justify-end pt-1 border-t border-slate-900/60 mt-1">
                  <button 
                    onClick={() => {
                      setActiveNode(null);
                      triggerClick();
                    }}
                    className="px-3 py-1 border border-cyber-red bg-cyber-red/15 hover:bg-cyber-red/35 text-cyber-red font-display text-[9px] tracking-widest rounded flex items-center space-x-1.5 shadow-neon-red transition-all"
                  >
                    <XCircle className="h-3.5 w-3.5 animate-pulse" />
                    <span>RELEASE TARGET LOCK [X]</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Satellites & Decryptor Log */}
        <section className="lg:col-span-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
          <div className="cyber-panel p-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <Orbit className="h-4 w-4" />
                <span>ACTIVE SPY TELEMETRY</span>
              </h2>
              <span className="h-2 w-2 bg-cyber-green rounded-full shadow-neon-green animate-ping"></span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'SATELLITE KH-11 (RECON)', orbit: 'LOW-EARTH // OPTICAL', status: 'STABLE', pwr: '94%', speed: '7.8 KM/S' },
                { name: 'SATELLITE ONYX (SIGINT)', orbit: 'GEOSYNCH // THERMAL', status: 'LINKED', pwr: '88%', speed: '6.4 KM/S' },
                { name: 'LACROSSE-2 (RADAR)', orbit: 'MOLNIYA // PULSE-GEN', status: 'READY', pwr: '100%', speed: '7.2 KM/S' }
              ].map((sat, i) => (
                <div 
                  key={i} 
                  onClick={triggerClick}
                  className="bg-[#050816]/80 border border-slate-800 hover:border-cyber-cyan/50 p-2.5 rounded cursor-pointer transition-all hover:bg-slate-900/60"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-display font-bold text-xs text-slate-200">{sat.name}</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">{sat.status}</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mt-1">{sat.orbit}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div>PWR BUDGET: <span className="text-cyber-green">{sat.pwr}</span></div>
                    <div>VELOCITY: <span className="text-cyber-cyan">{sat.speed}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-slate-800 bg-slate-950/70 p-3 mt-3 rounded flex flex-col space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="text-cyber-cyan font-bold tracking-wider">// SIGNAL TELEMETRY STREAMS</span>
                <span className="text-cyber-green animate-pulse">UPLINK OK</span>
              </div>
              
              <div className="space-y-1.5 font-mono text-[9px] text-slate-400">
                <div className="flex justify-between">
                  <span>KH-11 DATA UPLINK</span>
                  <span className="text-cyber-cyan">942.8 KB/S</span>
                </div>
                <div className="w-full h-1 bg-slate-900 border border-slate-800 rounded overflow-hidden">
                  <div className="h-full bg-cyber-cyan animate-[pulse_1.5s_infinite]" style={{ width: '84%' }}></div>
                </div>
                
                <div className="flex justify-between">
                  <span>ONYX COVERT UPLINK</span>
                  <span className="text-cyber-cyan">128.4 KB/S</span>
                </div>
                <div className="w-full h-1 bg-slate-900 border border-slate-800 rounded overflow-hidden">
                  <div className="h-full bg-cyber-amber animate-[pulse_2s_infinite]" style={{ width: '45%' }}></div>
                </div>

                <div className="flex justify-between">
                  <span>LACROSS RADAR DATA</span>
                  <span className="text-cyber-cyan">612.0 KB/S</span>
                </div>
                <div className="w-full h-1 bg-slate-900 border border-slate-800 rounded overflow-hidden">
                  <div className="h-full bg-cyber-green animate-[pulse_1.2s_infinite]" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* TACTICAL MONITOR NODES selector panel */}
          <div className="cyber-panel p-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <Target className="h-4 w-4" />
                <span>TACTICAL MONITOR NODES</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              {THREAT_LOCATIONS.map((loc) => {
                const isActive = activeNode && activeNode.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setActiveNode(loc);
                      triggerClick();
                    }}
                    className={`p-1.5 border rounded text-left truncate transition-all ${isActive ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-neon-cyan' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
                  >
                    {loc.name.split(' // ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ground Operatives Vital Telemetry HUD Panel */}
          <div className="cyber-panel p-3 flex flex-col space-y-3">
            <div className="flex justify-between items-center pb-2 mb-1 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <Cpu className="h-4 w-4 text-cyber-cyan animate-pulse" />
                <span>GROUND OPERATIVE TELEMETRY</span>
              </h2>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${defconLevel === 1 ? 'bg-red-950 text-cyber-red border border-cyber-red/50 animate-pulse' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                DEFCON {defconLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-[#050816] p-2 border border-slate-800 rounded col-span-2">
                <span className="text-slate-500 block">ACTIVE OPERATIVE PROFILE</span>
                <span className={`font-display font-bold text-[11px] tracking-wide block ${activeNode ? 'text-slate-200' : 'text-slate-500'}`}>
                  {getOperativeData(activeNode).name}
                </span>
              </div>

              <div className="bg-[#050816] p-2 border border-slate-800 rounded">
                <span className="text-slate-500 block">HEART RATE</span>
                <span className={`text-[12px] font-bold block ${defconLevel === 1 ? 'text-cyber-red animate-pulse' : activeNode ? 'text-cyber-green' : 'text-slate-500'}`}>
                  {getOperativeData(activeNode).bpm > 0 ? `${getOperativeData(activeNode).bpm} BPM` : '000 BPM'}
                </span>
              </div>

              <div className="bg-[#050816] p-2 border border-slate-800 rounded">
                <span className="text-slate-500 block">CORE TEMP</span>
                <span className={`text-[12px] font-bold block ${defconLevel === 1 ? 'text-cyber-red animate-pulse' : activeNode ? 'text-cyber-cyan' : 'text-slate-500'}`}>
                  {getOperativeData(activeNode).temp > 0 ? `${getOperativeData(activeNode).temp} °C` : '00.0 °C'}
                </span>
              </div>

              <div className="bg-[#050816] p-2 border border-slate-800 rounded">
                <span className="text-slate-500 block">TACTICAL LOADOUT</span>
                <span className={`text-[12px] font-bold block ${activeNode ? 'text-cyber-cyan' : 'text-slate-500'}`}>
                  {getOperativeData(activeNode).ammo}
                </span>
              </div>

              <div className="bg-[#050816] p-2 border border-slate-800 rounded">
                <span className="text-slate-500 block">UPLINK STATUS</span>
                <span className={`text-[12px] font-bold block ${defconLevel === 1 ? 'text-cyber-red animate-pulse' : activeNode ? 'text-cyber-green' : 'text-slate-500'}`}>
                  {getOperativeData(activeNode).status}
                </span>
              </div>
            </div>

            {/* Real-time pulsing ECG Vital Wave Canvas */}
            <div className="border border-slate-800 bg-black/60 rounded p-1 flex flex-col relative overflow-hidden min-h-[44px]">
              <canvas ref={ecgCanvasRef} className="w-full h-full block"></canvas>
            </div>
          </div>

          <div className="cyber-panel p-3 flex flex-col flex-1 min-h-[250px]">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <Terminal className="h-4 w-4" />
                <span>DECRYPTOR TRANSCRIPT INTERCEPT</span>
              </h2>
              <Cpu className="h-4 w-4 text-cyber-cyan animate-pulse" />
            </div>

            <div className="mb-2.5">
              <div className="flex justify-between font-mono text-[9px] text-slate-500 mb-1">
                <span>BUFFER STATUS</span>
                <span>{decryptionProgress.toFixed(0)}% LOADED</span>
              </div>
              <div className="w-full h-1 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyber-cyan transition-all duration-300 shadow-neon-cyan" 
                  style={{ width: `${decryptionProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex-1 bg-black/60 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-cyber-green leading-relaxed text-glow-green overflow-y-auto max-h-[220px] select-text">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">// INCOMING DECRYPTED DATAPACKET</p>
              <p className="glitch-text">{decryptedText}</p>
            </div>

            <div className="mt-2.5 border-t border-slate-800 pt-2 font-mono text-[9px] text-slate-500 grid grid-cols-2 gap-1 text-center">
              <div>KEY: SHA256-DECR</div>
              <div>RATE: 1.4 TH/S</div>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-cyber-border mt-4 pt-3 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-slate-500">
        <div className="flex flex-wrap items-center space-x-4 mb-2 md:mb-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">MAIN FRAME CORE LOAD:</span>
            <div className="w-20 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
              <div className="h-full w-[38%] bg-cyber-cyan"></div>
            </div>
            <span className="text-cyber-cyan text-[10px]">38%</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">CRYP-CACHE BUFFER:</span>
            <div className="w-20 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
              <div className="h-full w-[65%] bg-cyber-amber"></div>
            </div>
            <span className="text-cyber-amber text-[10px]">65%</span>
          </div>
        </div>

        <div className="hidden lg:block flex-1 mx-8 max-w-[500px] overflow-hidden whitespace-nowrap relative">
          <div className="animate-[marquee_25s_linear_infinite] inline-block pl-[100%] text-[10px] tracking-widest text-slate-600">
            SYSTEM STATUS // CENTRAL INTERLINK INTEGRATION ONLINE... THREAT EPICENTERS INDEXED... ALL SAT DETECTORS ACTIVE... DEFCON 4 STABLE CONSOLE TELEMETRY OK...
          </div>
        </div>

        <div className="text-[10px] text-right tracking-wider">
          CRUCIX OPERATIONAL INTELLIGENCE PLATFORM v4.95-ACER
        </div>
      </footer>

      {/* CCTV Viewport ZOOM OVERLAY Modal */}
      {cctvZoomed && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl cyber-panel p-4 flex flex-col relative">
            <div className="flex justify-between items-center pb-2 mb-3 border-b border-slate-800">
              <h2 className="text-lg font-display font-black tracking-widest text-glow-cyan text-cyber-cyan flex items-center space-x-2">
                <span className="inline-block h-2.5 w-2.5 bg-red-600 rounded-full shadow-neon-red animate-pulse"></span>
                <span>SURVEILLANCE HD VIEWPORT LINKED // {activeNode ? activeNode.name : 'GLOBAL SENSOR SWEEP'}</span>
              </h2>
              <button 
                onClick={() => { setCctvZoomed(false); triggerClick(); }}
                className="px-3 py-1 bg-cyber-red/20 border border-cyber-red text-cyber-red font-display text-xs tracking-wider rounded hover:bg-cyber-red/45 transition-all"
              >
                DISCONNECT FEED
              </button>
            </div>
            
            <div className="relative border border-slate-800 bg-black rounded aspect-video w-full overflow-hidden flex items-center justify-center">
              <div className="absolute top-4 left-4 font-mono text-xs text-cyber-green space-y-1 z-20 bg-black/60 p-2.5 rounded border border-slate-800">
                <p>CAM ID: [SAT_CAM_{activeNode ? activeNode.id.toUpperCase() : 'GLOBAL'}_FULLSCREEN_SECURE]</p>
                <p>COORDS: {activeNode ? `${activeNode.lat.toFixed(6)}° N / ${activeNode.lon.toFixed(6)}° E` : 'SCANNING...'}</p>
                <p>RESOLUTION: 1920 X 1080 PX // 30 FPS</p>
                <p>AZIMUTH FEED: 192.42° // ELEVATION: 44.15°</p>
              </div>

              {activeNode && activeNode.id === 'baghdad' ? (
                <div className="text-center font-mono text-cyber-red space-y-2 z-10 select-none">
                  <p className="text-lg font-bold">SIGNAL LOSS // LINK ERROR 404</p>
                  <p className="text-xs text-slate-500">RE-ESTABLISHING SECURE PROTOCOLS ON ALTERNATE CHANNELS...</p>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                  <svg className="w-[90%] h-[90%] text-cyber-green opacity-40" viewBox="0 0 400 200">
                    <line x1="50" y1="180" x2="350" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="200" y1="20" x2="200" y2="180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
                    <circle cx="200" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.75" />
                    <circle cx="200" cy="100" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="140" y1="100" x2="260" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="200" y1="40" x2="200" y2="160" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                  
                  <div className="absolute border-2 border-cyber-green w-48 h-48 rounded shadow-neon-green animate-pulse flex items-center justify-center pointer-events-none">
                    <div className="font-mono text-[9px] text-cyber-green bg-black/80 border border-cyber-green/50 p-2 absolute bottom-2 rounded text-center">
                      INTELLIGENCE TARGET DETECTED<br/>CLASSIFICATION: WARN_SIG_04
                    </div>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 cctv-static z-30"></div>
            </div>
            
            <div className="mt-3 flex justify-between items-center font-mono text-xs text-slate-400">
              <div>TARGETING ENVELOPE: <span className="text-cyber-green">LOCKED</span></div>
              <div>DECRYPTION STREAM DUPLEX INDEX: <span className="text-cyber-cyan">STABLE</span></div>
            </div>
          </div>
        </div>
      )}

      {/* MISSILE LAUNCH / INTERCEPTOR STRIKE MODAL */}
      {interceptionModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md cyber-panel p-5 flex flex-col border border-cyber-red/40 bg-slate-950">
            <div className="flex justify-between items-center pb-2.5 mb-3.5 border-b border-cyber-red/30">
              <h2 className="text-base font-display font-black tracking-widest text-glow-red text-cyber-red flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 animate-pulse text-cyber-red" />
                <span>TACTICAL INTERCEPT TRIGGERED</span>
              </h2>
              <button 
                onClick={() => { setInterceptionModal(false); triggerClick(); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-950/20 border border-cyber-red/30 rounded p-3 text-xs font-mono leading-relaxed text-slate-300">
                <p className="text-cyber-red font-bold text-glow-red mb-1.5">// CRITICAL ACTION REQUIRED</p>
                <p>Target Coordinate Lock-on: <span className="text-cyber-cyan">{activeNode ? `${activeNode.lat.toFixed(4)} N / ${activeNode.lon.toFixed(4)} E` : 'GLOBAL SCAN'}</span></p>
                <p>Location Profile: <span className="text-cyber-cyan">{activeNode ? activeNode.name : 'ALL ACTIVE MONITOR SECTORS'}</span></p>
                <p>Estimated ballistic travel time: <span className="text-cyber-amber">182 seconds</span></p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>LAUNCH CALIBRATION</span>
                  <span>{interceptionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-cyber-red transition-all duration-200 shadow-neon-red" 
                    style={{ width: `${interceptionProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#050101] border border-red-950 rounded p-2.5 font-mono text-[10px] text-cyber-red min-h-[90px] text-glow-red">
                <p>{interceptionLog}</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => { setInterceptionModal(false); triggerClick(); }}
                  className="flex-1 py-2 bg-slate-800 border border-slate-700 font-display text-xs tracking-widest text-slate-200 rounded hover:bg-slate-700 hover:border-slate-500 transition-all"
                >
                  DISMISS HUD
                </button>
                {interceptionProgress >= 100 && (
                  <button
                    onClick={() => { setInterceptionModal(false); triggerClick(); }}
                    className="flex-1 py-2 bg-cyber-red/20 border border-cyber-red font-display text-xs tracking-widest text-cyber-red rounded hover:bg-cyber-red/45 shadow-neon-red transition-all"
                  >
                    CLOSE INTERCEPT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
