// CRUCIX 3D Tactical Globe Engine
// Built using Three.js with WebGL

let globeScene, globeCamera, globeRenderer, globeControls;
let globeGroup;
let satellites = [];
let threatNodes = [];
let connectionArcs = [];
let pulseCircles = [];
let activeNodeId = null;

// Target camera rotation for smooth panning
let targetRotation = { x: 0, y: 0 };
let isPanning = false;
let isLocked = false; // Prevents slow auto-rotation when focused on a coordinate

// Expose lock state controller to window context
window.setGlobeLock = function(locked) {
  isLocked = locked;
};

// Global Threat Node Coordinates
const THREAT_LOCATIONS = [
  { id: 'nyc', name: 'US-CYBERCOM // WASHINGTON', lat: 38.9072, lon: -77.0369, level: 'LOW', color: '#00f0ff', cctv: 'ACTIVE' },
  { id: 'kyiv', name: 'EAST-BLOCK // POWER GRID TERMINAL', lat: 50.4501, lon: 30.5234, level: 'HIGH', color: '#ffaa00', cctv: 'DEGRADED' },
  { id: 'baghdad', name: 'ME-OUTPOST // INSURGENT SECTOR', lat: 33.3128, lon: 44.3615, level: 'CRITICAL', color: '#ff0055', cctv: 'NO SIGNAL' },
  { id: 'tokyo', name: 'APAC-HQ // QUANTUM LABS', lat: 35.6762, lon: 139.6503, level: 'STABLE', color: '#39ff14', cctv: 'SECURE' },
  { id: 'cairo', name: 'AFRICA-NORTH // COMMS RELAY', lat: 30.0444, lon: 31.2357, level: 'ELEVATED', color: '#ffaa00', cctv: 'INTERCEPTED' },
  { id: 'amazon', name: 'LATAM-COVERT // LANDING STRIP', lat: -3.4653, lon: -62.2159, level: 'LOW', color: '#00f0ff', cctv: 'STANDBY' }
];

// Expose locations list to window context
window.THREAT_LOCATIONS = THREAT_LOCATIONS;

// Helper: Convert Lat/Lon to 3D Spherical Vector
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
}

function initGlobe(containerId, onSelectNode) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  const width = container.clientWidth;
  const height = container.clientHeight;

  // 1. Scene & Group Setup
  globeScene = new THREE.Scene();
  globeScene.fog = new THREE.FogExp2(0x030611, 0.015);

  globeGroup = new THREE.Group();
  globeScene.add(globeGroup);

  // 2. Camera Setup
  globeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  globeCamera.position.set(0, 5, 14);

  // 3. Renderer Setup
  globeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  globeRenderer.setSize(width, height);
  globeRenderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(globeRenderer.domElement);

  // 4. Controls Setup
  globeControls = new THREE.OrbitControls(globeCamera, globeRenderer.domElement);
  globeControls.enableDamping = true;
  globeControls.dampingFactor = 0.05;
  globeControls.minDistance = 6;
  globeControls.maxDistance = 25;
  globeControls.enablePan = false;

  // 5. Lighting Setup
  const ambientLight = new THREE.AmbientLight(0x0e1b30, 1.5);
  globeScene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.5);
  dirLight1.position.set(5, 3, 5);
  globeScene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xff0055, 0.6);
  dirLight2.position.set(-5, -3, -5);
  globeScene.add(dirLight2);

  // 6. Build Sci-Fi Earth Globe
  const globeRadius = 4;

  // Outer Glowing Atmosphere
  const atmosGeom = new THREE.SphereGeometry(globeRadius * 1.08, 32, 32);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmosGeom, atmosMat);
  globeGroup.add(atmosphere);

  // Inner Dark Solid Sphere to block back-side rendering
  const innerSolidGeom = new THREE.SphereGeometry(globeRadius * 0.99, 32, 32);
  const innerSolidMat = new THREE.MeshBasicMaterial({
    color: 0x040814,
    transparent: false
  });
  const innerSolid = new THREE.Mesh(innerSolidGeom, innerSolidMat);
  globeGroup.add(innerSolid);

  // Holographic Wireframe Grid Globe
  const gridGeom = new THREE.SphereGeometry(globeRadius, 32, 24);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x00a8ff,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  const gridGlobe = new THREE.Mesh(gridGeom, gridMat);
  globeGroup.add(gridGlobe);

  // Globe Latitude/Longitude Circular Ring Bands
  for (let i = 1; i < 6; i++) {
    const latRadius = globeRadius * Math.sin((i * Math.PI) / 6);
    const latY = globeRadius * Math.cos((i * Math.PI) / 6);
    
    const ringGeom = new THREE.BufferGeometry();
    const vertices = [];
    for (let j = 0; j <= 64; j++) {
      const angle = (j / 64) * Math.PI * 2;
      vertices.push(Math.cos(angle) * latRadius, latY, Math.sin(angle) * latRadius);
    }
    ringGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15
    });
    const ring = new THREE.Line(ringGeom, ringMat);
    globeGroup.add(ring);
  }

  // 7. Create Starfield / Cyber Particles
  const starsGeom = new THREE.BufferGeometry();
  const starsCount = 600;
  const starPositions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount * 3; i += 3) {
    const dist = 30 + Math.random() * 40;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    starPositions[i] = dist * Math.sin(phi) * Math.cos(theta);
    starPositions[i+1] = dist * Math.sin(phi) * Math.sin(theta);
    starPositions[i+2] = dist * Math.cos(phi);
  }
  starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.15,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true
  });
  const stars = new THREE.Points(starsGeom, starsMat);
  globeScene.add(stars);

  // 8. Create Satellite Orbits & Satellites
  createSatelliteOrbit(5.5, 0.4, 0.3, 'KH-11 SPY SATELLITE');
  createSatelliteOrbit(6.2, -0.6, 0.1, 'LACROSSE-2 RADAR');
  createSatelliteOrbit(7.0, 0.2, 0.8, 'ONYX SIGNAL DOCK');

  // 9. Generate Threat Nodes
  THREAT_LOCATIONS.forEach(loc => {
    const pos = latLonToVector3(loc.lat, loc.lon, globeRadius);

    // Glowing core sphere
    const nodeGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(loc.color),
      transparent: true,
      opacity: 0.95
    });
    const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
    nodeMesh.position.copy(pos);
    nodeMesh.userData = { id: loc.id, name: loc.name, info: loc };
    
    globeGroup.add(nodeMesh);
    threatNodes.push(nodeMesh);

    // Expanding Pulse Waves
    createPulseRipple(pos, loc.color);
  });

  // 10. Generate Threat Connection Arcs
  // Draw glowing data exchange arcs connecting nodes to show tactical networks
  for (let i = 0; i < THREAT_LOCATIONS.length - 1; i++) {
    const startVec = latLonToVector3(THREAT_LOCATIONS[i].lat, THREAT_LOCATIONS[i].lon, globeRadius);
    const endVec = latLonToVector3(THREAT_LOCATIONS[i+1].lat, THREAT_LOCATIONS[i+1].lon, globeRadius);
    createConnectionArc(startVec, endVec);
  }

  // 11. Raycaster for clicks & Hover interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onPointerDown(event) {
    // Calculate mouse position relative to container
    const rect = globeRenderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, globeCamera);
    const intersects = raycaster.intersectObjects(threatNodes);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const clickedNode = clickedMesh.userData.info;
      
      // Call sound trigger
      const clickSound = document.getElementById('snd-click');
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
      }

      // Execute callback
      onSelectNode(clickedNode);
      focusOnCoordinate(clickedNode.lat, clickedNode.lon);
      isLocked = true; // Lock slow rotation on this node
    }
  }

  // Change cursor on Hover over interactive nodes
  function onPointerMove(event) {
    const rect = globeRenderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, globeCamera);
    const intersects = raycaster.intersectObjects(threatNodes);

    if (intersects.length > 0) {
      container.style.cursor = 'pointer';
      // Slight scale pop
      intersects[0].object.scale.set(1.4, 1.4, 1.4);
    } else {
      container.style.cursor = 'default';
      threatNodes.forEach(mesh => {
        mesh.scale.set(1.0, 1.0, 1.0);
      });
    }
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);

  // Window Resize Event
  window.addEventListener('resize', handleResize);

  function handleResize() {
    if (!container || !globeRenderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    globeCamera.aspect = w / h;
    globeCamera.updateProjectionMatrix();
    globeRenderer.setSize(w, h);
  }

  // 12. Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Rotate globe slowly by default if not panning AND not locked
    if (!isPanning && !isLocked) {
      globeGroup.rotation.y += 0.03 * delta;
    }

    // Rotate satellites along orbital paths
    satellites.forEach(sat => {
      sat.angle += sat.speed * delta;
      
      // Calculate 3D position based on orbit path and tilt
      const radius = sat.orbitRadius;
      const cosAngle = Math.cos(sat.angle);
      const sinAngle = Math.sin(sat.angle);
      
      // Basic flat circle on X-Z plane
      let pos = new THREE.Vector3(cosAngle * radius, 0, sinAngle * radius);
      // Tilt circle on Z-axis and X-axis
      pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), sat.tiltZ);
      pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.tiltX);
      
      sat.mesh.position.copy(pos);
      sat.mesh.rotation.y += 1.5 * delta; // self spinning
    });

    // Animate expanding pulse circles
    pulseCircles.forEach(pulse => {
      pulse.scaleVal += 1.0 * delta;
      if (pulse.scaleVal > 2.0) {
        pulse.scaleVal = 0.5;
        pulse.material.opacity = 0.8;
      } else {
        pulse.material.opacity = 0.8 * (1.0 - (pulse.scaleVal - 0.5) / 1.5);
      }
      pulse.mesh.scale.set(pulse.scaleVal, pulse.scaleVal, pulse.scaleVal);
    });

    // Handle camera smooth panning to focus coordinate
    if (isPanning) {
      const step = 0.05; // interpolation rate
      
      // Smoothly interpolate group rotation
      const diffY = targetRotation.y - globeGroup.rotation.y;
      const diffX = targetRotation.x - globeGroup.rotation.x;
      
      globeGroup.rotation.y += diffY * step;
      globeGroup.rotation.x += diffX * step;
      
      if (Math.abs(diffY) < 0.005 && Math.abs(diffX) < 0.005) {
        isPanning = false;
      }
    }

    globeControls.update();
    globeRenderer.render(globeScene, globeCamera);
  }

  animate();
}

// Create satellite model and track
function createSatelliteOrbit(radius, tiltX, tiltZ, name) {
  // Orbit Ring
  const ringGeom = new THREE.BufferGeometry();
  const vertices = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    // Base ring in X-Z plane
    let p = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    p.applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);
    p.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
    vertices.push(p.x, p.y, p.z);
  }
  
  ringGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const ringMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.12
  });
  const orbitLine = new THREE.Line(ringGeom, ringMat);
  globeGroup.add(orbitLine);

  // Satellite model: A mini cylinder and solar panel boxes
  const satGroup = new THREE.Group();
  
  // Body (Spy Cylinder)
  const bodyGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
  const bodyMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  satGroup.add(body);

  // Solar Panels (Two boxes)
  const panelGeom = new THREE.BoxGeometry(0.35, 0.02, 0.1);
  const panelMat = new THREE.MeshBasicMaterial({ color: 0x1b347a, wireframe: true });
  
  const panelL = new THREE.Mesh(panelGeom, panelMat);
  panelL.position.x = 0.25;
  satGroup.add(panelL);

  const panelR = new THREE.Mesh(panelGeom, panelMat);
  panelR.position.x = -0.25;
  satGroup.add(panelR);

  globeGroup.add(satGroup);

  satellites.push({
    mesh: satGroup,
    orbitRadius: radius,
    tiltX: tiltX,
    tiltZ: tiltZ,
    angle: Math.random() * Math.PI * 2,
    speed: 0.08 + Math.random() * 0.1,
    name: name
  });
}

// Draw connection curves between threat epicenters
function createConnectionArc(start, end) {
  // Find midpoint and lift it up relative to distance
  const distance = start.distanceTo(end);
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const lift = 0.5 + distance * 0.15;
  midPoint.normalize().multiplyScalar(4 + lift); // lift height

  // Quadratic curve
  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  const points = curve.getPoints(32);
  
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });

  const line = new THREE.Line(geom, mat);
  globeGroup.add(line);
  connectionArcs.push(line);
}

// Expanding threat pulse radar rings
function createPulseRipple(position, colorHex) {
  const pulseRadius = 0.45;
  const geom = new THREE.RingGeometry(pulseRadius * 0.8, pulseRadius, 32);
  
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colorHex),
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  const mesh = new THREE.Mesh(geom, mat);
  
  // Align ring parallel to Earth's spherical surface at that node coordinate
  mesh.position.copy(position);
  mesh.lookAt(new THREE.Vector3(0, 0, 0));
  
  globeGroup.add(mesh);

  pulseCircles.push({
    mesh: mesh,
    material: mat,
    scaleVal: 0.5
  });
}

// Focus Earth globe to a target Coordinate
function focusOnCoordinate(lat, lon) {
  // Convert spherical lat/lon rotation variables
  // Standard math conversion to align coordinate pointing directly toward camera
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  // Set target rotation angles
  targetRotation.y = -theta + Math.PI / 2;
  targetRotation.x = phi - Math.PI / 2;
  
  isPanning = true;
}
