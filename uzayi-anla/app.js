/* UZAYI ANLA — Topics 01–10
   Vanilla JS. Each topic mounts an interactive scene into the stage and
   returns a cleanup() that stops its animation loop + listeners. */

'use strict';

/* ------------------------------------------------------------------ *
 * small helpers
 * ------------------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);

// deterministic pseudo-random (stable star fields per topic)
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// canvas that fits its parent, DPR-aware; returns { ctx, S, loop, stop }
function makeCanvas(host) {
  const canvas = document.createElement('canvas');
  canvas.className = 'scene-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const S = { w: 0, h: 0 };
  function fit() {
    const r = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    S.w = Math.max(1, r.width);
    S.h = Math.max(1, r.height);
    canvas.width = S.w * dpr;
    canvas.height = S.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();
  window.addEventListener('resize', fit);
  let raf = 0, running = false, drawFn = null;
  function frame(t) {
    if (!running) return;
    drawFn && drawFn(t / 1000, S, ctx);
    raf = requestAnimationFrame(frame);
  }
  return {
    ctx, S, canvas,
    loop(fn) { drawFn = fn; if (!running) { running = true; raf = requestAnimationFrame(frame); } },
    once(fn) { drawFn = fn; running = false; cancelAnimationFrame(raf); fn(0, S, ctx); },
    fit,
    stop() { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', fit); }
  };
}

// build the stage shell -> { visual, controls, caption, readout }
function stageShell(stage, captionText) {
  stage.innerHTML =
    `<div class="stage-visual"></div><div class="stage-controls"></div>`;
  const visual = $('.stage-visual', stage);
  if (captionText) {
    const cap = document.createElement('div');
    cap.className = 'stage-caption';
    cap.textContent = captionText;
    visual.appendChild(cap);
  }
  return { visual, controls: $('.stage-controls', stage) };
}

function segment(controls, label, options, onPick, initial) {
  const wrap = document.createElement('div');
  wrap.className = 'ctrl';
  wrap.innerHTML = `<span class="ctrl-label">${label}</span>`;
  const seg = document.createElement('div');
  seg.className = 'seg';
  options.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'seg-btn' + (i === initial ? ' on' : '');
    b.textContent = o.label;
    b.dataset.testid = o.testid || '';
    b.addEventListener('click', () => {
      seg.querySelectorAll('.seg-btn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      onPick(o.value, i);
    });
    seg.appendChild(b);
  });
  wrap.appendChild(seg);
  controls.appendChild(wrap);
  return wrap;
}

function slider(controls, label, min, max, val, step, fmt, onInput, testid) {
  const wrap = document.createElement('div');
  wrap.className = 'ctrl';
  wrap.innerHTML = `<span class="ctrl-label">${label}</span>`;
  const row = document.createElement('div');
  row.className = 'slider-wrap';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = min; input.max = max; input.step = step; input.value = val;
  input.dataset.testid = testid || '';
  const out = document.createElement('span');
  out.className = 'slider-val';
  out.textContent = fmt(val);
  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    out.textContent = fmt(v);
    onInput(v);
  });
  row.appendChild(input); row.appendChild(out);
  wrap.appendChild(row);
  controls.appendChild(wrap);
  return input;
}

function hint(controls, text) {
  const h = document.createElement('div');
  h.className = 'hint';
  h.textContent = text;
  controls.appendChild(h);
}

function readout(visual) {
  const r = document.createElement('div');
  r.className = 'stage-readout';
  visual.appendChild(r);
  return r;
}

/* helper: draw a soft star */
function star(ctx, x, y, r, a) {
  ctx.globalAlpha = a;
  ctx.fillStyle = '#eef2ff';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (r > 1.1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, 'rgba(220,230,255,' + (a * 0.5) + ')');
    g.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ================================================================== *
 * TOPIC 01 — Işık kirliliği
 * ================================================================== */
function topic01(stage) {
  const { visual, controls } = stageShell(stage, 'IŞIK KİRLİLİĞİ SİMÜLASYONU');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let cityLight = 1;          // 0..1

  const rng = seeded(7);
  const stars = Array.from({ length: 420 }, () => ({
    x: rng(), y: rng() * 0.8,
    r: rng() < 0.06 ? rand(1.1, 1.9) : rand(0.4, 1.0),
    thr: rng(),                 // visibility threshold (0 bright .. 1 faint)
    tw: rng() * TAU
  }));
  // milky way band points
  const mw = Array.from({ length: 900 }, () => {
    const t = rng();
    const bx = t;
    const by = 0.34 + Math.sin(t * 3.1) * 0.08 + (rng() - 0.5) * 0.10;
    return { x: bx, y: by, r: rand(0.3, 0.8) };
  });

  c.loop((time, S, ctx) => {
    const dark = 1 - cityLight;                 // 0 bright city .. 1 pristine
    ctx.clearRect(0, 0, S.w, S.h);

    // sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, S.h);
    sky.addColorStop(0, `rgb(${3 + cityLight * 6},${4 + cityLight * 7},${9 + cityLight * 12})`);
    sky.addColorStop(0.72, `rgb(${5 + cityLight * 26},${6 + cityLight * 24},${12 + cityLight * 26})`);
    sky.addColorStop(1, `rgb(${10 + cityLight * 70},${9 + cityLight * 55},${14 + cityLight * 40})`);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, S.w, S.h);

    // milky way
    const mwA = clamp((dark - 0.45) / 0.4, 0, 1) * 0.5;
    if (mwA > 0.01) {
      for (const p of mw) {
        star(ctx, p.x * S.w, p.y * S.h, p.r, mwA * (0.4 + Math.random() * 0.3));
      }
    }

    // stars
    for (const s of stars) {
      const vis = dark - s.thr;
      if (vis <= 0) continue;
      const a = clamp(vis / 0.35, 0, 1);
      const tw = 0.82 + Math.sin(time * 2 + s.tw) * 0.18;
      star(ctx, s.x * S.w, s.y * S.h, s.r, a * tw);
    }

    // horizon skyglow dome from the city
    if (cityLight > 0.02) {
      const gh = S.h * 0.55;
      const g = ctx.createLinearGradient(0, S.h - gh, 0, S.h);
      const glow = [120, 96, 66];
      g.addColorStop(0, `rgba(${glow[0]},${glow[1]},${glow[2]},0)`);
      g.addColorStop(1, `rgba(${glow[0]},${glow[1]},${glow[2]},${0.32 * cityLight})`);
      ctx.fillStyle = g; ctx.fillRect(0, S.h - gh, S.w, gh);
    }

    // city silhouette
    drawCity(ctx, S, cityLight, rng, time);

    ro.textContent = `ŞEHİR IŞIKLARI ${Math.round(cityLight * 100)}%  ·  GÖRÜNEN YILDIZ ~${countVisible(stars, dark)}`;
  });

  function drawCity(ctx, S, cl, _rng, time) {
    const base = S.h;
    const rg = seeded(21);
    ctx.fillStyle = '#020304';
    let x = 0;
    while (x < S.w) {
      const w = rand.call ? 0 : 0; // noop guard
      const bw = 24 + rg() * 60;
      const bh = 40 + rg() * (S.h * 0.30);
      ctx.fillRect(x, base - bh, bw, bh);
      // windows
      const cols = Math.floor(bw / 12), rows = Math.floor(bh / 14);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        if (rg() < 0.5) continue;
        const wa = cl * (0.5 + 0.5 * Math.sin(time + i + j));
        if (wa < 0.03) continue;
        ctx.fillStyle = `rgba(240,214,150,${wa})`;
        ctx.fillRect(x + 4 + i * 12, base - bh + 6 + j * 14, 4, 6);
      }
      ctx.fillStyle = '#020304';
      x += bw + 6;
    }
    // a couple of upward street-lamp glows
    if (cl > 0.05) {
      for (let i = 0; i < 5; i++) {
        const lx = (i + 0.5) / 5 * S.w;
        const g = ctx.createRadialGradient(lx, base, 0, lx, base, 120 * cl);
        const col = '245,220,150';
        g.addColorStop(0, `rgba(${col},${0.28 * cl})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(lx, base, 120 * cl, Math.PI, TAU); ctx.fill();
      }
    }
  }
  function countVisible(stars, dark) {
    let n = 0;
    for (const s of stars) { if (dark - s.thr > 0) n++; }
    return n;
  }

  slider(controls, 'ŞEHİR IŞIKLARI', 0, 100, 100, 1, v => v + '%',
    v => { cityLight = v / 100; }, 'slider-city-light');
  hint(controls, 'Işıkları kıstıkça önce parlak yıldızlar, sonra sönük yıldızlar ve Samanyolu belirir. Şehir ışıkları geceyi aydınlatır ama gökyüzünü bizden gizler.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 02 — Yıldız mı, gezegen mi? (sintilasyon)
 * ================================================================== */
function topic02(stage) {
  const { visual } = stageShell(stage, 'ATMOSFERİK SİNTİLASYON');
  const c = makeCanvas(visual);
  const controls = $('.stage-controls', stage);
  hint(controls, 'Yıldızın kendisi sabittir; ışığı atmosfere düz bir ışın olarak girer. Kırpışma yalnızca atmosferdeki türbülansta başlar: gözlemciye ulaşan ışığın yönü ve şiddeti sürekli küçük miktarlarda değişir. Gezegenin küçük diskinden gelen komşu ışınların oynamaları birbirini ortalar, ışık daha kararlı kalır.');

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, S.w, S.h);
    const half = S.w / 2;
    // divider
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.beginPath(); ctx.moveTo(half, 24); ctx.lineTo(half, S.h - 24); ctx.stroke();

    panel(ctx, 0, half, S, time, 'star');
    panel(ctx, half, half, S, time, 'planet');

    // labels
    ctx.fillStyle = 'rgba(233,231,225,.7)';
    ctx.font = '600 12px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('YILDIZ', half / 2, S.h - 20);
    ctx.fillText('GEZEGEN', half + half / 2, S.h - 20);
  });

  function panel(ctx, x0, w, S, time, kind) {
    const cx = x0 + w / 2;
    const srcY = S.h * 0.14, atmTop = S.h * 0.40, atmBot = S.h * 0.66, obsY = S.h * 0.86;

    // fixed, point-like source (not moving, not pulsating)
    if (kind === 'star') {
      star(ctx, cx, srcY, 2.2, 1);
    } else {
      ctx.fillStyle = '#dfe6f2';
      ctx.beginPath(); ctx.arc(cx, srcY, 7, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.22;
      const g = ctx.createRadialGradient(cx, srcY, 0, cx, srcY, 24);
      g.addColorStop(0, 'rgba(220,230,255,.5)'); g.addColorStop(1, 'rgba(220,230,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, srcY, 24, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // stable straight ray(s) from source down to the atmosphere
    ctx.strokeStyle = 'rgba(200,215,255,.28)'; ctx.lineWidth = 1;
    if (kind === 'star') {
      ctx.beginPath(); ctx.moveTo(cx, srcY + 6); ctx.lineTo(cx, atmTop); ctx.stroke();
    } else {
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(cx + k * 6, srcY + 6); ctx.lineTo(cx + k * 6, atmTop); ctx.stroke(); }
    }

    // animated turbulent atmosphere band (the ONLY source of instability)
    for (let i = 0; i < 5; i++) {
      const yy = atmTop + (i / 4) * (atmBot - atmTop);
      ctx.strokeStyle = `rgba(120,150,200,${0.06 + i * 0.012})`; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let px = x0 + 8; px <= x0 + w - 8; px += 6) {
        const wob = Math.sin(px * 0.05 + time * 2.5 + i) * 6 + Math.sin(px * 0.11 - time * 1.7) * 4;
        px === x0 + 8 ? ctx.moveTo(px, yy + wob) : ctx.lineTo(px, yy + wob);
      }
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(90,120,170,.05)'; ctx.fillRect(x0 + 8, atmTop, w - 16, atmBot - atmTop);
    ctx.fillStyle = 'rgba(150,170,210,.5)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('ATMOSFER', cx, atmTop - 8);

    // below the atmosphere: apparent direction/brightness fluctuates
    if (kind === 'star') {
      const jitter = Math.sin(time * 11) * 9 + Math.sin(time * 26) * 5;
      ctx.strokeStyle = 'rgba(200,215,255,.30)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, atmBot); ctx.lineTo(cx + jitter, obsY - 14); ctx.stroke();
      const bri = 0.55 + Math.sin(time * 13) * 0.25 + Math.sin(time * 30) * 0.18;
      star(ctx, cx + jitter, obsY - 20, 2, clamp(bri, 0.15, 1));   // twinkling apparent image
    } else {
      for (let k = -1; k <= 1; k++) {
        const j = Math.sin(time * 6 + k) * 2.4;
        ctx.strokeStyle = 'rgba(200,215,255,.18)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx + k * 6, atmBot); ctx.lineTo(cx + j, obsY - 14); ctx.stroke();
      }
      ctx.globalAlpha = 0.9; ctx.fillStyle = '#dfe6f2';
      ctx.beginPath(); ctx.arc(cx, obsY - 20, 4.5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;   // steady image
    }

    // observer
    ctx.fillStyle = 'rgba(233,231,225,.35)'; ctx.beginPath(); ctx.arc(cx, obsY, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('GÖZLEMCİ', cx, obsY + 20);
  }

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 03 — Gökyüzünü elinle ölç (açısal mesafe)
 * ================================================================== */
function topic03(stage) {
  const { visual, controls } = stageShell(stage, 'AÇISAL MESAFE');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  const gestures = {
    finger: { name: '1 PARMAK', deg: 1.5 },
    three:  { name: '3 PARMAK', deg: 5 },
    fist:   { name: 'YUMRUK', deg: 10 },
    rock:   { name: 'İŞARET–SERÇE', deg: 15 },
    phone:  { name: 'BAŞPARMAK–SERÇE', deg: 22 }
  };
  let g = 'fist';
  const FIELD_DEG = 60;
  const rng = seeded(33);
  // realistic-ish naked-eye field: few bright, many faint, natural spread
  const stars = Array.from({ length: 120 }, () => {
    const mag = Math.pow(rng(), 2.2);
    return { x: rand(0.05, 0.95), y: rand(0.06, 0.9), r: lerp(0.5, 2.2, 1 - mag), a: lerp(0.35, 1, 1 - mag), tw: rng() * TAU };
  });
  let sel = [];
  const hand = { x: 0.5, y: 0.5 };
  let dragging = false, downPos = null;

  function toFrac(e) { const r = c.canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; }
  function grabR() { const barPx = gestures[g].deg / (FIELD_DEG / c.S.w); return Math.max(barPx / 2, 34); }
  function onDown(e) {
    const p = toFrac(e); downPos = p;
    const dx = (p.x - hand.x) * c.S.w, dy = (p.y - hand.y) * c.S.h;
    if (Math.hypot(dx, dy) < grabR()) { dragging = true; c.canvas.setPointerCapture && c.canvas.setPointerCapture(e.pointerId); }
  }
  function onMove(e) { if (!dragging) return; const p = toFrac(e); hand.x = clamp(p.x, 0.04, 0.96); hand.y = clamp(p.y, 0.05, 0.9); }
  function onUp(e) {
    if (dragging) { dragging = false; return; }
    const p = toFrac(e); let best = -1, bd = 0.035;
    stars.forEach((s, i) => { const d = Math.hypot(s.x - p.x, s.y - p.y); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { if (sel.includes(best)) sel = sel.filter(i => i !== best); else { sel.push(best); if (sel.length > 2) sel.shift(); } }
    downPos = null;
  }
  c.canvas.style.cursor = 'grab';
  c.canvas.addEventListener('pointerdown', onDown);
  c.canvas.addEventListener('pointermove', onMove);
  c.canvas.addEventListener('pointerup', onUp);

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#05060b'; ctx.fillRect(0, 0, S.w, S.h);
    const degPerPx = FIELD_DEG / S.w;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.85 + Math.sin(time * 1.6 + s.tw) * 0.15;
      star(ctx, s.x * S.w, s.y * S.h, s.r, s.a * tw);
      if (sel.includes(i)) { ctx.strokeStyle = '#c98a4b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(s.x * S.w, s.y * S.h, 9, 0, TAU); ctx.stroke(); }
    }
    if (sel.length === 2) {
      const a = stars[sel[0]], b = stars[sel[1]];
      const ax = a.x * S.w, ay = a.y * S.h, bx2 = b.x * S.w, by2 = b.y * S.h;
      ctx.strokeStyle = 'rgba(201,138,75,.8)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx2, by2); ctx.stroke(); ctx.setLineDash([]);
      const sepDeg = Math.hypot(bx2 - ax, by2 - ay) * degPerPx;
      ctx.fillStyle = '#e9e7e1'; ctx.font = '600 12px Inter, Arial'; ctx.textAlign = 'center';
      ctx.fillText(`≈ ${sepDeg.toFixed(1)}°`, (ax + bx2) / 2, (ay + by2) / 2 - 10);
      ro.textContent = `SEÇİLİ AÇI ≈ ${sepDeg.toFixed(1)}°  ·  ≈ ${(sepDeg / gestures[g].deg).toFixed(1)} × ${gestures[g].name}  ·  AY ≈ 0.5°`;
    } else {
      ro.textContent = `İKİ YILDIZ SEÇ · ELİ SÜRÜKLE · ${gestures[g].name} ≈ ${gestures[g].deg}° · Ölçüler yaklaşıktır`;
    }
    drawHand(ctx, hand.x * S.w, hand.y * S.h, gestures[g].deg / degPerPx, g, dragging);
  });

  function drawHand(ctx, cx, cy, w, g, active) {
    const pw = Math.max(14, w);
    const handTop = g === 'fist' ? 48 : g === 'phone' ? 54 : 92;
    const bracketY = cy - handTop - 18;
    ctx.strokeStyle = 'rgba(233,231,225,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - pw / 2, bracketY); ctx.lineTo(cx + pw / 2, bracketY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - pw / 2, bracketY - 5); ctx.lineTo(cx - pw / 2, bracketY + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + pw / 2, bracketY - 5); ctx.lineTo(cx + pw / 2, bracketY + 5); ctx.stroke();
    ctx.fillStyle = '#e9e7e1'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText(`${gestures[g].name} ≈ ${gestures[g].deg}°`, cx, bracketY - 10);

    const fill = active ? 'rgba(201,138,75,.42)' : 'rgba(233,231,225,.28)';
    const stroke = active ? 'rgba(201,138,75,.95)' : 'rgba(233,231,225,.72)';
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.25;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    function palm(x, y, width, height) {
      ctx.beginPath();
      ctx.moveTo(x - width * 0.34, y + height * 0.42);
      ctx.bezierCurveTo(x - width * 0.52, y + height * 0.12, x - width * 0.50, y - height * 0.30, x - width * 0.33, y - height * 0.47);
      ctx.bezierCurveTo(x - width * 0.10, y - height * 0.60, x + width * 0.28, y - height * 0.54, x + width * 0.43, y - height * 0.25);
      ctx.bezierCurveTo(x + width * 0.55, y + height * 0.04, x + width * 0.42, y + height * 0.34, x + width * 0.28, y + height * 0.48);
      ctx.lineTo(x + width * 0.22, y + height * 0.78);
      ctx.bezierCurveTo(x + width * 0.08, y + height * 0.88, x - width * 0.12, y + height * 0.88, x - width * 0.27, y + height * 0.76);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    function digit(x, baseY, width, height, angle = 0) {
      ctx.save(); ctx.translate(x, baseY); ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-width / 2, 4);
      ctx.bezierCurveTo(-width * 0.62, -height * 0.28, -width * 0.58, -height * 0.78, -width * 0.36, -height + width * 0.35);
      ctx.bezierCurveTo(-width * 0.18, -height - width * 0.20, width * 0.18, -height - width * 0.20, width * 0.36, -height + width * 0.35);
      ctx.bezierCurveTo(width * 0.58, -height * 0.78, width * 0.62, -height * 0.28, width / 2, 4);
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    function knuckle(x, y, width, height, angle = 0) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-width / 2, height * 0.18);
      ctx.bezierCurveTo(-width * 0.50, -height * 0.48, -width * 0.18, -height * 0.66, 0, -height * 0.66);
      ctx.bezierCurveTo(width * 0.34, -height * 0.66, width * 0.52, -height * 0.32, width / 2, height * 0.18);
      ctx.bezierCurveTo(width * 0.22, height * 0.52, -width * 0.24, height * 0.52, -width / 2, height * 0.18);
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    function thumb(x, y, width, height, angle) { digit(x, y, width, height, angle); }

    if (g === 'finger') {
      const palmW = clamp(pw * 3.2, 50, 82), palmH = 48;
      palm(cx, cy + 12, palmW, palmH);
      digit(cx - palmW * 0.16, cy - 8, clamp(pw * 0.72, 9, 14), 72, -0.035);
      knuckle(cx + palmW * 0.04, cy - 7, 15, 18, 0.08);
      knuckle(cx + palmW * 0.22, cy - 3, 15, 17, 0.14);
      knuckle(cx + palmW * 0.36, cy + 4, 13, 15, 0.22);
      thumb(cx - palmW * 0.40, cy + 11, 13, 34, -0.88);
    } else if (g === 'three') {
      const palmW = clamp(pw * 1.18, 56, 102), palmH = 50;
      palm(cx, cy + 12, palmW, palmH);
      digit(cx - pw * 0.32, cy - 3, 12, 59, -0.08);
      digit(cx, cy - 8, 13, 72, 0);
      digit(cx + pw * 0.32, cy - 4, 12, 63, 0.08);
      knuckle(cx + palmW * 0.38, cy + 1, 13, 16, 0.18);
      thumb(cx - palmW * 0.44, cy + 14, 14, 35, -0.86);
    } else if (g === 'fist') {
      const palmW = clamp(pw, 58, 136), palmH = clamp(palmW * 0.60, 42, 68);
      palm(cx, cy + 7, palmW, palmH);
      const step = palmW * 0.205;
      for (let i = 0; i < 4; i++) knuckle(cx + (i - 1.5) * step, cy - palmH * 0.31 + Math.abs(i - 1.5) * 2, step * 1.08, palmH * 0.36, (i - 1.5) * 0.025);
      thumb(cx - palmW * 0.30, cy + palmH * 0.16, palmH * 0.22, palmW * 0.47, -1.16);
    } else if (g === 'rock') {
      const palmW = clamp(pw * 0.50, 52, 92), palmH = 50;
      palm(cx, cy + 12, palmW, palmH);
      digit(cx - pw * 0.44, cy - 1, 12, 67, -0.08);
      digit(cx + pw * 0.44, cy + 2, 11, 59, 0.10);
      knuckle(cx - palmW * 0.05, cy - 5, 17, 20, -0.04);
      knuckle(cx + palmW * 0.18, cy - 2, 16, 19, 0.08);
      thumb(cx - palmW * 0.42, cy + 14, 13, 34, -0.90);
    } else {
      const palmW = clamp(pw * 0.34, 50, 84), palmH = 48;
      palm(cx, cy + 12, palmW, palmH);
      thumb(cx - palmW * 0.40, cy + 8, 14, pw * 0.36, -1.42);
      digit(cx + palmW * 0.40, cy + 7, 11, pw * 0.36, 1.42);
      knuckle(cx - palmW * 0.05, cy - 6, 16, 19, -0.02);
      knuckle(cx + palmW * 0.15, cy - 4, 15, 18, 0.08);
      knuckle(cx + palmW * 0.31, cy, 13, 16, 0.15);
    }
  }

  segment(controls, 'EL HAREKETİ', [
    { label: '1 PARMAK', value: 'finger', testid: 'gesture-finger' },
    { label: '3 PARMAK', value: 'three', testid: 'gesture-three' },
    { label: 'YUMRUK', value: 'fist', testid: 'gesture-fist' },
    { label: 'İŞARET–SERÇE', value: 'rock', testid: 'gesture-rock' },
    { label: 'BAŞP–SERÇE', value: 'phone', testid: 'gesture-phone' }
  ], v => { g = v; }, 2);
  hint(controls, 'Kol boyu uzaklıkta tutulan el gökyüzünde yaklaşık açı verir: 1 parmak ≈ 1–2°, yumruk ≈ 10°, başparmak–serçe açıklığı ≈ 20–25°. El işaretini seç, gökte sürükle; iki yıldıza dokunarak açıyı ölç. El açıklığı ile ölçülen açı aynı açısal ölçeği kullanır. Değerler ele göre değişen yaklaşık değerlerdir.');

  return () => {
    c.canvas.removeEventListener('pointerdown', onDown);
    c.canvas.removeEventListener('pointermove', onMove);
    c.canvas.removeEventListener('pointerup', onUp);
    c.stop();
  };
}

/* ================================================================== *
 * TOPIC 04 — Teleskop ne yapar? (ışık toplama)
 * ================================================================== */
function topic04(stage) {
  const { visual, controls } = stageShell(stage, 'IŞIK TOPLAMA & AÇIKLIK');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  const modes = { eye: { name: 'ÇIPLAK GÖZ', ap: 0.10 }, small: { name: 'KÜÇÜK AÇIKLIK', ap: 0.35 }, large: { name: 'BÜYÜK AÇIKLIK', ap: 1.0 } };
  let m = 'eye';
  const rng = seeded(51);
  // faint cluster: many stars, each with intrinsic brightness
  const cluster = Array.from({ length: 260 }, () => ({
    x: 0.5 + (rng() - 0.5) * 0.5, y: 0.32 + (rng() - 0.5) * 0.42, r: rand(0.6, 1.8),
    lum: rng()   // 0 faint .. 1 bright
  }));

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const ap = modes[m].ap;

    // top: the same faint object seen through this aperture
    const areaFactor = ap * ap;              // light-gathering ~ aperture area
    const gain = 0.25 + areaFactor * 3.2;
    let visible = 0;
    // faint nebulosity emerges with aperture
    if (ap > 0.3) {
      const g = ctx.createRadialGradient(0.5 * S.w, 0.32 * S.h, 0, 0.5 * S.w, 0.32 * S.h, S.h * 0.28);
      g.addColorStop(0, `rgba(150,180,230,${0.10 * gain})`);
      g.addColorStop(1, 'rgba(150,180,230,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0.5 * S.w, 0.32 * S.h, S.h * 0.28, 0, TAU); ctx.fill();
    }
    for (const s of cluster) {
      const a = clamp((s.lum) * gain - 0.12, 0, 1);
      if (a <= 0.02) continue;
      const tw = 0.85 + Math.sin(time * 2 + s.x * 40) * 0.12;
      star(ctx, s.x * S.w, s.y * S.h, s.r * (0.7 + ap * 0.6), a * tw);
      visible++;
    }

    // divider
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.beginPath(); ctx.moveTo(30, S.h * 0.62); ctx.lineTo(S.w - 30, S.h * 0.62); ctx.stroke();
    ctx.fillStyle = 'rgba(150,155,165,.6)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('IŞIN DİYAGRAMI', 30, S.h * 0.62 + 16);

    // ray diagram bottom
    drawRays(ctx, S, ap);

    ro.textContent = `${modes[m].name}  ·  IŞIK TOPLAMA ×${(areaFactor * 100).toFixed(0)}  ·  GÖRÜNEN YILDIZ ~${visible}`;
  });

  function drawRays(ctx, S, ap) {
    const y0 = S.h * 0.62 + 30, y1 = S.h - 14;
    const midY = (y0 + y1) / 2;
    const apX = 90;                 // aperture plane x
    const focusX = S.w - 70;
    const halfAp = clamp(ap, 0.15, 1) * ((y1 - y0) * 0.42);
    // incoming parallel rays
    ctx.strokeStyle = 'rgba(200,215,255,.35)'; ctx.lineWidth = 1;
    const n = 5;
    for (let i = 0; i < n; i++) {
      const ry = midY - halfAp + (i / (n - 1)) * halfAp * 2;
      ctx.beginPath(); ctx.moveTo(20, ry); ctx.lineTo(apX, ry);
      ctx.lineTo(focusX, midY); ctx.stroke();
    }
    // aperture / mirror
    ctx.strokeStyle = '#e9e7e1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(apX, midY - halfAp); ctx.lineTo(apX, midY + halfAp); ctx.stroke();
    // focus point
    ctx.fillStyle = '#c98a4b'; ctx.beginPath(); ctx.arc(focusX, midY, 3.5, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('IŞIK', 40, midY - halfAp - 6);
    ctx.fillText('AÇIKLIK', apX, midY + halfAp + 14);
    ctx.fillText('ODAK', focusX, midY + 16);
  }

  segment(controls, 'AÇIKLIK', [
    { label: 'ÇIPLAK GÖZ', value: 'eye', testid: 'aperture-eye' },
    { label: 'KÜÇÜK', value: 'small', testid: 'aperture-small' },
    { label: 'BÜYÜK', value: 'large', testid: 'aperture-large' }
  ], v => { m = v; }, 0);
  hint(controls, 'Teleskop yalnızca büyütmez; asıl işi ışık toplamaktır. Açıklık büyüdükçe daha çok ışık yakalanır, sönük cisimler görünür olur ve ince ayrıntılar ayırt edilir.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 05 — Gökyüzü neden hareket ediyor?
 * ================================================================== */
function topic05(stage) {
  const { visual, controls } = stageShell(stage, 'GÖRÜNÜR GÖK HAREKETİ');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  const times = ['18:00', '21:00', '00:00', '03:00', '06:00'];
  let ti = 0, targetAng = 0, ang = 0, outside = false;
  const rng = seeded(88);
  const stars = Array.from({ length: 160 }, () => ({
    a: rng() * TAU, r: rand(0.05, 0.95), s: rng() < 0.15 ? rand(1.2, 2) : rand(0.5, 1)
  }));

  // ---------- outside (3D) layer ----------
  let three = null;
  // Earth factory — replace this body later with a GLB loader without touching the rest.
  function makeEarthGroup(THREE) {
    const grp = new THREE.Group();
    const geo = new THREE.SphereGeometry(1, 48, 32);
    const mat = new THREE.MeshPhongMaterial({ color: 0x22436b, emissive: 0x030a14, shininess: 6 });
    grp.add(new THREE.Mesh(geo, mat));
    const grid = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(1.002, 16, 12)),
      new THREE.LineBasicMaterial({ color: 0x4a6a92, transparent: true, opacity: 0.22 }));
    grp.add(grid);
    grp.userData.dispose = () => { geo.dispose(); mat.dispose(); grid.geometry.dispose(); grid.material.dispose(); };
    return grp;
  }
  function initThree() {
    if (three || !window.THREE) return;
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const el = renderer.domElement;
    el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;cursor:grab';
    visual.appendChild(el);
    scene.add(new THREE.AmbientLight(0x334455, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(5, 1.5, 2); scene.add(sun);
    const bg = []; for (let i = 0; i < 400; i++) { const th = rng() * TAU, ph = Math.acos(2 * rng() - 1), R = 40; bg.push(R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph), R * Math.sin(ph) * Math.sin(th)); }
    const bgGeo = new THREE.BufferGeometry(); bgGeo.setAttribute('position', new THREE.Float32BufferAttribute(bg, 3));
    scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({ color: 0xaab4d0, size: 0.25 })));
    const earth = makeEarthGroup(THREE); scene.add(earth);
    // observer at ~40°N, fixed to Earth (child -> rotates with Earth)
    const lat = 40 * Math.PI / 180, lon = 0;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), new THREE.MeshBasicMaterial({ color: 0xc98a4b }));
    dot.position.set(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
    earth.add(dot);
    const up = new THREE.ArrowHelper(dot.position.clone().normalize(), dot.position.clone(), 0.55, 0xc98a4b, 0.13, 0.08);
    earth.add(up);
    let az = 0.5, elv = 0.5;
    function place() { const rr = 3.6; camera.position.set(rr * Math.cos(elv) * Math.sin(az), rr * Math.sin(elv), rr * Math.cos(elv) * Math.cos(az)); camera.lookAt(0, 0, 0); }
    place();
    let drag = false, lx = 0, ly = 0;
    function pd(e) { drag = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture && el.setPointerCapture(e.pointerId); }
    function pm(e) { if (!drag) return; az -= (e.clientX - lx) * 0.008; elv = clamp(elv + (e.clientY - ly) * 0.008, -1.2, 1.2); lx = e.clientX; ly = e.clientY; place(); }
    function pu() { drag = false; }
    el.addEventListener('pointerdown', pd); el.addEventListener('pointermove', pm); el.addEventListener('pointerup', pu);
    function resize() { const r = visual.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); }
    resize(); window.addEventListener('resize', resize);
    three = {
      scene, camera, renderer, el, earth, resize,
      dispose() {
        window.removeEventListener('resize', resize);
        el.removeEventListener('pointerdown', pd); el.removeEventListener('pointermove', pm); el.removeEventListener('pointerup', pu);
        earth.userData.dispose(); bgGeo.dispose(); dot.geometry.dispose(); dot.material.dispose();
        renderer.dispose(); if (el.parentElement) el.parentElement.removeChild(el);
      }
    };
  }

  c.loop((time, S, ctx) => {
    ang = lerp(ang, targetAng, 0.06);
    if (!outside) {
      c.canvas.style.display = 'block';
      if (three) three.el.style.display = 'none';
      ctx.clearRect(0, 0, S.w, S.h);
      drawObserver(ctx, S);
      ro.textContent = `GÖZLEMCİ GÖRÜNÜMÜ  ·  YEREL SAAT ${times[ti]}  ·  KUZEY YILDIZI SABİT`;
    } else {
      c.canvas.style.display = 'none';
      if (three) {
        three.el.style.display = 'block';
        three.earth.rotation.y = -ang;           // observer carried around by Earth's spin
        three.renderer.render(three.scene, three.camera);
      }
      ro.textContent = `DIŞARIDAN GÖRÜNÜM  ·  DÜNYA EKSENİNDE DÖNÜYOR (SÜRÜKLEYİP DÖNDÜR)  ·  ${times[ti]}`;
    }
  });

  function drawObserver(ctx, S) {
    ctx.fillStyle = '#04060b'; ctx.fillRect(0, 0, S.w, S.h);
    const px = S.w / 2, py = S.h * 0.30;
    const maxR = Math.min(S.w, S.h) * 0.6;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const rr = s.r * maxR;
      const a = s.a + ang;
      const x = px + Math.cos(a) * rr, y = py + Math.sin(a) * rr;
      if (y > S.h * 0.82) continue;
      ctx.strokeStyle = 'rgba(200,215,255,.10)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, rr, a - 0.5, a); ctx.stroke();
      star(ctx, x, y, s.s, 0.9);
    }
    star(ctx, px, py, 2.4, 1);
    ctx.fillStyle = 'rgba(201,138,75,.9)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('KUZEY YILDIZI', px, py - 14);
    ctx.fillStyle = '#070a0f'; ctx.fillRect(0, S.h * 0.82, S.w, S.h * 0.18);
    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    ctx.beginPath(); ctx.moveTo(0, S.h * 0.82); ctx.lineTo(S.w, S.h * 0.82); ctx.stroke();
    ctx.fillStyle = 'rgba(150,155,165,.6)'; ctx.textAlign = 'left';
    ctx.fillText('UFUK', 16, S.h * 0.82 + 18);
  }

  segment(controls, 'YEREL SAAT', times.map((t, i) => ({ label: t, value: i, testid: 'time-' + i })),
    (v) => { ti = v; targetAng = v * (Math.PI / 3); }, 0);
  segment(controls, 'BAKIŞ', [
    { label: 'GÖZLEMCİ', value: false, testid: 'view-observer' },
    { label: 'DIŞARIDAN GÖR', value: true, testid: 'view-outside' }
  ], v => { outside = v; if (outside) { initThree(); if (three) three.resize(); } }, 0);
  hint(controls, 'Saat ilerledikçe yıldızlar Kuzey Yıldızı çevresinde döner gibi görünür. "Dışarıdan Gör" ile 3B Dünya\'yı sürükleyerek döndür: gözlemci (≈40°K) Dünya\'ya sabittir ve Dünya döndükçe onunla taşınır. Gökyüzünün görünür hareketi bu dönmeden kaynaklanır.');

  return () => { if (three) three.dispose(); c.stop(); };
}

/* ================================================================== *
 * TOPIC 06 — Gök atlası nedir?
 * ================================================================== */
function topic06(stage) {
  const { visual, controls } = stageShell(stage, 'GÖK ATLASI');
  const c = makeCanvas(visual);
  const opts = { const: false, names: false, dirs: false, coords: false };

  // named bright stars + simple constellation lines (relative coords 0..1)
  const named = [
    { x: 0.30, y: 0.30, n: 'Dubhe' }, { x: 0.40, y: 0.26, n: 'Merak' },
    { x: 0.50, y: 0.30, n: 'Phecda' }, { x: 0.47, y: 0.40, n: 'Megrez' },
    { x: 0.57, y: 0.45, n: 'Alioth' }, { x: 0.66, y: 0.50, n: 'Mizar' },
    { x: 0.75, y: 0.58, n: 'Alkaid' },
    { x: 0.72, y: 0.20, n: 'Vega' }, { x: 0.20, y: 0.62, n: 'Arcturus' }
  ];
  const lines = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]];
  const rng = seeded(105);
  const field = Array.from({ length: 260 }, () => ({
    x: rng(), y: rng(), r: rng() < 0.1 ? rand(1.2, 2) : rand(0.4, 1)
  }));

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);

    // coordinate grid
    if (opts.coords) {
      ctx.strokeStyle = 'rgba(120,150,200,.14)'; ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) { const x = i / 8 * S.w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, S.h); ctx.stroke(); }
      for (let j = 1; j < 6; j++) { const y = j / 6 * S.h; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S.w, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(120,150,200,.5)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'left';
      for (let i = 1; i < 8; i++) ctx.fillText((i * 3) + 'h', i / 8 * S.w + 3, 12);
    }
    // background field
    for (let i = 0; i < field.length; i++) {
      const f = field[i];
      star(ctx, f.x * S.w, f.y * S.h, f.r, 0.55 + Math.sin(time + i) * 0.15);
    }
    // constellation lines
    if (opts.const) {
      ctx.strokeStyle = 'rgba(140,180,240,.5)'; ctx.lineWidth = 1;
      for (const [a, b] of lines) {
        ctx.beginPath();
        ctx.moveTo(named[a].x * S.w, named[a].y * S.h);
        ctx.lineTo(named[b].x * S.w, named[b].y * S.h); ctx.stroke();
      }
    }
    // named stars
    for (const s of named) {
      star(ctx, s.x * S.w, s.y * S.h, 2, 1);
      if (opts.names) {
        ctx.fillStyle = 'rgba(233,231,225,.75)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'left';
        ctx.fillText(s.n, s.x * S.w + 8, s.y * S.h - 6);
      }
    }
    // directions
    if (opts.dirs) {
      ctx.fillStyle = 'rgba(201,138,75,.85)'; ctx.font = '600 12px Inter, Arial'; ctx.textAlign = 'center';
      ctx.fillText('K', S.w / 2, 20);
      ctx.fillText('G', S.w / 2, S.h - 12);
      ctx.textAlign = 'left'; ctx.fillText('D', 12, S.h / 2);
      ctx.textAlign = 'right'; ctx.fillText('B', S.w - 12, S.h / 2);
    }
  });

  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  wrap.innerHTML = `<span class="ctrl-label">KATMANLAR</span>`;
  const seg = document.createElement('div'); seg.className = 'seg';
  [['const', 'TAKIMYILDIZLAR'], ['names', 'YILDIZ İSİMLERİ'], ['dirs', 'YÖNLER'], ['coords', 'KOORDİNATLAR']].forEach(([k, l]) => {
    const b = document.createElement('button'); b.className = 'seg-btn'; b.textContent = l;
    b.dataset.testid = 'layer-' + k;
    b.addEventListener('click', () => { opts[k] = !opts[k]; b.classList.toggle('on', opts[k]); });
    seg.appendChild(b);
  });
  wrap.appendChild(seg); controls.appendChild(wrap);
  hint(controls, 'Gök atlası, gökyüzünün haritasıdır. Katmanları açtıkça dağınık yıldızlar tanıdık desenlere, yönlere ve koordinatlara sahip gezilebilir bir haritaya dönüşür.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 07 — Takımyıldızlar gerçekten yan yana mı? (Three.js)
 * ================================================================== */
function topic07(stage) {
  const { visual, controls } = stageShell(stage, '3B DERİNLİK — TAKIMYILDIZ');
  const ro = readout(visual);

  if (!window.THREE) {
    visual.insertAdjacentHTML('beforeend',
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8b909d;font-size:12px;letter-spacing:.1em">3B GÖRÜNÜM YÜKLENEMEDİ (internet gerekli)</div>');
    return () => { };
  }
  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  visual.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  // Big Dipper-like pattern: XY forms the flat shape, Z is the true (very different) distance
  const pts = [
    [-4.0, 1.6, -30], [-2.2, 2.0, 20], [-0.2, 1.4, -60],
    [-0.8, 0.0, 5], [1.4, -0.4, 55], [3.0, -1.2, -20], [4.6, -2.2, 40]
  ];
  const lineIdx = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]];

  // constellation stars
  const starGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xeef2ff });
  const meshes = pts.map(p => {
    const m = new THREE.Mesh(starGeo, starMat.clone());
    m.position.set(p[0], p[1], 0);         // start flat (z=0)
    scene.add(m); return m;
  });
  // pattern lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x6f8fd6, transparent: true, opacity: 0.55 });
  const lineObjs = lineIdx.map(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const l = new THREE.Line(g, lineMat); scene.add(l); return l;
  });
  // background field
  const bgGeo = new THREE.BufferGeometry();
  const bgPos = [];
  for (let i = 0; i < 500; i++) bgPos.push(rand(-120, 120), rand(-90, 90), rand(-150, -40));
  bgGeo.setAttribute('position', new THREE.Float32BufferAttribute(bgPos, 3));
  scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({ color: 0xaab4d0, size: 0.5 })));

  let is3D = false, depth = 0, orbit = 0;

  function resize() {
    const r = visual.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let raf = 0, running = true;
  function animate() {
    if (!running) return;
    depth = lerp(depth, is3D ? 1 : 0, 0.05);
    orbit = lerp(orbit, is3D ? 1 : 0, 0.05);

    // interpolate star z between flat(0) and true depth
    meshes.forEach((m, i) => { m.position.z = pts[i][2] * depth; });
    lineObjs.forEach((l, i) => {
      const a = meshes[lineIdx[i][0]].position, b = meshes[lineIdx[i][1]].position;
      l.geometry.setFromPoints([a, b]); l.geometry.attributes.position.needsUpdate = true;
    });

    const ang = orbit * 0.9;
    const radius = 26;
    camera.position.set(Math.sin(ang) * radius, orbit * 4, Math.cos(ang) * radius + 4);
    camera.lookAt(0, 0, pts.reduce((s, p) => s + p[2], 0) / pts.length * depth * 0.5);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  animate();

  segment(controls, 'GÖRÜNÜM', [
    { label: 'DÜNYA\'DAN', value: false, testid: 'view-flat' },
    { label: '3B GÖRÜNÜM', value: true, testid: 'view-3d' }
  ], v => { is3D = v; ro.textContent = v ? 'YANDAN BAKIŞ — YILDIZLAR FARKLI UZAKLIKLARDA' : 'DÜNYA\'DAN BAKIŞ — DESEN DÜZ GÖRÜNÜR'; }, 0);
  hint(controls, 'Dünya\'dan bakınca takımyıldızın yıldızları aynı düzlemde gibi görünür. 3B görünümde yandan bakınca aslında çok farklı uzaklıklarda oldukları ortaya çıkar. Desen yalnızca bizim bakış açımızın izdüşümüdür.');
  ro.textContent = 'DÜNYA\'DAN BAKIŞ — DESEN DÜZ GÖRÜNÜR';

  return () => {
    running = false; cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    starGeo.dispose(); bgGeo.dispose();
    meshes.forEach(m => m.material.dispose());
    lineObjs.forEach(l => l.geometry.dispose());
    renderer.dispose();
    if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
  };
}

/* ================================================================== *
 * TOPIC 08 — Ay'ın aynı yüzü (eşzamanlı dönme)
 * ================================================================== */
function topic08(stage) {
  const { visual, controls } = stageShell(stage, 'EŞZAMANLI DÖNME');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let sync = true;            // true = gerçek hareket, false = ay dönmesin
  let orbit = 0;

  c.loop((time, S, ctx) => {
    orbit += 0.008;
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const cx = S.w / 2, cy = S.h / 2;
    const R = Math.min(S.w, S.h) * 0.30;

    // orbit path
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);

    // Earth
    const eg = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, 26);
    eg.addColorStop(0, '#3a6aa0'); eg.addColorStop(1, '#0c1b30');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('DÜNYA', cx, cy + 42);

    // Moon position
    const mx = cx + Math.cos(orbit) * R, my = cy + Math.sin(orbit) * R;
    // self-rotation: sync -> equals orbit angle (same face to Earth); no-spin -> fixed 0
    const selfAng = sync ? orbit : 0;

    // moon body
    ctx.fillStyle = '#c9ccd2'; ctx.beginPath(); ctx.arc(mx, my, 15, 0, TAU); ctx.fill();
    // near-side marker (a face patch). It points toward selfAng direction.
    const fx = mx + Math.cos(selfAng) * 15, fy = my + Math.sin(selfAng) * 15;
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath(); ctx.arc((mx + fx) / 2, (my + fy) / 2, 6, 0, TAU); ctx.fill();
    // eyes to make face obvious
    ctx.fillStyle = '#3a2a18';
    const pa = selfAng;
    ctx.beginPath(); ctx.arc((mx + fx) / 2 + Math.cos(pa + 0.6) * 3, (my + fy) / 2 + Math.sin(pa + 0.6) * 3, 1.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc((mx + fx) / 2 + Math.cos(pa - 0.6) * 3, (my + fy) / 2 + Math.sin(pa - 0.6) * 3, 1.2, 0, TAU); ctx.fill();

    // sightline Earth->Moon
    ctx.strokeStyle = 'rgba(201,138,75,.35)';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.stroke();

    // does marker face Earth?
    const toEarth = Math.atan2(cy - my, cx - mx);
    let diff = Math.abs(((selfAng - toEarth + Math.PI) % TAU) - Math.PI);
    const facing = diff < 0.35;
    ro.textContent = sync
      ? `GERÇEK HAREKET  ·  BİZE BAKAN YÜZ: AYNI  ·  Ay yörünge boyunca kendi ekseninde de döner`
      : `AY DÖNMESİN  ·  BİZE BAKAN YÜZ: ${facing ? 'değişiyor' : 'DEĞİŞİYOR'}  ·  farklı yüzler görünür`;
  });

  segment(controls, 'MOD', [
    { label: 'AY DÖNMESİN', value: false, testid: 'moon-nospin' },
    { label: 'GERÇEK HAREKET', value: true, testid: 'moon-sync' }
  ], v => { sync = v; }, 1);
  hint(controls, 'Ay dönmeseydi, yörüngesinde ilerlerken farklı yüzlerini görürdük. Gerçekte Ay bir tur atarken kendi ekseninde de tam bir tur döner; bu yüzden hep aynı yüz bize bakar. İşaretli yüzü izle.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 09 — Mevsimler (eksen eğikliği)
 * ================================================================== */
function topic09(stage) {
  const { visual, controls } = stageShell(stage, 'EKSEN EĞİKLİĞİ & MEVSİMLER');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let tilt = 23.5;            // degrees
  let orbit = 0;

  c.loop((time, S, ctx) => {
    orbit += 0.006;
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const cx = S.w / 2, cy = S.h / 2;
    const Rx = Math.min(S.w * 0.34, 260), Ry = Math.min(S.h * 0.30, 150);

    // orbit
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath(); ctx.ellipse(cx, cy, Rx, Ry, 0, 0, TAU); ctx.stroke();

    // Sun
    const sg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 34);
    sg.addColorStop(0, '#ffe6a6'); sg.addColorStop(0.5, '#e8a23a'); sg.addColorStop(1, 'rgba(232,162,58,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('GÜNEŞ', cx, cy + 50);

    const ex = cx + Math.cos(orbit) * Rx, ey = cy + Math.sin(orbit) * Ry;
    drawEarth(ctx, ex, ey, tilt, cx, cy);

    // subsolar latitude (season indicator for N hemisphere)
    const sub = tilt * Math.cos(orbit);        // + summer N, - winter N
    const season = sub > 6 ? 'YAZ (K. Yarımküre)' : sub < -6 ? 'KIŞ (K. Yarımküre)' : 'İLKBAHAR/SONBAHAR';
    const dayLen = 12 + sub * 0.32;            // rough hours of daylight at ~45°N
    ro.textContent = `EKSEN EĞİKLİĞİ ${tilt.toFixed(1)}°  ·  ${tilt < 3 ? 'MEVSİM YOK' : season}  ·  GÜNDÜZ ≈ ${clamp(dayLen, 6, 18).toFixed(1)} s`;

    // day-length bar (upper-left, clear of the bottom readout)
    const bx = 20, by = 46, bw = 160;
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('KY GÜNDÜZ SÜRESİ', bx, by - 6);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(bx, by, bw, 6);
    const frac = clamp((dayLen - 6) / 12, 0, 1);
    ctx.fillStyle = tilt < 3 ? '#8b909d' : '#c98a4b'; ctx.fillRect(bx, by, bw * frac, 6);
  });

  function drawEarth(ctx, x, y, tiltDeg, sunX, sunY) {
    const R = 20;
    // illuminated side toward sun
    const toSun = Math.atan2(sunY - y, sunX - x);
    const day = ctx.createLinearGradient(x + Math.cos(toSun) * R, y + Math.sin(toSun) * R, x - Math.cos(toSun) * R, y - Math.sin(toSun) * R);
    day.addColorStop(0, '#3a6aa0'); day.addColorStop(0.5, '#1a3352'); day.addColorStop(1, '#070f1c');
    ctx.fillStyle = day; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(160,190,230,.3)'; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();

    // axis (tilted, pointing same direction in space regardless of orbit position)
    const t = -tiltDeg * Math.PI / 180;   // fixed inertial direction (up, tilted)
    const ax = Math.sin(t), ay = -Math.cos(t);
    ctx.strokeStyle = '#e9e7e1'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - ax * (R + 12), y - ay * (R + 12));
    ctx.lineTo(x + ax * (R + 12), y + ay * (R + 12)); ctx.stroke();
    // poles
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath(); ctx.arc(x + ax * R, y + ay * R, 2.5, 0, TAU); ctx.fill();
    // equator hint (perpendicular)
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - ay * R, y + ax * R); ctx.lineTo(x + ay * R, y - ax * R); ctx.stroke();

    // sunlight rays hitting earth
    ctx.strokeStyle = 'rgba(255,220,140,.35)';
    for (let i = -1; i <= 1; i++) {
      const px = x + Math.cos(toSun + Math.PI / 2) * i * R * 0.7;
      const py = y + Math.sin(toSun + Math.PI / 2) * i * R * 0.7;
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(toSun) * 40, py + Math.sin(toSun) * 40);
      ctx.lineTo(px, py); ctx.stroke();
    }
  }

  slider(controls, 'EKSEN EĞİKLİĞİ', 0, 23.5, 23.5, 0.5, v => v.toFixed(1) + '°', v => { tilt = v; }, 'slider-tilt');
  hint(controls, 'Mevsimlerin asıl nedeni Dünya\'nın Güneş\'e uzaklığı değil, ekseninin ≈23,5° eğik olmasıdır. Eğiklik ışığın geliş açısını ve gündüz süresini değiştirir. 0° ile 23,5° arasını karşılaştır.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 10 — Newton'un top mermisi (yörünge)
 * ================================================================== */
function topic10(stage) {
  const { visual, controls } = stageShell(stage, 'NEWTON TOP MERMİSİ DENEYİ');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let speed = 0.34;          // 0..1 -> mapped to launch velocity
  let path = [], marker = 0, status = '';

  function compute(S) {
    // Earth centered at canvas center, radius Re. Newtonian gravity in 2D.
    const cx = S.w / 2, cy = S.h / 2;
    const Re = Math.min(S.w, S.h) * 0.16;
    const mu = 60000;                       // GM (tuned for pixel space)
    const rLaunch = Re + 6;
    // launch point at top of Earth, velocity horizontal (to the right)
    let px = cx, py = cy - rLaunch;
    // orbital circular speed at this radius = sqrt(mu/r)
    const vCirc = Math.sqrt(mu / rLaunch);
    const vEsc = vCirc * Math.SQRT2;
    const v = lerp(vCirc * 0.35, vEsc * 1.12, speed);
    let vx = v, vy = 0;
    const pts = [];
    const dt = 0.06;
    let hit = false, escaped = false;
    const maxR = Math.hypot(S.w, S.h);
    for (let i = 0; i < 4000; i++) {
      const dx = px - cx, dy = py - cy;
      const r = Math.hypot(dx, dy);
      if (r <= Re) { hit = true; pts.push([px, py]); break; }
      if (r > maxR * 0.62) { escaped = true; break; }
      const a = mu / (r * r);
      vx -= a * (dx / r) * dt; vy -= a * (dy / r) * dt;
      px += vx * dt; py += vy * dt;
      if (i % 2 === 0) pts.push([px, py]);
    }
    // classify
    if (hit) status = 'DÜŞTÜ — yüzeye çarptı';
    else if (escaped) status = 'KAÇTI — Dünya\'dan ayrıldı';
    else status = 'YÖRÜNGE — sürekli düşüyor ama yere ulaşmıyor';
    return { cx, cy, Re, pts, hit, escaped };
  }

  let geom = null;
  c.loop((time, S, ctx) => {
    if (!geom || geom.S !== S.w + 'x' + S.h + speed.toFixed(3)) {
      const g = compute(S); g.S = S.w + 'x' + S.h + speed.toFixed(3);
      geom = g; path = g.pts; marker = 0;
    }
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);

    const { cx, cy, Re } = geom;
    // stars bg
    const rng = seeded(9); for (let i = 0; i < 80; i++) star(ctx, rng() * S.w, rng() * S.h, rng() < 0.1 ? 1.5 : 0.7, 0.5);

    // Earth
    const eg = ctx.createRadialGradient(cx - Re * 0.3, cy - Re * 0.3, Re * 0.2, cx, cy, Re);
    eg.addColorStop(0, '#3a6aa0'); eg.addColorStop(1, '#0a1626');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, cy, Re, 0, TAU); ctx.fill();
    // mountain / launch tower
    ctx.strokeStyle = 'rgba(233,231,225,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - Re); ctx.lineTo(cx, cy - Re - 12); ctx.stroke();

    // trajectory
    ctx.strokeStyle = geom.hit ? 'rgba(201,138,75,.7)' : geom.escaped ? 'rgba(120,180,255,.7)' : 'rgba(233,231,225,.8)';
    ctx.lineWidth = 1.5; ctx.beginPath();
    path.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.stroke();

    // moving projectile
    if (path.length) {
      marker = (marker + 2) % path.length;
      const p = path[Math.floor(marker)];
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, TAU); ctx.fill();
    }

    ro.textContent = `HIZ ${(speed * 100).toFixed(0)}%  ·  ${status}`;
  });

  slider(controls, 'HIZ', 0, 100, 34, 1, v => v + '%', v => { speed = v / 100; geom = null; }, 'slider-speed');
  hint(controls, 'Yatay atılan cisim düşer. Hız arttıkça daha uzağa düşer. Yeterli hızda cisim sürekli düşer ama Dünya\'nın eğrilen yüzeyine hiç ulaşamaz — bu yörüngedir. Çok yüksek hızda ise Dünya\'dan kaçar.');

  return () => c.stop();
}

/* shared: small color utilities used by new topics */
function kelvinRGB(k) {
  k /= 100; let r, g, b;
  if (k <= 66) { r = 255; g = 99.47 * Math.log(k) - 161.12; }
  else { r = 329.7 * Math.pow(k - 60, -0.1332); g = 288.12 * Math.pow(k - 60, -0.0755); }
  if (k >= 66) b = 255; else if (k <= 19) b = 0; else b = 138.52 * Math.log(k - 10) - 305.04;
  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
}
function nmRGB(nm) { // visible wavelength (380–700) -> rgb
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else { r = 1; }
  return [r * 255, g * 255, b * 255];
}

/* ================================================================== *
 * TOPIC 11 — Uzayda ses var mı?
 * ================================================================== */
function topic11(stage) {
  const { visual, controls } = stageShell(stage, 'ORTAM YOĞUNLUĞU & SES');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let density = 1;
  const rng = seeded(41);
  const parts = Array.from({ length: 360 }, () => ({ x: rng(), y: rng(), ph: rng() * TAU, sp: 0.6 + rng() }));
  let pulses = [], last = -2;

  function envName(d) {
    return d < 0.12 ? 'UZAY BOŞLUĞU' : d < 0.4 ? 'ÜST ATMOSFER' : d < 0.75 ? 'DAHA YOĞUN ATMOSFER' : 'YERYÜZÜNE YAKIN HAVA';
  }

  c.loop((time, S, ctx) => {
    const zoneH = S.h * 0.64;
    // environment background: black in space -> faint blue tint near surface
    const bg = ctx.createLinearGradient(0, 0, 0, zoneH);
    bg.addColorStop(0, `rgb(${4 + density * 6},${6 + density * 10},${10 + density * 20})`);
    bg.addColorStop(1, `rgb(${5 + density * 22},${9 + density * 34},${16 + density * 54})`);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, S.w, zoneH);
    ctx.fillStyle = '#05070c'; ctx.fillRect(0, zoneH, S.w, S.h - zoneH);
    // horizon tint (denser air)
    if (density > 0.4) {
      const hg = ctx.createLinearGradient(0, zoneH * 0.6, 0, zoneH);
      hg.addColorStop(0, 'rgba(60,110,170,0)'); hg.addColorStop(1, `rgba(70,120,180,${(density - 0.4) * 0.25})`);
      ctx.fillStyle = hg; ctx.fillRect(0, zoneH * 0.6, S.w, zoneH * 0.4);
    }

    const srcX = S.w * 0.12, srcY = S.h * 0.30, obsX = S.w * 0.9;
    const reach = (0.15 + density * 1.1) * S.w;
    const heard = density > 0.06 && reach >= (obsX - srcX);

    // gas particles (flat filled dots — clearly not stars)
    const n = Math.round(density * parts.length);
    ctx.fillStyle = 'rgba(150,180,220,.5)';
    for (let i = 0; i < n; i++) {
      const p = parts[i];
      const px = (p.x * S.w + Math.sin(time * p.sp + p.ph) * 2);
      const py = (p.y * zoneH + Math.cos(time * p.sp * 0.9 + p.ph) * 2) + 6;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 3, py + 1.5, 1.1, 0, TAU); ctx.fill();
    }

    // emit pressure pulses (carried by particles)
    if (time - last > 1.2) { last = time; pulses.push({ r: 0 }); if (pulses.length > 6) pulses.shift(); }
    for (const p of pulses) {
      p.r += (0.6 + density * 1.6) * (S.w / 640);
      const a = clamp(1 - p.r / (reach || 1), 0, 1) * density;
      if (a <= 0.02) continue;
      ctx.strokeStyle = `rgba(150,190,255,${a * 0.6})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(srcX, srcY, p.r, -1.2, 1.2); ctx.stroke();
    }

    // source (speaker) & observer (ear)
    ctx.fillStyle = 'rgba(233,231,225,.85)'; ctx.fillRect(srcX - 10, srcY - 12, 8, 24);
    ctx.beginPath(); ctx.moveTo(srcX - 2, srcY - 12); ctx.lineTo(srcX + 8, srcY - 20);
    ctx.lineTo(srcX + 8, srcY + 20); ctx.lineTo(srcX - 2, srcY + 12); ctx.fill();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('KAYNAK', srcX + 2, srcY + 40);
    ctx.strokeStyle = heard ? '#c98a4b' : 'rgba(120,125,135,.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(obsX, srcY, 9, -1.2, 1.2); ctx.stroke();
    ctx.fillStyle = heard ? '#c98a4b' : 'rgba(150,155,165,.7)';
    ctx.fillText(heard ? 'DUYULUR' : 'SESSİZ', obsX, srcY + 40);
    // environment label
    ctx.fillStyle = 'rgba(200,220,255,.7)'; ctx.font = '600 11px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText(envName(density), 16, zoneH - 14);

    // altitude guide (rocket) rises as the medium thins
    const rkx = S.w * 0.5, rky = lerp(zoneH - 20, 34, 1 - density);
    ctx.strokeStyle = 'rgba(233,231,225,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rkx, rky + 12); ctx.lineTo(rkx, rky + 22); ctx.stroke();
    ctx.fillStyle = 'rgba(233,231,225,.85)';
    ctx.beginPath(); ctx.moveTo(rkx, rky - 10); ctx.lineTo(rkx + 5, rky + 8); ctx.lineTo(rkx - 5, rky + 8); ctx.closePath(); ctx.fill();

    ro.textContent = `${envName(density)} · YOĞUNLUK ${Math.round(density * 100)}%  ·  ${heard ? 'SES YAYILIYOR' : 'SES YAYILAMIYOR (VAKUM)'}`;
  });

  slider(controls, 'YÜKSEKLİK (ORTAM YOĞUNLUĞU)', 0, 100, 100, 1, v => v + '%', v => { density = v / 100; }, 'slider-density');
  hint(controls, 'Ses, gaz parçacıklarının birbirleriyle etkileşerek ilettiği bir basınç dalgasıdır. Yüzeyden uzaya çıktıkça ortam seyrekleşir, parçacıklar azalır ve dalga giderek daha zor yayılır. Çok seyrek uzayda sıradan ses dalgaları etkili biçimde yayılamaz. Bunun tek bir keskin yüksekliği yoktur; etki kademeli olarak kaybolur.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 12 — Güneş neden sarı görünüyor?
 * ================================================================== */
function topic12(stage) {
  const { visual, controls } = stageShell(stage, 'ASTEROİT · METEOROİT · METEOR');
  const ro = readout(visual);
  const THREE = window.THREE;
  if (!THREE) { visual.insertAdjacentHTML('beforeend', '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8b909d;font-size:12px">3B GÖRÜNÜM YÜKLENEMEDİ</div>'); return () => {}; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); camera.position.set(0, 0, 6);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const el = renderer.domElement; el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  visual.appendChild(el);
  scene.add(new THREE.AmbientLight(0x556070, 0.9));
  const dir = new THREE.DirectionalLight(0xfff4e6, 1.2); dir.position.set(3, 4, 5); scene.add(dir);

  // round glow texture (for meteor)
  const gc = document.createElement('canvas'); gc.width = gc.height = 64;
  const g2 = gc.getContext('2d'); const gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
  const gtex = new THREE.CanvasTexture(gc);

  // procedural irregular rock
  const rng = seeded(123);
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const n = 1 + (Math.sin(v.x * 3.1 + v.y * 2.3) + Math.cos(v.y * 2.7 + v.z * 3.3) + (rng() - 0.5) * 1.4) * 0.12;
    v.multiplyScalar(n); pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6b6258, roughness: 1, metalness: 0.1, flatShading: true });
  const rock = new THREE.Mesh(geo, rockMat); scene.add(rock);
  // asteroid-size reference ring (for meteoroid comparison)
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.38, 1.42, 48), new THREE.MeshBasicMaterial({ color: 0x556070, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  ring.visible = false; scene.add(ring);
  // meteor glow + trail
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, color: 0xffb060, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })); glow.scale.set(2.4, 2.4, 1); scene.add(glow);
  const trail = [];
  for (let i = 0; i < 16; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, color: 0xff9040, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })); scene.add(m); trail.push(m); }
  // atmosphere band (meteor)
  const atmo = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), new THREE.MeshBasicMaterial({ color: 0x2a5a9a, transparent: true, opacity: 0 }));
  atmo.position.set(0, -2.4, -1); scene.add(atmo);

  let mode = 'asteroid', mp = 0; const hist = [];
  function resize() { const r = visual.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', resize);

  let raf = 0, running = true;
  function tick() {
    if (!running) return;
    rock.rotation.y += 0.006; rock.rotation.x += 0.003;
    ring.visible = mode === 'meteoroid';
    glow.material.opacity = 0; atmo.material.opacity = 0; trail.forEach(t => t.material.opacity = 0);
    if (mode === 'asteroid') { rock.scale.setScalar(1.4); rock.position.set(0, 0, 0); }
    else if (mode === 'meteoroid') { rock.scale.setScalar(0.45); rock.position.set(0, 0, 0); }
    else {
      atmo.material.opacity = 0.35;
      mp += 0.008; if (mp > 1) { mp = 0; hist.length = 0; }
      const x = lerp(-4.5, 4.5, mp), y = lerp(2.8, -2.6, mp);
      rock.scale.setScalar(0.4); rock.position.set(x, y, 0);
      const inAtmo = y < 1.2;
      glow.position.copy(rock.position); glow.material.opacity = inAtmo ? 0.85 : 0.06; glow.scale.setScalar(inAtmo ? 2.6 : 1.2);
      hist.unshift([x, y]); if (hist.length > trail.length) hist.pop();
      trail.forEach((t, i) => { const h = hist[i]; if (!h) return; t.position.set(h[0], h[1], 0); t.material.opacity = inAtmo ? (1 - i / trail.length) * 0.7 : 0; const sc = 1.0 - i * 0.05; t.scale.setScalar(Math.max(0.2, sc)); });
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  function setRo() {
    ro.textContent = mode === 'asteroid' ? 'ASTEROİT · Güneş çevresinde dolanan görece büyük kayaç/metal cisim (metreden yüzlerce km\'ye)'
      : mode === 'meteoroid' ? 'METEOROİT · Çok daha küçük kayaç parça (halka = asteroit boyu referansı)'
      : 'METEOR · Atmosfere yüksek hızla giren cismin gazı ısıtıp iyonlaştırmasıyla oluşan IŞIKLI İZ';
  }
  setRo();
  segment(controls, 'GÖRÜNÜM', [
    { label: 'ASTEROİT', value: 'asteroid', testid: 'rock-asteroid' },
    { label: 'METEOROİT', value: 'meteoroid', testid: 'rock-meteoroid' },
    { label: 'METEOR', value: 'meteor', testid: 'rock-meteor' }
  ], v => { mode = v; mp = 0; hist.length = 0; setRo(); }, 0);
  hint(controls, 'Asteroit: Güneş çevresinde dolanan görece büyük kayaç/metal cisim. Meteoroit: çok daha küçük bir parça (asteroit veya kuyrukluyıldız kökenli). Meteor ise bir cisim değil; bir meteoroidin atmosfere yüksek hızla girip çevresindeki gazı ısıtıp iyonlaştırmasıyla oluşan ışıklı izdir (Işıklı iz = meteor). Kesin bir boyut sınırı yoktur.');

  return () => {
    running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize);
    geo.dispose(); rockMat.dispose(); ring.geometry.dispose(); ring.material.dispose();
    glow.material.dispose(); trail.forEach(t => t.material.dispose()); atmo.geometry.dispose(); atmo.material.dispose(); gtex.dispose();
    renderer.dispose(); if (el.parentElement) el.parentElement.removeChild(el);
  };
}

/* ================================================================== *
 * TOPIC 13 — Yıldızların rengi / sıcaklık
 * ================================================================== */
function topic13(stage) {
  const { visual, controls } = stageShell(stage, 'RENK & SICAKLIK');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let T = 5800;

  function nameFor(t) {
    if (t < 3900) return 'KIRMIZI'; if (t < 5300) return 'TURUNCU';
    if (t < 6200) return 'SARI-BEYAZ'; if (t < 10000) return 'BEYAZ'; return 'MAVİ';
  }

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const [r, g, b] = kelvinRGB(T);
    const cx = S.w / 2, cy = S.h * 0.42, R = Math.min(S.w, S.h) * 0.16;

    // subtle glow
    const halo = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 3);
    halo.addColorStop(0, `rgba(${r},${g},${b},.5)`);
    halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 3, 0, TAU); ctx.fill();
    // body
    const pulse = 1 + Math.sin(time * 1.5) * 0.01;
    const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R * pulse);
    body.addColorStop(0, `rgb(${clamp(r + 40, 0, 255)},${clamp(g + 40, 0, 255)},${clamp(b + 40, 0, 255)})`);
    body.addColorStop(1, `rgb(${r},${g},${b})`);
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R * pulse, 0, TAU); ctx.fill();

    // temperature scale bar
    const bx = S.w * 0.15, bw = S.w * 0.7, byy = S.h * 0.82;
    for (let i = 0; i <= bw; i += 2) {
      const tt = 3000 + (i / bw) * 27000;
      const [rr, gg, bb] = kelvinRGB(tt);
      ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
      ctx.fillRect(bx + i, byy, 2, 10);
    }
    const mx = bx + (clamp(T, 3000, 30000) - 3000) / 27000 * bw;
    ctx.strokeStyle = '#e9e7e1'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mx, byy - 6); ctx.lineTo(mx, byy + 16); ctx.stroke();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('3000 K', bx, byy - 8);
    ctx.textAlign = 'right'; ctx.fillText('30000 K', bx + bw, byy - 8);

    ro.textContent = `${Math.round(T)} K  ·  ${nameFor(T)}  ·  Mavi yıldızlar daha sıcaktır`;
  });

  slider(controls, 'YÜZEY SICAKLIĞI', 3000, 30000, 5800, 100, v => Math.round(v) + ' K', v => { T = v; }, 'slider-temp');
  hint(controls, 'Bir yıldızın rengi, yüzey sıcaklığını gösterir. Kırmızı yıldızlar en soğuk; turuncu, sarı-beyaz ve beyazdan maviye gidildikçe sıcaklık artar. Mavi yıldızlar kırmızı yıldızlardan çok daha sıcaktır.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 14 — Spektroskopi (soğurma çizgileri)
 * ================================================================== */
function topic14(stage) {
  const { visual, controls } = stageShell(stage, 'TAYF & SOĞURMA ÇİZGİLERİ');
  const c = makeCanvas(visual);
  const els = {
    H: { on: false, name: 'HİDROJEN', col: '#8fb6ff', lines: [656, 486, 434, 410] },
    Na: { on: false, name: 'SODYUM', col: '#ffe08a', lines: [589] },
    Ca: { on: false, name: 'KALSİYUM', col: '#c9a8ff', lines: [393, 397, 422] }
  };
  const N0 = 380, N1 = 700;
  const nx = (nm, x0, w) => x0 + (nm - N0) / (N1 - N0) * w;

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);

    // top: star -> prism -> fan
    const starX = 60, starY = 60;
    star(ctx, starX, starY, 5, 1);
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('YILDIZ IŞIĞI', starX, starY + 22);
    const prX = S.w * 0.32, prY = 60;
    ctx.strokeStyle = 'rgba(233,231,225,.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(prX - 14, prY + 16); ctx.lineTo(prX + 14, prY + 16); ctx.lineTo(prX, prY - 16); ctx.closePath(); ctx.stroke();
    ctx.fillText('PRİZMA', prX, prY + 34);
    ctx.strokeStyle = 'rgba(200,210,230,.4)';
    ctx.beginPath(); ctx.moveTo(starX + 8, starY); ctx.lineTo(prX - 8, prY); ctx.stroke();

    // spectrum band
    const bx = S.w * 0.14, bw = S.w * 0.72, byy = S.h * 0.42, bh = S.h * 0.2;
    for (let i = 0; i < bw; i += 2) {
      const nm = N0 + (i / bw) * (N1 - N0);
      const [r, g, b] = nmRGB(nm);
      ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(bx + i, byy, 2, bh);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.strokeRect(bx, byy, bw, bh);
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.textAlign = 'left';
    ctx.fillText('TAYF (SÜREKLİ)', bx, byy - 8);

    // stellar absorption lines (all elements present, dark)
    for (const k in els) for (const nm of els[k].lines) {
      const x = nx(nm, bx, bw);
      ctx.fillStyle = 'rgba(6,8,12,.85)'; ctx.fillRect(x - 1, byy, 2.4, bh);
    }
    // highlight selected + reference strips
    let sy = byy + bh + 34;
    ctx.textAlign = 'left';
    for (const k in els) {
      const e = els[k]; if (!e.on) continue;
      for (const nm of e.lines) {
        const x = nx(nm, bx, bw);
        ctx.strokeStyle = e.col; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, byy); ctx.lineTo(x, byy + bh); ctx.stroke();
        ctx.fillStyle = e.col; ctx.beginPath(); ctx.arc(x, byy - 6, 2, 0, TAU); ctx.fill();
      }
      // reference strip
      ctx.fillStyle = 'rgba(255,255,255,.03)'; ctx.fillRect(bx, sy, bw, 16);
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.strokeRect(bx, sy, bw, 16);
      for (const nm of e.lines) { const x = nx(nm, bx, bw); ctx.fillStyle = e.col; ctx.fillRect(x - 1, sy, 2, 16); }
      ctx.fillStyle = e.col; ctx.font = '10px Inter, Arial';
      ctx.fillText(e.name, bx, sy - 4);
      sy += 34;
    }
  });

  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  wrap.innerHTML = `<span class="ctrl-label">REFERANS ELEMENT</span>`;
  const seg = document.createElement('div'); seg.className = 'seg';
  for (const k in els) {
    const b = document.createElement('button'); b.className = 'seg-btn'; b.textContent = els[k].name;
    b.dataset.testid = 'elem-' + k;
    b.addEventListener('click', () => { els[k].on = !els[k].on; b.classList.toggle('on', els[k].on); });
    seg.appendChild(b);
  }
  wrap.appendChild(seg); controls.appendChild(wrap);
  hint(controls, 'Yıldız ışığı bir prizmadan geçince sürekli tayfa açılır; belirli dalga boylarında koyu soğurma çizgileri belirir. Her element kendine özgü çizgiler bırakır. Astronomlar bir yıldıza gitmeden, yalnızca ışığını inceleyerek (tayfölçüm) kimyasal bileşimini öğrenebilir. Elementleri seçip çizgileri karşılaştır.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 15 — Uzaya bakmak = geçmişe bakmak
 * ================================================================== */
function topic15(stage) {
  const { visual, controls } = stageShell(stage, 'IŞIĞIN YOLCULUĞU');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  const objs = {
    moon: { name: 'AY', t: '≈ 1,3 saniye' },
    sun: { name: 'GÜNEŞ', t: '≈ 8 dakika' },
    sirius: { name: 'SIRIUS', t: '≈ 8,6 yıl' },
    androm: { name: 'ANDROMEDA', t: '≈ 2,5 milyon yıl' }
  };
  const dur = { moon: 0.8, sun: 1.5, sirius: 2.5, androm: 4 };  // normalized seconds
  let sel = 'sun', prog = 0;

  c.loop((time, S, ctx) => {
    prog = Math.min(1, prog + 1 / (dur[sel] * 60));
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const rng = seeded(3); for (let i = 0; i < 90; i++) star(ctx, rng() * S.w, rng() * S.h, rng() < 0.1 ? 1.4 : 0.6, 0.4);

    const srcX = S.w * 0.12, earthX = S.w * 0.88, yy = S.h * 0.42;
    // source object
    const oCol = sel === 'sun' ? '#ffd98a' : sel === 'moon' ? '#c9ccd2' : sel === 'sirius' ? '#dfe9ff' : '#cdd6ff';
    const oR = sel === 'androm' ? 26 : 16;
    if (sel === 'androm') {
      ctx.save(); ctx.translate(srcX, yy); ctx.rotate(-0.4);
      const gr = ctx.createRadialGradient(0, 0, 3, 0, 0, oR); gr.addColorStop(0, '#e9edff'); gr.addColorStop(1, 'rgba(140,160,220,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, 0, oR, oR * 0.5, 0, 0, TAU); ctx.fill(); ctx.restore();
    } else {
      const gr = ctx.createRadialGradient(srcX, yy, 2, srcX, yy, oR); gr.addColorStop(0, oCol); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(srcX, yy, oR, 0, TAU); ctx.fill();
      ctx.fillStyle = oCol; ctx.beginPath(); ctx.arc(srcX, yy, oR * 0.5, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(150,155,165,.75)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText(objs[sel].name, srcX, yy + oR + 18);

    // path
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(srcX, yy); ctx.lineTo(earthX, yy); ctx.stroke(); ctx.setLineDash([]);

    // travelling photon
    const px = lerp(srcX, earthX, prog);
    const grd = ctx.createRadialGradient(px, yy, 0, px, yy, 14);
    grd.addColorStop(0, 'rgba(255,255,255,.9)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, yy, 14, 0, TAU); ctx.fill();
    // trailing photons
    for (let i = 1; i <= 4; i++) { const tp = clamp(prog - i * 0.05, 0, 1); star(ctx, lerp(srcX, earthX, tp), yy, 1.2, 0.3); }

    // Earth
    const eg = ctx.createRadialGradient(earthX - 5, yy - 5, 2, earthX, yy, 12);
    eg.addColorStop(0, '#3a6aa0'); eg.addColorStop(1, '#0a1626');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(earthX, yy, 12, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(150,155,165,.75)'; ctx.fillText('DÜNYA', earthX, yy + 28);

    // progress bar
    const bx = S.w * 0.15, bw = S.w * 0.7, byy = S.h * 0.8;
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.strokeRect(bx, byy, bw, 4);
    ctx.fillStyle = '#c98a4b'; ctx.fillRect(bx, byy, bw * prog, 4);

    ro.textContent = prog < 1
      ? `IŞIK YOLDA  ·  ${objs[sel].name}  ·  GERÇEK YOL SÜRESİ ${objs[sel].t}`
      : `IŞIK ULAŞTI  ·  Bu cismi, ışığının yola çıktığı ${objs[sel].t} önceki haliyle görüyoruz`;
  });

  segment(controls, 'CİSİM', [
    { label: 'AY', value: 'moon', testid: 'obj-moon' },
    { label: 'GÜNEŞ', value: 'sun', testid: 'obj-sun' },
    { label: 'SIRIUS', value: 'sirius', testid: 'obj-sirius' },
    { label: 'ANDROMEDA', value: 'androm', testid: 'obj-androm' }
  ], v => { sel = v; prog = 0; }, 1);
  hint(controls, 'Işık sonsuz hızlı değildir. Uzak bir cisimden gelen ışık bize ulaşana dek zaman geçer; bu yüzden onu geçmişteki haliyle görürüz. Cisim seç, ışığın yolculuğunu izle; gerçek süre milyonlarca yıla varabilir ama animasyon kavramsal olarak hızlandırılmıştır.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 16 — Ötegezegen: geçiş (transit) yöntemi
 * ================================================================== */
function topic16(stage) {
  const { visual, controls } = stageShell(stage, 'GEÇİŞ YÖNTEMİ (TRANSIT)');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let pSize = 0.28;   // planet radius fraction of star
  let curve = [];
  const maxPts = 240;

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const starX = S.w * 0.5, starY = S.h * 0.30, sR = Math.min(S.w, S.h) * 0.14;
    const pR = sR * pSize;
    const orbitW = S.w * 0.42;
    const phase = (time * 0.35) % 1;              // 0..1 across
    const px = starX - orbitW + phase * orbitW * 2;
    const py = starY;

    // star
    const halo = ctx.createRadialGradient(starX, starY, sR * 0.5, starX, starY, sR * 2);
    halo.addColorStop(0, 'rgba(255,235,170,.5)'); halo.addColorStop(1, 'rgba(255,235,170,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(starX, starY, sR * 2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(starX, starY, sR, 0, TAU); ctx.fill();

    // brightness (transit dip)
    const d = Math.abs(px - starX);
    let flux = 1;
    if (d < sR - pR) flux = 1 - pSize * pSize;
    else if (d < sR + pR) { const f = (sR + pR - d) / (2 * pR); flux = 1 - pSize * pSize * clamp(f, 0, 1); }
    const inFront = py === starY;

    // planet (draw in front only on this pass)
    if (inFront) { ctx.fillStyle = '#0b0d12'; ctx.beginPath(); ctx.arc(px, py, pR, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(150,160,180,.4)'; ctx.stroke(); }

    // light curve
    curve.push(flux); if (curve.length > maxPts) curve.shift();
    const gx = S.w * 0.12, gw = S.w * 0.76, gy = S.h * 0.62, gh = S.h * 0.28;
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.strokeRect(gx, gy, gw, gh);
    ctx.fillStyle = 'rgba(150,155,165,.6)'; ctx.textAlign = 'left'; ctx.fillText('ÖLÇÜLEN PARLAKLIK', gx, gy - 8);
    ctx.strokeStyle = '#9fd0ff'; ctx.lineWidth = 1.4; ctx.beginPath();
    curve.forEach((v, i) => {
      const x = gx + (i / maxPts) * gw;
      const y = gy + gh * (1 - (v - (1 - 0.16)) / 0.16) * 0.85 + gh * 0.05;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    // baseline
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.setLineDash([3, 5]);
    ctx.beginPath(); const by = gy + gh * 0.05 + gh * 0.85 * 0; ctx.moveTo(gx, by); ctx.lineTo(gx + gw, by); ctx.stroke(); ctx.setLineDash([]);

    ro.textContent = `GEZEGEN/YILDIZ ${(pSize * 100).toFixed(0)}%  ·  GEÇİŞ DERİNLİĞİ ${((pSize * pSize) * 100).toFixed(1)}%  ·  ${flux < 0.999 ? 'GEÇİŞ SÜRÜYOR' : 'PARLAKLIK NORMAL'}`;
  });

  slider(controls, 'GEZEGEN BOYUTU', 8, 45, 28, 1, v => v + '%', v => { pSize = v / 100; }, 'slider-planet');
  hint(controls, 'Gezegen yıldızının önünden geçtiğinde yıldızın ölçülen parlaklığı bir miktar düşer, sonra normale döner. Büyük gezegen daha derin bir düşüş yaratır. Gezegenleri doğrudan görmek zorunda değiliz; yıldız ışığındaki bu etkilerden onları keşfederiz. (Bir diğer yöntem, yıldızın minik yalpalamasını ölçen dikine hız yöntemidir.)');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 17 — Yıldızlar nasıl doğar? (scrub)
 * ================================================================== */
function topic17(stage) {
  const { visual, controls } = stageShell(stage, 'YILDIZ OLUŞUMU');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  const stages = ['MOLEKÜLER BULUT', 'KÜTLEÇEKİMSEL ÇÖKME', 'YOĞUN ÇEKİRDEK', 'PROTOYILDIZ', 'ISINMA', 'FÜZYON', 'ANA KOL YILDIZI'];
  let sVal = 0;   // 0..6 continuous
  const rng = seeded(71);
  const pts = Array.from({ length: 260 }, () => {
    const a = rng() * TAU, r = 0.2 + rng() * 0.8;
    return { a, r, jt: rng() * TAU };
  });

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const cx = S.w / 2, cy = S.h * 0.42, base = Math.min(S.w, S.h) * 0.34;
    const t = clamp(sVal / 6, 0, 1);
    const contract = 1 - Math.pow(t, 1.5) * 0.86;    // cloud shrinks
    const coreT = clamp((sVal - 4) / 2, 0, 1);        // heating->fusion

    // dust/gas particles converge
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const rr = p.r * base * contract + Math.sin(time * 1.5 + p.jt) * 2 * (1 - t);
      const x = cx + Math.cos(p.a) * rr, y = cy + Math.sin(p.a) * rr * 0.9;
      const col = coreT > 0 ? `rgba(255,${200 - coreT * 60},${150 - coreT * 100},${0.5})` : 'rgba(150,160,180,.4)';
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 1 + t, 0, TAU); ctx.fill();
    }
    // core
    if (sVal >= 2) {
      const cr = lerp(4, 26, clamp((sVal - 2) / 4, 0, 1));
      const [r, g, b] = coreT > 0 ? kelvinRGB(lerp(2500, 6000, coreT)) : [180, 120, 90];
      const halo = ctx.createRadialGradient(cx, cy, cr * 0.4, cx, cy, cr * 3);
      halo.addColorStop(0, `rgba(${r},${g},${b},${0.4 + coreT * 0.4})`); halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, cr * 3, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, TAU); ctx.fill();
    }
    // fusion spark
    if (sVal >= 5) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(time * 6) * 0.2})`;
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();
    }

    // stage ladder — top-center ticks with active label centered (clear of left cloud)
    const li = Math.round(sVal);
    const lx0 = S.w * 0.30, lx1 = S.w * 0.70, ly = 26;
    ctx.strokeStyle = 'rgba(120,125,135,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lx1, ly); ctx.stroke();
    for (let i = 0; i < stages.length; i++) {
      const x = lerp(lx0, lx1, i / (stages.length - 1));
      ctx.fillStyle = i <= sVal ? '#e9e7e1' : 'rgba(120,125,135,.5)';
      ctx.beginPath(); ctx.arc(x, ly, i === li ? 3.4 : 2, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#e9e7e1'; ctx.font = '600 11px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText(`${li + 1}/7 · ${stages[li]}`, S.w / 2, ly + 20);
    ro.textContent = `AŞAMA ${li + 1}/7  ·  ${stages[li]}`;
  });

  slider(controls, 'AŞAMA', 0, 600, 0, 1, v => (Math.round(v / 100) + 1) + '/7', v => { sVal = v / 100; }, 'slider-stage');
  hint(controls, 'Yıldızlar, soğuk ve yoğun moleküler bulutların kütleçekimiyle çökmesiyle doğar. Çöken çekirdek ısınır, protoyıldıza dönüşür ve çekirdek yeterince ısındığında füzyon başlar; yıldız ana kola oturur. Kaydırıcıyı ileri-geri hareket ettirerek süreci sen kontrol et.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 18 — Yıldızın enerjisi (füzyon)
 * ================================================================== */
function topic18(stage) {
  const { visual, controls } = stageShell(stage, 'GALAKSİ — ÖLÇEK');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let scale = 0;                     // 0 far .. 1 near
  const rng = seeded(303);
  const stars = Array.from({ length: 900 }, () => ({ a: rng() * TAU, rr: Math.pow(rng(), 0.5), off: (rng() - 0.5) * 0.3, b: rng() }));

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const cx = S.w / 2, cy = S.h * 0.44, R = Math.min(S.w, S.h) * 0.4;
    const rot = time * 0.02;

    // far: coherent luminous spiral glow (fades as we zoom in)
    const glowA = clamp(1 - scale * 1.5, 0, 1);
    if (glowA > 0.01) {
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R);
      g.addColorStop(0, `rgba(210,220,255,${0.55 * glowA})`);
      g.addColorStop(0.4, `rgba(120,150,220,${0.28 * glowA})`);
      g.addColorStop(1, 'rgba(80,100,180,0)');
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.5);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.restore();
    }

    // resolved stars: spread and become distinct as we zoom in
    const spread = lerp(0.55, 1.7, scale);
    const starA = clamp(scale * 1.4, 0, 1);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const ang = s.a + rot + s.rr * 3.0;                 // spiral winding
      const rr = s.rr * R * spread;
      const x = cx + Math.cos(ang) * rr;
      const y = cy + Math.sin(ang) * rr * 0.5 + s.off * R * 0.3 * scale;
      const a = lerp(0.12, 0.9, s.b) * (0.28 + starA);
      star(ctx, x, y, 0.6 + s.b * 1.2 * (0.6 + scale), clamp(a, 0, 1));
    }

    // Sun marker appears in close view (we are just one star in the disk)
    if (scale > 0.6) {
      const sx = cx + R * 0.42, sy = cy + R * 0.10;
      ctx.fillStyle = '#c98a4b'; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(201,138,75,.85)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'left';
      ctx.fillText('GÜNEŞ', sx + 6, sy + 3);
    }

    const view = scale < 0.33 ? 'UZAK GÖRÜNÜM' : scale < 0.66 ? 'ORTA ÖLÇEK' : 'YAKIN GÖRÜNÜM';
    ctx.fillStyle = 'rgba(200,220,255,.8)'; ctx.font = '600 12px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText(view, 18, 52);
    ro.textContent = `${view}  ·  Uzaktan tek ışıklı yapı, yakında birbirinden çok uzak yıldızlar`;
  });

  slider(controls, 'ÖLÇEK (YAKINLAŞ)', 0, 100, 0, 1, v => v < 33 ? 'UZAK' : v < 66 ? 'ORTA' : 'YAKIN', v => { scale = v / 100; }, 'slider-scale');
  hint(controls, 'Uzaktan bakıldığında galaksi tek bir ışıklı yapı gibi görünür. Yaklaştıkça bu ışığın aslında çok sayıda, birbirinden çok uzak yıldız ve yıldız sisteminden oluştuğu ortaya çıkar. Yıldızlar dağılır ama kopmaz; aralarındaki mesafeler çok büyüktür.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 19 — Yıldızların ölümü (kütleye göre dallanma)
 * ================================================================== */
function topic19(stage) {
  const { visual, controls } = stageShell(stage, 'KÜTLEYE GÖRE YILDIZ SONU');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let mass = 1;   // solar masses

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const lowPath = mass < 8;
    const heavy = mass >= 8;
    const bh = mass >= 20;

    const x0 = S.w * 0.08, mid = S.h * 0.42;
    ctx.font = '11px Inter, Arial'; ctx.textAlign = 'left';
    // main sequence start
    node(ctx, x0, mid, 'ANA KOL', true);
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); ctx.moveTo(x0 + 60, mid); ctx.lineTo(x0 + 100, mid - 60); ctx.moveTo(x0 + 60, mid); ctx.lineTo(x0 + 100, mid + 60); ctx.stroke();

    // low-mass branch (up)
    const upY = mid - 60, dnY = mid + 60;
    const lowNodes = ['KIRMIZI DEV', 'GEZEGENİMSİ BULUTSU', 'BEYAZ CÜCE'];
    const hiNodes = ['SÜPERDEV', 'ÇEKİRDEK ÇÖKMELİ SÜPERNOVA', bh ? 'KARA DELİK' : 'NÖTRON YILDIZI'];
    drawChain(ctx, x0 + 110, upY, lowNodes, lowPath, S);
    drawChain(ctx, x0 + 110, dnY, hiNodes, heavy, S);
    ctx.fillStyle = 'rgba(120,125,135,.6)'; ctx.font = '9px Inter, Arial';
    ctx.fillText('GÜNEŞ BENZERİ ( < 8 M☉ )', x0 + 110, upY - 22);
    ctx.fillText('BÜYÜK KÜTLELİ ( ≥ 8 M☉ )', x0 + 110, dnY + 34);

    // remnant illustration
    const rx = S.w * 0.5, ry = S.h * 0.82;
    if (lowPath) { // white dwarf
      const g = ctx.createRadialGradient(rx, ry, 1, rx, ry, 16); g.addColorStop(0, '#eaf1ff'); g.addColorStop(1, 'rgba(180,200,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rx, ry, 16, 0, TAU); ctx.fill();
      ctx.fillStyle = '#dfe9ff'; ctx.beginPath(); ctx.arc(rx, ry, 5, 0, TAU); ctx.fill();
    } else if (!bh) { // neutron star
      ctx.fillStyle = '#cfe3ff'; ctx.beginPath(); ctx.arc(rx, ry, 4, 0, TAU); ctx.fill();
      const s = 0.5 + Math.sin(time * 8) * 0.5; ctx.strokeStyle = `rgba(150,200,255,${0.4 + s * 0.4})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, ry - 20); ctx.lineTo(rx, ry + 20); ctx.stroke();
    } else { // black hole
      const g = ctx.createRadialGradient(rx, ry, 6, rx, ry, 22); g.addColorStop(0, 'rgba(255,150,60,0)'); g.addColorStop(0.7, 'rgba(255,150,60,.5)'); g.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(rx, ry, 24, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(rx, ry, 8, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('KALINTI', rx, ry + 34);

    const veryLow = mass < 0.5;
    const end = lowPath ? 'BEYAZ CÜCE' : bh ? 'KARA DELİK' : 'NÖTRON YILDIZI';
    ro.textContent = veryLow
      ? `${mass.toFixed(2)} M☉  ·  ÇOK UZUN ÖMÜRLÜ (evren yaşından uzun)  ·  beklenen son: beyaz cüce`
      : `BAŞLANGIÇ KÜTLESİ ${mass.toFixed(2)} M☉  ·  SON: ${end}`;
  });

  function node(ctx, x, y, label, active) {
    ctx.strokeStyle = active ? '#e9e7e1' : 'rgba(120,125,135,.4)';
    ctx.fillStyle = active ? 'rgba(233,231,225,.08)' : 'rgba(255,255,255,.02)';
    ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(x - 4, y - 12, ctx.measureText(label).width + 14, 24); ctx.fill(); ctx.stroke();
    ctx.fillStyle = active ? '#e9e7e1' : 'rgba(120,125,135,.6)'; ctx.textAlign = 'left';
    ctx.fillText(label, x + 3, y + 4);
  }
  function drawChain(ctx, x, y, arr, active, S) {
    let cx = x;
    ctx.font = '11px Inter, Arial';
    arr.forEach((n, i) => {
      const w = ctx.measureText(n).width + 14;
      if (cx + w > S.w - 40) { /* keep on one row; shrink spacing */ }
      node(ctx, cx, y, n, active);
      if (i < arr.length - 1) {
        ctx.strokeStyle = active ? 'rgba(255,255,255,.2)' : 'rgba(120,125,135,.25)';
        ctx.beginPath(); ctx.moveTo(cx + w + 2, y); ctx.lineTo(cx + w + 16, y); ctx.stroke();
      }
      cx += w + 18;
    });
  }

  slider(controls, 'BAŞLANGIÇ KÜTLESİ (M☉)', 0.08, 30, 1, 0.01, v => v.toFixed(2) + ' M☉', v => { mass = v; }, 'slider-mass');
  hint(controls, 'Sürekli hidrojen füzyonu için gereken en düşük kütle ≈ 0,08 M☉\'dir; bunun altındakiler (kahverengi cüceler) normal yıldız sayılmaz. Kütle < 8 M☉ ise yıldız kırmızı dev → gezegenimsi bulutsu → beyaz cüce olur; en düşük kütleliler evren yaşından uzun yaşar. Çok büyük kütleli yıldızlar süpernovayla patlar; geriye nötron yıldızı ya da kara delik kalır.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 20 — Kara delik nedir?
 * ================================================================== */
function topic20(stage) {
  const { visual, controls } = stageShell(stage, 'KARA DELİK — IŞIK & YERÇEKİMİ');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let b = 0.5;            // impact parameter fraction

  c.loop((time, S, ctx) => {
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04050a'; ctx.fillRect(0, 0, S.w, S.h);
    const rng = seeded(5); for (let i = 0; i < 70; i++) star(ctx, rng() * S.w, rng() * S.h, rng() < 0.1 ? 1.3 : 0.6, 0.4);
    const cx = S.w * 0.55, cy = S.h * 0.42, Rh = Math.min(S.w, S.h) * 0.07;

    // accretion disk
    const g = ctx.createRadialGradient(cx, cy, Rh, cx, cy, Rh * 4);
    g.addColorStop(0, 'rgba(255,150,60,0)'); g.addColorStop(0.5, 'rgba(255,160,70,.5)'); g.addColorStop(1, 'rgba(255,160,70,0)');
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.32);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, Rh * 4, 0, TAU); ctx.fill();
    ctx.restore();
    // event horizon
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, Rh, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,180,120,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, Rh, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(180,140,110,.7)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('OLAY UFKU', cx, cy - Rh - 8);
    ctx.fillText('YIĞILMA DİSKİ', cx, cy + Rh * 1.6);

    // light ray with adjustable impact parameter
    const impact = (b - 0.5) * Rh * 6;
    let x = 20, y = cy + impact, vx = 3, vy = 0, captured = false;
    ctx.strokeStyle = '#9fd0ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < 400; i++) {
      const dx = cx - x, dy = cy - y, r = Math.hypot(dx, dy);
      if (r < Rh) { captured = true; break; }
      if (x > S.w + 20) break;
      const a = 900 / (r * r);
      vx += a * dx / r * 0.5; vy += a * dy / r * 0.5;
      const sp = Math.hypot(vx, vy); vx = vx / sp * 3; vy = vy / sp * 3;
      x += vx; y += vy; ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (captured) { ctx.fillStyle = '#ff6a5a'; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.textAlign = 'left'; ctx.fillText('IŞIN', 22, cy + impact - 8);
    ro.textContent = captured ? 'IŞIK YAKALANDI  ·  Olay ufkunun içinden ışık kaçamaz' : 'IŞIK BÜKÜLDÜ  ·  Kütleçekimi ışığın yolunu eğer (kütleçekimsel mercek)';
  });

  slider(controls, 'IŞIN MESAFESİ', 0, 100, 50, 1, v => v + '%', v => { b = v / 100; }, 'slider-impact');
  hint(controls, 'Kara delik, ışığın bile kaçamadığı olay ufkuna sahiptir; çevresindeki madde yığılma diskini oluşturur ve yakından geçen ışık kütleçekimiyle bükülür. Yine de kara delikler "uzayın elektrik süpürgeleri" değildir: kütleçekimleri, aynı kütleli herhangi bir cisminki gibi davranır.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC 21 — Evreni nasıl anlıyoruz? (final sentez)
 * ================================================================== */
function topic21(stage) {
  const { visual, controls } = stageShell(stage, 'IŞIKTAN BİLGİYE');
  const c = makeCanvas(visual);
  const ro = readout(visual);
  let step = 0, jp = 0;
  const N0 = 380, N1 = 700;
  const lines = { H: [656, 486, 434], Na: [589], Ca: [393, 397] };

  c.loop((time, S, ctx) => {
    jp = Math.min(1, jp + 0.01);
    ctx.clearRect(0, 0, S.w, S.h);
    ctx.fillStyle = '#04060a'; ctx.fillRect(0, 0, S.w, S.h);
    const rng = seeded(11); for (let i = 0; i < 70; i++) star(ctx, rng() * S.w, rng() * S.h, rng() < 0.1 ? 1.3 : 0.5, 0.35);

    // journey (top): star -> photon -> telescope
    const jy = S.h * 0.16, sx = S.w * 0.10, tx = S.w * 0.90;
    const sg = ctx.createRadialGradient(sx, jy, 1, sx, jy, 16); sg.addColorStop(0, '#fff4d8'); sg.addColorStop(1, 'rgba(255,230,170,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, jy, 16, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffe6a6'; ctx.beginPath(); ctx.arc(sx, jy, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('UZAK YILDIZ', sx, jy + 26);
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(sx + 8, jy); ctx.lineTo(tx - 12, jy); ctx.stroke(); ctx.setLineDash([]);
    const px = lerp(sx + 8, tx - 12, jp);
    const pg = ctx.createRadialGradient(px, jy, 0, px, jy, 9); pg.addColorStop(0, 'rgba(255,255,255,.95)'); pg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, jy, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(233,231,225,.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tx - 10, jy + 8); ctx.lineTo(tx + 6, jy - 8); ctx.moveTo(tx - 6, jy + 12); ctx.lineTo(tx + 10, jy - 4); ctx.stroke();
    ctx.fillStyle = 'rgba(150,155,165,.7)'; ctx.fillText('TELESKOP', tx, jy + 26);

    // analysis panel
    const bx = S.w * 0.12, bw = S.w * 0.76, by = S.h * 0.44, bh = S.h * 0.16;
    const nx = nm => bx + (nm - N0) / (N1 - N0) * bw;
    const reveal = jp >= 1;
    ctx.globalAlpha = reveal ? 1 : 0.25;

    if (step <= 2) {
      for (let i = 0; i < bw; i += 2) { const nm = N0 + i / bw * (N1 - N0); const [r, g2, b2] = nmRGB(nm); ctx.fillStyle = `rgb(${r},${g2},${b2})`; ctx.fillRect(bx + i, by, 2, bh); }
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.strokeRect(bx, by, bw, bh);
    }
    if (step === 0) {
      const peak = nx(500); ctx.strokeStyle = '#e9e7e1'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(peak, by - 8); ctx.lineTo(peak, by + bh + 8); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#e9e7e1'; ctx.font = '600 12px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText('≈ 5800 K', peak, by - 14);
      ro.textContent = 'ADIM 01 · RENK → SICAKLIK · Enerjinin dalga boyuna dağılımı yüzey sıcaklığını verir';
    } else if (step === 1) {
      const cols = { H: '#8fb6ff', Na: '#ffe08a', Ca: '#c9a8ff' };
      for (const k in lines) for (const nm of lines[k]) { const x = nx(nm); ctx.fillStyle = 'rgba(6,8,12,.85)'; ctx.fillRect(x - 1, by, 2.4, bh); ctx.strokeStyle = cols[k]; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, by - 6); ctx.lineTo(x, by); ctx.stroke(); }
      ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
      ctx.fillStyle = cols.H; ctx.fillText('H', nx(486), by - 10);
      ctx.fillStyle = cols.Na; ctx.fillText('Na', nx(589), by - 10);
      ctx.fillStyle = cols.Ca; ctx.fillText('Ca', nx(395), by - 10);
      ro.textContent = 'ADIM 02 · TAYF ÇİZGİLERİ → ELEMENTLER · Koyu çizgiler H, Na, Ca gibi elementleri ele verir';
    } else if (step === 2) {
      const shift = 10;
      for (const nm of [486, 589, 656]) {
        const xr = nx(nm), xm = xr + shift;
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xr, by); ctx.lineTo(xr, by + bh); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = '#ff9a6a'; ctx.beginPath(); ctx.moveTo(xm, by); ctx.lineTo(xm, by + bh); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(233,231,225,.8)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'left';
      ctx.fillText('referans', nx(486) - 6, by + bh + 14);
      ctx.fillStyle = '#ff9a6a'; ctx.fillText('ölçülen (kaymış)', nx(486) + 14, by + bh + 26);
      ctx.fillStyle = '#e9e7e1'; ctx.font = '600 12px Inter, Arial'; ctx.textAlign = 'center';
      ctx.fillText('Bizden uzaklaşıyor → +32 km/s', S.w / 2, by - 12);
      ro.textContent = 'ADIM 03 · DOPPLER → HAREKET · Çizgilerin kayması görüş doğrultusundaki hızı verir';
    } else {
      const gx = bx, gw = bw, gy = by, gh2 = S.h * 0.24;
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.strokeRect(gx, gy, gw, gh2);
      ctx.fillStyle = 'rgba(150,155,165,.6)'; ctx.font = '9px Inter, Arial'; ctx.textAlign = 'left'; ctx.fillText('PARLAKLIK — ZAMAN', gx, gy - 8);
      ctx.strokeStyle = '#9fd0ff'; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const u = i / 100, x = gx + u * gw;
        const dip = (u > 0.45 && u < 0.6) ? 0.5 * Math.sin((u - 0.45) / 0.15 * Math.PI) : 0;
        const y = gy + gh2 * (0.2 + dip * 0.7);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(233,231,225,.85)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center';
      ctx.fillText('Olası gezegen geçişi', gx + gw * 0.52, gy + gh2 * 0.86);
      ro.textContent = 'ADIM 04 · ZAMAN → DEĞİŞİM · Küçük parlaklık düşüşü OLASI bir gezegen geçişini düşündürür';
    }
    ctx.globalAlpha = 1;
    if (!reveal) { ctx.fillStyle = 'rgba(150,155,165,.6)'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText('IŞIK TOPLANIYOR…', S.w / 2, by + bh / 2); }
  });

  segment(controls, 'ANALİZ', [
    { label: '01 SICAKLIK', value: 0, testid: 'step-temp' },
    { label: '02 ELEMENTLER', value: 1, testid: 'step-elem' },
    { label: '03 HAREKET', value: 2, testid: 'step-doppler' },
    { label: '04 DEĞİŞİM', value: 3, testid: 'step-time' }
  ], v => { step = v; }, 0);
  const row = document.createElement('div'); row.className = 'ctrl'; row.innerHTML = `<span class="ctrl-label">SON</span>`;
  const rr = document.createElement('div'); rr.className = 'ctrl-row';
  const back = document.createElement('button'); back.className = 'btn-ghost'; back.dataset.testid = 'final-restart';
  back.innerHTML = '<span class="arrow">&larr;</span> BAŞA DÖN'; back.addEventListener('click', () => goto(0));
  const sol = document.createElement('a'); sol.className = 'btn-next'; sol.href = '../solar-system.html'; sol.dataset.testid = 'final-solar';
  sol.style.textDecoration = 'none'; sol.innerHTML = 'GÜNEŞ SİSTEMİNİ KEŞFET <span class="arrow">&rarr;</span>';
  rr.appendChild(back); rr.appendChild(sol); row.appendChild(rr); controls.appendChild(row);
  hint(controls, 'Bir yıldızdan gelen ışık yalnızca parlaklık değildir; ölçülebilir bilgiler taşır. Rengi sıcaklığını, tayf çizgileri kimyasal bileşimini, çizgilerin Doppler kayması görüş doğrultusundaki hareketini, parlaklığın zamanla değişimi ise olası gezegenleri ortaya koyar. Tek foton anlatısı, toplanan yıldız ışığını temsil eden görsel bir araçtır.');

  return () => c.stop();
}

/* ================================================================== *
 * TOPIC DATA
 * ================================================================== */
const TOPICS = [
  {
    ch: 0, no: '01', title: 'Işık Kirliliği',
    intro: 'Gece gökyüzünü görmemizi engelleyen şey yıldızların azalması değil, yapay ışığın gökyüzüyle aramızdaki kontrastı azaltmasıdır.',
    blocks: [
      { h: 'Gökyüzü Parlaması', p: 'Dış aydınlatmalardan doğrudan veya yüzeylerden yansıyarak atmosfere ulaşan ışık; hava molekülleri ve aerosoller tarafından saçılır. Bunun sonucunda şehirlerin üzerinde skyglow adı verilen yapay bir gökyüzü parlaması oluşur.' },
      { h: 'Neden Yıldızlar Kaybolur?', p: 'Gökyüzü arka planı parlaklaştıkça sönük gökcisimleriyle arka plan arasındaki kontrast azalır. Önce çıplak gözle görülebilen sönük yıldızlar, daha güçlü ışık kirliliğinde ise Samanyolu gibi düşük yüzey parlaklığına sahip yapılar seçilemez hâle gelir.' },
      { h: 'Astronominin Ötesinde', p: 'Işık kirliliği yalnızca gözlemsel astronomiyi etkilemez. Gereksiz ve yanlış yönlendirilmiş gece aydınlatması enerji tüketimini artırır; birçok canlı türünün yön bulma, beslenme, göç ve biyolojik ritimleri üzerinde de etkiler oluşturabilir.' }
    ],
    takeaway: 'Işık kirliliği yıldızları ortadan kaldırmaz; gökyüzünün arka planını parlatarak onları görmemizi zorlaştırır.',
    mount: topic01
  },
  {
    ch: 0, no: '02', title: 'Yıldız mı, Gezegen mi?',
    intro: 'Gökyüzünde güçlü biçimde kırpışan parlak bir nokta çoğu zaman yıldızdır; gezegenlerin ışığı ise genellikle daha kararlı görünür. Bunun nedeni cisimlerin kendisinden çok Dünya atmosferidir.',
    blocks: [
      { h: 'Atmosferik Sintilasyon', p: 'Atmosferin sıcaklığı ve yoğunluğu sürekli değişen türbülanslı katmanları, içlerinden geçen ışığın kırılma yönünü küçük miktarlarda değiştirir. Yıldızın görünen konumu ve parlaklığı bu nedenle çok kısa zaman ölçeklerinde dalgalanır.' },
      { h: 'Yıldız Neden Daha Çok Kırpışır?', p: 'Yıldızlar çok uzak olduklarından teleskoplarımız için bile çoğunlukla çözünemeyen noktasal kaynaklardır. Bu nedenle atmosferdeki küçük kırılma değişimleri yıldızın görüntüsünü belirgin şekilde etkileyebilir.' },
      { h: 'Gezegen Neden Daha Sakin Görünür?', p: 'Gezegenler gökyüzünde çok küçük de olsa açısal bir diske sahiptir. Diskin farklı noktalarından gelen ışık atmosferin farklı bölgelerinden geçtiği için dalgalanmalar kısmen birbirini ortalar. Bu yüzden gezegenler genellikle daha kararlı görünür; ancak ufka yakınken onlar da sintilasyon gösterebilir.' }
    ],
    takeaway: 'Yıldızların kırpışması çoğunlukla yıldızın kendisinden değil, ışığının Dünya\'nın türbülanslı atmosferinden geçmesinden kaynaklanır.',
    mount: topic02
  },
  {
    ch: 0, no: '03', title: 'Gökyüzünü Elinle Ölç',
    intro: 'Gökyüzündeki uzaklıkları metre ya da kilometreyle değil, gözlemciden bakıldığında oluşturdukları açıyla ifade ederiz.',
    blocks: [
      { h: 'Açısal Uzaklık', p: 'İki yıldız birbirinden fiziksel olarak çok farklı uzaklıklarda olabilir. Gökyüzünde birbirlerine ne kadar yakın göründüklerini belirtmek için derece, yay dakikası ve yay saniyesi kullanılır. Bir tam çember 360°\'dir.' },
      { h: 'Elin Bir Açı Ölçeğidir', p: 'Kol tam uzatıldığında el, hızlı tahminler için kullanılabilir. Bir parmak yaklaşık 1–2°, üç parmak yaklaşık 5°, yumruk yaklaşık 10°, başparmak ile serçe parmak arasındaki açıklık ise yaklaşık 20° civarındadır.' },
      { h: 'Ay Ne Kadar Büyük Görünür?', p: 'Ay\'ın gökyüzündeki açısal çapı yaklaşık yarım derecedir. Bu nedenle gökyüzünde fiziksel boyutundan çok daha küçük bir alan kaplar.' },
      { h: 'Neden Yaklaşık?', p: 'El büyüklüğü ve kol uzunluğu kişiden kişiye değiştiği için bu yöntem hassas bir ölçüm değildir. Ancak gözlemsel astronomide gökyüzündeki ölçekleri hızlıca tahmin etmek için oldukça kullanışlıdır.' }
    ],
    takeaway: 'Gökyüzündeki cisimlerin görünür ayrılıklarını açılarla ölçeriz; uzatılmış bir el de basit bir açısal cetvel gibi kullanılabilir.',
    mount: topic03
  },
  {
    ch: 0, no: '04', title: 'Teleskop Aslında Ne Yapar?',
    intro: 'Bir teleskobun temel gücü yalnızca görüntüyü büyütmesinden değil, insan gözünden çok daha fazla ışık toplayabilmesinden gelir.',
    blocks: [
      { h: 'Işık Toplama Gücü', p: 'Teleskobun objektif merceği ya da ana aynası gökcisminden gelen ışığı toplar. Toplanan ışık miktarı açıklığın alanıyla, dolayısıyla yaklaşık olarak teleskop çapının karesiyle artar.' },
      { h: 'Sönük Evreni Görmek', p: 'Daha fazla ışık toplamak, düşük parlaklıktaki yıldızları, galaksileri ve bulutsuları daha yüksek sinyal-gürültü oranıyla gözlemlemeyi mümkün kılar.' },
      { h: 'Ayırma Gücü', p: 'Açıklık büyüdükçe teleskobun teorik kırınım sınırı küçülür ve birbirine çok yakın ayrıntıları ayırma kapasitesi artar. İdeal durumda açısal çözünürlük yaklaşık olarak dalga boyunun açıklığa oranıyla belirlenir. Yer tabanlı gözlemlerde ise atmosferik seeing çoğu zaman bu teorik sınırdan önce devreye girer.' },
      { h: 'Büyütme Tek Başına Yeterli Değil', p: 'Görüntüyü daha fazla büyütmek teleskoba yeni ayrıntı kazandırmaz. Asıl belirleyici olan toplanan ışık, optik kalite, açıklık ve gözlem koşullarıdır.' }
    ],
    takeaway: 'Teleskop yalnızca büyütmez; ışık toplar ve uygun koşullarda çıplak gözün ayıramadığı ayrıntıları çözmemizi sağlar.',
    mount: topic04
  },
  {
    ch: 1, no: '05', title: 'Gökyüzü Neden Hareket Ediyor?',
    intro: 'Gece boyunca yıldızların doğudan batıya doğru ilerlediğini görürüz. Fakat bu günlük hareketin temel nedeni yıldızların topluca dönmesi değil, Dünya\'nın kendi ekseni etrafındaki dönüşüdür.',
    blocks: [
      { h: 'Görünür Gök Hareketi', p: 'Dünya batıdan doğuya dönerken, gökyüzü gözlemciye ters yönde, yani doğudan batıya dönüyormuş gibi görünür. Uzun pozlama fotoğraflarında yıldızların çizdiği yayların nedeni budur.' },
      { h: 'Gök Kutbu', p: 'Dünya\'nın dönme ekseni gökyüzüne uzatıldığında kuzey ve güney gök kutuplarını tanımlar. Bu noktalara yakın yıldızların gece boyunca çizdiği görünür daireler küçüktür.' },
      { h: 'Polaris Neden Özel?', p: 'Polaris, yani Kuzey Yıldızı, günümüzde kuzey gök kutbuna bir dereceden daha yakın bulunur. Bu yüzden tamamen sabit değildir; fakat gece boyunca çok küçük bir çember çizdiğinden çıplak gözle neredeyse hareketsiz görünür.' },
      { h: 'Uzun Zaman Ölçeği', p: 'Dünya\'nın dönme ekseni yaklaşık 26.000 yıllık presesyon hareketi yaptığı için Polaris sonsuza kadar kutup yıldızı olarak kalmayacaktır.' }
    ],
    takeaway: 'Yıldızların günlük gökyüzü hareketinin büyük bölümü, Dünya\'nın kendi ekseni etrafında dönmesinin bize görünen sonucudur.',
    mount: topic05
  },
  {
    ch: 1, no: '06', title: 'Gök Atlası Nedir?',
    intro: 'Gökyüzü yalnızca yıldız desenlerinden oluşmaz; konumu matematiksel olarak tarif edilebilen bir koordinat sistemine de sahiptir.',
    blocks: [
      { h: 'Gökyüzünün Haritası', p: 'Gök atlasları yıldızların, derin uzay cisimlerinin, takımyıldız sınırlarının ve başka gök cisimlerinin gökyüzündeki konumlarını gösteren haritalardır.' },
      { h: 'Gök Koordinatları', p: 'Astronomide yaygın kullanılan eşlek koordinat sisteminde dik açıklık Dünya\'daki enleme, sağ açıklık ise kabaca boylama benzer. Böylece bir gökcismi gökyüzünde sayısal olarak tanımlanabilir.' },
      { h: 'Yön ve Zaman', p: 'Bir cismin gözlemciye göre hangi yönde ve ne kadar yüksekte göründüğü; konuma, tarihe ve saate bağlıdır. Bu nedenle modern dijital gök atlasları gözlemcinin bulunduğu yeri ve zamanı hesaba katar.' },
      { h: 'Gökyüzünde Yol Bulmak', p: 'Takımyıldızlar ve parlak yıldızlar görsel referans noktaları sağlar; koordinatlar ise bilimsel olarak kesin konum tarifine olanak verir.' }
    ],
    takeaway: 'Gök atlası, gökyüzünü yalnızca şekillerle değil, yönler ve koordinatlarla okunabilir bir haritaya dönüştürür.',
    mount: topic06
  },
  {
    ch: 1, no: '07', title: 'Takımyıldızlar Gerçekten Yan Yana mı?',
    intro: 'Gökyüzünde aynı şeklin parçası gibi görünen yıldızların uzayda gerçekten birbirlerine yakın olmaları gerekmez.',
    blocks: [
      { h: 'İki Boyutlu Görüntü', p: 'Gökyüzüne baktığımızda yıldızların uzaklık bilgisini doğrudan algılayamayız. Çok farklı uzaklıklardaki yıldızlar aynı görüş doğrultusuna düştüğünde yan yana görünür.' },
      { h: 'Üçüncü Boyut', p: 'Bir takımyıldızın parlak yıldızlarından biri onlarca, diğeri yüzlerce hatta binlerce ışık yılı uzakta olabilir. Dünya dışındaki başka bir noktadan bakılsaydı bugün tanıdığımız desenlerin çoğu değişirdi.' },
      { h: 'Takımyıldız Ne Demek?', p: 'Günümüzde Uluslararası Astronomi Birliği gökyüzünü 88 resmi takımyıldız bölgesine ayırmıştır. Dolayısıyla modern astronomide “takımyıldız” yalnızca yıldızların arasına çizilen hayalî çizgiler değil, sınırları tanımlanmış bir gökyüzü bölgesidir.' },
      { h: 'Görsel Desen ve Fiziksel Grup Aynı Şey Değil', p: 'Aynı takımyıldız bölgesinde görünen yıldızların çoğunun fiziksel olarak birbirine bağlı olması gerekmez. Bir yıldız kümesi ise bunun aksine ortak kökene ve fiziksel ilişkiye sahip yıldızlardan oluşabilir.' }
    ],
    unitNote: 'IŞIK YILI — Zaman değil, ışığın vakumda bir yılda aldığı uzaklıktır; yaklaşık 9,46 trilyon km.',
    takeaway: 'Takımyıldızların gökyüzündeki desenleri iki boyutlu bir izdüşümdür; aynı desende görünmek, yıldızların uzayda yan yana olduğu anlamına gelmez.',
    mount: topic07
  },
  {
    ch: 2, no: '08', title: 'Neden Ay\'ın Hep Aynı Yüzünü Görüyoruz?',
    intro: 'Ay\'ın Dünya\'ya sürekli aynı yüzünü göstermesi, kendi ekseni etrafında dönmediği anlamına gelmez. Tam tersine, bunun gerçekleşebilmesi için Ay\'ın dönmesi gerekir.',
    blocks: [
      { h: 'İki Hareket, Aynı Süre', p: 'Ay, Dünya çevresindeki yörüngesini yıldızlara göre yaklaşık 27,3 günde tamamlarken kendi ekseni etrafında da yaklaşık aynı sürede bir kez döner.' },
      { h: 'Eşzamanlı Dönme', p: 'Dönme ve dolanma sürelerinin eşit olması nedeniyle aynı Ay yarımküresi sürekli olarak Dünya yönünde kalır. Bu duruma eşzamanlı dönme ya da gelgit kilitlenmesi denir.' },
      { h: 'Neden Böyle Oldu?', p: 'Dünya\'nın Ay üzerinde oluşturduğu gelgit etkileri çok uzun zaman ölçeklerinde Ay\'ın dönme hızını değiştirmiş ve sistemi bugünkü eşzamanlı duruma taşımıştır.' },
      { h: 'Tam Olarak Yarısı mı?', p: 'Hayır. Ay\'ın yörüngesi eliptiktir ve geometrisi nedeniyle gözlem açımız küçük miktarlarda değişir. Librasyon adı verilen bu görünür salınım sayesinde zaman içinde Ay yüzeyinin yaklaşık %59\'unu Dünya\'dan görebiliriz.' }
    ],
    takeaway: 'Ay dönmediği için değil, kendi dönüş süresi yörünge süresiyle eşleştiği için bize yaklaşık aynı yüzünü gösterir.',
    mount: topic08
  },
  {
    ch: 2, no: '09', title: 'Mevsimler Neden Oluşuyor?',
    intro: 'Mevsimlerin temel nedeni Dünya\'nın yıl içinde Güneş\'e yaklaşıp uzaklaşması değil, dönme ekseninin yörünge geometrisine göre eğik olmasıdır.',
    blocks: [
      { h: 'Eksen Eğikliği', p: 'Dünya\'nın dönme ekseni, yörünge düzlemine dik doğrultuya göre yaklaşık 23,4° eğiktir.' },
      { h: 'Güneş\'in Yüksekliği', p: 'Bir yarımküre Güneş\'e doğru eğildiğinde Güneş gökyüzünde daha yükseğe çıkar. Işınlar yüzeye daha dik ulaşır ve aynı miktardaki güneş enerjisi daha küçük bir alana dağılır.' },
      { h: 'Gün Uzunluğu', p: 'Aynı dönemde gündüzler de uzar. Böylece yüzey gün boyunca daha uzun süre enerji alır. Diğer yarımkürede ise tam tersi gerçekleşir.' },
      { h: 'Uzaklık Neden Ana Neden Değil?', p: 'Dünya\'nın yörüngesi hafif eliptiktir; ancak Kuzey Yarımküre kışı yaşarken Dünya Güneş\'e en yakın konumuna yaklaşık ocak başında ulaşır. Ayrıca iki yarımkürede mevsimlerin ters olması, uzaklığın mevsimlerin temel nedeni olmadığını açıkça gösterir.' }
    ],
    takeaway: 'Mevsimleri belirleyen temel etken, Dünya\'nın eksen eğikliğinin yıl boyunca Güneş ışınlarının geliş açısını ve gündüz süresini değiştirmesidir.',
    mount: topic09
  },
  {
    ch: 2, no: '10', title: 'Yerçekimi Neden Yörünge Oluşturuyor?',
    intro: 'Yörünge, yerçekiminin ortadan kalktığı bir durum değildir. Tam tersine, bir gökcismine yörüngesini kazandıran temel etkenlerden biri yerçekimidir.',
    blocks: [
      { h: 'Düşüş ve İleri Hareket', p: 'Bir cisim yatay hızla fırlatıldığında ileri doğru hareket ederken yerçekimi tarafından Dünya\'ya doğru ivmelendirilir. Hızı düşükse yörüngesi yüzeyle kesişir ve cisim yere düşer.' },
      { h: 'Dünya\'nın Eğriliği', p: 'Yatay hız arttıkça cisim düşerken daha fazla yol alır. Uygun hız ve doğrultuda, cismin düşüş eğrisi Dünya\'nın yüzey eğriliğini takip eder.' },
      { h: 'Sürekli Serbest Düşüş', p: 'Atmosfer etkisini ihmal edersek, yörüngedeki bir uydu sürekli olarak Dünya\'ya doğru serbest düşüştedir; ancak yeterli teğetsel hızı olduğu için yüzeye ulaşmadan Dünya\'nın çevresinde dolanır.' },
      { h: 'Tek Bir Yörünge Hızı Yoktur', p: 'Gerekli hız cismin bulunduğu uzaklığa ve istenen yörüngenin şekline bağlıdır. Hızın yalnızca büyüklüğü değil yönü de yörüngeyi belirler.' }
    ],
    takeaway: 'Yörünge, yerçekimi ile ileri hareketin birleşimidir: cisim sürekli düşer, fakat uygun teğetsel hızı sayesinde yere ulaşmaz.',
    mount: topic10
  },
  {
    ch: 3, no: '11', title: 'Yıldızların Rengi Neyi Anlatıyor?',
    intro: 'Bir yıldızın rengi estetik bir özellikten çok daha fazlasıdır; yıldızın yüzeyindeki fiziksel koşullar hakkında ilk ipuçlarından birini verir.',
    blocks: [
      { h: 'Renk ve Sıcaklık', p: 'Yıldızların sürekli tayfı yaklaşık olarak termal ışıma davranışı gösterir. Sıcaklık yükseldikçe ışımanın en güçlü olduğu bölge daha kısa dalga boylarına kayar. Bu nedenle daha sıcak yıldızlar mavi-beyaz, daha soğuk yıldızlar turuncu-kırmızı görünür.' },
      { h: 'Tayfsal Sınıflar', p: 'Yıldızlar sıcaklık ve tayf özelliklerine göre başlıca O, B, A, F, G, K ve M tayf sınıflarında incelenir.' },
      { h: 'Güneş\'in Rengi', p: 'Güneş\'in etkin sıcaklığı yaklaşık 5770 K\'dir ve tayf sınıfı G2\'dir. Atmosfer dışında bakıldığında Güneş\'in görünür ışığı genel olarak beyaza yakındır.' },
      { h: 'Renk Her Zaman Yalnızca Sıcaklık mı?', p: 'Hayır. Yıldızlararası toz kısa dalga boyundaki ışığı daha fazla zayıflatarak yıldızı olduğundan daha kırmızı gösterebilir.' }
    ],
    takeaway: 'Bir yıldızın tayfsal enerji dağılımı sıcaklığıyla güçlü biçimde ilişkilidir: genel olarak mavi yıldızlar daha sıcak, kırmızı yıldızlar daha soğuktur.',
    mount: topic13
  },
  {
    ch: 3, no: '12', title: 'Işık Bize Cisimlerin İçeriğini Nasıl Söyler?',
    intro: 'Bir yıldızdan doğrudan madde örneği alamayız; fakat ışığı, yıldızın atmosferindeki atom ve iyonların bıraktığı fiziksel izleri Dünya\'ya kadar taşır.',
    blocks: [
      { h: 'Tayf Nedir?', p: 'Işık dalga boylarına ayrıldığında bir tayf elde edilir. Yıldızların tayflarında sürekli ışımanın üzerine binmiş çok sayıda soğurma çizgisi görülür.' },
      { h: 'Çizgiler Nereden Gelir?', p: 'Atom ve iyonlardaki elektronlar yalnızca belirli enerji düzeyleri arasında geçiş yapabilir. Bu nedenle madde belirli dalga boylarındaki fotonları soğurur veya yayar.' },
      { h: 'Kimyasal Parmak İzi', p: 'Laboratuvarda ölçülen çizgi dalga boyları yıldız tayfındaki çizgilerle karşılaştırılarak hangi element ve iyonların bulunduğu belirlenebilir.' },
      { h: 'Çizginin Gücü Ne Söyler?', p: 'Bir tayf çizgisinin şiddeti yalnızca o elementin miktarına bağlı değildir. Sıcaklık, yoğunluk, iyonlaşma durumu ve atmosferin yapısı da çizgiyi etkiler.' }
    ],
    takeaway: 'Spektroskopi, atomların ışıkta bıraktığı karakteristik çizgileri okuyarak uzak gökcisimlerinin kimyasal ve fiziksel özelliklerini ölçmemizi sağlar.',
    mount: topic14
  },
  {
    ch: 3, no: '13', title: 'Uzaya Bakmak Neden Geçmişe Bakmaktır?',
    intro: 'Astronomide görmek, çoğu zaman geçmişten gelen ışığı yakalamaktır. Çünkü ışığın hızı sonlu olduğu için hiçbir uzak gökcismi bize anlık olarak görünmez.',
    blocks: [
      { h: 'Işığın Hızı', p: 'Işık vakumda saniyede 299.792.458 metre yol alır.' },
      { h: 'Yakın Evren Bile Geçmişte', p: 'Güneş\'ten gelen ışık Dünya\'ya yaklaşık 8 dakika 20 saniyede ulaşır.' },
      { h: 'Uzaklaştıkça Geçmiş Derinleşir', p: 'Andromeda Galaksisi yaklaşık 2,5 milyon ışık yılı uzaktadır. Bugün yakaladığımız ışık galaksiden yaklaşık 2,5 milyon yıl önce ayrılmıştır.' },
      { h: 'Kozmolojik Ölçek', p: 'Çok uzak galaksiler söz konusu olduğunda evrenin genişlemesi de hesaba katılır. Bu nedenle kozmolojide geriye bakış zamanı daha ayrıntılı modellerle hesaplanır.' }
    ],
    takeaway: 'Teleskoplar yalnızca uzağı değil, geçmişi de görür; bir cisim ne kadar uzaktaysa bugün aldığımız ışık o kadar eski bir dönemde yola çıkmıştır.',
    mount: topic15
  },
  {
    ch: 3, no: '14', title: 'Başka Gezegenleri Nasıl Buluyoruz?',
    intro: 'Ötegezegenlerin büyük bölümü yıldızlarının yanında doğrudan görüntülenemeyecek kadar küçük, sönük ve yakın açısal ayrılıktadır. Bu nedenle onları çoğu zaman yıldızları üzerinde bıraktıkları ölçülebilir etkilerden buluruz.',
    blocks: [
      { h: 'Geçiş Yöntemi', p: 'Bir gezegen yörüngesi uygun biçimde hizalanmışsa yıldızının önünden geçerken yıldızdan bize ulaşan ışığın küçük bir bölümünü örter.' },
      { h: 'Işık Eğrisi', p: 'Tekrarlayan geçişler gezegenin yörünge dönemini verir. Geçiş derinliği ise yıldızın yarıçapı biliniyorsa gezegen yarıçapının hesaplanmasına yardımcı olur.' },
      { h: 'Dikine Hız Yöntemi', p: 'Yıldız ve gezegen ortak kütle merkezi çevresinde hareket eder. Yıldızın bize doğru ve bizden uzağa olan küçük hareketi tayf çizgilerindeki Doppler kaymasıyla ölçülür.' },
      { h: 'Yöntemler Birleştiğinde', p: 'Hem geçiş hem dikine hız ölçümü yapılabilen sistemlerde gezegenin yarıçapı ve kütlesi birlikte belirlenebilir. Böylece ortalama yoğunluğu hakkında bilgi elde edilir.' }
    ],
    takeaway: 'Ötegezegenleri her zaman doğrudan görmek gerekmez; yıldızlarının ışığında ve hareketinde oluşturdukları düzenli değişimler varlıklarını ortaya çıkarır.',
    mount: topic16
  },
  {
    ch: 4, no: '15', title: 'Yıldızlar Nasıl Doğar?',
    intro: 'Yıldız oluşumu, yıldızlararası ortamın soğuk ve yoğun bölgelerinde kütleçekimin maddeyi bir araya getirmesiyle başlayan uzun bir fiziksel süreçtir.',
    blocks: [
      { h: 'Moleküler Bulutlar', p: 'Yıldızların büyük bölümü soğuk moleküler bulutlarda oluşur. Bu bulutların temel bileşeni moleküler hidrojen olmakla birlikte helyum, başka gazlar ve yıldızlararası toz da içerir.' },
      { h: 'Kütleçekimsel Çöküş', p: 'Bulutun yeterince yoğun bölgelerinde kütleçekim diğer destek mekanizmalarına baskın hâle gelebilir. Bölge çöker ve yoğun çekirdekler oluşturur.' },
      { h: 'Önyıldız', p: 'Çöken çekirdeğin merkezinde bir önyıldız gelişir. Çevresindeki madde çoğunlukla bir disk üzerinden merkeze aktarılır.' },
      { h: 'Bir Yıldızın Başlangıcı', p: 'Merkez sıcaklığı ve yoğunluğu yeterince yükseldiğinde hidrojen füzyonu sürdürülebilir hâle gelir. İç basınç ile kütleçekim yaklaşık hidrostatik dengeye ulaştığında yıldız ana kol evresine yerleşir.' }
    ],
    takeaway: 'Yıldızlar, moleküler bulutlardaki yoğun bölgelerin kütleçekimle çökmesi ve merkezde sürdürülebilir hidrojen füzyonunun başlamasıyla oluşur.',
    mount: topic17
  },
  {
    ch: 4, no: '16', title: 'Yıldızlar Ölürken Ne Olur?',
    intro: 'Bir yıldızın yaşam süresi ve son evrimi büyük ölçüde başlangıç kütlesi tarafından belirlenir; ancak metaliklik, dönme hızı, kütle kaybı ve çift yıldız etkileşimleri de sonucu değiştirebilir.',
    blocks: [
      { h: 'Güneş Benzeri Yıldızlar', p: 'Güneş benzeri düşük ve orta kütleli yıldızlar çekirdekteki hidrojen tükendiğinde ana koldan ayrılır ve ilerleyen evrelerde kırmızı dev hâline gelir. Dış katmanlarının önemli bir bölümünü uzaya bıraktıktan sonra geride sıcak, yoğun bir beyaz cüce kalır.' },
      { h: 'Büyük Kütleli Yıldızlar', p: 'Yaklaşık sekiz Güneş kütlesinden daha büyük başlangıç kütlesine sahip yıldızlar çekirdeklerinde giderek daha ağır elementlerin füzyonunu sürdürebilir. Füzyon artık çekirdeği destekleyemediğinde çekirdek çok hızlı biçimde çöker.' },
      { h: 'Süpernova ve Kalıntı', p: 'Bu çöküş birçok durumda çekirdek çökmesi süpernovasıyla ilişkilidir. Geride kalan kompakt çekirdek koşullara bağlı olarak nötron yıldızı ya da kara delik oluşturabilir.' },
      { h: 'Kütle Neden Önemli?', p: 'Daha yüksek kütle çekirdekte daha yüksek sıcaklık ve basınç oluşturur; yıldızın hangi nükleer süreçleri gerçekleştirebildiğini ve nasıl evrimleşeceğini güçlü biçimde etkiler.' }
    ],
    takeaway: 'Bir yıldızın başlangıç kütlesi evrimini belirleyen en önemli değişkenlerden biridir; ancak yıldızların sonu tek bir kütle sınırıyla açıklanamayacak kadar zengin bir fizik içerir.',
    mount: topic19
  },
  {
    ch: 5, no: '17', title: 'Asteroit, Meteoroit ve Meteor Nedir?',
    intro: 'Asteroit, meteoroit ve meteor aynı olayın farklı isimleri değildir. İlk ikisi fiziksel cisimleri, meteor ise atmosferde gerçekleşen ışıklı bir olayı tanımlar.',
    blocks: [
      { h: 'Asteroit', p: 'Asteroitler, Güneş çevresinde dolanan ve gezegenlerden çok daha küçük olan doğal cisimlerdir. Çoğu kayaç ve metal bakımından zengindir. Büyük bölümü Mars ile Jüpiter arasındaki ana asteroit kuşağında bulunur; ancak Güneş Sistemi\'nin başka bölgelerinde de asteroitler vardır.' },
      { h: 'Meteoroit', p: 'Meteoroit, gezegenler arası uzayda hareket eden daha küçük doğal katı parçalar için kullanılan terimdir. Bunlar asteroit çarpışmalarından, kuyrukluyıldızlardan veya başka gökcisimlerinden kopan malzemelerden kaynaklanabilir.' },
      { h: 'Meteor', p: 'Bir meteoroit atmosfere yüksek hızla girdiğinde çevresindeki gazı sıkıştırır, ısıtır ve uyarır; meteoroit yüzeyinden kopan ve buharlaşan madde de sürece katılır. Ortaya çıkan parlak atmosferik olaya meteor denir.' },
      { h: 'Yere Ulaşırsa?', p: 'Cismin bir bölümü atmosfer geçişinden sağ çıkıp yere ulaşırsa artık meteorit olarak adlandırılır.' }
    ],
    unitNote: 'ASTRONOMİ BİRİMİ (AU) — Dünya ile Güneş arasındaki ortalama uzaklığa karşılık gelir; 1 AU yaklaşık 149,6 milyon km’dir ve Güneş Sistemi içindeki mesafeler için kullanılır.',
    takeaway: 'Asteroit ve meteoroit birer gökcismidir; meteor ise bir meteoroidin atmosferden geçişi sırasında oluşan ışıklı olaydır.',
    mount: topic12
  },
  {
    ch: 5, no: '18', title: 'Uzayda Ses Var mı?',
    intro: 'Ses bir elektromanyetik dalga değildir. Yayılabilmesi için enerjiyi komşu parçacıklara aktarabileceği maddesel bir ortama ihtiyaç duyar.',
    blocks: [
      { h: 'Ses Nasıl İlerler?', p: 'Gazlarda ses, basınç ve yoğunluktaki küçük değişimlerin parçacıklar arasında aktarılmasıyla ilerleyen mekanik bir dalgadır.' },
      { h: 'Vakumda Ne Olur?', p: 'İdeal vakumda titreşimi taşıyacak parçacık bulunmadığından sıradan bir ses dalgası yayılamaz. Gezegenler arası uzay tamamen maddesiz değildir; ancak yoğunluğu insan kulağının alışık olduğu akustik sesin yayılması için son derece düşüktür.' },
      { h: 'Peki Uzay Sesleri Nedir?', p: 'Uzay araçlarının kaydettiği plazma dalgaları, elektromanyetik değişimler veya başka ölçüm verileri bazen duyulabilir frekanslara çevrilir. Buna sonifikasyon denir.' },
      { h: 'Her Yer Sessiz mi?', p: 'Yoğun gaz veya plazma içeren bazı astrofiziksel ortamlarda basınç dalgaları bulunabilir. Dolayısıyla “uzayda ses yoktur” ifadesi özellikle gezegenler arası yüksek vakumdaki sıradan akustik ses için kullanılan bir kısaltmadır.' }
    ],
    takeaway: 'Ses mekanik bir dalgadır ve yayılmak için maddeye ihtiyaç duyar; gezegenler arası uzayın çok seyrek ortamı sıradan akustik sesi taşıyamaz.',
    mount: topic11
  },
  {
    ch: 5, no: '19', title: 'Galaksi Nedir?',
    intro: 'Galaksi, tek bir parlak yapı değil; yıldızlardan yıldızlararası gaza, tozdan karanlık maddeye kadar farklı bileşenleri kütleçekimiyle bir arada tutan büyük ölçekli bir sistemdir.',
    blocks: [
      { h: 'Bir Galakside Ne Var?', p: 'Galaksiler yıldızları ve onların gezegen sistemlerini, yıldız kümelerini, gazı, tozu ve önemli miktarda karanlık maddeyi içerir.' },
      { h: 'Hepsi Aynı Değil', p: 'Galaksilerin boyutları ve yapıları büyük çeşitlilik gösterir. Başlıca morfolojik sınıflar sarmal, eliptik ve düzensiz galaksilerdir.' },
      { h: 'Samanyolu', p: 'Samanyolu çubuklu sarmal bir galaksidir. Yıldız diskinin çapı yaklaşık 100.000 ışık yılı mertebesindedir; karanlık madde hâlesi görünür diskin çok ötesine uzanır.' },
      { h: 'Biz Neredeyiz?', p: 'Güneş Sistemi galaktik merkezden yaklaşık 26.000 ışık yılı uzaklıkta, diskin Orion Kolu/Orion Çıkıntısı olarak anılan bölgesinde bulunur. Galaksimizin merkezinde Sagittarius A* adlı süper kütleli kara delik vardır.' }
    ],
    takeaway: 'Galaksi, yıldızların rastgele yan yana gelmesi değil; görünür ve görünmeyen maddesiyle kütleçekimsel olarak örgütlenmiş büyük bir kozmik sistemdir.',
    mount: topic18
  },
  {
    ch: 5, no: '20', title: 'Kara Delik Nedir?',
    intro: 'Kara delik, çevresindeki her şeyi uzaktan içine çeken kozmik bir süpürge değildir. Genel görelilik açısından, içinden dışarıya hiçbir nedensel sinyalin ulaşamadığı bir uzay-zaman bölgesidir.',
    blocks: [
      { h: 'Olay Ufku', p: 'Kara deliği tanımlayan temel sınır olay ufkudur. Bu sınırın içinden geleceğe doğru giden hiçbir yol dış evrene ulaşamaz; ışık da buna dahildir.' },
      { h: 'Uzay-Zamanın Eğriliği', p: 'Kara deliğin çevresindeki güçlü kütleçekim alanı uzay-zaman geometrisini değiştirir. Yakından geçen ışığın yolu bu geometri boyunca bükülür.' },
      { h: 'Yığılma Diski Kara Deliğin Parçası Değildir', p: 'Çevrede yeterli madde bulunuyorsa gaz kara deliğin çevresinde dönen sıcak bir yığılma diski oluşturabilir. Bu disk çok parlak olabilir; fakat kara deliğin kendisi değildir.' },
      { h: 'Her Şeyi İçine Çeker mi?', p: 'Hayır. Bir kara deliğin uzağındaki kütleçekim alanı, aynı kütleye sahip başka bir cismin alanıyla büyük ölçüde aynıdır.' },
      { h: 'Güneş Kara Delik Olacak mı?', p: 'Hayır. Güneş\'in kütlesi yıldızsal kütleli bir kara delik oluşturacak kadar büyük değildir. Evriminin sonunda beyaz cüce kalıntısı bırakacaktır.' }
    ],
    takeaway: 'Kara delik, olay ufkuyla sınırlanan ve içinden ışık dahil hiçbir bilginin dışarı ulaşamadığı güçlü biçimde eğrilmiş bir uzay-zaman bölgesidir.',
    mount: topic20
  },
  {
    ch: 5, no: '21', title: 'Işıktan Bilgiye',
    intro: 'Astronomide bir gökcismine ulaşmak çoğu zaman mümkün değildir. Buna rağmen yıldızların sıcaklığını, kimyasal bileşimini, hareketini ve çevrelerindeki görünmeyen cisimleri ölçebiliriz. Çünkü bize ulaşan ışık yalnızca bir görüntü değil, fiziksel bilgi taşıyan bir ölçüm sinyalidir.',
    blocks: [
      { h: 'Renk ve Tayf → Sıcaklık', p: 'Bir yıldızın farklı dalga boylarında ne kadar enerji yaydığı, etkin sıcaklığıyla yakından ilişkilidir. Tayfsal enerji dağılımı ölçülerek yıldızın sıcaklığı hakkında nicel bilgi elde edilir.' },
      { h: 'Tayf Çizgileri → Madde ve Fiziksel Koşullar', p: 'Atom ve iyonlar yalnızca belirli dalga boylarında ışıkla etkileşir. Tayftaki soğurma ve salma çizgileri hangi tür atom ve iyonların bulunduğunu; ayrıntılı modellerle birlikte sıcaklık, yoğunluk ve kimyasal bolluk gibi özellikleri ortaya çıkarabilir.' },
      { h: 'Doppler Kayması → Hareket', p: 'Bir kaynak görüş doğrultusunda bize yaklaşıyor veya bizden uzaklaşıyorsa tayfındaki çizgilerin dalga boyları değişir. Bu Doppler kayması ölçülerek cismin dikine hızı belirlenebilir.' },
      { h: 'Zamanla Değişim → Görünmeyeni Bulmak', p: 'Bir yıldızın parlaklığını sürekli ölçmek değişken yıldızları, tutulmaları ve yıldızın önünden geçen ötegezegenleri ortaya çıkarabilir. Tayf çizgilerinin zamanla düzenli biçimde hareket etmesi de görünmeyen bir yörünge arkadaşının kütleçekimsel etkisini gösterebilir.' }
    ],
    takeaway: 'Modern astronomi, uzaktaki evreni yalnızca görüntülemez; ışığın dalga boyunu, şiddetini ve zaman içindeki değişimini ölçerek gökcisimlerinin fiziksel özelliklerini çıkarır.',
    mount: topic21
  }
];

const CHAPTERS = [
  { n: '01', name: 'GÖKYÜZÜNE BAK', topics: [0, 1, 2, 3] },
  { n: '02', name: 'GÖKYÜZÜNÜN HAREKETİ', topics: [4, 5, 6] },
  { n: '03', name: 'DÜNYA, AY VE GÜNEŞ', topics: [7, 8, 9] },
  { n: '04', name: 'IŞIĞI OKU', topics: [10, 11, 12, 13] },
  { n: '05', name: 'YILDIZLARIN HAYATI', topics: [14, 15] },
  { n: '06', name: 'EVRENİ ANLAMAK', topics: [16, 17, 18, 19, 20] }
];

/* ================================================================== *
 * APP SHELL
 * ================================================================== */
const state = { index: 0, cleanup: null };
const els = {
  info: $('#scene-info'), stage: $('#scene-stage'), chapters: $('#chapters'),
  count: $('#progress-count'), fill: $('#progress-fill'),
  prev: $('#btn-prev'), next: $('#btn-next'),
  overlay: $('#overlay'), overlayList: $('#overlay-list')
};

function buildChapters() {
  els.chapters.innerHTML = '';
  CHAPTERS.forEach((ch, i) => {
    const b = document.createElement('button');
    b.className = 'chapter';
    b.dataset.testid = 'chapter-' + ch.n;
    b.innerHTML = `<span class="cn">${ch.n}</span>${ch.name}`;
    b.addEventListener('click', () => goto(ch.topics[0]));
    els.chapters.appendChild(b);
  });
}

function buildOverlay() {
  els.overlayList.innerHTML = '';
  CHAPTERS.forEach(ch => {
    const g = document.createElement('div'); g.className = 'overlay-group';
    g.innerHTML = `<div class="overlay-group-title"><span class="cn">${ch.n}</span>${ch.name}</div>`;
    ch.topics.forEach(ti => {
      const t = TOPICS[ti];
      const it = document.createElement('div');
      it.className = 'overlay-item';
      it.dataset.idx = ti;
      it.dataset.testid = 'index-item-' + t.no;
      it.innerHTML = `<span class="num">${t.no}</span><span class="name">${t.title}</span>`;
      it.addEventListener('click', () => { goto(ti); closeOverlay(); });
      g.appendChild(it);
    });
    els.overlayList.appendChild(g);
  });
}

function render() {
  if (state.cleanup) { try { state.cleanup(); } catch (e) { } state.cleanup = null; }
  const t = TOPICS[state.index];
  const chap = CHAPTERS[t.ch];

  els.info.className = 'scene-info fx';
  els.info.innerHTML =
    `<div class="kicker"><b>BÖLÜM ${chap.n} — ${chap.name}</b> · KONU ${t.no}</div>
     <h1 class="scene-title">${t.title}</h1>
     <p class="scene-intro">${t.intro}</p>
     <div class="blocks">${t.blocks.map(b => `<div class="block"><h4>${b.h}</h4><p>${b.p}</p></div>`).join('')}</div>
     ${t.unitNote ? `<div class="unit-note">${t.unitNote}</div>` : ''}
     <div class="takeaway"><div class="label">ANA FİKİR</div><p>${t.takeaway}</p></div>`;
  els.info.scrollTop = 0;

  els.stage.className = 'scene-stage fx';
  // restart animation class
  void els.info.offsetWidth;

  state.cleanup = t.mount(els.stage);

  // chapter active
  Array.from(els.chapters.children).forEach((b, i) => b.classList.toggle('active', i === t.ch));
  // progress
  const n = state.index + 1;
  els.count.textContent = String(n).padStart(2, '0') + ' / 21';
  els.fill.style.width = (n / 21 * 100) + '%';
  els.prev.disabled = state.index === 0;
  els.next.disabled = state.index === TOPICS.length - 1;
  // overlay active
  Array.from(els.overlayList.querySelectorAll('.overlay-item'))
    .forEach(it => it.classList.toggle('active', +it.dataset.idx === state.index));
}

function goto(i) {
  const ni = clamp(i, 0, TOPICS.length - 1);
  if (ni === state.index) return;
  state.index = ni;
  render();
}
function nextTopic() { goto(state.index + 1); }
function prevTopic() { goto(state.index - 1); }

function openOverlay() { els.overlay.hidden = false; }
function closeOverlay() { els.overlay.hidden = true; }

/* nav wiring */
els.next.addEventListener('click', nextTopic);
els.prev.addEventListener('click', prevTopic);
$('#btn-index').addEventListener('click', openOverlay);
$('#overlay-close').addEventListener('click', closeOverlay);
els.overlay.addEventListener('click', e => { if (e.target === els.overlay) closeOverlay(); });

document.addEventListener('keydown', e => {
  if (!els.overlay.hidden && e.key === 'Escape') return closeOverlay();
  if (e.key === 'ArrowRight') nextTopic();
  else if (e.key === 'ArrowLeft') prevTopic();
});

// wheel / trackpad navigation with cooldown
let wheelLock = 0;
window.addEventListener('wheel', e => {
  if (!els.overlay.hidden) return;
  const now = Date.now();
  if (now < wheelLock) return;
  if (Math.abs(e.deltaY) < 24 && Math.abs(e.deltaX) < 24) return;
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  const scrollArea = e.target instanceof Element ? e.target.closest('.scene-info, .scene') : null;
  if (scrollArea && scrollArea.scrollHeight > scrollArea.clientHeight + 1) {
    const atTop = scrollArea.scrollTop <= 1;
    const atBottom = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 1;
    if ((d > 0 && !atBottom) || (d < 0 && !atTop)) return;
  }
  if (d > 0) nextTopic(); else prevTopic();
  wheelLock = now + 800;
}, { passive: true });

buildChapters();
buildOverlay();
render();
