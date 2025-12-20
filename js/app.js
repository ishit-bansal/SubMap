let subs = [];
let incomeState = { hourly: 0, daily: 0, weekly: 0, monthly: 0, lastType: null };
let searchOpen = false;

const colors = [
  { id: "purple", bg: "#FAF5FF", accent: "#E9D5FF" },
  { id: "blue", bg: "#EFF6FF", accent: "#BFDBFE" },
  { id: "cyan", bg: "#ECFEFF", accent: "#A5F3FC" },
  { id: "green", bg: "#F0FDF4", accent: "#BBF7D0" },
  { id: "yellow", bg: "#FEFCE8", accent: "#FEF08A" },
  { id: "orange", bg: "#FFF7ED", accent: "#FED7AA" },
  { id: "pink", bg: "#FDF2F8", accent: "#FBCFE8" },
  { id: "rose", bg: "#FFF1F2", accent: "#FECDD3" },
  { id: "slate", bg: "#F8FAFC", accent: "#E2E8F0" },
  { id: "indigo", bg: "#EEF2FF", accent: "#C7D2FE" },
  { id: "teal", bg: "#F0FDFA", accent: "#99F6E4" },
  { id: "amber", bg: "#FFFBEB", accent: "#FDE68A" },
];

const defaultSubs = [
  { name: "Netflix", domain: "netflix.com", price: 17.99, cycle: "Monthly", color: "rose" },
  { name: "Spotify", domain: "spotify.com", price: 11.99, cycle: "Monthly", color: "green" },
  { name: "Amazon Prime", domain: "amazon.com", price: 14.99, cycle: "Monthly", color: "orange" },
  { name: "iCloud+", domain: "icloud.com", price: 2.99, cycle: "Monthly", color: "blue" },
];

const randColor = () => colors[Math.floor(Math.random() * colors.length)];

function getColor(colorId) {
  const found = colors.find(c => c.id === colorId);
  return found ? found : randColor();
}

function formatMoney(amount, decimals = 2) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  if (safeAmount >= 1000) return "$" + safeAmount.toFixed(0);
  return "$" + safeAmount.toFixed(decimals);
}

function formatShort(amount) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  if (safeAmount >= 1_000_000) return "$" + (safeAmount / 1_000_000).toFixed(1) + "M";
  if (safeAmount >= 10_000) return "$" + (safeAmount / 1_000).toFixed(0) + "k";
  if (safeAmount >= 100) return "$" + safeAmount.toFixed(0);
  return "$" + safeAmount.toFixed(2);
}

function toMonthly(sub) {
  let monthly = sub.price;
  if (sub.cycle === "Yearly") monthly = sub.price / 12;
  if (sub.cycle === "Weekly") monthly = sub.price * 4.33;
  return monthly;
}

function iconHtml(sub, className) {
  if (!sub.url) {
    return '<span class="iconify ' + className + ' text-slate-400 shrink-0" data-icon="ph:cube-bold"></span>';
  }
  const domain = sub.url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  const logoUrl = "https://img.logo.dev/" + domain + "?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png";
  return '<img src="' + logoUrl + '" class="' + className + ' object-contain rounded-lg shrink-0" crossorigin="anonymous">';
}

function getMonthlyTotal() {
  return subs.reduce((sum, sub) => sum + toMonthly(sub), 0);
}

// Search dropdown functionality
function openSearchDropdown() {
  searchOpen = true;
  const dropdown = document.getElementById("search-dropdown");
  const input = document.getElementById("main-search");
  if (dropdown) {
    dropdown.classList.remove("hidden");
    renderSearchResults(input.value);
  }
}

function closeSearchDropdown() {
  searchOpen = false;
  const dropdown = document.getElementById("search-dropdown");
  if (dropdown) dropdown.classList.add("hidden");
}

function handleSearchInput(query) {
  renderSearchResults(query);
}

function renderSearchResults(query) {
  const dropdown = document.getElementById("search-dropdown");
  if (!dropdown) return;

  const q = (query || "").toLowerCase().trim();
  let results = presets;

  if (q.length > 0) {
    results = presets.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q)
    );
  }

  let html = "";

  // Add custom option at top if there's a search query
  if (q.length > 0) {
    html += '<button onclick="addCustomFromSearch(\'' + q.replace(/'/g, "\\'") + '\')" class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100">';
    html += '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">';
    html += '<span class="iconify h-5 w-5" data-icon="ph:plus-bold"></span>';
    html += '</div>';
    html += '<div class="min-w-0 flex-1">';
    html += '<div class="font-semibold text-slate-900">Add "' + q + '"</div>';
    html += '<div class="text-xs text-slate-500">Custom subscription</div>';
    html += '</div></button>';
  }

  // Group by category
  const byCategory = {};
  for (const p of results) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  for (const cat of Object.keys(byCategory)) {
    html += '<div class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">' + cat + '</div>';
    for (const p of byCategory[cat]) {
      const idx = presets.indexOf(p);
      const logo = "https://img.logo.dev/" + p.domain + "?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png";
      html += '<button onclick="quickAddPreset(' + idx + ')" class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors">';
      html += '<img src="' + logo + '" class="h-8 w-8 rounded-lg object-contain shrink-0" crossorigin="anonymous">';
      html += '<div class="min-w-0 flex-1">';
      html += '<div class="font-semibold text-slate-900 text-sm">' + p.name + '</div>';
      html += '</div>';
      html += '<div class="text-sm font-semibold text-slate-500">$' + p.price + '/mo</div>';
      html += '</button>';
    }
  }

  if (results.length === 0 && q.length === 0) {
    html = '<div class="p-6 text-center text-slate-400">Start typing to search...</div>';
  }

  dropdown.innerHTML = html;
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
    date: new Date().toISOString().split("T")[0]
  });

  save();
  closeSearchDropdown();
  document.getElementById("main-search").value = "";
}

function addCustomFromSearch(name) {
  closeSearchDropdown();
  document.getElementById("main-search").value = "";
  
  // Open modal with name prefilled
  openModalWithName(name);
}

function openModalWithName(name) {
  const form = document.getElementById("sub-form");
  if (form) form.reset();
  document.getElementById("entry-id").value = "";
  document.getElementById("name").value = name || "";
  document.getElementById("price").value = "";
  document.getElementById("cycle").value = "Monthly";
  document.getElementById("url").value = "";
  updateFavicon("");
  pickColor(randColor().id);
  document.getElementById("modal-title").innerText = "Add Subscription";
  document.querySelector("#sub-form button[type='submit']").innerText = "Save";
  showModal();
}

// Subscription list rendering with inline price editing
function renderList() {
  const listContainer = document.getElementById("sub-list-container");
  const clearBtn = document.getElementById("clear-btn");

  if (!listContainer) return;

  if (subs.length === 0) {
    listContainer.innerHTML = '<div class="text-center py-8 text-slate-400 text-sm">No subscriptions yet. Use the search above to add some.</div>';
    if (clearBtn) clearBtn.classList.add("hidden");
    return;
  }

  if (clearBtn) {
    clearBtn.classList.remove("hidden");
    clearBtn.classList.add("flex");
  }

  let html = "";
  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i];
    const color = getColor(sub.color);
    const monthly = formatShort(toMonthly(sub));

    html += '<div class="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-slate-200 transition-all">';
    html += '<div class="w-1 h-8 rounded-full shrink-0" style="background: linear-gradient(180deg, ' + color.bg + ' 0%, ' + color.accent + ' 100%);"></div>';
    html += iconHtml(sub, "w-8 h-8");
    html += '<div class="min-w-0 flex-1">';
    html += '<div class="font-semibold text-slate-900 text-sm truncate">' + sub.name + '</div>';
    html += '<div class="flex items-center gap-1">';
    html += '<input type="number" step="0.01" value="' + sub.price + '" ';
    html += 'onchange="updateSubPrice(\'' + sub.id + '\', this.value)" ';
    html += 'onclick="event.stopPropagation(); this.select();" ';
    html += 'class="w-16 text-xs font-semibold text-slate-600 bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 p-0 cursor-pointer" />';
    html += '<span class="text-xs text-slate-400">/ ' + sub.cycle.toLowerCase() + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<button onclick="removeSub(\'' + sub.id + '\')" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1.5 transition-all" title="Remove">';
    html += '<span class="iconify h-4 w-4" data-icon="ph:x-bold"></span>';
    html += '</button>';
    html += '</div>';
  }

  listContainer.innerHTML = html;
}

function updateSubPrice(subId, newPrice) {
  const sub = subs.find(s => s.id === subId);
  if (sub) {
    sub.price = parseFloat(newPrice) || 0;
    save();
  }
}

function removeSub(subId) {
  subs = subs.filter(s => s.id !== subId);
  save();
}

function clearAllSubs() {
  if (!confirm("Remove all subscriptions?")) return;
  subs = [];
  save();
}

function editSub(subId) {
  const sub = subs.find(s => s.id === subId);
  if (!sub) return;

  document.getElementById("entry-id").value = sub.id;
  document.getElementById("name").value = sub.name;
  document.getElementById("price").value = sub.price;
  document.getElementById("cycle").value = sub.cycle;
  document.getElementById("url").value = sub.url || "";

  updateFavicon(sub.url || "");
  pickColor(sub.color || randColor().id);

  document.getElementById("modal-title").innerText = "Edit Subscription";
  document.querySelector("#sub-form button[type='submit']").innerText = "Save";

  showModal();
}

function initColorPicker() {
  const container = document.getElementById("color-selector");
  if (!container) return;
  let html = "";
  for (const color of colors) {
    html += '<div onclick="pickColor(\'' + color.id + '\')" ';
    html += 'class="color-option cursor-pointer rounded-lg h-8 border-2 border-transparent transition-all hover:scale-105" ';
    html += 'data-val="' + color.id + '" ';
    html += 'style="background:linear-gradient(135deg,' + color.bg + ' 0%,' + color.accent + ' 100%)"></div>';
  }
  container.innerHTML = html;
}

function pickColor(colorId) {
  document.getElementById("selected-color").value = colorId;
  const options = document.querySelectorAll(".color-option");
  for (const opt of options) {
    if (opt.dataset.val === colorId) {
      opt.classList.add("ring-2", "ring-indigo-500", "ring-offset-1");
    } else {
      opt.classList.remove("ring-2", "ring-indigo-500", "ring-offset-1");
    }
  }
}

let faviconDebounce = null;

function updateFavicon(urlInput) {
  clearTimeout(faviconDebounce);
  faviconDebounce = setTimeout(function() {
    const preview = document.getElementById("favicon-preview");
    if (!preview) return;
    if (!urlInput) {
      preview.innerHTML = '<span class="iconify text-slate-300 h-6 w-6" data-icon="ph:globe-simple"></span>';
      return;
    }
    const domain = urlInput.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    if (domain.length > 3) {
      const logoUrl = "https://img.logo.dev/" + domain + "?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png";
      preview.innerHTML = '<img src="' + logoUrl + '" class="w-full h-full object-cover" crossorigin="anonymous">';
    }
  }, 400);
}

function handleFormSubmit(evt) {
  evt.preventDefault();

  const existingId = document.getElementById("entry-id").value;

  const subData = {
    id: existingId || Date.now().toString(),
    name: document.getElementById("name").value,
    price: parseFloat(document.getElementById("price").value) || 0,
    cycle: document.getElementById("cycle").value,
    url: document.getElementById("url").value,
    color: document.getElementById("selected-color").value || randColor().id,
    date: document.getElementById("date").value || ""
  };

  if (existingId) {
    const index = subs.findIndex(s => s.id === existingId);
    if (index !== -1) {
      subs[index] = subData;
    }
  } else {
    subs.push(subData);
  }

  save();
  hideModal();
}

// Income and time calculation - uses whichever unit user entered
function getIncomeUnit() {
  // Return the last type the user entered, or find first non-zero
  if (incomeState.lastType && incomeState[incomeState.lastType] > 0) {
    return incomeState.lastType;
  }
  if (incomeState.hourly > 0) return "hourly";
  if (incomeState.daily > 0) return "daily";
  if (incomeState.weekly > 0) return "weekly";
  if (incomeState.monthly > 0) return "monthly";
  return null;
}

function getHourlyRate() {
  if (incomeState.hourly > 0) return incomeState.hourly;
  if (incomeState.daily > 0) return incomeState.daily / 8;
  if (incomeState.weekly > 0) return incomeState.weekly / 40;
  if (incomeState.monthly > 0) return incomeState.monthly / (4.33 * 40);
  return 0;
}

function formatWorkTime(monthlyTotal) {
  const unit = getIncomeUnit();
  if (!unit) return { main: "—", summary: "" };

  const hourlyRate = getHourlyRate();
  if (hourlyRate <= 0) return { main: "—", summary: "" };

  const totalHoursPerMonth = monthlyTotal / hourlyRate;

  let timeStr = "";
  let summaryStr = "";

  switch (unit) {
    case "hourly":
      const hours = totalHoursPerMonth;
      if (hours < 1) {
        timeStr = Math.round(hours * 60) + " minutes";
      } else {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        timeStr = h + "h" + (m > 0 ? " " + m + "m" : "");
      }
      summaryStr = "per month at $" + incomeState.hourly.toFixed(2) + "/hr";
      break;

    case "daily":
      const days = totalHoursPerMonth / 8;
      if (days < 1) {
        const hrs = Math.round(days * 8);
        timeStr = hrs + " hour" + (hrs !== 1 ? "s" : "");
      } else {
        timeStr = days.toFixed(1) + " days";
      }
      summaryStr = "per month at $" + incomeState.daily.toFixed(0) + "/day";
      break;

    case "weekly":
      const weeks = totalHoursPerMonth / 40;
      if (weeks < 1) {
        const dys = Math.round(weeks * 5);
        timeStr = dys + " day" + (dys !== 1 ? "s" : "");
      } else {
        timeStr = weeks.toFixed(1) + " weeks";
      }
      summaryStr = "per month at $" + incomeState.weekly.toFixed(0) + "/week";
      break;

    case "monthly":
      const pct = (monthlyTotal / incomeState.monthly) * 100;
      timeStr = pct.toFixed(1) + "% of income";
      summaryStr = "of $" + incomeState.monthly.toFixed(0) + " monthly";
      break;
  }

  return { main: timeStr, summary: summaryStr };
}

function updateTotals(monthlyTotal) {
  const totalDisplay = document.getElementById("step-2-total");
  const yearlyDisplay = document.getElementById("step-2-yearly");
  const timeWorked = document.getElementById("time-worked");
  const timeSummary = document.getElementById("time-summary");

  if (totalDisplay) totalDisplay.innerText = formatMoney(monthlyTotal, 0);
  if (yearlyDisplay) yearlyDisplay.innerText = formatMoney(monthlyTotal * 12, 0);

  const workTime = formatWorkTime(monthlyTotal);
  if (timeWorked) timeWorked.innerText = workTime.main;
  if (timeSummary) timeSummary.innerText = workTime.summary;
}

function renderTotals() {
  updateTotals(getMonthlyTotal());
}

function renderGrid() {
  const gridEl = document.getElementById("bento-grid");
  if (!gridEl) return;

  const monthlyTotal = getMonthlyTotal();

  if (subs.length === 0) {
    gridEl.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400 text-sm">Add subscriptions to see the visualization</div>';
    updateTotals(monthlyTotal);
    return;
  }

  const items = [];
  for (const sub of subs) {
    items.push({
      id: sub.id,
      name: sub.name,
      url: sub.url,
      color: sub.color,
      price: sub.price,
      cycle: sub.cycle,
      cost: toMonthly(sub)
    });
  }

  items.sort((a, b) => b.cost - a.cost);

  const bounds = gridEl.getBoundingClientRect();
  const gridWidth = bounds.width || 600;
  const gridHeight = bounds.height || 400;

  if (gridWidth < 50 || gridHeight < 50) {
    // Grid not ready yet, retry
    setTimeout(renderGrid, 100);
    return;
  }

  const treemapData = items.map((item, idx) => ({
    ...item,
    val: item.cost,
    idx
  }));

  const treemap = new Treemap(gridWidth, gridHeight);
  const cells = treemap.layout(treemapData);

  let html = "";

  for (const cell of cells) {
    const percent = monthlyTotal > 0 ? (cell.cost / monthlyTotal) * 100 : 0;
    const colorPalette = getColor(cell.color);

    const minDim = Math.min(cell.w, cell.h);
    const clampedPct = Math.max(3, Math.min(60, percent));

    const padding = Math.round(Math.max(6, Math.min(minDim * 0.08, 14)) + (clampedPct / 60) * 6);
    const borderRadius = Math.round(Math.max(6, Math.min(minDim * 0.12, 18)) + (clampedPct / 60) * 4);

    const innerWidth = cell.w - padding * 2;
    const innerHeight = cell.h - padding * 2;

    const maxPriceFont = Math.min(Math.floor(innerWidth * 0.18), Math.floor(innerHeight * 0.3));
    const priceFont = Math.max(10, Math.min(12 + (clampedPct / 60) * 32, maxPriceFont, 42));
    const titleFont = Math.max(8, Math.min(9 + (clampedPct / 60) * 12, priceFont * 0.55, 20));
    const iconSize = Math.max(14, Math.min(16 + (clampedPct / 60) * 28, innerHeight * 0.3, innerWidth * 0.35, 44));

    const isMicro = minDim < 40;
    const isTiny = minDim < 55;
    const isSmall = minDim < 80;

    let cellContent = "";
    const monthlyLabel = formatShort(cell.cost);

    if (isMicro) {
      const sz = Math.max(10, Math.min(iconSize, minDim * 0.5));
      cellContent = '<div class="flex items-center justify-center h-full w-full">' + iconHtml(cell, "w-[" + sz + "px] h-[" + sz + "px]") + '</div>';
    } else if (isTiny) {
      const sz = Math.max(12, Math.min(iconSize, minDim * 0.4));
      const ps = Math.max(9, Math.min(priceFont, 12));
      cellContent = '<div class="flex flex-col items-center justify-center h-full w-full gap-0.5">';
      cellContent += iconHtml(cell, "w-[" + sz + "px] h-[" + sz + "px]");
      cellContent += '<div class="font-bold text-slate-900" style="font-size:' + ps + 'px">' + monthlyLabel + '</div>';
      cellContent += '</div>';
    } else if (isSmall) {
      const sz = Math.max(14, Math.min(iconSize, innerWidth * 0.35, innerHeight * 0.28));
      const ts = Math.max(8, Math.min(titleFont, 11));
      const ps = Math.max(10, Math.min(priceFont, 16));
      cellContent = '<div class="flex flex-col items-center justify-center h-full w-full gap-0.5 text-center">';
      cellContent += iconHtml(cell, "w-[" + sz + "px] h-[" + sz + "px]");
      cellContent += '<div class="font-semibold text-slate-900 truncate w-full px-1" style="font-size:' + ts + 'px">' + cell.name + '</div>';
      cellContent += '<div class="font-black text-slate-900" style="font-size:' + ps + 'px">' + monthlyLabel + '</div>';
      cellContent += '</div>';
    } else {
      const showPercentBadge = cell.w > 80 && cell.h > 65;
      cellContent = '<div class="flex justify-between items-start">';
      cellContent += iconHtml(cell, "w-[" + iconSize + "px] h-[" + iconSize + "px]");
      if (showPercentBadge) {
        cellContent += '<span class="text-[10px] font-bold bg-white/70 px-1.5 py-0.5 rounded-full text-slate-600">' + Math.round(percent) + '%</span>';
      }
      cellContent += '</div>';
      cellContent += '<div class="mt-auto min-w-0">';
      cellContent += '<div class="font-bold text-slate-900 truncate" style="font-size:' + titleFont + 'px">' + cell.name + '</div>';
      cellContent += '<div class="font-black text-slate-900 tracking-tight leading-none" style="font-size:' + priceFont + 'px">' + monthlyLabel + '</div>';
      cellContent += '</div>';
    }

    html += '<div class="treemap-cell" data-id="' + cell.id + '" style="left:' + cell.x + 'px;top:' + cell.y + 'px;width:' + cell.w + 'px;height:' + cell.h + 'px;border-radius:' + borderRadius + 'px">';
    html += '<div class="treemap-cell-inner" style="background:linear-gradient(135deg,' + colorPalette.bg + ' 0%,' + colorPalette.accent + ' 100%);padding:' + padding + 'px;border-radius:' + Math.max(4, borderRadius - 2) + 'px">';
    html += cellContent;
    html += '</div></div>';
  }

  gridEl.innerHTML = html;
  updateTotals(monthlyTotal);
}

function handleIncomeChange(type, value) {
  incomeState[type] = parseFloat(value) || 0;
  incomeState.lastType = type;
  saveIncome(incomeState);
  renderTotals();
}

function resetIncomeInputs() {
  incomeState = { hourly: 0, daily: 0, weekly: 0, monthly: 0, lastType: null };
  syncIncomeInputs();
  saveIncome(incomeState);
}

function syncIncomeInputs() {
  const hourlyInput = document.getElementById("income-hourly");
  const dailyInput = document.getElementById("income-daily");
  const weeklyInput = document.getElementById("income-weekly");
  const monthlyInput = document.getElementById("income-monthly");

  if (hourlyInput) hourlyInput.value = incomeState.hourly || "";
  if (dailyInput) dailyInput.value = incomeState.daily || "";
  if (weeklyInput) weeklyInput.value = incomeState.weekly || "";
  if (monthlyInput) monthlyInput.value = incomeState.monthly || "";
}

// Initialize with defaults if no saved data
function initDefaults() {
  if (subs.length === 0) {
    for (const def of defaultSubs) {
      subs.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: def.name,
        price: def.price,
        cycle: def.cycle,
        url: def.domain,
        color: def.color,
        date: new Date().toISOString().split("T")[0]
      });
    }
    save();
  }
}

// Close search dropdown when clicking outside
document.addEventListener("click", function(e) {
  const container = document.getElementById("search-container");
  if (container && !container.contains(e.target)) {
    closeSearchDropdown();
  }
});

document.addEventListener("DOMContentLoaded", function() {
  incomeState = loadIncome();
  syncIncomeInputs();
  load();
  initDefaults();
  initColorPicker();
  renderList();
  // Delay grid render to ensure container is sized
  requestAnimationFrame(() => {
    requestAnimationFrame(renderGrid);
  });
  renderTotals();
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
});
