/**
 * ==========================================================================
 * CURSOR SNAKE - UI & CONTROLS MANAGER
 * Handles: Modes, Skins, Settings Drawer, Sliders, Audio, Fullscreen
 * ==========================================================================
 */

class UIManager {
  constructor(sim) {
    this.sim = sim;
    this.scoreVal = document.getElementById('scoreVal');
    this.lengthVal = document.getElementById('lengthVal');
    this.settingsDrawer = document.getElementById('settingsDrawer');
    this.statsHud = document.getElementById('statsHud');

    this.bindEvents();
  }

  bindEvents() {
    // Mode Switcher
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        this.sim.mode = mode;

        // Toggle Stats HUD
        if (this.statsHud) {
          this.statsHud.style.display = mode === 'feast' ? 'flex' : 'none';
        }

        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // Skin Picker
    document.querySelectorAll('.skin-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const skin = card.getAttribute('data-skin');
        this.sim.skin = skin;
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // Settings Drawer Toggle
    const settingsBtn = document.getElementById('settingsToggle');
    const closeSettingsBtn = document.getElementById('closeSettings');

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.settingsDrawer.classList.add('open');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', () => {
        this.settingsDrawer.classList.remove('open');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Sliders
    const lenSlider = document.getElementById('lenSlider');
    const lenValDisp = document.getElementById('lenValDisp');
    if (lenSlider && lenValDisp) {
      lenSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        lenValDisp.textContent = val;
        this.sim.snakeLength = val;
        this.sim.mainSnake.setLength(val);
      });
    }

    const wiggleSlider = document.getElementById('wiggleSlider');
    const wiggleValDisp = document.getElementById('wiggleValDisp');
    if (wiggleSlider && wiggleValDisp) {
      wiggleSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        wiggleValDisp.textContent = val;
        this.sim.wiggleAmp = val;
      });
    }

    // Sound Toggle
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.soundEngine) {
          const on = window.soundEngine.toggle();
          soundBtn.classList.toggle('active', on);
          soundBtn.innerHTML = on ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          ` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          `;
        }
      });
    }

    // Fullscreen Toggle
    const fsBtn = document.getElementById('fullscreenToggle');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }
  }

  updateScore(score, len) {
    if (this.scoreVal) this.scoreVal.textContent = score;
    if (this.lengthVal) this.lengthVal.textContent = len;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const simulation = new window.SnakeSimulation('snakeCanvas');
  window.uiManager = new UIManager(simulation);
});
