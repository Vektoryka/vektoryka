const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('vek-theme', next);
  });
}

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.querySelectorAll('[data-tel]').forEach(el => {
    el.href = 'tel:' + el.dataset.tel;
  });
}

const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

function closeNav() {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('scroll-locked');
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    document.body.classList.toggle('scroll-locked', open);
  });
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
}

const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
if (navLinks.length) {
  const idToLink = new Map([...navLinks].map(a => [a.getAttribute('href').slice(1), a]));
  let activeLink = null;

  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (activeLink) activeLink.classList.remove('is-active');
        activeLink = idToLink.get(entry.target.id) ?? null;
        if (activeLink) activeLink.classList.add('is-active');
      } else if (idToLink.get(entry.target.id) === activeLink) {
        if (activeLink) activeLink.classList.remove('is-active');
        activeLink = null;
      }
    });
  }, { rootMargin: '-72px 0px -55% 0px', threshold: 0 });

  document.querySelectorAll('section[id], footer[id]').forEach(s => spy.observe(s));
}

document.querySelectorAll('.portfolio-grid .p-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.06}s`;
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const symbolGroup = document.getElementById('symbolGroup');
document.querySelectorAll('[name="symbol"]').forEach(r => {
  r.addEventListener('change', () => {
    if (symbolGroup) symbolGroup.classList.toggle('visible', r.value === 'tak');
  });
});
window.addEventListener('pageshow', () => {
  const checked = document.querySelector('[name="symbol"]:checked');
  if (symbolGroup) symbolGroup.classList.toggle('visible', checked?.value === 'tak');
});

const form        = document.getElementById('analizaForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const originalLabel = submitBtn?.textContent;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wysyłanie…'; }

    try {
      const params = new URLSearchParams();
      for (const [key, value] of new FormData(form)) {
        if (!(value instanceof File)) params.append(key, value);
      }
      const res = await fetch(form.action, {
        method: 'POST',
        body: params,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        if (submitBtn) submitBtn.disabled = false;
        form.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('server');
      }
    } catch (err) {
      console.error('Form submit failed:', err);
      alert('Coś poszło nie tak. Zadzwoń: +48 778 730 197');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
    }
  });
}

function validateForm() {
  let valid = true;
  ['marka', 'opis', 'nie_chce'].forEach(id => {
    const el  = document.getElementById(id);
    const err = document.getElementById(`${id}-err`);
    if (!el) return;
    const empty = !el.value.trim();
    el.classList.toggle('invalid', empty);
    if (err) err.classList.toggle('show', empty);
    if (empty) valid = false;
  });
  ['klimat', 'styl', 'kolory', 'font', 'symbol'].forEach(name => {
    const checked = document.querySelector(`[name="${name}"]:checked`);
    const err = document.getElementById(`${name}-err`);
    if (err) err.classList.toggle('show', !checked);
    if (!checked) valid = false;
  });
  if (!valid) {
    const firstErr = document.querySelector('.f-error.show');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return valid;
}

const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

if (lightbox && lightboxImg) {
  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    document.body.classList.add('scroll-locked');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('scroll-locked');
    lightboxImg.src = '';
  }

  function openCard(card) {
    const mobile = window.matchMedia('(max-width: 767.98px)').matches;
    const src = mobile ? card.dataset.shotMobile : card.dataset.shotDesktop;
    if (!src) return;
    const title = card.dataset.title || 'Realizacja';
    openLightbox(src, 'Identyfikacja wizualna — ' + title);
  }
  document.querySelectorAll('.p-card').forEach(card => {
    card.addEventListener('click', () => openCard(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(card); }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
  });

  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const IMG_W = 2048, IMG_H = 1068;
  const LINEW = 15;
  const TAU = Math.PI * 2;

  const NODE = {
    C0: [1509, 404, 35], C1: [1302, 429, 28], C2: [1258, 821, 26], C3: [1452, 828, 30],
    C4: [1693, 694, 26], C6: [1372, 627, 35], C5: [1641, 308, 30],
  };
  const EDGES = [['C6', 'C0'], ['C6', 'C1'], ['C6', 'C2'], ['C6', 'C3'], ['C0', 'C4'], ['C3', 'C5']];
  const keys = Object.keys(NODE);
  const GROUP = { C0: 'navy', C1: 'blue', C2: 'navy', C3: 'blue', C4: 'navy', C5: 'blue', C6: 'navy' };

  function palette() {
    const rgb = document.documentElement.dataset.theme === 'light'
      ? { navy: '15,27,42', blue: '65,91,120' }
      : { navy: '255,255,255', blue: '255,255,255' };
    const style = g => `rgb(${rgb[g]})`;
    return {
      dot: Object.fromEntries(keys.map(k => [k, style(GROUP[k])])),
      edge: EDGES.map(([, b]) => style(GROUP[b])),
    };
  }
  let C = palette();

  const off = {}; for (const k of keys) off[k] = { tx: 0, ty: 0 };
  let scale = 1, offX = 0, offY = 0, Wc = 0, Hc = 0, rafId = null, elapsed = 0, lastTs = 0, cycleIdx = -1;
  const CYCLE = 5.5;
  const AMP = [6, 12];

  function resize() {
    Wc = heroCanvas.offsetWidth || window.innerWidth;
    Hc = heroCanvas.offsetHeight || window.innerHeight;
    heroCanvas.width = Math.round(Wc * DPR);
    heroCanvas.height = Math.round(Hc * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    scale = Math.max(Wc / IMG_W, Hc / IMG_H);
    offX = (Wc - IMG_W * scale) / 2;
    offY = (Hc - IMG_H * scale) / 2;
  }
  const smooth = t => t * t * (3 - 2 * t);
  function pulse(u) {
    if (u < 0.30) return smooth(u / 0.30);
    if (u < 0.46) return 1;
    if (u < 0.80) return 1 - smooth((u - 0.46) / 0.34);
    return 0;
  }
  function reseed() {
    for (const k of keys) {
      const a = Math.random() * TAU;
      const m = AMP[0] + Math.random() * (AMP[1] - AMP[0]);
      off[k].tx = Math.cos(a) * m; off[k].ty = Math.sin(a) * m;
    }
  }

  function render(t) {
    const ci = Math.floor(t / CYCLE);
    if (ci !== cycleIdx) { cycleIdx = ci; reseed(); }
    const pu = pulse((t % CYCLE) / CYCLE);
    const pos = {};
    for (const k of keys) {
      const [ix, iy] = NODE[k];
      pos[k] = [(ix + off[k].tx * pu) * scale + offX, (iy + off[k].ty * pu) * scale + offY];
    }
    ctx.clearRect(0, 0, Wc, Hc);
    ctx.lineWidth = LINEW * scale; ctx.lineCap = 'round';
    EDGES.forEach(([a, b], i) => {
      ctx.strokeStyle = C.edge[i];
      ctx.beginPath(); ctx.moveTo(pos[a][0], pos[a][1]); ctx.lineTo(pos[b][0], pos[b][1]); ctx.stroke();
    });
    for (const k of keys) {
      ctx.fillStyle = C.dot[k];
      ctx.beginPath(); ctx.arc(pos[k][0], pos[k][1], NODE[k][2] * scale, 0, TAU); ctx.fill();
    }
  }

  function frame(ts) {
    if (lastTs) elapsed += Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    render(elapsed);
    rafId = requestAnimationFrame(frame);
  }
  function start() { if (!rafId && !reduce) { lastTs = 0; rafId = requestAnimationFrame(frame); } }
  function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  resize();
  if (reduce) render(0); else start();

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { resize(); if (reduce) render(0); }, 150); });
  new MutationObserver(() => { C = palette(); if (reduce) render(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
}
