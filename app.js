// CRUCIX Surveillance Console React Application
// Loaded dynamically via Babel in index.html

const { useState, useEffect, useRef } = React;
const THREAT_LOCATIONS = window.THREAT_LOCATIONS || [];

function App() {
  const [activeNode, setActiveNode] = useState(null); // start in scanning mode
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

  // Audio References
  const clickSnd = useRef(null);
  const ambientSnd = useRef(null);
  const alertSnd = useRef(null);
  const radarSnd = useRef(null);

  // Initialize Globe once on mount
  useEffect(() => {
    // Resolve audio DOM elements
    clickSnd.current = document.getElementById('snd-click');
    ambientSnd.current = document.getElementById('snd-ambient');
    alertSnd.current = document.getElementById('snd-alert');
    radarSnd.current = document.getElementById('snd-radar');

    // Trigger Globe initialization
    // Passes the callback when a node is clicked on 3D Globe
    initGlobe('globe-container', (selectedNode) => {
      setActiveNode(selectedNode);
    });

    // Start background simulation tickers
    const alertInterval = setInterval(() => {
      // Periodic threat logs simulation
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

      // Play alert beep sound if DEFCON is high and sound is active
      if (soundActive && defconLevel <= 2) {
        triggerBeep();
      }
    }, 4500);

    return () => {
      clearInterval(alertInterval);
      if (decryptionInterval.current) clearInterval(decryptionInterval.current);
    };
  }, [soundActive, defconLevel]);

  // Audio Controllers
  useEffect(() => {
    if (!ambientSnd.current || !alertSnd.current || !radarSnd.current) return;

    if (soundActive) {
      // Play ambient hum
      ambientSnd.current.volume = 0.45;
      ambientSnd.current.play().catch(() => {});

      // Play radar sweep loop
      radarSnd.current.volume = 0.25;
      radarSnd.current.play().catch(() => {});

      // Play DEFCON 1-2 alarm
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

  // Handle Decryption Simulation
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
      : 'GLOBAL LOGISTICS & RADAR SCANNING ACTIVE. WAITING FOR GEOSPATIAL TARGET LOCK-ON. DATA INTERCEPTS STANDBY...';
    let charIndex = 0;
    setDecryptionProgress(activeNode ? 0 : 100);

    decryptionInterval.current = setInterval(() => {
      charIndex += 1;
      const progress = Math.min((charIndex / targetMsg.length) * 100, 100);
      setDecryptionProgress(progress);

      // Scramble untyped characters
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

  // CCTV Live-Vector Canvas Renderer
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

    // Tactical sweep parameters
    let sweepY = 0;

    function drawCCTV() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!activeNode) {
        // Draw Radar / Global Scanning Screen
        ctx.fillStyle = '#020614';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw spinning radar circle
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = 55;
        
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.arc(cx, cy, r - 20, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cx - r - 10, cy); ctx.lineTo(cx + r + 10, cy);
        ctx.moveTo(cx, cy - r - 10); ctx.lineTo(cx, cy + r + 10);
        ctx.stroke();
        
        // Radar sweep arm
        const angle = (Date.now() / 1000) % (Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#00f0ff';
        ctx.font = '10px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('GLOBAL SENSOR OVERVIEW', cx, cy - r - 12);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fillText('SCANNING FOR EMISSIONS...', cx, cy + r + 15);
        
        // Noise static line
        sweepY += 0.8;
        if (sweepY > canvas.height) sweepY = 0;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.fillRect(0, sweepY - 10, canvas.width, 2);
        
        animId = requestAnimationFrame(drawCCTV);
        return;
      }

      const isSignalLost = activeNode.id === 'baghdad';

      if (isSignalLost) {
        // Draw TV Static Screen
        ctx.fillStyle = '#0a0d1b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(255, 0, 85, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '14px "Share Tech Mono"';
        ctx.fillStyle = '#ff0055';
        ctx.textAlign = 'center';
        ctx.fillText('NO SATELLITE LINK // SIGNAL LOST', canvas.width / 2, canvas.height / 2);
        
        // Random white noise blocks
        for (let i = 0; i < 20; i++) {
          const w = Math.random() * 50;
          const h = Math.random() * 10;
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
          ctx.fillRect(x, y, w, h);
        }
      } else {
        // Night vision or Thermal style overlay
        const isDegraded = activeNode.id === 'kyiv' || activeNode.id === 'cairo';
        const isThermal = activeNode.id === 'amazon';
        
        ctx.fillStyle = isThermal ? '#080101' : '#030d0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines background
        ctx.strokeStyle = isThermal ? 'rgba(255, 100, 0, 0.05)' : 'rgba(57, 255, 20, 0.06)';
        ctx.lineWidth = 1;
        const gridSpacing = 16;
        for (let x = 0; x < canvas.width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Animated wireframe vector elements simulating roads / terrains
        ctx.strokeStyle = isThermal ? 'rgba(255, 100, 0, 0.18)' : 'rgba(57, 255, 20, 0.22)';
        ctx.beginPath();
        // Draw diagonal scanning mountain/terrain vector lines
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width * 0.3, canvas.height - 50);
        ctx.lineTo(canvas.width * 0.7, canvas.height - 35);
        ctx.lineTo(canvas.width, canvas.height - 60);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 40);
        ctx.lineTo(canvas.width * 0.4, canvas.height - 80);
        ctx.lineTo(canvas.width * 0.8, canvas.height - 70);
        ctx.lineTo(canvas.width, canvas.height - 100);
        ctx.stroke();

        // Target box intelligence tracking box
        targetBoxX += boxDirectionX * 1.5;
        targetBoxY += boxDirectionY * 1.5;

        // Bounce box
        if (targetBoxX < 50 || targetBoxX > canvas.width - 50) boxDirectionX *= -1;
        if (targetBoxY < 40 || targetBoxY > canvas.height - 40) boxDirectionY *= -1;

        ctx.strokeStyle = isThermal ? '#ffaa00' : '#39ff14';
        ctx.lineWidth = 2;
        ctx.strokeRect(targetBoxX - 25, targetBoxY - 25, 50, 50);

        // Center reticle
        ctx.beginPath();
        ctx.moveTo(targetBoxX - 8, targetBoxY);
        ctx.lineTo(targetBoxX + 8, targetBoxY);
        ctx.moveTo(targetBoxX, targetBoxY - 8);
        ctx.lineTo(targetBoxX, targetBoxY + 8);
        ctx.stroke();

        // Overlay text labels
        ctx.fillStyle = isThermal ? '#ffaa00' : '#39ff14';
        ctx.font = '10px "Share Tech Mono"';
        ctx.textAlign = 'left';
        ctx.fillText(`TRK TARGET ID: [${activeNode.id.toUpperCase()}_04]`, targetBoxX + 30, targetBoxY - 15);
        ctx.fillText(`SIG: INTERCEPTED`, targetBoxX + 30, targetBoxY - 3);
        ctx.fillText(`SPD: 4.8 NM/S`, targetBoxX + 30, targetBoxY + 9);

        // Intercept lines connecting targeting box
        ctx.strokeStyle = isThermal ? 'rgba(255, 170, 0, 0.1)' : 'rgba(57, 255, 20, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(targetBoxX - 25, targetBoxY - 25);
        ctx.moveTo(canvas.width, 0); ctx.lineTo(targetBoxX + 25, targetBoxY - 25);
        ctx.stroke();

        // Signal Quality overlays
        ctx.fillStyle = isThermal ? '#ffaa00' : '#39ff14';
        ctx.fillText(`CAM // [SAT_${activeNode.id.toUpperCase()}_DOWNLINK]`, 15, 25);
        ctx.fillText(`COORDS: ${activeNode.lat.toFixed(4)} N / ${activeNode.lon.toFixed(4)} E`, 15, 38);
        
        ctx.textAlign = 'right';
        ctx.fillText(isDegraded ? 'FEED: DEGRADED (84%)' : 'FEED: STABLE (99%)', canvas.width - 15, 25);
        ctx.fillText('FPS: 30 // HD VIDEO', canvas.width - 15, 38);

        // Scrolling scanning line
        sweepY += 0.8;
        if (sweepY > canvas.height) sweepY = 0;
        ctx.fillStyle = isThermal ? 'rgba(255, 170, 0, 0.05)' : 'rgba(57, 255, 20, 0.06)';
        ctx.fillRect(0, sweepY - 10, canvas.width, 2);
      }

      animId = requestAnimationFrame(drawCCTV);
    }

    drawCCTV();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeNode]);

  // Audio click sound trigger helper
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

  // Run Radar Scan Logic
  const handleRadarScan = () => {
    triggerClick();
    if (radarSweeping) return;
    setRadarSweeping(true);
    
    // Simulate finding a threat
    setTimeout(() => {
      setRadarSweeping(false);
      
      const newThreat = {
        time: new Date().toLocaleTimeString(),
        type: 'TACTICAL SWEEP',
        source: 'GLOBAL RADAR',
        msg: `Swept ${activeNode ? activeNode.name : 'ALL SECTORS'} - System index fully cleared.`,
        status: 'SECURE'
      };
      setThreatEvents(prev => [newThreat, ...prev]);
    }, 4000);
  };

  // Trigger Missile Launch Modal
  const launchInterception = () => {
    triggerClick();
    setInterceptionModal(true);
    setInterceptionProgress(0);
    setInterceptionLog('ESTABLISHING SECURE PROTOCOLS...');

    setTimeout(() => {
      setInterceptionLog('ACQUIRING ORBITAL TELEMETRY FROM ACTIVE SAT-DEVICES...');
    }, 800);

    setTimeout(() => {
      setInterceptionLog('CALCULATING BALISTIC ENVELOPE FOR TARGET CORRELATION...');
    }, 1500);

    setTimeout(() => {
      setInterceptionLog('LAUNCHING ORBITAL SATELLITE KINETIC STRIKE INTERCEPTOR...');
    }, 2200);

    // Animation progress simulation
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
        
        {/* Title and Clearance status */}
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

        {/* Action Controls & DEFCON panel */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Ambient Sound System control */}
          <button 
            onClick={() => { setSoundActive(!soundActive); triggerClick(); }}
            className={`px-3 py-1.5 border rounded flex items-center space-x-2 font-mono text-xs transition-all ${soundActive ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-neon-cyan' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}
          >
            {soundActive ? (
              <>
                <i data-lucide="volume-2" className="h-4 w-4"></i>
                <span>CONSOLE AUDIO: ON</span>
              </>
            ) : (
              <>
                <i data-lucide="volume-x" className="h-4 w-4"></i>
                <span>CONSOLE AUDIO: MUTED</span>
              </>
            )}
          </button>

          {/* Alert level controller selector */}
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

              const isActive = defconLevel === level;

              return (
                <button
                  key={level}
                  onClick={() => { setDefconLevel(level); triggerClick(); }}
                  className={`w-6 h-6 rounded flex items-center justify-center font-display text-xs border transition-all ${isActive ? activeBg[level] : 'border-transparent text-slate-500 ' + bgColors[level]}`}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* Time logs ticker */}
          <div className="hidden lg:block border border-slate-800 bg-[#070b19] px-3 py-1 text-center rounded font-mono text-xs text-slate-400 tracking-widest">
            UTC SYSTEM: {new Date().toUTCString().slice(17, 25)} // ACER-SURV
          </div>

        </div>

      </header>

      {/* Main Grid body container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: CCTV & Threat Stream */}
        <section className="lg:col-span-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
          
          {/* CCTV surveillance terminal viewport */}
          <div className="cyber-panel p-3 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <i data-lucide="video" className="h-4 w-4"></i>
                <span>CCTV SURVEILLANCE FEED</span>
              </h2>
              <div className="flex space-x-1">
                <button 
                  onClick={() => { setCctvZoomed(!cctvZoomed); triggerClick(); }}
                  className="p-1 border border-slate-700 rounded text-slate-400 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
                >
                  <i data-lucide={cctvZoomed ? "minimize-2" : "maximize-2"} className="h-3 w-3"></i>
                </button>
              </div>
            </div>

            {/* Video feed block canvas */}
            <div className="relative border border-slate-800 bg-black rounded overflow-hidden flex-1 min-h-[200px]">
              <canvas ref={cctvCanvasRef} className="w-full h-full block"></canvas>
              
              {/* CCTV Camera static scan effects overlay */}
              <div className="pointer-events-none absolute inset-0 cctv-static"></div>
              
              {/* Rec blinking indicator dots */}
              {activeNode && activeNode.id !== 'baghdad' && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-red-500 font-bold">
                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping"></span>
                  <span>REC</span>
                </div>
              )}
            </div>

            {/* Target information indicators */}
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

          {/* Simulated threat notifications list */}
          <div className="cyber-panel p-3 flex flex-col flex-1 min-h-[300px]">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <i data-lucide="bell" className="h-4 w-4"></i>
                <span>TACTICAL THREAT NOTIFICATIONS</span>
              </h2>
              <span className="font-mono text-[9px] bg-red-950/75 border border-red-700/50 px-2 py-0.5 rounded text-cyber-red font-bold">
                {threatEvents.length} SCANS
              </span>
            </div>

            {/* Simulated event stream log list */}
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
          
          {/* Main 3D Globe HUD Frame */}
          <div className="cyber-panel flex-1 flex flex-col relative overflow-hidden surveillance-grid">
            
            {/* HUD Indicators overlaying absolute */}
            <div className="absolute top-3 left-3 pointer-events-none z-20 font-mono text-[11px] text-slate-400 space-y-1 bg-black/60 p-2.5 rounded border border-slate-800">
              <p className="text-glow-cyan text-cyber-cyan font-bold tracking-wider">// WEBGL-3D ORBIT ENGINE ACTIVE</p>
              <p>POLAR AZIMUTH: <span className="text-cyber-green">14.82°</span></p>
              <p>GRID DUPLEX RATE: <span className="text-cyber-cyan">4.92 GB/S</span></p>
              <p>SENSORS IN ORBIT: <span className="text-cyber-cyan">3 ACTIVE</span></p>
              <p>ROTATION COEFFICIENT: <span className="text-slate-500">AUTO-DRIFT</span></p>
            </div>

            <div className="absolute top-3 right-3 z-20 flex flex-col space-y-2">
              <div className="pointer-events-none font-mono text-[11px] text-right text-slate-400 bg-black/60 p-2.5 rounded border border-slate-800">
                <p className="text-glow-amber text-cyber-amber font-bold tracking-wider">// TARGET HOTSPOT INTERCEPT</p>
                <p>LAT: <span className="text-cyber-cyan">{activeNode ? `${activeNode.lat.toFixed(4)}° N` : 'SEARCHING...'}</span></p>
                <p>LON: <span className="text-cyber-cyan">{activeNode ? `${activeNode.lon.toFixed(4)}° E` : 'SEARCHING...'}</span></p>
                <p>PING QUALITY: <span className="text-cyber-green">{activeNode ? 'LOCKED' : 'SCANNING'}</span></p>
              </div>

              {/* Action buttons triggers */}
              <div className="flex flex-col space-y-2 items-end">
                <button
                  onClick={handleRadarScan}
                  disabled={radarSweeping}
                  className={`px-4 py-2 border rounded font-display font-bold text-xs tracking-wider transition-all flex items-center space-x-2 ${radarSweeping ? 'bg-cyber-amber/25 border-cyber-amber text-cyber-amber animate-pulse' : 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/35 shadow-neon-cyan'}`}
                >
                  <i data-lucide="refresh-cw" className={`h-3.5 w-3.5 ${radarSweeping ? 'animate-spin' : ''}`}></i>
                  <span>{radarSweeping ? 'SENSING...' : 'RUN TACTICAL SCAN'}</span>
                </button>

                <button
                  onClick={launchInterception}
                  className="px-4 py-2 border border-cyber-red bg-cyber-red/15 text-cyber-red font-display font-bold text-xs tracking-wider rounded hover:bg-cyber-red/35 shadow-neon-red transition-all flex items-center space-x-2"
                >
                  <i data-lucide="shield-alert" className="h-3.5 w-3.5"></i>
                  <span>LAUNCH KINETIC SHIELD</span>
                </button>
              </div>
            </div>

            {/* Target Coordinate HUD Center Pointer overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              {/* Outer HUD ring */}
              <div className="w-[85%] h-[85%] max-w-[550px] max-h-[550px] rounded-full border border-cyber-cyan/5 flex items-center justify-center relative">
                {/* Dotted border rings */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyber-cyan/10"></div>
                <div className="absolute inset-16 rounded-full border border-cyber-cyan/5 relative">
                  {/* Radar sweep simulation lines */}
                  <div className="absolute inset-0 rounded-full border border-cyber-cyan/10 radar-pulse-ring"></div>
                </div>

                {/* Cyber HUD targeting bracket corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-cyan/30"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-cyan/30"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-cyan/30"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-cyan/30"></div>
              </div>
            </div>

            {/* HTML Canvas Element where WebGL Globe is loaded */}
            <div id="globe-container" className="flex-1 w-full h-full cursor-grab active:cursor-grabbing"></div>

            {/* Active targeted threat coordinates details footer HUD */}
            <div className="border-t border-slate-800/80 bg-slate-950/80 p-3 grid grid-cols-2 md:grid-cols-4 gap-4 z-20">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">SURVEILLANCE NODE</span>
                <span className="text-sm font-display font-black text-glow-cyan text-cyber-cyan truncate block">
                  {activeNode ? activeNode.name : 'GLOBAL SYSTEM SWEEPING'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">DEC-KEY STATUS</span>
                <span className="text-sm font-mono font-bold text-cyber-green flex items-center">
                  <i data-lucide="key-round" className="h-3.5 w-3.5 mr-1 text-cyber-green shadow-neon-green"></i>
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

              {/* RELEASE TARGET LOCK BUTTON (X) */}
              {activeNode && (
                <div className="col-span-2 md:col-span-4 flex justify-end pt-1 border-t border-slate-900/60 mt-1">
                  <button 
                    onClick={() => {
                      setActiveNode(null);
                      if (window.setGlobeLock) window.setGlobeLock(false);
                      triggerClick();
                    }}
                    className="px-3 py-1 border border-cyber-red bg-cyber-red/15 hover:bg-cyber-red/35 text-cyber-red font-display text-[9px] tracking-widest rounded flex items-center space-x-1.5 shadow-neon-red transition-all"
                  >
                    <i data-lucide="x-circle" className="h-3.5 w-3.5 animate-pulse"></i>
                    <span>RELEASE TARGET LOCK [X]</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </section>

        {/* RIGHT COLUMN: Satellites & Decryptor Log */}
        <section className="lg:col-span-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
          
          {/* Satellite active orbit tracker telemetry panel */}
          <div className="cyber-panel p-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <i data-lucide="orbit" className="h-4 w-4"></i>
                <span>ACTIVE SPY TELEMETRY</span>
              </h2>
              <span className="h-2 w-2 bg-cyber-green rounded-full shadow-neon-green animate-ping"></span>
            </div>

            {/* Orbit diagnostics charts representation */}
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
                  
                  {/* Telemetry diagnostics levels */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div>PWR BUDGET: <span className="text-cyber-green">{sat.pwr}</span></div>
                    <div>VELOCITY: <span className="text-cyber-cyan">{sat.speed}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rotating Circular Radar sweep HUD indicator */}
            <div className="border border-slate-800 bg-slate-950/70 p-3 mt-3 rounded flex items-center justify-center">
              <svg className="w-24 h-24 text-cyber-cyan" viewBox="0 0 100 100">
                {/* Radar target grids */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
                
                {/* Rotating scanner sweep hand representation */}
                <g className="radar-sweep-hand">
                  <line x1="50" y1="50" x2="50" y2="5" stroke="var(--color-cyan)" strokeWidth="1.5" strokeLinecap="round" />
                  <polygon points="50,50 45,5 50,5" fill="rgba(0, 240, 255, 0.15)" />
                </g>
                
                {/* Random radar sweep targets */}
                <circle cx="25" cy="30" r="2.5" fill="var(--color-cyan)" className="animate-ping" />
                <circle cx="75" cy="65" r="2" fill="var(--color-red)" />
              </svg>
              <div className="ml-4 font-mono text-[10px] text-slate-400">
                <p className="text-cyber-cyan font-bold tracking-wider">RADAR: SWEEPING</p>
                <p>FREQUENCY: 84.5 MHz</p>
                <p>THREATS FLAG: 2</p>
                <p>PULSE RATE: 1.2s</p>
              </div>
            </div>

          </div>

          {/* TACTICAL MONITOR NODES selector panel */}
          <div className="cyber-panel p-3 flex flex-col">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <i data-lucide="target" className="h-4 w-4"></i>
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
                      if (window.setGlobeLock) window.setGlobeLock(true);
                      if (window.focusOnCoordinate) window.focusOnCoordinate(loc.lat, loc.lon);
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

          {/* Crypto-decryption and message intercepts logs terminal panel */}
          <div className="cyber-panel p-3 flex flex-col flex-1 min-h-[250px]">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <h2 className="text-sm font-display font-bold tracking-wider text-glow-cyan text-cyber-cyan flex items-center space-x-1.5">
                <i data-lucide="terminal" className="h-4 w-4"></i>
                <span>DECRYPTOR TRANSCRIPT INTERCEPT</span>
              </h2>
              <i data-lucide="cpu" className="h-4 w-4 text-cyber-cyan animate-pulse"></i>
            </div>

            {/* Cryptographic buffer progression bar */}
            <div className="mb-2.5">
              <div className="flex justify-between font-mono text-[9px] text-slate-500 mb-1">
                <span>BUFFER STATUS</span>
                <span>{decryptionProgress.toFixed(0)}% LOADED</span>
              </div>
              <div className="w-full h-1 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-cyber-cyan transition-all duration-300 shadow-neon-cyan`} 
                  style={{ width: `${decryptionProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Decrypting dynamic stream log text */}
            <div className="flex-1 bg-black/60 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-cyber-green leading-relaxed text-glow-green overflow-y-auto max-h-[220px] select-text">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">// INCOMING DECRYPTED DATAPACKET</p>
              <p className="glitch-text">{decryptedText}</p>
            </div>

            {/* Static code/key scanner telemetry metrics */}
            <div className="mt-2.5 border-t border-slate-800 pt-2 font-mono text-[9px] text-slate-500 grid grid-cols-2 gap-1 text-center">
              <div>KEY: SHA256-DECR</div>
              <div>RATE: 1.4 TH/S</div>
            </div>

          </div>

        </section>

      </main>

      {/* Footer diagnostic logs scroll panel */}
      <footer className="border-t border-cyber-border mt-4 pt-3 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-slate-500">
        
        {/* Core load progress bars */}
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

        {/* Rolling cyber ticker marquee marquee message */}
        <div className="hidden lg:block flex-1 mx-8 max-w-[500px] overflow-hidden whitespace-nowrap relative">
          <div className="animate-[marquee_25s_linear_infinite] inline-block pl-[100%] text-[10px] tracking-widest text-slate-600">
            SYSTEM STATUS // CENTRAL INTERLINK INTEGRATION ONLINE... THREAT EPICENTERS INDEXED... ALL SAT DETECTORS ACTIVE... DEFCON 4 STABLE CONSOLE TELEMETRY OK...
          </div>
        </div>

        {/* Trademark and versioning labels */}
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
            
            {/* Enlarged canvas mock viewer */}
            <div className="relative border border-slate-800 bg-black rounded aspect-video w-full overflow-hidden flex items-center justify-center">
              <div className="absolute top-4 left-4 font-mono text-xs text-cyber-green space-y-1 z-20 bg-black/60 p-2.5 rounded border border-slate-800">
                <p>CAM ID: [SAT_CAM_{activeNode ? activeNode.id.toUpperCase() : 'GLOBAL'}_FULLSCREEN_SECURE]</p>
                <p>COORDS: {activeNode ? `${activeNode.lat.toFixed(6)}° N / ${activeNode.lon.toFixed(6)}° E` : 'SCANNING...'}</p>
                <p>RESOLUTION: 1920 X 1080 PX // 30 FPS</p>
                <p>AZIMUTH FEED: 192.42° // ELEVATION: 44.15°</p>
              </div>

              {/* Loss of connection screen or large night vision simulated camera grids */}
              {activeNode && activeNode.id === 'baghdad' ? (
                <div className="text-center font-mono text-cyber-red space-y-2 z-10 select-none">
                  <p className="text-lg font-bold">SIGNAL LOSS // LINK ERROR 404</p>
                  <p className="text-xs text-slate-500">RE-ESTABLISHING SECURE PROTOCOLS ON ALTERNATE CHANNELS...</p>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Glowing vector line mockups */}
                  <svg className="w-[90%] h-[90%] text-cyber-green opacity-40" viewBox="0 0 400 200">
                    <line x1="50" y1="180" x2="350" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="200" y1="20" x2="200" y2="180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
                    
                    {/* Targeting reticles */}
                    <circle cx="200" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.75" />
                    <circle cx="200" cy="100" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    
                    {/* Scanning vectors */}
                    <line x1="140" y1="100" x2="260" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="200" y1="40" x2="200" y2="160" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                  
                  {/* Scanning targeting box */}
                  <div className="absolute border-2 border-cyber-green w-48 h-48 rounded shadow-neon-green animate-pulse flex items-center justify-center pointer-events-none">
                    <div className="font-mono text-[9px] text-cyber-green bg-black/80 border border-cyber-green/50 p-2 absolute bottom-2 rounded text-center">
                      INTELLIGENCE TARGET DETECTED<br/>CLASSIFICATION: WARN_SIG_04
                    </div>
                  </div>
                </div>
              )}

              {/* Noise static filter */}
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
                <i data-lucide="shield-alert" className="h-5 w-5 animate-pulse text-cyber-red"></i>
                <span>TACTICAL INTERCEPT TRIGGERED</span>
              </h2>
              <button 
                onClick={() => { setInterceptionModal(false); triggerClick(); }}
                className="text-slate-400 hover:text-white"
              >
                <i data-lucide="x" className="h-4 w-4"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-950/20 border border-cyber-red/30 rounded p-3 text-xs font-mono leading-relaxed text-slate-300">
                <p className="text-cyber-red font-bold text-glow-red mb-1.5">// CRITICAL ACTION REQUIRED</p>
                <p>Target Coordinate Lock-on: <span className="text-cyber-cyan">{activeNode ? `${activeNode.lat.toFixed(4)} N / ${activeNode.lon.toFixed(4)} E` : 'GLOBAL SCAN'}</span></p>
                <p>Location Profile: <span className="text-cyber-cyan">{activeNode ? activeNode.name : 'ALL ACTIVE MONITOR SECTORS'}</span></p>
                <p>Estimated ballistic travel time: <span className="text-cyber-amber">182 seconds</span></p>
              </div>

              {/* Progress Interceptor */}
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

              {/* Decrypted interception console telemetry log */}
              <div className="bg-[#050101] border border-red-950 rounded p-2.5 font-mono text-[10px] text-cyber-red min-h-[90px] text-glow-red">
                <p>{interceptionLog}</p>
              </div>

              {/* Dismiss controls */}
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

// Initialise Lucide icons and Mount React component
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);

// Polling interval to trigger lucide updates since React elements render asynchronously
setInterval(() => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}, 500);

// Helper function to animate cyber ticker
const keyframeMarquee = `
  @keyframes marquee {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-100%, 0, 0); }
  }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = keyframeMarquee;
document.head.appendChild(styleSheet);
