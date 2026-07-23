// Living Terminal SPA behavior — ported from "Living Terminal SPA.dc.html"
// (design-project defaults: hero=default, detail=terminal, banner=gitlog, glyphs=wave)

let ctx = null;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A "route" is { kind: 'post'|'project'|'cv'|'section', slug }. Detail
// content lives at real URLs (/writing/x/, /projects/x/, /cv/) and is driven
// with the History API — the overlay is opened without a full navigation,
// and the same URLs are real static pages for deep links, crawlers, OG
// images and giscus. 'section' routes (/about/, /writing/, /projects/) are
// real paths too, but just scroll to the matching homepage section.
function parseKey(key) {
  const [kind, slug] = key.split(':');
  return { kind, slug };
}

function routeKey(r) {
  return r.kind + ':' + (r.slug || 'cv');
}

// Section routes (/about/, /writing/, /projects/) are real, bookmarkable
// paths to the matching homepage section — not overlay-openable, just a
// scroll target.
const SECTION_IDS = { about: 'lk-about', writing: 'lk-writing', projects: 'lk-projects' };

function pathFor(kind, slug) {
  if (kind === 'post') return '/writing/' + slug + '/';
  if (kind === 'project') return '/projects/' + slug + '/';
  if (kind === 'section') return '/' + slug + '/';
  return '/cv/';
}

function parsePath(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  let m = p.match(/^\/writing\/([\w-]+)$/);
  if (m) return { kind: 'post', slug: m[1] };
  m = p.match(/^\/projects\/([\w-]+)$/);
  if (m) return { kind: 'project', slug: m[1] };
  if (p === '/cv') return { kind: 'cv', slug: 'cv' };
  if (p === '/about') return { kind: 'section', slug: 'about' };
  if (p === '/writing') return { kind: 'section', slug: 'writing' };
  if (p === '/projects') return { kind: 'section', slug: 'projects' };
  return null;
}

function init() {
  if (!document.getElementById('lk-top')) return;
  document.documentElement.classList.add('lk-js');
  ctx = { timers: [], raf: null, killed: false, minWindows: [], route: null, lastFocused: null, bootId: 0 };

  buildRegistry();
  bindNav();
  startTicker();
  typeHeroCmd();
  observeReveals();
  if (!reduced()) initGlyphs();

  const overlay = document.getElementById('lk-overlay');
  const openKey = overlay && overlay.dataset.open;
  if (openKey) adoptOpen(parseKey(openKey));
  else {
    const route = parsePath(location.pathname);
    if (route && route.kind === 'section') goToSection(route, { push: false, instant: true });
    else if (route) openRoute(route, { push: false });
  }
}

const later = (fn, ms) => ctx.timers.push(setTimeout(fn, ms));
const on = (target, ev, fn, opts) => target.addEventListener(ev, fn, opts);

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
  // Intercept clicks on any SPA link (cards, nav, footer, foot-nav, taskbar)
  // and open the overlay via pushState instead of navigating.
  on(document, 'click', (e) => {
    const a = e.target.closest('a[data-lk]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const route = parseKey(a.dataset.lk);
    if (route.kind === 'section') goToSection(route, { push: true });
    else openRoute(route, { push: true });
    if (route.kind === 'cv') trackEvent('cv');
  });
  // Real outbound links (mailto/github/linkedin) — don't intercept the
  // navigation, just fire the beacon alongside it.
  on(document, 'click', (e) => {
    const t = e.target.closest('a[data-track]');
    if (t) trackEvent(t.dataset.track);
  });
  // window.print() delegated here (not an inline onclick) so the CSP's
  // script-src, which has no 'unsafe-inline', doesn't block it.
  on(document, 'click', (e) => {
    if (e.target.closest('[data-print]')) window.print();
  });
  on(window, 'popstate', () => {
    const route = parsePath(location.pathname);
    if (route && route.kind === 'section') goToSection(route, { push: false });
    else if (route) openRoute(route, { push: false });
    else closeVisual();
  });
  on(window, 'keydown', (e) => {
    if (!ctx.route) return;
    if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); }
    else if (e.key === 'Tab') trapFocus(e);
  });

  const overlay = document.getElementById('lk-overlay');
  on(overlay.querySelector('.lk-scrim'), 'click', closeOverlay);
  on(overlay.querySelector('.lk-tl .close'), 'click', closeOverlay);
  on(overlay.querySelector('.lk-tl .max'), 'click', () => overlay.classList.toggle('maxed'));
  on(overlay.querySelector('.lk-tl .min'), 'click', minimize);
  // Forward-tabbing off the end of the panel — including out of giscus's
  // iframe, which a keydown-based trap can't intercept (see trapFocus) —
  // always lands here next, since it's the last tabbable node. A focus
  // event on a normal element in this document fires reliably regardless
  // of what happened inside the iframe.
  on(document.getElementById('lk-focus-end'), 'focus', () => {
    if (!ctx.route) return;
    const focusables = panelFocusables();
    (focusables[0] || overlay.querySelector('.lk-panel')).focus();
  });
  bindTaskstrip();
}

/* ---------- overlay open / close ---------- */

// Enhance a server-rendered open overlay (deep link): the content is already
// in the DOM, so wire it up without cloning or replaying the boot sequence.
function adoptOpen(route) {
  const overlay = document.getElementById('lk-overlay');
  ctx.route = route;
  overlay.hidden = false;
  overlay.classList.add('shown');
  document.body.style.overflow = 'hidden';
  const body = document.getElementById('lk-dbody');
  body.classList.add('lk-reveal');
  [...body.children].forEach((el, i) => el.style.setProperty('--i', i));
  mountFootNav(route, ctx.registry.get(routeKey(route)));
  if (route.kind === 'project') mountGiscus();
  history.replaceState({ lk: false }, '', location.href);
}

function openRoute(route, { push }) {
  const overlay = document.getElementById('lk-overlay');
  const key = routeKey(route);
  ctx.minWindows = ctx.minWindows.filter((w) => w.key !== key);
  renderTaskbar();
  // Navigating within an already-open overlay (next/prev, taskbar restore
  // onto a still-open panel) must not stack a new history entry per item —
  // otherwise closing only pops back to the previously viewed item instead
  // of out of the overlay. Keep the existing entry's `lk` flag so close
  // behavior (back() vs replace-to-root) still matches how this session
  // actually got here.
  const alreadyOpen = !!ctx.route;
  if (!alreadyOpen) ctx.lastFocused = document.activeElement;
  ctx.route = route;
  const path = pathFor(route.kind, route.slug);
  if (alreadyOpen) history.replaceState(history.state, '', path);
  else if (push) history.pushState({ lk: true }, '', path);
  mountDetail(route);
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (ctx) overlay.classList.add('shown');
  }));
  if (alreadyOpen) {
    // Already inside the overlay (next/prev, taskbar restore onto a still-open
    // panel) — swap content in place, don't replay the boot sequence, it's
    // meant for the first open, not every click. If the previous route's boot
    // was still mid-flight, its finish() is now cancelled (bootId mismatch)
    // and will never hide the cover itself — clear it here instead.
    const boot = document.getElementById('lk-boot');
    if (boot && !boot.hidden) { boot.hidden = true; boot.style.opacity = '0'; }
    staggerBody();
  } else {
    hideBehindBoot();
    later(() => revealDetail(route), 200);
  }
  overlay.querySelector('.lk-panel').focus({ preventScroll: true });
}

// Cover the real content the instant it's mounted, not 200ms later when
// runBoot() gets around to it — otherwise the actual doc flashes visible
// underneath before the fake boot sequence starts covering it.
function hideBehindBoot() {
  if (reduced()) return;
  const boot = document.getElementById('lk-boot');
  if (!boot) return;
  boot.style.transition = 'none';
  boot.hidden = false;
  boot.style.opacity = '1';
}

function closeVisual() {
  const overlay = document.getElementById('lk-overlay');
  overlay.classList.remove('shown');
  document.body.style.overflow = '';
  ctx.route = null;
  if (ctx.lastFocused) {
    ctx.lastFocused.focus({ preventScroll: true });
    ctx.lastFocused = null;
  }
  later(() => {
    if (ctx && !ctx.route) {
      overlay.hidden = true;
      overlay.classList.remove('maxed');
      document.getElementById('lk-dbody').classList.remove('lk-reveal');
    }
  }, 460);
}

function panelFocusables() {
  const panel = document.querySelector('.lk-panel');
  const all = panel.querySelectorAll('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])');
  // querySelectorAll doesn't know about hidden foot-nav links (e.g. #lk-next
  // when there's no newer item) — offsetParent excludes anything display:none.
  // #lk-focus-end matches [tabindex] too; drop it here, it's handled separately.
  return [...all].filter((el) => el.offsetParent !== null && el.id !== 'lk-focus-end');
}

// role="dialog" aria-modal="true" claims modality it didn't enforce — Tab
// could walk straight out of the panel into the fixed nav / page behind the
// scrim. This only handles Shift+Tab off the first element (a normal
// same-document keydown, always reliable); forward overflow is handled by
// the #lk-focus-end sentinel instead, since it also has to work when the
// last real control is giscus's cross-origin iframe — see the 'focus'
// listener bound to that sentinel in bindNav().
function trapFocus(e) {
  if (!e.shiftKey) return;
  const focusables = panelFocusables();
  if (!focusables.length) return;
  if (document.activeElement === focusables[0]) {
    e.preventDefault();
    focusables[focusables.length - 1].focus();
  }
}

function closeOverlay() {
  // If we pushed a history entry to open, step back so the URL returns to what
  // it was; otherwise (deep link) rewrite to root and just hide.
  if (history.state && history.state.lk) { history.back(); return; }
  history.replaceState({}, '', '/');
  closeVisual();
}

// Fire-and-forget first-party event ping (CV opens, contact clicks) — never
// blocks or delays the thing the user actually clicked to do.
function trackEvent(key) {
  try {
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', key);
    else fetch('/api/track', { method: 'POST', body: key, keepalive: true }).catch(() => {});
  } catch {
    // best-effort only
  }
}

// Section links (/about/, /writing/, /projects/) just scroll the homepage —
// no overlay. Close whatever's open first so the target section is visible.
function goToSection(route, { push, instant }) {
  if (ctx.route) closeVisual();
  if (push) history.pushState({ lk: false }, '', pathFor(route.kind, route.slug));
  const el = document.getElementById(SECTION_IDS[route.slug]);
  if (el) el.scrollIntoView({ behavior: instant || reduced() ? 'auto' : 'smooth', block: 'start' });
}

function minimize() {
  const r = ctx.route;
  if (r) {
    const entry = ctx.registry.get(routeKey(r));
    const key = routeKey(r);
    if (entry && !ctx.minWindows.some((w) => w.key === key)) {
      ctx.minWindows.push({ key, title: entry.tab, route: { kind: r.kind, slug: r.slug } });
    }
    renderTaskbar();
  }
  closeOverlay();
}

function mountGiscus() {
  const holder = document.querySelector('#lk-dbody .lk-giscus[data-giscus]');
  if (!holder || holder.dataset.mounted) return;
  holder.dataset.mounted = '1';
  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  const attrs = {
    'data-repo': 'ronaldlokers/lokilabs.nl',
    'data-repo-id': 'R_kgDOTee_gA',
    'data-category': 'Projects',
    'data-category-id': 'DIC_kwDOTee_gM4DBuPf',
    'data-mapping': 'pathname',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'bottom',
    'data-theme': 'https://lokilabs.nl/giscus-theme.css',
    'data-lang': 'en',
    'data-loading': 'lazy',
  };
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  holder.appendChild(s);
}

function mountDetail(route) {
  const entry = ctx.registry.get(routeKey(route));
  const body = document.getElementById('lk-dbody');
  const title = document.getElementById('lk-ptitle');
  body.classList.remove('lk-reveal');
  body.replaceChildren();
  if (entry) {
    body.appendChild(entry.tpl.content.cloneNode(true));
    title.textContent = entry.tab;
    if (route.kind === 'project') mountGiscus();
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
    '<div>bash: cat ' + String(route.slug || '').replace(/[^\w-]/g, '') + ': No such file or directory</div>' +
    '<div style="margin-top: 6px; color: var(--faint);">the path you followed doesn’t exist — the project or post may have been renamed or removed.</div></div>' +
    '<div class="lk-doc-links"><a class="repo" href="/projects/" data-lk="section:projects">cd ~/projects</a> <a class="page" href="/writing/" data-lk="section:writing">cd ~/writing</a></div>';
  return div;
}

function mountFootNav(route, entry) {
  const prev = document.getElementById('lk-prev');
  const next = document.getElementById('lk-next');
  const foot = document.querySelector('.lk-panel-foot');
  prev.hidden = next.hidden = true;
  const list = entry && entry.kind !== 'cv' ? ctx.lists[entry.kind] : null;
  if (list) {
    const i = list.indexOf(entry);
    const set = (el, target, lbl) => {
      el.href = pathFor(target.kind, target.slug);
      el.setAttribute('data-lk', target.key);
      el.querySelector('.lbl').textContent = lbl;
      el.querySelector('.ttl').textContent = target.title;
      el.hidden = false;
    };
    // Both lists are newest-first (writing by descending pubDate, projects
    // by ascending `order` — lower order is the newer/more prominent one),
    // so the next entry in list order is always the older neighbor.
    const older = list[i + 1];
    const newer = list[i - 1];
    if (older) set(prev, older, '← older');
    if (newer) set(next, newer, 'newer →');
  }
  foot.hidden = prev.hidden && next.hidden;
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
  // ctx.killed was checked here but never set anywhere, so a boot sequence
  // interrupted by fast navigation (next/prev, double-click) never actually
  // stopped — two chains wrote into the same #lk-bootlog and interleaved.
  // A per-call generation id fixes it without touching ctx.killed, which is
  // a separate, page-lifetime teardown flag for the ticker/hero-canvas loops.
  const id = ++ctx.bootId;
  const entry = ctx.registry.get(route.kind + ':' + route.slug);
  const nm = route.slug;
  const dir = entry ? entry.dir : '~/lokilabs';
  const file = entry ? entry.file : nm;
  const sub = route.kind === 'project' ? 'projects' : route.kind === 'post' ? 'writing' : null;
  // hideBehindBoot() already made this visible instantly (no transition) the
  // moment the route opened — restore the transition here so finish() below
  // fades it back out smoothly instead of snapping.
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
    if (id !== ctx.bootId) return;
    boot.style.opacity = '0';
    done();
    later(() => { boot.hidden = true; }, 440);
  };
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let fi = 0;
  let spun = 0;
  const spin = () => {
    if (id !== ctx.bootId) return;
    log.innerHTML = html + '<span style="color:#E9622E;">' + frames[fi % frames.length] + '</span> rendering ' + file + '…\n';
    fi++; spun++;
    if (spun < 13) later(spin, 65);
    else { log.innerHTML = html + '<span style="color:#2E9E63;">✓</span> done — opening.\n'; later(finish, 300); }
  };
  const step = () => {
    if (id !== ctx.bootId) return;
    if (i < steps.length) { html += steps[i] + '\n'; log.innerHTML = html; i++; later(step, 165); return; }
    let pct = 0;
    const barBase = html;
    const bar = () => {
      if (id !== ctx.bootId) return;
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
      openRoute(w.route, { push: true });
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
  const sep = '<span style="color: rgba(251,248,244,0.45); margin: 0 18px;">&middot;</span>';
  const mono = (t) => '<span style="color:rgba(40,15,76,0.85);">' + t + '</span>';
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = (iso) => {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  };
  let commits = [];
  const render = () => {
    if (ctx.killed || !commits.length) return;
    const html = commits.map((c) =>
      mono(esc(c.sha)) + ' ' + esc(c.message) +
      ' <span style="color:rgba(40,15,76,0.55); font-size: 11px;">' + esc(c.repo) + '</span>' +
      ' <span style="color:rgba(40,15,76,0.6);">(' + ago(c.date) + ')</span>'
    ).join(sep) + sep;
    a.innerHTML = html;
    if (b) b.innerHTML = html;
  };
  fetch('/api/ticker')
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => { commits = Array.isArray(data) ? data : []; render(); })
    .catch(() => {});
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

init();
