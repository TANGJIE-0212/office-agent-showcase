const revealItems = document.querySelectorAll('.cap-inner, .cap-card, .evol-row, .proof-card, .section-heading');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const formatCount = (n) => n.toLocaleString('en-US');

const runCountUp = (el) => {
  const target = parseInt(el.dataset.count, 10);
  if (!Number.isFinite(target)) return;
  if (prefersReducedMotion) {
    el.textContent = formatCount(target);
    return;
  }
  const duration = 1100;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = formatCount(Math.round(target * eased));
    if (p < 1) window.requestAnimationFrame(step);
    else el.textContent = formatCount(target);
  };
  window.requestAnimationFrame(step);
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.cov-stat b[data-count]').forEach(runCountUp);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealItems.forEach((item) => {
  item.classList.add('reveal');
  revealObserver.observe(item);
});

// Typewriter loop in the Office Agent ask box
const typedEl = document.querySelector('.ask-typed');
if (typedEl) {
  const phrases = [
    'Create a Gen Z marketing playbook',
    'Summarize 2025 financials in Excel',
    'Draft a brand refresh deck',
    'Build a creative problem-solving workshop',
    'Ask Office Agent anything'
  ];
  let pi = 0;
  let ci = 0;
  let deleting = false;

  const tick = () => {
    const phrase = phrases[pi];
    if (!deleting) {
      ci += 1;
      typedEl.textContent = phrase.slice(0, ci);
      if (ci === phrase.length) {
        deleting = true;
        return window.setTimeout(tick, 1500);
      }
      return window.setTimeout(tick, 60 + Math.random() * 50);
    }
    ci -= 1;
    typedEl.textContent = phrase.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      return window.setTimeout(tick, 320);
    }
    return window.setTimeout(tick, 28);
  };
  tick();
}

// Auto-cycle the active tab
const tabs = Array.from(document.querySelectorAll('.app-tabs .tab'));
if (tabs.length > 0) {
  let activeTab = tabs.findIndex((t) => t.classList.contains('active'));
  if (activeTab < 0) activeTab = 0;
  window.setInterval(() => {
    tabs[activeTab].classList.remove('active');
    activeTab = (activeTab + 1) % tabs.length;
    tabs[activeTab].classList.add('active');
  }, 2600);
}

// Rotate a spotlight highlight across the template cards
const tpls = Array.from(document.querySelectorAll('.app-grid .tpl'));
if (tpls.length > 0) {
  let spot = 0;
  window.setInterval(() => {
    tpls.forEach((t) => t.classList.remove('spotlight'));
    tpls[spot].classList.add('spotlight');
    spot = (spot + 1) % tpls.length;
  }, 1700);
}

// Taste coverflow showcase
const tasteFlow = document.querySelector('.taste-flow');
if (tasteFlow) {
  const slides = Array.from(tasteFlow.querySelectorAll('.tslide'));
  const dots = Array.from(document.querySelectorAll('.taste-dot'));
  const n = slides.length;
  let active = 0;
  let timer = null;

  const layout = () => {
    slides.forEach((slide, i) => {
      let r = i - active;
      if (r > n / 2) r -= n;
      if (r < -n / 2) r += n;
      const abs = Math.abs(r);
      const sign = Math.sign(r);
      const tx = r * 60;
      const tz = -abs * 220;
      const ry = -sign * 42;
      const sc = 1 - abs * 0.16;
      const hidden = abs >= 2;
      slide.style.transform =
        `translate(-50%, -50%) translateX(${tx}%) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
      slide.style.opacity = hidden ? '0' : String(1 - abs * 0.18);
      slide.style.zIndex = String(100 - abs);
      slide.style.pointerEvents = hidden ? 'none' : 'auto';
      slide.classList.toggle('is-active', r === 0);
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  };

  const go = (i) => {
    active = (i + n) % n;
    layout();
  };

  const start = () => {
    if (prefersReducedMotion || timer) return;
    // Kick off the first rotation quickly, then settle into the steady cadence.
    timer = window.setTimeout(() => {
      go(active + 1);
      timer = window.setInterval(() => go(active + 1), 3800);
    }, 1100);
  };

  const restart = () => {
    if (timer) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
      timer = null;
    }
    start();
  };

  slides.forEach((slide, i) => slide.addEventListener('click', () => { go(i); restart(); }));
  dots.forEach((dot, i) => dot.addEventListener('click', () => { go(i); restart(); }));
  tasteFlow.addEventListener('mouseenter', () => {
    if (timer) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
      timer = null;
    }
  });
  tasteFlow.addEventListener('mouseleave', restart);

  layout();
  // Only begin auto-rotating once the gallery scrolls into view, so users notice it.
  if (!prefersReducedMotion) {
    const startObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
          startObserver.disconnect();
        }
      });
    }, { threshold: 0.35 });
    startObserver.observe(tasteFlow);
  }
}

const evoChart = document.getElementById('evoChart');
if (evoChart) {
  const plot = evoChart.querySelector('.evo-chart-plot');
  const ROUNDS = 58;
  const W = 1000;
  const H = 360;
  const padL = 44;
  const padR = 14;
  const padT = 14;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMin = 6.4;
  const yMax = 10;

  const x = (i) => padL + (i / (ROUNDS - 1)) * plotW;
  const y = (s) => padT + ((yMax - s) / (yMax - yMin)) * plotH;

  const mulberry32 = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const logistic = (i) => 1 / (1 + Math.exp(-0.16 * (i - 24)));
  const l0 = logistic(0);
  const l1 = logistic(ROUNDS - 1);
  const base = (i, s, e) => s + (e - s) * ((logistic(i) - l0) / (l1 - l0));

  const series = [
    { cls: 'evo-line--1', color: '#49d7ff', s: 7.6, e: 9.5, amp: 0.34, seed: 11 },
    { cls: 'evo-line--2', color: '#ff6f9f', s: 6.7, e: 9.4, amp: 0.4, seed: 27 },
    { cls: 'evo-line--3', color: '#ffc15a', s: 7.2, e: 9.5, amp: 0.36, seed: 43 },
    { cls: 'evo-line--4', color: '#5ee6a8', s: 7.4, e: 9.3, amp: 0.32, seed: 61 }
  ];

  const clamp = (v) => Math.max(6.5, Math.min(9.9, v));
  const buildPath = (vals) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

  let lines = '';
  series.forEach((sr) => {
    const rnd = mulberry32(sr.seed);
    const vals = [];
    for (let i = 0; i < ROUNDS; i++) {
      const t = i / (ROUNDS - 1);
      const noise = (rnd() * 2 - 1) * sr.amp * (1 - 0.45 * t);
      vals.push(clamp(base(i, sr.s, sr.e) + noise));
    }
    lines += `<path class="evo-line ${sr.cls}" d="${buildPath(vals)}" stroke="${sr.color}" />`;
  });

  // Final score: smooth aggregate with minimal noise.
  const rndF = mulberry32(7);
  const finalVals = [];
  for (let i = 0; i < ROUNDS; i++) {
    const noise = (rndF() * 2 - 1) * 0.05;
    finalVals.push(clamp(base(i, 7.2, 9.55) + noise));
  }
  const finalPath = `<path class="evo-final" pathLength="1" d="${buildPath(finalVals)}" />`;

  // Gridlines + Y labels.
  let grid = '';
  [7, 8, 9, 10].forEach((s) => {
    grid += `<line class="evo-grid-line" x1="${padL}" y1="${y(s).toFixed(1)}" x2="${W - padR}" y2="${y(s).toFixed(1)}" />`;
    grid += `<text class="evo-axis" x="${padL - 8}" y="${(y(s) + 4).toFixed(1)}" text-anchor="end">${s}</text>`;
  });
  // X labels.
  let xlabels = '';
  [10, 20, 30, 40, 50].forEach((r) => {
    xlabels += `<text class="evo-axis" x="${x(r - 1).toFixed(1)}" y="${H - 8}" text-anchor="middle">${r}</text>`;
  });
  xlabels += `<text class="evo-axis" x="${(padL + plotW / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" opacity="0"></text>`;

  // Validation dots on the final line.
  let dotsSvg = '';
  [30, 50].forEach((i) => {
    dotsSvg += `<circle class="evo-dot" cx="${x(i).toFixed(1)}" cy="${y(finalVals[i]).toFixed(1)}" r="5" />`;
  });

  plot.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Score progression across 58 rounds of auto-evolution">` +
    grid + xlabels + lines + finalPath + dotsSvg +
    `</svg>`;

  const drawObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        evoChart.classList.add('is-drawn');
        drawObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  drawObserver.observe(evoChart);
}

// Toast for links that don't have a landing page yet.
(() => {
  let toastEl = null;
  let hideTimer = null;

  const showToast = (msg) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.innerHTML = '<span class="toast-dot" aria-hidden="true"></span><span class="toast-msg"></span>';
      document.body.appendChild(toastEl);
    }
    toastEl.querySelector('.toast-msg').textContent = msg;
    // Force reflow so re-triggering restarts the transition.
    void toastEl.offsetWidth;
    toastEl.classList.add('is-on');
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => toastEl.classList.remove('is-on'), 2400);
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === null || href === '' || href === '#') {
      e.preventDefault();
      showToast('Landing Page 准备中');
    }
  });
})();

// Keep the GDPVal stat counters replaying so the section stays lively.
(() => {
  if (prefersReducedMotion) return;
  const stats = Array.from(document.querySelectorAll('.cov-stat b[data-count]'));
  if (!stats.length) return;
  window.setInterval(() => stats.forEach(runCountUp), 3600);
})();


