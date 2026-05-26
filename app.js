/* ============================================
   PandaStudioX v4.0 — Complete JavaScript
   ============================================ */
'use strict';

/* ─── THEME ENGINE ─── */
const THEMES = {
  dark:    {name:'Dark Pro',     icon:'🌑', a:'#7c3aed', b:'#6366f1', rgb:'124,58,237'},
  cyberpunk:{name:'Cyberpunk',   icon:'🔮', a:'#e600ff', b:'#9000cc', rgb:'230,0,255'},
  neon:    {name:'Neon Blue',    icon:'⚡', a:'#00d4ff', b:'#0090cc', rgb:'0,212,255'},
  forest:  {name:'Forest',       icon:'🌿', a:'#22c55e', b:'#16a34a', rgb:'34,197,94'},
  sunset:  {name:'Sunset',       icon:'🌅', a:'#ff6b00', b:'#e65c00', rgb:'255,107,0'},
  rose:    {name:'Rose',         icon:'🌹', a:'#f000ff', b:'#cc00dd', rgb:'240,0,255'},
  light:   {name:'Light',        icon:'☀️', a:'#7c3aed', b:'#6d28d9', rgb:'124,58,237'},
};

let _theme = localStorage.getItem('psx-theme') || 'dark';

function applyTheme(key) {
  if (!THEMES[key]) key = 'dark';
  _theme = key;
  localStorage.setItem('psx-theme', key);
  const root = document.documentElement;
  root.setAttribute('data-theme', key);
  root.style.setProperty('--accent-rgb', THEMES[key].rgb);
  document.querySelectorAll('.t-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === key);
  });
  const btn = document.querySelector('.theme-btn');
  if (btn) btn.innerHTML = `${THEMES[key].icon} <span>${THEMES[key].name}</span>`;
  if (typeof drawBg === 'function') setTimeout(drawBg, 50);
}

function buildThemePanel() {
  const panel = document.getElementById('theme-panel');
  if (!panel) return;
  panel.innerHTML = `<div class="theme-panel-ttl">Choose Theme</div>` +
    Object.entries(THEMES).map(([k, t]) =>
      `<button class="t-opt${_theme === k ? ' active' : ''}" data-theme="${k}" onclick="applyTheme('${k}');closeThemePanel()">
        <div class="t-swatch" style="background:linear-gradient(135deg,${t.a},${t.b})"></div>
        <div style="flex:1;text-align:left"><div>${t.icon} ${t.name}</div></div>
        <span class="t-check">✓</span>
      </button>`
    ).join('');
}

function toggleThemePanel() {
  const panel = document.getElementById('theme-panel');
  if (!panel) return;
  if (panel.classList.contains('open')) {
    panel.classList.remove('open');
  } else {
    buildThemePanel();
    panel.classList.add('open');
  }
}
function closeThemePanel() {
  document.getElementById('theme-panel')?.classList.remove('open');
}

/* ─── ANIMATED CANVAS BACKGROUND ─── */
let _raf = null;
let _canvas = null;
let _ctx = null;
let _W = 0, _H = 0;

const _particles = [];
const _orbs = [];

function initCanvas() {
  _canvas = document.getElementById('bg-canvas');
  if (!_canvas) return;
  _ctx = _canvas.getContext('2d');
  resizeCanvas();
  buildParticles();
  if (_raf) cancelAnimationFrame(_raf);
  drawBg();
}

function resizeCanvas() {
  if (!_canvas) return;
  _W = window.innerWidth;
  _H = window.innerHeight;
  _canvas.width = _W;
  _canvas.height = _H;
}

function buildParticles() {
  _particles.length = 0;
  _orbs.length = 0;
  for (let i = 0; i < 55; i++) {
    _particles.push({
      x: Math.random() * _W,
      y: Math.random() * _H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 0.4,
      a: Math.random() * 0.45 + 0.08,
      phase: Math.random() * Math.PI * 2,
    });
  }
  for (let i = 0; i < 3; i++) {
    _orbs.push({
      x: Math.random() * _W,
      y: Math.random() * _H,
      r: 180 + Math.random() * 260,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      a: 0.06 + Math.random() * 0.08,
    });
  }
}

function drawBg() {
  if (!_ctx) return;
  const t = THEMES[_theme] || THEMES.dark;
  const rgb = (t.rgb || '124,58,237').split(',').map(Number);
  const r = rgb[0], g = rgb[1], b = rgb[2];
  const isLight = _theme === 'light';

  _ctx.clearRect(0, 0, _W, _H);

  /* orbs */
  _orbs.forEach(o => {
    o.x += o.vx; o.y += o.vy;
    if (o.x < -o.r) o.x = _W + o.r;
    if (o.x > _W + o.r) o.x = -o.r;
    if (o.y < -o.r) o.y = _H + o.r;
    if (o.y > _H + o.r) o.y = -o.r;
    const grad = _ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    grad.addColorStop(0, `rgba(${r},${g},${b},${o.a})`);
    grad.addColorStop(1, 'transparent');
    _ctx.fillStyle = grad;
    _ctx.fillRect(0, 0, _W, _H);
  });

  /* grid */
  if (!isLight) {
    _ctx.strokeStyle = `rgba(${r},${g},${b},0.035)`;
    _ctx.lineWidth = 1;
    const gs = 60;
    for (let x = 0; x <= _W; x += gs) {
      _ctx.beginPath(); _ctx.moveTo(x, 0); _ctx.lineTo(x, _H); _ctx.stroke();
    }
    for (let y = 0; y <= _H; y += gs) {
      _ctx.beginPath(); _ctx.moveTo(0, y); _ctx.lineTo(_W, y); _ctx.stroke();
    }
  }

  /* particles */
  const now = Date.now() * 0.001;
  _particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.phase += 0.018;
    if (p.x < 0) p.x = _W; if (p.x > _W) p.x = 0;
    if (p.y < 0) p.y = _H; if (p.y > _H) p.y = 0;
    const alpha = p.a * (0.5 + 0.5 * Math.sin(p.phase));
    _ctx.beginPath();
    _ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    _ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    _ctx.fill();
  });

  _raf = requestAnimationFrame(drawBg);
}

/* ─── CART ─── */
let _cart = [];
let _coupon = null;

const COUPONS = {
  PANDA20:  { pct: 20, label: '20% OFF' },
  GAMER50:  { pct: 50, label: '50% OFF' },
  SAVE100:  { flat: 100, label: '₹100 OFF' },
  NEWUSER:  { pct: 30, label: '30% OFF' },
  PSX10:    { pct: 10, label: '10% OFF' },
};

function loadCart() {
  try { _cart = JSON.parse(localStorage.getItem('psx-cart') || '[]'); } catch(e) { _cart = []; }
}
function saveCart() {
  localStorage.setItem('psx-cart', JSON.stringify(_cart));
  updateCartBadge();
}

function addToCart(id, title, price, emoji, cat) {
  loadCart();
  const ex = _cart.find(c => c.id === String(id));
  if (ex) { ex.qty = (ex.qty || 1) + 1; }
  else { _cart.push({ id: String(id), title: String(title), price: Number(price) || 0, emoji: emoji || '📦', cat: cat || '', qty: 1 }); }
  saveCart();
  showToast('🛒', 'Added to Cart!', String(title) + ' added successfully.');
  pulseCartBtn();
}

function removeFromCart(id) {
  loadCart();
  _cart = _cart.filter(c => c.id !== String(id));
  saveCart();
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateQty(id, delta) {
  loadCart();
  const item = _cart.find(c => c.id === String(id));
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart();
  if (typeof renderCartPage === 'function') renderCartPage();
}

function clearCart() {
  _cart = []; _coupon = null; saveCart();
  if (typeof renderCartPage === 'function') renderCartPage();
}

function getCartTotals() {
  const sub = _cart.reduce((a, c) => a + (c.price * (c.qty || 1)), 0);
  let disc = 0;
  if (_coupon && COUPONS[_coupon]) {
    const cp = COUPONS[_coupon];
    disc = cp.pct ? Math.round(sub * cp.pct / 100) : Math.min(cp.flat || 0, sub);
  }
  return { subtotal: sub, discount: disc, total: Math.max(0, sub - disc) };
}

function tryApplyCoupon(code) {
  const key = (code || '').toUpperCase().trim();
  if (COUPONS[key]) {
    _coupon = key;
    showToast('🎟️', 'Coupon Applied!', COUPONS[key].label + ' discount applied!');
    return true;
  }
  showToast('❌', 'Invalid Code', 'Try: PANDA20, GAMER50, SAVE100');
  return false;
}

function updateCartBadge() {
  loadCart();
  const total = _cart.reduce((a, c) => a + (c.qty || 1), 0);
  document.querySelectorAll('.cart-n').forEach(el => {
    el.textContent = total;
    el.classList.toggle('show', total > 0);
  });
}

function pulseCartBtn() {
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.style.transform = 'scale(1.25)';
    btn.style.borderColor = 'var(--accent)';
    setTimeout(() => { btn.style.transform = ''; btn.style.borderColor = ''; }, 250);
  });
}

/* ─── WISHLIST ─── */
let _wishlist = [];
function loadWishlist() {
  try { _wishlist = JSON.parse(localStorage.getItem('psx-wish') || '[]'); } catch(e) { _wishlist = []; }
}
function saveWishlist() { localStorage.setItem('psx-wish', JSON.stringify(_wishlist)); }
function toggleWishlist(id, btn) {
  loadWishlist();
  const sid = String(id);
  const idx = _wishlist.indexOf(sid);
  if (idx > -1) {
    _wishlist.splice(idx, 1);
    if (btn) btn.textContent = '🤍';
    showToast('💔', 'Removed', 'Removed from your wishlist');
  } else {
    _wishlist.push(sid);
    if (btn) btn.textContent = '❤️';
    showToast('❤️', 'Saved!', 'Added to your wishlist');
  }
  saveWishlist();
}
function isWished(id) { loadWishlist(); return _wishlist.includes(String(id)); }

/* ─── TOAST ─── */
const _liveToasts = [
  ['🎉', 'New Sale!', 'Rahul S. just bought Gaming Thumbnail Pack'],
  ['💰', 'Payout Sent!', 'DesignMaster received ₹3,200'],
  ['⭐', 'New Review', 'Priya K. left a 5-star review'],
  ['🔥', 'Flash Sale!', '40% off Minecraft packs — today only!'],
  ['🏆', 'Milestone!', 'GamingPro_X hit 5,000 sales!'],
  ['🆕', 'New Drop!', 'Roblox GFX Pack v3 is now live'],
];
let _toastIdx = 0;

function showToast(icon, title, desc) {
  const box = document.getElementById('toast-box');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML =
    `<span class="toast-icon">${icon}</span>` +
    `<div class="toast-body"><div class="toast-title">${title}</div>${desc ? `<div class="toast-desc">${desc}</div>` : ''}</div>` +
    `<button class="toast-close" onclick="this.closest('.toast').remove()">×</button>`;
  box.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateX(110%)';
    el.style.transition = 'all .4s ease';
    setTimeout(() => el.remove(), 400);
  }, 5000);
}

function startLiveToasts() {
  setTimeout(() => {
    const t = _liveToasts[_toastIdx++ % _liveToasts.length];
    showToast(t[0], t[1], t[2]);
    setInterval(() => {
      const tt = _liveToasts[_toastIdx++ % _liveToasts.length];
      showToast(tt[0], tt[1], tt[2]);
    }, 11000);
  }, 4500);
}

/* ─── SEARCH ─── */
const SEARCH_DB = [
  {id:'gtp',  icon:'🎮', bg:'pt-gaming',    title:'Gaming Thumbnail Pack',    cat:'Thumbnails',  price:299},
  {id:'mmb',  icon:'⛏️', bg:'pt-minecraft', title:'Minecraft Map Bundle',     cat:'Minecraft',   price:499},
  {id:'dbp',  icon:'💬', bg:'pt-discord',   title:'Discord Bot Premium',      cat:'Discord',     price:499},
  {id:'ytp',  icon:'📺', bg:'pt-youtube',   title:'YouTube Thumbnail Pack',   cat:'Thumbnails',  price:349},
  {id:'rgfx', icon:'🎲', bg:'pt-roblox',    title:'Roblox GFX Pack',          cat:'Roblox',      price:399},
  {id:'muik', icon:'🖥️', bg:'pt-ui',        title:'Modern UI Kit',            cat:'UI Kits',     price:599},
  {id:'gdc',  icon:'🕹️', bg:'pt-gaming',    title:'Game Dev Course',          cat:'Games',       price:1499},
  {id:'pop',  icon:'📡', bg:'pt-overlay',   title:'Premium Overlays Pack',    cat:'Graphics',    price:299},
  {id:'wtp',  icon:'🌐', bg:'pt-template',  title:'Website Template Pack',    cat:'Templates',   price:499},
  {id:'mctp', icon:'⛏️', bg:'pt-minecraft', title:'Minecraft Texture Pack',   cat:'Minecraft',   price:249},
  {id:'twitch',icon:'🎙️',bg:'pt-twitch',   title:'Twitch Overlay Bundle',    cat:'Graphics',    price:349},
  {id:'scmc', icon:'💻', bg:'pt-code',      title:'Minecraft Server Code',    cat:'Source Code', price:899},
];

function initSearch() {
  document.querySelectorAll('.nav-search-input').forEach(input => {
    const drop = input.parentElement.querySelector('.search-drop');
    if (!drop) return;
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        if (!q) { drop.classList.remove('open'); return; }
        const res = SEARCH_DB.filter(p =>
          p.title.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
        ).slice(0, 6);
        if (!res.length) { drop.classList.remove('open'); return; }
        drop.innerHTML = res.map(p =>
          `<div class="s-item" onclick="location.href='product.html?id=${p.id}'">
            <div class="s-item-img ${p.bg}" style="font-size:18px">${p.icon}</div>
            <div style="flex:1"><div class="s-item-title">${p.title}</div><div class="s-item-cat">${p.cat}</div></div>
            <div class="s-item-price">₹${p.price}</div>
          </div>`
        ).join('');
        drop.classList.add('open');
      }, 200);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Escape') drop.classList.remove('open'); });
  });
  document.addEventListener('click', e => {
    document.querySelectorAll('.search-drop.open').forEach(drop => {
      if (!drop.parentElement.contains(e.target)) drop.classList.remove('open');
    });
  });
}

/* ─── TICKER ─── */
function buildTicker(items) {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const html = items.map(t => `<span class="ticker-item">${t}<span class="ticker-dot"></span></span>`).join('');
  track.innerHTML = html + html; /* doubled for seamless loop */
}

/* ─── REVEAL ON SCROLL ─── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 60);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ─── COUNTER ANIMATION ─── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count);
    const suf = el.dataset.suffix || '';
    const pre = el.dataset.prefix || '';
    const dur = 1800;
    const start = performance.now();
    const update = t => {
      const p = Math.min((t - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = target < 10 ? (target * ease).toFixed(1) : Math.round(target * ease);
      el.textContent = pre + v + suf;
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateCounters(); });
  }, { threshold: 0.3 });
  document.querySelectorAll('.hero-trust, .stat-cards, [data-count]').forEach(el => io.observe(el));
}

/* ─── ACTIVE NAV ─── */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mob-link').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0];
    a.classList.toggle('active', href === page);
  });
}

/* ─── MOBILE MENU ─── */
function toggleMob() {
  document.querySelector('.mob-nav')?.classList.toggle('open');
}

/* ─── FAQs ─── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ─── PRODUCT TABS ─── */
function switchProdTab(tab, btn) {
  document.querySelectorAll('.pd-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.pd-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById('panel-' + tab);
  if (panel) panel.classList.add('active');
}

/* ─── DASHBOARD SECTIONS ─── */
function switchDash(sec, btn) {
  document.querySelectorAll('.d-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.d-nav-btn').forEach(b => b.classList.remove('active'));
  const section = document.getElementById('ds-' + sec);
  if (section) section.classList.add('active');
  if (btn) btn.classList.add('active');
}

/* ─── GALLERY ─── */
let _activeImg = 0;
let _galleryItems = [];

function initGallery(items) {
  _galleryItems = items || [];
  _activeImg = 0;
}
function selectImg(i) {
  _activeImg = i;
  document.querySelectorAll('.g-thumb').forEach((t, j) => t.classList.toggle('active', j === i));
  const item = _galleryItems[i];
  if (!item) return;
  const icon = document.getElementById('g-main-icon');
  const bg = document.getElementById('g-main-bg');
  if (icon) icon.textContent = item.icon;
  if (bg) bg.className = 'g-main-inner ' + item.bg;
}
function prevImg() { selectImg((_activeImg - 1 + _galleryItems.length) % _galleryItems.length); }
function nextImg() { selectImg((_activeImg + 1) % _galleryItems.length); }

/* ─── BAR CHART ─── */
function buildBarChart(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data.map(d => d.value), 1);
  el.innerHTML = data.map(d =>
    `<div class="bar-item">
      <div class="bar-fill" style="height:${Math.round((d.value / max) * 140)}px" title="₹${d.value.toLocaleString()}"></div>
      <div class="bar-lbl">${d.label}</div>
    </div>`
  ).join('');
}

/* ─── SCROLL TOP ─── */
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── PROGRESS BAR ─── */
function fillProgressBars() {
  document.querySelectorAll('.progress-fill[data-pct]').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.pct + '%'; }, 200);
  });
}

/* ─── PRODUCT CARD MAKER ─── */
function makeProductCard(p, listView) {
  const badgeCls = { sale: 'b-sale', new: 'b-new', hot: 'b-hot', bestseller: 'b-best' };
  const bc = badgeCls[p.badge] || '';
  const disc = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
  const wished = isWished(p.id);
  return `
    <div class="prod-card${listView ? ' list' : ''} reveal" onclick="location.href='product.html?id=${p.id}'" data-pid="${p.id}">
      <div class="pt" style="height:${listView ? 'auto' : '172px'}">
        <div class="pt-inner ${p.bg}" style="${listView ? 'min-height:108px' : ''}">
          <div class="pt-glow" style="background:var(--accent)"></div>
          <div class="pt-grid"></div>
          <div class="pt-cover">
            <span class="pt-cover-icon">${p.icon}</span>
            <div class="pt-cover-title">${p.title}</div>
            ${p.sub ? `<div class="pt-cover-sub">${p.sub}</div>` : ''}
          </div>
          ${p.badge ? `<div class="pt-badge"><span class="badge ${bc}">${p.badge.toUpperCase()}</span></div>` : ''}
          <div class="pt-rating">⭐ ${p.rating}</div>
        </div>
      </div>
      <div class="prod-info">
        <div class="prod-title">${p.title}</div>
        <div class="prod-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
          <span class="rating-val">${p.rating}</span>
          <span class="rating-cnt">(${p.reviews})</span>
          <span style="margin-left:auto;font-size:11px;color:var(--muted)">🛒 ${p.sales}+</span>
        </div>
        <div class="prod-footer">
          <div>
            <span class="prod-price">₹${p.price}</span>
            ${p.orig ? `<span class="prod-orig">₹${p.orig}</span>` : ''}
          </div>
          ${disc ? `<span class="badge b-sale">-${disc}%</span>` : ''}
        </div>
        <div class="prod-actions">
          <button class="btn btn-primary btn-sm" style="flex:1" onclick="event.stopPropagation();addToCart('${p.id}','${p.title}',${p.price},'${p.icon}','${p.cat}')">Add to Cart</button>
          <button class="btn btn-secondary btn-sm btn-icon" title="Wishlist" onclick="event.stopPropagation();toggleWishlist('${p.id}',this)">${wished ? '❤️' : '🤍'}</button>
        </div>
      </div>
    </div>`;
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  /* Apply saved theme */
  applyTheme(_theme);

  /* Canvas background */
  initCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); buildParticles(); }, { passive: true });

  /* Theme button */
  const themeBtn = document.querySelector('.theme-btn');
  if (themeBtn) {
    themeBtn.innerHTML = `${THEMES[_theme].icon} <span>${THEMES[_theme].name}</span>`;
    themeBtn.addEventListener('click', e => { e.stopPropagation(); toggleThemePanel(); });
  }
  document.addEventListener('click', e => {
    const panel = document.getElementById('theme-panel');
    const btn = document.querySelector('.theme-btn');
    if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  /* Mobile menu */
  document.querySelector('.mob-btn')?.addEventListener('click', toggleMob);
  document.addEventListener('click', e => {
    const mn = document.querySelector('.mob-nav');
    const mb = document.querySelector('.mob-btn');
    if (mn?.classList.contains('open') && !mn.contains(e.target) && !mb?.contains(e.target)) {
      mn.classList.remove('open');
    }
  });

  /* Search */
  initSearch();

  /* Reveal */
  initReveal();

  /* Counters */
  initCounters();

  /* Active nav */
  setActiveNav();

  /* Cart badge */
  loadCart(); updateCartBadge();

  /* Scroll top */
  initScrollTop();

  /* FAQ */
  initFAQ();

  /* Progress bars */
  fillProgressBars();

  /* Live toasts */
  startLiveToasts();
});
