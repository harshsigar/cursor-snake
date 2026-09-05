/**
 * ==========================================================================
 * CURSOR SNAKE - PHYSICS & RENDERING ENGINE (Canvas 2D)
 * Features: Inverse Kinematics, Undulation Math, Particle Engine, Game Logic
 * ==========================================================================
 */

class Segment {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.radius = radius;
  }

  follow(targetX, targetY, targetDist) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    this.angle = Math.atan2(dy, dx);
    this.x = targetX - Math.cos(this.angle) * targetDist;
    this.y = targetY - Math.sin(this.angle) * targetDist;
  }
}

class Particle {
  constructor(x, y, color, speed, size) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size || Math.random() * 3 + 1.5;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.alpha = 1;
    this.decay = Math.random() * 0.03 + 0.015;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FoodOrb {
  constructor(w, h) {
    this.respawn(w, h);
  }

  respawn(w, h) {
    this.x = Math.random() * (w - 100) + 50;
    this.y = Math.random() * (h - 100) + 50;
    this.radius = 8;
    this.pulse = 0;
    const colors = ['#f59e0b', '#ec4899', '#10b981', '#38bdf8', '#a855f7'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.pulse += 0.06;
  }

  draw(ctx) {
    ctx.save();
    const r = this.radius + Math.sin(this.pulse) * 2.5;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class SnakeEntity {
  constructor(x, y, length = 45, maxRadius = 14, spacing = 9, isBaby = false) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.length = length;
    this.maxRadius = maxRadius;
    this.spacing = spacing;
    this.isBaby = isBaby;
    this.wigglePhase = Math.random() * Math.PI * 2;
    this.tongueFlick = 0;

    this.segments = [];
    this.initSegments();
  }

  initSegments() {
    this.segments = [];
    for (let i = 0; i < this.length; i++) {
      // Taper radius from head (max) to tail (small)
      const ratio = 1 - (i / this.length);
      const r = Math.max(2.5, this.maxRadius * Math.pow(ratio, 0.75));
      this.segments.push(new Segment(this.x, this.y, r));
    }
  }

  setLength(newLen) {
    this.length = newLen;
    this.initSegments();
  }

  update(targetX, targetY, speedMultiplier = 1, wiggleAmp = 12, wiggleFreq = 0.15) {
    // Distance to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    this.angle = Math.atan2(dy, dx);

    // Dynamic speed based on distance
    const baseSpeed = this.isBaby ? 0.08 : 0.095;
    const speed = Math.min(dist * baseSpeed * speedMultiplier, 24 * speedMultiplier);

    // Slithering sine wave lateral motion
    this.wigglePhase += wiggleFreq * (speed > 1 ? 1 : 0.2);
    const lateralOffset = Math.sin(this.wigglePhase) * wiggleAmp * Math.min(dist / 50, 1);
    const lateralAngle = this.angle + Math.PI / 2;

    if (dist > 5) {
      this.x += Math.cos(this.angle) * speed + Math.cos(lateralAngle) * lateralOffset * 0.2;
      this.y += Math.sin(this.angle) * speed + Math.sin(lateralAngle) * lateralOffset * 0.2;
    }

    // Tongue animation
    this.tongueFlick += 0.08;

    // Inverse Kinematics for segments
    if (this.segments.length > 0) {
      this.segments[0].x = this.x;
      this.segments[0].y = this.y;
      this.segments[0].angle = this.angle;

      for (let i = 1; i < this.segments.length; i++) {
        const prev = this.segments[i - 1];
        this.segments[i].follow(prev.x, prev.y, this.spacing);
      }
    }
  }

  draw(ctx, skinConfig, isBoosting = false) {
    if (this.segments.length === 0) return;

    ctx.save();

    // 1. Draw smooth continuous spine path
    ctx.beginPath();
    ctx.moveTo(this.segments[0].x, this.segments[0].y);
    for (let i = 1; i < this.segments.length; i++) {
      const xc = (this.segments[i].x + this.segments[i - 1].x) / 2;
      const yc = (this.segments[i].y + this.segments[i - 1].y) / 2;
      ctx.quadraticCurveTo(this.segments[i - 1].x, this.segments[i - 1].y, xc, yc);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 2. Draw segmented scales / vertebrae
    for (let i = this.segments.length - 1; i >= 0; i--) {
      const seg = this.segments[i];
      const progress = i / this.segments.length;
      const color = skinConfig.getColor(progress, i);

      ctx.fillStyle = color;
      ctx.shadowColor = skinConfig.glowColor;
      ctx.shadowBlur = isBoosting ? 20 : (this.isBaby ? 6 : 12);

      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
      ctx.fill();

      // Spine highlights
      if (!this.isBaby && i % 2 === 0 && seg.radius > 5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, seg.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Draw Snake Head
    const head = this.segments[0];
    const headAngle = head.angle;
    const headRadius = head.radius * 1.15;

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(headAngle);

    // Forked Tongue
    const tongueLen = (Math.sin(this.tongueFlick) > 0.5) ? 18 : (Math.sin(this.tongueFlick) > 0) ? 10 : 0;
    if (tongueLen > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(headRadius, 0);
      ctx.lineTo(headRadius + tongueLen, 0);
      ctx.lineTo(headRadius + tongueLen + 6, -4);
      ctx.moveTo(headRadius + tongueLen, 0);
      ctx.lineTo(headRadius + tongueLen + 6, 4);
      ctx.stroke();
    }

    // Head Base
    ctx.fillStyle = skinConfig.headColor;
    ctx.shadowColor = skinConfig.glowColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(0, 0, headRadius * 1.15, headRadius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeOffsetX = headRadius * 0.35;
    const eyeOffsetY = headRadius * 0.55;
    const eyeRadius = Math.max(2.5, headRadius * 0.28);

    // Left Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Eye Glow Pupil
    ctx.fillStyle = skinConfig.eyeColor || '#38bdf8';
    ctx.shadowColor = skinConfig.eyeColor || '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(eyeOffsetX + 1, -eyeOffsetY, eyeRadius * 0.55, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX + 1, eyeOffsetY, eyeRadius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}

class SnakeSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Viewport sizing
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse & Pointer Tracking
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.isMouseDown = false;
    this.isSpacePressed = false;

    // Simulation Config
    this.mode = 'slither'; // 'slither' | 'feast' | 'swarm'
    this.skin = 'viper';   // 'viper' | 'drake' | 'rainbow' | 'cosmic'
    this.score = 0;
    this.foodItems = [];
    this.particles = [];
    this.rainbowHue = 0;

    // Config Sliders
    this.snakeLength = 45;
    this.wiggleAmp = 12;
    this.wiggleFreq = 0.16;

    // Entities
    this.mainSnake = new SnakeEntity(this.width / 2, this.height / 2, this.snakeLength, 15, 9);
    this.babySnakes = [];

    this.initFood();
    this.initSwarm();
    this.bindInputs();
    this.loop();
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  initFood() {
    this.foodItems = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      this.foodItems.push(new FoodOrb(this.width, this.height));
    }
  }

  initSwarm() {
    this.babySnakes = [];
    for (let i = 0; i < 4; i++) {
      const baby = new SnakeEntity(
        this.width / 2 + (Math.random() - 0.5) * 200,
        this.height / 2 + (Math.random() - 0.5) * 200,
        22,
        8,
        6,
        true
      );
      this.babySnakes.push(baby);
    }
  }

  bindInputs() {
    const updatePointer = (x, y) => {
      this.mouseX = x;
      this.mouseY = y;
    };

    window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && !e.target.closest('.hud-top') && !e.target.closest('.settings-drawer')) {
        this.isMouseDown = true;
        if (window.soundEngine) window.soundEngine.playBoost();
      }
    });
    window.addEventListener('mouseup', () => this.isMouseDown = false);
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0 && e.target.id === 'snakeCanvas') {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        this.isMouseDown = true;
      }
    }, { passive: true });
    window.addEventListener('touchend', () => this.isMouseDown = false);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.isSpacePressed = true;
        if (window.soundEngine) window.soundEngine.playBoost();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') this.isSpacePressed = false;
    });
  }

  getSkinConfig() {
    this.rainbowHue = (this.rainbowHue + 1) % 360;

    switch (this.skin) {
      case 'drake':
        return {
          headColor: '#f97316',
          glowColor: '#ef4444',
          eyeColor: '#fbbf24',
          getColor: (progress) => `hsl(${20 + progress * 35}, 95%, ${50 + (1 - progress) * 10}%)`
        };
      case 'rainbow':
        return {
          headColor: `hsl(${this.rainbowHue}, 100%, 65%)`,
          glowColor: `hsl(${this.rainbowHue}, 100%, 55%)`,
          eyeColor: '#ffffff',
          getColor: (progress, idx) => `hsl(${(this.rainbowHue + idx * 8) % 360}, 90%, 60%)`
        };
      case 'cosmic':
        return {
          headColor: '#c084fc',
          glowColor: '#818cf8',
          eyeColor: '#38bdf8',
          getColor: (progress) => `hsl(${260 + progress * 50}, 85%, ${65 - progress * 20}%)`
        };
      case 'viper':
      default:
        return {
          headColor: '#38bdf8',
          glowColor: '#38bdf8',
          eyeColor: '#34d399',
          getColor: (progress) => `hsl(${190 + progress * 50}, 90%, ${55 - progress * 15}%)`
        };
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    const isBoosting = this.isMouseDown || this.isSpacePressed;
    const speedMult = isBoosting ? 2.2 : 1;

    // Toggle turbo body class for HUD meter
    document.body.classList.toggle('turbo-active', isBoosting);

    // Update Main Snake
    this.mainSnake.update(this.mouseX, this.mouseY, speedMult, this.wiggleAmp, this.wiggleFreq);

    // Emit tail particles
    if (this.mainSnake.segments.length > 0) {
      const tail = this.mainSnake.segments[this.mainSnake.segments.length - 1];
      const skin = this.getSkinConfig();
      if (Math.random() < (isBoosting ? 0.8 : 0.35)) {
        this.particles.push(new Particle(tail.x, tail.y, skin.glowColor, isBoosting ? 4 : 2));
      }
      if (isBoosting && Math.random() < 0.6) {
        const head = this.mainSnake.segments[0];
        this.particles.push(new Particle(head.x, head.y, '#ffffff', 5, 2));
      }
    }

    // Update Food in Feast Mode
    if (this.mode === 'feast') {
      const head = this.mainSnake.segments[0];
      this.foodItems.forEach(food => {
        food.update();
        const dist = Math.hypot(food.x - head.x, food.y - head.y);
        if (dist < head.radius + food.radius + 6) {
          // Eat food!
          food.respawn(this.width, this.height);
          this.score += 10;
          this.snakeLength += 2;
          this.mainSnake.setLength(this.snakeLength);

          // Particles burst on eat
          for (let p = 0; p < 12; p++) {
            this.particles.push(new Particle(food.x, food.y, food.color, 6, 3));
          }

          if (window.soundEngine) window.soundEngine.playEat();
          if (window.uiManager) window.uiManager.updateScore(this.score, this.snakeLength);
        }
      });
    }

    // Update Swarm Mode
    if (this.mode === 'swarm') {
      const targets = [
        { x: this.mainSnake.x - 40, y: this.mainSnake.y - 40 },
        { x: this.mainSnake.x + 40, y: this.mainSnake.y - 40 },
        { x: this.mainSnake.x - 50, y: this.mainSnake.y + 30 },
        { x: this.mainSnake.x + 50, y: this.mainSnake.y + 30 }
      ];
      this.babySnakes.forEach((baby, i) => {
        const t = targets[i % targets.length];
        baby.update(t.x, t.y, speedMult * 0.9, 8, 0.2);
      });
    }

    // Update Particles
    this.particles = this.particles.filter(p => p.update());
  }

  draw() {
    // Clear screen with faint trails for motion blur
    this.ctx.fillStyle = 'rgba(5, 8, 17, 0.35)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const skinConfig = this.getSkinConfig();
    const isBoosting = this.isMouseDown || this.isSpacePressed;

    // Draw Particles
    this.particles.forEach(p => p.draw(this.ctx));

    // Draw Food in Feast Mode
    if (this.mode === 'feast') {
      this.foodItems.forEach(f => f.draw(this.ctx));
    }

    // Draw Baby Snakes in Swarm Mode
    if (this.mode === 'swarm') {
      this.babySnakes.forEach(baby => baby.draw(this.ctx, skinConfig, isBoosting));
    }

    // Draw Main Snake
    this.mainSnake.draw(this.ctx, skinConfig, isBoosting);
  }
}

window.SnakeSimulation = SnakeSimulation;
