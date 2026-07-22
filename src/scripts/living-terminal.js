// Living Terminal SPA behavior — ported from "Living Terminal SPA.dc.html"
// (design-project defaults: hero=default, detail=terminal, banner=gitlog, glyphs=wave)

let ctx = null;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hashFor(key) {
  const [kind, slug] = key.split(':');
  if (kind === 'post') return '#/posts/' + slug;
  if (kind === 'project') return '#/projects/' + slug;
  return '#/cv';
}

function parseHash() {
  const h = location.hash || '';
  let m = h.match(/^#\/posts\/([\w-]+)/);
  if (m) return { kind: 'post', slug: m[1] };
  m = h.match(/^#\/projects\/([\w-]+)/);
  if (m) return { kind: 'project', slug: m[1] };
  if (h.startsWith('#/cv')) return { kind: 'cv', slug: 'cv' };
  return null;
}

function init() {
  if (!document.getElementById('lk-top')) return;
  document.documentElement.classList.add('lk-js');
  ctx = { timers: [], raf: null, killed: false, minWindows: [], route: null, lastTrigger: null };

  buildRegistry();
  bindNav();
  startTicker();
  typeHeroCmd();
  observeReveals();
  if (!reduced()) initGlyphs();
  if (parseHash()) openFromHash();
}

function destroy() {
  if (!ctx) return;
  ctx.killed = true;
  ctx.timers.forEach(clearTimeout);
  if (ctx.tickerInterval) clearInterval(ctx.tickerInterval);
  if (ctx.raf) cancelAnimationFrame(ctx.raf);
  if (ctx.io) ctx.io.disconnect();
  (ctx.cleanups || []).forEach((fn) => fn());
  document.body.style.overflow = '';
  ctx = null;
}

const later = (fn, ms) => ctx.timers.push(setTimeout(fn, ms));
const on = (target, ev, fn, opts) => {
  target.addEventListener(ev, fn, opts);
  (ctx.cleanups ||= []).push(() => target.removeEventListener(ev, fn, opts));
};

/* ---------- registry from build-time templates ---------- */

function buildRegistry() {
  ctx.registry = new Map();
  ctx.lists = { post: [], project: [] };
  document.querySelectorAll('template[data-lk-tpl]').forEach((tpl) => {
    const d = tpl.dataset;
    const entry = { key: d.lkTpl, kind: d.lkTpl.split(':')[0], slug: d.lkTpl.split(':')[1], title: d.title, tab: d.tab, file: d.file, dir: d.dir, tpl };
    ctx.registry.set(entry.key, entry);
    if (ctx.lists[entry.kind]) ctx.lists[entry.kind].push(entry);
  });
}

/* ---------- nav / link interception ---------- */

function bindNav() {
  on(document, 'click', (e) => {
    const a = e.target.closest('a[data-lk]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    ctx.lastTrigger = a;
    location.hash = hashFor(a.dataset.lk);
  }, true);
  on(window, 'hashchange', () => openFromHash());
  on(window, 'keydown', (e) => {
    if (e.key === 'Escape' && ctx.route) { e.preventDefault(); closeOverlay(); }
  });

  const overlay = document.getElementById('lk-overlay');
  on(overlay.querySelector('.lk-scrim'), 'click', closeOverlay);
  on(overlay.querySelector('.lk-tl .close'), 'click', closeOverlay);
  on(overlay.querySelector('.lk-tl .max'), 'click', () => overlay.classList.toggle('maxed'));
  on(overlay.querySelector('.lk-tl .min'), 'click', minimize);
  bindTaskstrip();
}

/* ---------- overlay open / close ---------- */

function openFromHash() {
  const route = parseHash();
  const overlay = document.getElementById('lk-overlay');
  if (route) {
    const key = route.kind + ':' + route.slug;
    ctx.minWindows = ctx.minWindows.filter((w) => w.key !== key);
    renderTaskbar();
    ctx.route = route;
    mountDetail(route);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (ctx) overlay.classList.add('shown');
    }));
    later(() => revealDetail(route), 200);
    overlay.querySelector('.lk-panel').focus({ preventScroll: true });
  } else {
    overlay.classList.remove('shown');
    document.body.style.overflow = '';
    ctx.route = null;
    if (ctx.lastTrigger) { ctx.lastTrigger.focus(); ctx.lastTrigger = null; }
    later(() => {
      if (ctx && !ctx.route) { overlay.hidden = true; overlay.classList.remove('maxed'); }
    }, 460);
  }
}

function closeOverlay() {
  // Always clear the hash instead of history.back(): a popstate on a
  // non-Astro history entry makes the ClientRouter re-swap the page,
  // which resets this module (and loses minimized windows).
  if (location.hash.startsWith('#/')) { location.hash = ''; return; }
  if (ctx.route) openFromHash();
}

function minimize() {
  const r = ctx.route;
  if (r) {
    const entry = ctx.registry.get(r.kind + ':' + r.slug);
    const key = r.kind + ':' + r.slug;
    if (entry && !ctx.minWindows.some((w) => w.key === key)) {
      ctx.minWindows.push({ key, title: entry.tab, hash: hashFor(key) });
    }
    renderTaskbar();
  }
  closeOverlay();
}

function mountDetail(route) {
  const entry = ctx.registry.get(route.kind + ':' + route.slug);
  const body = document.getElementById('lk-dbody');
  const title = document.getElementById('lk-ptitle');
  body.classList.remove('lk-reveal');
  body.replaceChildren();
  if (entry) {
    body.appendChild(entry.tpl.content.cloneNode(true));
    title.textContent = entry.tab;
  } else {
    title.textContent = 'not found';
    body.appendChild(notFoundDoc(route));
  }
  document.getElementById('lk-overlay').querySelector('.lk-panel').scrollTop = 0;
  [...body.children].forEach((el, i) => el.style.setProperty('--i', i));
  mountFootNav(route, entry);
}

function notFoundDoc(route) {
  const div = document.createElement('div');
  div.className = 'lk-doc';
  div.innerHTML =
    '<div class="lk-doc-date">error 404</div>' +
    '<h1>file not found</h1>' +
    '<div class="lk-doc-desc" style="background: var(--surface); border: 1px solid var(--line-soft); border-radius: 10px; padding: 18px 22px; margin-top: 18px;">' +
    '<div>bash: cat ' + route.slug.replace(/[^\w-]/g, '') + ': No such file or directory</div>' +
    '<div style="margin-top: 6px; color: var(--faint);">the path you followed doesn’t exist — the project or post may have been renamed or removed.</div></div>' +
    '<div class="lk-doc-links"><a class="repo" href="#lk-projects">cd ~/projects</a> <a class="page" href="#lk-writing">cd ~/writing</a></div>';
  return div;
}

function mountFootNav(route, entry) {
  const prev = document.getElementById('lk-prev');
  const next = document.getElementById('lk-next');
  const hint = document.querySelector('.lk-foot-hint');
  prev.hidden = next.hidden = true;
  hint.hidden = false;
  if (!entry || entry.kind === 'cv') return;
  const list = ctx.lists[entry.kind];
  const i = list.indexOf(entry);
  const words = entry.kind === 'post' ? ['← newer', 'older →'] : ['← prev', 'next →'];
  const set = (el, target, lbl) => {
    el.href = hashFor(target.key);
    el.querySelector('.lbl').textContent = lbl;
    el.querySelector('.ttl').textContent = target.title;
    el.hidden = false;
  };
  if (i > 0) set(prev, list[i - 1], words[0]);
  if (i >= 0 && i < list.length - 1) set(next, list[i + 1], words[1]);
  hint.hidden = !(prev.hidden && next.hidden);
}

/* ---------- boot sequence + reveal ---------- */

function revealDetail(route) {
  if (!ctx || !ctx.route) return;
  if (!reduced()) runBoot(route, () => staggerBody());
  else staggerBody();
}

function staggerBody() {
  const body = document.getElementById('lk-dbody');
  if (body) body.classList.add('lk-reveal');
}

function runBoot(route, done) {
  const boot = document.getElementById('lk-boot');
  const log = document.getElementById('lk-bootlog');
  if (!boot || !log) { done(); return; }
  const entry = ctx.registry.get(route.kind + ':' + route.slug);
  const nm = route.slug;
  const dir = entry ? entry.dir : '~/lokilabs';
  const file = entry ? entry.file : nm;
  const sub = route.kind === 'project' ? 'projects' : route.kind === 'post' ? 'writing' : null;
  boot.hidden = false;
  boot.style.opacity = '1';
  boot.style.transition = 'opacity 0.42s ease';
  const ok = '[<span style="color:#2E9E63;">  OK  </span>]';
  const steps = [
    '<span style="color:#7541B8;">ronald</span> <span style="color:#E9622E;">&rarr;</span> ~/lokilabs <span style="color:#E9622E;">$</span> ' + (sub ? 'cd ' + sub + ' &amp;&amp; ' : '') + 'open ' + nm,
    ok + ' mounting /dev/homelab',
    ok + ' context: homelab (4/4 nodes ready)',
    ok + ' kubeconfig loaded',
    'resolving ' + dir + '/' + file + ' …',
  ];
  let html = '';
  let i = 0;
  log.innerHTML = '';
  const finish = () => {
    if (ctx.killed) return;
    boot.style.opacity = '0';
    done();
    later(() => { boot.hidden = true; }, 440);
  };
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let fi = 0;
  let spun = 0;
  const spin = () => {
    if (ctx.killed) return;
    log.innerHTML = html + '<span style="color:#E9622E;">' + frames[fi % frames.length] + '</span> rendering ' + file + '…\n';
    fi++; spun++;
    if (spun < 13) later(spin, 65);
    else { log.innerHTML = html + '<span style="color:#2E9E63;">✓</span> done — opening.\n'; later(finish, 300); }
  };
  const step = () => {
    if (ctx.killed) return;
    if (i < steps.length) { html += steps[i] + '\n'; log.innerHTML = html; i++; later(step, 165); return; }
    let pct = 0;
    const barBase = html;
    const bar = () => {
      if (ctx.killed) return;
      pct = Math.min(100, pct + 7 + Math.random() * 15);
      const f = Math.round(pct / 5);
      log.innerHTML = barBase + 'fetching ' + file + '  [<span style="color:#E9622E;">' + '█'.repeat(f) + '</span>' + '░'.repeat(20 - f) + '] ' + Math.round(pct) + '%\n';
      if (pct < 100) later(bar, 85);
      else { html = log.innerHTML; later(spin, 220); }
    };
    bar();
  };
  step();
}

/* ---------- taskbar ---------- */

function renderTaskbar() {
  const bar = document.getElementById('lk-taskbar');
  const strip = document.getElementById('lk-taskstrip');
  const count = document.getElementById('lk-taskcount');
  bar.hidden = ctx.minWindows.length === 0;
  count.textContent = ctx.minWindows.length + ' minimized';
  strip.replaceChildren(...ctx.minWindows.map((w) => {
    const chip = document.createElement('div');
    chip.className = 'lk-task';
    const open = document.createElement('button');
    open.className = 'open';
    open.innerHTML = '<span class="g">&gt;_</span><span class="t"></span>';
    open.querySelector('.t').textContent = w.title;
    open.addEventListener('click', () => {
      if (ctx.taskDragMoved) return;
      ctx.minWindows = ctx.minWindows.filter((x) => x.key !== w.key);
      renderTaskbar();
      location.hash = w.hash;
    });
    const x = document.createElement('button');
    x.className = 'x';
    x.title = 'close';
    x.textContent = '×';
    x.addEventListener('click', () => {
      ctx.minWindows = ctx.minWindows.filter((x2) => x2.key !== w.key);
      renderTaskbar();
    });
    chip.append(open, x);
    return chip;
  }));
}

function bindTaskstrip() {
  const s = document.getElementById('lk-taskstrip');
  let drag = null;
  on(s, 'pointerdown', (e) => { drag = { x: e.clientX, sl: s.scrollLeft }; ctx.taskDragMoved = false; s.style.cursor = 'grabbing'; });
  on(window, 'pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) ctx.taskDragMoved = true;
    s.scrollLeft = drag.sl - dx;
  });
  on(window, 'pointerup', () => {
    drag = null;
    s.style.cursor = 'grab';
    later(() => { if (ctx) ctx.taskDragMoved = false; }, 0);
  });
  on(s, 'wheel', (e) => {
    if (e.deltaY && s.scrollWidth > s.clientWidth) { s.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
}

/* ---------- hero typing ---------- */

function typeHeroCmd() {
  const cmd = document.getElementById('lk-cmd');
  if (!cmd || reduced()) return;
  const full = cmd.textContent;
  cmd.textContent = '';
  let i = 0;
  const tick = () => { cmd.textContent = full.slice(0, ++i); if (i < full.length) later(tick, 85); };
  later(tick, 500);
}

/* ---------- ticker (gitlog mode) ---------- */

function startTicker() {
  const a = document.getElementById('lk-tick-a');
  const b = document.getElementById('lk-tick-b');
  if (!a) return;
  const t0 = Date.now();
  const sep = '<span style="color: rgba(251,248,244,0.45); margin: 0 18px;">&middot;</span>';
  const mono = (t) => '<span style="color:rgba(40,15,76,0.85);">' + t + '</span>';
  const ago = (baseMin) => (baseMin + Math.floor((Date.now() - t0) / 60000)) + 'm ago';
  const commits = [
    [mono('a3f9c1') + ' feat: zenith deploy via flux', 2],
    [mono('7b2e04') + ' fix: move etcd off SD cards', 11],
    [mono('c81d5a') + ' feat: sops + age secrets', 26],
    [mono('e0492f') + ' chore: bump grafana', 43],
    [mono('1af7bd') + ' feat: 4th node joined', 58],
  ];
  const render = () => {
    if (ctx.killed) return;
    const html = commits.map(([s, m]) => s + ' <span style="color:rgba(40,15,76,0.6);">(' + ago(m) + ')</span>').join(sep) + sep;
    a.innerHTML = html;
    if (b) b.innerHTML = html;
  };
  render();
  ctx.tickerInterval = setInterval(render, 1000);
}

/* ---------- scroll reveals ---------- */

function observeReveals() {
  const els = document.querySelectorAll('.lk-io');
  if (!('IntersectionObserver' in window) || reduced()) { els.forEach((el) => el.classList.add('in')); return; }
  ctx.io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); ctx.io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  els.forEach((el) => ctx.io.observe(el));
}

/* ---------- hero glyph field (wave mode) ---------- */

function initGlyphs() {
  const canvas = document.getElementById('lk-glyphs');
  const hero = document.getElementById('lk-top');
  if (!canvas || !hero) return;
  const c2d = canvas.getContext('2d');
  const chars = ['$', '>', '_', '/', '#', '~', '{', '}', '|', '=', '+', '*', '·', '→', '✓'];
  const GAP = 28;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cells = [];
  let W = 0;
  let H = 0;
  const mouse = { x: -9999, y: -9999 };
  const build = () => {
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    c2d.font = '13px "Fira Code", monospace';
    c2d.textAlign = 'center'; c2d.textBaseline = 'middle';
    cells = [];
    for (let y = GAP / 2; y < H; y += GAP)
      for (let x = GAP / 2; x < W; x += GAP)
        cells.push({ x, y, ch: chars[(Math.random() * chars.length) | 0], ph: Math.random() * Math.PI * 2, sp: 0.4 + Math.random() * 0.8, orange: Math.random() < 0.06, swap: (Math.random() * 400) | 0, flare: 0 });
  };
  build();
  on(window, 'resize', build);
  on(hero, 'mousemove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  on(hero, 'mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  let t = 0;
  let last = 0;
  const frame = (now) => {
    if (ctx.killed) return;
    ctx.raf = requestAnimationFrame(frame);
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    t += dt;
    c2d.clearRect(0, 0, W, H);
    if (Math.random() < 0.12) { const c = cells[(Math.random() * cells.length) | 0]; if (c) c.flare = 1; }
    for (const c of cells) {
      if (--c.swap <= 0) { c.ch = chars[(Math.random() * chars.length) | 0]; c.swap = (200 + Math.random() * 500) | 0; }
      const wave = 0.5 + 0.5 * Math.sin(t * c.sp + c.ph);
      const dx = c.x - mouse.x;
      const dy = c.y - mouse.y;
      const boost = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 190);
      if (c.flare) c.flare = Math.max(0, c.flare - 0.35 * dt);
      const a = 0.05 + wave * 0.08 + boost * 0.5 + c.flare * 0.32;
      c2d.fillStyle = c.orange ? 'rgba(233, 98, 46, ' + Math.min(1, a).toFixed(3) + ')' : 'rgba(226, 213, 246, ' + Math.min(1, a).toFixed(3) + ')';
      c2d.fillText(c.ch, c.x, c.y);
    }
  };
  ctx.raf = requestAnimationFrame(frame);
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);
