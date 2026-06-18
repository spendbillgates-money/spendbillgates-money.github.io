// Spend Billionaire Money Simulator - Application Controller

// Global App State
const state = {
  fortune: 0,
  balance: 0,
  billionaireName: '',
  customerName: 'GUEST',
  cart: {}, // item.id -> quantity (number)
  activeCategory: 'All',
  displayedBalance: 0 // For rolling number animation
};

// Achievements Database
const achievements = [
  { id: 'fast-food', title: '🍔 Fast Food Lover', desc: 'Buy 100 or more Hot Dogs or Big Macs', icon: '🍔', check: (cart) => (cart['big-mac'] || 0) + (cart['hot-dog'] || 0) >= 100 },
  { id: 'space-lord', title: '🚀 Space Lord', desc: 'Buy at least 10 SpaceX Falcon 9 Rockets', icon: '🚀', check: (cart) => (cart['space-rocket'] || 0) >= 10 },
  { id: 'tycoon', title: '🏡 Property Tycoon', desc: 'Own 5 Mansions and 2 NYC Penthouses', icon: '🏡', check: (cart) => (cart['mansion'] || 0) >= 5 && (cart['penthouse-nyc'] || 0) >= 2 },
  { id: 'art-collector', title: '🎨 Lover of Fine Arts', desc: 'Buy the legendary Mona Lisa Painting', icon: '🎨', check: (cart) => (cart['mona-lisa-painting'] || 0) >= 1 },
  { id: 'golden-loo', title: '🚽 Gilded Life', desc: 'Buy a Golden Toilet', icon: '🚽', check: (cart) => (cart['golden-toilet'] || 0) >= 1 },
  { id: 'speed-demon', title: '🏎️ Speed Demon', desc: 'Buy a Ferrari, Speedboat, and Formula 1 Car', icon: '🏎️', check: (cart) => (cart['ferrari-supercar'] || 0) >= 1 && (cart['speedboat'] || 0) >= 1 && (cart['formula-1-car'] || 0) >= 1 },
  { id: 'half-spent', title: '💸 Halftime Spender', desc: 'Spend more than 50% of the fortune', icon: '💸', check: (cart, totalSpent, fortune) => (totalSpent / fortune) >= 0.5 },
  { id: 'broke', title: '📉 Broke Billionaire', desc: 'Spend more than 99.9% of the fortune', icon: '📉', check: (cart, totalSpent, fortune) => (totalSpent / fortune) >= 0.999 }
];

const unlockedAchievements = new Set();

const recoveryRates = {
  "Elon Musk": 2893,
  "Jeff Bezos": 2083,
  "Mark Zuckerberg": 1388,
  "Bill Gates": 578
};

const defaultHeadlines = [
  "Billionaire fortune simulation runs hot. Stay tuned for real-time parodic news updates.",
  "Financial analysts advise: virtual spending does not impact personal credit scores.",
  "Global wealth disparity visualized on a single webpage. Scroll to select items."
];

// Synthesize coin cash register "Cha-Ching" sound
function playChaChingSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.08); // E6

    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.25);

    // delayed sound
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(1975.53, ctx.currentTime + 0.22); // B6

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.07);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) { }
}

// Synthesize low click/sell sound
function playClickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) { }
}

// Synthesize retro fanfare sound for unlocking achievements
function playUnlockSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.28);
    });
  } catch (e) { }
}

// Synthesize shutter snapshot sound
function playShutterSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    source.stop(ctx.currentTime + 0.08);
  } catch (e) { }
}

// Initialize the Application
document.addEventListener('DOMContentLoaded', () => {
  initBillionaireState();
  initTheme();
  restructureReceiptSection();
  restructureScreenshotModal();
  injectNewsTicker();
  injectAchievementsPanel();
  injectCustomerNameInput();
  renderFilters();
  renderItems();
  updateUI();
  setupEventListeners();
  animateBalance();
});

// Inject customer name input as a separate card above category filter bar
function injectCustomerNameInput() {
  const grid = document.getElementById('items-grid');
  if (!grid) return;

  const card = document.createElement('div');
  card.className = 'hero-card';
  card.style.padding = '20px 30px';
  card.style.marginTop = '20px';
  card.style.marginBottom = '20px';
  card.style.display = 'flex';
  card.style.alignItems = 'center';
  card.style.justifyContent = 'space-between';
  card.style.flexWrap = 'wrap';
  card.style.gap = '15px';
  card.style.borderRadius = 'var(--radius-md)';
  card.style.textAlign = 'left';

  card.innerHTML = `
    <div style="flex-grow: 1;">
      <h3 style="font-size: 1.20rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">✍️ Customer Bill Profile</h3>
      <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px;">Enter your name to sign the printed computerized receipt slip.</p>
    </div>
    <div>
      <input type="text" id="customer-name-input" placeholder="GUEST" value="${state.customerName}" style="padding: 10px 20px; border: 1px solid var(--panel-border); background: var(--bg-color); color: var(--text-primary); border-radius: var(--radius-sm); outline: none; font-family:'Outfit', sans-serif; font-weight:700; text-transform:uppercase; text-align:center; transition: all 0.2s; min-width: 220px; font-size: 1rem;">
    </div>
  `;

  // Insert above filter bar / news ticker
  const filterBar = document.getElementById('filter-bar');
  if (filterBar) {
    filterBar.parentNode.insertBefore(card, filterBar);
  } else {
    grid.parentNode.insertBefore(card, grid);
  }

  const input = card.querySelector('#customer-name-input');
  input.addEventListener('input', (e) => {
    state.customerName = e.target.value.toUpperCase() || 'GUEST';
    
    // Dynamically sync value with the input inside receipt slip
    const receiptInput = document.getElementById('receipt-customer-input');
    if (receiptInput) {
      receiptInput.value = state.customerName;
    }
  });
}


// Setup Billionaire Fortune and Name from page globals
function initBillionaireState() {
  state.fortune = window.billionaireFortune || 100000000000; // Default $100B if not set
  state.balance = state.fortune;
  state.displayedBalance = state.fortune;
  state.billionaireName = window.billionaireName || 'Billionaire';

  // Initialize cart with 0 for all items
  items.forEach(item => {
    state.cart[item.id] = 0;
  });
}

// Setup Theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
}

// Restructure receipt section dynamically for computerized print styling
function restructureReceiptSection() {
  const section = document.getElementById('receipt-section');
  if (!section) return;
  section.className = 'receipt-section';
  section.style.background = 'none';
  section.style.border = 'none';
  section.style.boxShadow = 'none';
  section.innerHTML = `
    <div class="receipt-slip" id="receipt-slip"></div>
    <div class="receipt-actions">
      <button id="copy-receipt-btn" class="receipt-btn">📋 Copy Text Receipt</button>
      <button id="share-receipt-btn" class="receipt-btn primary">📤 Share Receipt</button>
    </div>
  `;
}

// Restructure screenshot modal dynamically to hold the receipt slip
function restructureScreenshotModal() {
  const modal = document.getElementById('screenshot-modal');
  if (!modal) return;
  modal.innerHTML = `
    <div class="screenshot-card-wrapper">
      <button id="screenshot-close" class="screenshot-close">&times;</button>
      <div class="receipt-slip" id="screenshot-slip-inner"></div>
    </div>
  `;
}

// Inject News Ticker above items grid
function injectNewsTicker() {
  const grid = document.getElementById('items-grid');
  if (!grid) return;
  const ticker = document.createElement('div');
  ticker.className = 'news-ticker-container';
  ticker.innerHTML = `
    <div class="news-ticker-label">LATEST NEWS:</div>
    <div class="news-ticker-content">
      <span id="news-ticker-text" class="news-ticker-text">Markets steady as simulated spending begins. Pick your items to impact the news...</span>
    </div>
  `;
  grid.parentNode.insertBefore(ticker, grid);
}

// Inject Achievements panel below receipt section
function injectAchievementsPanel() {
  const receiptSec = document.getElementById('receipt-section');
  if (!receiptSec) return;
  const panel = document.createElement('section');
  panel.id = 'achievements-section';
  panel.className = 'hero-card';
  panel.style.textAlign = 'left';
  panel.style.marginTop = '40px';
  panel.innerHTML = `
    <h2>🏆 Wealth Achievements & Challenges</h2>
    <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.95rem;">Unlock special titles by spending in parodic and custom ways!</p>
    <div class="achievements-grid" id="achievements-grid"></div>
  `;
  receiptSec.parentNode.insertBefore(panel, receiptSec.nextSibling);
  renderAchievementsGrid();
}

// Render Filters
function renderFilters() {
  const filterContainer = document.getElementById('filter-bar');
  if (!filterContainer) return;

  // Extract unique categories
  const categories = ['All', ...new Set(items.map(item => item.category))];

  filterContainer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${cat === state.activeCategory ? 'active' : ''}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = cat;
      renderItems();
    });
    filterContainer.appendChild(btn);
  });
}

// Format currency helper
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

// Render Item Cards Grid
function renderItems() {
  const grid = document.getElementById('items-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const filteredItems = state.activeCategory === 'All'
    ? items
    : items.filter(item => item.category === state.activeCategory);

  filteredItems.forEach(item => {
    const qty = state.cart[item.id] || 0;

    // Create card
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="item-img-container">
        <span class="item-badge">${item.category}</span>
        <img class="item-img" src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="item-info">
        <h3 class="item-name">${item.name}</h3>
        <div class="item-price">${formatCurrency(item.price)}</div>
        <div class="item-controls">
          <button class="control-btn sell" data-id="${item.id}" ${qty <= 0 ? 'disabled' : ''}>Sell</button>
          <input type="number" class="item-qty-input" data-id="${item.id}" value="${qty}" min="0">
          <button class="control-btn buy" data-id="${item.id}" ${state.balance < item.price ? 'disabled' : ''}>Buy</button>
        </div>
      </div>
    `;

    // Event listeners for this card's buttons and input
    const sellBtn = card.querySelector('.control-btn.sell');
    const buyBtn = card.querySelector('.control-btn.buy');
    const input = card.querySelector('.item-qty-input');

    sellBtn.addEventListener('click', () => adjustQuantity(item.id, -1));
    buyBtn.addEventListener('click', () => adjustQuantity(item.id, 1));

    input.addEventListener('change', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      setQuantity(item.id, val);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });

    grid.appendChild(card);
  });
}

// Adjust quantity helper
function adjustQuantity(id, delta) {
  const currentQty = state.cart[id] || 0;
  const newQty = Math.max(0, currentQty + delta);
  if (delta > 0) {
    playChaChingSound();
  } else {
    playClickSound();
  }
  setQuantity(id, newQty);
}

// Set exact quantity and recalculate balance
function setQuantity(id, newQty) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const currentQty = state.cart[id] || 0;
  const difference = newQty - currentQty;
  const costDifference = difference * item.price;

  if (state.balance - costDifference < 0) {
    // Cannot afford the target amount, buy the max possible instead
    const maxAffordable = currentQty + Math.floor(state.balance / item.price);
    state.cart[id] = maxAffordable;
  } else {
    state.cart[id] = newQty;
  }

  recalculateBalance();
  updateUI();
  updateCardStates();
  checkAchievements();
  updateNewsTicker();
}

// Recalculate balance from state.cart
function recalculateBalance() {
  let totalSpent = 0;
  items.forEach(item => {
    const qty = state.cart[item.id] || 0;
    totalSpent += qty * item.price;
  });
  state.balance = state.fortune - totalSpent;
}

// Smoothly animate the balance rolling display
function animateBalance() {
  const diff = state.balance - state.displayedBalance;

  if (Math.abs(diff) < 1) {
    state.displayedBalance = state.balance;
  } else {
    state.displayedBalance += diff * 0.15;
  }

  const balanceEl = document.getElementById('balance-number');
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(state.displayedBalance);
  }

  requestAnimationFrame(animateBalance);
}

// Update general UI components (Sticky bar progress, Receipt)
function updateUI() {
  const totalSpent = state.fortune - state.balance;
  const spendPercentage = (totalSpent / state.fortune) * 100;

  // Update progress bar
  const progressBar = document.getElementById('spending-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, spendPercentage)}%`;
  }

  // Update stats labels
  const spentLabel = document.getElementById('stat-spent');
  const percentLabel = document.getElementById('stat-percent');
  if (spentLabel) spentLabel.textContent = `Spent: ${formatCurrency(totalSpent)}`;
  if (percentLabel) percentLabel.textContent = `${spendPercentage.toFixed(4)}% Spent`;

  renderReceipt(totalSpent);
}

// Update Buy/Sell disabled states and input values on cards without full re-render
function updateCardStates() {
  const cards = document.querySelectorAll('.item-card');
  cards.forEach(card => {
    const id = card.dataset.id;
    const item = items.find(i => i.id === id);
    if (!item) return;

    const qty = state.cart[id] || 0;
    const sellBtn = card.querySelector('.control-btn.sell');
    const buyBtn = card.querySelector('.control-btn.buy');
    const input = card.querySelector('.item-qty-input');

    if (input) input.value = qty;
    if (sellBtn) sellBtn.disabled = qty <= 0;
    if (buyBtn) buyBtn.disabled = state.balance < item.price;
  });
}

// Global transaction id, cashier, and time (so they remain constant during session)
const transactionId = Math.floor(100000 + Math.random() * 900000);
const transactionDate = new Date();
const cashiers = [
  "STEVE JOBS CLONE",
  "ROBO-INTERN v4",
  "HAL 9000",
  "SATO-SHI NAKAMOTO",
  "DOGECOIN SHIBA",
  "WALL STREET INTERN",
  "RICH UNCLE PENNYBAGS",
  "A FRIENDLY COIN BOT",
  "MR. MONOPOLY",
  "JARVIS v2",
  "ELON'S ANDROID",
  "METAVERSE AVATAR",
  "PARODY CASHIER",
  "SAM ALTMAN'S AGENT",
  "ZUCK'S VR CLONE",
  "SILICON VALLEY HUSTLER",
  "CRYPTO BRO CHAD",
  "WALL STREET BULL",
  "FED MONEY PRINTER",
  "BORED APE #4928",
  "PELOSI'S STOCK BOT",
  "AI OVERLORD",
  "COFFEE-DRIVEN CODER",
  "TECH SUPPORT SCAMMER",
  "BURNOUT STARTUP CTO",
  "VENTURE CAPITALIST BOT",
  "PONZI SCHEME MANAGER",
  "MARGIN CALL LIQUIDATOR",
  "DOGE DEVELOPER",
  "GEMINI TWIN A",
  "GEMINI TWIN B",
  "CLIPPY THE ASSISTANT",
  "WINRAR SALESMAN",
  "NIGERIAN PRINCE",
  "WEB3 EVANGELIST",
  "GPU BLACKMARKETEER",
  "CYBERPUNK MERCHANT",
  "CYBERTRUCK AUTOPILOT",
  "STARSHIP LAUNCH CONTROLLER",
  "WINDOWS 95 WIZARD",
  "DIAL-UP MODEM SOUND",
  "AI CO-PILOT",
  "SILICON VALLEY LANDLORD",
  "NFT SCREENSHOTTER",
  "INFINITE MONEY GLITCH",
  "FRACTIONAL BANKER",
  "TAX HAVEN CONSULTANT",
  "MEGACORP EXECUTIVE",
  "BILL GATES' MICROCHIP"
];
const cashierName = cashiers[Math.floor(Math.random() * cashiers.length)];

// Render Receipt Box
function renderReceipt(totalSpent) {
  const receiptSec = document.getElementById('receipt-section');
  const receiptSlip = document.getElementById('receipt-slip');

  if (!receiptSec || !receiptSlip) return;

  const purchased = items.filter(item => (state.cart[item.id] || 0) > 0);

  if (purchased.length === 0) {
    receiptSec.style.display = 'none';
    return;
  }

  receiptSec.style.display = 'block';

  // Calculate worker years and billionaire earn-back time
  const workerYears = totalSpent / 50000;
  let workerText = '';
  if (workerYears < 1) {
    workerText = `${(workerYears * 12).toFixed(1)} MONTHS`;
  } else {
    workerText = `${workerYears.toLocaleString(undefined, { maximumFractionDigits: 0 })} YEARS`;
  }

  const rate = recoveryRates[state.billionaireName] || 500;
  const secondsToEarnBack = totalSpent / rate;
  let earnBackText = '';
  if (secondsToEarnBack < 60) {
    earnBackText = `${secondsToEarnBack.toFixed(0)} SECONDS`;
  } else if (secondsToEarnBack < 3600) {
    earnBackText = `${(secondsToEarnBack / 60).toFixed(1)} MINUTES`;
  } else if (secondsToEarnBack < 86400) {
    earnBackText = `${(secondsToEarnBack / 3600).toFixed(1)} HOURS`;
  } else {
    earnBackText = `${(secondsToEarnBack / 86400).toFixed(1)} DAYS`;
  }

  // Construct thermal receipt slip HTML
  let slipHtml = `
    <div class="receipt-slip-title">BILLIONAIRE SHOP</div>
    <div class="receipt-slip-subtitle">SILICON VALLEY, CA 94025</div>
    <div class="receipt-slip-subtitle">TEL: 1-800-SPEND-BIG</div>
    <div class="receipt-slip-divider"></div>
    <div class="receipt-slip-meta">
      <div class="receipt-slip-meta-line">
        <span>DATE: ${transactionDate.toLocaleDateString()}</span>
        <span>TIME: ${transactionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="receipt-slip-meta-line">
        <span>TRANS: #882${transactionId}</span>
        <span>CASHIER: ${cashierName}</span>
      </div>
    </div>
    <div class="receipt-slip-divider"></div>
    <div class="receipt-slip-items-header">
      <span>ITEM DESCRIPTION</span>
      <span>AMOUNT</span>
    </div>
    <div class="receipt-slip-items">
  `;

  purchased.forEach(item => {
    const qty = state.cart[item.id];
    const totalItemCost = qty * item.price;
    slipHtml += `
      <div class="receipt-slip-line">
        <div class="receipt-slip-item-left">
          <span>${item.name} x${qty}</span>
        </div>
        <span class="receipt-slip-item-price">${formatCurrency(totalItemCost)}</span>
      </div>
    `;
  });

  slipHtml += `
    </div>
    <div class="receipt-slip-divider"></div>
    <div class="receipt-slip-summary">
      <div class="receipt-slip-summary-line">
        <span>SUBTOTAL:</span>
        <span>${formatCurrency(totalSpent)}</span>
      </div>
      <div class="receipt-slip-summary-line">
        <span>TAX (0.0%):</span>
        <span>$0</span>
      </div>
      <div class="receipt-slip-summary-line bold">
        <span>TOTAL SPENT:</span>
        <span>${formatCurrency(totalSpent)}</span>
      </div>
      <div class="receipt-slip-summary-line">
        <span>BAL REMAINING:</span>
        <span>${formatCurrency(state.balance)}</span>
      </div>
    </div>
    <div class="receipt-slip-divider"></div>
    <div class="receipt-slip-meta" style="font-size:0.75rem; text-align:center; gap:4px; line-height:1.3; color:#444 !important;">
      <div style="font-weight:700;">A MIDDLE-CLASS WORKER ($50K/YR) WOULD TAKE</div>
      <div style="font-size:0.85rem; font-weight:bold; color:#000 !important;">${workerText} OF LABOR TO AFFORD THIS CART!</div>
      <div style="margin-top:4px; font-weight:700;">${state.billionaireName.toUpperCase()} RECOVERS THIS SPENT SUM IN</div>
      <div style="font-size:0.85rem; font-weight:bold; color:#000 !important;">${earnBackText} ON AVERAGE.</div>
    </div>
    <div class="receipt-slip-divider"></div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:6px; margin: 15px 0 10px;">
      <span style="font-size: 0.72rem; font-weight: 700; color: #555 !important; letter-spacing: 1.5px;">CUSTOMER SIGNATURE</span>
      <input type="text" id="receipt-customer-input" placeholder="SIGN HERE" value="${state.customerName}" style="background:none; border:none; border-bottom:1px dashed #1a1a1a; font-family:'Courier Prime', 'Courier New', monospace; font-size:1.05rem; font-weight:bold; color:#000 !important; outline:none; text-transform:uppercase; width:70%; text-align:center; padding:4px 0 2px;">
    </div>
    <div class="receipt-slip-double-divider"></div>
    <div class="receipt-slip-footer">
      THANK YOU FOR SPENDIN'!<br>
      WE HOPE TO SIMULATE AGAIN.
    </div>
    <div class="receipt-slip-barcode"></div>
    <div class="receipt-slip-barcode-text">*${state.billionaireName.replace(/\s+/g, '-').toUpperCase()}-SPENT*</div>
  `;

  receiptSlip.innerHTML = slipHtml;
}

// Generate Text Receipt for Copy
function generateTextReceipt() {
  const purchased = items.filter(item => (state.cart[item.id] || 0) > 0);
  if (purchased.length === 0) return '';

  const totalSpent = state.fortune - state.balance;
  let text = `========================================\n`;
  text += `             BILLIONAIRE SHOP           \n`;
  text += `         SILICON VALLEY, CA 94025       \n`;
  text += `========================================\n`;
  text += `DATE: ${transactionDate.toLocaleDateString()}      TIME: ${transactionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
  text += `TRANS: #882${transactionId}       CASHIER: ${cashierName}\n`;
  text += `========================================\n`;
  text += `ITEM DESCRIPTION                 AMOUNT\n`;
  text += `----------------------------------------\n`;

  purchased.forEach(item => {
    const qty = state.cart[item.id];
    const itemTotal = formatCurrency(qty * item.price);
    const line = `${item.name} x${qty}`;
    const spaces = ' '.repeat(Math.max(2, 40 - line.length - itemTotal.length));
    text += `${line}${spaces}${itemTotal}\n`;
  });

  text += `----------------------------------------\n`;
  text += `SUBTOTAL:                     ${formatCurrency(totalSpent)}\n`;
  text += `TAX (0.0%):                                  $0\n`;
  text += `TOTAL SPENT:                  ${formatCurrency(totalSpent)}\n`;
  text += `BAL REMAINING:                ${formatCurrency(state.balance)}\n`;
  text += `========================================\n`;
  text += `  Middle-class labor eq: ${totalSpent / 50000} yrs\n`;
  text += `  Billionaire earn eq:   ${(totalSpent / (recoveryRates[state.billionaireName] || 500) / 3600).toFixed(2)} hrs\n`;
  text += `----------------------------------------\n`;
  text += `CUSTOMER SIGNATURE: ____________________\n`;
  text += `NAME: ${state.customerName.toUpperCase()}\n`;
  text += `========================================\n`;
  text += `         THANK YOU FOR SPENDIN'!        \n`;
  text += `========================================`;

  return text;
}

// Copy Receipt to Clipboard
function copyReceipt() {
  const receiptText = generateTextReceipt();
  if (!receiptText) return;

  navigator.clipboard.writeText(receiptText)
    .then(() => {
      const copyBtn = document.getElementById('copy-receipt-btn');
      if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '📋 Copied!';
        copyBtn.classList.add('primary');
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove('primary');
        }, 2000);
      }
    })
    .catch(err => {
      console.error('Failed to copy receipt: ', err);
      alert('Could not copy to clipboard. Please take a screenshot!');
    });
}

// Show Screenshot Modal with summary
function showScreenshotModal() {
  const modal = document.getElementById('screenshot-modal');
  const slipInner = document.getElementById('screenshot-slip-inner');
  const mainSlip = document.getElementById('receipt-slip');

  if (!modal || !slipInner || !mainSlip) return;

  playShutterSound();

  // Clone the exact HTML content of the main receipt slip
  slipInner.innerHTML = mainSlip.innerHTML;

  // Disable the input on the screenshot view so it doesn't look like a textbox in screenshot
  const screenshotInput = slipInner.querySelector('#receipt-customer-input');
  if (screenshotInput) {
    screenshotInput.disabled = true;
    screenshotInput.style.borderBottom = 'none';
  }

  modal.style.display = 'flex';
}

function closeScreenshotModal() {
  const modal = document.getElementById('screenshot-modal');
  if (modal) modal.style.display = 'none';
}

// Check and trigger achievements
function checkAchievements() {
  const totalSpent = state.fortune - state.balance;
  achievements.forEach(ach => {
    if (unlockedAchievements.has(ach.id)) return;

    if (ach.check(state.cart, totalSpent, state.fortune)) {
      unlockedAchievements.add(ach.id);
      showToast(ach.title, ach.desc);
      playUnlockSound();
    }
  });
  renderAchievementsGrid();
}

function showToast(title, desc) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-icon">🏆</div>
    <div class="toast-content">
      <h4>Achievement Unlocked!</h4>
      <p><strong>${title}</strong>: ${desc}</p>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function renderAchievementsGrid() {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;

  grid.innerHTML = '';
  achievements.forEach(ach => {
    const isUnlocked = unlockedAchievements.has(ach.id);
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <h4>${ach.title}</h4>
        <p>${ach.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Update News Ticker parodies
function updateNewsTicker() {
  const tickerText = document.getElementById('news-ticker-text');
  if (!tickerText) return;

  const purchased = items.filter(item => (state.cart[item.id] || 0) > 0);
  if (purchased.length === 0) {
    tickerText.textContent = defaultHeadlines[Math.floor(Math.random() * defaultHeadlines.length)];
    return;
  }

  const headlines = [];

  if ((state.cart['big-mac'] || 0) + (state.cart['hot-dog'] || 0) >= 50) {
    headlines.push("CRITICAL DIET ALERT: Local citizen purchases enough fast food to feed a small town for a decade!");
  }
  if ((state.cart['space-rocket'] || 0) >= 3) {
    headlines.push("BREAKING: Private space race escalates as local billionaire shopper creates custom launchpad fleet.");
  }
  if ((state.cart['golden-toilet'] || 0) >= 5) {
    headlines.push("LUXURY MARKET UPDATE: Gold-plated toilet manufacturer reports record-breaking third quarter!");
  }
  if ((state.cart['mcdonalds-franchise'] || 0) >= 3) {
    headlines.push("FRANCHISE BOMB: Fast-food landscape shifts as local tycoon buys multiple McDonalds franchises.");
  }
  if ((state.cart['bitcoin'] || 0) >= 10) {
    headlines.push("CRYPTO WATCH: Bitcoin prices surge past all-time high as single buyer sweeps block order.");
  }
  if ((state.cart['nba-team'] || 0) + (state.cart['nfl-team'] || 0) >= 1) {
    headlines.push("SPORTS REPORT: Baffled sports anchors report local resident acquiring sports league franchises.");
  }
  if (state.fortune - state.balance > state.fortune * 0.5) {
    headlines.push("MARKET SHOCK: Bizarre spender spends more than half of the entire billionaire fortune!");
  }

  if (headlines.length === 0) {
    headlines.push("MARKET REPORT: Spender's shopping list is expanding. Global logistics networks prepare for delivery.");
  }

  tickerText.textContent = headlines[Math.floor(Math.random() * headlines.length)];
}

// Setup Event Listeners
function setupEventListeners() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const receiptSec = document.getElementById('receipt-section');
  if (receiptSec) {
    receiptSec.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'copy-receipt-btn') {
        copyReceipt();
      } else if (e.target && e.target.id === 'share-receipt-btn') {
        showScreenshotModal();
      }
    });

    // Listen for customer name changes on keyup/change without re-rendering everything
    receiptSec.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'receipt-customer-input') {
        state.customerName = e.target.value.toUpperCase() || 'GUEST';
        const topInput = document.getElementById('customer-name-input');
        if (topInput) {
          topInput.value = state.customerName;
        }
      }
    });
  }

  const closeBtn = document.getElementById('screenshot-close');
  if (closeBtn) closeBtn.addEventListener('click', closeScreenshotModal);

  const modal = document.getElementById('screenshot-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeScreenshotModal();
      }
    });
  }
}
