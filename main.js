(() => {
  'use strict';
  const SITES = window.EYEWASH_SITES || [];
  const CATS = [
    ['web', '网页灵感', 'Ring'], ['product', '产品界面', 'Fan'], ['motion', '动效交互', 'Roll'],
    ['visual', '视觉素材', 'Reveal'], ['brand', '品牌排版', 'Grid'], ['sound', '声音素材', 'Wave'],
    ['ai', 'AI 工作流', 'Spiral'], ['ui', '组件图标', 'Carousel'], ['community', '资源社区', 'Stack'], ['space', '空间设计', 'Depth']
  ];
  const GNAME = Object.fromEntries([['pick', '精选'], ...CATS.map(c => [c[0], c[1]])]);
  const byId = new Map(SITES.map(s => [s.id, s]));
  const PICKS = SITES.filter(s => s.groups.includes('pick'));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const wrapDeg = d => ((d % 360) + 540) % 360 - 180;
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const D = 180 / Math.PI;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const shuffled = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const thumb = id => `assets/c/${id}.webp`;
  const shot = id => `assets/h/${id}.webp`;
  const tall = id => `assets/img/${id}-tall.webp`;

  function makeCard(s, cls, interactive, eager) {
    const el = document.createElement(interactive ? 'button' : 'div');
    el.className = 'card ' + cls;
    if (interactive) { el.type = 'button'; el.dataset.id = s.id; el.setAttribute('aria-label', `${s.name}：${s.line}`); el.title = s.name; }
    else el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<img src="${thumb(s.id)}" alt="" ${eager ? '' : 'loading="lazy"'} decoding="async" draggable="false">`;
    return el;
  }

  /* ---------- state ---------- */
  const S = { vw: innerWidth, vh: innerHeight, sy: scrollY, ty: scrollY, vel: 0, t: 0, mx: 0, my: 0, smx: 0, smy: 0, W: {} };
  const sec = { hero: $('#top'), ring: $('#ring'), tilt: $('#tilt'), idx: $('#index'), cut: $('#cut'), lib: $('#library') };
  const box = {};
  const prog = k => clamp((S.sy - box[k].top) / Math.max(1, box[k].h - S.vh), 0, 1);
  const near = k => S.sy + S.vh * 1.15 > box[k].top && S.sy - S.vh * .15 < box[k].top + box[k].h;
  const root = document.documentElement.style;

  function measure() {
    S.vw = innerWidth; S.vh = innerHeight;
    for (const k in sec) { const r = sec[k].getBoundingClientRect(); box[k] = { top: r.top + scrollY, h: r.height }; }
    const m = Math.min(S.vw, S.vh), mob = S.vw < 900;
    S.W.cw = clamp(S.vw * .1, 92, 180);
    S.W.rw = clamp(mob ? S.vw * .36 : S.vw * .15, 130, 250);
    S.W.iw = clamp(mob ? m * .3 : Math.min(S.vw * .52, S.vh) * .26, 110, 230);
    S.W.tw = clamp(S.vw * .13, 130, 220);
    S.W.sw = clamp(m * .27, 130, 250);
    root.setProperty('--cw', S.W.cw + 'px'); root.setProperty('--rw', S.W.rw + 'px'); root.setProperty('--iw', S.W.iw + 'px');
    root.setProperty('--tw', S.W.tw + 'px'); root.setProperty('--sw', S.W.sw + 'px');
    itemH = idxLis[0] ? idxLis[0].offsetHeight : 100;
    cutW = cutT.scrollWidth;
  }

  /* ---------- hero: flying field ---------- */
  const field = $('#field'), fieldIn = $('#fieldIn'), heroT = $('#heroT'), heroSub = $('#heroSub'), hint = $('#hint');
  const l1 = $('.l1', heroT), l2 = $('.l2', heroT);
  document.querySelectorAll('.split').forEach(el => {
    el.innerHTML = el.textContent.split(' ').map(w => `<span class="w"><span>${esc(w)}</span></span>`).join(' ');
  });
  document.querySelectorAll('.w > span').forEach((el, i) => el.style.setProperty('--d', (.08 + i * .07) + 's'));
  const FN = innerWidth < 700 ? 34 : 64;
  const pool = shuffled(SITES);
  const flyers = [];
  for (let i = 0; i < FN; i++) {
    const el = makeCard(pool[i % pool.length], 'fc', false, true);
    let x = rnd() * 2 - 1, y = rnd() * 2 - 1;
    if (Math.abs(x) < .3 && Math.abs(y) < .4) x += x < 0 ? -.4 : .4;
    flyers.push({ el, x, y, z0: i / FN + rnd() * .02, r: (rnd() - .5) * 12, sp: .85 + rnd() * .3 });
    fieldIn.appendChild(el);
  }
  function heroUpdate(p) {
    const span = 4400, travel = p * 4600 + (RM ? 0 : S.t * 60) + intro * 1400;
    const exit = 1 - ss(.78, 1, p);
    for (const f of flyers) {
      const z = ((f.z0 * span + travel * f.sp) % span) - 3800;
      const o = ss(-3800, -2700, z) * (1 - ss(180, 560, z)) * exit * introO;
      f.el.style.opacity = o.toFixed(3);
      f.el.style.transform = `translate3d(${(f.x * S.vw * .62).toFixed(1)}px,${(f.y * S.vh * .58).toFixed(1)}px,${z.toFixed(1)}px) rotate(${f.r}deg)`;
    }
    fieldIn.style.transform = `rotateY(${(S.smx * 6).toFixed(2)}deg) rotateX(${(-S.smy * 5).toFixed(2)}deg)`;
    const b = RM ? 0 : Math.min(5, Math.abs(S.vel) * .03);
    field.style.filter = b > .35 ? `blur(${b.toFixed(2)}px)` : '';
    l1.style.transform = `translate3d(${(-p * 40).toFixed(2)}vw,0,0)`;
    l2.style.transform = `translate3d(${(p * 40).toFixed(2)}vw,0,0)`;
    heroT.style.opacity = (1 - ss(.3, .62, p)).toFixed(3);
    heroSub.style.visibility = hint.style.visibility = p > .3 ? 'hidden' : '';
    if (ready) { heroSub.style.opacity = (1 - ss(.04, .2, p)).toFixed(3); hint.style.opacity = heroSub.style.opacity; }
  }

  /* ---------- ring of picks ---------- */
  const ringRot = $('#ringRot'), ringHead = $('#ringHead');
  const rcs = PICKS.map(s => { const el = makeCard(s, 'rc', true); ringRot.appendChild(el); return el; });
  $('#pickN').textContent = PICKS.length;
  let ringFront = -1;
  const rcT = $('.rc-t'), rcN = $('#rcN'), rcName = $('#rcName'), rcLine = $('#rcLine'), rcGo = $('#rcGo'), rcMore = $('#rcMore');
  function setCap(i) {
    const s = PICKS[i];
    rcT.classList.add('swap');
    rcN.textContent = `${pad(i + 1)} / ${pad(PICKS.length)}`;
    rcName.textContent = s.name; rcLine.textContent = s.line;
    rcGo.href = s.url; rcGo.setAttribute('aria-label', `打开 ${s.domain}`); rcMore.dataset.id = s.id;
    requestAnimationFrame(() => requestAnimationFrame(() => rcT.classList.remove('swap')));
  }
  function ringUpdate(p) {
    const n = rcs.length, W = S.W.rw, R = W * 1.2 * n / (2 * Math.PI);
    const as = ss(0, .16, p), spin = p * 430 - 20;
    const tilt = lerp(-16, 9, ss(.04, .7, p));
    const sc = lerp(.5, 1, as) * lerp(1, .82, ss(.82, 1, p));
    ringRot.style.transform = `translateZ(${(-R * .45).toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) rotateY(${(-spin).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    let best = 0, bf = -2;
    rcs.forEach((el, i) => {
      const a = i * 360 / n, f = Math.cos((a - spin) / D);
      if (f > bf) { bf = f; best = i; }
      el.style.transform = `rotateY(${a.toFixed(2)}deg) translateZ(${(R * (.15 + .85 * as)).toFixed(1)}px)`;
      el.style.opacity = (as * (.22 + .78 * (f + 1) / 2)).toFixed(3);
    });
    if (best !== ringFront) { ringFront = best; setCap(best); }
    ringHead.style.opacity = (ss(0, .08, p) * (1 - ss(.86, 1, p))).toFixed(3);
  }

  /* ---------- tilted grid ---------- */
  const plane = $('#tiltPlane'), tiltCopy = $('#tiltCopy');
  const COLS = innerWidth < 700 ? 5 : 7;
  const tcols = [];
  const tpool = shuffled(SITES);
  for (let j = 0; j < COLS; j++) { const c = document.createElement('div'); c.className = 'tcol'; plane.appendChild(c); tcols.push(c); }
  [...tpool, ...tpool.slice(0, COLS * 9 - tpool.length)].forEach((s, i) => {
    const el = makeCard(s, 'tc', true); tcols[i % COLS].appendChild(el);
  });
  function tiltUpdate(p) {
    tcols.forEach((c, j) => {
      const d = j % 2 ? 1 : -1;
      c.style.transform = `translate3d(0,${(d * (p - .5) * 1100 + (j % 2 ? -300 : 0)).toFixed(1)}px,0)`;
    });
    const o = ss(.04, .22, p) * (1 - ss(.86, 1, p));
    tiltCopy.style.opacity = o.toFixed(3);
    tiltCopy.style.translate = `0 ${((1 - ss(.04, .22, p)) * 30).toFixed(1)}px`;
  }

  /* ---------- index with morphing layouts ---------- */
  const idxList = $('#idxList'), idxCam = $('#idxCam'), idxMeta = $('#idxMeta'), idxTicks = $('#idxTicks');
  const icards = SITES.map(s => { const el = makeCard(s, 'ic', true); el.style.visibility = 'hidden'; idxCam.appendChild(el); return { el, s, vis: false, c: { x: 0, y: 0, z: -1600, rx: 0, ry: 0, rz: 0, s: .5, o: 0 } }; });
  const members = CATS.map(([g]) => icards.filter(c => c.s.groups.includes(g)));
  CATS.forEach(([g, zh], i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="ar" aria-hidden="true">→</span><span>${zh}</span><sup>${pad(members[i].length)}</sup>`;
    li.addEventListener('click', () => scrollToCat(i));
    idxList.appendChild(li);
  });
  const idxLis = [...idxList.children];
  for (let i = 0; i < 60; i++) idxTicks.appendChild(document.createElement('i'));
  const ticks = [...idxTicks.children];
  let itemH = 100, idxActive = -1, cutW = 0;
  function scrollToCat(i) {
    const seg = (box.idx.h - S.vh) / CATS.length;
    scrollTo({ top: box.idx.top + seg * (i + .3), behavior: RM ? 'auto' : 'smooth' });
  }
  function setMeta(c) {
    const [g, zh, lay] = CATS[c], m = members[c];
    idxMeta.classList.add('swap');
    idxMeta.innerHTML = `<span class="mono">${pad(c + 1)} / ${pad(CATS.length)} · ${lay}</span>
      <p class="nm">${m.map(x => esc(x.s.name)).join('、')}</p>
      <button class="btn dark" type="button" data-cat="${g}">看这 ${m.length} 个${esc(zh)}网站 <span aria-hidden="true">→</span></button>`;
    requestAnimationFrame(() => requestAnimationFrame(() => idxMeta.classList.remove('swap')));
  }
  idxMeta.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { setFilter(b.dataset.cat, true); } });

  const LAY = {
    Ring(i, n, t, W) {
      const a = i / n * Math.PI * 2 + t * Math.PI * 1.4, R = W * 1.95, c = Math.cos(a);
      return { x: Math.sin(a) * R, y: -c * R * .2, z: c * R - R * .9, rx: -6, ry: a * D, rz: 0, s: 1, o: .3 + .7 * (c + 1) / 2 };
    },
    Fan(i, n, t, W) {
      const k = i - (n - 1) / 2, L = W * 2.8, ang = (k * 13 + Math.sin(t * Math.PI * 2) * 5) / D;
      return { x: Math.sin(ang) * L, y: L - Math.cos(ang) * L - W * .1 + Math.abs(k) * 4, z: -Math.abs(k) * 20 + i, rx: 0, ry: 0, rz: ang * D, s: 1.15, o: 1 };
    },
    Roll(i, n, t, W) {
      const a = i / n * Math.PI * 2 - t * Math.PI * 2, R = W * 1.55, c = Math.cos(a);
      const f = (c + 1) / 2;
      return { x: 0, y: Math.sin(a) * R * .9, z: c * R - R, rx: -a * D, ry: -8, rz: 0, s: 1, o: .06 + .94 * f * f };
    },
    Reveal(i, n, t, W) {
      const cur = Math.min(n - 1, Math.floor(t * n)), k = (i - cur + n) % n;
      return { x: k * W * .42, y: -k * W * .26, z: -k * W * .95, rx: 0, ry: -k * 10, rz: k * 5, s: k === 0 ? 1.4 : 1.1, o: k === 0 ? 1 : .75 - k * .15 };
    },
    Grid(i, n, t, W) {
      const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
      const gx = (i % cols - (cols - 1) / 2) * W * 1.12;
      const gy = (Math.floor(i / cols) - (rows - 1) / 2) * W * 1.48 + (.5 - t) * W * 1.4 + ((i % cols) % 2 ? W * .4 : 0);
      const th = 48 / D, ph = -30 / D;
      const y1 = gy * Math.cos(th), z1 = gy * Math.sin(th);
      return { x: gx * Math.cos(ph) - y1 * Math.sin(ph), y: gx * Math.sin(ph) + y1 * Math.cos(ph), z: z1 - W * .2, rx: 48, ry: 0, rz: -30, s: 1, o: 1 };
    },
    Wave(i, n, t, W) {
      const k = i - (n - 1) / 2, ph = i * .95 + t * Math.PI * 3;
      return { x: k * W * .8, y: Math.sin(ph) * W * .38, z: Math.cos(ph) * W * .5 - W * .3, rx: 0, ry: k * -7, rz: Math.cos(ph) * 7, s: 1, o: 1 };
    },
    Spiral(i, n, t, W) {
      const a = i * .95 + t * Math.PI * 2.2, r = W * 1.35, s = Math.sin(a);
      return { x: Math.cos(a) * r, y: (i - (n - 1) / 2) * W * .44, z: s * r - r * .7, rx: 0, ry: -a * D + 90, rz: 0, s: .95, o: .3 + .7 * (s + 1) / 2 };
    },
    Carousel(i, n, t, W) {
      const k = i - t * (n - 1), ak = Math.abs(k);
      return { x: k * W * .78, y: 0, z: -ak * W * .85 + (ak < .5 ? W * .25 : 0), rx: 0, ry: clamp(-k * 42, -65, 65), rz: 0, s: 1.1, o: 1 - ss(2.4, 3.4, ak) };
    },
    Stack(i, n, t, W) {
      const cur = Math.floor(t * n * 1.6) % n, k = (i - cur + n) % n;
      return { x: k * W * .14, y: -k * W * .12, z: -k * W * .4, rx: 0, ry: -6, rz: (k % 2 ? -1 : 1) * k * 4, s: 1.25, o: 1 - k * .14 };
    },
    Depth(i, n, t, W) {
      const g = i ? 1 : -1;
      return { x: g * W * .78, y: g * W * .12 * Math.sin(t * Math.PI), z: Math.sin(t * Math.PI * 2 + i * Math.PI) * W * .55, rx: 6, ry: -g * (20 - t * 14), rz: g * 2, s: 1.35, o: 1 };
    }
  };
  function idxUpdate(p, dt) {
    const n = CATS.length, f = clamp(p * n, 0, n - 1e-4), c = Math.floor(f), t = f - c;
    const listF = c + ss(.8, 1, t);
    idxList.style.transform = `translate3d(0,${(-(listF + .5) * itemH).toFixed(1)}px,0)`;
    if (c !== idxActive) { idxActive = c; idxLis.forEach((li, i) => li.classList.toggle('on', i === c)); setMeta(c); }
    const on = Math.round(p * (ticks.length - 1));
    ticks.forEach((tk, i) => tk.classList.toggle('on', i === on));
    const W = S.W.iw, lay = LAY[CATS[c][2]], m = members[c], k = RM ? 1 : 1 - Math.pow(.88, dt * 60);
    const tgt = new Map();
    m.forEach((card, i) => tgt.set(card, lay(i, m.length, t, W)));
    for (const card of icards) {
      const C = card.c;
      const T = tgt.get(card) || { x: C.x * 1.02, y: C.y, z: -W * 6, rx: C.rx, ry: C.ry, rz: C.rz, s: .5, o: 0 };
      C.x = lerp(C.x, T.x, k); C.y = lerp(C.y, T.y, k); C.z = lerp(C.z, T.z, k); C.s = lerp(C.s, T.s, k); C.o = lerp(C.o, T.o, k);
      C.rx += wrapDeg(T.rx - C.rx) * k; C.ry += wrapDeg(T.ry - C.ry) * k; C.rz += wrapDeg(T.rz - C.rz) * k;
      if (C.o < .02 && !tgt.has(card)) { if (card.vis) { card.el.style.visibility = 'hidden'; card.vis = false; } continue; }
      if (!card.vis) { card.el.style.visibility = ''; card.vis = true; }
      card.el.style.opacity = C.o.toFixed(3);
      card.el.style.transform = `translate3d(${C.x.toFixed(1)}px,${C.y.toFixed(1)}px,${C.z.toFixed(1)}px) rotateZ(${C.rz.toFixed(2)}deg) rotateY(${C.ry.toFixed(2)}deg) rotateX(${C.rx.toFixed(2)}deg) scale(${C.s.toFixed(3)})`;
    }
  }

  /* ---------- shortcut text ---------- */
  const cutT = $('#cutT'), cutStack = $('#cutStack');
  const CUT = ['godly', 'dark', 'minimal', 'lapa', 'typewolf', 'loadmore', 'spells', 'deck', 'searchsystem', 'vjournal', 'mobbin'].map(id => byId.get(id)).filter(Boolean);
  const scs = CUT.map(s => { const el = makeCard(s, 'sc', false); cutStack.appendChild(el); return el; });
  function cutUpdate(p) {
    const x = lerp(S.vw * 1.02, -cutW - S.vw * .02, p);
    cutT.style.transform = `translate3d(${x.toFixed(1)}px,-50%,0)`;
    const v = RM ? 0 : clamp(S.vel * .14, -16, 16);
    cutT.style.textShadow = Math.abs(v) > .5 ? `${v.toFixed(1)}px 0 rgba(255,40,90,.55),${(-v).toFixed(1)}px 0 rgba(0,190,255,.55)` : 'none';
    const n = scs.length, sp = ss(.06, .45, p) * (1 - .55 * ss(.8, 1, p)), W = S.W.sw;
    scs.forEach((el, i) => {
      const k = i - (n - 1) / 2, wob = RM ? 0 : Math.sin(S.t * .9 + i) * 1.4;
      el.style.transform = `translate3d(${(k * W * .3 * sp).toFixed(1)}px,${(k * k * 2.2 * sp).toFixed(1)}px,${i * 2}px) rotateZ(${(k * 6.5 * sp + wob * sp).toFixed(2)}deg) rotateY(${(-16 * sp).toFixed(2)}deg)`;
    });
  }

  /* ---------- library ---------- */
  const libPanel = $('#libPanel'), grid = $('#grid'), chips = $('#chips'), q = $('#q'), empty = $('#empty'), libCount = $('#libCount');
  const hay = new Map(SITES.map(s => [s.id, [s.name, s.domain, s.tag, s.line, s.desc, s.mood, s.use, s.kw, ...s.groups.map(g => GNAME[g] || '')].join(' ').toLowerCase()]));
  const F = { g: 'all', q: '' };
  [['all', '全部', SITES.length], ['pick', '精选', PICKS.length], ...CATS.map((c, i) => [c[0], c[1], members[i].length])].forEach(([g, zh, n]) => {
    const b = document.createElement('button');
    b.className = 'chip'; b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.g = g;
    b.setAttribute('aria-selected', g === 'all'); b.innerHTML = `${zh}<sup>${n}</sup>`;
    chips.appendChild(b);
  });
  const gcs = SITES.map((s, i) => {
    const a = document.createElement('article');
    a.className = 'gc'; a.dataset.id = s.id;
    a.innerHTML = `<button class="shot" type="button" data-id="${s.id}" aria-label="查看 ${esc(s.name)} 详情">${s.groups.includes('pick') ? '<span class="pk mono">精选</span>' : ''}<img src="${shot(s.id)}" alt="${esc(s.name)} 网站截图" loading="lazy" decoding="async"><span class="tall"></span></button>
      <div><div class="gc-t"><b>${esc(s.name)}</b><span class="mono">${esc(s.tag)}</span></div><p>${esc(s.line)}</p>
      <div class="gc-f"><span class="mono">${esc(s.domain)}</span><a href="${s.url}" target="_blank" rel="noopener">打开 ↗</a></div></div>`;
    grid.appendChild(a);
    return a;
  });
  grid.addEventListener('pointerover', e => {
    const sh = e.target.closest('.shot'); if (!sh) return;
    const t = $('.tall', sh); if (t.dataset.l) return;
    t.dataset.l = 1; const img = new Image(); img.onload = () => { t.style.backgroundImage = `url(${img.src})`; t.classList.add('ok'); }; img.src = tall(sh.dataset.id);
  });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' }) : null;
  gcs.forEach(g => io ? io.observe(g) : g.classList.add('in'));
  let visible = SITES.slice();
  function applyFilter() {
    const terms = F.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    visible = [];
    SITES.forEach((s, i) => {
      const ok = (F.g === 'all' || s.groups.includes(F.g)) && terms.every(w => hay.get(s.id).includes(w));
      gcs[i].hidden = !ok; if (ok) { visible.push(s); gcs[i].classList.add('in'); }
    });
    libCount.textContent = visible.length; empty.hidden = visible.length > 0;
    chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-selected', c.dataset.g === F.g));
  }
  function setFilter(g, jump) {
    F.g = g; applyFilter();
    if (jump) scrollTo({ top: box.lib.top + 10, behavior: RM ? 'auto' : 'smooth' });
  }
  chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) setFilter(c.dataset.g); });
  q.addEventListener('input', () => { F.q = q.value; applyFilter(); });
  $('#clearQ').addEventListener('click', () => { q.value = ''; F.q = ''; setFilter('all'); q.focus(); });
  function libUpdate() {
    const e = clamp((S.sy + S.vh - box.lib.top) / (S.vh * .9), 0, 1), k = 1 - Math.pow(1 - e, 3);
    libPanel.style.transform = `scale(${(.9 + .1 * k).toFixed(4)})`;
    libPanel.style.borderRadius = (56 - 26 * k).toFixed(1) + 'px';
  }

  /* ---------- detail dialog ---------- */
  const dlg = $('#detail');
  let dList = SITES, dIdx = 0;
  function openDetail(id, list) {
    dList = list && list.length ? list : SITES;
    dIdx = Math.max(0, dList.findIndex(s => s.id === id));
    fillDetail();
    if (!dlg.open) { dlg.showModal(); }
  }
  function fillDetail() {
    const s = dList[dIdx];
    $('#dUrl').textContent = s.domain;
    const img = $('#dImg'); img.style.animation = 'none'; img.src = tall(s.id); img.alt = `${s.name} 页面长截图`; void img.offsetWidth; img.style.animation = '';
    $('#dNum').textContent = `${pad(dIdx + 1)} / ${pad(dList.length)}`;
    $('#dTag').textContent = s.tag; $('#dName').textContent = s.name; $('#dLine').textContent = s.line;
    $('#dDesc').textContent = s.desc; $('#dQuote').textContent = s.quote || '';
    $('#dUse').textContent = s.use || ''; $('#dMood').textContent = s.mood || '';
    $('#dGroups').textContent = s.groups.map(g => GNAME[g]).filter(Boolean).join(' / ');
    $('#dDomain').textContent = s.domain; $('#dGo').href = s.url;
  }
  const step = d => { dIdx = (dIdx + d + dList.length) % dList.length; fillDetail(); };
  $('#dPrev').addEventListener('click', () => step(-1));
  $('#dNext').addEventListener('click', () => step(1));
  $('#dClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Enter' && e.target === dlg) window.open(dList[dIdx].url, '_blank', 'noopener');
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('button[data-id]'); if (!b || dlg.contains(b)) return;
    const inLib = grid.contains(b), inIdx = idxCam.contains(b), inRing = ringRot.contains(b) || b === rcMore;
    openDetail(b.dataset.id, inLib ? visible : inIdx ? members[idxActive].map(c => c.s) : inRing ? PICKS : SITES);
  });

  /* ---------- misc ---------- */
  const toast = $('#toast'); let toastT;
  const say = m => { toast.textContent = m; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 1800); };
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); say('已复制 ' + b.dataset.copy); } catch (e) { say(b.dataset.copy); }
  }));
  addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== q && !dlg.open) { e.preventDefault(); setFilter(F.g, true); setTimeout(() => q.focus({ preventScroll: true }), RM ? 0 : 700); }
  });
  addEventListener('pointermove', e => { S.mx = e.clientX / S.vw * 2 - 1; S.my = e.clientY / S.vh * 2 - 1; }, { passive: true });
  const nav = $('#nav');

  /* ---------- loop ---------- */
  let last = performance.now(), ready = false, intro = 0, introO = 0;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000) || .016; last = now; S.t += dt;
    S.ty = scrollY;
    const prev = S.sy, k = RM ? 1 : 1 - Math.pow(.82, dt * 60);
    S.sy = lerp(S.sy, S.ty, k); if (Math.abs(S.ty - S.sy) < .1) S.sy = S.ty;
    S.vel = (S.sy - prev) / (dt * 60);
    S.smx = lerp(S.smx, S.mx, .06); S.smy = lerp(S.smy, S.my, .06);
    if (ready) { intro = lerp(intro, 1, RM ? 1 : 1 - Math.pow(.96, dt * 60)); introO = Math.min(1, introO + dt * 1.6); }
    if (near('hero')) heroUpdate(prog('hero'));
    if (near('ring')) ringUpdate(prog('ring'));
    if (near('tilt')) tiltUpdate(prog('tilt'));
    if (near('idx')) idxUpdate(prog('idx'), dt);
    if (near('cut')) cutUpdate(prog('cut'));
    if (S.sy + S.vh * 1.2 > box.lib.top) libUpdate();
    if (S.ty > S.vh * .9 && S.vel > 1.5) nav.classList.add('hide');
    else if (S.vel < -1.5 || S.ty < S.vh * .5) nav.classList.remove('hide');
    requestAnimationFrame(frame);
  }

  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(measure, 120); });
  addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  requestAnimationFrame(frame);

  /* ---------- loader ---------- */
  const loader = $('#loader'), ldN = $('#ldN'), ldBar = $('#ldBar');
  const imgs = flyers.slice(0, 18).map(f => $('img', f.el));
  let loaded = 0, shown = 0;
  const bump = () => { loaded++; };
  imgs.forEach(im => { if (im.complete) bump(); else { im.addEventListener('load', bump, { once: true }); im.addEventListener('error', bump, { once: true }); } });
  const t0 = performance.now();
  (function tick() {
    const el = performance.now() - t0;
    const goal = el > 3500 ? 100 : loaded / imgs.length * 100;
    shown = lerp(shown, Math.min(goal, el / 9, 100), .16);
    if (goal >= 100 && el > 900 && shown > 98) shown = 100;
    ldN.textContent = pad(Math.round(shown), 3);
    ldBar.style.transform = `scaleX(${(shown / 100).toFixed(3)})`;
    if (shown >= 99.5) {
      ldN.textContent = '100'; loader.classList.add('done');
      document.body.classList.remove('loading'); document.documentElement.classList.add('ready'); ready = true;
      setTimeout(() => loader.remove(), 1300);
      measure();
      return;
    }
    requestAnimationFrame(tick);
  })();
})();

/* mascot */
(function(){ const b=document.getElementById('yyBtn'); if(!b) return; b.addEventListener('click',e=>{ e.preventDefault(); const t=document.getElementById('contact'); scrollTo({top:t.getBoundingClientRect().top+scrollY,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }); setTimeout(()=>{ b.classList.add('hello'); setTimeout(()=>b.classList.remove('hello'),3200); },3200); })();
