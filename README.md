# 🛰️ CRUCIX // GLOBAL SURVEILLANCE & SATELLITE COMMAND

> **CRUCIX** is an ultra-realistic, immersive sci-fi Cyber-HUD Command Dashboard. Built for operational oversight, intelligence gathering, and tactical communications, it presents a simulated real-time planetary monitoring interface styled after elite cyber warfare operations centers. 

---

## 🎯 KEY SYSTEM FEATURES

### 🗺️ 1. Holographic 2D Vector Tactical Sector Map
- **Custom Vector Continents:** Scalable, glowing polygon boundaries of North America, South America, Eurasia, Africa, and Australia with high-tech grid fills.
- **Interactive Command Sectors:** Divided into 6 main geopolitical commands (North American Command, East-Block Command, Middle-East Outpost, APAC HQ, Africa-North Relay, and LatAm Covert Sector).
- **Hover Highlights & Targets:** Hovering over a continent highlights its operational sector box. Clicking on a sector instantly focuses the satellite uplink and projects precision coordinate lines pointing to the latitudinal/longitudinal axes.
- **Advanced 2D Navigation:** Smooth click-and-drag to pan the map and mouse scroll-wheel to zoom dynamically towards your cursor position (scaling from 50% to 600%). Includes a dedicated floating HUD displaying zoom scale and a quick viewport reset trigger.

### 🛡️ 2. Multi-Layer Tactical Surveillance Trackers
- **Undersea Fiber Cable Matrix:** Displays glowing subsea communication lines linking major global sectors. Simulates real-time hardware splitters and triggers warning indicators on tapped undersea terminals (e.g. Cairo undersea breach).
- **Maritime Fleet Carrier Groups:** Animated navy carrier fleets (`▲` icon, like `CVN-78 Ford` and `CVN-76 Reagan`) navigating shipping routes in real-time.
- **ICBM Silo & Ballistic Warning:** Plots hidden operational launch silos (`☢` icon) in remote wilderness areas. Adjusting the system DEFCON level to **1** triggers a flashing trajectory arc showing a ballistic flight trajectory towards active sectors, initiating full-alert status.
- **Space Weather & Seismic Anomalies:** Highlights seismic fault lines with pulsing warning hexagons (`[SEISMIC ACTIVITY]`) and auroral solar geomagnetic storms with pulsing circular radiation grids.

### 🫀 3. Ground Operative Vital Telemetry & Live ECG
- **Ground Operative Biosignals:** Displays live vital tracking for undercover ground agents deployed inside active sectors (e.g., heart rate BPM, body temperature, ammo capacity, and mission status).
- **Pulsing Electrocardiogram (ECG):** Features an advanced, high-performance HTML5 Canvas-based scrolling vital wave. 
- **Dynamic Vital Alerts:** Operative heart rate, body temperature, and the speed of the ECG wave automatically accelerate if the system DEFCON level is raised to 1 or 2, flashing warning-red and simulating biological stress telemetry!

### 📹 4. Simulated CCTV Live Viewport
- **Dynamic CCTV Canvas:** Displays localized video feeds unique to each target coordinates node:
  - **Thermal view:** Active for Amazon covert landing strips.
  - **Degraded Signal Noise:** Simulates frequency interference in Kyiv and Cairo.
  - **Feed Lost (Link 404):** Displays complete signal drop in Baghdad.
  - **Radar Sweep Standby:** Standard scanning coordinates target bracket when no node is active.
- **CCTV HD Zoom:** Open a dedicated fullscreen viewport with tactical target brackets and tracking guides.

### 🔊 5. Tactical Hud Audio & Decryptor
- **Ambient Soundscapes:** HTML5 Audio API integrations for click feedback, active radar sweeps, looping alert sirens, and looping command center room hums.
- **Live Terminal Decryptor:** Scrambles and decrypts intercepted satellite signals, displaying alphanumeric code key correlations unique to each geographical outpost.

---

## 💻 TECHNOLOGY STACK

- **Core Framework:** React 18 & ReactDOM
- **Build System:** Vite (Fast, hot module reloading)
- **UI & Iconography:** Tailwind CSS & Lucide Icons
- **Vector Render Engine:** HTML5 2D Canvas API (High-performance rendering, zero WebGL overhead, minimal bundle size)
- **Audio Processing:** HTML5 Audio hooks

---

## 🚀 INSTALLATION & LOCAL EXECUTION

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16.0 or higher) and `npm` installed.

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/cruciz-dashboard.git
cd cruciz-dashboard
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser to command the console!

### Step 4: Build for Production
```bash
npm run build
```

---

## 🎮 COMMAND CONTROLS LEGEND

| Control Input | HUD Action |
| :--- | :--- |
| **Left Click + Drag** | Pan the 2D Tactical Sector Map |
| **Scroll Wheel** | Zoom in / out of coordinates (Zoom to cursor) |
| **Click Sector/Node** | Establish Secure Uplink & target lock |
| **[RESET RADAR]** | Return grid coordinates zoom scale to 100% |
| **DEFCON Buttons (1-5)** | Adjust threat warning levels (DEFCON 1 triggers ICBM arcs) |
| **[RUN TACTICAL SCAN]** | Initiate radar sweep scan on locked node |
| **[LAUNCH KINETIC SHIELD]**| Propose orbital kinetic defense strike calibration |
| **[CONSOLE AUDIO]** | Mute / unmute background HUD room hums and sirens |
| **[RELEASE TARGET LOCK]** | Release coordinate locks and return to Standby overview |
