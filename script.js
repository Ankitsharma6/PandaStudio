/* ════════════════════════════════════════
   PANDASTUDIOX v3.0 — COMPLETE JS
════════════════════════════════════════ */

// ── THEMES ──
const THEMES = {
  dark:     { name:'Dark Pro',     icon:'🌑', a:'#818cf8',b:'#6366f1', desc:'Deep purple dark' },
  cyberpunk:{ name:'Cyberpunk',    icon:'🔮', a:'#ff0080',b:'#7928ca', desc:'Neon pink & purple' },
  midnight: { name:'Midnight',     icon:'🌊', a:'#3b82f6',b:'#2563eb', desc:'Deep ocean blue' },
  forest:   { name:'Forest',       icon:'🌿', a:'#22c55e',b:'#16a34a', desc:'Dark forest green' },
  sunset:   { name:'Sunset',       icon:'🌅', a:'#f97316',b:'#ea580c', desc:'Warm orange glow' },
  rose:     { name:'Rose',         icon:'🌹', a:'#e11d48',b:'#be123c', desc:'Deep rose red' },
  light:    { name:'Light',        icon:'☀️', a:'#7c3aed',b:'#6d28d9', desc:'Clean white theme' },
};

const ACCENT_RGB = {
  dark:'129,140,248', cyberpunk:'255,0,128', midnight:'59,130,246',
  forest:'34,197,94', sunset:'249,115,22', rose:'225,29,72', light:'124,58,237'
};

let currentTheme = localStorage.getItem('psx-theme') || 'dark';

function applyTheme(key) {
  currentTheme = key;
  localStorage.setItem('psx-theme', key);
  document.documentElement.setAttribute('data-theme', key === 'dark' ? '' : key);
  document.documentElement.style.setProperty('--accent-rgb', ACCENT_RGB[key] || ACCENT_RGB.dark);
  document.querySelectorAll('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === key));
  const btn = document.querySelector('.theme-btn');
  if (btn) {
    btn.querySelector('.ti')?.parentElement && (btn.innerHTML = `${THEMES[key].icon} <span style="font-size:13px">${THEMES[key].name}</span>`);
  }
  initBgCanvas(); // redraw background with new theme colors
}

function buildThemePanel() {
  const panel = document.getElementById('theme-panel');
  if (!panel) return;
  panel.innerHTML = `<div class="theme-panel-title">Choose Theme</div>` +
    Object.entries(THEMES).map(([k,t]) => `
      <button class="theme-option${currentTheme===k?' active':''}" data-theme="${k}" onclick="applyTheme('${k}')">
        <div class="theme-swatch" style="background:linear-gradient(135deg,${t.a},${t.b})"></div>
        <div style="flex:1">
          <div>${t.icon} ${t.name}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:1px">${t.desc}</div>
        </div>
        <div class="check">✓</div>
      </button>`
    ).join('');
}

function toggleThemePanel() {
  const panel = document.getElementById('theme-panel');
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) buildThemePanel();
}

// ── ANIMATED CANVAS BACKGROUND ──
let bgAnimFrame;
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  cancelAnimationFrame(bgAnimFrame);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const theme = THEMES[currentTheme] || THEMES.dark;
  const isLight = currentTheme === 'light';

  // Parse accent colors from ACCENT_RGB
  const rgb = (ACCENT_RGB[currentTheme] || '129,140,248').split(',').map(Number);
  const [r,g,b] = rgb;

  // Particles
  const particles = Array.from({length:60}, (_,i) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    size: Math.random() * 2.5 + .5,
    alpha: Math.random() * .5 + .1,
    pulse: Math.random() * Math.PI * 2,
  }));

  // Floating orbs
  const orbs = Array.from({length:4}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 300 + 150,
    vx: (Math.random() - .5) * .25,
    vy: (Math.random() - .5) * .25,
    alpha: Math.random() * .12 + .04,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    // Orbs
    orbs.forEach(orb => {
      orb.x += orb.vx; orb.y += orb.vy;
      if (orb.x < -orb.r) orb.x = canvas.width + orb.r;
      if (orb.x > canvas.width + orb.r) orb.x = -orb.r;
      if (orb.y < -orb.r) orb.y = canvas.height + orb.r;
      if (orb.y > canvas.height + orb.r) orb.y = -orb.r;
      const g = ctx.createRadialGradient(orb.x,orb.y,0,orb.x,orb.y,orb.r);
      g.addColorStop(0, `rgba(${r},${g_},${b},${orb.alpha})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
    });

    // Grid lines
    if (!isLight) {
      ctx.strokeStyle = `rgba(${r},${g_},${b},0.04)`;
      ctx.lineWidth = 1;
      const gs = 64;
      for (let x = 0; x < canvas.width; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    }

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      const a = p.alpha * (.6 + .4 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g_},${b},${a})`;
      ctx.fill();
    });

    bgAnimFrame = requestAnimationFrame(draw);
  }
  // workaround for variable name collision
  const g_ = g;
  draw();
}

// ── CART ──
let cart = JSON.parse(localStorage.getItem('psx-cart') || '[]');
let appliedCoupon = null;

const COUPONS = {
  'PANDA20': { pct:20, label:'20% OFF' },
  'GAMER50': { pct:50, label:'50% OFF' },
  'SAVE100': { flat:100, label:'₹100 OFF' },
  'NEWUSER': { pct:30, label:'30% OFF' },
};

function saveCart() {
  localStorage.setItem('psx-cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, title, price, emoji, cat) {
  const ex = cart.find(c => c.id === id);
  if (ex) { ex.qty = (ex.qty||1) + 1; }
  else { cart.push({id, title, price:Number(price)||0, emoji:emoji||'📦', cat:cat||'', qty:1}); }
  saveCart();
  showToast({icon:'🛒', title:'Added to Cart!', desc:`${title} has been added.`});
  animateCartBtn();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty||1) + delta);
  saveCart();
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateCartBadge() {
  const total = cart.reduce((a,c) => a + (c.qty||1), 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.classList.toggle('show', total > 0);
  });
}

function animateCartBtn() {
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.style.transform = 'scale(1.25)';
    btn.style.borderColor = 'var(--accent)';
    setTimeout(() => { btn.style.transform = ''; btn.style.borderColor = ''; }, 280);
  });
}

function getCartTotals() {
  let sub = cart.reduce((a,c) => a + ((c.price||0)*(c.qty||1)), 0);
  let disc = 0;
  if (appliedCoupon) {
    const cp = COUPONS[appliedCoupon];
    disc = cp.pct ? Math.round(sub * cp.pct/100) : Math.min(cp.flat||0, sub);
  }
  return {subtotal:sub, discount:disc, total:Math.max(0,sub-disc)};
}

function applyCoupon(code) {
  const key = (code||'').toUpperCase().trim();
  if (COUPONS[key]) {
    appliedCoupon = key;
    showToast({icon:'🎟️', title:'Coupon Applied!', desc:COUPONS[key].label});
    return true;
  }
  showToast({icon:'❌', title:'Invalid Code', desc:'Try PANDA20 or GAMER50'});
  return false;
}

// ── WISHLIST ──
let wishlist = JSON.parse(localStorage.getItem('psx-wishlist')||'[]');

function toggleWishlist(id, btnEl) {
  const idx = wishlist.indexOf(String(id));
  if (idx > -1) {
    wishlist.splice(idx,1);
    if (btnEl) { btnEl.textContent='🤍'; btnEl.title='Add to Wishlist'; }
    showToast({icon:'💔', title:'Removed', desc:'Removed from wishlist'});
  } else {
    wishlist.push(String(id));
    if (btnEl) { btnEl.textContent='❤️'; btnEl.title='Remove from Wishlist'; }
    showToast({icon:'❤️', title:'Wishlisted!', desc:'Added to your wishlist'});
  }
  localStorage.setItem('psx-wishlist', JSON.stringify(wishlist));
}

function isWishlisted(id) { return wishlist.includes(String(id)); }

// ── TOAST ──
let toastTimer;
const LIVE_TOASTS = [
  {icon:'🎉', title:'New Sale!', desc:'Rahul S. just purchased Gaming Thumbnail Pack'},
  {icon:'💰', title:'₹2,400 Earned', desc:'DesignMaster received a payout'},
  {icon:'⭐', title:'5-Star Review', desc:'Priya K. rated Minecraft Map Bundle'},
  {icon:'🔥', title:'Flash Sale!', desc:'50% off all Thumbnail Packs — today only!'},
  {icon:'🏆', title:'Milestone!', desc:'GamingPro_X hit 5,000 total sales'},
  {icon:'🆕', title:'New Drop', desc:'Roblox GFX Pack v2 is now live'},
  {icon:'🎮', title:'Hot Product', desc:'Discord Bot Premium trending now'},
];
let liveToastIdx = 0;

function showToast({icon, title, desc}) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-icon">${icon}</span><div class="toast-body"><div class="toast-title">${title}</div>${desc?`<div class="toast-desc">${desc}</div>`:''}</div><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(110%)'; t.style.transition='all .4s ease'; setTimeout(()=>t.remove(),400); }, 5000);
}

function startLiveToasts() {
  setTimeout(() => {
    showToast(LIVE_TOASTS[liveToastIdx++ % LIVE_TOASTS.length]);
    setInterval(() => showToast(LIVE_TOASTS[liveToastIdx++ % LIVE_TOASTS.length]), 10000);
  }, 4000);
}

// ── SEARCH ──
const PRODUCTS_DB = [
  {id:'gtp',  icon:'🎮', title:'Gaming Thumbnail Pack',    cat:'Thumbnails', price:299, url:'product.html'},
  {id:'mmb',  icon:'⛏️', title:'Minecraft Map Bundle',     cat:'Minecraft',  price:499, url:'product.html'},
  {id:'dbp',  icon:'💬', title:'Discord Bot Premium',      cat:'Discord',    price:499, url:'product.html'},
  {id:'ytp',  icon:'📺', title:'YouTube Thumbnail Pack',   cat:'Thumbnails', price:349, url:'product.html'},
  {id:'rgfx', icon:'🎲', title:'Roblox GFX Pack',          cat:'Roblox',     price:399, url:'product.html'},
  {id:'muik', icon:'🖥️', title:'Modern UI Kit',            cat:'UI Kits',    price:599, url:'product.html'},
  {id:'aig',  icon:'🤖', title:'AI Image Generator',       cat:'AI Tools',   price:699, url:'product.html'},
  {id:'gdc',  icon:'🕹️', title:'Game Development Course',  cat:'Games',      price:1499,url:'product.html'},
  {id:'pop',  icon:'📡', title:'Premium Overlays Pack',    cat:'Graphics',   price:299, url:'product.html'},
  {id:'wtp',  icon:'🌐', title:'Website Template Pack',    cat:'Templates',  price:499, url:'product.html'},
  {id:'tpack',icon:'⛏️', title:'Minecraft Texture Pack',   cat:'Minecraft',  price:249, url:'product.html'},
  {id:'srcmc', icon:'💻', title:'Minecraft Server Source', cat:'Source Code', price:899,url:'product.html'},
];

function initSearch() {
  const inputs = document.querySelectorAll('.search-input');
  inputs.forEach(input => {
    const dropdown = input.nextElementSibling;
    if (!dropdown || !dropdown.classList.contains('search-dropdown')) return;
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        if (!q) { dropdown.classList.remove('open'); return; }
        const res = PRODUCTS_DB.filter(p => p.title.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)).slice(0,6);
        if (!res.length) { dropdown.classList.remove('open'); return; }
        dropdown.innerHTML = res.map(p => `
          <div class="search-item" onclick="window.location='${p.url}'">
            <div class="search-item-thumb thumb-${p.cat.toLowerCase().replace(/\s/g,'')}" style="font-size:22px">${p.icon}</div>
            <div class="search-item-info">
              <div class="search-item-title">${p.title}</div>
              <div class="search-item-cat">${p.cat}</div>
            </div>
            <div class="search-item-price">₹${p.price}</div>
          </div>`).join('');
        dropdown.classList.add('open');
      }, 200);
    });
    input.addEventListener('keydown', e => { if(e.key==='Escape') dropdown.classList.remove('open'); });
    document.addEventListener('click', e => { if(!input.contains(e.target)&&!dropdown.contains(e.target)) dropdown.classList.remove('open'); });
  });
}

// ── REVEAL ON SCROLL ──
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e,i) => {
      if (e.isIntersecting) { setTimeout(()=>e.target.classList.add('in'), i*60); io.unobserve(e.target); }
    });
  }, {threshold:.1});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ── COUNTER ANIMATION ──
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count);
    const suf = el.dataset.suffix||'';
    const pre = el.dataset.prefix||'';
    const dur = 1800;
    const start = performance.now();
    const update = t => {
      const p = Math.min((t-start)/dur,1);
      const ease = 1-Math.pow(1-p,3);
      const v = target<10?(target*ease).toFixed(1):Math.round(target*ease);
      el.textContent = pre+v+suf;
      if(p<1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// ── TABS ──
function initTabs(containerSel, contentSel) {
  document.querySelectorAll(containerSel+' [data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      btn.closest(containerSel).querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(contentSel).forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === tab);
      });
    });
  });
}

// ── ACTIVE NAV ──
function setActiveNav() {
  const page = location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-link,.mobile-nav-link').forEach(a => {
    a.classList.toggle('active', (a.getAttribute('href')||'')=== page);
  });
}

// ── MOBILE MENU ──
function toggleMobileMenu() {
  document.querySelector('.mobile-nav')?.classList.toggle('open');
}

// ── SCROLL TO TOP ──
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
}

// ── FAQ ──
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── GALLERY ──
function initGallery() {
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainIcon = document.getElementById('main-prod-icon');
  const mainBg = document.getElementById('main-prod-bg');
  if (!thumbs.length) return;
  thumbs.forEach((t,i) => {
    t.addEventListener('click', () => {
      thumbs.forEach(th => th.classList.remove('active'));
      t.classList.add('active');
      if (mainIcon && t.dataset.icon) mainIcon.textContent = t.dataset.icon;
      if (mainBg && t.dataset.bg) { mainBg.className = 'gallery-main-inner ' + t.dataset.bg; }
    });
  });
}

// ── PRODUCT PAGE TABS ──
function switchProdTab(tab, btn) {
  document.querySelectorAll('.prod-tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.prod-tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-'+tab)?.classList.add('active');
}

// ── DASHBOARD SECTIONS ──
function switchDashSection(sec, btn) {
  document.querySelectorAll('.dash-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.dash-nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('dash-'+sec)?.classList.add('active');
  btn.classList.add('active');
}

// ── BAR CHART ──
function buildBarChart(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data.map(d=>d.value));
  el.innerHTML = data.map(d => `
    <div class="bar-item">
      <div class="bar-fill" style="height:${Math.round((d.value/max)*150)}px" title="₹${d.value.toLocaleString()}">
        <div class="bar-tooltip">₹${d.value.toLocaleString()}</div>
      </div>
      <div class="bar-label">${d.label}</div>
    </div>`).join('');
}

// ── FILTER TABS (SHOP) ──
function initFilterTabs() {
  document.querySelectorAll('[data-filter-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.filterGroup;
      const val = btn.dataset.filterVal || 'all';
      document.querySelectorAll(`[data-filter-group="${group}"]`).forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`[data-filter-target="${group}"]`).forEach(el => {
        const show = val==='all' || el.dataset.cat===val;
        el.style.display = show ? '' : 'none';
        if (show) { el.classList.remove('in'); setTimeout(()=>el.classList.add('in'),50); }
      });
      const found = document.getElementById('products-found-count');
      if (found) {
        const vis = document.querySelectorAll(`[data-filter-target="${group}"]:not([style*="none"])`).length;
        found.textContent = vis;
      }
    });
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // Theme
  document.documentElement.setAttribute('data-theme', currentTheme==='dark' ? '' : currentTheme);
  document.documentElement.style.setProperty('--accent-rgb', ACCENT_RGB[currentTheme]||ACCENT_RGB.dark);

  // Canvas BG
  initBgCanvas();
  window.addEventListener('resize', () => {
    const c = document.getElementById('bg-canvas');
    if (c) { c.width=innerWidth; c.height=innerHeight; }
  }, {passive:true});

  // Theme toggle
  const themeBtn = document.querySelector('.theme-btn');
  if (themeBtn) {
    themeBtn.innerHTML = `${THEMES[currentTheme].icon} <span>${THEMES[currentTheme].name}</span>`;
    themeBtn.addEventListener('click', e => { e.stopPropagation(); toggleThemePanel(); });
  }
  document.addEventListener('click', e => {
    const panel = document.getElementById('theme-panel');
    const btn = document.querySelector('.theme-btn');
    if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove('open');
  });

  // Mobile menu
  document.querySelector('.mobile-menu-btn')?.addEventListener('click', toggleMobileMenu);
  document.addEventListener('click', e => {
    const mn = document.querySelector('.mobile-nav');
    const mb = document.querySelector('.mobile-menu-btn');
    if (mn?.classList.contains('open') && !mn.contains(e.target) && !mb?.contains(e.target)) mn.classList.remove('open');
  });

  initSearch();
  initReveal();
  setActiveNav();
  updateCartBadge();
  initScrollTop();
  initFAQ();
  initGallery();
  initFilterTabs();
  startLiveToasts();

  // Counter trigger
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateCounters(); });
  }, {threshold:.3});
  document.querySelectorAll('.stat-cards,.hero-stats').forEach(el => io.observe(el));

  // Prod tabs
  document.querySelectorAll('.prod-tab').forEach(btn => {
    btn.addEventListener('click', () => switchProdTab(btn.dataset.panel, btn));
  });

  // Sort select
  document.getElementById('sort-select')?.addEventListener('change', function() {
    showToast({icon:'🔄', title:'Sorted!', desc:`Products sorted by ${this.options[this.selectedIndex].text}`});
  });
});
