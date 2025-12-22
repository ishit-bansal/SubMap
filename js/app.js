/**
 * SubMap - Subscription Cost Visualizer
 */

let subs = [];
let incomeState = { amount: 0, unit: 'hourly' };
let isDark = true;
let selectedSearchIndex = 0;
let searchResults = [];
let modalOpen = false;
let resizeTimeout = null;

const colors = [
  { id: 'purple', bg: '#2d1b4e', accent: '#b026ff', light: { bg: '#f3e8ff', accent: '#a855f7' } },
  { id: 'blue', bg: '#1e3a5f', accent: '#3b82f6', light: { bg: '#dbeafe', accent: '#3b82f6' } },
  { id: 'cyan', bg: '#164e63', accent: '#00f5ff', light: { bg: '#cffafe', accent: '#06b6d4' } },
  { id: 'green', bg: '#14532d', accent: '#39ff14', light: { bg: '#dcfce7', accent: '#22c55e' } },
  { id: 'yellow', bg: '#422006', accent: '#ffff00', light: { bg: '#fef9c3', accent: '#eab308' } },
  { id: 'orange', bg: '#431407', accent: '#ff6b00', light: { bg: '#ffedd5', accent: '#f97316' } },
  { id: 'pink', bg: '#500724', accent: '#ff2d95', light: { bg: '#fce7f3', accent: '#ec4899' } },
  { id: 'rose', bg: '#4c0519', accent: '#f43f5e', light: { bg: '#fee2e2', accent: '#f43f5e' } },
  { id: 'teal', bg: '#0d3331', accent: '#14b8a6', light: { bg: '#ccfbf1', accent: '#14b8a6' } },
  { id: 'indigo', bg: '#1e1b4b', accent: '#6366f1', light: { bg: '#e0e7ff', accent: '#6366f1' } },
  { id: 'lime', bg: '#1a2e05', accent: '#84cc16', light: { bg: '#ecfccb', accent: '#84cc16' } },
  { id: 'amber', bg: '#451a03', accent: '#f59e0b', light: { bg: '#fef3c7', accent: '#f59e0b' } },
  { id: 'red', bg: '#450a0a', accent: '#ef4444', light: { bg: '#fee2e2', accent: '#ef4444' } },
  { id: 'violet', bg: '#2e1065', accent: '#8b5cf6', light: { bg: '#ede9fe', accent: '#8b5cf6' } },
  { id: 'emerald', bg: '#022c22', accent: '#10b981', light: { bg: '#d1fae5', accent: '#10b981' } },
  { id: 'fuchsia', bg: '#4a044e', accent: '#d946ef', light: { bg: '#fae8ff', accent: '#d946ef' } },
];

let usedColors = new Set();

const defaultSubs = [
  { name: 'Netflix', domain: 'netflix.com', price: 17.99, cycle: 'Monthly', color: 'rose' },
  { name: 'Spotify', domain: 'spotify.com', price: 11.99, cycle: 'Monthly', color: 'green' },
  { name: 'Amazon Prime', domain: 'amazon.com', price: 14.99, cycle: 'Monthly', color: 'orange' },
  { name: 'iCloud+', domain: 'icloud.com', price: 2.99, cycle: 'Monthly', color: 'blue' },
];

function getUniqueColor() {
  const available = colors.filter(c => !usedColors.has(c.id));
  if (available.length === 0) { usedColors.clear(); return colors[Math.floor(Math.random() * colors.length)]; }
  const color = available[Math.floor(Math.random() * available.length)];
  usedColors.add(color.id);
  return color;
}

function updateUsedColors() { usedColors.clear(); subs.forEach(s => usedColors.add(s.color)); }

function getColor(colorId) {
  const c = colors.find(x => x.id === colorId) || colors[0];
  return isDark ? { bg: c.bg, accent: c.accent } : c.light;
}

function formatMoney(n) { n = Number.isFinite(n) ? n : 0; return n >= 1000 ? '$' + n.toFixed(0) : '$' + n.toFixed(2); }
function formatShort(n) { n = Number.isFinite(n) ? n : 0; if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'; if (n >= 1e4) return '$' + (n/1e3).toFixed(0) + 'k'; return n >= 100 ? '$' + n.toFixed(0) : '$' + n.toFixed(2); }
function toMonthly(sub) { if (sub.cycle === 'Yearly') return sub.price / 12; if (sub.cycle === 'Weekly') return sub.price * 4.33; return sub.price; }
function getMonthlyTotal() { return subs.reduce((sum, sub) => sum + toMonthly(sub), 0); }

function iconHtml(sub, className, withContainer = false) {
  if (!sub.url) return '<span class="iconify ' + className + ' text-gray-400" data-icon="ph:cube-bold"></span>';
  const domain = sub.url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const url = 'https://img.logo.dev/' + domain + '?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png';
  const img = '<img src="' + url + '" class="' + className + ' object-contain rounded" crossorigin="anonymous">';
  return withContainer ? '<div class="logo-container">' + img + '</div>' : img;
}

// Search
function openSearchDropdown() {
  const dropdown = document.getElementById('search-dropdown'), input = document.getElementById('main-search');
  if (dropdown && input) { dropdown.classList.remove('hidden'); document.body.classList.add('search-open'); selectedSearchIndex = 0; renderSearchResults(input.value); }
}

function closeSearchDropdown() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  document.body.classList.remove('search-open');
  selectedSearchIndex = 0;
}

function handleSearchInput(query) {
  selectedSearchIndex = 0;
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) { dropdown.classList.remove('hidden'); document.body.classList.add('search-open'); renderSearchResults(query); }
}

function handleSearchKeydown(e) {
  if (modalOpen) return;
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown || dropdown.classList.contains('hidden')) { if (e.key !== 'Escape' && e.key !== 'Tab') openSearchDropdown(); return; }
  
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedSearchIndex = Math.min(selectedSearchIndex + 1, searchResults.length - 1); updateSearchHighlight(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0); updateSearchHighlight(); }
  else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (searchResults[selectedSearchIndex]) { const item = searchResults[selectedSearchIndex]; item.type === 'preset' ? quickAddPreset(item.idx) : addCustomFromSearch(item.name); } }
  else if (e.key === 'Escape') { closeSearchDropdown(); document.getElementById('main-search').blur(); }
}

function updateSearchHighlight() {
  document.querySelectorAll('#search-dropdown .search-item').forEach((btn, i) => {
    btn.classList.toggle('search-selected', i === selectedSearchIndex);
    btn.classList.toggle('hover:bg-retro-border', i !== selectedSearchIndex);
  });
}

function renderSearchResults(query) {
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;
  
  const q = (query || '').toLowerCase().trim();
  let filtered = q.length > 0 ? presets.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q)) : presets;
  
  searchResults = [];
  let html = '';
  const byCategory = {};
  for (const p of filtered) { if (!byCategory[p.category]) byCategory[p.category] = []; byCategory[p.category].push(p); }
  
  for (const cat of Object.keys(byCategory)) {
    html += '<div class="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-black/30">' + cat + '</div>';
    for (const p of byCategory[cat]) {
      const idx = presets.indexOf(p), isSelected = searchResults.length === selectedSearchIndex;
      searchResults.push({ type: 'preset', idx });
      const logo = 'https://img.logo.dev/' + p.domain + '?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png';
      html += '<button onclick="quickAddPreset(' + idx + ')" class="search-item flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ' + (isSelected ? 'search-selected' : 'hover:bg-retro-border') + '">';
      html += '<div class="logo-container"><img src="' + logo + '" class="h-8 w-8 rounded object-contain"></div>';
      html += '<div class="flex-1 font-semibold text-white text-sm">' + p.name + '</div><div class="text-xs font-mono text-gray-400">$' + p.price + '</div></button>';
    }
  }
  
  if (q.length > 0) {
    searchResults.push({ type: 'custom', name: q });
    const isSelected = searchResults.length - 1 === selectedSearchIndex;
    html += '<div class="border-t border-white/10"><button onclick="addCustomFromSearch(\'' + q.replace(/'/g, "\\'") + '\')" class="search-item flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ' + (isSelected ? 'search-selected' : 'hover:bg-retro-border') + '">';
    html += '<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon-cyan/20 text-neon-cyan"><span class="iconify h-4 w-4" data-icon="ph:plus-bold"></span></div>';
    html += '<div class="flex-1"><div class="font-semibold text-neon-cyan text-sm">Add "' + q + '" manually</div></div></button></div>';
  }
  
  dropdown.innerHTML = html || '<div class="p-4 text-center text-gray-500 text-sm font-mono">No results found</div>';
}

function quickAddPreset(idx) {
  const preset = presets[idx]; if (!preset) return;
  playSound('add');
  subs.push({ id: Date.now().toString(), name: preset.name, price: preset.price, cycle: preset.cycle, url: preset.domain, color: getUniqueColor().id, date: new Date().toISOString().split('T')[0] });
  save(); closeSearchDropdown();
  const input = document.getElementById('main-search'); input.value = ''; input.focus();
}

function addCustomFromSearch(name) { playSound('click'); closeSearchDropdown(); document.getElementById('main-search').value = ''; openModalWithName(name); }

function openModalWithName(name) {
  const form = document.getElementById('sub-form'); if (form) form.reset();
  document.getElementById('entry-id').value = '';
  document.getElementById('name').value = name || '';
  document.getElementById('price').value = '';
  document.getElementById('cycle').value = 'Monthly';
  document.getElementById('url').value = '';
  updateFavicon(''); pickColor(getUniqueColor().id);
  document.getElementById('modal-title').innerText = 'Add Subscription';
  showModal();
  setTimeout(() => { const p = document.getElementById('price'); if (p) p.focus(); }, 100);
}

// Subscription List
function renderList() {
  const list = document.getElementById('sub-list-container'), clearBtn = document.getElementById('clear-btn');
  if (!list) return;
  
  if (subs.length === 0) { list.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xs font-mono">No subscriptions</div>'; if (clearBtn) clearBtn.classList.add('hidden'); return; }
  if (clearBtn) clearBtn.classList.remove('hidden');
  
  let html = '';
  for (const sub of subs) {
    const color = getColor(sub.color);
    html += '<div class="sub-item flex items-center gap-2 p-2 bg-retro-darker rounded-lg" data-id="' + sub.id + '">';
    html += '<div class="w-0.5 h-6 rounded-full shrink-0" style="background:' + color.accent + '"></div>' + iconHtml(sub, 'w-7 h-7', true);
    html += '<div class="flex-1 min-w-0"><div class="font-medium text-white text-xs truncate">' + sub.name + '</div>';
    html += '<div class="flex items-baseline text-[11px] font-mono"><span class="text-gray-400">$</span>';
    html += '<input type="number" step="0.01" value="' + sub.price + '" onchange="updateSubPrice(\'' + sub.id + '\',this.value)" onclick="this.select()" class="w-12 bg-transparent border-0 p-0 text-xs font-bold text-gray-300 focus:ring-0 focus:text-neon-cyan"/>';
    html += '<span class="text-gray-500 text-[9px]">/' + sub.cycle.toLowerCase().slice(0, 2) + '</span></div></div>';
    html += '<button onclick="removeSub(\'' + sub.id + '\')" class="delete-btn p-1 shrink-0"><span class="iconify h-4 w-4" data-icon="ph:x-bold"></span></button></div>';
  }
  list.innerHTML = html;
  updateUsedColors();
}

function updateSubPrice(id, val) { const sub = subs.find(s => s.id === id); if (sub) { sub.price = parseFloat(val) || 0; save(); } }
function removeSub(id) { playSound('remove'); subs = subs.filter(s => s.id !== id); save(); }
function clearAllSubs() { if (!confirm('Remove all subscriptions?')) return; playSound('remove'); subs = []; usedColors.clear(); save(); }

// Color Picker
function initColorPicker() {
  const container = document.getElementById('color-selector'); if (!container) return;
  container.innerHTML = colors.map(c => '<div onclick="pickColor(\'' + c.id + '\')" class="color-option cursor-pointer rounded h-5 border-2 border-transparent transition-all hover:scale-110" data-val="' + c.id + '" style="background:linear-gradient(135deg,' + c.bg + ',' + c.accent + ')"></div>').join('');
}

function pickColor(id) {
  document.getElementById('selected-color').value = id;
  document.querySelectorAll('.color-option').forEach(opt => { opt.classList.toggle('ring-2', opt.dataset.val === id); opt.classList.toggle('ring-neon-cyan', opt.dataset.val === id); });
}

let faviconDebounce = null;
function updateFavicon(urlInput) {
  clearTimeout(faviconDebounce);
  faviconDebounce = setTimeout(() => {
    const preview = document.getElementById('favicon-preview'); if (!preview) return;
    if (!urlInput) { preview.innerHTML = '<span class="iconify text-gray-600 h-6 w-6" data-icon="ph:globe-simple"></span>'; return; }
    const domain = urlInput.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (domain.length > 3) preview.innerHTML = '<img src="https://img.logo.dev/' + domain + '?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png" class="w-full h-full object-cover">';
  }, 400);
}

function handleFormSubmit(evt) {
  evt.preventDefault(); evt.stopPropagation();
  const existingId = document.getElementById('entry-id').value;
  const subData = { id: existingId || Date.now().toString(), name: document.getElementById('name').value, price: parseFloat(document.getElementById('price').value) || 0, cycle: document.getElementById('cycle').value, url: document.getElementById('url').value, color: document.getElementById('selected-color').value || getUniqueColor().id, date: document.getElementById('date').value || '' };
  if (existingId) { const idx = subs.findIndex(s => s.id === existingId); if (idx !== -1) subs[idx] = subData; }
  else { playSound('add'); subs.push(subData); }
  save(); hideModal();
}

// Income & Work Time
function handleIncomeChange() {
  incomeState.amount = parseFloat(document.getElementById('income-amount').value) || 0;
  incomeState.unit = document.getElementById('income-unit').value;
  saveIncome(incomeState); renderTotals();
}

function getHourlyRate() {
  const { amount, unit } = incomeState; if (amount <= 0) return 0;
  const rates = { hourly: 1, daily: 1/8, weekly: 1/40, monthly: 1/173 };
  return amount * (rates[unit] || 0);
}

function formatWorkTime(monthlyTotal) {
  const { amount, unit } = incomeState; if (amount <= 0) return '—';
  const yearlyTotal = monthlyTotal * 12, totalHours = yearlyTotal / getHourlyRate();
  switch (unit) {
    case 'hourly': const h = Math.floor(totalHours), m = Math.round((totalHours - h) * 60); return totalHours < 1 ? m + 'm' : h + 'h' + (m > 0 ? ' ' + m + 'm' : '');
    case 'daily': const d = totalHours / 8; return d < 1 ? Math.round(d * 8) + 'h' : d.toFixed(1) + 'd';
    case 'weekly': const w = totalHours / 40; return w < 1 ? (totalHours / 8).toFixed(1) + 'd' : w.toFixed(1) + 'w';
    case 'monthly': return ((yearlyTotal / (amount * 12)) * 100).toFixed(1) + '%';
    default: return '—';
  }
}

function updateTotals(monthlyTotal) {
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.innerText = val; };
  el('step-2-total', formatMoney(monthlyTotal));
  el('step-2-yearly', formatMoney(monthlyTotal * 12));
  el('time-worked', formatWorkTime(monthlyTotal));
}

function renderTotals() { updateTotals(getMonthlyTotal()); }

// Treemap Grid
function renderGrid() {
  const gridEl = document.getElementById('bento-grid'); if (!gridEl) return;
  const monthlyTotal = getMonthlyTotal();

  if (subs.length === 0) { gridEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm font-mono">Add subscriptions to visualize</div>'; updateTotals(monthlyTotal); return; }

  const bounds = gridEl.getBoundingClientRect();
  if (bounds.width < 50 || bounds.height < 50) { setTimeout(renderGrid, 100); return; }
  
  const items = subs.map(sub => ({ id: sub.id, name: sub.name, url: sub.url, color: sub.color, price: sub.price, cycle: sub.cycle, cost: toMonthly(sub) })).sort((a, b) => b.cost - a.cost);
  const treemap = new Treemap(bounds.width, bounds.height);
  const cells = treemap.layout(items.map((item, idx) => ({ ...item, val: item.cost, idx })));
  
  let html = '';
  cells.forEach((cell, i) => {
    const percent = monthlyTotal > 0 ? (cell.cost / monthlyTotal) * 100 : 0, color = getColor(cell.color), minDim = Math.min(cell.w, cell.h);
    const clampedPct = Math.max(3, Math.min(60, percent));
    const padding = Math.round(Math.max(6, Math.min(minDim * 0.08, 14)) + (clampedPct / 60) * 6);
    const borderRadius = Math.round(Math.max(6, Math.min(minDim * 0.12, 18)) + (clampedPct / 60) * 4);
    const priceFont = Math.max(12, Math.min(14 + (clampedPct / 60) * 36, Math.min((cell.w - padding*2) * 0.2, (cell.h - padding*2) * 0.32), 48));
    const titleFont = Math.max(10, Math.min(11 + (clampedPct / 60) * 14, priceFont * 0.6, 24));
    const iconSize = Math.max(18, Math.min(20 + (clampedPct / 60) * 32, (cell.h - padding*2) * 0.35, (cell.w - padding*2) * 0.4, 52));
    const priceLabel = formatShort(cell.cost);
    
    let content = '';
    if (minDim < 40) { const sz = Math.max(14, Math.min(iconSize, minDim * 0.55)); content = '<div class="flex items-center justify-center h-full">' + iconHtml(cell, 'w-[' + sz + 'px] h-[' + sz + 'px]') + '</div>'; }
    else if (minDim < 55) { const sz = Math.max(16, Math.min(iconSize, minDim * 0.45)); content = '<div class="flex flex-col items-center justify-center h-full gap-0.5">' + iconHtml(cell, 'w-[' + sz + 'px] h-[' + sz + 'px]') + '<div class="font-bold text-white font-mono" style="font-size:' + Math.min(priceFont, 13) + 'px">' + priceLabel + '</div></div>'; }
    else if (minDim < 80) { const sz = Math.max(18, Math.min(iconSize, (cell.w-padding*2) * 0.4, (cell.h-padding*2) * 0.32)); content = '<div class="flex flex-col items-center justify-center h-full gap-0.5 text-center">' + iconHtml(cell, 'w-[' + sz + 'px] h-[' + sz + 'px]') + '<div class="font-semibold text-white truncate w-full px-1" style="font-size:' + Math.min(titleFont, 12) + 'px">' + cell.name + '</div><div class="font-black text-white font-mono" style="font-size:' + Math.min(priceFont, 18) + 'px">' + priceLabel + '</div></div>'; }
    else { const showBadge = cell.w > 80 && cell.h > 65; content = '<div class="flex justify-between items-start">' + iconHtml(cell, 'w-[' + iconSize + 'px] h-[' + iconSize + 'px]') + (showBadge ? '<span class="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">' + Math.round(percent) + '%</span>' : '') + '</div><div class="mt-auto min-w-0"><div class="font-bold text-white truncate" style="font-size:' + titleFont + 'px">' + cell.name + '</div><div class="font-black text-white font-mono" style="font-size:' + priceFont + 'px">' + priceLabel + '</div></div>'; }
    
    html += '<div class="treemap-cell tile-enter" style="left:' + cell.x + 'px;top:' + cell.y + 'px;width:' + cell.w + 'px;height:' + cell.h + 'px;border-radius:' + borderRadius + 'px;animation-delay:' + (i * 50) + 'ms">';
    html += '<div class="treemap-cell-inner" style="background:linear-gradient(135deg,' + color.bg + ',' + color.accent + ');padding:' + padding + 'px;border-radius:' + borderRadius + 'px">' + content + '</div></div>';
  });

  gridEl.innerHTML = html;
  updateTotals(monthlyTotal);
}

function handleResize() { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(renderGrid, 150); }

// Theme
function toggleTheme() {
  playSound('theme'); isDark = !isDark;
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('submap_theme', isDark ? 'dark' : 'light');
  const icon = document.querySelector('#theme-btn .iconify');
  if (icon) icon.setAttribute('data-icon', isDark ? 'ph:moon-bold' : 'ph:sun-bold');
  renderList(); renderGrid();
}

function loadTheme() {
  isDark = localStorage.getItem('submap_theme') !== 'light';
  document.documentElement.classList.toggle('dark', isDark);
  const icon = document.querySelector('#theme-btn .iconify');
  if (icon) icon.setAttribute('data-icon', isDark ? 'ph:moon-bold' : 'ph:sun-bold');
}

// Init
function initDefaults() {
  if (subs.length === 0) {
    defaultSubs.forEach(def => subs.push({ id: Date.now().toString() + Math.random().toString(36).slice(2), name: def.name, price: def.price, cycle: def.cycle, url: def.domain, color: def.color, date: new Date().toISOString().split('T')[0] }));
    save();
  }
  updateUsedColors();
}

function syncIncomeInputs() {
  const a = document.getElementById('income-amount'), u = document.getElementById('income-unit');
  if (a) a.value = incomeState.amount || '';
  if (u) u.value = incomeState.unit || 'hourly';
}

document.addEventListener('click', e => { if (!document.getElementById('search-container')?.contains(e.target)) closeSearchDropdown(); });
document.addEventListener('keydown', e => { if (modalOpen && e.key === 'Enter' && !document.activeElement?.closest('#sub-form')) { e.preventDefault(); e.stopPropagation(); } });
window.addEventListener('resize', handleResize);

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
  
  const gridEl = document.getElementById('bento-grid');
  if (gridEl) new ResizeObserver(handleResize).observe(gridEl);
  
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
});
