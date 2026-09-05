# 🐍 Interactive Cursor-Following Snake

A fluid, physics-based neon snake simulation and mini-game built with **HTML5 Canvas**, **Modern CSS3**, and **Vanilla JavaScript** (Inverse Kinematics & Web Audio API synthesizer).

The snake realistically slithers and articulates its spine to track your mouse cursor or touch pointer in real-time.

---

## 🌟 Key Features

- **🎮 3 Game & Simulation Modes**:
  - **Free Slither Mode**: Relaxing interactive physics toy where the snake follows your pointer.
  - **Feast / Hunter Mode**: Energy orbs spawn across the screen. Steer the snake to eat them, grow longer, and build high scores!
  - **Swarm Mode**: Spawns a family of baby snakes following the main serpent.
- **🎨 4 Stunning Neon Skins**:
  - 🐍 *Cyber Viper* (Cyan / Emerald glow)
  - 🔥 *Magma Drake* (Fiery orange / red embers)
  - 🌈 *Chromatic Rainbow* (Dynamic shifting color cycle)
  - 🌌 *Cosmic Void* (Deep galaxy stardust)
- **⚡ Turbo Boost / Dash**:
  - Hold left click or <kbd>Spacebar</kbd> to activate high-speed boost with particle trails and speed lines.
- **🔊 Web Audio API Sound Effects**:
  - Synthesized slither swooshes, munch sounds, and boost audio (zero audio file downloads needed).
- **📱 Fully Responsive & Touch-Friendly**:
  - Drag your finger on mobile and tablet screens to steer smoothly.

---

## 📂 Project Structure

```text
c:\Codes\cursor-snake\
├── index.html            # Canvas viewport, HUD overlay & settings drawer
├── css\
│   └── style.css         # Modern glassmorphism UI & responsive styling
├── js\
│   ├── snake.js          # Inverse kinematics, physics & particle system
│   ├── sound.js          # Web Audio API sound generator
│   └── ui.js             # Theme switcher, game mode state & HUD handlers
├── assets\
│   ├── favicon.svg       # Custom snake favicon
│   └── preview.svg       # Social preview banner
└── README.md             # Project documentation
```

---

## 🖥️ How to Run Locally

### Method 1: Double-Click
Open File Explorer, navigate to `c:\Codes\cursor-snake`, and double-click `index.html`.

### Method 2: Local Server
In PowerShell:
```powershell
cd c:\Codes\cursor-snake
python -m http.server 4000
```
Then visit [http://localhost:4000](http://localhost:4000).

---

## 📜 License
Open-source under the [MIT License](https://opensource.org/licenses/MIT).
