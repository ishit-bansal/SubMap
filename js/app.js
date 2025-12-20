/**
 * SubGrid - Subscription Cost Visualizer
 * 
 * HOW IT WORKS:
 * 1. Subscriptions are stored in localStorage as JSON
 * 2. Logos are fetched from logo.dev API using the domain name
 *    Example: https://img.logo.dev/netflix.com?token=...
 * 3. The treemap algorithm (squarified) divides the grid into rectangles
 *    proportional to each subscription's monthly cost
 * 4. Work time is calculated based on user's income and unit selection
 */

let subs = [];
let incomeState = { amount: 0, unit: 'hourly' };
let isDark = true;

// Color palette for subscription tiles
const colors = [
  { id: 'purple', bg: '#2d1b4e', accent: '#7c3aed', light: { bg: '#FAF5FF', accent: '#E9D5FF' } },
  { id: 'blue', bg: '#1e3a5f', accent: '#3b82f6', light: { bg: '#EFF6FF', accent: '#BFDBFE' } },
  { id: 'cyan', bg: '#164e63', accent: '#06b6d4', light: { bg: '#ECFEFF', accent: '#A5F3FC' } },
  { id: 'green', bg: '#14532d', accent: '#22c55e', light: { bg: '#F0FDF4', accent: '#BBF7D0' } },
  { id: 'yellow', bg: '#422006', accent: '#eab308', light: { bg: '#FEFCE8', accent: '#FEF08A' } },
  { id: 'orange', bg: '#431407', accent: '#f97316', light: { bg: '#FFF7ED', accent: '#FED7AA' } },
  { id: 'pink', bg: '#500724', accent: '#ec4899', light: { bg: '#FDF2F8', accent: '#FBCFE8' } },
  { id: 'rose', bg: '#4c0519', accent: '#f43f5e', light: { bg: '#FFF1F2', accent: '#FECDD3' } },
];

// Default subscriptions for new users
const defaultSubs = [
  { name: 'Netflix', domain: 'netflix.com', price: 17.99, cycle: 'Monthly', color: 'rose' },
  { name: 'Spotify', domain: 'spotify.com', price: 11.99, cycle: 'Monthly', color: 'green' },
  { name: 'Amazon Prime', domain: 'amazon.com', price: 14.99, cycle: 'Monthly', color: 'orange' },
  { name: 'iCloud+', domain: 'icloud.com', price: 2.99, cycle: 'Monthly', color: 'blue' },
];

const randColor = () => colors[Math.floor(Math.random() * colors.length)];

function getColor(colorId) {
  const c = colors.find(x => x.id === colorId) || randColor();
  return isDark ? { bg: c.bg, accent: c.accent } : c.light;
}

// Format money with appropriate precision
function formatMoney(amount) {
  const n = Number.isFinite(amount) ? amount : 0;
  return n >= 1000 ? '$' + n.toFixed(0) : '$' + n.toFixed(2);
}

function formatShort(amount) {
  const n = Number.isFinite(amount) ? amount : 0;
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return '$' + (n / 1_000).toFixed(0) + 'k';
  return n >= 100 ? '$' + n.toFixed(0) : '$' + n.toFixed(2);
}

// Convert any billing cycle to monthly cost
function toMonthly(sub) {
  if (sub.cycle === 'Yearly') return sub.price / 12;
  if (sub.cycle === 'Weekly') return sub.price * 4.33;
  return sub.price;
}

/**
 * Generate HTML for subscription icon/logo
 * Uses logo.dev API to fetch brand logos by domain name
 * Falls back to a generic icon if no domain is provided
 */
function iconHtml(sub, className) {
  if (!sub.url) {
    return '<span class="iconify ' + className + ' text-gray-400" data-icon="ph:cube-bold"></span>';
  }
  // Extract domain from URL (removes http://, https://, www.)
  const domain = sub.url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  // logo.dev provides high-quality brand logos via simple URL
  const logoUrl = 'https://img.logo.dev/' + domain + '?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png';
  return '<img src="' + logoUrl + '" class="' + className + ' object-contain rounded-lg" crossorigin="anonymous">';
}

function getMonthlyTotal() {
  return subs.reduce((sum, sub) => sum + toMonthly(sub), 0);
}

// ===== Search Dropdown =====
function openSearchDropdown() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) {
    dropdown.classList.remove('hidden');
    renderSearchResults(document.getElementById('main-search').value);
  }
}

function closeSearchDropdown() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
}

function handleSearchInput(query) {
  renderSearchResults(query);
}

function renderSearchResults(query) {
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;

  const q = (query || '').toLowerCase().trim();
  let results = presets;

  if (q.length > 0) {
    results = presets.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q)
    );
  }

  let html = '';

  // Custom add option
  if (q.length > 0) {
    html += '<button onclick="addCustomFromSearch(\'' + q.replace(/'/g, "\\'") + '\')" class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-retro-border transition-colors border-b border-retro-border">';
    html += '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neon-cyan/20 text-neon-cyan">';
    html += '<span class="iconify h-5 w-5" data-icon="ph:plus-bold"></span></div>';
    html += '<div><div class="font-semibold text-white">Add "' + q + '"</div>';
    html += '<div class="text-xs text-gray-500 font-mono">custom</div></div></button>';
  }

  // Group by category
  const byCategory = {};
  for (const p of results) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  for (const cat of Object.keys(byCategory)) {
    html += '<div class="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-retro-darker">' + cat + '</div>';
    for (const p of byCategory[cat]) {
      const idx = presets.indexOf(p);
      const logo = 'https://img.logo.dev/' + p.domain + '?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png';
      html += '<button onclick="quickAddPreset(' + idx + ')" class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-retro-border transition-colors">';
      html += '<img src="' + logo + '" class="h-8 w-8 rounded-lg object-contain">';
      html += '<div class="flex-1 font-semibold text-white text-sm">' + p.name + '</div>';
      html += '<div class="text-sm font-mono text-gray-400">$' + p.price + '</div></button>';
    }
  }

  dropdown.innerHTML = html || '<div class="p-6 text-center text-gray-500 font-mono">Start typing...</div>';
}

function quickAddPreset(idx) {
  const preset = presets[idx];
  if (!preset) return;
  subs.push({
    id: Date.now().toString(),
    name: preset.name,
    price: preset.price,
    cycle: preset.cycle,
    url: preset.domain,
    color: preset.color,
    date: new Date().toISOString().split('T')[0]
  });
  save();
  closeSearchDropdown();
  document.getElementById('main-search').value = '';
}

function addCustomFromSearch(name) {
  closeSearchDropdown();
  document.getElementById('main-search').value = '';
  openModalWithName(name);
}

function openModalWithName(name) {
  const form = document.getElementById('sub-form');
  if (form) form.reset();
  document.getElementById('entry-id').value = '';
  document.getElementById('name').value = name || '';
  document.getElementById('price').value = '';
  document.getElementById('cycle').value = 'Monthly';
  document.getElementById('url').value = '';
  updateFavicon('');
  pickColor(randColor().id);
  document.getElementById('modal-title').innerText = 'Add Subscription';
  showModal();
}

// ===== Subscription List =====
function renderList() {
  const listContainer = document.getElementById('sub-list-container');
  const clearBtn = document.getElementById('clear-btn');
  if (!listContainer) return;

  if (subs.length === 0) {
    listContainer.innerHTML = '<div class="text-center py-8 text-gray-500 text-sm font-mono">No subscriptions yet</div>';
    if (clearBtn) clearBtn.classList.add('hidden');
    return;
  }

  if (clearBtn) clearBtn.classList.remove('hidden'), clearBtn.classList.add('flex');

  let html = '';
  for (const sub of subs) {
    const color = getColor(sub.color);
    html += '<div class="sub-item flex items-center gap-3 p-3 bg-retro-card border border-retro-border rounded-xl group">';
    html += '<div class="w-1 h-8 rounded-full" style="background:linear-gradient(180deg,' + color.bg + ',' + color.accent + ')"></div>';
    html += iconHtml(sub, 'w-8 h-8');
    html += '<div class="flex-1 min-w-0">';
    html += '<div class="font-semibold text-white text-sm truncate">' + sub.name + '</div>';
    html += '<div class="flex items-center">';
    html += '<span class="text-xs font-mono text-gray-400">$</span>';
    html += '<input type="number" step="0.01" value="' + sub.price + '" onchange="updateSubPrice(\'' + sub.id + '\',this.value)" onclick="this.select()" class="w-14 text-xs font-mono text-gray-400 bg-transparent border-0 p-0 focus:ring-0 focus:text-neon-cyan"/>';
    html += '<span class="text-xs font-mono text-gray-500">/' + sub.cycle.toLowerCase().slice(0, 2) + '</span>';
    html += '</div></div>';
    html += '<button onclick="removeSub(\'' + sub.id + '\')" class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-neon-pink p-1 transition-all">';
    html += '<span class="iconify h-4 w-4" data-icon="ph:x-bold"></span></button></div>';
  }
  listContainer.innerHTML = html;
}

function updateSubPrice(id, val) {
  const sub = subs.find(s => s.id === id);
  if (sub) { sub.price = parseFloat(val) || 0; save(); }
}

function removeSub(id) {
  subs = subs.filter(s => s.id !== id);
  save();
}

function clearAllSubs() {
  if (!confirm('Remove all subscriptions?')) return;
  subs = [];
  save();
}

// ===== Color Picker =====
function initColorPicker() {
  const container = document.getElementById('color-selector');
  if (!container) return;
  let html = '';
  for (const c of colors) {
    html += '<div onclick="pickColor(\'' + c.id + '\')" class="color-option cursor-pointer rounded-lg h-8 border-2 border-transparent transition-all hover:scale-105" data-val="' + c.id + '" style="background:linear-gradient(135deg,' + c.bg + ',' + c.accent + ')"></div>';
  }
  container.innerHTML = html;
}

function pickColor(id) {
  document.getElementById('selected-color').value = id;
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.toggle('ring-2', opt.dataset.val === id);
    opt.classList.toggle('ring-neon-cyan', opt.dataset.val === id);
  });
}

let faviconDebounce = null;
function updateFavicon(urlInput) {
  clearTimeout(faviconDebounce);
  faviconDebounce = setTimeout(() => {
    const preview = document.getElementById('favicon-preview');
    if (!preview) return;
    if (!urlInput) {
      preview.innerHTML = '<span class="iconify text-gray-600 h-6 w-6" data-icon="ph:globe-simple"></span>';
      return;
    }
    const domain = urlInput.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (domain.length > 3) {
      const logoUrl = 'https://img.logo.dev/' + domain + '?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png';
      preview.innerHTML = '<img src="' + logoUrl + '" class="w-full h-full object-cover">';
    }
  }, 400);
}

function handleFormSubmit(evt) {
  evt.preventDefault();
  const existingId = document.getElementById('entry-id').value;
  const subData = {
    id: existingId || Date.now().toString(),
    name: document.getElementById('name').value,
    price: parseFloat(document.getElementById('price').value) || 0,
    cycle: document.getElementById('cycle').value,
    url: document.getElementById('url').value,
    color: document.getElementById('selected-color').value || randColor().id,
    date: document.getElementById('date').value || ''
  };

  if (existingId) {
    const idx = subs.findIndex(s => s.id === existingId);
    if (idx !== -1) subs[idx] = subData;
  } else {
    subs.push(subData);
  }
  save();
  hideModal();
}

// ===== Income & Work Time Calculation =====
function handleIncomeChange() {
  const amountInput = document.getElementById('income-amount');
  const unitSelect = document.getElementById('income-unit');
  incomeState.amount = parseFloat(amountInput.value) || 0;
  incomeState.unit = unitSelect.value;
  saveIncome(incomeState);
  renderTotals();
}

function getHourlyRate() {
  const { amount, unit } = incomeState;
  if (amount <= 0) return 0;
  switch (unit) {
    case 'hourly': return amount;
    case 'daily': return amount / 8;
    case 'weekly': return amount / 40;
    case 'monthly': return amount / 173; // avg work hours per month
    default: return 0;
  }
}

function formatWorkTime(monthlyTotal) {
  const { amount, unit } = incomeState;
  if (amount <= 0) return '—';

  const hourlyRate = getHourlyRate();
  const totalHours = monthlyTotal / hourlyRate;

  switch (unit) {
    case 'hourly':
      if (totalHours < 1) return Math.round(totalHours * 60) + 'm';
      const h = Math.floor(totalHours);
      const m = Math.round((totalHours - h) * 60);
      return h + 'h' + (m > 0 ? ' ' + m + 'm' : '');
    case 'daily':
      const days = totalHours / 8;
      return days < 1 ? Math.round(days * 8) + 'h' : days.toFixed(1) + ' days';
    case 'weekly':
      const weeks = totalHours / 40;
      return weeks < 1 ? Math.round(weeks * 5) + ' days' : weeks.toFixed(1) + ' weeks';
    case 'monthly':
      return ((monthlyTotal / amount) * 100).toFixed(1) + '%';
    default: return '—';
  }
}

function updateTotals(monthlyTotal) {
  const totalEl = document.getElementById('step-2-total');
  const yearlyEl = document.getElementById('step-2-yearly');
  const timeEl = document.getElementById('time-worked');
  const hintEl = document.getElementById('income-hint');

  if (totalEl) totalEl.innerText = formatMoney(monthlyTotal);
  if (yearlyEl) yearlyEl.innerText = formatMoney(monthlyTotal * 12);
  if (timeEl) timeEl.innerText = formatWorkTime(monthlyTotal);
}

function renderTotals() {
  updateTotals(getMonthlyTotal());
}

// ===== Treemap Grid Rendering =====
function renderGrid() {
  const gridEl = document.getElementById('bento-grid');
  if (!gridEl) return;

  const monthlyTotal = getMonthlyTotal();

  if (subs.length === 0) {
    gridEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm font-mono">Add subscriptions to visualize</div>';
    updateTotals(monthlyTotal);
    return;
  }

  const items = subs.map(sub => ({
    id: sub.id, name: sub.name, url: sub.url, color: sub.color,
    price: sub.price, cycle: sub.cycle, cost: toMonthly(sub)
  })).sort((a, b) => b.cost - a.cost);

  const bounds = gridEl.getBoundingClientRect();
  const gridWidth = bounds.width || 600;
  const gridHeight = bounds.height || 400;

  if (gridWidth < 50 || gridHeight < 50) {
    setTimeout(renderGrid, 100);
    return;
  }

  const treemapData = items.map((item, idx) => ({ ...item, val: item.cost, idx }));
  const treemap = new Treemap(gridWidth, gridHeight);
  const cells = treemap.layout(treemapData);

  let html = '';
  for (const cell of cells) {
    const percent = monthlyTotal > 0 ? (cell.cost / monthlyTotal) * 100 : 0;
    const color = getColor(cell.color);
    const minDim = Math.min(cell.w, cell.h);
    const clampedPct = Math.max(3, Math.min(60, percent));

    const padding = Math.round(Math.max(6, Math.min(minDim * 0.08, 14)) + (clampedPct / 60) * 6);
    const borderRadius = Math.round(Math.max(6, Math.min(minDim * 0.12, 18)) + (clampedPct / 60) * 4);
    const innerW = cell.w - padding * 2;
    const innerH = cell.h - padding * 2;

    const priceFont = Math.max(10, Math.min(12 + (clampedPct / 60) * 32, Math.min(innerW * 0.18, innerH * 0.3), 42));
    const titleFont = Math.max(8, Math.min(9 + (clampedPct / 60) * 12, priceFont * 0.55, 20));
    const iconSize = Math.max(14, Math.min(16 + (clampedPct / 60) * 28, innerH * 0.3, innerW * 0.35, 44));

    const isMicro = minDim < 40, isTiny = minDim < 55, isSmall = minDim < 80;
    let content = '';
    const priceLabel = formatShort(cell.cost);

    if (isMicro) {
      const sz = Math.max(10, Math.min(iconSize, minDim * 0.5));
      content = '<div class="flex items-center justify-center h-full">' + iconHtml(cell, 'w-[' + sz + 'px] h-[' + sz + 'px]') + '</div>';
    } else if (isTiny) {
      const sz = Math.max(12, Math.min(iconSize, minDim * 0.4));
      content = '<div class="flex flex-col items-center justify-center h-full gap-0.5">' + iconHtml(cell, 'w-[' + sz + 'px] h-[' + sz + 'px]') + '<div class="font-bold text-white font-mono" style="font-size:' + Math.min(priceFont, 12) + 'px">' + priceLabel + '</div></div>';
    } else if (isSmall) {
      const sz = Math.max(14, Math.min(iconSize, innerW * 0.35, innerH * 0.28));
      content = '<div class="flex flex-col items-center justify-center h-full gap-0.5 text-center">' + iconHtml(cell, 'w-[' + sz + 'px] h-[' + sz + 'px]') + '<div class="font-semibold text-white truncate w-full px-1" style="font-size:' + Math.min(titleFont, 11) + 'px">' + cell.name + '</div><div class="font-black text-white font-mono" style="font-size:' + Math.min(priceFont, 16) + 'px">' + priceLabel + '</div></div>';
    } else {
      const showBadge = cell.w > 80 && cell.h > 65;
      content = '<div class="flex justify-between items-start">' + iconHtml(cell, 'w-[' + iconSize + 'px] h-[' + iconSize + 'px]');
      if (showBadge) content += '<span class="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">' + Math.round(percent) + '%</span>';
      content += '</div><div class="mt-auto min-w-0"><div class="font-bold text-white truncate" style="font-size:' + titleFont + 'px">' + cell.name + '</div><div class="font-black text-white font-mono" style="font-size:' + priceFont + 'px">' + priceLabel + '</div></div>';
    }

    html += '<div class="treemap-cell" style="left:' + cell.x + 'px;top:' + cell.y + 'px;width:' + cell.w + 'px;height:' + cell.h + 'px;border-radius:' + borderRadius + 'px">';
    html += '<div class="treemap-cell-inner" style="background:linear-gradient(135deg,' + color.bg + ',' + color.accent + ');padding:' + padding + 'px;border-radius:' + Math.max(4, borderRadius - 2) + 'px">' + content + '</div></div>';
  }

  gridEl.innerHTML = html;
  updateTotals(monthlyTotal);
}

// ===== Theme Toggle =====
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('subgrid_theme', isDark ? 'dark' : 'light');
  renderList();
  renderGrid();
}

function loadTheme() {
  const saved = localStorage.getItem('subgrid_theme');
  isDark = saved !== 'light';
  document.documentElement.classList.toggle('dark', isDark);
}

// ===== Initialization =====
function initDefaults() {
  if (subs.length === 0) {
    for (const def of defaultSubs) {
      subs.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: def.name, price: def.price, cycle: def.cycle,
        url: def.domain, color: def.color,
        date: new Date().toISOString().split('T')[0]
      });
    }
    save();
  }
}

function syncIncomeInputs() {
  const amountInput = document.getElementById('income-amount');
  const unitSelect = document.getElementById('income-unit');
  if (amountInput) amountInput.value = incomeState.amount || '';
  if (unitSelect) unitSelect.value = incomeState.unit || 'hourly';
}

document.addEventListener('click', e => {
  const container = document.getElementById('search-container');
  if (container && !container.contains(e.target)) closeSearchDropdown();
});

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  incomeState = loadIncome();
  syncIncomeInputs();
  load();
  initDefaults();
  initColorPicker();
  renderList();
  requestAnimationFrame(() => requestAnimationFrame(renderGrid));
  renderTotals();
  
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
});
