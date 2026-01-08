// ===== TYPING EFFECT =====
const lines = [
  "[ root@darkness ]# booting offensive security profile...",
  "[ <span style='color:var(--green)'>OK</span> ] exploit modules loaded",
  "[ <span style='color:var(--green)'>OK</span> ] recon engine online",
  "[ <span style='color:var(--green)'>OK</span> ] responsible disclosure enabled",
  "",
  "&gt;&gt; Operator: <span style='color:var(--green)'>MINHAJ (DARKNESS)</span>",
  "&gt;&gt; Status: <span style='color:var(--green)'>READY</span>"
];

let l = 0, c = 0;
const t = document.getElementById("terminal");
const sound = document.getElementById("typeSound");

function type() {
  if (l < lines.length) {
    if (c < lines[l].length) {
      // Check if we're inside an HTML tag
      if (lines[l][c] === '<') {
        // Skip to end of tag
        const tagEnd = lines[l].indexOf('>', c);
        if (tagEnd !== -1) {
          t.innerHTML += lines[l].substring(c, tagEnd + 1);
          c = tagEnd + 1;
        } else {
          t.innerHTML += lines[l][c++];
        }
      } else {
        t.innerHTML += lines[l][c++];
      }
      sound.currentTime = 0;
      sound.play();
      setTimeout(type, 40);
    } else {
      t.innerHTML += "\n";
      l++; c = 0;
      setTimeout(type, 400);
    }
  } else {
    t.innerHTML += "<span class='cursor'>&nbsp;</span>";
  }
}
type();

// ===== ANIMATED TITLE =====
function splitByLetter(element) {
  const text = element.innerText;
  element.innerHTML = "";
  
  [...text].forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "." : char;
    span.style.setProperty("--index", index);
    element.appendChild(span);
  });
}

const { matches: motionOK } = window.matchMedia(
  "(prefers-reduced-motion: no-preference)"
);

if (motionOK) {
  document.querySelectorAll("[split-by='letter']").forEach(splitByLetter);
}


// Speed control
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

speedSlider.addEventListener("input", () => {
  const speed = speedSlider.value;
  speedValue.textContent = speed + "ms";
  document.documentElement.style.setProperty("--speed", `${speed}ms`);
});

// ===== ADVANCED MOUSE TRACKING SYSTEM =====
const canvas = document.getElementById("mouseCanvas");
const ctx = canvas.getContext("2d");

const uiParticleCount = document.getElementById("pCount");
const uiFps = document.getElementById("fps");

let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

const state = {
    w: 0,
    h: 0,
    hue: 210,
    particles: [],
    maxParticles: 900,
    linkDist: 120,
    fade: 0.12,
    pointerDown: false,
    pointer: {
        x: -9999,
        y: -9999,
        vx: 0,
        vy: 0,
        lastX: -9999,
        lastY: -9999,
        moved: false,
    },
    lastT: performance.now(),
    fpsSmooth: 60,
};

function resize() {
    state.w = Math.floor(window.innerWidth);
    state.h = Math.floor(window.innerHeight);

    canvas.style.width = state.w + "px";
    canvas.style.height = state.h + "px";

    canvas.width = Math.floor(state.w * dpr);
    canvas.height = Math.floor(state.h * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}
resize();

window.addEventListener("resize", () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    resize();
});

function rand(min, max) {
    return Math.random() * (max - min) + min;
}
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
function dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
}

class Particle {
    constructor(x, y, boost = 0) {
        this.x = x;
        this.y = y;

        const base = rand(0.6, 2.2) + boost;
        const ang = rand(0, Math.PI * 2);

        this.vx = Math.cos(ang) * base + state.pointer.vx * 0.06;
        this.vy = Math.sin(ang) * base + state.pointer.vy * 0.06;

        // default small particles
        this.size = rand(0.9, 3.8) + boost * 0.8;

        this.life = rand(40, 120);
        this.decay = rand(0.75, 1.6);
        this.h = (state.hue + rand(-18, 18) + 360) % 360;
        this.alpha = rand(0.5, 1);

        // connector particles (2-5px) for connecting lines
        if (state.pointerDown || Math.random() < 0.06) {
            this.size = rand(2, 5);
            this.decay = rand(0.15, 0.35);
            this.life = rand(70, 150);
            this.alpha = rand(0.55, 0.95);
        }
    }

    update() {
        this.vx *= 0.985;
        this.vy *= 0.985;

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0) {
            this.x = 0;
            this.vx *= -0.9;
        }
        if (this.x > state.w) {
            this.x = state.w;
            this.vx *= -0.9;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy *= -0.9;
        }
        if (this.y > state.h) {
            this.y = state.h;
            this.vy *= -0.9;
        }

        this.life -= 1;
        this.size = Math.max(0, this.size - this.decay * 0.03);
        this.alpha = Math.max(0, this.alpha - 0.008);
    }

    draw() {
        if (this.size <= 0 || this.alpha <= 0) return;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${this.h}, 100%, 60%, ${this.alpha})`;
        ctx.shadowBlur = 18;
        ctx.shadowColor = `hsla(${this.h}, 100%, 60%, ${this.alpha})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    get dead() {
        return this.life <= 0 || this.alpha <= 0 || this.size <= 0.1;
    }
}

function addParticles(x, y, amount) {
    const boost = state.pointerDown ? 1.0 : 0.0;
    for (let i = 0; i < amount; i++) {
        state.particles.push(new Particle(x, y, boost));
    }

    if (state.particles.length > state.maxParticles) {
        state.particles.splice(0, state.particles.length - state.maxParticles);
    }
}

function fadeBackground() {
    ctx.fillStyle = `rgba(0,0,0,${state.fade})`;
    ctx.fillRect(0, 0, state.w, state.h);
}

function drawLinks() {
    const arr = state.particles;
    const n = arr.length;

    const from = Math.max(0, n - 420);

    // distance range for connecting lines
    const minDist = 50;
    const maxDist = 100;

    for (let i = from; i < n; i++) {
        const a = arr[i];

        // size gate - only connect particles in the 2-5px range
        if (!(a.size > 2 && a.size < 5)) continue;

        for (let j = i + 1; j < n; j++) {
            const b = arr[j];

            const d = dist(a.x, a.y, b.x, b.y);

            // only draw if distance is between 50 and 100
            if (d < minDist || d > maxDist) continue;

            // normalize within the band (closer to 50 = stronger)
            const t = 1 - (d - minDist) / (maxDist - minDist);

            const lw = 0.15 + t * 0.75;
            const alpha = 0.05 + t * 0.35;

            ctx.beginPath();
            ctx.strokeStyle = `hsla(${a.h}, 100%, 60%, ${alpha})`;
            ctx.lineWidth = lw;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
    }
}

let lastMoveTime = 0;
const moveThrottle = 16; // ~60fps

function updatePointerFromEvent(e) {
    const now = Date.now();
    if (now - lastMoveTime < moveThrottle) return;
    lastMoveTime = now;

    const x = e.clientX;
    const y = e.clientY;

    state.pointer.vx = x - state.pointer.lastX;
    state.pointer.vy = y - state.pointer.lastY;

    state.pointer.lastX = x;
    state.pointer.lastY = y;

    state.pointer.x = x;
    state.pointer.y = y;
    state.pointer.moved = true;

    // Prevent default behavior to stop scrolling
    e.preventDefault();
}

// Mouse tracking for the entire document with passive false
document.addEventListener("pointermove", (e) => {
    updatePointerFromEvent(e);

    const speed = Math.hypot(state.pointer.vx, state.pointer.vy);
    const amt = clamp(Math.floor(speed / 6), 1, 6);

    addParticles(state.pointer.x, state.pointer.y, amt);
}, { passive: false });

// only press/hold affects spawn behavior (more connectors)
document.addEventListener("pointerdown", (e) => {
    state.pointerDown = true;
    updatePointerFromEvent(e);
});

window.addEventListener("pointerup", () => {
    state.pointerDown = false;
});

function idleSeed() {
    if (!state.pointer.moved) {
        addParticles(state.w * 0.5, state.h * 0.5, 2);
    }
    setTimeout(idleSeed, 120);
}
idleSeed();

function updateStats(dt) {
    const fps = 1000 / Math.max(1, dt);
    state.fpsSmooth = state.fpsSmooth * 0.92 + fps * 0.08;

    if (uiParticleCount)
        uiParticleCount.textContent = String(state.particles.length);
    if (uiFps) uiFps.textContent = String(Math.round(state.fpsSmooth));
}

function tick(t) {
    const dt = t - state.lastT;
    state.lastT = t;

    state.hue = (state.hue + 0.8) % 360;

    fadeBackground();

    for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        p.update();
        p.draw();
    }

    drawLinks();

    for (let i = state.particles.length - 1; i >= 0; i--) {
        if (state.particles[i].dead) state.particles.splice(i, 1);
    }

    updateStats(dt);
    requestAnimationFrame(tick);
}

// Initialize
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, state.w, state.h);
requestAnimationFrame(tick);

// ===== PORTFOLIO FUNCTIONS =====
function downloadCV() {
  window.open('cv.pdf', '_blank');
}

function showWriteup() {
  document.getElementById('extraContent').innerHTML = `
    <h3 style="color:var(--green)">💡 Sample Writeup 1</h3>
    <p style="color:#ffffff">
      Target: example.com<br>
      Bug: Auth bypass via trusted header<br>
      Description: Found that X-Forwarded-For header can bypass login...
    </p>

    <h3 style="color:var(--green)">💡 Sample Writeup 2</h3>
    <p style="color:#ffffff">
      Target: demo.com<br>
      Bug: Open redirect<br>
      Description: Using payload /redirect?url=evil.com...
    </p>
  `;
}

function showTechnique() {
  document.getElementById('extraContent').innerHTML = `
    <h3 style="color:var(--cyan)">🛠 Technique 1: Recon Scan</h3>
    <p style="color:#ffffff">
      Use Nmap for network enumeration:<br>
      <code>nmap -sC -sV target.com</code>
    </p>

    <h3 style="color:var(--cyan)">🛠 Technique 2: Hidden Files Discovery</h3>
    <p style="color:#ffffff">
      Use FFUF to discover hidden endpoints:<br>
      <code>ffuf -u https://target.com/FUZZ -w wordlist.txt</code>
    </p>
  `;
}

// ===== CERTIFICATES MODAL =====
function openCert(src) {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalImg").src = src;
}

function closeCert() {
  document.getElementById("modal").style.display = "none";
}

// ========== ///
