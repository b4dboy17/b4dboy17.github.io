// Mouse cursor glow + particle trail effect
(function() {
  'use strict';

  // --- CONFIG ---
  const GLOW_SIZE = 28;
  const TRAIL_LENGTH = 12;
  const PARTICLE_COUNT = 3;    // particles per frame
  const FADE_SPEED = 0.04;
  const TRAIL_SPEED = 0.12;

  const COLORS = {
    glow: 'rgba(108, 92, 231, VAR)',
    trail: 'rgba(108, 92, 231, VAR)',
    particle: ['rgba(108, 92, 231, VAR)', 'rgba(0, 206, 201, VAR)', 'rgba(255, 107, 107, VAR)']
  };

  // --- STATE ---
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let trail = [];
  let particles = [];
  let glowEl, canvas, ctx;
  let animId = null;
  let started = false;

  // --- DOM SETUP ---
  function init() {
    // Glow orb
    glowEl = document.createElement('div');
    glowEl.id = 'cursor-glow';
    Object.assign(glowEl.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '99999',
      width: GLOW_SIZE * 2 + 'px',
      height: GLOW_SIZE * 2 + 'px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, ' + COLORS.glow.replace('VAR', '0.25') + ' 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.2s, height 0.2s',
      willChange: 'transform',
      top: '0', left: '0'
    });
    document.body.appendChild(glowEl);

    // Change cursor on interactive elements
    document.addEventListener('mouseover', function(e) {
      var t = e.target.closest('a, button, input, textarea, .neumorphism-button, .tag, select');
      if (t) {
        glowEl.style.width = (GLOW_SIZE * 3) + 'px';
        glowEl.style.height = (GLOW_SIZE * 3) + 'px';
        glowEl.style.background = 'radial-gradient(circle, ' + COLORS.glow.replace('VAR', '0.4') + ' 0%, transparent 70%)';
      }
    });
    document.addEventListener('mouseout', function(e) {
      var t = e.target.closest('a, button, input, textarea, .neumorphism-button, .tag, select');
      if (t) {
        glowEl.style.width = (GLOW_SIZE * 2) + 'px';
        glowEl.style.height = (GLOW_SIZE * 2) + 'px';
        glowEl.style.background = 'radial-gradient(circle, ' + COLORS.glow.replace('VAR', '0.25') + ' 0%, transparent 70%)';
      }
    });

    // Canvas for trail & particles
    canvas = document.createElement('canvas');
    canvas.id = 'cursor-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none',
      zIndex: '99998',
      display: 'block'
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Events
    document.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);
    if (document.readyState === 'complete') {
      started = true;
      loop();
    } else {
      window.addEventListener('load', function() { started = true; loop(); });
    }
  }

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (glowEl) {
      glowEl.style.left = mouse.x + 'px';
      glowEl.style.top = mouse.y + 'px';
    }
  }

  function onResize() {
    if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  }

  // --- TRAIL ---
  function updateTrail() {
    if (trail.length === 0 ||
        Math.hypot(mouse.x - trail[trail.length - 1].x, mouse.y - trail[trail.length - 1].y) > 2) {
      trail.push({ x: mouse.x, y: mouse.y });
    }
    if (trail.length > TRAIL_LENGTH) trail.shift();
  }

  // --- PARTICLES ---
  function spawnParticles() {
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: mouse.x + (Math.random() - 0.5) * 20,
        y: mouse.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        life: 1,
        size: Math.random() * 3 + 1,
        color: COLORS.particle[Math.floor(Math.random() * COLORS.particle.length)]
      });
    }
  }

  // --- DRAW ---
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Trail
    if (trail.length > 1) {
      for (var i = 1; i < trail.length; i++) {
        var alpha = (i / trail.length) * 0.5;
        var width = (i / trail.length) * 3;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = COLORS.trail.replace('VAR', String(alpha));
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = COLORS.trail.replace('VAR', String(alpha * 0.3));
        ctx.lineWidth = width * 3;
        ctx.stroke();
      }
    }

    // Particles
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.life -= FADE_SPEED;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('VAR', String(p.life * 0.8));
      ctx.fill();
    }
  }

  // --- LOOP ---
  function loop() {
    if (!started) return;
    updateTrail();
    spawnParticles();
    draw();
    animId = requestAnimationFrame(loop);
  }

  // --- START ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
